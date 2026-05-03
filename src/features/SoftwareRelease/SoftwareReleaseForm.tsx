import { useState, useEffect } from "react";
import Modal from "../../components/common/Modal";
import { useAppDispatch } from "../../redux/hooks";
import {
  createSoftwareRelease,
  editSoftwareRelease,
} from "../../slices/softwareSlice";
import { toast } from "react-toastify";
import type { SoftwareRelease } from "../../api/software.api";
import "../../assets/css/SoftwareReleaseForm.css";
const SoftwareReleaseForm = ({ onClose, editData, onSuccess }: any) => {
  const dispatch = useAppDispatch();

  const [form, setForm] = useState<Partial<SoftwareRelease>>({
    text: "",
    date: "",
  });
useEffect(() => {
  if (editData) {
    setForm({
      ...editData,
      date: editData.date
        ? new Date(editData.date).toISOString().split("T")[0]
        : "",
    });
  }
}, [editData]);

  const handleSave = async () => {
    try {
      if (!form.text) {
        toast.error("Release text required");
        return;
      }

      if (form.id) {
        await dispatch(editSoftwareRelease(form)).unwrap();
        toast.success("Software updated successfully");
      } else {
        await dispatch(createSoftwareRelease(form)).unwrap();
        toast.success("Software created successfully");
      }

      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error(error?.message || "Save failed");
    }
  };

return (
  <Modal
    isOpen
    title={editData ? "Update Software Release" : "Add Software Release"}
    onClose={onClose}
    size="medium"
  >
    <div className="sr-modal-container">

      <div className="sr-modal-body">

        <div className="sr-form-group">
          <label>Date</label>
          <input
            type="date"
            value={form.date || ""}
            onChange={(e) =>
              setForm({ ...form, date: e.target.value })
            }
          />
        </div>

        <div className="sr-form-group">
          <label>Release Note</label>
          <textarea
            value={form.text || ""}
            onChange={(e) =>
              setForm({ ...form, text: e.target.value })
            }
          />
        </div>

      </div>

      <div className="sr-modal-footer">
        <button
          className="sr-btn-secondary"
          onClick={onClose}
        >
          Cancel
        </button>

        <button
          className="sr-btn-primary"
          onClick={handleSave}
        >
          {editData ? "Update" : "Save"}
        </button>
      </div>

    </div>
  </Modal>
);
};

export default SoftwareReleaseForm;