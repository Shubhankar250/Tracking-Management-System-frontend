import React, { useEffect, useState } from "react";
import Modal from "../components/common/Modal";

import {
  getAllGeoGroups,
  saveGeoGroups,
  type AddGeoGroupDTO,
} from "../api/geofenceService";

interface Props {
  show: boolean;
  onHide: () => void;
  onSaveSuccess?: () => void;
}

interface Group {
  id?: number;
  name: string;
}

const GeoGroupModal: React.FC<Props> = ({ show, onHide, onSaveSuccess }) => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [deletedIds, setDeletedIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch groups whenever modal is shown
  useEffect(() => {
    if (show) fetchGroups();
  }, [show]);

  const fetchGroups = async () => {
    try {
      const res = await getAllGeoGroups();
      const arr: Group[] = Object.entries(res.data).map(([id, name]) => ({
        id: Number(id),
        name: name as string,
      }));
      setGroups([...arr, { name: "" }]); // Add empty row for new group
      setDeletedIds([]); // Reset deletedIds
    } catch (err) {
      console.error("Failed to fetch geo groups:", err);
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
      const dto: AddGeoGroupDTO = {
        group_names: groups
  .filter((g) => !g.id && g.name.trim()) 
  .map((g) => g.name.trim()),
        deletedIds,
      };
      await saveGeoGroups(dto);
      onSaveSuccess?.();
      onHide();
    } catch (err) {
      console.error("Failed to save geo groups:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={show} title="Geo Groups" onClose={onHide} size="small">
        <div className="geo-group-modal-body">

          <div className="geo-group-list">
            {groups.map((g, i) => (
              <div key={g.id ?? i} className="geo-group-item">
                <input
                  value={g.name}
                  onChange={(e) => updateName(i, e.target.value)}
                  className="form-control geo-group-input"
                  placeholder="Enter group name"
                />

                {g.id !== undefined && (
                  <button
                    type="button"
                    onClick={() => deleteGroup(i)}
                    className="geo-group-delete-btn"
                  >
                    ✖
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="geo-group-footer">
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
    
    </Modal>
  );
};

export default GeoGroupModal;
