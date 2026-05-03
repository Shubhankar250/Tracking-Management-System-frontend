import { useEffect, useMemo, useState } from "react";
import Datatable from "../components/common/DatatableNew";
import type { Column } from "../components/common/DatatableNew";
import Modal from "../components/common/Modal";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import {
  fetchMaintenance,
  removeMaintenance,
  fetchMaintenanceById,
} from "../slices/maintenanceSlice";
import { FaEdit, FaTrash } from "react-icons/fa";
import Swal from "sweetalert2";
import { toast } from "react-toastify";
import MaintenanceForm from "../features/maintenance/MaintenanceForm";
import { fetchDevices } from "../slices/devicesSlice";

const DeviceMaintenance = ({ deviceId }: any) => {
  const dispatch = useAppDispatch();

  const [editOpen, setEditOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [search, setSearch] = useState("");
  const { data, selected, totalRecords } = useAppSelector((s) => s.maintenance);
  const refresh = () => dispatch(fetchMaintenance({ page, pageSize, search }));
  // Fetch ALL maintenance once
  useEffect(() => {
    dispatch(fetchDevices());
    dispatch(
      fetchMaintenance({
        page: 1,
        pageSize: 1000,
        search: "",
      }),
    );
  }, [dispatch]);
  useEffect(() => {
    if (editOpen && editId) dispatch(fetchMaintenanceById(editId));
  }, [editOpen, editId]);

  // Filter by deviceId (frontend filter)
  const filteredData = useMemo(() => {
    return data?.filter((item: any) => item.deviceId === deviceId) || [];
  }, [data, deviceId]);

  // Delete handler
  const handleDelete = async (id: number) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "This Maintenance will be permanently deleted",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it",
    });

    if (!result.isConfirmed) return;

    try {
      await dispatch(removeMaintenance(id)).unwrap();
      toast.success("Maintenance deleted");

      // Refresh list
      dispatch(
        fetchMaintenance({
          page: 1,
          pageSize: 1000,
          search: "",
        }),
      );
    } catch {
      toast.error("Delete failed");
    }
  };

  // Columns with Action button
  const columns: Column<any>[] = [
    { key: "device_name", label: "Device Name" },
    { key: "serviceName", label: "Service Name" },
    { key: "odometerIntervalKmVal", label: "Odometer" },
    { key: "odometerLeftKmVal", label: "Odometer Left" },
    { key: "engineHourIntervalVal", label: "Engine Hours" },
    { key: "engineHoursLeftVal", label: "Engine Hours Left" },
    { key: "daysLeftVal", label: "Days Left" },
    { key: "daysIntervalVal", label: "Days" },
    { key: "eventTrigger", label: "Event" },
    {
      key: "action",
      label: "Action",
      render: (row) => (
        <div style={{ display: "flex", gap: 10 }}>
          <FaEdit
            style={{ cursor: "pointer", color: "#2563eb" }}
            onClick={() => {
              setEditId(row.id);

              setEditOpen(true);
            }}
          />
          <FaTrash
            style={{ cursor: "pointer", color: "#dc2626" }}
            onClick={() => handleDelete(row.id)}
          />
        </div>
      ),
    },
  ];

  return (
    <div className="maintenance-tab">
      {/* Add Button */}
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
        }}
      >
        <button
          style={{
            backgroundColor: "#066fd1",
            color: "#fff",
            border: "none",
            padding: "6px 10px",
            borderRadius: "5px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "14px",
            transition: "background 0.2s",
          }}
          onClick={() => setAddOpen(true)}
        >
          <i className="fas fa-plus"></i>
        </button>
      </div>

      <div style={{ overflowX: "auto" }}>
        <Datatable
          columns={columns}
          data={filteredData}
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
      </div>

      {/* Add Modal */}
      <Modal
        isOpen={addOpen}
        title="Add Maintenance"
        size="large"
        onClose={() => setAddOpen(false)}
      >
        <MaintenanceForm
          deviceId={deviceId}
          onClose={() => setAddOpen(false)}
          onSuccess={() => {
            setAddOpen(false);
            dispatch(
              fetchMaintenance({
                page: 1,
                pageSize: 1000,
                search: "",
              }),
            );
          }}
        />
      </Modal>

      {/* Edit Modal */}
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
            deviceId={deviceId}
            onClose={() => setEditOpen(false)}
            onSuccess={() => {
              setEditOpen(false);
              dispatch(
                fetchMaintenance({
                  page: 1,
                  pageSize: 1000,
                  search: "",
                }),
              );
            }}
          />
        )}
      </Modal>
    </div>
  );
};

export default DeviceMaintenance;
