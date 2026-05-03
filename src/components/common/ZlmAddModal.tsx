import { useState, type ChangeEvent } from "react";
import Modal from "./Modal";
import { useAppDispatch } from "../../redux/hooks";
import { saveZlm, fetchZlm } from "../../slices/zlmSlice";
import "../../assets/css/zlmadd.css";

interface Props {
  open: boolean;
  onClose: () => void;
}

interface ZlmForm {
  username: string;
  password: string;
  projectName: string;
  url: string;
}

const ZlmAddModal: React.FC<Props> = ({ open, onClose }) => {
  const dispatch = useAppDispatch();

  const [form, setForm] = useState<ZlmForm>({
    username: "",
    password: "",
    projectName: "",
    url: "",
  });

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    if (!form.username || !form.password || !form.projectName || !form.url) {
      alert("All fields required");
      return;
    }

    await dispatch(saveZlm(form));
    await dispatch(fetchZlm());
    onClose();

    setForm({ username: "", password: "", projectName: "", url: "" });
  };

  return (
    <Modal
      isOpen={open}
      onClose={onClose}
      title="Add External Application"
      size="medium"
    >
     <form className="zlm-modal-form">
  <div className="form-body single-row">
    <div className="form-group">
      <label>
        Username <span className="st-required">*</span>
      </label>
      <input
        name="username"
        value={form.username}
        onChange={handleChange}
      />
    </div>

    <div className="form-group">
      <label>
        Password <span className="st-required">*</span>
      </label>
      <input
        type="password"
        name="password"
        value={form.password}
        onChange={handleChange}
      />
    </div>

    <div className="form-group">
      <label>
        Project <span className="st-required">*</span>
      </label>
      <select
        className="form-select"
        name="projectName"
        value={form.projectName}
        onChange={handleChange}
      >
        <option value="">Select Project</option>
        <option value="ZLM_PROJECT">JT1078 (Video)</option>
        <option value="VMS_PROJECT">VMS_PROJECT</option>
        <option value="TRACKING_PROJECT">TRACKING_PROJECT</option>
      </select>
    </div>

    <div className="form-group">
      <label>
        URL <span className="st-required">*</span>
      </label>
      <input name="url" value={form.url} onChange={handleChange} />
    </div>
  </div>

  <div className="modal-footer-custom">
    <button type="button" className="btn-gray" onClick={onClose}>
      Close
    </button>
    <button type="button" className="btn-blue" onClick={handleSubmit}>
      Save
    </button>
  </div>
</form>
    </Modal>
  );
};

export default ZlmAddModal;