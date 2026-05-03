import React, { useEffect, useState } from "react";
import Modal from "../components/common/Modal";
import { saveRouteGroups, getAllRouteGroups } from "../api/routeService";
import type { DGMDTO } from "../api/routeService";

interface Props {
  show: boolean;
  onHide: () => void;
  onSaveSuccess?: () => void;
}

interface Group {
  id?: number;
  name: string;
}

const RouteGroupModal: React.FC<Props> = ({ show, onHide, onSaveSuccess }) => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [deletedIds, setDeletedIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch groups when modal opens
  useEffect(() => {
    if (show) fetchGroups();
  }, [show]);

  const fetchGroups = async () => {
    try {
      const res = await getAllRouteGroups();
      // Convert response to Group[]
      const arr: Group[] = Object.entries(res.data).map(([id, name]) => ({
        id: Number(id),
        name: name as string,
      }));
      setGroups([...arr, { name: "" }]); // Add empty row for new group
      setDeletedIds([]);
    } catch (err) {
      console.error("Failed to fetch route groups:", err);
    }
  };

  const updateName = (index: number, value: string) => {
    setGroups((prev) => {
      const copy = [...prev];
      copy[index].name = value;
      // If last row is being edited and not empty, add a new empty row
      if (index === copy.length - 1 && value.trim()) {
        copy.push({ name: "" });
      }
      return copy;
    });
  };
  const deleteGroup = (index: number) => {
    const g = groups[index];

    // Only push a defined id
    if (g.id !== undefined) {
      // ✅ explicitly typecast g.id as number
      setDeletedIds((prev: number[]) => [...prev, g.id as number]);
    }

    // Remove group from the array
    setGroups((prev) => prev.filter((_, i) => i !== index));
  };

const handleSave = async () => {
  setLoading(true);
  try {
    const dto: DGMDTO = {
      group_names: groups
        .filter((g) => !g.id && g.name.trim())   // ✅ only NEW groups
        .map((g) => g.name.trim()),
      deletedIds,
    };

    await saveRouteGroups(dto);
    onSaveSuccess?.();
    onHide();
  } catch (err) {
    console.error("Failed to save route groups:", err);
  } finally {
    setLoading(false);
  }
};
  return (
    <Modal isOpen={show} title="Route Groups" onClose={onHide} size="small">
      <div className="route-modal-body-flex">
      <div className="route-group-container">
  {groups.map((g, i) => (
    <div key={g.id ?? i} className="route-group-row-item">
      <input
        value={g.name}
        onChange={(e) => updateName(i, e.target.value)}
        placeholder="Enter group name"
        className="form-control route-group-input"
      />

      {g.id !== undefined && (
        <button
          type="button"
          onClick={() => deleteGroup(i)}
          className="route-group-delete-btn"
        >
          ✖
        </button>
      )}
    </div>
  ))}
</div>

{/* Footer Buttons */}
<div className="route-group-footer">
  <button onClick={onHide} className="btn-gray">
    Cancel
  </button>

  <button
    onClick={handleSave}
    disabled={loading}
    className="btn-blue"
  >
    Save
  </button>
</div>
</div>

      {/* <div style={{ display: "flex", flexDirection: "column", gap: 8, padding: "10px" }}>
        {groups.map((g, i) => (
          <div
            key={g.id ?? i}
            style={{ display: "flex", gap: 8, alignItems: "center" }}
          >
            <input
              value={g.name}
              onChange={(e) => updateName(i, e.target.value)}
              placeholder="Enter group name"
              className="form-control"
              style={{ color: "#000" }}
            />
            {g.id !== undefined && (
              <button
                type="button"
                onClick={() => deleteGroup(i)}
                style={{
                  background: "#ff4d4f",
                  color: "#fff",
                  border: "none",
                  padding: "0 8px",
                  width: "32px",
                  height: "25px",
                  fontSize: "18px",
                  borderRadius: 4,
                  cursor: "pointer",
                  marginLeft: "auto",
                  marginBottom: "13px",

                }}
              >
                ✖
              </button>
            )}
          </div>
        ))}
      </div> */}

      {/* Buttons aligned right */}
      {/* <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          gap: "8px",
          marginTop: "10px",
          padding: "10px"
        }}
      >
        <button
          onClick={onHide}
          style={{
            padding: "6px 12px",
            cursor: "pointer",
            background: "#f0f0f0",
            border: "1px solid #ccc",
            borderRadius: 4,
          }}
        >
          Cancel
        </button>

        <button
          onClick={handleSave}
          disabled={loading}
          style={{
            padding: "6px 12px",
            background: "#007bff",
            color: "#fff",
            border: "none",
            borderRadius: 4,
            cursor: "pointer",
          }}
        >
          Save
        </button>
      </div> */}
    </Modal>

  );
};

export default RouteGroupModal;
