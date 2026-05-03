import React, { useState } from "react";
import type { NotificationDTO } from "../api/eventNotificationService";

interface Props {
  event: NotificationDTO;
}
const EventAlertPopup: React.FC<Props> = ({ event}) => {
  const [showDetails, setShowDetails] = useState(false);

  let attributes: any = {};
  try {
    attributes = event.attributes ? JSON.parse(event.attributes) : {};
  } catch {
    attributes = {};
  }
  /* ===== Ignition ===== */
  const ignitionData =
    attributes.ignition === false ? "OFF" : "ON";

  /* ===== RSSI ===== */
  const rssiData = attributes.rssi || "No Signal";

  /* ===== Engine Status ===== */
  let engineStatus = "Unknown";
  if (event.latitude === 0 && event.longitude === 0) {
    engineStatus = "No Data";
  } else if (event.speed > 0) {
    engineStatus = "Engine On (Moving)";
  } else if (event.speed === 0 && attributes.ignition === true) {
    engineStatus = "Engine On (Idle)";
  } else if (event.speed === 0 && attributes.ignition === false) {
    engineStatus = "Engine Off (Stopped)";
  }

  const safeFormatTime = (val: any): string => {
  if (!val) return "";

  const date =
    typeof val === "string" || typeof val === "number"
      ? new Date(val)
      : val instanceof Date
        ? val
        : null;

  if (!date || isNaN(date.getTime())) return "";

  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  };

  return new Intl.DateTimeFormat("en-GB", options)
    .format(date)
    .replace(",", "");
};

  return (
    <div
      className="info-window"
      style={{
        backgroundColor: "white",
    padding: 10,
    borderRadius: 10, // <-- increased radius for all corners
    fontSize: 12,
    boxShadow: "0 0 6px rgba(0,0,0,0.1)",
    overflow: "hidden",
      }}
    >
      {/* ===== Header ===== */}
      <div
        style={{
          backgroundColor: "#007bff",
          color: "#fff",
          padding: "8px 12px",
          fontWeight: "bold",
          borderTopLeftRadius: 4,
          borderTopRightRadius: 4,
          margin: "-10px -12px 10px -12px",
        }}
      >
        {event.alertType || "Alert"}
      </div>

      {/* ===== Body ===== */}
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <tbody>
          <tr>
            <td><b>Vehicle:</b></td>
            <td colSpan={2}>{event.deviceName || "-"}</td>
          </tr>
<tr>
  <td><b>Address:</b></td>
  <td colSpan={2}>
    {(event.address || "-").replace(/[\s,]+$/, "")}
  </td>
</tr>

          <tr>
            <td><b>Position:</b></td>
            <td colSpan={2}>
              <a
                href={`https://maps.google.com/?q=${event.latitude},${event.longitude}`}
                target="_blank"
                rel="noreferrer"
                style={{ color: "#1a73e8" }}
              >
                {event.latitude}°, {event.longitude}°
              </a>
            </td>
          </tr>

          <tr>
            <td><b>Time:</b></td>
            <td colSpan={2}>
  {safeFormatTime(event.alertTime) || "-"}
            </td>
          </tr>

          <tr>
            <td><b>Speed:</b></td>
            <td colSpan={2}>{event.speed || 0} kph</td>
          </tr>

          <tr>
            <td><b>Altitude:</b></td>
            <td colSpan={2}>{event.altitude || 0} m</td>
          </tr>

          <tr>
            <td><b>Angle:</b></td>
            <td colSpan={2}>{event.course || 0}°</td>
          </tr>

          {/* ===== Detailed Rows ===== */}
          {showDetails && (
            <>
              <tr>
                <td><b>Battery Voltage:</b></td>
                <td colSpan={2}>{attributes.battery || "-"} Volt</td>
              </tr>

              <tr>
                <td><b>Engine Status:</b></td>
                <td colSpan={2}>{engineStatus}</td>
              </tr>

              <tr>
                <td><b>GPS Signal:</b></td>
                <td colSpan={2}>{rssiData}</td>
              </tr>

              <tr>
                <td><b>Ignition:</b></td>
                <td colSpan={2}>{ignitionData}</td>
              </tr>

              <tr>
                <td><b>Internal Battery:</b></td>
                <td colSpan={2}>{attributes.battery || "-"}</td>
              </tr>
            </>
          )}

          {/* ===== Toggle ===== */}
          <tr>
            <td colSpan={3} style={{ textAlign: "right", paddingTop: 6 }}>
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  setShowDetails(!showDetails);
                }}
                style={{ color: "#1a73e8", fontSize: "0.75rem" }}
              >
                {showDetails ? "Hide Details" : "Detailed"}
              </a>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default EventAlertPopup;
