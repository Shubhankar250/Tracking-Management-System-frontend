import {
  MapContainer,
  TileLayer,
  Marker,
  Tooltip,
  Polyline,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import { useEffect, useMemo, useRef, useState } from "react";
import "leaflet/dist/leaflet.css";
import "leaflet-fullscreen/dist/leaflet.fullscreen.css";
import "leaflet-fullscreen";
import "leaflet-rotatedmarker";

/* ================= FULLSCREEN ================= */
const FullscreenControl = () => {
  const map = useMap();

  useEffect(() => {
    // @ts-ignore
    const fullscreenControl = new L.Control.Fullscreen({
      position: "topright",
    });

    map.addControl(fullscreenControl);

    return () => {
      map.removeControl(fullscreenControl);
    };
  }, [map]);

  return null;
};

  /* ========== ICON ========== */
const getDynamicIcon = (deviceSetting: any, course: number) => {
  const iconType = deviceSetting?.icon_type || "Icon";

  /* ===== ARROW ===== */
  if (iconType.toLowerCase() === "arrow") {
    return L.divIcon({
      className: "arrow-marker",
      html: `
        <div style="
          transform: rotate(${course}deg);
          font-size:22px;
          color:#ff3b30;
          line-height:1;
        ">▲</div>
      `,
      iconSize: [24, 24],
      iconAnchor: [12, 12],
    });
  }

  /* ===== ROTATING ICON ===== */
  if (iconType.toLowerCase() === "rotating_icon") {
    const iconName = deviceSetting?.img_icon_name || "car1.png";

    const iconUrl = new URL(
      `../../assets/images/device_icon/rotating_icon/${iconName}`,
      import.meta.url
    ).href;

    return L.divIcon({
      className: "rotating-marker",
      html: `
        <img src="${iconUrl}" style="
          width:20px;
          height:38px;
          transform: rotate(${course}deg);
          transform-origin:center;
        "/>
      `,
      iconSize: [20, 38],
      iconAnchor: [16, 16],
    });
  }

  /* ===== NORMAL ICON ===== */
  const iconName = deviceSetting?.img_icon_name || "car1.png";

  const iconUrl = new URL(
    `../../assets/images/device_icon/icon/${iconName}`,
    import.meta.url
  ).href;

  return L.icon({
    iconUrl,
    iconSize: [20, 38],
    iconAnchor: [16, 32],
  });
};

/* ================= RECENTER ================= */
const RecenterControl = ({ lat, lng }: { lat: number; lng: number }) => {
  const map = useMap();

  useEffect(() => {
    const Recenter = L.Control.extend({
      options: { position: "topleft" },

      onAdd: function () {
        const container = L.DomUtil.create(
          "div",
          "leaflet-bar leaflet-control"
        );

        container.style.background = "#fff";
        container.style.cursor = "pointer";
        container.style.padding = "4px";
        container.style.fontSize = "14px";
        container.style.width = "25px";
        container.style.height = "25px";
        container.style.display = "flex";
        container.style.alignItems = "center";
        container.style.justifyContent = "center";
        container.innerHTML = "🎯";
        container.title = "Recenter";

        /* ⭐ Prevent map drag when clicking */
        L.DomEvent.disableClickPropagation(container);

        container.onclick = () => {
          if (!lat || !lng) return;
          map.setView([lat, lng], map.getZoom(), { animate: true });
        };

        return container;
      },
    });

    const ctrl = new Recenter();
    map.addControl(ctrl);

    return () => {
      map.removeControl(ctrl);   // ✅ FIXED
    };

  }, [map, lat, lng]);

  return null;
};

/* ================= FOLLOW CAMERA ================= */
const FollowUpdater = ({ lat, lng }: { lat: number; lng: number }) => {
  const map = useMap();

  useEffect(() => {
    map.panTo([lat, lng], { animate: true });
  }, [lat, lng, map]);

  return null;
};

/* ================= MAIN MAP ================= */

const FollowMap = ({
  lat,
  lng,
  vehicleName,
  speed,
  deviceSetting,
  course = 0,
}: any) => {

const markerRef = useRef<L.Marker | null>(null);

  const [path, setPath] = useState<[number, number][]>([[lat, lng]]);


  const vehicleIcon = useMemo(() => {
    return getDynamicIcon(deviceSetting, course);
  }, [deviceSetting, course]);
  /* ========== SMOOTH MOVEMENT + TRAIL ========== */


const animRef = useRef<number | null>(null);

useEffect(() => {
  const marker = markerRef.current;
  if (!marker) return;

  const startLatLng = marker.getLatLng();
  const endLatLng = L.latLng(lat, lng);

  const distance = startLatLng.distanceTo(endLatLng); // meters

  // convert kmh → m/s
  const speedMs = Math.max(speed || 5, 5) * 1000 / 3600;

  // duration based on physics
  const duration = Math.min((distance / speedMs) * 1000, 5000);

  let startTime: number | null = null;

  if (animRef.current !== null) {
    cancelAnimationFrame(animRef.current);
  }

  const animate = (time: number) => {
    if (!startTime) startTime = time;

    const t = Math.min((time - startTime) / duration, 1);

    // ease-out cubic (very natural)
    const ease = 1 - Math.pow(1 - t, 3);

    const curLat =
      startLatLng.lat + (endLatLng.lat - startLatLng.lat) * ease;

    const curLng =
      startLatLng.lng + (endLatLng.lng - startLatLng.lng) * ease;

    marker.setLatLng([curLat, curLng]);

    if (t < 1) {
      animRef.current = requestAnimationFrame(animate);
    }
  };

  animRef.current = requestAnimationFrame(animate);

  setPath(prev => [...prev.slice(-200), [lat, lng]]);

  return () => {
    if (animRef.current !== null) {
      cancelAnimationFrame(animRef.current);
    }
  };

}, [lat, lng, speed]);



useEffect(() => {
  const marker = markerRef.current;
  if (!marker) return;

  // Only for NORMAL icon (not arrow / rotating divIcon)
  if (deviceSetting?.icon_type?.toLowerCase() !== "icon") return;

  const m = marker as L.Marker & {
    setRotationAngle: (n: number) => void;
    options: any;
  };

  const current = m.options.rotationAngle || 0;

  let delta = course - current;
  if (delta > 180) delta -= 360;
  if (delta < -180) delta += 360;

  const target = current + delta;
  m.setRotationAngle(target);

}, [course, deviceSetting]);




  /* ========== RENDER ========== */
  return (
    <MapContainer
      center={[lat, lng]}
      zoom={16}
      style={{ height: "100%", width: "100%" }}
    >
      <FullscreenControl />
      <RecenterControl lat={lat} lng={lng} />
      <FollowUpdater lat={lat} lng={lng} />

      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

      <Polyline positions={path} />

      <Marker
  ref={markerRef}
  position={[lat, lng]}   // ← initial render only (safe)
  icon={vehicleIcon}
>


        <Tooltip permanent direction="top" offset={[0, -15]}>
          <div>
            <b>{vehicleName}</b>
            <br />
            Speed: {speed} kph
          </div>
        </Tooltip>
      </Marker>
    </MapContainer>
  );
};

export default FollowMap;
