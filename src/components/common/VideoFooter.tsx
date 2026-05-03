import React from "react";

const VideoFooter: React.FC = () => {
  return (
    <footer
      style={{
        backgroundColor: "#f5f5f5",
        borderTop: "1px solid #ddd",
        padding: "10px 20px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        fontSize: "14px",
        color: "#555",
      }}
    >
      {/* Left Side */}
      <div>
© 2026 TrackingPath (AVSG Info Systems Pvt Ltd)      </div>

      {/* Right Side */}
      <div>
        Smart Video Monitoring • GPS + AI Platform
      </div>
    </footer>
  );
};

export default VideoFooter;