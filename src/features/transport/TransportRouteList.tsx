import React, { useEffect, useState } from "react";
import { FaEdit } from "react-icons/fa";

import Modal from "../../components/common/Modal";
import "../../assets/css/Transportroute.css";
import RouteWizardModal from "./RouteWizardModal";
import Datatable, { type Column } from "../../components/common/DatatableNew";

import { useDispatch, useSelector } from "react-redux";
import { fetchRoutesPlanner } from "../../slices/transportPlannerSlice";
import type { AppDispatch, RootState } from "../../redux/store";

interface Props {
  open: boolean;
  onClose: () => void;
}

const TransportRouteList: React.FC<Props> = ({ open, onClose }) => {
  const dispatch = useDispatch<AppDispatch>();

  const { routes, totalElements, loading } = useSelector(
    (state: RootState) => state.planner,
  );

  const [wizardOpen, setWizardOpen] = useState(false);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [typeFilter, setTypeFilter] = useState("");
  const [selectedRouteId, setSelectedRouteId] = useState<number | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1); // reset page on search
    }, 400);

    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    if (!open) return;

    dispatch(
      fetchRoutesPlanner({
        page: page - 1,
        size: pageSize,
        search: debouncedSearch,
        routeType: typeFilter,
      }),
    );
  }, [open, page, pageSize, debouncedSearch, typeFilter, dispatch]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (open) window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [open, onClose]);

  if (!open) return null;

  const columns: Column<any>[] = [
    {
      key: "routeName",
      label: "Route Name",
      render: (row) => row.routeName,
      //<span>Route ID: {row.routeId}</span>
    },
    { key: "shiftName", label: "Shift" },
    {
      key: "routeType",
      label: "Type",
      render: (row) => (
        <span className="rt-badge primary">{row.routeType}</span>
      ),
    },
    { key: "defaultVehicleName", label: "Vehicle" },
    {
      key: "stops",
      label: "Stops",
      render: (row) => row.stops?.length || 0,
    },
    {
      key: "passengers",
      label: "Passengers",
      render: (row) =>
        row.stops?.reduce(
          (sum: number, s: any) => sum + (s.passengerCount || 0),
          0,
        ),
    },
    { key: "sourceType", label: "Source" },
    {
      key: "status",
      label: "Status",
      render: () => <span className="rt-badge success">Active</span>,
    },
    {
      key: "action",
      label: "Action",
      render: (row) => (
        <div className="rt-row-actions">
          <FaEdit
            style={{ cursor: "pointer", color: "#2563eb" }}
            onClick={() => {
              setSelectedRouteId(row.routeId);
              setWizardOpen(true);
            }}
          />
        </div>
      ),
    },
  ];
  return (
    <Modal
      isOpen={open}
      title="Routes List"
      onClose={onClose}
      size="fullscreen"
    >
      <div className="rt-body">
        {/* TOPBAR */}
        <div className="rt-topbar">
          <div className="rt-topbar-inner">
            {/* LEFT */}
            <div className="rt-left">
              <h3 className="rt-title">Routes</h3>
              <p className="rt-subtitle">Manage and monitor transport routes</p>
            </div>

            {/* RIGHT */}
            <div className="rt-right">
              <div className="rt-filters">
                <select
                  className="trw-select"
                  value={typeFilter}
                  onChange={(e) => {
                    setTypeFilter(e.target.value);
                    setPage(1);
                  }}
                >
                  <option value="">All Types</option>
                  <option value="Pickup">Pickup</option>
                  <option value="Drop">Drop</option>
                </select>

                <button
                  className="rt-btn rt-btn-secondary rt-btn-sm"
                  onClick={() => {
                    setSearch("");
                    setTypeFilter("");
                    setPage(1);
                  }}
                >
                  Reset
                </button>
              </div>

              <button
                className="rt-btn rt-btn-primary"
                onClick={() => setWizardOpen(true)}
              >
                + New Route
              </button>
            </div>
          </div>
        </div>

        {/* TABLE */}
        <Datatable
          columns={columns}
          data={routes}
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
          loading={loading}
        />

        {/* MODAL */}
        <RouteWizardModal
          isOpen={wizardOpen}
          onClose={() => {
            setWizardOpen(false);
            setSelectedRouteId(null);
          }}
          routeId={selectedRouteId}
          onSuccess={() => {
            dispatch(
              fetchRoutesPlanner({
                page: page - 1,
                size: pageSize,
                search: debouncedSearch,
                routeType: typeFilter,
              }),
            );
          }}
        />
      </div>
    </Modal>
  );
};

export default TransportRouteList;
