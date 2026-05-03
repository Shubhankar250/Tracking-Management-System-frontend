import React, { useEffect, useState } from "react";
import PoiForm from "./PoiForm";
import PoiGroupModal from "./PoiGroupModal";

import type { PoiDTO } from "../api/poiService";
import { FaEdit, FaTrash } from "react-icons/fa";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import {
  createPoiThunk,
  deletePoiThunk,
  fetchPoiGroups,
  fetchPois,
  updatePoiThunk,
} from "../slices/poiSlice";
import type { Column } from "../components/common/DatatableNew";
import Datatable from "../components/common/DatatableNew";
import "../assets/css/poi.css";
import { canWrite, canDelete } from "../utils/permission";
const PoiPage: React.FC<{
 onSelectPoi: (p: PoiDTO | null) => void;

  onStartInsert: () => void;
  poiInsertMode: boolean;
  setPoiInsertMode: (b: boolean) => void;
  selectedPoi?: PoiDTO | null;
  tempPoiLocation?: { latitude: number; longitude: number } | null;
  
}> = ({
  onSelectPoi,
  onStartInsert,
  poiInsertMode,
  setPoiInsertMode,
  selectedPoi,
  tempPoiLocation,
}) => {
  const [editing, setEditing] = useState<PoiDTO | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  const dispatch = useAppDispatch();
  const { pois, totalItems } = useAppSelector((s) => s.poi);

  const poiGroups = useAppSelector((s) => s.poi.poiGroups);
  const { permissions } = useAppSelector((s) => s.auth);

const canWritePoi = canWrite(permissions, "Poi");
const canDeletePoi = canDelete(permissions, "Poi");

const handleCloseForm = () => {
  setShowForm(false);
  setEditing(null);
  setPoiInsertMode(false);
  onSelectPoi(null); // show all POIs on map again

  dispatch(
    fetchPois({
      page: page - 1,
      size: pageSize,
      search,
    })
  );
};

  useEffect(() => {
    dispatch(
      fetchPois({
        page: page - 1,
        size: pageSize,
        search,
      }),
    );
  }, [dispatch, page, pageSize, search]);

  useEffect(() => {
    dispatch(fetchPoiGroups());
  }, [dispatch]);

  useEffect(() => {
    if (!poiInsertMode && selectedPoi) {
      setEditing(selectedPoi);
      setShowForm(true);
    }
  }, [poiInsertMode, selectedPoi]);

const handleSubmit = async (data: PoiDTO) => {
  const finalPayload = {
     ...data,
    latitude: data.latitude,
    longitude: data.longitude,
  };

  if (finalPayload.id) {
    await dispatch(updatePoiThunk(finalPayload));
  } else {
    await dispatch(createPoiThunk(finalPayload));
  }

  await dispatch(fetchPois({
    page: page - 1,
    size: pageSize,
    search,
  }));

  setShowForm(false);
};
  const handleDelete = async (id?: number) => {
    if (!id) return;
    if (!window.confirm("Delete this POI?")) return;
    await dispatch(deletePoiThunk(id));
    dispatch(
      fetchPois({
        page: page - 1,
        size: pageSize,
        search,
      }),
    );
  };

  // Columns for Datatable
  const columns: Column<PoiDTO>[] = [
    { key: "name", label: "Name" },
    ...(canWritePoi || canDeletePoi
    ? [
    {
      key: "action" as const,
      label: "Actions",
      render: (p : PoiDTO) => (
        <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
           {canWritePoi && (
          <FaEdit
            style={{ cursor: "pointer", color: "#2563eb" }}
            onClick={(e) => {
              e.stopPropagation();
              setPoiInsertMode(true);
              setEditing(p);
                onSelectPoi(p);
              setShowForm(true);
            }}
          />
           )} 
           {canDeletePoi && p.id && (
          <FaTrash
            style={{ cursor: "pointer", color: "#dc2626" }}
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(p.id);
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
    <div className="poi-container">

      <style>
{`
/* 🎯 Footer stacked & centered */
.poi-container .datatable-footer {
  display: flex !important;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: 12px;
}

/* 🎯 Center text */
.poi-container .datatable-info {
  text-align: center;
  font-size: 13px;
}

/* 🎯 Center pagination */
.poi-container .pagination {
  display: flex;
  justify-content: center;
  gap: 6px;
}

/* 🎯 Smaller buttons */
.poi-container .page-link {
  min-width: 30px;
  height: 30px;
  padding: 0 8px;
  font-size: 12px;
}
`}
</style>
      <div className="poi-header">
        {!showForm && canWritePoi && (
          <button
            className="poi-plus-btndatatabel"
            onClick={() => {
              setEditing(null);
              setShowForm(true);
              setPoiInsertMode(true);
              onStartInsert?.();
            }}
          >
            <i className="fas fa-plus"></i>
          </button>
        )}
      </div>


      {showForm ? (
       <PoiForm
  initialData={selectedPoi ?? editing ?? undefined}
  poiGroups={poiGroups}
  tempLocation={tempPoiLocation}
  onSubmit={handleSubmit}
  onCancel={handleCloseForm}
  onShapeSelect={(type) => {
    if (type === null) {
      setPoiInsertMode(false);
    } else {
      setPoiInsertMode(true);
    }
  }}
  onOpenGroupModal={() => setShowGroupModal(true)}
/>

      ) : (
        <Datatable
          columns={columns}
          data={pois}
          totalRecords={totalItems}
          page={page}
          pageSize={pageSize}
          search={search}
          onPageChange={(p) => setPage(p)}
          onSearchChange={(s) => {
            setSearch(s);
            setPage(1);
          }}
          onPageSizeChange={(size) => {
            setPageSize(size);
            setPage(1);
          }}
          onRowClick={(row) => onSelectPoi(row)}
          rowClassName={() => "cursor-pointer"}
        />
      )}

      <PoiGroupModal
        show={showGroupModal}
        onHide={() => setShowGroupModal(false)}
      />
    </div>
  );
};

export default PoiPage;
