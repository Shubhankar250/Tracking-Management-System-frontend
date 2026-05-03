import { useEffect, useMemo, useState } from "react";
import Modal from "../components/common/Modal";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import { fetchGroupedDevices } from "../slices/usersSlice";
import type { DGMDTO } from "../api/deviceService";
import {
  createNewDeviceGroup,
  updateExistingDeviceGroup,
} from "../slices/devicesSlice";
import "../assets/css/DeviceGroupModal.css";
import { closeModal, openModal } from "../slices/uiSlice";
import { toast } from "react-toastify";
import { fetchLiveDevices } from "../slices/liveSlice";

interface Device {
  id: number;
  name: string;
}

interface GroupedDevices {
  [groupName: string]: Device[];
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  groupName?: string;
  groupId?: number;
}

const DeviceGroupModal = ({
  isOpen,
  onClose,
  groupName: initialGroupName,
  groupId,
}: Props) => {
  const dispatch = useAppDispatch();
  const { groupedDevices: groupedDevicesFromStore, loading } = useAppSelector(
    (state) => state.users,
  );

  const groupedDevices: GroupedDevices = useMemo(
    () => groupedDevicesFromStore || {},
    [groupedDevicesFromStore],
  );

  const [groupName, setGroupName] = useState("");
  const [selectedDevices, setSelectedDevices] = useState<number[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [groupNameError, setGroupNameError] = useState("");
  const [deviceError, setDeviceError] = useState("");

  useEffect(() => {
    if (isOpen) {
      dispatch(fetchGroupedDevices());
    }
  }, [isOpen, dispatch]);

  useEffect(() => {
    if (isOpen) dispatch(openModal());
    else dispatch(closeModal());
  }, [isOpen, dispatch]);

  useEffect(() => {
    if (isOpen) {
      setGroupName(initialGroupName || "");
      setGroupNameError("");
      setDeviceError("");
    }
  }, [isOpen, initialGroupName]);

  useEffect(() => {
    if (isOpen && initialGroupName && groupedDevices[initialGroupName]) {
      const group = groupedDevices[initialGroupName];
      setSelectedDevices(group.map((d) => d.id));
    } else if (isOpen) {
      setSelectedDevices([]);
    }
  }, [isOpen, initialGroupName, groupedDevices]);

  const toggleDevice = (id: number) => {
    setSelectedDevices((prev) => {
      const updated = prev.includes(id)
        ? prev.filter((x) => x !== id)
        : [...prev, id];

      if (updated.length > 0) {
        setDeviceError("");
      }

      return updated;
    });
  };

  const toggleGroup = (devices: Device[], checked: boolean) => {
    const ids = devices.map((d) => d.id);
    setSelectedDevices((prev) => {
      const updated = checked
        ? [...new Set([...prev, ...ids])]
        : prev.filter((id) => !ids.includes(id));

      if (updated.length > 0) {
        setDeviceError("");
      }

      return updated;
    });
  };

  const selectAllDevices = () => {
    const allIds = Object.values(groupedDevices)
      .flat()
      .map((d) => d.id);
    setSelectedDevices(allIds);
    if (allIds.length > 0) {
      setDeviceError("");
    }
  };

  const deselectAllDevices = () => setSelectedDevices([]);

  const validateForm = () => {
    let valid = true;

    if (!groupName.trim()) {
      setGroupNameError("Group name is required");
      valid = false;
    } else {
      setGroupNameError("");
    }

    if (selectedDevices.length === 0) {
      setDeviceError("Please select at least one object");
      valid = false;
    } else {
      setDeviceError("");
    }

    return valid;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    const payload: DGMDTO = {
      group_name: groupName.trim(),
      deviceIds: selectedDevices,
    };

    try {
      if (!groupId || groupId === 1) {
        await dispatch(createNewDeviceGroup(payload));
        toast.success("Group created successfully");
      } else {
        payload.group_id = groupId;
        await dispatch(updateExistingDeviceGroup(payload));
        toast.success("Group updated successfully");
      }

      dispatch(fetchLiveDevices());
      onClose();
    } catch (error) {
      toast.error("Something went wrong");
    }
  };

  const filteredGroupedDevices: GroupedDevices = Object.fromEntries(
    Object.entries(groupedDevices).map(([group, devices]) => [
      group,
      devices.filter((d) =>
        (d.name ?? "").toLowerCase().includes((searchTerm ?? "").toLowerCase()),
      ),
    ]),
  );

  return (
    <Modal
      isOpen={isOpen}
      title={initialGroupName ? "Update Group" : "Add Group"}
      onClose={onClose}
      size="medium"
    >
      <div className="device-group-modal">
        <div className="modal-body">
          <div className="mb-3">
            <label className="form-label fw-semibold required">
              Group Name{" "}
            </label>
            <input
              type="text"
              className="form-control"
              value={groupName}
              onChange={(e) => {
                setGroupName(e.target.value);
                if (e.target.value.trim()) {
                  setGroupNameError("");
                }
              }}
            />
            {groupNameError && (
              <div className="text-danger" style={{ fontSize: "12px" }}>
                {groupNameError}
              </div>
            )}
          </div>

          <div className="permission-toolbar mb-3 mt-3">
            <div className="left">
              <strong>Objects</strong>
            </div>
            <div className="right-buttons-box">
              <button
                type="button"
                className="permission-btn primary"
                onClick={selectAllDevices}
              >
                Select All
              </button>
              <button
                type="button"
                className="permission-btn secondary"
                onClick={deselectAllDevices}
              >
                Deselect All
              </button>
              <input
                type="text"
                placeholder="Search Device"
                className="form-control ms-2"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {deviceError && (
            <div className="text-danger mb-2" style={{ fontSize: "12px" }}>
              {deviceError}
            </div>
          )}

          <div className="vehicle-groups-container">
            {Object.keys(filteredGroupedDevices).length === 0 && (
              <p>No devices found</p>
            )}

            {Object.entries(filteredGroupedDevices).map(
              ([grpName, devices]) => {
                const groupChecked =
                  devices.length > 0 &&
                  devices.every((d) => selectedDevices.includes(d.id));

                return (
                  <div className="group-block mb-3" key={grpName}>
                    <div className="group-header">
                      <label className="group-label">
                        <input
                          type="checkbox"
                          checked={groupChecked}
                          onChange={(e) =>
                            toggleGroup(devices, e.target.checked)
                          }
                        />
                        <span>{grpName}</span>
                      </label>
                    </div>

                    <div className="vehicles-grid">
                      {devices.map((vehicle) => (
                        <label className="vehicle-item" key={vehicle.id}>
                          <input
                            type="checkbox"
                            checked={selectedDevices.includes(vehicle.id)}
                            onChange={() => toggleDevice(vehicle.id)}
                          />
                          <span>{vehicle.name}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                );
              },
            )}
          </div>
        </div>

        <div className="modal-footer-custom">
          <button className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
          <button
            className="btn btn-primary"
            onClick={handleSave}
            disabled={loading}
          >
            {initialGroupName ? "Update" : "Save"}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default DeviceGroupModal;
