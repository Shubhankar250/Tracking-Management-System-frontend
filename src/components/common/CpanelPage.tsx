import {
  useEffect,
  useState,
} from "react";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import Modal from "./Modal";
import "../../assets/css/cpanel.css";
import { fetchProjectToken, fetchZlm, removeZlm, setZlmPage, setZlmPageSize, setZlmSearch } from "../../slices/zlmSlice";
import Datatable, { type Column } from "./DatatableNew";
import type { ExternalAccessTokenDTO } from "../../api/zlm.api";
import ZlmAddModal from "./ZlmAddModal";
import { toast } from "react-toastify";
import { FiRefreshCw, FiPlusCircle, FiCopy, } from "react-icons/fi";
import { FaTrash } from "react-icons/fa";
import Swal from "sweetalert2";
import DeviceModal from "../../features/devicemodal/DeviceModal";
import SettingsModal from "../../features/SettingPage";
import SoftwareReleasePage from "../../features/SoftwareRelease/SoftwareRelease";

interface Props {
  open: boolean;
  onClose: () => void;
}



const CpanelPage: React.FC<Props> = ({ open, onClose }) => {
  const dispatch = useAppDispatch();
  const {
    list,
    totalRecords,
    page,
    pageSize,
    search,
    loading,
  } = useAppSelector((s) => s.zlm);

  /* ---------------- TAB STATE ---------------- */
  const [activeTab, setActiveTab] = useState("Third Party App");

  const [, setShowForm] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);


  useEffect(() => {
    if (open) dispatch(fetchZlm());
  }, [dispatch, open]);


  const handleGenerate = (row: ExternalAccessTokenDTO) => {
    dispatch(fetchProjectToken(row.projectName));
    toast.success("Generate Token successfully");

  };

  const handleRefresh = (row: ExternalAccessTokenDTO) => {
    dispatch(fetchProjectToken(row.projectName));
    toast.success("Refresh Token successfully");


  };

const handleDelete = async (row: ExternalAccessTokenDTO) => {
  if (!row.id) return; // safety check

  const res = await Swal.fire({
    title: "Are you sure?",
    text: "This token will be permanently deleted!",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Yes, delete it",
    cancelButtonText: "Cancel",
  });

  if (res.isConfirmed) {
    try {
      await dispatch(removeZlm(row.id));
      dispatch(fetchZlm());
    } catch (error) {
      console.error(error);
      Swal.fire("Error!", "Something went wrong.", "error");
    }
  }
};


  useEffect(() => {
    if (open) {
      setActiveTab("Third Party App");
      setShowForm(false);
    }
  }, [open]);
  const columns: Column<ExternalAccessTokenDTO>[] = [
    { key: "username", label: "Username" },
    { key: "projectName", label: "Project" },
    { key: "url", label: "URL" },
    {
      key: "externalAccessToken",
      label: "Token",
      render: (row) => (
        <div className="token-cell">
          {!row.externalAccessToken ? (
            <span className="token-null">—</span>
          ) : (
            <>
              <span className="token-text">
                {row.externalAccessToken.length > 12
                  ? row.externalAccessToken.slice(0, 12) + "…"
                  : row.externalAccessToken}
              </span>
              <button
                className="btn-icon copy-token"
                title="Copy Token"
                onClick={() => {
                  if (row.externalAccessToken) {
                    navigator.clipboard.writeText(row.externalAccessToken);
                  }
                }}
              >
                <FiCopy size={16} />
              </button>

            </>
          )}
        </div>
      ),
    },

    {
      key: "action",
      label: "Actions",
      render: (row) => (
        <div style={{ display: "flex", gap: "8px" }}>
          {/* GENERATE (when token is null) */}
          {!row.externalAccessToken && (
            <FiPlusCircle
              className="generate-token-icon"
              onClick={() => handleGenerate(row)}
              title="Generate Token"
            />
          )}


          {/* REFRESH (when token exists) */}
          {row.externalAccessToken && (

            <FiRefreshCw size={18}
              style={{ cursor: "pointer", color: "#26dc87" }}
              onClick={() => handleRefresh(row)}
              title="Refresh Token"

            />

          )}

          {/* DELETE (always visible) */}
          <FaTrash size={18}
            style={{ cursor: "pointer", color: "#dc2626" }}
            onClick={() => handleDelete(row)}
            title="Delete Token"

          />

        </div>
      ),
    },
  ];


  return (
    <Modal 
    className="cpanel-page"
    isOpen={open} 
    title="Cpanel" 
    onClose={onClose} 
    size="fullscreen">

      {/* ---------------- TABS ---------------- */}
      <div className="modal-tabs">
        {["Third Party App", "Device Modal","Server Status","S/W Release","Settings"].map((t) => (
          <button
            key={t}
            className={`tab-btn ${activeTab === t ? "active" : ""}`}
            onClick={() => setActiveTab(t)}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="tab-content">

        {/* ================= TAB : THIRD PARTY APP ================= */}
        {activeTab === "Third Party App" && (
          <div className="tab-pane">

            {/* ADD BUTTON */}
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button
                className="sidebar-search-btn"
                title="Add Token"
                onClick={() => setShowAddModal(true)}
              >
                <i className="fas fa-plus"></i>
              </button>
            </div>




            {/* DATATABLE */}
            <Datatable
              columns={columns}
              data={list}
              totalRecords={totalRecords}
              pageSize={pageSize}
              page={page + 1}
              search={search}
              loading={loading}
              onFetch={() => dispatch(fetchZlm())}
              onPageChange={(p) => dispatch(setZlmPage(p - 1))}
              onPageSizeChange={(s) => dispatch(setZlmPageSize(s))}
              onSearchChange={(s) => dispatch(setZlmSearch(s))}
            />
          </div>
        )}

        {/* ================= TAB : Device Modal ================= */}
      {activeTab === "Device Modal" && (
  <div className="tab-pane">
    <DeviceModal />
  </div>
)}
     {/* ================= TAB : S/W Release ================= */}
      {activeTab === "S/W Release" && (
  <div className="tab-pane">
    <SoftwareReleasePage />
  </div>
)}
    {/* ================= TAB : Setting ================= */}
   {activeTab === "Settings" && (
  <div className="tab-pane">
    <SettingsModal/>
  </div>
)}
      </div>
      <ZlmAddModal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
      />
    </Modal>

  );
};

export default CpanelPage;
