import { useEffect, useState } from "react";
import Modal from "../../components/common/Modal";
import Datatable from "../../components/common/DatatableNew";
import type { Column } from "../../components/common/DatatableNew";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import { fetchtask, fetchTaskById, removeTask } from "../../slices/taskSlice";
import AddTask from "./AddTask";
import type { Task } from "../../api/taskApi";
import { toast } from "react-toastify";
import { FaEdit, FaTrash } from "react-icons/fa";
import Swal from "sweetalert2";
import { fetchDevices } from "../../slices/devicesSlice";
import Select from "react-select";
import "../../assets/css/task.css";
import { canWrite, canDelete } from "../../utils/permission";

const formatDate = (d: Date | string) => {
  const date = new Date(d);
  const yyyy = date.getFullYear();
  const MM = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");

  return `${yyyy}-${MM}-${dd}`;
};

const TaskModal = ({ open, onClose }: any) => {
  const dispatch = useAppDispatch();
  const { data, selected, totalRecords } = useAppSelector((s) => s.task);
  const devices = useAppSelector((s) => s.devices.devices);

  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);

  const [deviceId, setDeviceId] = useState<number>(0);

  const [isFilterApplied, setIsFilterApplied] = useState(false);

  const { permissions, loading } = useAppSelector((s) => s.auth);

  const canWriteTask = canWrite(permissions, "Task");
  const canDeleteTask = canDelete(permissions, "Task");

  const refresh = (applyFilterOverride?: boolean) => {
    const useFilter = applyFilterOverride ?? isFilterApplied;

    dispatch(
      fetchtask({
        page: page - 1,
        pageSize,
        search: useFilter ? search.trim() || "" : "",
        deviceId: useFilter ? deviceId : 0,
        start_time: useFilter ? fromDate || "" : "",
        end_time: useFilter ? toDate || "" : "",
      }),
    );
  };

  // Pagination State
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [search, setSearch] = useState("");

  //const [filterType, setFilterType] = useState("today");

  const getTodayRange = () => {
    const now = new Date();
    const from = new Date(now);
    const to = new Date(now);

    from.setHours(0, 0, 0, 0);
    to.setHours(23, 59, 59, 0);

    return { from, to };
  };

  const today = getTodayRange();

  const [fromDate, setFromDate] = useState(formatDate(today.from));
  const [toDate, setToDate] = useState(formatDate(today.to));

  const [filterType, setFilterType] = useState("all");

  const applyFilter = (type: string) => {
    const now = new Date();
    let from = new Date();
    let to = new Date();

    switch (type) {
      case "all":
        setFromDate("");
        setToDate("");
        return;
      case "today":
        from.setHours(0, 0, 0, 0);
        to.setHours(23, 59, 59, 0);
        break;

      case "yesterday":
        from.setDate(now.getDate() - 1);
        to.setDate(now.getDate() - 1);
        from.setHours(0, 0, 0, 0);
        to.setHours(23, 59, 59, 0);
        break;

      case "before2":
        from.setDate(now.getDate() - 2);
        from.setHours(0, 0, 0, 0);
        to = now;
        break;

      case "before3":
        from.setDate(now.getDate() - 3);
        from.setHours(0, 0, 0, 0);
        to = now;
        break;

      case "thisweek":
        from.setDate(now.getDate() - now.getDay());
        from.setHours(0, 0, 0, 0);
        to = now;
        break;

      case "lastweek":
        from.setDate(now.getDate() - now.getDay() - 7);
        to.setDate(now.getDate() - now.getDay() - 1);
        break;

      case "thismonth":
        from = new Date(now.getFullYear(), now.getMonth(), 1);
        to = now;
        break;

      case "lastmonth":
        from = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        to = new Date(now.getFullYear(), now.getMonth(), 0);
        break;
    }

    setFromDate(formatDate(from));
    setToDate(formatDate(to));
  };

  useEffect(() => {
    if (open) {
      dispatch(fetchDevices());

      // ✅ Reset everything (NO filters)
      setIsFilterApplied(false);
      setFilterType("all"); // keep UI same if you want
      setFromDate("");
      setToDate("");
      setDeviceId(0);
      setSearch("");
      setPage(1);


    }
  }, [open]);

  useEffect(() => {
    if (editOpen && editId) {
      dispatch(fetchTaskById(editId));
    }
  }, [editOpen, editId]);
  const resetFilters = () => {
    setIsFilterApplied(false);
    setFilterType("all");
    setFromDate("");
    setToDate("");
    setDeviceId(0);
    setSearch("");
    setPage(1);
    setPageSize(25);
  };

  const handleClose = () => {
    resetFilters();
    onClose();
  };
  const handleDelete = async (id: number) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "This task will be permanently deleted",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it",
    });

    if (!result.isConfirmed) return;

    try {
      await dispatch(removeTask(id)).unwrap();
      toast.success("task deleted");
      refresh();
    } catch {
      toast.error("Delete failed");
    }
  };
  const deviceOptions = [
    { value: 0, label: "All Objects" },
    ...devices.map((d) => ({
      value: d.id,
      label: d.name,
    })),
  ];
  //------------------------Filter---------------------

  const columns: Column<Task>[] = [
    { key: "name", label: "Name" },
    { key: "device_name", label: "Object" },
    { key: "pickup_address", label: "Pickup Address" },
    { key: "delivery_address", label: "Delivery Address" },
    {
      key: "priority",
      label: "Priority",
      render: (row: any) => {
        const priority = row.priority?.toLowerCase();

        let className = "priority-badge";

        if (priority === "low") className += " priority-low";
        else if (priority === "medium") className += " priority-medium";
        else if (priority === "high") className += " priority-high";

        return (
          <span className={className}>
            {row.priority}
          </span>
        );
      },
    },
    {
      key: "status",
      label: "Status",
      render: (row: any) => {
        const status = row.status?.toLowerCase();

        let className = "taskstatusbadge";

        if (status === "pending") className += " taskstatusbadge-pending";
        else if (status === "inprogress") className += " taskstatusbadge-progress";
        else if (status === "completed") className += " taskstatusbadge-completed";

        return (
          <span className={className}>
            {row.status}
          </span>
        );
      },
    }, ...(canWriteTask || canDeleteTask
      ? [
        {
          key: "action" as const,
          label: "Action",
          render: (row: any) => (
            <div style={{ display: "flex", gap: 10 }}>
              {canWriteTask && (
                <FaEdit
                  style={{ cursor: "pointer", color: "#2563eb" }}
                  onClick={() => {
                    setEditId(row.id);
                    setEditOpen(true);
                  }}
                />
              )}
              {canDeleteTask && (
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
        title="Tasks"
        onClose={handleClose}
        showAddButton={!loading && canWriteTask}
        onAddClick={() => {
          if (!loading && canWriteTask) {
            setAddOpen(true);
          }
        }}
        size="fullscreen"
      >
        {/* ✅ FILTER BAR */}
        <div className="task-filter-card">
          <div className="task-filter-grid">
            <div className="task-field-wrap">
              {" "}
              <label>Object</label>
              <Select
                classNamePrefix="device-select"
                options={deviceOptions}
                placeholder="Search Object..."
                isSearchable
                components={{ IndicatorSeparator: () => null }}
                value={deviceOptions.find((o) => o.value === deviceId)}
                onChange={(selected) =>
                  setDeviceId(selected ? selected.value : 0)
                }

                /* ✅ ADD THESE 2 LINES */
                menuPortalTarget={document.body}
                menuPosition="fixed"
              />
            </div>
            <div className="task-field-wrap">
              {" "}
              <label>Filter</label>
              <Select
                classNamePrefix="device-select"
                options={[
                  { value: "all", label: "All" },
                  { value: "today", label: "Today" },
                  { value: "yesterday", label: "Yesterday" },
                  { value: "before2", label: "Before 2 days" },
                  { value: "before3", label: "Before 3 days" },
                  { value: "thisweek", label: "This week" },
                  { value: "lastweek", label: "Last week" },
                  { value: "thismonth", label: "This month" },
                  { value: "lastmonth", label: "Last month" },
                ]}
                value={{
                  value: filterType,
                  label:
                    filterType === "all" ? "All" :
                      filterType === "today" ? "Today" :
                        filterType === "yesterday" ? "Yesterday" :
                          filterType === "before2" ? "Before 2 days" :
                            filterType === "before3" ? "Before 3 days" :
                              filterType === "thisweek" ? "This week" :
                                filterType === "lastweek" ? "Last week" :
                                  filterType === "thismonth" ? "This month" :
                                    "Last month",
                }}
                onChange={(selected) => {
                  const type = selected?.value || "all";
                  setFilterType(type);
                  applyFilter(type);
                }}
                isSearchable={false}
                components={{ IndicatorSeparator: () => null }}

                /* same fix as Object */
                menuPortalTarget={document.body}
                menuPosition="fixed"
              />
            </div>
            <div className="task-field-wrap">
              {" "}
              <label>From</label>
              <input
                type="date"
                className="task-field"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
              />
            </div>
            <div className="task-field-wrap">
              {" "}
              <label>To</label>
              <input
                type="date"
                className="task-field"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="task-btn-wrap">
          <button
            className="task-btn-blue"
            onClick={() => {
              setIsFilterApplied(true);
              setPage(1);
              refresh(true);   // ✅ force filter on first click
            }}
          >
            Apply Filter
          </button>
        </div>

        {/* ✅ TABLE */}
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
        title="Add task"
        size="fullscreen"
        onClose={() => setAddOpen(false)}
      >
        <AddTask
          onClose={() => setAddOpen(false)}
          onSuccess={() => {
            setAddOpen(false);
            refresh();
          }}
        />
      </Modal>

      <Modal
        isOpen={editOpen}
        title="Update task"
        size="fullscreen"
        onClose={() => setEditOpen(false)}
      >
        {selected && (
          <AddTask
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

export default TaskModal;
