import React, { useState } from "react";
import PhotoAlbum from "react-photo-album";
import "../../assets/css/VideoGallery.css";
import axiosClient from "../../api/axiosClient";
import Modal from "../common/Modal";
interface Props {
  deviceId: string;
}

const VideoGallery: React.FC<Props> = ({ deviceId }) => {

  // ✅ Get today's date (YYYY-MM-DD)
  const today = new Date().toISOString().split("T")[0];

  const [fromDate, setFromDate] = useState<string>(today);
  const [toDate, setToDate] = useState<string>(today);
  const [isModalOpen, setIsModalOpen] = useState(false);
const [selectedImage, setSelectedImage] = useState<any>(null);
const handlePhotoClick = (photo: any) => {
  setSelectedImage(photo);
  setIsModalOpen(true);
};

  const [photos, setPhotos] = useState<any[]>([]); // ✅ added
  const [type, setType] = useState<string>("all");
  //const BASE_URL = "http://localhost:8091";
  const BASE_URL = "https://fleetplus.trackingpath.com";

  const handleSearch = async () => {
  try {
    const res = await axiosClient.get("/command/snapshot-data", {
      params: {
        deviceId,
        startTime: fromDate,
        endTime: toDate,
      },
    });

    const json = res.data;

    if (json.success) {
   const formatted = json.data.map((item: any) => {
  if (!item.imagePath || item.imagePath.trim() === "") {
    return null;
  }

  const publicPath = item.imagePath.replace(
    "/home/dashcam_upload/snapshot/",
    "/snapshots/"
  );

  return {
    src: BASE_URL + publicPath,
    width: 1,
    height: 1,
    createdOn: item.createdOn, // 👈 add this
    rawPath: item.imagePath,   // 👈 for delete/download
  };
}).filter(Boolean);

      setPhotos(formatted);
    }
  } catch (err) {
    console.error("Error fetching snapshots:", err);
  }
};

  return (
    <div className="vg-container">
      {/* Top Search Panel */}
      <div className="vg-panel">
        <div className="vg-filter">
          <label htmlFor="fromDate">From</label>
          <input
            id="fromDate"
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
          />
        </div>

        <div className="vg-filter">
          <label htmlFor="toDate">To</label>
          <input
            id="toDate"
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
          />
        </div>
<div className="vg-filter">
  <label htmlFor="type">Type</label>
  <select
    id="type"
    value={type}
    onChange={(e) => setType(e.target.value)}
  >
    <option value="all">All</option>
    <option value="manual_snapshot">Manual Snapshot</option>
    <option value="scheduled_tasks">Scheduled Tasks</option>
    <option value="linked_file">Linked File</option>
  </select>
</div>
        <button className="vg-save-btn" onClick={handleSearch}>
          Search
        </button>
      </div>

      {/* Content Area */}
      <div className="vg-content">
        {photos.length === 0 ? (
          <p>Snapshots & videos will be shown here.</p>
        ) : (
        <PhotoAlbum
  layout="rows"
  targetRowHeight={120}
  spacing={12}
  photos={photos}
  onClick={({ photo }) => handlePhotoClick(photo)}
/>

        )}
      </div>
      <Modal
  isOpen={isModalOpen}
  title="Image Preview"
  onClose={() => setIsModalOpen(false)}
  size="fullscreen"
>
  {selectedImage && (
    <div className="preview-container">
      <img
        src={selectedImage.src}
        alt="preview"
        className="preview-img"
      />

      <div className="preview-footer">
        Created On: {selectedImage.createdOn}
      </div>
    </div>
  )}
</Modal>
    </div>
  );
};

export default VideoGallery;