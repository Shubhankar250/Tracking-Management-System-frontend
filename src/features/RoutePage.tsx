import React, { useEffect, useState } from "react";
import RouteForm from "./RouteForm";
import RouteGroupModal from "./RouteGroupModal";
import { getAllRouteGroups } from "../api/routeService";
import type { RoutesDTO } from "../api/routeService";
import "../assets/css/route.css";
import type { AppDispatch, RootState } from "../redux/store";
import { useDispatch, useSelector } from "react-redux";
import {
  createRouteThunk,
  deleteRouteThunk,
  fetchRoutes,
  updateRouteThunk,
} from "../slices/routesSlice";

import { FaEdit, FaTrash } from "react-icons/fa";
import Datatable, { type Column } from "../components/common/DatatableNew";
import { useAppSelector } from "../redux/hooks";
import { canWrite, canDelete } from "../utils/permission";


type RouteFormData = Omit<RoutesDTO, "geom" | "bufferGeom">;

interface Props {
  onStartDraw: () => void;
  onStopDraw: () => void;
  geom?: any;
  onZoomRoute: (r: RoutesDTO) => void;
}

const RoutePage: React.FC<Props> = ({
  onStartDraw,
  onStopDraw,
  geom,
  onZoomRoute,
}) => {
  const dispatch: AppDispatch = useDispatch();
  const routes = useSelector((state: RootState) => state.routes.routes);

  const [editing, setEditing] = useState<RoutesDTO | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [routeGroups, setRouteGroups] = useState<string[]>([]);

  const [editingGeom, setEditingGeom] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  // Datatable state
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
    const { permissions } = useAppSelector((s) => s.auth);
    const canWriteRoute = canWrite(permissions, "Route");
    const canDeleteRoute = canDelete(permissions, "Route");

  // Load route groups
  const loadRouteGroups = async () => {
    const res = await getAllRouteGroups();
    setRouteGroups(Object.values(res.data));
  };

  const { totalItems } = useSelector((state: RootState) => state.routes);

  useEffect(() => {
    dispatch(
      fetchRoutes({
        page: page - 1,
        size: pageSize,
        search,
      }),
    );
  }, [dispatch, page, pageSize, search]);

  useEffect(() => {
    loadRouteGroups();
  }, []);

  // Submit Route
  const handleSubmit = async (data: RouteFormData) => {
    if (!data.id && !geom) {
      alert("Please draw a route on the map first");
      return;
    }

    const finalGeom = geom ? JSON.stringify(geom) : editingGeom;
   
    if (!finalGeom) {
      alert("Route geometry missing");
      return;
    }

    const payload: RoutesDTO = {
      ...data,
      geom: finalGeom,
    };

    try {
      if (data.id) {
        await dispatch(updateRouteThunk(payload)).unwrap();
      } else {
        await dispatch(createRouteThunk(payload)).unwrap();
      }

      setShowForm(false);
      setEditing(null);
      setEditingGeom(null);
      onStopDraw();
      dispatch(
        fetchRoutes({
          page: page - 1,
          size: pageSize,
          search,
        }),
      );
    } catch (err) {
      console.error("Route save failed:", err);
    }
  };

  // Delete Route
  const handleDelete = async (id?: number) => {
    if (!id || !window.confirm("Delete this route?")) return;
    await dispatch(deleteRouteThunk(id)).unwrap();
    dispatch(
      fetchRoutes({
        page: page - 1,
        size: pageSize,
        search,
      }),
    );
  };

  // Datatable Columns
  const columns: Column<RoutesDTO>[] = [
    {
      key: "name",
      label: "Name",
    },
      ...(canWriteRoute || canDeleteRoute
    ? [
    {
      key: "action" as const,
      label: "Action",
      render: (r : RoutesDTO) => (
        <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
          {canWriteRoute && (
          <FaEdit
            style={{ cursor: "pointer", color: "#2563eb" }}
            onClick={(e) => {
              e.stopPropagation();
              onZoomRoute(r);
              setEditing(r);
              setEditingGeom(r.geom);
              setShowForm(true);
              onStartDraw();
            }}
          />
          )}
          {canDeleteRoute&& (
          <FaTrash
            style={{ cursor: "pointer", color: "#dc2626" }}
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(r.id);
            }}
          />
          )}
        </div>
      ),
    },
    ]
    : []),
  ];

  return (
    <div className="route-container">

      <style>
{`
/* 🎯 Stack footer vertically */
.route-container .datatable-footer {
  display: flex !important;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: 12px;
}

/* 🎯 Center text */
.route-container .datatable-info {
  text-align: center;
  font-size: 13px;
}

/* 🎯 Center pagination */
.route-container .pagination {
  display: flex;
  justify-content: center;
  gap: 6px;
}

/* 🎯 Smaller buttons */
.route-container .page-link {
  min-width: 30px;
  height: 30px;
  padding: 0 8px;
  font-size: 12px;
}
`}
</style>
      {/* HEADER */}
      <div className="route-header">
        {!showForm && canWriteRoute && (
          <button
            className="route-plus-btndatatable"
            onClick={() => {
              setEditing(null);
              setShowForm(true);
              onStartDraw();
            }}
          >
            <i className="fas fa-plus"></i>
          </button>
        )}
      </div>

      {/* FORM */}
      {showForm ? (
        <RouteForm
  initialData={editing ?? undefined}
  routeGroups={routeGroups}
  onSubmit={handleSubmit}
geom={geom} 
  onCancel={() => {
    setShowForm(false);
    setEditing(null);

    onStopDraw(); // ✅ stop drawing
  
    dispatch(
      fetchRoutes({
        page: page - 1,
        size: pageSize,
        search,
      })
    ); // ✅ reload routes
    
  }}
  onOpenRouteGroup={() => setShowGroupModal(true)}
  onShapeSelect={(type) => {
    if (type === null) {
      onStopDraw();   // ✅ reset draw
    } else {
      onStartDraw();  // ✅ start draw
    }
  }}
/>
      ) : (
        <>
          {/* DATATABLE */}
          <Datatable<RoutesDTO>
            columns={columns}
            data={routes}
            totalRecords={totalItems}
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
            onRowClick={(row) => onZoomRoute(row)}
          />
        </>
      )}

      {/* GROUP MODAL */}
      <RouteGroupModal
        show={showGroupModal}
        onHide={() => setShowGroupModal(false)}
        onSaveSuccess={loadRouteGroups}
      />
    </div>
  );
};

export default RoutePage;
