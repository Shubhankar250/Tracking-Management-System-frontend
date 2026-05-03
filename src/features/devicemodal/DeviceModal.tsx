// src/pages/deviceModal/DeviceModal.tsx

import { useCallback, useEffect, useState } from "react";
import Datatable from "../../components/common/DatatableNew";
import type { Column } from "../../components/common/DatatableNew";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import {
  fetchDeviceModals,
  removeDeviceModal,
} from "../../slices/deviceModalSlice";
import { FaEdit, FaTrash } from "react-icons/fa";
import Swal from "sweetalert2";
import { toast } from "react-toastify";
import AddDeviceModal from "./DeviceModalForm";
import type { DeviceModalDTO } from "../../api/deviceModalService";
import "../../assets/css/DeviceModalForm.css";

const DeviceModal = () => {
  const dispatch = useAppDispatch();
  const { deviceModals, totalRecords } = useAppSelector((s) => s.deviceModal);

  /* =====================
     LOCAL STATE
  ====================== */

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [search, setSearch] = useState("");
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedData, setSelectedData] = useState<
    DeviceModalDTO | undefined
  >();
  const BASE_URL = import.meta.env.VITE_IMAGE_BASE_URL;

  /* =====================
     FETCH DATA
  ====================== */

  const refresh = useCallback(() => {
    dispatch(
      fetchDeviceModals({
        page: page - 1,
        size: pageSize,
        search: search || "",
      }),
    );
  }, [dispatch, page, pageSize, search]);

  useEffect(() => {
    dispatch(
      fetchDeviceModals({
        page: page - 1,
        size: pageSize,
        search: search || "",
      }),
    );
  }, [dispatch, page, pageSize, search]);

  /* =====================
     DELETE
  ====================== */

  const handleDelete = async (id: number) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "Device Modal will be permanently deleted",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it",
    });

    if (!result.isConfirmed) return;

    try {
      await dispatch(removeDeviceModal(id)).unwrap();
      toast.success("Deleted successfully");
      refresh();
    } catch {
      toast.error("Delete failed");
    }
  };

  const downloadFile = async (
    fileName: string,
    modalName: string,
    type: "UserManual" | "ProtocolManual",
  ) => {
    try {
      const response = await fetch(`${BASE_URL}/${fileName}`);

      const blob = await response.blob();

      const extension = fileName.includes(".")
        ? fileName.substring(fileName.lastIndexOf("."))
        : "";

      const safeModalName = (modalName || "device").replace(
        /[^a-zA-Z0-9]/g,
        "_",
      );

      const finalName = `${safeModalName}_${type}${extension}`;

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = finalName;

      document.body.appendChild(link);
      link.click();

      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download failed:", error);
    }
  };

  /* =====================
     TABLE COLUMNS
  ====================== */

  const columns: Column<DeviceModalDTO>[] = [
    {
      key: "image",
      label: "IMAGE",
      render: (row) =>
        row.image ? (
          <img
            src={`${BASE_URL}/${row.image}`}
            alt="device"
            onClick={() => setPreviewImage(`${BASE_URL}/${row.image}`)}
            style={{
              width: 40,
              height: 40,
              objectFit: "cover",
              cursor: "pointer",
              borderRadius: 4,
            }}
          />
        ) : (
          "-"
        ),
    },
    { key: "companyName", label: "Company Name" },
    { key: "modalName", label: "Modal Name" },
    { key: "modalType", label: "Modal Type" },
    { key: "noOfChannel", label: "Channnels" },
    { key: "connectedIP", label: "IP" },
    { key: "connectedPort", label: "PORT" },
    { key: "protocolName", label: "Protocol Name" },
    { key: "noOfDIN", label: "No Of DIN" },
    { key: "noOfAIN", label: "No Of AIN" },
    { key: "noOfDOUT", label: "No Of DOUT" },

    {
      key: "userManual",
      label: "User Manual",
      render: (row) =>
        row.userManual ? (
          <button
            onClick={() =>
              downloadFile(row.userManual!, row.modalName!, "UserManual")
            }
            style={{
              padding: "4px 8px",
              background: "#2563eb",
              color: "#fff",
              borderRadius: "4px",
              fontSize: "12px",
              border: "none",
              cursor: "pointer",
            }}
          >
            Download
          </button>
        ) : (
          "-"
        ),
    },
    {
      key: "protocolManual",
      label: "Protocol Manual",
      render: (row) =>
        row.protocolManual ? (
          <button
            onClick={() =>
              downloadFile(
                row.protocolManual!,
                row.modalName!,
                "ProtocolManual",
              )
            }
            style={{
              padding: "4px 8px",
              background: "#16a34a",
              color: "#fff",
              borderRadius: "4px",
              fontSize: "12px",
              border: "none",
              cursor: "pointer",
            }}
          >
            Download
          </button>
        ) : (
          "-"
        ),
    },
      {
  key: "active",
  label: "Status",
  render: (row: any) => (
    <span
      className={`event-badge ${
        row.active ? "event-true" : "event-false"
      }`}
    >
      {row.active ? "Enabled" : "Disabled"}
    </span>
  ),
},
    {
      key: "action",
      label: "ACTION",
      render: (row) => (
        <div style={{ display: "flex", gap: 10 }}>
          <FaEdit
            style={{ cursor: "pointer", color: "#2563eb" }}
            onClick={() => {
              setSelectedData(row);
              setModalOpen(true);
            }}
          />
          <FaTrash
            style={{ cursor: "pointer", color: "#dc2626" }}
            onClick={() => handleDelete(row.id!)}
          />
        </div>
      ),
    },
  ];

  return (
    <>
      {/* Add/Edit Modal */}
      {modalOpen && (
        <AddDeviceModal
          onClose={() => {
            setModalOpen(false);
            setSelectedData(undefined);
          }}
          editData={selectedData}
          onSuccess={refresh}
        />
      )}

      {/* Add Button */}
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <button
          className="sidebar-search-btn"
          onClick={() => {
            setSelectedData(undefined);
            setModalOpen(true);
          }}
        >
          <i className="fas fa-plus"></i>
        </button>
      </div>

      {/* Table */}
      <Datatable
        columns={columns}
        data={deviceModals}
        totalRecords={totalRecords}
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

      {previewImage && (
        <div
          className="image-modal-overlay"
          onClick={() => setPreviewImage(null)}
        >
          <div className="image-modal" onClick={(e) => e.stopPropagation()}>
            <img src={previewImage} alt="preview" />
          </div>
        </div>
      )}
    </>
  );
};

export default DeviceModal;
