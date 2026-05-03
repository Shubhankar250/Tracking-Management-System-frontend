import { useEffect, useState } from "react";
import Modal from "./Modal";
import "../../assets/css/commandChat.css";
import { useAppSelector, useAppDispatch } from "../../redux/hooks";
import type { CommandDTO } from "../../api/commandService";
import { sendCommand, fetchCommandLogs } from "../../slices/commandSlice";
import Select from "react-select";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  deviceId: number | null;
}

const CommandChatModal = ({ isOpen, onClose, deviceId }: Props) => {
  const dispatch = useAppDispatch();

  const [category, setCategory] = useState("");
  const [command, setCommand] = useState("");
  const [quickCmd, setQuickCmd] = useState("");
  const [selectedDeviceId, setSelectedDeviceId] = useState<number | "">("");
  const [logs, setLogs] = useState<any[]>([]); // store recent commands

  const devices = useAppSelector((s) => s.live.devices);

  useEffect(() => {
    if (deviceId !== null) setSelectedDeviceId(deviceId);
  }, [deviceId]);

  // fetch recent commands whenever a device is selected
  useEffect(() => {
    if (selectedDeviceId) {
      dispatch(fetchCommandLogs({ page: 0, size: 25, search: "" }))
        .unwrap()
        .then((res: any) => {
          // filter logs by selected device
          const filtered = res.content?.filter(
            (cmd: any) => cmd.deviceId === selectedDeviceId
          );
          setLogs(filtered || []);
        })
        .catch((err) => console.error("Error fetching logs:", err));
    }
  }, [selectedDeviceId, dispatch]);

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
      { value: "SET_HEARTBEAT", label: "Heartbeat Interval" },
      { value: "SET_GPS_INTERVAL", label: "GPS Interval" },
      { value: "SET_DISTANCE_INTERVAL", label: "Distance Interval" },
      { value: "SET_ANGLE_INTERVAL", label: "Angle Interval" },
      { value: "SET_ODOMETER", label: "Set Odometer" },
    ],
    QUERY: [
      { value: "CHECK_FIRMWARE", label: "Firmware Version" },
      { value: "CHECK_PARAMS", label: "Check Params" },
      { value: "CHECK_STATUS", label: "Check Status" },
      { value: "QUERY_NETWORK", label: "Network Settings" },
      { value: "CHECK_LOCATION", label: "Check Location" },
    ],
    SYSTEM: [
      { value: "RESTART", label: "Restart" },
      { value: "FACTORY_RESET", label: "Factory Reset" },
    ],
  };

  const handleSendCommand = () => {
    if (!selectedDeviceId || !category || !command) {
      alert("Please select device, category, and command.");
      return;
    }

    const payload: CommandDTO = {
      deviceId: Number(selectedDeviceId),
      commandCategory: category,
      commandSubCategory: command,
      commandName: command,
      types: category,
      commandCode: command, // required
    };

    dispatch(sendCommand(payload))
      .unwrap()
      .then((res) => {
        console.log("Command sent:", res);
        setCommand("");
        // append the sent command to logs
        setLogs((prev) => [
          ...prev,
          { commandName: command, created_on: new Date().toISOString(), deviceId: selectedDeviceId },
        ]);
      })
      .catch((err) => console.error("Error sending command:", err));
  };

  const handleSendQuick = () => {
    if (!selectedDeviceId || !quickCmd.trim()) return;

    const payload: CommandDTO = {
      deviceId: Number(selectedDeviceId),
      commandName: quickCmd.trim(),
      commandCode: quickCmd.trim(),
    };

    dispatch(sendCommand(payload))
      .unwrap()
      .then((res) => {
        console.log("Quick command sent:", res);
        setQuickCmd("");
        setLogs((prev) => [
          ...prev,
          { commandName: quickCmd.trim(), created_on: new Date().toISOString(), deviceId: selectedDeviceId },
        ]);
      })
      .catch((err) => console.error("Quick command error:", err));
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="GPS Tracker Command Chat" size="fullscreen" draggable>
      <div className="chat-container">
        {/* LEFT PANEL */}
        <div className="chat-left">
          <div className="chat-card">
            <h3>Send Command</h3>

            <label>Device</label>
            <Select
              options={devices.map((d: any) => ({
                value: d.device_id,
                label: d.device_name,
              }))}
              value={
                devices
                  .map((d: any) => ({
                    value: d.device_id,
                    label: d.device_name,
                  }))
                  .find((opt) => opt.value === selectedDeviceId) || null
              }
              onChange={(selected: any) =>
                setSelectedDeviceId(selected ? selected.value : "")
              }
              placeholder="Select Device"
              menuPortalTarget={document.body}   // 🔥 IMPORTANT
              styles={{
                menuPortal: (base) => ({ ...base, zIndex: 9999 }), // 🔥 FIX OVERFLOW
              }}
            />

            <label>Category</label>
            <Select
              options={categoryOptions}
              value={
                categoryOptions.find((opt) => opt.value === category) || null
              }
              onChange={(selected: any) => {
                setCategory(selected ? selected.value : "");
                setCommand(""); // reset command (same logic as before)
              }}
              placeholder="Select Category"
              menuPortalTarget={document.body}   // 🔥 prevents overflow
              styles={{
                menuPortal: (base) => ({ ...base, zIndex: 9999 }), // 🔥 keeps it above modal
              }}
            />

            <label>Command</label>
            <Select
              options={subCategoryMap[category] || []}
              value={
                (subCategoryMap[category] || []).find(
                  (opt) => opt.value === command
                ) || null
              }
              onChange={(selected: any) =>
                setCommand(selected ? selected.value : "")
              }
              placeholder="Select Command"
              isDisabled={!category}   // 👈 same as your disabled logic
              classNamePrefix="custom-select"
              menuPortalTarget={document.body}
              styles={{
                menuPortal: (base) => ({ ...base, zIndex: 9999 }),
              }}
            />

            <div className="btn-row">
              <button className="btn-ct primary-ct" onClick={handleSendCommand}>
                Send Command
              </button>
              <button
                className="btn-ct secondary-ct"
                onClick={() => {
                  setCommand("");
                  setCategory("");
                }}
              >
                Clear Chat
              </button>
            </div>
          </div>

          <div className="chat-card">
            <h3>Recent Commands</h3>
            <div className="chat-logs">
              {logs.map((log, idx) => (
                <div key={idx} className="recent-command-item">
                  <div className="rc-left">
                    <strong>{log.commandName}</strong>
                    <div className="rc-sub">
                      Device: {log.deviceName || "VH001"}
                    </div>
                    <div className="rc-time">
                      {new Date(log.created_on).toLocaleString()}
                    </div>
                  </div>

                  <div className="rc-status success">
                    SUCCESS
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="chat-right">


          <div className="chat-card">
            <h3>Command Conversation</h3>
            <p className="sub-text">
              Sent command appears on right. Device reply appears on left.
            </p>

            <div className="chat-messages">
              {logs.length === 0 ? (
                <div className="chat-message system">
                  <strong>System</strong>
                  <p>
                    Chat is ready. Commands will appear on the right side and device
                    replies will appear on the left side.
                  </p>
                  <span className="time">Now</span>
                </div>
              ) : (
                logs.map((log, idx) => (
                  <div
                    key={idx}
                    className={`chat-message ${log.deviceId === selectedDeviceId ? "sent" : "received"
                      }`}
                  >
                    <strong>
                      {log.deviceId === selectedDeviceId
                        ? "You"
                        : log.deviceName || "Device"}
                    </strong>
                    <p>
                      {log.commandName}{" "}
                      {log.commandMsg ? `- ${log.commandMsg}` : ""}
                    </p>
                    <span className="time">
                      {new Date(log.created_on).toLocaleString()}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>


          {/* FOOTER */}
          <div className="chat-footer">
            <Select
              options={devices.map((d: any) => ({
                value: d.device_id,
                label: d.device_name,
              }))}
              value={
                devices
                  .map((d: any) => ({
                    value: d.device_id,
                    label: d.device_name,
                  }))
                  .find((opt) => opt.value === selectedDeviceId) || null
              }
              onChange={(selected: any) =>
                setSelectedDeviceId(selected ? selected.value : "")
              }
              placeholder="Select Device"
              menuPlacement="auto"
              menuPosition="fixed"
              menuPortalTarget={document.body}
              styles={{
                menuPortal: (base) => ({ ...base, zIndex: 9999 }),
              }}
            />

            <input
              placeholder="Type quick command..."
              value={quickCmd}
              onChange={(e) => setQuickCmd(e.target.value)}
            />

            <button className="btn-ct success-ct" onClick={handleSendQuick}>Send Quick</button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default CommandChatModal;