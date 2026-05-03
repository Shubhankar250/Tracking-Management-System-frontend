import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Modal from "../../components/common/Modal";
import Datatable from "../../components/common/DatatableNew";
import type { Column } from "../../components/common/DatatableNew";
import AddAlertModal from "../../features/Alerts/AddAlertModal";
import "../../assets/css/alertsStyles.css";
import type { AppDispatch, RootState } from "../../redux/store";
import {
  clearSelectedAlert,
  deleteAlertThunk,
  fetchAlertById,
  fetchAlerts,
  toggleAlertStatusThunk,
} from "../../slices/alertSlice";
import Swal from "sweetalert2";
import { FaTrash, FaEdit } from "react-icons/fa";

/* =========================
   Types
========================= */

interface AlertModalProps {
  open: boolean;
  onClose: () => void;
}

interface AlertTableRow {
  id: number;
  status: string;
  name: string;
  type: string;
  objects: number;
}

/* =========================
   Component
========================= */

const AlertModal = ({ open, onClose }: AlertModalProps) => {
  const dispatch = useDispatch<AppDispatch>();

  const { list, totalElements } = useSelector(
    (state: RootState) => state.alerts
  );

  const [search, setSearch] = useState("");
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  /* =========================
     Fetch alerts when modal opens
  ========================= */

  useEffect(() => {
    if (open) {
      dispatch(fetchAlerts({ page: page - 1, size: pageSize, search }));
    }
  }, [open, page, pageSize, dispatch]);

  /* =========================
     Edit alert
  ========================= */

  const handleEditClick = (id: number) => {
    dispatch(fetchAlertById(id)).then((res: any) => {
      if (res.meta.requestStatus === "fulfilled") {
        setAddModalOpen(true);
      }
    });
  };

  /* =========================
     Delete alert with Swal
  ========================= */

  const handleDelete = async (id: number) => {
    const res = await Swal.fire({
      title: "Are you sure?",
      text: "This alert will be permanently deleted!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it",
      cancelButtonText: "Cancel",
    });

    if (res.isConfirmed) {
      await dispatch(deleteAlertThunk(id));
      Swal.fire("Deleted!", "Alert deleted successfully.", "success");
      // Refresh current page
      dispatch(fetchAlerts({ page: page - 1, size: pageSize, search }));
    }
  };

  /* =========================
     Safe Map API → table rows
  ========================= */

  const tableData: AlertTableRow[] = useMemo(() => {
    if (!Array.isArray(list)) return [];

    return list.map((a: any) => ({
      id: a.id,
      status: a.status === "ACTIVE" ? "ACTIVE" : "INACTIVE",
      name: a.alertName ?? "",
      type: a.alertType ?? "",
      objects: a.devicesCount ?? 0,
    }));
  }, [list]);


 const handleToggleStatus = async (id: number) => {
    const res = await Swal.fire({
        title: "Change alert status?",
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "Yes",
    });

    if (res.isConfirmed) {
        await dispatch(toggleAlertStatusThunk(id));
    }
};

  /* =========================
     Table columns
  ========================= */

  const columns: Column<AlertTableRow>[] = [
{
  key: "status",
  label: "STATUS",
  render: (row) => (
    <span
      className={`status-badge ${
        row.status === "ACTIVE"
          ? "status-active"
          : "status-inactive"
      }`}
      style={{ cursor: "pointer" }}
      onClick={() => handleToggleStatus(row.id)}
    >
      {row.status}
    </span>
  ),
},
    {
      key: "name",
      label: "NAME",
    },
    {
      key: "type",
      label: "TYPE",
    },
    {
      key: "objects",
      label: "OBJECTS",
    },
    {
      key: "action",
      label: "ACTION",
      render: (row) => (
        <div style={{ display: "flex", gap: 12 }}>
          <FaEdit
            style={{ cursor: "pointer", color: "#2563eb" }}
            onClick={() => handleEditClick(row.id)}
          />
          <FaTrash
            style={{ cursor: "pointer", color: "#dc2626" }}
            onClick={() => handleDelete(row.id)}
          />
        </div>
      ),
    },
  ];

  /* =========================
     Render
  ========================= */

  return (
    <>
      <Modal
        isOpen={open}
        title="Alerts"
        onClose={onClose}
        size="fullscreen"
        showAddButton
        onAddClick={() => {
          dispatch(clearSelectedAlert());
          setAddModalOpen(true);
        }}
      >
      
       {/* ✅ Responsive Wrapper */}
  <div className="alert-table-wrapper">
    <Datatable
      columns={columns}
      data={tableData}
      totalRecords={totalElements}
      pageSize={pageSize}
      page={page}
      search={search}
      onPageChange={(p) => setPage(p)}
      onSearchChange={(s) => setSearch(s)}
      onPageSizeChange={(size) => {
        setPageSize(size);
        setPage(1);
      }}
      onFetch={() => {
        dispatch(
          fetchAlerts({
            page: page - 1,
            size: pageSize,
            search,
          })
        );
      }}
    />
  </div>
      </Modal>

      <AddAlertModal
        open={addModalOpen}
        onClose={() => {
          setAddModalOpen(false);
          dispatch(clearSelectedAlert());

          // refresh current page — no sorting changes
          dispatch(
            fetchAlerts({
              page: page - 1,
              size: pageSize,
              search,
            })
          );
        }}
      />
    </>
  );
};

export default AlertModal;
