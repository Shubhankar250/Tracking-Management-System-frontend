import React, { useEffect, useState } from "react";
import { useAppSelector, useAppDispatch } from "../../redux/hooks";
import Datatable from "../../components/common/DatatableNew";
import type { Column } from "../../components/common/DatatableNew";
import { removeReport, fetchReports } from "../../slices/reportSlice";
import type { ReportDTO } from "../../slices/reportSlice";
import { FaEdit, FaTrash } from "react-icons/fa";
import Swal from "sweetalert2";
import "../../assets/css/report-modal.css";
  import { canWrite, canDelete } from "../../utils/permission";


interface Props {
  onEdit?: (id: number) => void; 
}

const GeneratedTab: React.FC<Props> = ({ onEdit }) => {
  const dispatch = useAppDispatch();
  const { reports } = useAppSelector((state) => state.reports);

  // server-driven state
  const [page, setPage] = useState(1);      // UI page (1-based)
  const [pageSize, setPageSize] = useState(25);
  const [search, setSearch] = useState("");

const { permissions } = useAppSelector((s) => s.auth);

const canWriteReport = canWrite(permissions, "Report");
const canDeleteReport = canDelete(permissions, "Report");

  // fetch from server
  useEffect(() => {
    dispatch(
      fetchReports({
        page: page - 1, // backend is 0-based
        size: pageSize,
        search: search,
      })
    );
  }, [dispatch, page, pageSize, search]);

  // delete with confirmation
 const handleDelete = async (id: number) => {
  const res = await Swal.fire({
    title: "Are you sure?",
    text: "This report will be permanently deleted!",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Yes, delete it",
    cancelButtonText: "Cancel",
  });

  if (res.isConfirmed) {
    try {
      await dispatch(removeReport(id)).unwrap(); // ✅ wait for API
      Swal.fire("Deleted!", "Report has been deleted.", "success");
    } catch (error) {
      console.error("Delete failed:", error);
      Swal.fire("Error", "Delete failed from server!", "error");
    }
  }
};
const formatDateTime = (dateStr?: string) => {
  if (!dateStr) return "-";

  const date = new Date(dateStr);

  const pad = (n: number) => String(n).padStart(2, "0");

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} `
       + `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}; 
  const columns: Column<ReportDTO>[] = [
    { key: "title", label: "TITLE" },
    { key: "reportType", label: "TYPE" }, 
    { key: "outputFormat", label: "FORMAT" }, 
     // ✅ NEW
  { key: "sheduleReportType", label: "SCHEDULE TYPE" },

  // ✅ NEW (formatted date)
  {
    key: "createdAt",
    label: "CREATED AT",
    render: (row) => formatDateTime(row.createdAt),
   
  },
    ...(canWriteReport || canDeleteReport
    ? [
    {
      key: "action" as const,
      label: "ACTION",
      render: (row : ReportDTO) => (
        <div style={{ display: "flex", gap: 10 }}>
          {canWriteReport && onEdit && row.id && (
          <FaEdit
            style={{ cursor: "pointer", color: "#2563eb" }}
            onClick={() => row.id && onEdit(row.id)}
          />
          )}
          <FaTrash
            style={{ cursor: "pointer", color: "#dc2626" }}
            onClick={() => row.id && handleDelete(row.id)}
          />
        </div>
      ),
    },
     ]
    : []),
  ];

  return (
    <Datatable
      columns={columns}
      data={reports?.content ?? []}
      totalRecords={reports?.totalElements ?? 0}
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

export default GeneratedTab;