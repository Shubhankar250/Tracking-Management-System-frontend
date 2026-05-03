import React, { useEffect, useState } from "react";
import Modal from "../../components/common/Modal";
import type { DriverSetupDTO } from "../../api/setupServices.api";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import { fetchNotAssignDevices } from "../../slices/devicesSlice";
import Select from "react-select";
/* ---------- TYPES ---------- */

export interface AddSetupDriverForm {
  name: string;
  objectId: string;
  currentObjectId: string;
  rfid: string;
  phone: string;
  email: string;
  description: string;
  username: string;     // ✅ NEW
  password: string; 
}

interface AddSetupDriverProps {
  onClose: () => void;
  onSave: (data: DriverSetupDTO) => void;
  editData?: DriverSetupDTO;
}

/* ---------- COMPONENT ---------- */

const AddSetupDriver: React.FC<AddSetupDriverProps> = ({
  onClose,
  onSave,
  editData,
}) => {
  const [form, setForm] = useState<AddSetupDriverForm>({
    name: editData?.name || "",
    objectId: editData?.deviceId?.toString() || "",
    currentObjectId: editData?.currentDeviceId?.toString() || "",
    rfid: editData?.rfid || "",
    phone: editData?.phone || "",
    email: editData?.email || "",
    description: editData?.description || "",
     username: editData?.username || "", 
    password: "",
  });
 const notAssignedDevices = useAppSelector(
  (s) => s.devices.notAssignedDevices
);

const generatePassword = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};
const [autoLogin, setAutoLogin] = useState(true);
const [showPassword, setShowPassword] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = e.target;

    setForm((prev) => ({ ...prev, [name]: value }));

    // Special validation for phone
    if (name === "phone") {
      if (/^\d{10}$/.test(value)) {
        // Remove error only when exactly 10 digits
        setErrors((prev: any) => {
          const updated = { ...prev };
          delete updated.phone;
          return updated;
        });
      }
    } else {
      // For other fields remove error immediately
      if (errors[name]) {
        setErrors((prev: any) => {
          const updated = { ...prev };
          delete updated[name];
          return updated;
        });
      }
    }
  };
  
  const dispatch = useAppDispatch();
  const [errors, setErrors] = useState<any>({});

 useEffect(() => {
  dispatch(fetchNotAssignDevices());
}, [dispatch]);

  const validate = () => {
    let newErrors: any = {};

    if (!form.name.trim()) {
      newErrors.name = "Name is mandatory";
    }

    if (!form.objectId) {
      newErrors.objectId = "Please select Object";
    }

    if (!form.phone.trim()) {
      newErrors.phone = "Phone number is mandatory";
    } else if (!/^\d{10}$/.test(form.phone)) {
      newErrors.phone = "Phone number must be exactly 10 digits";
    }
  if (!autoLogin) {
  if (!form.username.trim()) {
    newErrors.username = "Username is mandatory";
  }

  if (!form.password.trim()) {
    newErrors.password = "Password is mandatory";
  }
  }
    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };
  const handleSave = () => {
    if (!validate()) return;
 let finalUsername = form.username;
  let finalPassword = form.password;

  // ✅ Auto mode
  if (autoLogin) {
    finalUsername = form.name; // name → username
    finalPassword = generatePassword(); // 6 digit password
  }
    const payload: DriverSetupDTO = {
      id: editData?.id,
      name: form.name,
     username: finalUsername,
     password: finalPassword,
      deviceId: Number(form.objectId),
      currentDeviceId: form.currentObjectId
        ? Number(form.currentObjectId)
        : undefined,
      rfid: form.rfid,
      phone: form.phone,
      email: form.email,
      description: form.description,
    };

    onSave(payload);
  };
  const deviceOptions = notAssignedDevices.map((d) => ({
    value: d.id,
    label: d.name,
  }));

  return (
    <Modal
      isOpen={true}
      title={editData ? "Update Driver" : "Add Driver"}
      onClose={onClose}
      size="medium"
    >
      <div className="st-modal-container">
        {/* BODY */}
        <div className="st-modal-body">
          <div className="st-form-group">
            <label>
              Name <span className="st-required">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Enter Name"
            />
            {errors.name && (
              <span style={{ color: "red", fontSize: "12px" }}>
                {errors.name}
              </span>
            )}
          </div>
           {/* AUTO LOGIN TOGGLE */}
      <div className="pill-input">
        <div>
          <strong>Auto-generate login</strong>
          <div className="hint">Auto create login for driver.</div>
        </div>

       <div
  className={`rw-switch ${autoLogin ? "active" : ""}`}
  onClick={() => setAutoLogin(!autoLogin)}
>
  <div className="rw-switch-thumb" />
</div>
      </div>
{!autoLogin && (
  <>
    <div className="st-form-group">
      <label>
        Username <span className="st-required">*</span>
      </label>
      <input
        type="text"
        name="username"
        value={form.username}
        onChange={handleChange}
        placeholder="Enter Username"
      />
      {errors.username && (
        <span style={{ color: "red", fontSize: "12px" }}>
          {errors.username}
        </span>
      )}
    </div>

    <div className="st-form-group">
  <label>
    Password <span className="st-required">*</span>
  </label>

  <div style={{ position: "relative" }}>
    <input
      type={showPassword ? "text" : "password"}
      name="password"
      value={form.password}
      onChange={handleChange}
      placeholder="Enter Password"
      style={{ paddingRight: "40px" }}
    />

    <span
      onClick={() => setShowPassword(!showPassword)}
      style={{
        position: "absolute",
        right: "10px",
        top: "50%",
        transform: "translateY(-50%)",
        cursor: "pointer",
        fontSize: "14px",
      }}
    >
  
    </span>
  </div>

  {errors.password && (
    <span style={{ color: "red", fontSize: "12px" }}>
      {errors.password}
    </span>
  )}
</div>
  </>
)}
          <div className="st-form-group">
            <label style={{marginTop:"6px"}}>
              Objects <span className="st-required">*</span>
            </label>
            <Select
              classNamePrefix="device-select"
              options={deviceOptions}
              placeholder="Search Object"
              isSearchable
              components={{ IndicatorSeparator: () => null }}
              value={deviceOptions.find(
                (option) => String(option.value) === form.objectId
              )}
              onChange={(selected) =>
                setForm((prev) => ({
                  ...prev,
                  objectId: selected ? String(selected.value) : "",
                }))
              }
              styles={{
                control: (base) => ({
                  ...base,
                  minHeight: "40px",
                  height: "40px",
                }),
                valueContainer: (base) => ({
                  ...base,
                  height: "40px",
                  padding: "0 8px",
                }),
                indicatorsContainer: (base) => ({
                  ...base,
                  height: "40px",
                }),
              }}
            />

            {errors.objectId && (
              <span style={{ color: "red", fontSize: "12px" }}>
                {errors.objectId}
              </span>
            )}
          </div>

          <div className="st-form-group">
            <label>Set As Current</label>
            <Select
              classNamePrefix="device-select"
              options={deviceOptions}
              placeholder="Search Object"
              isSearchable
              components={{ IndicatorSeparator: () => null }}
              value={deviceOptions.find(
                (option) => String(option.value) === form.currentObjectId
              )}
              onChange={(selected) =>
                setForm((prev) => ({
                  ...prev,
                  currentObjectId: selected ? String(selected.value) : "",
                }))
              }
              styles={{
                control: (base) => ({
                  ...base,
                  minHeight: "40px",
                  height: "40px",
                }),
                valueContainer: (base) => ({
                  ...base,
                  height: "40px",
                  padding: "0 8px",
                }),
                indicatorsContainer: (base) => ({
                  ...base,
                  height: "40px",
                }),
              }}
            />
          </div>

          <div className="st-form-group">
            <label>RFID</label>
            <input
              type="text"
              name="rfid"
              value={form.rfid}
              onChange={handleChange}
              placeholder="Enter RFID"
            />
          </div>

          <div className="st-form-group">
            <label>
              Phone <span className="st-required">*</span>
            </label>
            <input
              type="text"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              placeholder="Enter Number"
              maxLength={10}
              onKeyPress={(e) => {
                if (!/[0-9]/.test(e.key)) {
                  e.preventDefault();
                }
              }}
            />

            {errors.phone && (
              <span style={{ color: "red", fontSize: "12px" }}>
                {errors.phone}
              </span>
            )}
          </div>

          <div className="st-form-group">
            <label>E-Mail</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="Enter Email"
            />
          </div>

          <div className="st-form-group">
            <label>Description</label>
            <textarea
              name="description"
              rows={2}
              value={form.description}
              onChange={handleChange}
              placeholder="Description"
            />
          </div>
        </div>

        {/* FOOTER */}
        <div className="st-modal-footer">
          <button className="st-btn-secondary" onClick={onClose}>
            Close
          </button>
          <button className="st-btn-primary" onClick={handleSave}>
            {editData ? "Update" : "Save"}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default AddSetupDriver;
