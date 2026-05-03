import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import {
  fetchCommandLogs,
  fetchCommandsByDevice,
  sendCommand,
} from "../slices/commandSlice";
import type { CommandDTO } from "../api/commandService";
import type { Column } from "../components/common/DatatableNew";
import Modal from "../components/common/Modal";
import Datatable from "../components/common/DatatableNew";
import { closeModal, openModal } from "../slices/uiSlice";
import "../assets/css/sendcommand-modal.css";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  deviceId?: number | null;
}

const SendcommandModal = ({ isOpen, onClose, deviceId }: Props) => {
  const dispatch = useAppDispatch();

  /* 🔹 PAGINATION STATE */
  const [page, setPage] = useState(1); // UI is 1-based
  const [pageSize, setPageSize] = useState(25);
  const [search, setSearch] = useState("");

  /* 🔹 REDUX STATE */
  const devices = useAppSelector((s) => s.live.devices);
  const deviceCommands = useAppSelector((s) => s.commands.deviceCommands);
  const commandLogs = useAppSelector((s) => s.commands.commandLogs);
  const totalElements = useAppSelector((s) => s.commands.logTotalElements);
  const loading = useAppSelector((s) => s.commands.loading);

  /* 🔹 LOCAL STATE */
  const [selectedDeviceId, setSelectedDeviceId] = useState<number | "">("");
  const [commandCode, setCommandCode] = useState("");

  /* 🔄 FETCH LOGS */
  const refresh = () => {
    dispatch(
      fetchCommandLogs({
        page: page - 1, // backend is 0-based
        size: pageSize,
        search,
      })
    );
  };

  /* 🔄 LOAD WHEN MODAL OPENS OR PAGINATION CHANGES */
  useEffect(() => {
    if (isOpen) {
      refresh();
      dispatch(openModal());
    } else {
      dispatch(closeModal());
    }
  }, [isOpen, page, pageSize, search]);

  /* 🔥 AUTO SELECT DEVICE */
  useEffect(() => {
    if (deviceId) {
      setSelectedDeviceId(deviceId);
      dispatch(fetchCommandsByDevice(deviceId));
      setCommandCode("");
    }
  }, [deviceId]);

  /* 🔄 FETCH COMMANDS WHEN DEVICE CHANGES */
  useEffect(() => {
    if (selectedDeviceId) {
      dispatch(fetchCommandsByDevice(selectedDeviceId));
      setCommandCode("");
    }
  }, [selectedDeviceId]);

  /* 📤 SEND COMMAND */
  const handleSend = () => {
    if (!selectedDeviceId || !commandCode) return;

    const payload: CommandDTO = {
      deviceId: selectedDeviceId,
      commandCode,
      commandName: deviceCommands[commandCode],
    };

    dispatch(sendCommand(payload)).then(() => {
      setPage(1); // reset to first page
      refresh();
    });
  };

  const resetForm = () => {
    setSelectedDeviceId("");
    setCommandCode("");
  };

  const handleClose = () => {
    dispatch(closeModal());
    onClose();
  };

  /* 📋 TABLE COLUMNS */
  const columns: Column<CommandDTO>[] = [
    { key: "deviceName", label: "Device" },
    { key: "commandName", label: "Command" },
    { key: "commandMsg", label: "Response" },
    { key: "created_on", label: "Date & Time" },
  ];

  return (
    <Modal
      isOpen={isOpen}
      title="Command"
      onClose={handleClose}
      size="large"
      draggable
    >
      {/* 🔽 FORM */}
      <div style={{ padding: "20px" }}>
        <div className="d-flex align-items-center flex-wrap" style={{ gap: "10px" }}>
          
          <select
            className="sendcommand-select"
            value={selectedDeviceId}
            onChange={(e) =>
              setSelectedDeviceId(e.target.value ? Number(e.target.value) : "")
            }
          >
            <option value="">Select Device</option>
            {devices.map((d: any) => (
              <option key={d.device_id} value={d.device_id}>
                {d.device_name}
              </option>
            ))}
          </select>

          <select
            className="sendcommand-select"
            value={commandCode}
            disabled={!selectedDeviceId}
            onChange={(e) => setCommandCode(e.target.value)}
          >
            <option value="">Select Command</option>
            {Object.entries(deviceCommands).map(([code, name]) => (
              <option key={code} value={code}>
                {name}
              </option>
            ))}
          </select>

          <button
            className="sendcommand-button sendcommand-button-primary"
            disabled={!selectedDeviceId || !commandCode || loading}
            onClick={handleSend}
          >
            {loading ? "Sending..." : "Send"}
          </button>

          <button
            className="sendcommand-button sendcommand-button-danger"
            onClick={resetForm}
          >
            ⟳
          </button>
        </div>
      </div>

      {/* 📋 LOG TABLE */}
      <Datatable
        columns={columns}
        data={commandLogs}
        totalRecords={totalElements} // ✅ FIXED
        page={page}
        pageSize={pageSize}
        search={search}
        onPageChange={setPage}
        onSearchChange={(value) => {
          setPage(1);
          setSearch(value);
        }}
        onPageSizeChange={(size) => {
          setPageSize(size);
          setPage(1);
        }}
        onFetch={refresh}
      />
    </Modal>
  );
};

export default SendcommandModal;