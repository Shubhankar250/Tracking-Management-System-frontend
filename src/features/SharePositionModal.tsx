import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import DatatableNew, { type Column } from "../components/common/DatatableNew";
import Modal from "../components/common/Modal";
import AddUpdateShareModal from "./AddUpdateShareModal";
import { fetchShares, deleteShareThunk } from "../slices/sharePositionSlice";
import { closeModal, openModal } from "../slices/uiSlice";
import { FaEdit, FaTrash } from "react-icons/fa";
import Swal from "sweetalert2";

const SharePositionPage = ({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) => {
  const dispatch = useAppDispatch();
  const { list, totalElements } = useAppSelector(
    (s) => s.sharePosition
  );

  const [formModalOpen, setFormModalOpen] = useState(false);
  const [selectedShare, setSelectedShare] = useState<any>(null);

  /* ======================
     PAGINATION STATE
  ====================== */

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [search, setSearch] = useState("");

  const refresh = () => {
    dispatch(
      fetchShares({
        page: page - 1, // backend zero-based
        size: pageSize,
        search: search || "",
      })
    );
  };

  useEffect(() => {
    if (open) refresh();
  }, [open, page, pageSize, search]);

  useEffect(() => {
    if (open) dispatch(openModal());
    else dispatch(closeModal());
  }, [open, dispatch]);

  const openAddModal = () => {
    setSelectedShare(null);
    setFormModalOpen(true);
  };

  const openEditModal = (share: any) => {
    setSelectedShare(share);
    setFormModalOpen(true);
  };

  const handleClose = () => {
    dispatch(closeModal());
    onClose();
  };

  const handleDelete = async (id: number) => {
    const res = await Swal.fire({
      title: "Are you sure?",
      text: "This share will be permanently deleted!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it",
    });

    if (!res.isConfirmed) return;

    await dispatch(deleteShareThunk(id));
    Swal.fire("Deleted!", "Share deleted successfully.", "success");
    refresh();
  };

  /* ======================
     TABLE COLUMNS
  ====================== */

  const columns: Column<any>[] = [
    { key: "name", label: "Name" },
    { key: "deviceName", label: "Objects" },
    {
      key: "baseUrl",
      label: "URL",
      render: (row: any) => (
        <span
          style={{
            color: "blue",
            textDecoration: "underline",
            cursor: "pointer",
          }}
          onClick={() =>
            window.open("/weblive?uc=" + row.accessCode, "_blank")
          }
        >
          {row.baseUrl}
        </span>
      ),
    },
    { key: "accessStartTime", label: "Start Time" },
    { key: "accessEndTime", label: "End Time" },
    {
      key: "action",
      label: "Action",
      render: (row) => (
        <div style={{ display: "flex", gap: 10 }}>
          <FaEdit
            style={{ cursor: "pointer", color: "#2563eb" }}
            onClick={() => openEditModal(row)}
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
      <Modal
        isOpen={open}
        title="Share Positions"
        size="large"
        onClose={handleClose}
        showAddButton
        onAddClick={openAddModal}
      >
        <div className="modal-body-flex">
          <div className="modal-content-scroll">

            {/* TABLE */}
            <DatatableNew
              columns={columns}
              data={list}
              totalRecords={totalElements}
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

      
        </div>
      </Modal>

      {formModalOpen && (
        <AddUpdateShareModal
          isOpen={formModalOpen}
          onClose={() => setFormModalOpen(false)}
          shareToEdit={selectedShare}
        />
      )}
    </>
  );
};

export default SharePositionPage;