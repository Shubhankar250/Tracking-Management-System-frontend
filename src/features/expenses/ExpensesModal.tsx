import { useEffect, useState } from "react";
import Modal from "../../components/common/Modal";
import Datatable from "../../components/common/DatatableNew";
import type { Column } from "../../components/common/DatatableNew";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import {
  fetchExpenses,
  fetchExpenseById,
  removeExpense,
} from "../../slices/expensesSlice";
import AddExpenseForm from "./AddExpenseForm";
import type { Expense } from "../../api/expenses.api";
import { toast } from "react-toastify";
import { FaEdit, FaTrash } from "react-icons/fa";
import Swal from "sweetalert2";
import { fetchDevices } from "../../slices/devicesSlice";
import { canWrite, canDelete } from "../../utils/permission";

const ExpensesModal = ({ open, onClose }: any) => {
  const dispatch = useAppDispatch();
  const { data, selected, totalRecords } = useAppSelector((s) => s.expenses);

  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);

  // Pagination State
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [search, setSearch] = useState("");

  const { permissions, loading } = useAppSelector((s) => s.auth);

  const canWriteExpense = canWrite(permissions, "Expense");
  const canDeleteExpense = canDelete(permissions, "Expense");
  const refresh = () => {
    dispatch(fetchExpenses({ page, pageSize, search }));
  };

  useEffect(() => {
    if (open) {
      dispatch(fetchDevices());
      refresh();
    }
  }, [open]);

  useEffect(() => {
    if (editOpen && editId) {
      dispatch(fetchExpenseById(editId));
    }
  }, [editOpen, editId]);

  const handleDelete = async (id: number) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "This expense will be permanently deleted",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it",
    });

    if (!result.isConfirmed) return;

    try {
      await dispatch(removeExpense(id)).unwrap();
      toast.success("Expense deleted");
      refresh();
    } catch {
      toast.error("Delete failed");
    }
  };

  const columns: Column<Expense>[] = [
    { key: "date", label: "Date" },
    { key: "expenseName", label: "Expense" },
    { key: "deviceName", label: "Device Name" },
    { key: "quantity", label: "Quantity" },
    { key: "cost", label: "Cost" },
    { key: "buyer", label: "Buyer" },
    { key: "supplier", label: "Supplier" },
    ...(canWriteExpense || canDeleteExpense
      ? [
          {
            key: "action" as const,
            label: "Action",
            render: (row: any) => (
              <div style={{ display: "flex", gap: 10 }}>
                {canWriteExpense && (
                  <FaEdit
                    style={{ cursor: "pointer", color: "#2563eb" }}
                    onClick={() => {
                      setEditId(row.id);
                      setEditOpen(true);
                    }}
                  />
                )}
                {canDeleteExpense && (
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
        title="Expenses"
        onClose={onClose}
        showAddButton={!loading && canWriteExpense}
        onAddClick={() => {
          if (!loading && canWriteExpense) {
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
            setPage(1); // reset to first page when size changes
          }}
          onFetch={refresh}
        />
      </Modal>

      <Modal
        isOpen={addOpen}
        title="Add Expense"
        size="large"
        onClose={() => setAddOpen(false)}
      >
        <AddExpenseForm
          onClose={() => setAddOpen(false)}
          onSuccess={() => {
            setAddOpen(false);
            refresh();
          }}
        />
      </Modal>

      <Modal
        isOpen={editOpen}
        title="Update Expense"
        size="large"
        onClose={() => setEditOpen(false)}
      >
        {selected && (
          <AddExpenseForm
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

export default ExpensesModal;
