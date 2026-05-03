import React, { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import { fetchAllObject } from "../slices/devicesSlice";
import type { Column } from "../components/common/DatatableNew";
import Datatable from "../components/common/DatatableNew";
import { FaEdit } from "react-icons/fa";
import Device from "./Device";
import Modal from "../components/common/Modal";

interface Props {
  open: boolean;
  onClose: () => void;
}
const ObjectsTable: React.FC<Props> = ({ open,onClose }) => {
  const dispatch = useAppDispatch();
  const { objectsTable, recordsTotal } = useAppSelector(
    (state) => state.devices
  );

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [search, setSearch] = useState("");
  const [editingDeviceId, setEditingDeviceId] = useState<number | undefined>();

  // 🔥 Dynamic columns
  const columns: Column<any>[] =
    objectsTable && objectsTable.length > 0
      ? Object.keys(objectsTable[0])
          .filter((key) => key !== "id")
          .map((key) => {
            if (key.toLowerCase() === "status") {
              return {
                key,
                label: "STATUS",
                render: (row: any) => {
                  const status = row.status?.toLowerCase();

                  let bg = "#6e6f70";
                  let text = "Unknown";

                  if (status === "online") {
                    bg = "#2e7d32";
                    text = "Online";
                  } else if (status === "offline") {
                    bg = "#d32f2f";
                    text = "Offline";
                  }

                  return (
                    <span
                      style={{
                        color: "#fff",
                        background: bg,
                        padding: "4px 10px",
                        borderRadius: 5,
                        fontSize: 10,
                        fontWeight: 500,
                      }}
                    >
                      {text}
                    </span>
                  );
                },
              };
            }

   return {
  key,
  label: key.replace(/id$/i, " Id").toUpperCase(),
};    })
      : [];

  // ✅ Actions column
columns.push({
  key: "actions",
  label: "ACTION",
  render: (row: any) => (
    <div style={{ display: "flex", gap: 10 }}>
      <FaEdit
        style={{ cursor: "pointer", color: "#2563eb" }}
        onClick={() => setEditingDeviceId(row.id)}
      />
   
    </div>
  ),
});

  // 🔄 Fetch data
  useEffect(() => {
    dispatch(
      fetchAllObject({
        draw: page,
        start: (page - 1) * pageSize,
        length: pageSize,
        search: search,
      })
    );
  }, [dispatch, page, pageSize, search]);

  return (
    <>
      {/* 🔥 FULLSCREEN MODAL */}
      <Modal
        isOpen={open}
        title="Objects List"
        onClose={onClose}
        size="fullscreen"
        draggable={false}
      >
        <div style={{ padding: 10 }}>
          <Datatable
            columns={columns}
            data={objectsTable}
            totalRecords={recordsTotal}
            page={page}
            pageSize={pageSize}
            search={search}
            onPageChange={(p) => setPage(p)}
            onPageSizeChange={(size) => {
              setPageSize(size);
              setPage(1);
            }}
            onSearchChange={(s) => {
              setSearch(s);
              setPage(1);
            }}
          />
        </div>
      </Modal>

      {/* ✅ EDIT DEVICE MODAL */}
      {editingDeviceId && (
        <Device
          open={true}
          deviceId={editingDeviceId}
          onClose={() => setEditingDeviceId(undefined)}
          onSaveSuccess={() => {
            dispatch(
              fetchAllObject({
                draw: page,
                start: (page - 1) * pageSize,
                length: pageSize,
                search: search,
              })
            );
          }}
        />
      )}
    </>
  );
};

export default ObjectsTable;