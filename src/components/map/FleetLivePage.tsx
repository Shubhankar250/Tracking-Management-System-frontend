import React, { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "../../assets/css/FleetLivePage.css";
import axiosClient from "../../api/axiosClient";

interface VehicleData {
  vehicle_name: string;
  latitude: number;
  longitude: number;
  status: string;
  deviceTime: string;
  address: string;
}

const getStatusIcon = (status: string) => {
  const st = (status || "").trim().toUpperCase();
  const color = st === "MOVING" ? "green" : "red";

  return L.divIcon({
    className: "custom-marker",
    html: `<i class="fa fa-bus" style="
            font-size:22px;
            color:${color};
            text-shadow: 0 0 2px #fff;
        "></i>`,
    iconSize: [22, 22],
    iconAnchor: [11, 11],
  });
};

const FleetLivePage: React.FC = () => {
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<{ [key: string]: L.Marker }>({});
  const [, setVehiclesData] = useState<{ [key: string]: VehicleData }>({});
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleData | null>(null);
const [error, setError] = useState<string | null>(null);
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const uc = params.get("uc"); // Unique code from URL

  const initMap = () => {
    if (!mapRef.current) {
      mapRef.current = L.map("mapid").setView([28.7041, 77.1025], 13);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors",
      }).addTo(mapRef.current);
    }
  };

  const clearMarkers = () => {
    Object.values(markersRef.current).forEach((marker) => {
      mapRef.current?.removeLayer(marker);
    });
    markersRef.current = {};
  };

  const drawMarker = (data: VehicleData) => {
    if (!data.latitude || !data.longitude || !mapRef.current) return;

    const marker = L.marker([data.latitude, data.longitude], {
      icon: getStatusIcon(data.status),
    })
      .addTo(mapRef.current)
      .bindTooltip(data.vehicle_name || "");

    marker.on("click", () => setSelectedVehicle(data));
    markersRef.current[data.vehicle_name] = marker;
  };

  const fetchLiveData = async () => {
    if (!uc) {
      setError(null);
      return;
    }

    try {
    const res = await axiosClient.get<{ data: VehicleData[] }>("/share-positions/weblive", {
  params: { uc },
});

      const vehicles = res.data.data || [];

      if (!mapRef.current) initMap();
      clearMarkers();
      setVehiclesData({});
      setError(null);

      if (vehicles.length > 0) {
        const newVehiclesData: { [key: string]: VehicleData } = {};
        vehicles.forEach((v) => {
          newVehiclesData[v.vehicle_name] = v;
          drawMarker(v);
        });
        setVehiclesData(newVehiclesData);

        const latlngs: [number, number][] = vehicles
          .filter((v) => v.latitude && v.longitude)
          .map((v) => [v.latitude, v.longitude]);

        if (latlngs.length > 0) {
          mapRef.current?.fitBounds(L.latLngBounds(latlngs), { padding: [30, 30] });
        }
      } else {
        setError(null);
      }
    } catch (err: any) {
  const backendMessage =
    err?.response?.data?.detail ||
    err?.response?.data?.title ||
    "Something went wrong.";

  setError(backendMessage);
}
  };

  useEffect(() => {
    initMap();
    const interval = setInterval(fetchLiveData, 3000);
    return () => clearInterval(interval);
  }, [uc]);

  return (
    <div id="map-page" style={{ position: "relative", height: "100vh" }}>
      <div id="mapid" style={{ height: "100%", width: "100%" }}></div>

    {error && (
  <div className="error_msg">
    <h4>
      <b>{error}</b>
    </h4>
  </div>
)}

      {selectedVehicle && (
        <div className="vehicle-info-panel">
          <div className="info-header">
            <i className="fa fa-bus"></i> {selectedVehicle.vehicle_name}
            <span
              className="dot"
              style={{
                display: "inline-block",
                width: 10,
                height: 10,
                borderRadius: "50%",
                backgroundColor: selectedVehicle.status.toUpperCase() === "MOVING" ? "green" : "red",
                marginLeft: 8,
              }}
            ></span>
          </div>
          <div className="info-body">
            <p>{selectedVehicle.deviceTime}</p>
            <p>{selectedVehicle.address}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default FleetLivePage;
