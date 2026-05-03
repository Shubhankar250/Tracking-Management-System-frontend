import { useEffect, useState } from "react";
import Modal from "../../components/common/Modal";
import Datatable from "../../components/common/DatatableNew";
import type { Column } from "../../components/common/DatatableNew";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import {
  fetchMaintenance,
  fetchMaintenanceById,
  removeMaintenance,
} from "../../slices/maintenanceSlice";
import MaintenanceForm from "./MaintenanceForm";
import { toast } from "react-toastify";
import { FaEdit, FaTrash } from "react-icons/fa";
import Swal from "sweetalert2";
import { fetchDevices } from "../../slices/devicesSlice";
import { canWrite, canDelete } from "../../utils/permission";
const MaintenanceModal = ({ open, onClose }: any) => {
  const dispatch = useAppDispatch();
  const { data, selected, totalRecords } = useAppSelector((s) => s.maintenance);

  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);

  // Pagination
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [search, setSearch] = useState("");
  const refresh = () => dispatch(fetchMaintenance({ page, pageSize, search }));

  const { permissions, loading } = useAppSelector((s) => s.auth);
  const canWriteMaintenance = canWrite(permissions, "Maintenance");
  const canDeleteMaitenance = canDelete(permissions, "Maintenance");
  useEffect(() => {
    if (open) {
      dispatch(fetchDevices());
      refresh();
    }
  }, [open]);

  useEffect(() => {
    if (editOpen && editId) dispatch(fetchMaintenanceById(editId));
  }, [editOpen, editId]);

  const handleDelete = async (id: number) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "This Maintenance will be permanently deleted",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it",
      customClass: {
        popup: "swal2-popup-maintenance",
      },
    });

    if (!result.isConfirmed) return;

    try {
      await dispatch(removeMaintenance(id)).unwrap();
      toast.success("Maintenance deleted");
      refresh();
    } catch {
      toast.error("Delete failed");
    }
  };

  const columns: Column<any>[] = [
    { key: "device_name", label: "Object" },
    { key: "serviceName", label: "Service Name" },
    { key: "odometerIntervalKmVal", label: "Odometer" },
    { key: "odometerLeftKmVal", label: "Odometer Left" },
    { key: "engineHourIntervalVal", label: "Engine Hours" },
    { key: "engineHoursLeftVal", label: "Engine Hours Left" },
    { key: "daysLeftVal", label: "Days Left" },
    { key: "daysIntervalVal", label: "Days" },
    {
      key: "eventTrigger",
      label: "Event",
      render: (row: any) => (
        <span
          className={`event-badge ${
            row.eventTrigger ? "event-true" : "event-false"
          }`}
        >
          {row.eventTrigger ? "Enabled" : "Disabled"}
        </span>
      ),
    },
    ...(canWriteMaintenance || canDeleteMaitenance
      ? [
          {
            key: "action",
            label: "Action",
            render: (row: any) => (
              <div style={{ display: "flex", gap: 10 }}>
                {/* ✏️ EDIT */}
                {canWriteMaintenance && (
                  <FaEdit
                    style={{ cursor: "pointer", color: "#2563eb" }}
                    onClick={() => {
                      setEditId(row.id);
                      setEditOpen(true);
                    }}
                  />
                )}

                {/* 🗑 DELETE */}
                {canDeleteMaitenance && (
                  <FaTrash
                    style={{ cursor: "pointer", color: "#dc2626" }}
                    onClick={() => handleDelete(row.id)}
                  />
                )}
              </div>
            ),
          },
        ]
      : []),
  ];

  return (
    <>
      <Modal
        isOpen={open}
        title="Maintenance"
        onClose={onClose}
        showAddButton={!loading && canWriteMaintenance}
        onAddClick={() => {
          if (!loading && canWriteMaintenance) {
            setAddOpen(true);
          }
        }}
        size="fullscreen"
      >
        <Datatable
          columns={columns}
          data={data}
          totalRecords={totalRecords}
          pageSize={pageSize}
          page={page}
          search={search}
          onPageChange={setPage}
          onSearchChange={setSearch}
          onPageSizeChange={(size) => {
            setPageSize(size);
            setPage(1);
          }}
          onFetch={refresh}
        />
      </Modal>

      <Modal
        isOpen={addOpen}
        title="Add Maintenance"
        size="large"
        onClose={() => setAddOpen(false)}
      >
        <MaintenanceForm
          onClose={() => setAddOpen(false)}
          onSuccess={() => {
            setAddOpen(false);
            refresh();
          }}
        />
      </Modal>

      <Modal
        isOpen={editOpen}
        title="Update Maintenance"
        size="large"
        onClose={() => setEditOpen(false)}
      >
        {selected && (
          <MaintenanceForm
            isEdit
            editData={selected}
            onClose={() => setEditOpen(false)}
            onSuccess={() => {
              setEditOpen(false);
              refresh();
            }}
          />
        )}
      </Modal>
    </>
  );
};

export default MaintenanceModal;
