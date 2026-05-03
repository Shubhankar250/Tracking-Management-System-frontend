import React, { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import Datatable from "../../components/common/DatatableNew";
import type { Column } from "../../components/common/DatatableNew";
import { fetchReportLogs, removeReportLog } from "../../slices/reportSlice";
import "../../assets/css/report-modal.css";
import { FaTrash } from "react-icons/fa";
import Swal from "sweetalert2";

interface ScheduleReport {
  logId: number;
  scheduleId: number;
  title: string;
  reportType: string;
  outputFormat: string;
  startedAt: string;
  completedAt: string;
  status: string;
  fileSize?:string
  sheduleReportType?:string

}

const ScheduleTab: React.FC = () => {
  const dispatch = useAppDispatch();
  const { logs } = useAppSelector((state) => state.reportLogs);

  // datatable state
  const [page, setPage] = useState(1); // UI is 1-based
  const [pageSize, setPageSize] = useState(25);
  const [search, setSearch] = useState("");

  // fetch logs (server-side pagination)
  useEffect(() => {
    dispatch(fetchReportLogs({ page: page - 1, size: pageSize, search: search }));
  }, [dispatch, page, pageSize, search]);

  // delete with confirmation
  const handleDelete = async (id: number) => {
    const res = await Swal.fire({
      title: "Are you sure?",
      text: "This scheduled report log will be permanently deleted!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it",
      cancelButtonText: "Cancel",
    });

    if (res.isConfirmed) {
      dispatch(removeReportLog(id));
      Swal.fire("Deleted!", "Report log has been deleted.", "success");
    }
  };
const formatDateTime = (dateStr?: string) => {
  if (!dateStr) return "-";

  const date = new Date(dateStr);

  const pad = (n: number) => String(n).padStart(2, "0");

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} `
       + `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
};
  const columns: Column<ScheduleReport>[] = [
    {
      key: "title",
      label: "TITLE",
      render: (row) => (
        <div style={{ whiteSpace: "normal", lineHeight: "1.4" }}>{row.title}</div>
      ),
    },
    {
      key: "reportType",
      label: "TYPE",
      render: (row) => (
        <div style={{ whiteSpace: "normal", wordBreak: "break-word" }}>{row.reportType}</div>
      ),
    },
    { key: "outputFormat", label: "FORMAT" },
    {key:"sheduleReportType",label:"SCHEDULE TYPE"},
    { key: "fileSize", label: "FILE SIZE" },
   {
  key: "startedAt",
  label: "STARTED AT",
  render: (row) => formatDateTime(row.startedAt),
},
{
  key: "completedAt",
  label: "COMPLETED AT",
  render: (row) => formatDateTime(row.completedAt),
},
    {
      key: "status",
      label: "IS SEND",
      render: (row) => {
  const isSuccess = row.status === "SUCCESS";

  return (
    <span
      style={{
        color: isSuccess ? "green" : "red",
        fontWeight: 600,
      }}
    >
      {isSuccess ? "YES" : "NO"}
    </span>
  );
},
    },
    {
      key: "action",
      label: "ACTION",
      render: (row) => (
        <div style={{ display: "flex", gap: 10 }}>
          <FaTrash
            style={{ cursor: "pointer", color: "#dc2626" }}
            onClick={() => handleDelete(row.logId)}
          />
        </div>
      ),
    },
  ];

  return (
    <Datatable
      columns={columns}
      data={logs?.content ?? []}
      totalRecords={logs?.totalElements ?? 0}
      page={page}
      pageSize={pageSize}
      search={search}
      onPageChange={setPage}
      onPageSizeChange={(s) => {
        setPageSize(s);
        setPage(1);
      }}
      onSearchChange={(s) => {
        setSearch(s);
        setPage(1);
      }}
    />
  );
};

export default ScheduleTab;