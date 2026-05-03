import { useEffect, useState } from "react";
import Datatable from "../../components/common/DatatableNew";
import type { Column } from "../../components/common/DatatableNew";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import {
  fetchSoftwareReleases,
  removeSoftwareRelease,
} from "../../slices/softwareSlice";
import { FaEdit, FaTrash } from "react-icons/fa";
import Swal from "sweetalert2";
import { toast } from "react-toastify";
import SoftwareReleaseForm from "./SoftwareReleaseForm";
import type { SoftwareRelease } from "../../api/software.api";

const SoftwareReleasePage = () => {
  const dispatch = useAppDispatch();
  const { data, totalRecords } = useAppSelector((s) => s.software);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [search, setSearch] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedData, setSelectedData] = useState<SoftwareRelease>();

  const refresh = () => {
    dispatch(
      fetchSoftwareReleases({
        page,
        pageSize,
        search,
      }),
    );
  };

  useEffect(() => {
    refresh();
  }, [page, pageSize, search]);

  const handleDelete = async (id: number) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "Software release will be deleted",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes delete",
    });

    if (!result.isConfirmed) return;

    try {
      await dispatch(removeSoftwareRelease(id)).unwrap();
      toast.success("Deleted successfully");
      refresh();
    } catch {
      toast.error("Delete failed");
    }
  };

  const columns: Column<SoftwareRelease>[] = [
   {
  key: "date",
  label: "DATE",
  render: (row) => {
    if (!row.date) return "-";

    const d = new Date(row.date);

    const formatted =
      d.getDate().toString().padStart(2, "0") +
      "-" +
      (d.getMonth() + 1).toString().padStart(2, "0") +
      "-" +
      d.getFullYear();

    return formatted;
  },
},
    { key: "text", label: "RELEASE NOTE" },

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
            onClick={() => handleDelete(row.id)}
          />
        </div>
      ),
    },
  ];

  return (
    <>
      {modalOpen && (
        <SoftwareReleaseForm
          onClose={() => {
            setModalOpen(false);
            setSelectedData(undefined);
          }}
          editData={selectedData}
          onSuccess={refresh}
        />
      )}

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

      <Datatable
        columns={columns}
        data={data}
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
    </>
  );
};

export default SoftwareReleasePage;