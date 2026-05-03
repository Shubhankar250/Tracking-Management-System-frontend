import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";

import { toast } from "react-toastify";
import "../assets/css/SubscriptionModal.css";
import type { AppDispatch, RootState } from "../redux/store";
import type { SubscriptionMasterDTO } from "../api/subscriptionService";
import {
  clearSelectedSubscription,
  createSubscription,
  editSubscription,
} from "../slices/subscriptionSlice";
import Modal from "../components/common/Modal";
interface Props {
  isOpen: boolean;
  onClose: () => void;
}
import Select from "react-select";
const AddUpdateSubscriptionModal = ({ isOpen, onClose }: Props) => {
  const dispatch = useDispatch<AppDispatch>();
  const { selected, countries } = useSelector(
    (state: RootState) => state.subscription,
  );
  const isEditMode = !!selected;
  const [form, setForm] = useState<SubscriptionMasterDTO>({
    id: undefined,
    countrySubId: 0,
    subDetails: "",
    subPoints: 0,
    totalAmount: 0,
    discount: 0,
    country: "",
  });

  useEffect(() => {
    if (isEditMode && selected) {
      setForm(selected);
    } else {
      setForm({
        id: undefined,
        countrySubId: 0,
        subDetails: "",
        subPoints: 0,
        totalAmount: 0,
        discount: 0,
        country: "",
      });
    }
  }, [selected]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]:
        name === "subPoints" || name === "discount" || name === "totalAmount"
          ? Number(value)
          : value,
    }));
  };

const handleSave = async () => {
  try {
    if (isEditMode) {
      await dispatch(editSubscription(form)).unwrap();
      toast.success("Subscription updated successfully");
    } else {
      await dispatch(createSubscription(form)).unwrap();
      toast.success("Subscription inserted successfully");
    }



    // Reset UI
    onClose();
    dispatch(clearSelectedSubscription());
  } catch (err) {
    console.error("Subscription save failed:", err);
    toast.error("Operation failed");
  }
};
const countryOptions = Object.entries(countries).map(([key, value]) => ({
  value: Number(key),
  label: value,
}));
  return (
    <Modal
      isOpen={isOpen}
      title={isEditMode ? "Update Subscription" : "Add Subscription"}
      onClose={() => {
        onClose();
        dispatch(clearSelectedSubscription());
      }}
      size="medium"
    >
  <form className="subscription-form">
  <div className="form-body">
    {/* Row 1: Country & Subscription Details */}
    <div className="row">
      <div className="field">
        <label>
          Country <span className="st-required">*</span>
        </label>
      <Select
  classNamePrefix="country-select"
  options={countryOptions}
  placeholder="Search Country..."
  isSearchable
  components={{ IndicatorSeparator: () => null }}
  value={countryOptions.find(
    (option) => option.value === form.countrySubId
  )}
  onChange={(selected) =>
    setForm((prev) => ({
      ...prev,
      countrySubId: selected ? selected.value : 0,
      country: selected ? selected.label : "",
    }))
  }
/>
      </div>

      <div className="field">
        <label>
          Subscription Details <span className="st-required">*</span>
        </label>
        <input
          type="text"
          name="subDetails"
          value={form.subDetails}
          onChange={handleChange}
          required
        />
      </div>
    </div>

    {/* Row 2: Points, Amount, Discount */}
    <div className="row">
      <div className="field">
        <label>
          Subscription Points <span className="st-required">*</span>
        </label>
        <input
          type="number"
          name="subPoints"
          value={form.subPoints}
          onChange={handleChange}
          required
        />
      </div>

      <div className="field">
        <label>Total Amount</label>
        <input
          type="number"
          name="totalAmount"
          value={form.totalAmount}
          onChange={handleChange}
        />
      </div>

      <div className="field">
        <label>
          Discount <span className="st-required">*</span>
        </label>
        <input
          type="number"
          name="discount"
          value={form.discount}
          onChange={handleChange}
          required
        />
      </div>
    </div>
  </div>

  {/* Footer */}
  <div className="modal-footer">
    <button type="button" className="btn-gray" onClick={onClose}>
      Close
    </button>
    <button type="button" className="btn-blue" onClick={handleSave}>
      {isEditMode ? "Update" : "Save"}
    </button>
  </div>
</form>
    </Modal>
  );
};

export default AddUpdateSubscriptionModal;
