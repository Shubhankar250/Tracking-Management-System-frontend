import React, { useState } from "react";
import type { LiveDataDto } from "../api/liveService";

interface VehiclePopupProps {
  vehicle: LiveDataDto;
  onClose: (deviceId: number | string) => void; 
}

const VehiclePopup: React.FC<VehiclePopupProps> = ({ vehicle, onClose }) => {
  const [showDetails, setShowDetails] = useState(false);

  const attributes =
    typeof vehicle.attributes === "string"
      ? JSON.parse(vehicle.attributes || "{}")
      : vehicle.attributes || {};
  const ignitionStatus = vehicle.ignition ? "On" : "Off";

  let engineStatus = "Unknown";
  if (vehicle.latitude === 0 && vehicle.longitude === 0)
    engineStatus = "No Data";
  else if (vehicle.speed > 0) engineStatus = "Engine On (Moving)";
  else if (vehicle.speed === 0 && vehicle.ignition)
    engineStatus = "Engine On (Idle)";
  else if (vehicle.speed === 0 && !vehicle.ignition)
    engineStatus = "Engine Off (Stopped)";

  const movementTime =
    typeof vehicle.lastmovementtime === "number"
      ? `${vehicle.lastmovementtime} sec`
      : vehicle.lastmovementtime || "-";
  const idleTime =
    typeof vehicle.lastidletime === "number"
      ? `${vehicle.lastidletime} sec`
      : vehicle.lastidletime || "-";

  const deviceStatusColor = vehicle.status === "online" ? "#1ed760" : "red";

  const formatDeviceTime = (val: any) => {
    if (!val) return "";

    let date: Date;

    // Agar number hai (timestamp)
    if (typeof val === "number") {
      date = new Date(val);
    }
    // Agar string ISO format hai
    else if (typeof val === "string") {
      date = new Date(val);
    }
    // Agar already Date object hai
    else if (val instanceof Date) {
      date = val;
    } else {
      return "";
    }

    if (isNaN(date.getTime())) return "";

    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();

    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const seconds = String(date.getSeconds()).padStart(2, "0");

    return `${day}-${month}-${year} ${hours}:${minutes}:${seconds}`;
  };

  return (
    <div
      style={{
        backgroundColor: "white",
        padding: 10,
        borderRadius: 10, // <-- increased radius for all corners
        fontSize: 12,
        boxShadow: "0 0 6px rgba(0,0,0,0.1)",
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <div
        style={{
          backgroundColor: "#007bff",
          color: "#fff",
          padding: "8px 12px",
          fontWeight: "bold",
          borderTopLeftRadius: 4,
          borderTopRightRadius: 4,
          margin: "-10px -12px 10px -12px",

          borderRadius: 4,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
          {vehicle.device_name}
          <span
            style={{
              width: 13, // width of the dot
              height: 13, // height of the dot
              backgroundColor: deviceStatusColor,
              borderRadius: "50%", // makes it a perfect circle
              display: "inline-block",
            }}
          />
        </span>

        {/* Single close icon */}
        <i
          className="fa fa-times"
          style={{ cursor: "pointer" }}
          title="Close"
         onClick={() => onClose(vehicle.device_id)}
        />
      </div>

      {/* Body Table */}
      <table
        style={{ width: "100%", borderCollapse: "collapse", marginTop: 6 }}
      >
        <tbody>
          <tr>
            <td style={{ fontWeight: "bold" }}>Address:</td>
            <td>{vehicle.address}</td>
          </tr>
          <tr>
            <td style={{ fontWeight: "bold" }}>Position:</td>

            <td>
              <a
                href={`https://maps.google.com/?q=${vehicle.latitude},${vehicle.longitude}`}
                target="_blank"
                rel="noreferrer"
                style={{ color: "#1a73e8" }}
              >
                {vehicle.latitude}°, {vehicle.longitude}°
              </a>
            </td>
          </tr>
          <tr>
            <td style={{ fontWeight: "bold" }}>Altitude:</td>
            <td>{vehicle.altitude} m</td>
          </tr>
          <tr>
            <td style={{ fontWeight: "bold" }}>Angle:</td>
            <td>{vehicle.course}&deg;</td>
          </tr>
          <tr>
            <td style={{ fontWeight: "bold" }}>Speed:</td>
            <td>{vehicle.speed} kph</td>
          </tr>
          <tr>
            <td style={{ fontWeight: "bold" }}>Time:</td>
            <td>{formatDeviceTime(vehicle.devicetime)}</td>
          </tr>
          <tr>
            <td style={{ fontWeight: "bold" }}>Odometer:</td>
            <td>{attributes.total_odometer || 0}</td>
          </tr>

          {vehicle.speed > 0 ?  (
            <tr>
              <td style={{ fontWeight: "bold" }}>Movement Time:</td>
              <td>{idleTime}</td>
            </tr>
          ) : (
            <tr>
              <td style={{ fontWeight: "bold" }}>Idle Time:</td>
              <td>{movementTime}</td>
            </tr>
          )}

          {/* Detailed rows */}
          {showDetails && (
            <>
              <tr>
                <td style={{ fontWeight: "bold" }}>Battery Voltage:</td>
                <td>{attributes.battery || "-"}</td>
              </tr>
              <tr>
                <td style={{ fontWeight: "bold" }}>Engine Status:</td>
                <td>{engineStatus}</td>
              </tr>
              <tr>
                <td style={{ fontWeight: "bold" }}>GPS Signal:</td>
                <td>{attributes.rssi || "No Signal"}</td>
              </tr>
              <tr>
                <td style={{ fontWeight: "bold" }}>Ignition:</td>
                <td>{ignitionStatus}</td>
              </tr>
            </>
          )}

          {/* Toggle link */}
          <tr>
            <td colSpan={2} style={{ textAlign: "right", paddingTop: 6 }}>
              <a
                href="#!"
                style={{ fontSize: "0.75rem", color: "#1a73e8" }}
                onClick={(e) => {
                  e.preventDefault();
                  setShowDetails(!showDetails);
                }}
              >
                Detailed
              </a>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default VehiclePopup;
