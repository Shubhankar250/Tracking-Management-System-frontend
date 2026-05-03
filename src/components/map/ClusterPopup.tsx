import React, { useState } from "react";
import "../../assets/css/ClusterPopup.css";

import engineOn from "../../assets/images/engine-on.png";
import engineOff from "../../assets/images/engine-off.png";
import engineIdle from "../../assets/images/orange-engine.png";
import engineDefault from "../../assets/images/default-engine.png";

interface Props {
  cluster: any;
  vehicles: any[];
  onClose: () => void;
  onVehicleClick: (vehicle: any) => void;
}

const ClusterPopup: React.FC<Props> = ({
  cluster,
  vehicles = [],
  onClose,
  onVehicleClick,
}) => {
  const [filter, setFilter] = useState("");

  const handleZoom = () => {
    if (!cluster) return;

    const map = cluster._map;
    if (!map) return;

    const childMarkers = cluster.getAllChildMarkers();

    if (childMarkers.length === 1) {
      map.setView(childMarkers[0].getLatLng(), 18, {
        animate: true,
      });
    } else {
      const bounds = cluster.getBounds();

      map.fitBounds(bounds, {
        padding: [80, 80],
        maxZoom: 18,
        animate: true,
      });
    }

    onClose();
  };

  const filteredVehicles = vehicles.filter((v) =>
    v?.device_name?.toLowerCase().includes(filter.toLowerCase()),
  );

  return (
    <div style={{ width: "200px", padding: "6px" }}>
      <h4 style={{ marginTop: "2px" }}>
        {filteredVehicles.length} vehicles in this cluster
      </h4>

      <input
        type="text"
        placeholder="Filter by name..."
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        style={{
          width: "188px",
          padding: "6px",
          marginBottom: "10px",
          marginTop: "-7px",
        }}
      />

      <div style={{ maxHeight: 200, overflowY: "auto" }}>
        {filteredVehicles.length > 0 ? (
          filteredVehicles.map((v, index) => {
            // 🔹 Attributes parse
            let attrs: any = {};
            try {
              attrs =
                typeof v.attributes === "string"
                  ? JSON.parse(v.attributes)
                  : v.attributes || {};
            } catch {
              attrs = {};
            }

            const speed = v.speed ?? 0;
            const ignition = attrs?.ignition === true;

            // 🔥 SAME LOGIC AS SIDEBAR
            const deviceTime = v.devicetime
              ? new Date(v.devicetime).getTime()
              : 0;

            const isRecent = Date.now() - deviceTime <= 10 * 60 * 1000;

            const isOnline = v.status === "online" && isRecent;

            const isInactive = !isOnline;

            // 🔹 Engine logic
            let engineIcon = "";
            let engineTitle = "";

            if (v.latitude === 0 && v.longitude === 0) {
              engineIcon = engineDefault;
              engineTitle = "No Data";
            } else if (speed > 0) {
              engineIcon = engineOn;
              engineTitle = "Engine On (Moving)";
            } else if (speed === 0 && ignition === true) {
              engineIcon = engineIdle;
              engineTitle = "Engine Idle";
            } else {
              engineIcon = engineOff;
              engineTitle = "Engine Off (Stopped)";
            }

            const odometer = attrs?.odometer ?? 0;
            const gpsSat = attrs?.sat ?? 0;
            const gsm = attrs?.rssi ?? 0;

            return (
              <div
                key={`${v.device_id}-${index}`}
                style={{
                  marginBottom: 8,
                  padding: 4,
                  borderBottom: "1px solid #eee",
                  cursor: "pointer",
                  marginLeft: "10px",
                }}
                onClick={() => onVehicleClick(v)}
              >
                {/* NAME */}
                <div>
                  <strong>
                    {v.device_name} ({speed} kph)
                  </strong>
                </div>

                {/* STATUS ROW */}
                <div
                  style={{
                    marginTop: 4,
                    display: "flex",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: 8,
                  }}
                >
                  {/* STATUS DOT */}
                  <i
                    className={`fas fa-circle`}
                    title={`Status: ${isOnline ? "Online" : "Offline"}`}
                    style={{
                      color: isOnline ? "green" : "red",
                      fontSize: 10,
                    }}
                  />

                  {/* IGNITION */}
                  <i
                    className={`fas fa-key ${
                      isInactive ? "disabled-status" : ""
                    } ${!isOnline ? "ignition-disabled" : ""}`}
                    title={`Ignition: ${ignition ? "ON" : "OFF"}`}
                    style={{
                      color: ignition ? "green" : "red",
                    }}
                  />

                  {/* ENGINE */}
                  <img
                    src={engineIcon}
                    title={engineTitle}
                    alt="engine"
                    className={`${
                      isInactive ? "engine-disabled disabled-status" : ""
                    }`}
                    style={{ height: 16 }}
                  />

                  {/* ODOMETER */}
                  <i
                    className={`fas fa-road ${
                      isInactive ? "disabled-status" : ""
                    }`}
                    title={`Odometer: ${odometer}`}
                    style={{ color: "#6c757d" }}
                  />

                  {/* GPS */}
                  <i
                    className={`fas fa-satellite-dish ${
                      isInactive ? "disabled-status" : ""
                    }`}
                    title={`GPS: ${gpsSat}`}
                    style={{ color: "blue" }}
                  />

                  {/* GSM */}
                  <div
                    className={`signal-bars ${
                      isInactive ? "disabled-status" : ""
                    }`}
                    title={`GSM Signal: ${(gsm ?? 0) * 20}%`}
                    style={{
                      display: "flex",
                      alignItems: "flex-end",
                      gap: 3,
                      height: 25,
                      paddingBottom: 10,
                    }}
                  >
                    {[1, 2, 3, 4, 5].map((bar) => {
                      let color = "#ccc";

                      if (gsm <= 2) color = "red";
                      else if (gsm < 5) color = "blue";
                      else color = "green";

                      return (
                        <span
                          key={bar}
                          style={{
                            width: 3,
                            height: bar * 3,
                            background: gsm >= bar ? color : "#ccc",
                            borderRadius: 2,
                          }}
                        />
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div>No vehicles found</div>
        )}
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginTop: 10,
          marginRight: "12px",
        }}
      >
        <button onClick={handleZoom}>Zoom to cluster</button>
        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
};

export default ClusterPopup;
