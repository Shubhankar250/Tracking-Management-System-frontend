import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import {
  createMaintenance,
  editMaintenance,
} from "../../slices/maintenanceSlice";
import { toast } from "react-toastify";
import type { Maintenance } from "../../api/maintenance.api";
import "../../assets/css/Maintenance.css"; // can reuse styles

import Select from "react-select";
interface Props {
  onSuccess: () => void;
  onClose: () => void;
  isEdit?: boolean;
  editData?: Maintenance;
  deviceId?: number;
}

const MaintenanceForm = ({
  onSuccess,
  onClose,
  isEdit,
  editData,
  deviceId,
}: Props) => {
  const dispatch = useAppDispatch();
  const devices = useAppSelector((s) => s.devices.devices);

  const [form, setForm] = useState({
    serviceName: "",
    deviceId: deviceId ? String(deviceId) : "",
    datalist: false,
    popup: false,
    odometerIntervalKm: false,
    odometerIntervalKmVal: "",
    lastServiceKm: "",
    engineHourInterval: false,
    engineHourIntervalVal: "",
    lastServiceHours: "",
    daysInterval: false,
    daysIntervalVal: "",
    daysLeft: false,
    daysLeftVal: "",
    odometerLeftKm: false,
    odometerLeftKmVal: "",
    engineHoursLeft: false,
    engineHoursLeftVal: "",
    updateLastService: false,
    eventTrigger: false,
    lastServiceDate: "",
  });
  const [errors, setErrors] = useState<any>({});

  useEffect(() => {
    if (isEdit && editData && devices.length > 0) {
      setForm({
        serviceName: editData.serviceName,
        deviceId: String(editData.deviceId), // or number
        datalist: editData.datalist,
        popup: editData.popup,
        odometerIntervalKm: editData.odometerIntervalKm,
        odometerIntervalKmVal: String(editData.odometerIntervalKmVal || ""),
        lastServiceKm: String(editData.lastServiceKm || ""),
        engineHourInterval: editData.engineHourInterval,
        engineHourIntervalVal: String(editData.engineHourIntervalVal || ""),
        lastServiceHours: String(editData.lastServiceHours || ""),
        daysInterval: editData.daysInterval,
        daysLeft: editData.daysLeft,
        daysIntervalVal: String(editData.daysIntervalVal || ""),
        daysLeftVal: String(editData.daysLeftVal || ""),
        odometerLeftKm: editData.odometerLeftKm,
        odometerLeftKmVal: String(editData.odometerLeftKmVal || ""),
        engineHoursLeft: editData.engineHoursLeft,
        engineHoursLeftVal: String(editData.engineHoursLeftVal || ""),
        updateLastService: editData.updateLastService,
        eventTrigger: editData.eventTrigger,
        lastServiceDate: editData.lastServiceDate || "",
      });
    }
  }, [isEdit, editData, devices]);

  const handleChange = (e: any) => {
    const { name, value, type, checked } = e.target;

    const newValue = type === "checkbox" ? checked : value;

    setForm({ ...form, [name]: newValue });

    // ✅ Clear error instantly when user fixes field
    if (errors[name]) {
      setErrors((prev: any) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const deviceOptions = devices.map((d) => ({
    value: d.id,
    label: d.name,
  }));

  const validate = () => {
    let valid = true;
    const newErrors: any = {};
    const missingFields: string[] = [];

    const addMissing = (field: string) => {
      if (!missingFields.includes(field)) {
        missingFields.push(field);
      }
    };

    const isInvalidNumber = (val: any) =>
      val === "" || isNaN(val) || Number(val) <= 0;

    /* =========================
     BASIC REQUIRED
  ========================= */

    if (!form.serviceName || !form.serviceName.trim()) {
      newErrors.serviceName = "Service Name is mandatory";
      addMissing("Service Name");
      valid = false;
    }

    if (!deviceId && (!form.deviceId || form.deviceId === "")) {
      newErrors.deviceId = "Please select Object";
      addMissing("Object");
      valid = false;
    }

    /* =========================
     AT LEAST ONE INTERVAL REQUIRED ✅
  ========================= */

    if (
      !form.odometerIntervalKm &&
      !form.engineHourInterval &&
      !form.daysInterval
    ) {
      toast.error("Please enable at least one service interval");
      valid = false;
    }

    /* =========================
     ODOMETER INTERVAL
  ========================= */

    if (form.odometerIntervalKm) {
      if (isInvalidNumber(form.odometerIntervalKmVal)) {
        newErrors.odometerIntervalKmVal = "Enter valid odometer interval";
        addMissing("Odometer Interval (Km)");
        valid = false;
      }

      if (isInvalidNumber(form.lastServiceKm)) {
        newErrors.lastServiceKm = "Enter valid last odometer";
        addMissing("Last Odometer");
        valid = false;
      }
    }

    /* =========================
     ENGINE HOURS
  ========================= */

    if (form.engineHourInterval) {
      if (isInvalidNumber(form.engineHourIntervalVal)) {
        newErrors.engineHourIntervalVal = "Enter valid engine interval";
        addMissing("Engine Hour Interval");
        valid = false;
      }

      if (isInvalidNumber(form.lastServiceHours)) {
        newErrors.lastServiceHours = "Enter valid last engine hour";
        addMissing("Last Engine Hour");
        valid = false;
      }
    }

    /* =========================
     DAYS INTERVAL
  ========================= */

    if (form.daysInterval) {
      if (isInvalidNumber(form.daysIntervalVal)) {
        newErrors.daysIntervalVal = "Enter valid days interval";
        addMissing("Days Interval");
        valid = false;
      }

      if (!form.lastServiceDate) {
        newErrors.lastServiceDate = "Last service date required";
        addMissing("Last Service Date");
        valid = false;
      }
    }

    /* =========================
     TRIGGER EVENTS (at least one if section used)
  ========================= */

    if (form.odometerLeftKm || form.engineHoursLeft || form.daysLeft) {
      if (form.odometerLeftKm && isInvalidNumber(form.odometerLeftKmVal)) {
        newErrors.odometerLeftKmVal = "Enter valid odometer left";
        addMissing("Odometer Left (Km)");
        valid = false;
      }

      if (form.engineHoursLeft && isInvalidNumber(form.engineHoursLeftVal)) {
        newErrors.engineHoursLeftVal = "Enter valid engine hours left";
        addMissing("Engine Hours Left");
        valid = false;
      }

      if (form.daysLeft && isInvalidNumber(form.daysLeftVal)) {
        newErrors.daysLeftVal = "Enter valid days left";
        addMissing("Days Left");
        valid = false;
      }
    }

    setErrors(newErrors);

    return { valid, missingFields };
  };

  const setField = (name: string, value: any) => {
    setForm((prev) => ({ ...prev, [name]: value }));

    setErrors((prev: any) => {
      const updated = { ...prev };
      delete updated[name];
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
      const payload: any = {
        serviceName: form.serviceName.trim(),
        deviceId: form.deviceId ? Number(form.deviceId) : null,
        datalist: form.datalist,
        popup: form.popup,
        odometerIntervalKm: form.odometerIntervalKm,
        odometerIntervalKmVal: form.odometerIntervalKmVal
          ? Number(form.odometerIntervalKmVal)
          : null,
        lastServiceKm: form.lastServiceKm ? Number(form.lastServiceKm) : null,
        engineHourInterval: form.engineHourInterval,
        engineHourIntervalVal: form.engineHourIntervalVal
          ? Number(form.engineHourIntervalVal)
          : null,
        lastServiceHours: form.lastServiceHours
          ? Number(form.lastServiceHours)
          : null,
        daysInterval: form.daysInterval,
        daysIntervalVal: form.daysIntervalVal
          ? Number(form.daysIntervalVal)
          : null,
        daysLeft: form.daysLeft,
        daysLeftVal: form.daysLeftVal ? Number(form.daysLeftVal) : null,
        odometerLeftKm: form.odometerLeftKm,
        odometerLeftKmVal: form.odometerLeftKmVal
          ? Number(form.odometerLeftKmVal)
          : null,
        engineHoursLeft: form.engineHoursLeft,
        engineHoursLeftVal: form.engineHoursLeftVal
          ? Number(form.engineHoursLeftVal)
          : null,
        updateLastService: form.updateLastService,
        eventTrigger: form.eventTrigger,
        lastServiceDate: form.lastServiceDate || null,
      };

      if (isEdit && editData) {
        payload.id = editData.id; // Only for edit
        await dispatch(editMaintenance(payload)).unwrap();
        toast.success("Maintenance updated successfully");
      } else {
        await dispatch(createMaintenance(payload)).unwrap(); // No id for create
        toast.success("Maintenance added successfully");
      }

      onSuccess();
    } catch {
      toast.error("Operation failed");
    }
  };

  return (
    <form className="maintenance-form" onSubmit={handleSubmit}>
      <div className="form-body">
        {/* ===== Service Details ===== */}
        <div
          className="card"
          style={{
            padding: "16px",
            marginBottom: "16px",
            border: "1px solid #ccc",
            borderRadius: "8px",
          }}
        >
          <h3 style={{ marginBottom: "12px" }}>Service Details</h3>
          <div className="row">
            {/* Service Name Field */}
            <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
              <label className="form-label required">Service Name</label>
              <input
                name="serviceName"
                value={form.serviceName}
                onChange={handleChange}
              />

              {errors.serviceName && (
                <span
                  style={{ color: "red", fontSize: "12px", marginTop: "4px" }}
                >
                  {errors.serviceName}
                </span>
              )}
            </div>

            {/* Device Field */}
            <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
              <label className="form-label required">Object</label>

              {deviceId ? (
                <>
                  <input type="hidden" name="deviceId" value={form.deviceId} />
                  <input
                    type="text"
                    value={
                      devices.find((d) => d.id === Number(deviceId))?.name || ""
                    }
                    disabled
                  />
                </>
              ) : (
                <>
                  <Select
                    classNamePrefix="device-select"
                    options={deviceOptions}
                    placeholder="Search Object..."
                    isSearchable
                    components={{ IndicatorSeparator: () => null }}
                    value={deviceOptions.find(
                      (option) => String(option.value) === form.deviceId,
                    )}
                    onChange={(selected) =>
                      setField(
                        "deviceId",
                        selected ? String(selected.value) : "",
                      )
                    }
                  />

                  {errors.deviceId && (
                    <span
                      style={{
                        color: "red",
                        fontSize: "12px",
                        marginTop: "4px",
                      }}
                    >
                      {errors.deviceId}
                    </span>
                  )}
                </>
              )}
            </div>
          </div>

          <div className="row" style={{ marginTop: "12px" }}>
            <div className="col-6">
              <input
                type="checkbox"
                name="datalist"
                checked={form.datalist}
                onChange={handleChange}
                id="datalistCheckbox"
              />
              <label htmlFor="datalistCheckbox">Data List</label>
            </div>
            <div className="col-6">
              <input
                type="checkbox"
                name="popup"
                checked={form.popup}
                onChange={handleChange}
                id="popupCheckbox"
              />
              <label htmlFor="popupCheckbox"> Show Popup</label>
            </div>
          </div>
          {/* Odometer Interval */}
          <div
            className="row"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              width: "100%",
            }}
          >
            <label>
              <input
                type="checkbox"
                name="odometer_check"
                checked={!!form.odometerIntervalKm}
                onChange={(e) =>
                  setForm({ ...form, odometerIntervalKm: e.target.checked })
                }
              />
            </label>

            <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
              <label>Odometer Interval (Km)</label>
              <input
                name="odometerIntervalKmVal"
                type="number"
                min="0"
                value={form.odometerIntervalKmVal}
                onChange={handleChange}
                disabled={!form.odometerIntervalKm}
              />
              {errors.odometerIntervalKmVal && (
                <span className="error-text">
                  {errors.odometerIntervalKmVal}
                </span>
              )}
            </div>

            <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
              <label>Last Odometer (Km)</label>
              <input
                name="lastServiceKm"
                type="number"
                min="0"
                value={form.lastServiceKm}
                onChange={handleChange}
                disabled={!form.odometerIntervalKm}
              />
              {errors.lastServiceKm && (
                <span className="error-text">{errors.lastServiceKm}</span>
              )}
            </div>
          </div>

          {/* Engine Hour Interval */}
          <div
            className="row"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              width: "100%",
              marginTop: "8px",
            }}
          >
            <label>
              <input
                type="checkbox"
                checked={!!form.engineHourInterval}
                onChange={(e) =>
                  setForm({ ...form, engineHourInterval: e.target.checked })
                }
              />
            </label>

            <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
              <label>Engine Hour Interval</label>
              <input
                name="engineHourIntervalVal"
                type="number"
                min="0"
                value={form.engineHourIntervalVal}
                onChange={handleChange}
                disabled={!form.engineHourInterval}
              />
              {errors.engineHourIntervalVal && (
                <span className="error-text">
                  {errors.engineHourIntervalVal}
                </span>
              )}
            </div>

            <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
              <label>Last Engine Hour</label>
              <input
                name="lastServiceHours"
                type="number"
                min="0"
                value={form.lastServiceHours}
                onChange={handleChange}
                disabled={!form.engineHourInterval}
              />
              {errors.lastServiceHours && (
                <span className="error-text">{errors.lastServiceHours}</span>
              )}
            </div>
          </div>

          {/* Days Interval */}
          <div
            className="row"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              width: "100%",
              marginTop: "8px",
            }}
          >
            <label>
              <input
                type="checkbox"
                checked={!!form.daysInterval}
                onChange={(e) =>
                  setForm({ ...form, daysInterval: e.target.checked })
                }
              />
            </label>

            <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
              <label>Days Interval</label>
              <input
                name="daysIntervalVal"
                type="number"
                min="0"
                value={form.daysIntervalVal}
                onChange={handleChange}
                disabled={!form.daysInterval}
              />
              {errors.daysIntervalVal && (
                <span className="error-text">{errors.daysIntervalVal}</span>
              )}
            </div>

            <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
              <label>Last Service Date</label>
              <input
                name="lastServiceDate"
                type="date"
                min="0"
                value={form.lastServiceDate}
                onChange={handleChange}
                disabled={!form.daysInterval}
              />
              {errors.lastServiceDate && (
                <span className="error-text">{errors.lastServiceDate}</span>
              )}
            </div>
          </div>
        </div>

        {/* ===== Trigger Events ===== */}
        <div
          className="card"
          style={{
            padding: "16px",
            marginBottom: "16px",
            border: "1px solid #ccc",
            borderRadius: "8px",
          }}
        >
          <h3 style={{ marginBottom: "12px" }}>Trigger Events</h3>

          {/* Left Values */}
          <div
            className="row"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              width: "100%",
              marginTop: "8px",
            }}
          >
            {/* Odometer Left */}
            <label>
              <input
                type="checkbox"
                checked={!!form.odometerLeftKm}
                onChange={(e) =>
                  setForm({ ...form, odometerLeftKm: e.target.checked })
                }
              />
            </label>

            <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
              <label>Odometer Left (Km)</label>
              <input
                name="odometerLeftKmVal"
                type="number"
                min="0"
                value={form.odometerLeftKmVal}
                onChange={handleChange}
                disabled={!form.odometerLeftKm}
              />
              {errors.odometerLeftKmVal && (
                <span className="error-text">{errors.odometerLeftKmVal}</span>
              )}
            </div>

            {/* Engine Hours Left */}
            <label>
              <input
                type="checkbox"
                checked={!!form.engineHoursLeft}
                onChange={(e) =>
                  setForm({ ...form, engineHoursLeft: e.target.checked })
                }
              />
            </label>

            <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
              <label>Engine Hours Left</label>
              <input
                name="engineHoursLeftVal"
                type="number"
                min="0"
                value={form.engineHoursLeftVal}
                onChange={handleChange}
                disabled={!form.engineHoursLeft}
              />
              {errors.engineHoursLeftVal && (
                <span className="error-text">{errors.engineHoursLeftVal}</span>
              )}
            </div>

            {/* Days Left */}
            <label>
              <input
                type="checkbox"
                checked={!!form.daysLeft}
                onChange={(e) =>
                  setForm({ ...form, daysLeft: e.target.checked })
                }
              />
            </label>

            <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
              <label>Days Left</label>
              <input
                name="daysLeftVal"
                type="number"
                min="0"
                value={form.daysLeftVal}
                onChange={handleChange}
                disabled={!form.daysLeft}
              />
              {errors.daysLeftVal && (
                <span className="error-text">{errors.daysLeftVal}</span>
              )}
            </div>
          </div>

          {/* Update Last Service */}
          <div className="row" style={{ marginTop: "12px" }}>
            <div className="col-6">
              <input
                type="checkbox"
                name="updateLastService"
                checked={form.updateLastService}
                onChange={handleChange}
                id="updateLastServiceCheckbox"
              />
              <label htmlFor="updateLastServiceCheckbox">
                Update Last Service
              </label>
            </div>
          </div>
        </div>
      </div>

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

export default MaintenanceForm;
