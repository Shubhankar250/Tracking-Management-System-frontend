import React, { useEffect, useState } from "react";
import Modal from "../components/common/Modal";
import { getAllPoiGroups, savePoiGroups } from "../api/poiService";
import type { AddPoiGroupDTO } from "../api/poiService";
import { useAppDispatch } from "../redux/hooks";
import { fetchPoiGroups } from "../slices/poiSlice";

interface Props {
  show: boolean;
  onHide: () => void;
}

interface Group {
  id?: number;
  name: string;
}

const PoiGroupModal: React.FC<Props> = ({ show, onHide }) => {
  const dispatch = useAppDispatch();

  const [groups, setGroups] = useState<Group[]>([]);
  const [deletedIds, setDeletedIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (show) fetchGroups();
  }, [show]);

  const fetchGroups = async () => {
    try {
      const res = await getAllPoiGroups();

      const arr: Group[] = Object.entries(res.data).map(([id, name]) => ({
        id: Number(id),
        name: String(name),
      }));

      setGroups([...arr, { name: "" }]);
      setDeletedIds([]);
    } catch (err) {
      console.error(err);
    }
  };

  const updateName = (index: number, value: string) => {
    setGroups(prev => {
      const copy = [...prev];
      copy[index].name = value;

      // Auto add new blank row
      if (index === copy.length - 1 && value.trim())
        copy.push({ name: "" });

      return copy;
    });
  };

  const deleteGroup = (index: number) => {
    const g = groups[index];

    if (g.id !== undefined) {
      setDeletedIds(prev => [...prev, g.id!]);
    }

    setGroups(prev => prev.filter((_, i) => i !== index));
  };

 const handleSave = async () => {
  setLoading(true);

  try {
    const dto: AddPoiGroupDTO = {
      // ✅ ONLY NEW GROUPS
      groupNames: groups
        .filter((g) => !g.id && g.name.trim())
        .map((g) => g.name.trim()),

      deletedIds,
    };

    await savePoiGroups(dto);

    // ✅ refresh redux
    dispatch(fetchPoiGroups());

    onHide();
  } catch (err) {
    console.error(err);
  } finally {
    setLoading(false);
  }
};
  return (
    <Modal isOpen={show} title="POI Groups" onClose={onHide} size="small">
      <div className="poi-modal-body-flex">

        <div className="poi-group-container">
          {groups.map((g, i) => (
            <div
              key={g.id ?? i}
              className="poi-group-row-modal"
            >
              <input
                value={g.name}
                onChange={(e) => updateName(i, e.target.value)}
                placeholder="Enter group name"
                className="form-control poi-group-input"
              />

              {g.id !== undefined && (
                <button
                  type="button"
                  onClick={() => deleteGroup(i)}
                  className="poi-group-delete-btn"
                >
                  ✖
                </button>
              )}
            </div>
          ))}
        </div>

        <div className="poi-group-footer">
          <button
            onClick={onHide}
            className="btn-gray"
          >
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
                  width: 32,
                  height: 25,
                  fontSize: 18,
                  borderRadius: 4,
                  cursor: "pointer",
                  marginLeft: "auto",
                  marginBottom: 13,
                }}
              >
                ✖
              </button>
            )}
          </div>
        ))}
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          gap: 8,
          marginTop: 10
          , padding: "10px"

        }}
      >
        <button
          onClick={onHide}
          style={{
            padding: "6px 12px",
            background: "#f0f0f0",
            border: "1px solid #ccc",
            borderRadius: 4,
            cursor: "pointer",
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

export default PoiGroupModal;
