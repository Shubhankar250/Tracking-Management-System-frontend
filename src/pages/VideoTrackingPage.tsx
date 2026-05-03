import React, { useState, useEffect } from "react";
import { useParams, useLocation } from "react-router-dom";
import "../assets/css/videoTracking.css";
import { useAppDispatch } from "../redux/hooks";
import { fetchLiveDataByDeviceId } from "../slices/liveDataByDeviceIdSlice";

import LiveVideo from "../components/common/LiveVideo";
import VideoHistory from "../components/common/VideoHistory";
import VideoEvents from "../components/common/VideoEvents";
import VideoGallery from "../components/common/VideoGallery";
import VideoSettings from "../components/common/VideoSettings";
import VideoDownload from "../components/common/VideoDownload";

import Header from "../components/common/VideoHeader";
import Footer from "../components/common/VideoFooter";

type VideoTab =
  | "live"
  | "history"
  | "events"
  | "gallery"
  | "settings"
  | "download-center";

const VideoTrackingPage: React.FC = () => {
  const { deviceId } = useParams<{ deviceId: string }>();
  const location = useLocation();
  const dispatch = useAppDispatch();

  // ✅ Detect if only history page is required
  const isHistoryOnly = location.pathname.includes("/history");
const isGalleryOnly = location.pathname.includes("/gallery");
const isDownloadOnly = location.pathname.includes("/download");

  // ✅ Set initial tab based on URL
 const getInitialTab = (): VideoTab => {
  if (isHistoryOnly) return "history";
  if (isGalleryOnly) return "gallery";
  if (isDownloadOnly) return "download-center";
  return "live";
};
const isSingleTabView = isHistoryOnly || isGalleryOnly || isDownloadOnly;
  const [activeTab, setActiveTab] = useState<VideoTab>(getInitialTab());

  // ✅ Fetch device live data (same as before)
  useEffect(() => {
    if (deviceId) {
      dispatch(fetchLiveDataByDeviceId(Number(deviceId)));
    }
  }, [deviceId, dispatch]);

  return (
    <>
      {!isSingleTabView && <Header />}

      <div className="video-page">
        {/* ✅ Hide tabs if history-only */}
        {!isSingleTabView && (
          <div className="video-tabs">
            <button
              className={`video-tab ${activeTab === "live" ? "active" : ""}`}
              onClick={() => setActiveTab("live")}
            >
              <i className="bi bi-broadcast"></i>
              <span>Live</span>
            </button>

            <button
              className={`video-tab ${activeTab === "history" ? "active" : ""}`}
              onClick={() => setActiveTab("history")}
            >
              <i className="bi bi-clock-history"></i>
              <span>History</span>
            </button>

            <button
              className={`video-tab ${activeTab === "events" ? "active" : ""}`}
              onClick={() => setActiveTab("events")}
            >
              <i className="bi bi-exclamation-circle"></i>
              <span>Events</span>
            </button>

            <button
              className={`video-tab ${activeTab === "gallery" ? "active" : ""}`}
              onClick={() => setActiveTab("gallery")}
            >
              <i className="bi bi-images"></i>
              <span>Gallery</span>
            </button>

            <button
              className={`video-tab ${activeTab === "settings" ? "active" : ""}`}
              onClick={() => setActiveTab("settings")}
            >
              <i className="bi bi-gear"></i>
              <span>Settings</span>
            </button>

            <button
              className={`video-tab ${
                activeTab === "download-center" ? "active" : ""
              }`}
              onClick={() => setActiveTab("download-center")}
            >
              <i className="bi bi-download"></i>
              <span>Download Center</span>
            </button>
          </div>
        )}

        {/* ✅ Content */}
       <div className="video-content">
  {isSingleTabView ? (
    <>
      {isHistoryOnly && <VideoHistory deviceId={deviceId!} />}
      {isGalleryOnly && <VideoGallery deviceId={deviceId!} />}
      {isDownloadOnly && <VideoDownload deviceId={deviceId!} />}
    </>
  ) : (
    <>
      {activeTab === "live" && (
        <LiveVideo
          deviceId={deviceId!}
          onOpenHistory={() => setActiveTab("history")}
        />
      )}
      {activeTab === "history" && (
        <VideoHistory deviceId={deviceId!} />
      )}
      {activeTab === "events" && (
        <VideoEvents deviceId={deviceId!} />
      )}
      {activeTab === "gallery" && (
        <VideoGallery deviceId={deviceId!} />
      )}
      {activeTab === "settings" && (
        <VideoSettings deviceId={deviceId!} />
      )}
      {activeTab === "download-center" && (
        <VideoDownload deviceId={deviceId!} />
      )}
    </>
  )}
</div>
      </div>

      {!isSingleTabView && <Footer />}
    </>
  );
};

export default VideoTrackingPage;