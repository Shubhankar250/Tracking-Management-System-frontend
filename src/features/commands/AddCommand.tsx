import { useState, useEffect } from "react";
import Modal from "../../components/common/Modal";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import { createCommand, updateCommand } from "../../slices/commandSlice";
import { toast } from "react-toastify";
import type { CommandDTO } from "../../api/commandService";
import { fetchAllModalNames } from "../../slices/deviceModalSlice";
import Select from "react-select";
const AddCommandModal = ({ onClose, editData, onSuccess }: any) => {
  const dispatch = useAppDispatch();

  const [form, setForm] = useState<CommandDTO>({
    model: "",
    commandName: "",
    commandCode: "",
    commandStatus: 0,
    types: "",
    deviceId: 0,
    commandCategory: "",
    commandSubCategory: "",
  });
  const modalNames = useAppSelector((state) => state.deviceModal.modalNames);

  useEffect(() => {
    dispatch(fetchAllModalNames());
  }, [dispatch]);

  useEffect(() => {
    if (editData) setForm(editData);
  }, [editData]);

  const categoryOptions = [
    { value: "DEVICE_CONTROL", label: "Device Control" },
    { value: "CONFIGURATION", label: "Configuration" },
    { value: "QUERY", label: "Query / Monitoring" },
    { value: "SYSTEM", label: "System / Maintenance" },
  ];
  const subCategoryMap: Record<string, { value: string; label: string }[]> = {
    DEVICE_CONTROL: [
      { value: "FUEL_CUT", label: "Fuel Cut" },
      { value: "FUEL_RESTORE", label: "Fuel Restore" },
      { value: "RESTART", label: "Restart" },
      { value: "FACTORY_RESET", label: "Factory Reset" },
    ],

    CONFIGURATION: [
      { value: "SET_APN", label: "Set APN" },
      { value: "SET_IP", label: "Set IP" },
      { value: "SET_PORT", label: "Set Port" },
      { value: "SET_TIMEZONE", label: "Set Timezone" },
      { value: "SET_HEARTBEAT", label: "Set Heartbeat Interval" },
      { value: "SET_GPS_INTERVAL", label: "Set GPS Interval" },
      { value: "SET_DISTANCE_INTERVAL", label: "Set Distance Interval" },
      { value: "SET_ANGLE_INTERVAL", label: "Set Angle Interval" },
      { value: "SET_ODOMETER", label: "Set Odometer" },
      { value: "TERMINAL_CONFIGURATION", label: "Terminal Configaration" },
      
    ],

    QUERY: [
      { value: "CHECK_FIRMWARE", label: "Check Firmware Version" },
      { value: "CHECK_PARAMS", label: "Check Params" },
      { value: "CHECK_STATUS", label: "Check Status" },
      { value: "QUERY_NETWORK", label: "Query Network Settings" },
      { value: "CHECK_LOCATION", label: "Check Location" },
       { value: "SNAPSHOT", label: "Snapshot" },
      
    ],

    SYSTEM: [
      { value: "RESTART", label: "Restart" },
      { value: "FACTORY_RESET", label: "Factory Reset" },
      { value: "CHECK_FIRMWARE", label: "Check Firmware Version" },
    ],
  };

  const handleSave = async () => {
    try {
      if (form.id) {
        await dispatch(updateCommand(form)).unwrap();
        toast.success("Command updated successfully");
      } else {
        await dispatch(createCommand(form)).unwrap();
        toast.success("Command created successfully");
      }
      onSuccess();
      onClose();
    } catch {
      toast.error("Failed to save command");
    }
  };
  const modalOptions = modalNames.map((name) => ({
    value: name,
    label: name,
  }));
  return (
    <Modal
      isOpen
      title={editData ? "Update Command" : "Add Command"}
      onClose={onClose}
    >
      <div className="cmd-add-modal-container">
        <div className="cmd-add-modal-body">
          <div className="cmd-form-group">
            <label>Device Model</label>
            <div>
              <Select
                classNamePrefix="cmd-select"
                options={modalOptions}
                placeholder="Search Model..."
                isSearchable
                components={{ IndicatorSeparator: () => null }}
                value={modalOptions.find((opt) => opt.value === form.model)}
                onChange={(selected) =>
                  setForm((prev) => ({
                    ...prev,
                    model: selected ? selected.value : "",
                  }))
                }
              />
            </div>
          </div>

          <div className="cmd-form-group">
            <label>Command Name</label>
            <input
              placeholder="Enter command name"
              value={form.commandName}
              onChange={(e) =>
                setForm({ ...form, commandName: e.target.value })
              }
            />
          </div>

          <div className="cmd-form-group">
            <label>Command Category</label>
            <Select
              classNamePrefix="cmd-select"
              options={categoryOptions}
              placeholder="Search Category..."
              isSearchable
              components={{ IndicatorSeparator: () => null }}
              value={categoryOptions.find(
                (opt) => opt.value === form.commandCategory,
              )}
              onChange={(selected) =>
                setForm((prev) => ({
                  ...prev,
                  commandCategory: selected ? selected.value : "",
                  commandSubCategory: "", // reset subcategory
                }))
              }
            />
          </div>
          <div className="cmd-form-group">
            <label>Command Sub Category</label>

            <Select
              classNamePrefix="cmd-select"
              options={subCategoryMap[form.commandCategory || ""] || []}
              placeholder="Search Sub Category..."
              isSearchable
              components={{ IndicatorSeparator: () => null }}
              value={(subCategoryMap[form.commandCategory || ""] || []).find(
                (opt) => opt.value === form.commandSubCategory,
              )}
              onChange={(selected) =>
                setForm((prev) => ({
                  ...prev,
                  commandSubCategory: selected ? selected.value : "",
                }))
              }
              isDisabled={!form.commandCategory}
            />
          </div>

          <div className="cmd-form-group">
            <label>Command Code</label>
            <input
              placeholder="Enter command code"
              value={form.commandCode}
              onChange={(e) =>
                setForm({ ...form, commandCode: e.target.value })
              }
            />
          </div>

          <div className="cmd-form-group">
            <label>Command Status</label>
            <select
              className="cmd-form-select"
              value={form.commandStatus}
              onChange={(e) =>
                setForm({ ...form, commandStatus: Number(e.target.value) })
              }
            >
              <option value="0">Inactive</option>
              <option value="1">Active</option>
            </select>
          </div>

          {/*<div className="cmd-form-group">
            <label>Types</label>
            <select
              value={form.types}
              onChange={(e) => setForm({ ...form, types: e.target.value })}
            >
              <option value="">Select Type</option>
              <option value="OVERSPEED">Over speed</option>
              <option value="LOWSPEED">Low speed</option>
              <option value="STOPPAGE_DURATION">Stop duration</option>
              <option value="IDLE_DURATION">Idle duration</option>
              <option value="IGNITION">Ignition</option>
              <option value="SOS">SOS</option>
              <option value="IN">Geofence In</option>
              <option value="OUT">Geofence Out</option>
              <option value="ALL">Geofence In / Out</option>
              <option value="ROUTE_IN">Route In</option>
              <option value="ROUTE_OUT">Route Out</option>
              <option value="DRIVER_CHANGE">Driver Change</option>
              <option value="DRIVER_CHANGE_AUTH">Driver Authorized</option>
              <option value="FUEL_FILL_THEFT">Fuel Fill/Theft</option>
              <option value="POI_STOP_DURATION">POI Stop Duration</option>
              <option value="POI_IDLE_DURATION">POI Idle Duration</option>
              <option value="TASK_STATUS">Task Status</option>
              <option value="VIBRATION">Vibration</option>
              <option value="MOVEMENT">Movement</option>
              <option value="FALLDOWN">Fall Down</option>
              <option value="LOWPOWER">Low Power</option>
              <option value="LOWBATTERY">Low Battery</option>
              <option value="POWERCUT">Power Cut</option>
              <option value="POWERRESTORED">Power Restored</option>
            </select>
          </div>*/}
        </div>

        {/* FOOTER */}
        <div className="cmd-add-modal-footer">
          <button className="btn-gray" onClick={onClose}>
            Cancel
          </button>
          <button className="btn-blue" onClick={handleSave}>
            {editData ? "Update" : "Save"}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default AddCommandModal;
