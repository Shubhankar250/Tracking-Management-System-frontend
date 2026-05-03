import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import { createExpense, editExpense } from "../../slices/expensesSlice";
import { toast } from "react-toastify";
import type { Expense } from "../../api/expenses.api";
import "../../assets/css/addExpenses.css";

import Select from "react-select";

interface Props {
  onSuccess: () => void;
  onClose: () => void;
  isEdit?: boolean;
  editData?: Expense;
}

interface ExpenseErrors {
  expenseName?: string;
  deviceId?: string;
  expenseOdometer?: string;
  cost?: string;
}

const AddExpenseForm = ({ onSuccess, onClose, isEdit, editData }: Props) => {
  const dispatch = useAppDispatch();
  const devices = useAppSelector((s) => s.devices.devices);

  const [form, setForm] = useState({
    expenseName: "",
    deviceId: "",
    date: "",
    expenseOdometer: "",
    cost: "",
    description: "",
    supplier: "",
    buyer: "",
    quantity: "",
    engineHour: "",
  });

  const [errors, setErrors] = useState<ExpenseErrors>({});

  useEffect(() => {
    if (isEdit && editData) {
      setForm({
        expenseName: editData.expenseName,
        deviceId: String(editData.deviceId),
        date: editData.date,
        expenseOdometer: String(editData.expenseOdometer),
        cost: String(editData.cost),
        description: editData.description,
        supplier: editData.supplier,
        buyer: editData.buyer,
        quantity: String(editData.quantity),
        engineHour: String(editData.engineHour),
      });
    }
  }, [isEdit, editData]);

  const handleChange = (e: any) => {
    const { name, value } = e.target;

    setForm({ ...form, [name]: value });

    if (errors[name as keyof ExpenseErrors]) {
      setErrors((prev) => {
        const updated = { ...prev };
        delete updated[name as keyof ExpenseErrors];
        return updated;
      });
    }
  };

  const validate = () => {
    let valid = true;
    const newErrors: ExpenseErrors = {};
    const missingFields: string[] = [];

    const addMissing = (field: string) => {
      if (!missingFields.includes(field)) {
        missingFields.push(field);
      }
    };

    const isInvalidNumber = (val: any) =>
      val === "" || isNaN(val) || Number(val) <= 0;

    const isInvalidOptionalNumber = (val: any) =>
      val !== "" && (isNaN(val) || Number(val) < 0);

    /* =========================
     REQUIRED FIELDS
  ========================= */

    // Name
    if (!form.expenseName || !form.expenseName.trim()) {
      newErrors.expenseName = "Name is required";
      addMissing("Expense Name");
      valid = false;
    }

    // Device
    if (!form.deviceId) {
      newErrors.deviceId = "Object is required";
      addMissing("Object");
      valid = false;
    }

    // Odometer
    if (isInvalidNumber(form.expenseOdometer)) {
      newErrors.expenseOdometer = "Enter valid odometer";
      addMissing("Odometer");
      valid = false;
    }

    // Cost
    if (isInvalidNumber(form.cost)) {
      newErrors.cost = "Enter valid cost";
      addMissing("Cost");
      valid = false;
    }

    /* =========================
     OPTIONAL FIELDS VALIDATION
  ========================= */

    if (isInvalidOptionalNumber(form.quantity)) {
      toast.error("Quantity must be a valid number ≥ 0");
      valid = false;
    }

    if (isInvalidOptionalNumber(form.engineHour)) {
      toast.error("Engine Hour must be a valid number ≥ 0");
      valid = false;
    }

    /* =========================
     SANITIZE STRINGS (optional)
  ========================= */

    form.supplier = form.supplier?.trim();
    form.buyer = form.buyer?.trim();
    form.description = form.description?.trim();

    setErrors(newErrors);

    return { valid, missingFields };
  };

  const clearError = (field: keyof ExpenseErrors) => {
    setErrors((prev) => {
      const updated = { ...prev };
      delete updated[field];
      return updated;
    });
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    const { valid, missingFields } = validate();

    if (!valid) {
      if (missingFields.length) {
        toast.error(
          <div>
            <div>Please fill the following fields:</div>
            <ul style={{ margin: "8px 0 0 18px", padding: 0 }}>
              {missingFields.map((field) => (
                <li key={field}>{field}</li>
              ))}
            </ul>
          </div>,
        );
      }
      return;
    }

    try {
      if (isEdit) {
        await dispatch(
          editExpense({
            id: editData!.id,
            ...form,
            deviceId: Number(form.deviceId),
            cost: Number(form.cost),
            expenseOdometer: Number(form.expenseOdometer),
            quantity: form.quantity ? Number(form.quantity) : undefined,
            engineHour: form.engineHour ? Number(form.engineHour) : undefined,
          }),
        ).unwrap();
        toast.success("Expense updated successfully");
      } else {
        await dispatch(
          createExpense({
            ...form,
            deviceId: Number(form.deviceId),
            cost: Number(form.cost),
            expenseOdometer: Number(form.expenseOdometer),
            quantity: form.quantity ? Number(form.quantity) : undefined,
            engineHour: form.engineHour ? Number(form.engineHour) : undefined,
          }),
        ).unwrap();
        toast.success("Expense added successfully");
      }
      onSuccess();
    } catch {
      toast.error("Operation failed");
    }
  };

  const deviceOptions = devices.map((d) => ({
    value: d.id,
    label: d.name,
  }));

  return (
    <form className="expense-form" onSubmit={handleSubmit}>
      <div className="form-body">
        {/* Row 1: Expense Name & Object */}
        <div className="row">
          <div className="field">
            <label>
              Name <span className="st-required">*</span>
            </label>
            <input
              name="expenseName"
              value={form.expenseName}
              onChange={handleChange}
              className={errors.expenseName ? "input-error" : ""}
            />
            {errors.expenseName && (
              <div className="error-text">{errors.expenseName}</div>
            )}
          </div>

          <div className="field">
            <label>
              Object <span className="st-required">*</span>
            </label>
            <Select
              classNamePrefix="device-select"
              options={deviceOptions}
              placeholder="Search Object..."
              isSearchable
              components={{ IndicatorSeparator: () => null }}
              value={deviceOptions.find(
                (option) => String(option.value) === form.deviceId,
              )}
              onChange={(selected) => {
                const value = selected ? String(selected.value) : "";

                setForm({ ...form, deviceId: value });
                clearError("deviceId");
              }}
            />
            {errors.deviceId && (
              <div className="error-text">{errors.deviceId}</div>
            )}
          </div>
        </div>

        {/* Row 2: Date & Odometer */}
        <div className="row">
          <div className="field">
            <label>Date</label>
            <input
              type="date"
              name="date"
              value={form.date}
              onChange={handleChange}
            />
          </div>
          <div className="field">
            <label>
              Odometer <span className="st-required">*</span>
            </label>
            <input
              name="expenseOdometer"
              value={form.expenseOdometer}
              onChange={handleChange}
              className={errors.expenseOdometer ? "input-error" : ""}
            />
            {errors.expenseOdometer && (
              <div className="error-text">{errors.expenseOdometer}</div>
            )}
          </div>
        </div>

        {/* Row 3: Quantity & Engine Hours */}
        <div className="row">
          <div className="field">
            <label>Quantity</label>
            <input
              name="quantity"
              type="number"
              min="0"
              value={form.quantity}
              onChange={handleChange}
            />
          </div>
          <div className="field">
            <label>Engine Hours</label>
            <input
              name="engineHour"
              type="number"
              min="0"
              value={form.engineHour}
              onChange={handleChange}
            />
          </div>
        </div>

        {/* Row 4: Cost & Supplier */}
        <div className="row">
          <div className="field">
            <label>
              Cost <span className="st-required">*</span>
            </label>
            <input
              name="cost"
              type="number"
              value={form.cost}
              onChange={handleChange}
              className={errors.cost ? "input-error" : ""}
            />
            {errors.cost && <div className="error-text">{errors.cost}</div>}
          </div>
          <div className="field">
            <label>Supplier</label>
            <input
              name="supplier"
              value={form.supplier}
              onChange={handleChange}
            />
          </div>
        </div>

        {/* Row 5: Buyer & Description */}
        <div className="row">
          <div className="field">
            <label>Buyer</label>
            <input name="buyer" value={form.buyer} onChange={handleChange} />
          </div>
          <div className="field">
            <label>Description</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
            />
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="modal-footer">
        <button type="button" className="btn-gray" onClick={onClose}>
          Close
        </button>
        <button type="submit" className="btn-blue">
          {isEdit ? "Update" : "Save"}
        </button>
      </div>
    </form>
  );
};

export default AddExpenseForm;
