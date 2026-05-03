import { useState, useRef } from "react";
import Modal from "../../components/common/Modal";
import "../../assets/css/report-modal.css";
import MainTab from "../../components/common/MainTab";
import type { MainTabHandles } from "../../components/common/MainTab";
import GeneratedTab from "../../components/common/GeneratedTab";
import ScheduleTab from "../../components/common/ScheduleTab";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import { createReport, fetchReportById } from "../../slices/reportSlice";
import type { ReportDTO } from "../../slices/reportSlice";
import { toast } from "react-toastify";
import UpdateReportModal from "../../components/common/UpdateReportModal";
import { generateMovementReport } from "../../slices/movementreportExportSlice";
import { canWrite } from "../../utils/permission";

interface Props {
  open: boolean;
  onClose: () => void;
}

const ReportModal: React.FC<Props> = ({ open, onClose }) => {
  const mainTabRef = useRef<MainTabHandles>(null);
  const dispatch = useAppDispatch();

  const [activeTab, setActiveTab] = useState<"main" | "generated" | "schedule">(
    "main",
  );

  const [updateOpen, setUpdateOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<ReportDTO | null>(null);
  const { permissions } = useAppSelector((s) => s.auth);

  const canWriteReport = canWrite(permissions, "Report");
  const canGenerateReport = canWrite(permissions, "Report");

  const handleSave = () => {
  if (!mainTabRef.current) return;

  const formData = mainTabRef.current.getFormData();

  if (!formData.title || !formData.reportType || !formData.outputFormat) {
    toast.error("Please fill required fields: Title, Type, and Format.");
    return;
  }

  // ✅ FORCE CRON
  formData.scheduleType = "CRON";

  dispatch(createReport(formData) as any)
    .unwrap()
    .then(() => {
      toast.success("Report created successfully!");
      mainTabRef.current?.reset();
      onClose();
    })
    .catch((err: any) => {
      toast.error("Create failed: " + err);
    });
};
  const handleGenerateSave = () => {
  if (!mainTabRef.current) return;

  const formData = mainTabRef.current.getFormData();

  if (!formData.title || !formData.reportType || !formData.outputFormat) {
    toast.error("Please fill required fields: Title, Type, and Format.");
    return;
  }
  // ✅ FORCE ONCE
  formData.scheduleType = "ONCE";
  dispatch(createReport(formData) as any)
    .unwrap()
    .then(() => {
      toast.success("Report generated and sent via mail successfully!");
      mainTabRef.current?.reset();
      onClose();
    })
    .catch((err: any) => {
      toast.error("Create failed: " + err);
    });
};
  const handleEdit = async (id: number) => {
    try {
      const res = await dispatch(fetchReportById(id)).unwrap();
      setSelectedReport(res); // 👈 backend data
      setUpdateOpen(true); // 👈 open modal
    } catch (err) {
      toast.error("Failed to load report");
    }
  };
  const handleGenerate = async () => {
    if (!mainTabRef.current) return;

    const formData = mainTabRef.current.getFormData();

    if (!formData.reportType || !formData.outputFormat) {
      toast.error("Please select Report Type and Format");
      return;
    }

    try {
      const res = await dispatch(
        generateMovementReport(formData) as any,
      ).unwrap();

      const blob = new Blob([res.data]);
      const url = window.URL.createObjectURL(blob);

      //const format = (formData?.format || "xlsx").toLowerCase();

      const a = document.createElement("a");
      a.href = url;
      a.download = `${formData.reportType}_${Date.now()}.${(formData?.outputFormat || "xlsx").toLowerCase()}`;

      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      toast.success("Report generated successfully");
    } catch (err) {
      toast.error("Failed to generate report");
    }
  };
  const handleGenerateClick = () => {
  if (!mainTabRef.current) return;

  const formData = mainTabRef.current.getFormData();

  // basic validation
  if (!formData.reportType || !formData.outputFormat) {
    toast.error("Please select Report Type and Format");
    return;
  }

  // 🔥 CONDITION
  if (formData.emailTo && formData.emailTo.trim() !== "") {
    // 👉 EMAIL → SCHEDULER (ONCE)
    handleGenerateSave();
  } else {
    // 👉 NO EMAIL → DIRECT DOWNLOAD
    handleGenerate();
  }
};
  return (
    <>
      <Modal isOpen={open} title="Reports" onClose={onClose} size="large">
        {/* TABS */}
        <div className="modal-tabs">
          <button
            className={`tab-btn ${activeTab === "main" ? "active" : ""}`}
            onClick={() => setActiveTab("main")}
          >
            Main
          </button>
          <button
            className={`tab-btn ${activeTab === "generated" ? "active" : ""}`}
            onClick={() => setActiveTab("generated")}
          >
            Schedule Report
          </button>
          <button
            className={`tab-btn ${activeTab === "schedule" ? "active" : ""}`}
            onClick={() => setActiveTab("schedule")}
          >
            Schedule Report Logs
          </button>
        </div>

        {/* BODY */}
        <div className="report-content">
          {activeTab === "main" && <MainTab ref={mainTabRef} />}
          {activeTab === "generated" && <GeneratedTab onEdit={canWriteReport ? handleEdit : undefined} />}
          {activeTab === "schedule" && <ScheduleTab />}
        </div>

        {/* FOOTER */}
        <div className="report-footer">
          {canGenerateReport && (
          <button className="btn generated-btn" onClick={handleGenerateClick}>
            Generate
          </button>
          )}
          {canGenerateReport && (
          <button className="btn new-btn" onClick={handleSave}>
            Save
          </button>
          )}
          {canGenerateReport && (
          <button
            className="btn new-btn"
            onClick={() => {
              if (activeTab !== "main") setActiveTab("main");
              else mainTabRef.current?.reset();
            }}
          >
            New
          </button>
          )}
          <button className="btn close-btn" onClick={onClose}>
            Close
          </button>
        </div>
      </Modal>
      {/* 🔹 UPDATE REPORT MODAL */}

      <UpdateReportModal
        open={updateOpen}
        report={selectedReport}
        onClose={() => {
          setUpdateOpen(false);
          setSelectedReport(null);
        }}
      />
    </>
  );
};

export default ReportModal;
