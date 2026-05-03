import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import { createTask, editTask } from "../../slices/taskSlice";
import { toast } from "react-toastify";
import type { Task } from "../../api/taskApi";
import "../../assets/css/task.css";

const pad = (n: number) => String(n).padStart(2, "0");

const formatDateTime = (date: Date) => {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
    date.getDate(),
  )}T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(
    date.getSeconds(),
  )}`;
};

const getTodayTimes = () => {
  const now = new Date();

  const from = new Date(now);
  from.setHours(0, 0, 0, 0);

  const to = new Date(now);
  to.setHours(23, 59, 59, 0);

  return {
    from: formatDateTime(from),
    to: formatDateTime(to),
  };
};

interface Props {
  onSuccess: () => void;
  onClose: () => void;
  isEdit?: boolean;
  editData?: Task;
}

const AddTask = ({ onSuccess, onClose, isEdit, editData }: Props) => {
  const dispatch = useAppDispatch();
  const devices = useAppSelector((s) => s.devices.devices);
const [pickupLatitudeError, setPickupLatitudeError] = useState("");
const [pickupLongitudeError, setPickupLongitudeError] = useState("");
const [deliveryLatitudeError, setDeliveryLatitudeError] = useState("");
const [deliveryLongitudeError, setDeliveryLongitudeError] = useState("");
  const today = getTodayTimes();

  const [form, setForm] = useState({
    name: "",
    priority: "",
    object: "",
    status: "",
    description: "",
    pickup_address: "",
    delivery_address: "",
    pickup_start_time: today.from,
    pickup_end_time: today.to,
    delivery_start_time: today.from,
    delivery_end_time: today.to,
    device_name: "",
     pickup_latitude: 0,
  pickup_longitude: 0,
  delivery_latitude: 0,
  delivery_longitude: 0,
  });

  const [nameError, setNameError] = useState("");
  const [priorityError, setPriorityError] = useState("");

  useEffect(() => {
    if (isEdit && editData) {
      setForm({
        name: editData.name,
        priority: editData.priority,
        object: String(editData.object),
        status: editData.status,
        description: editData.description,
        pickup_address: editData.pickup_address,
        delivery_address: editData.delivery_address,
        pickup_start_time: editData.pickup_start_time,
        pickup_end_time: editData.pickup_end_time,
        delivery_start_time: editData.delivery_start_time,
        delivery_end_time: editData.delivery_end_time,
        device_name: editData.device_name,
         pickup_latitude: editData.pickup_latitude || 0,
      pickup_longitude: editData.pickup_longitude || 0,
      delivery_latitude: editData.delivery_latitude || 0,
      delivery_longitude: editData.delivery_longitude || 0,
      });
    }
  }, [isEdit, editData]);

const handleChange = (e: any) => {
  const { name, value } = e.target;

  setForm({
    ...form,
    [name]:
      name === "pickup_latitude" ||
      name === "pickup_longitude" ||
      name === "delivery_latitude" ||
      name === "delivery_longitude"
        ? Number(value)
        : value,
  });
};

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // ✅ Single validation function
    const validateFields = () => {
      let valid = true;

      // Task Name
      if (!form.name || !form.name.trim()) {
        setNameError("Task Name is required");
        valid = false;
      } else {
        setNameError("");
      }

      // Priority
      if (!form.priority) {
        setPriorityError("Priority is required");
        valid = false;
      } else {
        setPriorityError("");
      }


  // Pickup Latitude
  if (
    form.pickup_latitude === null ||
    form.pickup_latitude === undefined ||
    form.pickup_latitude === 0
  ) {
    setPickupLatitudeError("Pickup Latitude is required");
    valid = false;
  } else if (form.pickup_latitude < -90 || form.pickup_latitude > 90) {
    setPickupLatitudeError("Latitude must be between -90 and 90");
    valid = false;
  } else {
    setPickupLatitudeError("");
  }

  // Pickup Longitude
  if (
    form.pickup_longitude === null ||
    form.pickup_longitude === undefined ||
    form.pickup_longitude === 0
  ) {
    setPickupLongitudeError("Pickup Longitude is required");
    valid = false;
  } else if (form.pickup_longitude < -180 || form.pickup_longitude > 180) {
    setPickupLongitudeError("Longitude must be between -180 and 180");
    valid = false;
  } else {
    setPickupLongitudeError("");
  }

  // Delivery Latitude
  if (
    form.delivery_latitude === null ||
    form.delivery_latitude === undefined ||
    form.delivery_latitude === 0
  ) {
    setDeliveryLatitudeError("Delivery Latitude is required");
    valid = false;
  } else if (form.delivery_latitude < -90 || form.delivery_latitude > 90) {
    setDeliveryLatitudeError("Latitude must be between -90 and 90");
    valid = false;
  } else {
    setDeliveryLatitudeError("");
  }

  // Delivery Longitude
  if (
    form.delivery_longitude === null ||
    form.delivery_longitude === undefined ||
    form.delivery_longitude === 0
  ) {
    setDeliveryLongitudeError("Delivery Longitude is required");
    valid = false;
  } else if (
    form.delivery_longitude < -180 ||
    form.delivery_longitude > 180
  ) {
    setDeliveryLongitudeError("Longitude must be between -180 and 180");
    valid = false;
  } else {
    setDeliveryLongitudeError("");
  }

      return valid;
    };

    // ✅ Stop if validation fails
    if (!validateFields()) return;

    try {
      if (isEdit) {
        if (!editData) return;

        await dispatch(
          editTask({
            id: editData.id,
            ...form,
          })
        ).unwrap();

        toast.success("Task updated successfully");
      } else {
        await dispatch(createTask(form)).unwrap();
        toast.success("Task added successfully");
      }

      onSuccess();
    } catch {
      toast.error("Operation failed");
    }
  };

  return (
    <form className="task-form" onSubmit={handleSubmit}>
      {/* Scrollable body */}
      <div className="form-body">
        {/* Row 1: Task Name & Device */}
        <div className="row">
          <div className="field">
            <label>
              Task Name <span className="st-required">*</span>
            </label>

            <input
              name="name"
              value={form.name}
              onChange={(e) => {
                handleChange(e);
                if (e.target.value.trim()) setNameError("");
              }}
            />

            {nameError && (
              <div className="text-danger" style={{ fontSize: "12px" }}>
                {nameError}
              </div>
            )}
          </div>

          <div className="field">
            <label>Object</label>
            <select name="object" value={form.object} onChange={handleChange}>
              <option value="">Select Object</option>
              {devices.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Row 2: Priority & Status */}
        <div className="row">
          <div className="field">
            <label>
              Priority <span className="st-required">*</span>
            </label>

            <select
              name="priority"
              value={form.priority}
              onChange={(e) => {
                handleChange(e);
                if (e.target.value) setPriorityError("");
              }}
            >
              <option value="">Select priority</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>

            {priorityError && (
              <div className="text-danger" style={{ fontSize: "12px" }}>
                {priorityError}
              </div>
            )}
          </div>
        </div>

        {/* Description */}
        <div className="row full-width">
          <div className="field">
            <label>Description</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
            />
          </div>
        </div>

        {/* Addresses */}
        <div className="row">
          <div className="field">
            <label>Pickup Address</label>
            <input
              name="pickup_address"
              value={form.pickup_address}
              onChange={handleChange}
            />
          </div>
          <div className="field">
            <label>Delivery Address</label>
            <input
              name="delivery_address"
              value={form.delivery_address}
              onChange={handleChange}
            />
          </div>
        </div>
{/* Pickup Coordinates */}
<div className="row">
  <div className="field">
    <label>Pickup Latitude</label>
    <input
      type="number"
      step="any"
      name="pickup_latitude"
      value={form.pickup_latitude}
      onChange={(e) => {
  handleChange(e);
  setPickupLatitudeError("");
}}
    />
    {pickupLatitudeError && (
  <div className="text-danger" style={{ fontSize: "12px" }}>
    {pickupLatitudeError}
  </div>
)}
  </div>

  <div className="field">
    <label>Pickup Longitude</label>
    <input
      type="number"
      step="any"
      name="pickup_longitude"
      value={form.pickup_longitude}
      onChange={(e) => {
  handleChange(e);
  setPickupLongitudeError("");
}}
    />
    {pickupLongitudeError && (
  <div className="text-danger" style={{ fontSize: "12px" }}>
    {pickupLongitudeError}
  </div>
)}
  </div>
</div>

{/* Delivery Coordinates */}
<div className="row">
  <div className="field">
    <label>Delivery Latitude</label>
    <input
      type="number"
      step="any"
      name="delivery_latitude"
      value={form.delivery_latitude}
      onChange={(e) => {
  handleChange(e);
  setDeliveryLatitudeError("");
}}
    />
    {deliveryLatitudeError && (
  <div className="text-danger" style={{ fontSize: "12px" }}>
    {deliveryLatitudeError}
  </div>
)}
  </div>

  <div className="field">
    <label>Delivery Longitude</label>
    <input
      type="number"
      step="any"
      name="delivery_longitude"
      value={form.delivery_longitude}
     onChange={(e) => {
  handleChange(e);
  setDeliveryLongitudeError("");
}}
    />
    {deliveryLongitudeError && (
  <div className="text-danger" style={{ fontSize: "12px" }}>
    {deliveryLongitudeError}
  </div>
)}
  </div>
</div>
        {/* Start Date & Time */}
        <div className="row">
          <div className="field">
            <label>Pickup Start Time</label>
            <input
              type="datetime-local"
              step="1"
              name="pickup_start_time"
              value={form.pickup_start_time}
              onChange={handleChange}
            />
          </div>
          <div className="field">
            <label>Pickup End Time</label>
            <input
              type="datetime-local"
              step="1"
              name="pickup_end_time"
              value={form.pickup_end_time}
              onChange={handleChange}
            />
          </div>
        </div>

        {/* Destination Date & Time */}
        <div className="row">
          <div className="field">
            <label>Delivery Start Time</label>
            <input
              type="datetime-local"
              step="1"
              name="delivery_start_time"
              value={form.delivery_start_time}
              onChange={handleChange}
            />
          </div>
          <div className="field">
            <label>Delivery End Time</label>
            <input
              type="datetime-local"
              step="1"
              name="delivery_end_time"
              value={form.delivery_end_time}
              onChange={handleChange}
            />
          </div>
        </div>
      </div>

      {/* Sticky Footer */}
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

export default AddTask;
