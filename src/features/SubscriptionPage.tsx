import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import AddUpdateSubscriptionModal from "./AddUpdateSubscriptionModal";

import {
  fetchCountries,
  fetchSubscriptions,
  fetchSubscriptionById,
  clearSelectedSubscription,
  clearMessage,
} from "../slices/subscriptionSlice";

import type { AppDispatch, RootState } from "../redux/store";
import Modal from "../components/common/Modal";
import Datatable, { type Column } from "../components/common/DatatableNew";
import { FaEdit } from "react-icons/fa";
import { useAppSelector } from "../redux/hooks";
import { canWrite } from "../utils/permission";

interface Props {
  open: boolean;
  onClose: () => void;
}

const SubscriptionPage: React.FC<Props> = ({ open, onClose }) => {
  const dispatch = useDispatch<AppDispatch>();

  const { list, countries, totalElements } = useSelector(
    (state: RootState) => state.subscription,
  );

  const [page, setPage] = useState(1); // local UI page (1-based)
  const [search, setSearch] = useState("");
  const [pageSize, setPageSize] = useState(25);

  const [formModalOpen, setFormModalOpen] = useState(false);
  const { permissions, loading } = useAppSelector((s) => s.auth);
  const canWriteSubscription = canWrite(permissions, "Subscription");

  /* ===== INITIAL LOAD ===== */
  useEffect(() => {
    if (open) {
      dispatch(fetchCountries());
      dispatch(fetchSubscriptions({ page: 0, size: pageSize, search }));
      dispatch(clearMessage());
      setPage(1);
    }
  }, [open, dispatch]); // ✅ removed message dependency

  /* ===== PAGE CHANGE ===== */
  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    dispatch(
      fetchSubscriptions({
        page: newPage - 1,
        size: pageSize,
        search,
      }),
    );
  };

  /* ===== PAGE SIZE CHANGE ===== */
  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setPage(1);
    dispatch(
      fetchSubscriptions({
        page: 0,
        size: size, // ✅ use new size directly
        search,
      }),
    );
  };

  /* ===== SEARCH ===== */
  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
    dispatch(
      fetchSubscriptions({
        page: 0,
        size: pageSize,
        search: value,
      }),
    );
  };

  const handleCloseModal = () => {
    setFormModalOpen(false);
    dispatch(fetchSubscriptions({ page: page - 1, size: pageSize, search }));
  };
  /* ===== OPEN ADD ===== */
  const openAddModal = () => {
    dispatch(clearSelectedSubscription());
    setFormModalOpen(true);
  };

  /* ===== OPEN EDIT ===== */
  const openEditModal = (id: number) => {
    dispatch(fetchSubscriptionById(id));
    setFormModalOpen(true);
  };

  /* ===== DATATABLE COLUMNS ===== */
  const columns: Column<any>[] = [
    {
      key: "countrySubId",
      label: "Country",
      render: (row) => countries[row.countrySubId] ?? "-",
    },
    {
      key: "subDetails",
      label: "Details",
    },
    {
      key: "subPoints",
      label: "Points",
    },
    {
      key: "totalAmount",
      label: "Total Amount",
    },
    {
      key: "discount",
      label: "Discount",
    },
    ...(canWriteSubscription
      ? [
          {
            key: "action",
            label: "Action",
            render: (row: any) => (
              <>
                {canWriteSubscription && (
                  <FaEdit
                    style={{ cursor: "pointer", color: "#2563eb" }}
                    onClick={() => openEditModal(row.id)}
                  />
                )}
              </>
            ),
          },
        ]
      : []),
  ];

  return (
    <>
      {/* ===== MAIN MODAL ===== */}
      <Modal
        isOpen={open}
        onClose={onClose}
        title="Subscriptions"
        size="large"
        draggable
        showAddButton={!loading && canWriteSubscription}
        onAddClick={openAddModal}
      >
        <Datatable
          columns={columns}
          data={list}
          totalRecords={totalElements}
          pageSize={pageSize}
          page={page}
          search={search}
          onPageChange={handlePageChange}
          onSearchChange={handleSearchChange}
          onPageSizeChange={handlePageSizeChange}
        />
      </Modal>

      {/* ===== ADD / EDIT MODAL ===== */}
      {formModalOpen && (
        <AddUpdateSubscriptionModal
          isOpen={formModalOpen}
          onClose={handleCloseModal}
        />
      )}
    </>
  );
};

export default SubscriptionPage;
