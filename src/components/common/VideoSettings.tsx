import React, { useState } from "react";
import Modal from "../common/Modal";
import "../../assets/css/videosetting.css";

interface Props {
  deviceId: string;
}

const VideoSettings: React.FC<Props> = ({ deviceId }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [uploadFiles, setUploadFiles] = useState(true);
  const [startTime, setStartTime] = useState("00:00:00");
  const [endTime, setEndTime] = useState("23:59:59");
  const [timeZone, setTimeZone] = useState("UTC+00");
  const [minutes, setMinutes] = useState("00");
  const [fileCount, setFileCount] = useState("Default");

  const handleSave = () => {
    console.log({
      deviceId,
      uploadFiles,
      startTime,
      endTime,
      timeZone: `${timeZone}:${minutes}`,
      fileCount,
    });
    setIsModalOpen(false);
  };

  return (
    <div className="setting-content">
      <div className="settings-header">
  <div>
    <h2>Settings</h2>
    <p>Device & camera settings.</p>
  </div>

  <button
    onClick={() => setIsModalOpen(true)}
    className="btn edit-btn"
  >
    Edit
  </button>
</div>
      <Modal
  isOpen={isModalOpen}
  title="MC202N-14025 (MC202N)"
  onClose={() => setIsModalOpen(false)}
  size="medium"
>
  <form className="setting-form">

    {/* Alert Type */}
    <div className="form-group">
      <label>Alert Type</label>
      <input
        type="text"
        value="Hands-Off Detection (HOD)"
        disabled
      />
    </div>

    {/* Upload Files */}
   <div className="form-group">
  <label>Upload Files</label>

  <label className="switch">
    <input
      type="checkbox"
      checked={uploadFiles}
      onChange={(e) => setUploadFiles(e.target.checked)}
    />
    <span className="slider"></span>
  </label>
</div>

    {/* Start Time */}
    <div className="form-group">
      <label>Start Time</label>
      <input
        type="time"
        step="1"
        value={startTime}
        onChange={(e) => setStartTime(e.target.value)}
      />
    </div>

    {/* End Time */}
    <div className="form-group">
      <label>End Time</label>
      <input
        type="time"
        step="1"
        value={endTime}
        onChange={(e) => setEndTime(e.target.value)}
      />
    </div>

    {/* Time Zone */}
    <div className="form-group">
      <label>Time Zone</label>
      <div className="timezone-row">
        <select
          value={timeZone}
          onChange={(e) => setTimeZone(e.target.value)}
        >
          <option value="UTC+00">UTC+00</option>
          <option value="UTC+01">UTC+01</option>
          <option value="UTC+05">UTC+05</option>
        </select>

        <select
          value={minutes}
          onChange={(e) => setMinutes(e.target.value)}
        >
          <option value="00">00</option>
          <option value="30">30</option>
        </select>
      </div>
    </div>

    {/* Number of files */}
    <div className="form-group">
      <label>Number of files uploaded</label>
      <select
        value={fileCount}
        onChange={(e) => setFileCount(e.target.value)}
      >
        <option value="Default">Default</option>
        <option value="1">1</option>
        <option value="5">5</option>
        <option value="10">10</option>
      </select>
    </div>

   {/* Save */}
<div className="modal-footer-custom">
  <button
    type="button"
    className="btn save-btn"
    onClick={handleSave}
  >
    Save
  </button>
</div>

  </form>
</Modal>

    </div>
  );
};

export default VideoSettings;
