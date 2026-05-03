import { useEffect, useState } from "react";
import Modal from "../../components/common/Modal";
import Datatable from "../../components/common/DatatableNew";
import type { Column } from "../../components/common/DatatableNew";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import {
  downloadCommandTemplate,
  fetchCommands,
  removeCommand,
} from "../../slices/commandSlice";
import { FaEdit, FaTrash } from "react-icons/fa";
import Swal from "sweetalert2";
import { toast } from "react-toastify";
import "../../assets/css/command.css";
import AddCommandModal from "./AddCommand";
import UploadExcelModal from "./UploadExcelModal";
import PreviewExcelModal from "./PreviewExcelModal";
import type { CommandDTO } from "../../api/commandService";
import {  canWrite, canDelete } from "../../utils/permission";

const CommandModal = ({ open, onClose }: any) => {
  const dispatch = useAppDispatch();
  const { commands } = useAppSelector((s) => s.commands);

  /* =====================
     LOCAL STATE
  ====================== */

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [search, setSearch] = useState("");

  const [commandModalOpen, setCommandModalOpen] = useState(false);
  const [selectedCommand, setSelectedCommand] = useState<
    CommandDTO | undefined
  >();

  const [uploadOpen, setUploadOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewFile, setPreviewFile] = useState<File | null>(null);
    const { permissions, loading } = useAppSelector((s) => s.auth);

  const canWriteCommands = canWrite(permissions, "Commands");
  const canDeleteCommands = canDelete(permissions, "Commands");

  /* =====================
     FETCH DATA
  ====================== */

  const refresh = () => {
    dispatch(
      fetchCommands({
        page: 0,
        size: 10,
        search: search,
      }),
    );
  };

  useEffect(() => {
    if (open) refresh();
  }, [open]);

  /* =====================
     DOWNLOAD TEMPLATE
  ====================== */

  const handleDownloadTemplate = async () => {
    try {
      const res = await dispatch(downloadCommandTemplate()).unwrap();

      const blob = new Blob([res], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = url;
      link.download = "commandsUploadData.xlsx";
      document.body.appendChild(link);
      link.click();

      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success("Template downloaded");
    } catch {
      toast.error("Failed to download template");
    }
  };

  /* =====================
     DELETE COMMAND
  ====================== */

  const handleDelete = async (id: number) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "Command will be permanently deleted",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it",
    });

    if (!result.isConfirmed) return;

    try {
      await dispatch(removeCommand(id)).unwrap();
      toast.success("Command deleted successfully");
      refresh();
    } catch {
      toast.error("Delete failed");
    }
  };

  /* =====================
     TABLE COLUMNS
  ====================== */

  const columns: Column<CommandDTO>[] = [
    { key: "model", label: "MODEL" },
    { key: "commandName", label: "COMMAND NAME" },
    { key: "commandCode", label: "COMMAND CODE" },
    {
      key: "commandStatus",
      label: "COMMAND STATUS",
      render: (row) => {
        const isActive = row.commandStatus === 1;

        return (
          <span
            className={`status-badge ${
              isActive ? "status-active" : "status-inactive"
            }`}
          >
            {isActive ? "ACTIVE" : "INACTIVE"}
          </span>
        );
      },
    },

    { key: "types", label: "TYPES" },
     ...(canWriteCommands || canDeleteCommands
      ? [
    {
      key: "action" as const,
      label: "ACTION",
      render: (row :any) => (
        <div style={{ display: "flex", gap: 10 }}>
          {canWriteCommands && (
          <FaEdit
            style={{ cursor: "pointer", color: "#2563eb" }}
            onClick={() => {
              setSelectedCommand(row);
              setCommandModalOpen(true);
            }}
          />
          )}
          {canDeleteCommands && (
          <FaTrash
            style={{ cursor: "pointer", color: "#dc2626" }}
            onClick={() => handleDelete(row.id!)}
          />
          )}
        </div>
      ),
    },
    ]
      : []),
  ];

  const closeCommandModal = () => {
    setCommandModalOpen(false);
    setSelectedCommand(undefined);
  };

  return (
    <>
      <Modal isOpen={open} title="Commands" onClose={onClose} size="large">
        <div className="cmd-modal-body-flex">
          <div className="cmd-modal-content-scroll">
            {/* HEADER BUTTONS */}
            {!loading && canWriteCommands && (
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: 10,
                marginTop: 10,
              }}
            >
              <button
                className="cmd-btn-primary"
                onClick={() => {
                  setSelectedCommand(undefined);
                  setCommandModalOpen(true);
                }}
              >
                <i className="fas fa-plus"></i>
              </button>

              <button
                className="cmd-btn-primary cmd-btn-fixed"
                onClick={handleDownloadTemplate}
              >
                Template
              </button>

              <button
                className="cmd-btn-primary cmd-btn-fixed"
                onClick={() => setUploadOpen(true)}
              >
                Upload
              </button>
            </div>
            )}
            {/* ADD / EDIT MODAL */}
            {commandModalOpen && (
              <AddCommandModal
                onClose={closeCommandModal}
                editData={selectedCommand}
                onSuccess={refresh}
              />
            )}

            {/* TABLE */}
            <Datatable
              columns={columns}
              data={commands}
              totalRecords={commands.length}
              page={page}
              pageSize={pageSize}
              search={search}
              onPageChange={setPage}
              onSearchChange={setSearch}
              onPageSizeChange={(size) => {
                setPageSize(size);
                setPage(1);
              }}
              onFetch={refresh}
            />
          </div>

          {/* FOOTER */}
          <div className="cmd-modal-footer-custom">
            <button className="btn cmd-btn-secondary" onClick={onClose}>
              Close
            </button>
          </div>
        </div>
      </Modal>

      {/* UPLOAD MODAL */}
      {uploadOpen && (
        <UploadExcelModal
          onClose={() => setUploadOpen(false)}
          onPreview={(file: File) => {
            //setUploadOpen(false);
            setPreviewFile(file);
            setPreviewOpen(true);
          }}
        />
      )}

      {/* PREVIEW MODAL */}
      {previewOpen && previewFile && (
        <PreviewExcelModal
          file={previewFile}
          onClose={() => setPreviewOpen(false)}
          onSuccess={() => {
            setUploadOpen(false);
            refresh();
          }}
        />
      )}
    </>
  );
};

export default CommandModal;
