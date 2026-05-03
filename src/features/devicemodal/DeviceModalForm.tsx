// src/pages/deviceModal/DeviceModalForm.tsx
import { useState, useEffect } from "react";
import Modal from "../../components/common/Modal";
import { useAppDispatch } from "../../redux/hooks";
import {
  addDeviceModal,
  editDeviceModal,
  fetchAllModalNames,
} from "../../slices/deviceModalSlice";
import { toast } from "react-toastify";
import type { DeviceModalDTO } from "../../api/deviceModalService";
import "../../assets/css/DeviceModalForm.css";

const AddDeviceModal = ({ onClose, editData, onSuccess }: any) => {
  const dispatch = useAppDispatch();

  const [form, setForm] = useState<DeviceModalDTO>({
    companyName:"",
    modalName: "",
    modalType: "",
    noOfChannel: 0,
    userManual: "",
    protocolManual: "",
    commands: "",
    connectedIP: "",
    connectedPort: "",
    noOfDIN: 0,
    noOfAIN: 0,
    noOfDOUT: 0,
    protocolName: "",
    adasAlertType: "",
    dmsAlertType: "",
      active: true,
  });

  const IMAGE_MAX_SIZE = 5 * 1024 * 1024; // 5MB
  const MANUAL_MAX_SIZE = 10 * 1024 * 1024; // 10MB

  

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [userManualFile, setUserManualFile] = useState<File | null>(null);
  const [protocolManualFile, setProtocolManualFile] = useState<File | null>(
    null,
  );
const handleModalTypeChange = (value: string) => {

  if (value === "DashCam" || value === "Gps+DashCam") {
    setForm({
      ...form,
      modalType: value,
      adasAlertType: ADAS_DEFAULT,
      dmsAlertType: DMS_DEFAULT
    });
  } else {
    setForm({
      ...form,
      modalType: value,
      adasAlertType: "",
      dmsAlertType: ""
    });
  }
};

  useEffect(() => {
    if (editData) {
      setForm(editData);
    }
  }, [editData]);

  const handleSave = async () => {
    try {
      // 🛑 Final validation safety check
      if (imageFile && imageFile.size > IMAGE_MAX_SIZE) {
        toast.error("Image must be less than 5MB");
        return;
      }

      if (userManualFile && userManualFile.size > MANUAL_MAX_SIZE) {
        toast.error("User Manual must be less than 10MB");
        return;
      }

      if (protocolManualFile && protocolManualFile.size > MANUAL_MAX_SIZE) {
        toast.error("Protocol Manual must be less than 10MB");
        return;
      }

      const formData = new FormData();
      formData.append("data", JSON.stringify(form));

      if (imageFile) {
        formData.append("image", imageFile);
      }

      if (userManualFile) {
        formData.append("userManual", userManualFile);
      }

      if (protocolManualFile) {
        formData.append("protocolManual", protocolManualFile);
      }

      if (form.id) {
        await dispatch(editDeviceModal({ id: form.id, formData })).unwrap();
        toast.success("Device Modal updated successfully");
      } else {
        await dispatch(addDeviceModal(formData)).unwrap();
        toast.success("Device Modal created successfully");
      }

      onSuccess();
      onClose();
      dispatch(fetchAllModalNames());
    } catch (error: any) {
      toast.error(error?.message || "Failed to save device modal");
    }
  };

const BASE_URL = import.meta.env.VITE_IMAGE_BASE_URL;
const ADAS_DEFAULT =
  "adas_forward_collision,adas_lane_departure,adas_distance_too_close,adas_pedestrian_collision,adas_frequent_lane_change,adas_overspeed_sign,adas_obstacle,adas_road_sign,adas_active_capture";

const DMS_DEFAULT =
  "dms_fatigue,dms_phone_call,dms_smoking,dms_distraction,dms_no_driver,dms_auto_capture,dms_driver_change";
  return (
    <Modal
      isOpen
      title={editData ? "Update Device Modal" : "Add Device Modal"}
      onClose={onClose}
      size="large"
    >
      <div className="dm-add-modal-container">
        <div className="dm-add-modal-body">
          <div className="dm-form-group">
            <label>Company Name</label>
            <input
              value={form.companyName || ""}
              onChange={(e) => setForm({ ...form, companyName: e.target.value })}
            />
          </div>
          <div className="dm-form-group">
            <label>Modal Name</label>
            <input
              value={form.modalName || ""}
              onChange={(e) => setForm({ ...form, modalName: e.target.value })}
            />
          </div>

          <div className="dm-form-group">
            <label>Modal Type</label>
           <select
  value={form.modalType || ""}
  onChange={(e) => handleModalTypeChange(e.target.value)}
>
              <option value="">Select Modal Type</option>
              <option value="Gps">GPS</option>
              <option value="DashCam">DashCam</option>
              <option value="Gps+DashCam">GPS + DashCam</option>
            </select>
          </div>
<div className="dm-form-group">
  <label>Status</label>
  <select
    value={form.active ? "1" : "0"}
    onChange={(e) =>
      setForm({
        ...form,
        active: e.target.value === "1",
      })
    }
  >
    <option value="1">Enable</option>
    <option value="0">Disable</option>
  </select>
</div>
          {(form.modalType === "DashCam" || form.modalType === "Gps+DashCam") && (
  <>
    <div className="dm-form-group">
      <label>ADAS Alarm</label>
      <textarea
  value={form.adasAlertType || ""}
  onChange={(e) =>
    setForm({ ...form, adasAlertType: e.target.value })
  }
/>
    </div>

    <div className="dm-form-group">
      <label>DMS Alarm</label>
      <textarea
  value={form.dmsAlertType || ""}
  onChange={(e) =>
    setForm({ ...form, dmsAlertType: e.target.value })
  }
/>
    </div>
  </>
)}

          <div className="dm-form-group">
            <label>No Of Channels</label>
            <input
              type="number"
              value={form.noOfChannel || 0}
              onChange={(e) =>
                setForm({
                  ...form,
                  noOfChannel: Number(e.target.value),
                })
              }
            />
          </div>

          <div className="dm-form-group">
            <label>Connected IP</label>
            <input
              value={form.connectedIP || ""}
              onChange={(e) =>
                setForm({ ...form, connectedIP: e.target.value })
              }
            />
          </div>

          <div className="dm-form-group">
            <label>Connected Port</label>
            <input
              value={form.connectedPort || ""}
              onChange={(e) =>
                setForm({ ...form, connectedPort: e.target.value })
              }
            />
          </div>

          <div className="dm-form-group">
            <label>Number Of DIN</label>
            <input
              type="number"
              value={form.noOfDIN || 0}
              onChange={(e) =>
                setForm({ ...form, noOfDIN: Number(e.target.value) })
              }
            />
          </div>

          <div className="dm-form-group">
            <label>Number Of AIN</label>
            <input
              type="number"
              value={form.noOfAIN || 0}
              onChange={(e) =>
                setForm({ ...form, noOfAIN: Number(e.target.value) })
              }
            />
          </div>

          <div className="dm-form-group">
            <label>Number Of DOUT</label>
            <input
              type="number"
              value={form.noOfDOUT || 0}
              onChange={(e) =>
                setForm({ ...form, noOfDOUT: Number(e.target.value) })
              }
            />
          </div>

          <div className="dm-form-group">
            <label>User Manual</label>

            <input
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={(e) => {
                const selectedFile = e.target.files?.[0];
                if (!selectedFile) return;

                if (selectedFile.size > MANUAL_MAX_SIZE) {
                  toast.error("User Manual must be less than 10MB");
                  return;
                }

                setUserManualFile(selectedFile);
              }}
            />

            {/* Optional: show existing file name instead of image 
            {editData?.userManual && !userManualFile && (
              <div style={{ marginTop: 10 }}>
                <small>Current File: {editData.userManual}</small>
              </div>
            )}*/}
          </div>

          <div className="dm-form-group">
            <label>Protocol Name</label>
            <input
              value={form.protocolName || ""}
              onChange={(e) =>
                setForm({ ...form, protocolName: e.target.value })
              }
            />
          </div>

          <div className="dm-form-group">
            <label>Protocol Manual</label>

            <input
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={(e) => {
                const selectedFile = e.target.files?.[0];
                if (!selectedFile) return;

                if (selectedFile.size > MANUAL_MAX_SIZE) {
                  toast.error("Protocol Manual must be less than 10MB");
                  return;
                }

                setProtocolManualFile(selectedFile);
              }}
            />

           {/* {editData?.protocolManual && !protocolManualFile && (
              <div style={{ marginTop: 10 }}>
                <small>Current File: {editData.protocolManual}</small>
              </div>
            )}*/}
          </div>

          <div className="dm-form-group">
            <label>Commands</label>
            <textarea
              value={form.commands || ""}
              onChange={(e) => setForm({ ...form, commands: e.target.value })}
            />
          </div>

          <div className="dm-form-group">
            <label>Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const selectedFile = e.target.files?.[0];
                if (!selectedFile) return;

                if (selectedFile.size > IMAGE_MAX_SIZE) {
                  toast.error("Image must be less than 5MB");
                  return;
                }

                setImageFile(selectedFile);
              }}
            />

            {editData?.image && !imageFile && (
              <div style={{ marginTop: 15 }}>
                <img
                  src={`${BASE_URL}/${editData.image}`}
                  //src={editData.image}
                  alt="preview"
                  style={{ width: 60, height: 60, objectFit: "cover" }}
                />
              </div>
            )}
          </div>
        </div>

        <div className="dm-add-modal-footer">
          <button className="dm-btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button className="dm-btn-primary" onClick={handleSave}>
            {editData ? "Update" : "Save"}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default AddDeviceModal;
