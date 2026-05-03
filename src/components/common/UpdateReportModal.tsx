import { useEffect, useRef } from "react";
import Modal from "../../components/common/Modal";
import MainTab from "../../components/common/MainTab";
import type { MainTabHandles } from "../../components/common/MainTab";
import { useAppDispatch } from "../../redux/hooks";
import { updateReport } from "../../slices/reportSlice";
import type { ReportDTO } from "../../slices/reportSlice";
import { toast } from "react-toastify";


interface Props {
  open: boolean;
  report: ReportDTO | null;
  onClose: () => void;
}

const UpdateReportModal: React.FC<Props> = ({ open, report, onClose }) => {
  const mainTabRef = useRef<MainTabHandles>(null);
  const dispatch = useAppDispatch();

  // 🔁 Prefill data
useEffect(() => {
  if (report && mainTabRef.current) {
    mainTabRef.current.setFormData(report);
  }
}, [report]);

  const handleUpdate = () => {
    if (!mainTabRef.current || !report?.id) return;

    const formData = mainTabRef.current.getFormData();

    dispatch(updateReport({ ...formData, id: report.id }) as any)
      .unwrap()
      .then(() => {
        toast.success("Report updated successfully!");
        onClose();
      })
      .catch((err: any) => {
        toast.error("Update failed: " + err);
      });
  };

  return (
   <Modal
  isOpen={open}
  title="Update Report"
  onClose={onClose}
  size="large"
>
  {/* ✅ ADD THIS WRAPPER */}
  <div className="modal-body-padding">
    <MainTab ref={mainTabRef} />
  </div>

  <div className="report-footer">
    <button className="btn new-btn" onClick={handleUpdate}>
      Update
    </button>
    <button className="btn close-btn" onClick={onClose}>
      Close
    </button>
  </div>
</Modal>

  );
};

export default UpdateReportModal;
