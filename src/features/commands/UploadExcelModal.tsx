import { useState } from "react";
import Modal from "../../components/common/Modal";
import { useAppDispatch } from "../../redux/hooks";
import { previewCommandExcel } from "../../slices/commandSlice";
import { toast } from "react-toastify";

const UploadExcelModal = ({ onClose, onPreview }: any) => {
  const dispatch = useAppDispatch();
  const [file, setFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    if (!selected.name.endsWith(".xlsx")) {
      toast.error("Only .xlsx files are allowed");
      e.target.value = "";
      return;
    }

    setFile(selected);
  };

  const handlePreview = async () => {
    if (!file) {
      toast.error("Please select a file");
      return;
    }

    try {
      await dispatch(previewCommandExcel(file)).unwrap();
      onPreview(file);
    } catch {
      toast.error("Failed to preview file");
    }
  };

  return (
    <Modal isOpen title="Upload Excel" onClose={onClose} size="medium">
      <div className="upload-modal-body">

        {/* Upload Box */}
        <label className="upload-dropzone">
          <input
            type="file"
            accept=".xlsx"
            onChange={handleFileChange}
            hidden
          />

          <div className="upload-icon">
            <i className="far fa-file-alt"></i>
          </div>

          <div className="upload-text">
            {file ? (
              <>
                <strong>{file.name}</strong>
                <div className="upload-success">File uploaded ✔</div>
              </>
            ) : (
              <strong>Click to upload</strong>
            )}
          </div>

          {!file && (
            <div className="upload-hint">
              Only <b>.xlsx</b> files are supported
            </div>
          )}
        </label>

        {/* Footer */}
        <div className="upl-add-modal-footer">
          <button className="btn-gray" onClick={onClose}>
            Cancel
          </button>
          <button
            className="btn-blue"
            onClick={handlePreview}
          >
            Preview
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default UploadExcelModal;
