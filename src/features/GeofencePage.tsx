import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "../redux/store";

import Datatable from "../components/common/DatatableNew";
import type { Column } from "../components/common/DatatableNew";
import GeofenceForm from "./GeofenceForm";
import GeoGroupModal from "./GeoGroupModal";
import type { GeofenceDTO } from "../api/geofenceService";

import {
  fetchGeofences,
  fetchGeoGroups,
  createGeofenceThunk,
  updateGeofenceThunk,
  deleteGeofenceThunk,
} from "../slices/geofenceSlice";

import "../assets/css/geofence.css";
import { FaEdit, FaTrash } from "react-icons/fa";
import { useAppSelector } from "../redux/hooks";
import { canDelete, canWrite } from "../utils/permission";

interface GeofencePageProps {
  onShapeSelect: (type: "circle" | "polygon" | null) => void;
  geom?: any; // drawn geometry
  radius?: number | null; // circle radius
  onZoom: (g: any) => void;
  onEditStart: (g: any) => void;
}

const GeofencePage: React.FC<GeofencePageProps> = ({
  onShapeSelect,
  geom,
  radius,
  onZoom,
  onEditStart,
}) => {
  const dispatch: AppDispatch = useDispatch();

  const [editing, setEditing] = useState<
    (GeofenceDTO & { id?: number }) | null
  >(null);

  /* Pagination & Search */
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [search, setSearch] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [showGroupModal, setShowGroupModal] = useState(false);

  const geofences = useSelector((state: RootState) => state.geofence.geofences);
  const geoGroupsObj = useSelector(
    (state: RootState) => state.geofence.geoGroups,
  );
  const loading = useSelector((state: RootState) => state.geofence.loading);
  const error = useSelector((state: RootState) => state.geofence.error);

  const geoGroups = Object.values(geoGroupsObj);
  const { permissions } = useAppSelector((s) => s.auth);

  const canWriteGeofence = canWrite(permissions, "Geofence");
  const canDeleteGeofence = canDelete(permissions, "Geofence");

  const totalItems = useSelector(
    (state: RootState) => state.geofence.totalItems,
  );

  useEffect(() => {
    dispatch(fetchGeofences({ page: page - 1, size: pageSize, search }));
  }, [dispatch, page, pageSize, search]);

  useEffect(() => {
    dispatch(fetchGeoGroups());
  }, [dispatch]);

  // ✅ Handle submit for both insert and update
const handleSubmit = async (data: GeofenceDTO & { id?: number }) => {
  const finalGeom = data.geom ?? editing?.geom;

  if (!finalGeom || !finalGeom.coordinates || finalGeom.coordinates.length === 0) {
    alert("Please draw the geofence on the map!");
    return;
  }

  const payload = {
    ...data,
    geom: finalGeom,
  };

  try {
    if (data.id) {
      await dispatch(updateGeofenceThunk({ id: data.id, geo: payload })).unwrap();
    } else {
      await dispatch(createGeofenceThunk(payload)).unwrap();
    }

    dispatch(fetchGeofences({ page: page - 1, size: pageSize, search }));

    onShapeSelect(null);
    setShowForm(false);
    setEditing(null);
  } catch (err) {
    console.error("Geofence save failed:", err);
  }
};

  const handleDelete = async (id?: number) => {
    if (!id) return;
    if (!window.confirm("Delete this geofence?")) return;

    try {
      await dispatch(deleteGeofenceThunk(id)).unwrap();

      // 🔥 Refresh table after delete
      dispatch(
        fetchGeofences({ page: page - 1, size: pageSize, search: search }),
      );
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  const columns: Column<any>[] = [
    {
      key: "pcts_name",
      label: "Name",
    },
    ...(canWriteGeofence || canDeleteGeofence
      ? [
          {
            key: "action",
            label: "Actions",
            render: (row: any) => (
              <div
                style={{ display: "flex", gap: 12, justifyContent: "center" }}
              >
                {canWriteGeofence && row.id && (
                <FaEdit
                  style={{ cursor: "pointer", color: "#2563eb" }}
                  onClick={(e) => {
                    e.stopPropagation();
                    onZoom(row);
                    setEditing(row);
                    setShowForm(true);
                    onEditStart(row);
                    onShapeSelect(null);
                  }}
                />
                )}
                {canDeleteGeofence && row.id && (
                  <FaTrash
                    style={{ cursor: "pointer", color: "#dc2626" }}
                    onClick={(e) => {
                      e.stopPropagation();
                      onZoom(row);
                      handleDelete(row.id);
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
    <div className="geo-container">
<style>
{`
/* 🎯 Stack footer vertically and center everything */
.geo-container .datatable-footer {
  display: flex !important;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

/* 🎯 Center text */
.geo-container .datatable-info {
  text-align: center;
  font-size: 13px;
}

/* 🎯 Center pagination */
.geo-container .pagination {
  display: flex;
  justify-content: center;
  gap: 6px;
}

/* 🎯 Smaller buttons */
.geo-container .page-link {
  min-width: 30px;
  height: 30px;
  padding: 0 8px;
  font-size: 12px;
}
`}
</style>

      <div className="geo-header">
        {!showForm &&  canWriteGeofence &&(
          <button
            className="geo-plus-btndatatabel"
            onClick={() => {
              setEditing(null);
              setShowForm(true);
              onEditStart(null);

              // ✅ Automatically enable draw mode when inserting
            }}
          >
            <i className="fas fa-plus"></i>
          </button>
        )}
      </div>

      {showForm ? (
        <GeofenceForm
          initialData={editing ?? undefined}
          geoGroups={geoGroups}
          onSubmit={handleSubmit}
          onCancel={() => {
            setShowForm(false);
            setEditing(null);
            onShapeSelect(null);
            onEditStart(null);
             dispatch(fetchGeofences({ page: page - 1, size: pageSize, search }));
          }}
          onOpenGeoGroup={() => setShowGroupModal(true)}
          onShapeSelect={(type) => onShapeSelect(type)}
          // ✅ Always use geom from LiveMap for **new insert** only
          geom={geom} // LiveMap drawn geom
          radius={radius}
        />
      ) : (
        <>
          {loading && <div className="geo-loading">Loading...</div>}
          {error && <div className="geo-error">{error}</div>}

          <Datatable
            columns={columns}
            data={geofences}
            totalRecords={totalItems}
            page={page}
            pageSize={pageSize}
            search={search}
            onSearchChange={(value) => {
              setSearch(value);
              setPage(1);
            }}
            onPageChange={setPage}
            onPageSizeChange={(size) => {
              setPageSize(size);
              setPage(1);
            }}
            onFetch={() => {}}
            onRowClick={(row) => onZoom(row)}
          />
        </>
      )}

      <GeoGroupModal
        show={showGroupModal}
        onHide={() => setShowGroupModal(false)}
        onSaveSuccess={() => dispatch(fetchGeoGroups())}
      />
    </div>
  );
};

export default GeofencePage;
