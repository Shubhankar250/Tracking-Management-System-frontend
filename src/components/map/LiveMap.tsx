import React, { useEffect, useRef, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  useMap,
} from "react-leaflet";
import { useAppSelector } from "../../redux/hooks";

import "leaflet/dist/leaflet.css";
import "leaflet.marker.slideto";
import VehiclePopup from "../../features/VehiclePopup";
import EventAlertPopup from "../../features/EventAlertPopup";
import { Icon, PinCircle, PinStar } from "leaflet-extra-markers";
import type { Map as LeafletMap } from "leaflet";
import "leaflet-polylinedecorator";
import * as L from "leaflet";
import type { LatLngExpression, Marker as LeafletMarker } from "leaflet";
import "leaflet-draw/dist/leaflet.draw.css";
import "leaflet-draw";
import { useSelector } from "react-redux";
import type { RootState } from "../../redux/store";
import { Circle, Polygon } from "react-leaflet";
import proj4 from "proj4";
declare module "leaflet" {
  namespace Symbol {
    function arrowHead(options?: any): any;
  }

  function polylineDecorator(
    polyline: L.Polyline | L.Polyline[],
    options?: any,
  ): any;
}
import "leaflet-ruler";
import "leaflet-ruler/src/leaflet-ruler.css";
import { Tooltip } from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-markercluster";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";
import ClusterPopup from "./ClusterPopup";
import type { TooltipProps } from "react-leaflet";
import PoiClickHandler from "../../features/PoiClickHandler";

import { markerRegistry } from "../map/markerRegistry";
import type { LiveDataDto } from "../../api/liveService";

/* ✅ ADDED: Polyline Arrow Component */
const PolylineWithArrow = ({
  positions,
}: {
  positions: LatLngExpression[];
}) => {
  const map = useMap();

  useEffect(() => {
    if (!positions.length) return;

    const polyline = L.polyline(positions);

    const decorator = L.polylineDecorator(polyline, {
      patterns: [
        {
          offset: "5%",
          repeat: "10%",
          symbol: L.Symbol.arrowHead({
            pixelSize: 8,
            polygon: false,
            pathOptions: {
              stroke: true,
              color: "red",
              weight: 3,
            },
          }),
        },
      ],
    });

    decorator.addTo(map);

    return () => {
      map.removeLayer(decorator);
    };
  }, [positions, map]);

  return null;
};

const MapEffect = ({
  onMapReady,
}: {
  onMapReady: (map: LeafletMap) => void;
}) => {
  const map = useMap();

  useEffect(() => {
    onMapReady(map);
  }, [map, onMapReady]);

  return null;
};

const getRouteName = (route: any) =>
  route.route_name || route.routeName || route.name || `Route ${route.id ?? ""}`;

/* ================= VEHICLE ICONS ================= */
const getDynamicIcon = (vehicle: any) => {
  const iconType = vehicle?.deviceSetting?.icon_type || "Icon";
  const course = vehicle?.course || 0;

  /* ================= ARROW ================= */
  if (iconType.toLowerCase() === "arrow") {
    return L.divIcon({
      className: "arrow-marker",
      html: `
        <div style="
          transform: rotate(${course}deg);
          font-size: 22px;
          color: #ff3b30;
          line-height: 1;
        ">
          ▲
        </div>
      `,
      iconSize: [24, 24],
      iconAnchor: [12, 12],
    });
  }

  /* ================= ROTATING ICON ================= */
  if (iconType.toLowerCase() === "rotating_icon") {
    const iconName = vehicle?.deviceSetting?.img_icon_name || "car1.png";

    const iconUrl = new URL(
      `../../assets/images/device_icon/rotating_icon/${iconName}`,
      import.meta.url,
    ).href;

    return L.divIcon({
      className: "rotating-marker",
      html: `
        <img 
          src="${iconUrl}" 
          style="
            width:20px;
            height:38px;
transform: rotate(${course}deg);
transition: transform 0.5s linear;
            transform-origin: center;
          "
        />
      `,
      iconSize: [20, 38],
      iconAnchor: [16, 16],
    });
  }

  /* ================= NORMAL IMAGE ICON ================= */
  const iconName = vehicle?.deviceSetting?.img_icon_name || "car1.png";

  const iconUrl = new URL(
    `../../assets/images/device_icon/icon/${iconName}`,
    import.meta.url,
  ).href;

  return L.icon({
    iconUrl,
    iconSize: [20, 38],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });
};

const FitBounds: React.FC<{
  positions: [number, number][];
  activeTab: string;
}> = ({ positions, activeTab }) => {
  const map = useMap();
  const centeredRef = useRef(false);

  useEffect(() => {
    if (activeTab !== "objects" && activeTab !== "events") return;
    if (!map || positions.length === 0) return;
    if (centeredRef.current) return;

    const bounds = L.latLngBounds(positions);

    map.fitBounds(bounds, {
      padding: [100, 100],
      animate: true,
    });

    centeredRef.current = true;
  }, [positions, activeTab, map]);

  return null;
};

type TooltipConfig = {
  direction: TooltipProps["direction"];
  offset: [number, number]; // ✅ tuple type
};

const getTooltipPosition = (course: number): TooltipConfig => {
  if (course >= 315 || course < 45) {
    return { direction: "bottom", offset: [0, 8] };
  }
  if (course >= 45 && course < 135) {
    return { direction: "left", offset: [-8, 0] };
  }
  if (course >= 135 && course < 225) {
    return { direction: "top", offset: [0, -8] };
  }
  return { direction: "right", offset: [8, 0] };
};

interface StableVehicleMarkerProps {
  vehicle: LiveDataDto;
  markerRefs: React.RefObject<Record<string, any>>;
  setOpenVehicleId: React.Dispatch<
    React.SetStateAction<number | string | null>
  >;
  openVehicleId: number | string | null;
  manuallyClosedMap: Record<string | number, boolean>;
  setManuallyClosedMap: React.Dispatch<
    React.SetStateAction<Record<string | number, boolean>>
  >;
  isTooltipActive: boolean;
}

const StableVehicleMarker = React.memo(
  ({
    vehicle,
    markerRefs,
    setOpenVehicleId,
    openVehicleId,
    manuallyClosedMap,
    setManuallyClosedMap,
    isTooltipActive
  }: StableVehicleMarkerProps) => {
    const markerRef = useRef<LeafletMarker | null>(null);

    const icon = React.useMemo(() => {
      return getDynamicIcon(vehicle);
    }, [vehicle.course, vehicle.deviceSetting]);

    useEffect(() => {
      if (!markerRef.current) return;

      if (
        openVehicleId === vehicle.device_id &&
        !manuallyClosedMap[vehicle.device_id]
      ) {
        const marker = markerRef.current as any;
        marker.openPopup();
      }
    }, [openVehicleId]);

    useEffect(() => {
      if (
        !markerRef.current ||
        vehicle.latitude == null ||
        vehicle.longitude == null
      )
        return;

      const marker = markerRef.current as any;

      const newLatLng: [number, number] = [vehicle.latitude, vehicle.longitude];

      const shouldBeOpen =
        openVehicleId === vehicle.device_id &&
        manuallyClosedMap[vehicle.device_id] !== true;

      // ✅ Move marker smoothly
      if (marker.slideTo) {
        marker.slideTo(newLatLng, { duration: 800 });
      } else {
        marker.setLatLng(newLatLng);
      }

      // ⏳ Wait for movement to finish (VERY IMPORTANT)
      setTimeout(() => {
        if (!marker) return;

        const popup = marker.getPopup();

        if (shouldBeOpen) {
          if (manuallyClosedMap[vehicle.device_id]) return;
          marker.openPopup();

          if (popup) {
            popup.setLatLng(newLatLng);
            popup.update();
          }
        }
      }, 850); // match slideTo duration
    }, [vehicle.latitude, vehicle.longitude, openVehicleId]);

    const tooltipConfig = getTooltipPosition(vehicle.course || 0);

    return (
      <Marker
        position={[vehicle.latitude, vehicle.longitude]} // ✅ FIX
        icon={icon}
        ref={(ref) => {
          markerRef.current = ref;

          if (ref) {
            markerRegistry[vehicle.device_id] = ref;
            markerRefs.current[vehicle.device_id] = ref;
            (ref as any).vehicleData = vehicle;
          }
        }}
        eventHandlers={{
          click: () => {
            setManuallyClosedMap((prev) => ({
              ...prev,
              [vehicle.device_id]: false, // ￼ reset forcefully
            }));

            setOpenVehicleId(null); // ￼ IMPORTANT RESET
            setTimeout(() => {
              setOpenVehicleId(vehicle.device_id);
            }, 0);
          },
        }}

      >
        {isTooltipActive && (
          <Tooltip
            direction={tooltipConfig.direction}
            offset={tooltipConfig.offset}
            permanent
          >
            {vehicle.device_name}
          </Tooltip>
        )}
        <Popup
          minWidth={250}
          closeButton={false}
          autoPan={false}
          eventHandlers={{
            popupclose: () => {
              setManuallyClosedMap((prev) => ({
                ...prev,
                [vehicle.device_id]: true,
              }));
              setOpenVehicleId(null);
            },
            popupopen: () => {
              setManuallyClosedMap((prev) => ({
                ...prev,
                [vehicle.device_id]: false,
              }));
            },
          }}
        >
          <VehiclePopup
            vehicle={vehicle}
            onClose={() => {
              const key = String(vehicle.device_id);
              const marker = markerRegistry[key];
              if (marker) marker.closePopup();
              setManuallyClosedMap((prev) => ({
                ...prev,
                [vehicle.device_id]: true,
              }));

              setOpenVehicleId(null);
            }}
          />
        </Popup>
      </Marker>
    );
  },
);


const renderGeofenceLabel = (name?: string) =>
  name?.trim() ? (
    <Tooltip permanent direction="center" className="geofence-label">
      {name}
    </Tooltip>
  ) : null;

const getPoiIcon = (iconName: string) =>
  new L.Icon({
    iconUrl: new URL(
      `../../assets/images/marker_icon/${iconName}`,
      import.meta.url,
    ).href,
    iconSize: [28, 28],
    iconAnchor: [14, 28],
    popupAnchor: [0, -28],
  });

/* ================= LIVE MAP ================= */
const defaultCenter: [number, number] = [28.6139, 77.209];
interface LiveMapProps {
  activeTab: "objects" | "history" | "events" | "geofence" | "route" | "poi";
  customLocation?: [number, number]; // optional marker
  selectedPlaybackPoint?: any; // ✅ added type for playback selection
  drawType?: "circle" | "polygon" | "polyline" | null;
  onGeomCreated?: (geom: any) => void; //geofence
  onRegisterZoom?: (fn: (g: any) => void) => void;
  showHistory: boolean;
  historyplayIndex?: number;
  isPlaying?: boolean;
  playbackMarkerPos: LatLngExpression | null;
  setPlaybackMarkerPos: (pos: LatLngExpression | null) => void;
  geom?: any;
  radius?: number | null;
  showTripPolyline: boolean; // 👈 ADD
  showPolylineArrows: boolean;
  showParkingMarkers: boolean; // 👈 ADD
  showEventMarkers: boolean; // 👈 ADD
  routes?: any[];
  routeGeom?: any;
  selectedVehicle?: any;
  onRegisterRuler?: (fn: () => void) => void;
  onRegisterZoomIn?: (fn: () => void) => void;
  onRegisterZoomOut?: (fn: () => void) => void;
  onRegisterFullscreen?: (fn: () => void) => void;

  showGeofence: boolean;
  onToggleGeofence?: (v: boolean) => void;
  pois?: any[];
  selectedPoi?: any;

  poiInsertMode: boolean;
  setPoiInsertMode: (v: boolean) => void;
  onPoiPointSelected?: (lat: number, lng: number) => void;
  baseLayer: string;
  onRegisterCenter?: (fn: () => void) => void;
  markerRefs: React.RefObject<{ [key: string]: any }>;
  enableClustering: boolean;
  manualMarker?: { lat: number; lng: number } | null;
  onRegisterClosePopups?: (fn: () => void) => void;
  showRoutes: boolean;
  showPois: boolean;
  selectedEvent?: any;
  followMarker: boolean;
  onPoiDrag?: (id: number, lat: number, lng: number) => void;
  isTooltipActive: boolean;

}

const LiveMap: React.FC<LiveMapProps> = ({
  activeTab,
  selectedPlaybackPoint,
  drawType,
  onRegisterRuler,
  onRegisterZoomIn,
  onRegisterZoomOut,
  onRegisterFullscreen,
  onGeomCreated,
  onRegisterZoom,
  showHistory,
  historyplayIndex = 0,
  isPlaying,
  markerRefs,
  showGeofence,
  onToggleGeofence,
  baseLayer,
  onRegisterCenter,
  enableClustering,
  manualMarker,
  playbackMarkerPos,
  setPlaybackMarkerPos,
  geom,
  radius,
  showTripPolyline,
  showPolylineArrows,
  showParkingMarkers,
  showEventMarkers,
  routes,
  routeGeom,
  selectedVehicle,
  pois,
  selectedPoi,
  poiInsertMode,
  onPoiPointSelected,
  setPoiInsertMode,
  onRegisterClosePopups,
  showRoutes,
  showPois,
  selectedEvent,
  followMarker,
  onPoiDrag,
  isTooltipActive
}) => {
  const { devices, visibleVehicleIds, selectedVehicleId } = useAppSelector(
    (state) => state.live,
  );
  const selectedLiveVehicle = devices.find(
    (d) => d.device_id === selectedVehicleId,
  );
  const { events } = useAppSelector((state) => state.eventNotification);
  const { data: playbackData } = useAppSelector((state) => state.playback);
  const mapRef = useRef<LeafletMap | null>(null);
  const [mapReady, setMapReady] = useState(false);
  // Prepare polyline points from combinedPlaybackList
  const polylinePoints: LatLngExpression[] = [];
  const startMarkerRef = useRef<LeafletMarker | null>(null);
  const endMarkerRef = useRef<LeafletMarker | null>(null);
  const parkingRefs = useRef<Record<number, LeafletMarker | null>>({});
  const eventRefs = useRef<Record<number, LeafletMarker | null>>({});
  const [activeDrivingLine, setActiveDrivingLine] = useState<
    LatLngExpression[] | null
  >(null);
  const drawnItemsRef = useRef<L.FeatureGroup | null>(null);

  const cursorHintRef = useRef<L.Marker | null>(null);
  const drawHandlerRef = useRef<any>(null);
  const geofences = useSelector(
    (state: RootState) => state.geofence.geofences || [],
  );

  const movingMarkerRef = useRef<LeafletMarker | null>(null);
  const historyBoundsAppliedRef = useRef(false);
  const [openVehicleId, setOpenVehicleId] = useState<number | string | null>(
    null,
  );

  const [manuallyClosedMap, setManuallyClosedMap] = useState<
    Record<string | number, boolean>
  >({});

  const rulerControlRef = useRef<any>(null);
  const rulerEnabledRef = useRef(false);
  const mapContainerRef = useRef<HTMLDivElement | null>(null); // DOM div
  const geofenceLayerRef = useRef<L.FeatureGroup | null>(null);

  // Filter visible vehicles
  const visibleVehicles =
    activeTab === "objects"
      ? devices.filter((v) => visibleVehicleIds.includes(v.device_id))
      : [];

  if (playbackData?.eventDataList?.length) {
    playbackData.eventDataList.forEach((event: any) => {
      if (
        event.latitude !== null &&
        event.longitude !== null &&
        event.latitude !== undefined &&
        event.longitude !== undefined
      ) {
        polylinePoints.push([event.latitude, event.longitude]);
      }
    });
  }

  const historyList = playbackData?.eventDataList || [];
  const firstPoint = historyList.length > 0 ? historyList[0] : null;
  const lastPoint =
    historyList.length > 0 ? historyList[historyList.length - 1] : null;
  const combindList = playbackData?.combinedPlaybackList || [];

  // const geofenceTabZoomedRef = useRef(false);
  const routeTabZoomedRef = useRef(false);
  const [tempPoiPos, setTempPoiPos] = useState<LatLngExpression | null>(null);
  const [activeField, setActiveField] = useState<any>(null);
  const [fieldPolygons, setFieldPolygons] = useState<any[]>([]);
  const [workedPolylines, setWorkedPolylines] = useState<any[]>([]);
  const playbackLayerRef = useRef<L.LayerGroup | null>(null);
  const fieldList = playbackData?.summary?.fields || [];

  useEffect(() => {
    if (!fieldList || fieldList.length === 0) {
      setFieldPolygons([]);
      setWorkedPolylines([]);
      return;
    }

    const polygons: any[] = [];
    const workedLines: any[] = [];

    const safeParse = (str: string) => {
      try {
        return JSON.parse(str);
      } catch (e) {
        console.error("❌ Invalid GeoJSON:", str);
        return null;
      }
    };

    fieldList.forEach((field: any) => {
      if (field.clusterBoundaryGeoJson) {
        const geo = safeParse(field.clusterBoundaryGeoJson);
        if (geo?.type === "Polygon") {
          const coords = geo.coordinates[0].map(
            ([lng, lat]: [number, number]) =>
              normalizeLatLng({ lat, lng })
          );

          polygons.push({
            points: coords,
            fieldNo: field.fieldNo,
            area: field.clusterBoundaryAreaAcre,
            stime: field.startTime,
            etime: field.endTime,
            workArea: field.workedAreaAcre,
          });
        }
      }

      if (field.workedGeoJson) {
        const geo = safeParse(field.workedGeoJson);

        if (geo?.type === "Polygon") {
          const coords = geo.coordinates[0].map(
            ([lng, lat]: [number, number]) =>
              normalizeLatLng({ lat, lng })
          );

          workedLines.push({
            points: coords,
            fieldNo: field.fieldNo,
            area: field.workedAreaAcre,
            stime: field.startTime,
            etime: field.endTime,
            workArea: field.workedAreaAcre,
          });
        } else if (geo?.type === "LineString") {
          const coords = geo.coordinates.map(
            ([lng, lat]: [number, number]) =>
              normalizeLatLng({ lat, lng })
          );

          workedLines.push({
            points: coords,
            fieldNo: field.fieldNo,
            area: field.workedAreaAcre,
            stime: field.startTime,
            etime: field.endTime,
            workArea: field.workedAreaAcre,
          });
        } else if (geo?.type === "MultiLineString") {
          geo.coordinates.forEach((line: any) => {
            const coords = line.map(
              ([lng, lat]: [number, number]) =>
                normalizeLatLng({ lat, lng })
            );

            workedLines.push({
              points: coords,
              fieldNo: field.fieldNo,
              area: field.workedAreaAcre,
              stime: field.startTime,
              etime: field.endTime,
              workArea: field.workedAreaAcre,
            });
          });
        }
      }
    });

    // ✅ IMPORTANT: only update if changed
    setFieldPolygons((prev: any) =>
      JSON.stringify(prev) !== JSON.stringify(polygons) ? polygons : prev
    );

    setWorkedPolylines((prev: any) =>
      JSON.stringify(prev) !== JSON.stringify(workedLines)
        ? workedLines
        : prev
    );
  }, [JSON.stringify(fieldList)]);
  const clearPlaybackLayers = () => {
    if (playbackLayerRef.current) {
      playbackLayerRef.current.clearLayers();
    }
    // Reset refs
    startMarkerRef.current = null;
    endMarkerRef.current = null;
    parkingRefs.current = {};
    eventRefs.current = {};
    // Remove moving marker
    if (movingMarkerRef.current) {
      movingMarkerRef.current.remove();
      movingMarkerRef.current = null;
    }
    // Remove active driving line
    setActiveDrivingLine(null);
    // Close popups
    mapRef.current?.closePopup();
  };
  useEffect(() => {
    if (!mapRef.current) return;
    playbackLayerRef.current = L.layerGroup().addTo(mapRef.current);
    return () => {
      playbackLayerRef.current?.remove();
    };
  }, []);
  const normalizePoint = (p: any): [number, number] => {
    const [lng, lat] = proj4(
      "EPSG:32643", // adjust zone
      "EPSG:4326",
      [p.lng, p.lat],
    );
    return [lat, lng];
  };
  const normalizeLatLng = (p: any): [number, number] => {
    if (!p) return [0, 0];

    // ✅ Detect projected coords (VERY IMPORTANT)
    if (p.lat > 1000 || p.lng > 1000) {
      const [lng, lat] = proj4(
        "EPSG:32643", // ✅ YOUR DATA CRS
        "EPSG:4326", // ✅ Leaflet CRS
        [p.lng, p.lat],
      );
      return [lat, lng];
    }

    // ✅ Already lat/lng
    return [p.lat, p.lng];
  };
  useEffect(() => {
    if (activeTab !== "history") {
      clearPlaybackLayers(); // 🔥 ADD THIS
      setFieldPolygons([]);
      setWorkedPolylines([]);
      setActiveField(null);
    }
  }, [activeTab]);

  useEffect(() => {
    if (!mapRef.current || !activeField?.boundaryPoints?.length) return;
    const bounds = L.latLngBounds(
      activeField.boundaryPoints.map((p: any) => normalizePoint(p)),
    );
    mapRef.current.fitBounds(bounds, {
      padding: [10, 10],
      animate: true,
    });
  }, [activeField]);
  useEffect(() => {
    if (activeTab !== "history") {
      setActiveField(null);
    }
  }, [activeTab]);

  useEffect(() => {
    if (!mapRef.current) return;

    const centerDevices = () => {
      const map = mapRef.current;
      if (!map) return;
      if (!visibleVehicles || visibleVehicles.length === 0) return;

      // If single vehicle
      if (visibleVehicles.length === 1) {
        const v = visibleVehicles[0];
        map.setView([v.latitude, v.longitude], 16, {
          animate: true,
        });
      } else {
        const bounds = L.latLngBounds(
          visibleVehicles.map((v) => [v.latitude, v.longitude]),
        );

        map.fitBounds(bounds, {
          padding: [150, 150],
          animate: true,
        });
      }
    };

    onRegisterCenter?.(centerDevices);
  }, [visibleVehicles, onRegisterCenter]);

  useEffect(() => {
    if (onRegisterClosePopups && mapRef.current) {
      onRegisterClosePopups(() => {
        mapRef.current?.closePopup();
        setActiveDrivingLine(null);
      });
    }
  }, [onRegisterClosePopups]);
useEffect(() => {
  const map = mapRef.current;
  if (!map) return;

  // अगर selected POI है तो उसी पर zoom karo
  if (selectedPoi?.latitude != null && selectedPoi?.longitude != null) {
    const latitude = Number(selectedPoi.latitude);
    const longitude = Number(selectedPoi.longitude);
    const radius = Number(selectedPoi.radius);

    if (radius > 0) {
      const bounds = L.latLng(latitude, longitude).toBounds(radius);
      map.fitBounds(bounds, {
        padding: [80, 80],
        animate: true,
      });
    } else {
      map.setView([latitude, longitude], 17, {
        animate: true,
      });
    }

    return;
  }

  // selectedPoi null hai to all POIs dikhao
  const validPois =
    pois?.filter(
      (poi) =>
        poi.latitude != null &&
        poi.longitude != null &&
        !isNaN(Number(poi.latitude)) &&
        !isNaN(Number(poi.longitude)),
    ) ?? [];

  if (!validPois.length) return;

  if (validPois.length === 1) {
    map.setView(
      [Number(validPois[0].latitude), Number(validPois[0].longitude)],
      17,
      { animate: true },
    );
    return;
  }

  const bounds = L.latLngBounds(
    validPois.map((poi) => [
      Number(poi.latitude),
      Number(poi.longitude),
    ]) as [number, number][],
  );

  map.fitBounds(bounds, {
    padding: [80, 80],
    animate: true,
  });
}, [selectedPoi, pois]);


  useEffect(() => {
    if (!poiInsertMode) {
      setTempPoiPos(null);
    }
  }, [poiInsertMode]);

  useEffect(() => {
    if (!openVehicleId) return;

    const marker = markerRegistry[openVehicleId];
    if (marker) {
      marker.openPopup();
    }
  }, [openVehicleId]);

  useEffect(() => {
    console.log("poiInsertMode:", poiInsertMode, "activeTab:", activeTab);
  }, [poiInsertMode]);

  useEffect(() => {
     if (activeTab !== "objects") return;
    if (!mapRef.current || !selectedVehicle) return;

    const { latitude, longitude } = selectedVehicle;

    if (!isValidLatLng(latitude, longitude)) return;

    mapRef.current.setView(
      [latitude, longitude],
      Math.max(mapRef.current.getZoom(), 16), // smooth zoom
      {
        animate: true,
        duration: 0.5,
      },
    );
  }, [selectedVehicle, activeTab]); 
  
  useEffect(() => {
    if (activeTab !== "objects") return;
    if (!mapRef.current || !selectedLiveVehicle) return;

    const { latitude, longitude } = selectedLiveVehicle;

    if (!isValidLatLng(latitude, longitude)) return;

    mapRef.current.setView(
      [latitude, longitude],
      Math.max(mapRef.current.getZoom(), 16),
      {
        animate: true,
        duration: 0.5,
      },
    );
  }, [selectedLiveVehicle, activeTab]);

  useEffect(() => {
    if (!mapRef.current) return;

    const map = mapRef.current;

    // 🔥 1. Clear all drawn layers
    if (drawnItemsRef.current) {
      drawnItemsRef.current.clearLayers();
    }

    // 🔥 2. Disable active draw handler
    if (drawHandlerRef.current) {
      drawHandlerRef.current.disable();
      drawHandlerRef.current = null;
    }

    // 🔥 3. Remove cursor hint marker
    if (cursorHintRef.current) {
      map.removeLayer(cursorHintRef.current);
      cursorHintRef.current = null;
    }

    // 🔥 4. Disable edit mode if active
    map.eachLayer((layer: any) => {
      if (layer?.editing?.enabled()) {
        layer.editing.disable();
      }
    });
  }, [activeTab]);

  useEffect(() => {
    routeTabZoomedRef.current = false;
  }, [routes]);

  useEffect(() => {
    if (activeTab !== "route") {
      onGeomCreated?.({ geom: null });
    }
  }, [activeTab]);

  useEffect(() => {
    if (!mapRef.current) return;

    // 🔥 when drawType is disabled → FULL RESET
    if (!drawType) {
      if (drawnItemsRef.current) {
        drawnItemsRef.current.clearLayers();
      }

      if (drawHandlerRef.current) {
        drawHandlerRef.current.disable();
        drawHandlerRef.current = null;
      }

      if (cursorHintRef.current) {
        mapRef.current.removeLayer(cursorHintRef.current);
        cursorHintRef.current = null;
      }
    }
  }, [drawType]);

  useEffect(() => {
    if (activeTab !== "route" && !showRoutes) {
      routeTabZoomedRef.current = false;
      return;
    }

    if (!mapRef.current || !routes?.length) return;
    if (routeTabZoomedRef.current) return;

    const map = mapRef.current;
    const group = L.featureGroup();

    routes.forEach((r: any) => {
      if (!r.geom) return;

      try {
        const geom = typeof r.geom === "string" ? JSON.parse(r.geom) : r.geom;
        if (geom.type !== "LineString") return;

        const latlngs = geom.coordinates.map(([lng, lat]: [number, number]) => [
          lat,
          lng,
        ]);

        group.addLayer(L.polyline(latlngs));
      } catch (e) {
        console.error("Invalid route geom", r);
      }
    });

    if (group.getLayers().length === 0) return;

    group.addTo(map);
    map.fitBounds(group.getBounds(), {
      padding: [80, 80],
      animate: true,
    });
    group.remove();

    routeTabZoomedRef.current = true;
  }, [activeTab, routes]);

  useEffect(() => {
    if (!mapRef.current || !routeGeom) return;

    const geom =
      typeof routeGeom === "string" ? JSON.parse(routeGeom) : routeGeom;

    if (geom.type !== "LineString") return;

    const latlngs = geom.coordinates.map(([lng, lat]: [number, number]) => [
      lat,
      lng,
    ]);

    const selected = L.polyline(latlngs, {
      color: "red",
      weight: 6,
    }).addTo(mapRef.current);

    return () => {
      mapRef.current?.removeLayer(selected);
    };
  }, [routeGeom]);

  useEffect(() => {
    // Start Marker
    if (
      selectedPlaybackPoint &&
      firstPoint &&
      selectedPlaybackPoint.latitude === firstPoint.latitude &&
      selectedPlaybackPoint.longitude === firstPoint.longitude
    ) {
      startMarkerRef.current?.openPopup();
    }

    // End Marker
    if (
      selectedPlaybackPoint &&
      lastPoint &&
      selectedPlaybackPoint.latitude === lastPoint.latitude &&
      selectedPlaybackPoint.longitude === lastPoint.longitude
    ) {
      endMarkerRef.current?.openPopup();
    }

    // Parking Markers
    combindList.forEach((item: any, idx: number) => {
      if (item.parking_start_time && parkingRefs.current[idx]) {
        if (
          selectedPlaybackPoint &&
          selectedPlaybackPoint.lat === item.lat &&
          selectedPlaybackPoint.lon === item.lon
        ) {
          parkingRefs.current[idx]?.openPopup();
        }
      }
    });

    // Event Markers
    combindList.forEach((item: any, idx: number) => {
      if (item.event_name && eventRefs.current[idx]) {
        if (
          selectedPlaybackPoint &&
          selectedPlaybackPoint.latitude === item.latitude &&
          selectedPlaybackPoint.longitude === item.longitude
        ) {
          eventRefs.current[idx]?.openPopup();
        }
      }
    });

    let drivingIndex = 0;

    combindList.forEach((item: any) => {
      if (item.movment_start_time) {
        drivingIndex++;

        if (
          selectedPlaybackPoint &&
          selectedPlaybackPoint.movment_start_time ===
          item.movment_start_time &&
          item.polylinePoints?.length > 0 &&
          mapRef.current
        ) {
          const midIndex = Math.floor(item.polylinePoints.length / 2);
          const midPoint = item.polylinePoints[midIndex];
          mapRef.current.closePopup();

          mapRef.current.openPopup(
            `
              <div class="custom-popup">
                <div 
            class="popup-header"
            style="border-radius:8px 8px 0 0; padding:6px 10px;  background-color: #007bff !important; 
        color: #fff !important;"
          >T${drivingIndex}</div>
                <div class="popup-body">
                  <div><b>Start Time:</b> ${item.movment_start_time}</div>
                  <div><b>End Time:</b> ${item.movment_end_time}</div>
                  <div><b>Max Speed:</b> ${item.seg_max_speed}</div>
                  <div><b>Avg Speed:</b> ${item.seg_avg_speed}</div>
                  <div><b>Distance:</b> ${item.seg_distance} Km</div>
                  <div><b>Duration:</b> ${item.seg_running_time}</div>
                </div>
              </div>
              `,
            [midPoint.lat, midPoint.lng],
          );

          mapRef.current.setView(
            [midPoint.lat, midPoint.lng],
            mapRef.current.getZoom(),
            { animate: true },
          );

          setActiveDrivingLine(
            item.polylinePoints.map((p: any) => [p.lat, p.lng]),
          );
        }
      }
    });
  }, [selectedPlaybackPoint, firstPoint, lastPoint, combindList]);

  useEffect(() => {
    if (activeTab !== "history") return;

    // Clear old marker and popup before showing new playback
    if (mapRef.current) {
      mapRef.current.closePopup();

      if (movingMarkerRef.current) {
        movingMarkerRef.current.remove();
        movingMarkerRef.current = null;
      }

      setActiveDrivingLine(null);
    }
  }, [playbackData, activeTab]);

  useEffect(() => {
    if (activeTab !== "route") {
      // 🔥 CLEAR DRAWN ROUTE
      onGeomCreated?.({ geom: null });
    }
  }, [activeTab]);

  useEffect(() => {
    if (!mapRef.current || !drawnItemsRef.current) return;

    // Clear previous edit layer
    drawnItemsRef.current.clearLayers();

    // Use prop "geom"
    if (!geom) return;

    let layer: L.Layer | null = null;

    // Circle
    if (geom.type === "Point" && radius) {
      const [lng, lat] = geom.coordinates;
      layer = L.circle([lat, lng], { radius, color: "#007bff" });
    }

    // Polygon
    if (geom.type === "Polygon") {
      const coords = geom.coordinates[0].map(([lng, lat]: [number, number]) => [
        lat,
        lng,
      ]);
      layer = L.polygon(coords, { color: "#007bff" });
    }

    if (layer) {
      drawnItemsRef.current.addLayer(layer);
    }
  }, [geom, radius]);

  useEffect(() => {
    if (!mapReady || !mapRef.current || !onRegisterZoom) return;

    const zoomToShape = (g: any) => {
      if (!mapRef.current || !g?.geom) return;

      const map = mapRef.current;
      let layer: any = null;

      try {
        // Circle
        if (g.pcts_type === "circle" && g.geom.type === "Point" && g.radius) {
          const [lng, lat] = g.geom.coordinates;
          layer = L.circle([lat, lng], { radius: Number(g.radius) });
        }
        // Polygon
        else if (g.pcts_type === "polygon" && g.geom.type === "Polygon") {
          const coords = g.geom.coordinates[0].map(
            ([lng, lat]: [number, number]) => [lat, lng],
          );
          layer = L.polygon(coords);
        }
        // Route (LineString)
        else if (g.geom.type === "LineString") {
          const coords = g.geom.coordinates.map(
            ([lng, lat]: [number, number]) => [lat, lng],
          );
          layer = L.polyline(coords);
        }

        if (!layer) return;

        layer.addTo(map);

        const bounds = layer.getBounds();
        const center = bounds.getCenter();

        map.setView(center, map.getBoundsZoom(bounds), {
          animate: true,
          duration: 0.5,
        });

        map.removeLayer(layer);
      } catch (e) {
        console.error("Zoom error:", e);
      }
    };

    onRegisterZoom(zoomToShape);
  }, [mapReady, onRegisterZoom]);

  // Enable edit + resize
  useEffect(() => {
    if (!mapRef.current || !drawnItemsRef.current) return;

    const map = mapRef.current;

    const editHandler = new (L as any).EditToolbar.Edit(map, {
      featureGroup: drawnItemsRef.current,
      selectedPathOptions: {
        color: "#ff0000",
        fillOpacity: 0.3,
        dashArray: "5,5",
        maintainColor: false,
      },
    });

    if (drawnItemsRef.current.getLayers().length > 0) {
      editHandler.enable();
    }
    const onEdited = (e: any) => {
      e.layers.eachLayer((layer: any) => {
        let geom = null;
        let radius = null;

        if (layer instanceof L.Circle) {
          const latlng = layer.getLatLng();
          geom = {
            type: "Point",
            coordinates: [latlng.lng, latlng.lat],
          };
          radius = layer.getRadius();
        } else if (layer instanceof L.Polygon) {
          geom = layer.toGeoJSON().geometry;
        }

        onGeomCreated?.({ geom, radius }); // update form live
      });
    };

    map.on((L as any).Draw.Event.EDITED, onEdited);

    return () => {
      map.off((L as any).Draw.Event.EDITED, onEdited);
      editHandler.disable();
    };
  }, [mapReady]);

  useEffect(() => {
    if (!mapRef.current || !drawType) return;

    if (
      (drawType === "polyline" && activeTab !== "route") ||
      ((drawType === "circle" || drawType === "polygon") &&
        activeTab !== "geofence")
    ) {
      return;
    }
    const map = mapRef.current;
    if (!drawnItemsRef.current) {
      drawnItemsRef.current = new L.FeatureGroup();
      map.addLayer(drawnItemsRef.current);
    }

    if (drawHandlerRef.current) {
      drawHandlerRef.current.disable();
      drawHandlerRef.current = null;
    }

    let drawHandler: any = null;

    if (drawType === "circle") {
      drawHandler = new (L as any).Draw.Circle(map, {
        shapeOptions: { color: "#007bff" },
      });
    } else if (drawType === "polygon") {
      drawHandler = new (L as any).Draw.Polygon(map, {
        shapeOptions: { color: "#007bff" },
      });
    } else if (drawType === "polyline") {
      drawHandler = new (L as any).Draw.Polyline(map, {
        shapeOptions: { color: "#007bff", weight: 4 },
      });
    }

    if (drawHandler) {
      drawHandlerRef.current = drawHandler;
      drawHandler.enable();
    }

    const onMouseMove = (e: L.LeafletMouseEvent) => {
      if (!cursorHintRef.current) {
        const invisibleIcon = L.divIcon({
          html: "",
          className: "",
          iconSize: [0, 0],
        });
        cursorHintRef.current = L.marker(e.latlng, {
          icon: invisibleIcon,
          interactive: false,
        }).addTo(map);
      } else {
        cursorHintRef.current.setLatLng(e.latlng);
      }
    };
    map.on("mousemove", onMouseMove);

    const handleCreated = (e: any) => {
      const layer = e.layer;

      drawnItemsRef.current?.clearLayers(); // single geofence mode
      drawnItemsRef.current?.addLayer(layer); // 🔥 important

      let geom: any = null;
      let radius: number | null = null;

      if (layer instanceof L.Circle) {
        const latlng = layer.getLatLng();
        geom = { type: "Point", coordinates: [latlng.lng, latlng.lat] };
        radius = layer.getRadius();
      } else if (layer instanceof L.Polygon) {
        geom = layer.toGeoJSON().geometry;
      } else if (layer instanceof L.Polyline) {
        geom = layer.toGeoJSON().geometry; // 🔥 route
        onGeomCreated?.({ geom });
        return;
      }

      onGeomCreated?.({ geom, radius });
    };

    map.on((L as any).Draw.Event.CREATED, handleCreated);

    return () => {
      map.off("mousemove", onMouseMove);
      map.off((L as any).Draw.Event.CREATED, handleCreated);

      if (cursorHintRef.current) {
        map.removeLayer(cursorHintRef.current);
        cursorHintRef.current = null;
      }

      if (drawHandlerRef.current) {
        drawHandlerRef.current.disable();
        drawHandlerRef.current = null;
      }
    };
  }, [drawType, activeTab, mapReady, onGeomCreated]);

  useEffect(() => {
    if (activeTab !== "history") return;
    if (!isPlaying) return;
    if (!playbackData?.eventDataList?.length) return;

    const p = playbackData.eventDataList[historyplayIndex];
    if (!p?.latitude || !p?.longitude) return;

    const latlng: LatLngExpression = [p.latitude, p.longitude];
    setPlaybackMarkerPos(latlng);
  }, [historyplayIndex, activeTab, playbackData, isPlaying]);

  useEffect(() => {
    if (activeTab !== "history") {
      setPlaybackMarkerPos(null);
      movingMarkerRef.current = null;
    }
  }, [activeTab]);
  useEffect(() => {
    if (
      activeTab !== "history" ||
      !mapRef.current ||
      !polylinePoints.length ||
      historyBoundsAppliedRef.current
    ) {
      return;
    }

    const map = mapRef.current;
    const bounds = L.latLngBounds(polylinePoints as any);

    map.fitBounds(bounds, {
      padding: [60, 60],
      animate: true,
    });

    historyBoundsAppliedRef.current = true; // 🔥 ONLY ONCE
  }, [activeTab, polylinePoints]);
  useEffect(() => {
    historyBoundsAppliedRef.current = false;
  }, [playbackData]);
  useEffect(() => {
    if (
      activeTab !== "history" ||
      !isPlaying ||
      !mapRef.current ||
      !playbackMarkerPos ||
      !followMarker   // 👈 CONTROL HERE
    )
      return;

    mapRef.current.panTo(playbackMarkerPos, {
      animate: true,
      duration: 1,
      easeLinearity: 0.2,
    });
  }, [playbackMarkerPos, activeTab, isPlaying, followMarker]);
  useEffect(() => {
    onRegisterRuler?.(toggleRuler);
  }, []);
  const toggleRuler = () => {
    if (!mapRef.current) return;

    const map = mapRef.current;

    if (!rulerControlRef.current) {
      rulerControlRef.current = (L.control as any).ruler({
        position: "topright",
        circleMarker: {
          color: "blue",
          radius: 3,
        },
        lineStyle: {
          color: "blue",
          dashArray: "5,5",
        },
        lengthUnit: {
          display: "km",
          label: "Distance",
          decimal: 2,
          factor: 1,
        },
      });

      rulerControlRef.current.addTo(map);

      // 🔥 THIS IS THE KEY LINE (DRAW MODE)
      rulerControlRef.current._toggleMeasure();
      rulerEnabledRef.current = true;
      return;
    }

    // 🔁 toggle behaviour
    if (rulerEnabledRef.current) {
      rulerControlRef.current._clearMeasure();
      rulerControlRef.current._toggleMeasure();
      rulerEnabledRef.current = false;
    } else {
      rulerControlRef.current._toggleMeasure();
      rulerEnabledRef.current = true;
    }
  };
  useEffect(() => {
    if (!mapRef.current) return;

    const map = mapRef.current;

    const zoomIn = () => {
      map.zoomIn(1, { animate: true });
    };

    const zoomOut = () => {
      map.zoomOut(1, { animate: true });
    };

    const fullscreen = () => {
      const el = mapContainerRef.current;
      if (!el) return;

      if (!document.fullscreenElement) {
        el.requestFullscreen();
      } else {
        document.exitFullscreen();
      }
    };

    onRegisterZoomIn?.(zoomIn);
    onRegisterZoomOut?.(zoomOut);
    onRegisterFullscreen?.(fullscreen);
  }, [mapReady]);

useEffect(() => {
  const map = mapRef.current;
  if (!map) return;

  if (activeTab !== "geofence") {
    if (geofenceLayerRef.current) {
      map.removeLayer(geofenceLayerRef.current);
      geofenceLayerRef.current = null;
    }
    return;
  }

  if (!geofences?.length) return;

  if (geofenceLayerRef.current) {
    map.removeLayer(geofenceLayerRef.current);
    geofenceLayerRef.current = null;
  }

  const group = L.featureGroup();

  geofences.forEach((g: any) => {
    const color = g.color || "#007bff";
    const label = g.pcts_name?.trim();
    let layer: L.Path | null = null;

    if (g.pcts_type === "circle" && g.geom?.type === "Point") {
      const [lng, lat] = g.geom.coordinates;
      layer = L.circle([lat, lng], {
        radius: Number(g.radius),
        color,
        weight: 2,
        fillOpacity: 0.2,
      });
    }

    if (g.pcts_type === "polygon" && g.geom?.type === "Polygon") {
      const coords = g.geom.coordinates[0].map(
        ([lng, lat]: [number, number]) => [lat, lng] as [number, number],
      );

      layer = L.polygon(coords, {
        color,
        weight: 2,
        fillOpacity: 0.2,
      });
    }

    if (!layer) return;

    if (label) {
      layer.bindTooltip(label, {
        permanent: true,
        direction: "center",
        className: "geofence-label",
        opacity: 1,
      });
    }

    group.addLayer(layer);
  });

  if (!group.getLayers().length) return;

  group.addTo(map);
  geofenceLayerRef.current = group;

  map.fitBounds(group.getBounds(), { padding: [80, 80] });
}, [activeTab, geofences]);


  useEffect(() => {
    if (activeTab === "geofence" && typeof onToggleGeofence === "function") {
      onToggleGeofence(true);
    }
  }, [activeTab]);
  // 🔹 NEW: Blue car marker for playback
  const playbackIcon = new Icon({
    svg: PinCircle,
    color: "#066fd1",
    accentColor: "darkblue",
    content: "", // Unicode for car (FontAwesome)
    className: "fa-solid", // fa-solid / fa-car class applied here
    contentColor: "white",
    scale: 1,
  });

  const startIcon = new Icon({
    svg: PinStar,
    color: "green",
    accentColor: "darkgreen",
    content: "⚑",
    contentColor: "white",
    scale: 1,
  });
  const eventIcon = new Icon({
    svg: PinCircle,
    color: "maroon",
    accentColor: "darkred",
    content: "E",
    contentColor: "white",
    scale: 1,
  });
  const endIcon = new Icon({
    svg: PinStar,
    color: "maroon",
    accentColor: "darkred",
    content: "⚑",
    contentColor: "white",
    scale: 1,
  });
  const manualPointIcon = new Icon({
    svg: PinCircle,
    color: "#2563eb",
    accentColor: "#1e40af",
    content: "📍",
    contentColor: "white",
    scale: 1,
  });
  function CenterMapOnMarker({ manualMarker }: any) {
    const map = useMap();

    useEffect(() => {
      if (manualMarker) {
        map.panTo(
          [manualMarker.lat, manualMarker.lng],
          { animate: false }, // no animation
        );
      }
    }, [manualMarker, map]);

    return null;
  }
  // Positions for FitBounds
  const vehiclePositions: [number, number][] = visibleVehicles
    .filter(
      (v) =>
        v.latitude != null &&
        v.longitude != null &&
        v.latitude !== 0 &&
        v.longitude !== 0 &&
        !isNaN(Number(v.latitude)) &&
        !isNaN(Number(v.longitude)),
    )
    .map((v) => [Number(v.latitude), Number(v.longitude)]);
  const isValidLatLng = (lat: any, lng: any) => {
    return (
      lat != null &&
      lng != null &&
      lat !== "" &&
      lng !== "" &&
      Number(lat) !== 0 &&
      Number(lng) !== 0 &&
      !isNaN(Number(lat)) &&
      !isNaN(Number(lng))
    );
  };
  const eventPositions: [number, number][] =
    activeTab === "events"
      ? events
        .filter(
          (e) =>
            e.latitude != null &&
            e.longitude != null &&
            e.latitude !== 0 &&
            e.longitude !== 0 &&
            !isNaN(Number(e.latitude)) &&
            !isNaN(Number(e.longitude)),
        )
        .map((e) => [Number(e.latitude), Number(e.longitude)])
      : [];
  // useeffect for event marker pop up 
  useEffect(() => {
    const map = mapRef.current;
    if (!selectedEvent || !map) return;

    const index = events.findIndex(
      (e) =>
        e.latitude === selectedEvent.latitude &&
        e.longitude === selectedEvent.longitude &&
        e.alertTime === selectedEvent.alertTime
    );

    const marker = eventRefs.current[index];

    if (marker) {
      marker.openPopup();

      // ✅ smooth pan (no zoom jump, no flying)
      setTimeout(() => {
        map.panTo(
          [selectedEvent.latitude, selectedEvent.longitude],
          {
            animate: true,
            duration: 0.8, // smooth but fast
          }
        );
      }, 150);
    }
  }, [selectedEvent, events]);
  let parkingCounter = 0;
  let eventCounter = 0;

  return (
    <div ref={mapContainerRef} style={{ height: "100%", width: "100%" }}>
      <MapContainer
        center={defaultCenter}
        zoom={10}
        minZoom={3}
        maxZoom={18}
        style={{ height: "100%", width: "100%" }}
      >
        <MapEffect
          onMapReady={(map) => {
            mapRef.current = map;
            setMapReady(true);
          }}
        />
        {/* ￼ MANUAL POINT MARKER */}
        {manualMarker && (
          <>
            <CenterMapOnMarker manualMarker={manualMarker} />

            <Marker
              position={[manualMarker.lat, manualMarker.lng]}
              icon={manualPointIcon}
            >
              <Popup>
                <b>Manual Location</b>
                <br />
                Lat: {manualMarker.lat}
                <br />
                Lng: {manualMarker.lng}
              </Popup>
            </Marker>
          </>
        )}
        <PoiClickHandler
          enabled={poiInsertMode} // no need for activeTab check
          onClick={(lat: number, lng: number) => {
            // ✅ annotate types
            setTempPoiPos([lat, lng]);
            onPoiPointSelected?.(lat, lng);
            setPoiInsertMode(false); // stops insert mode
          }}
        />
        {tempPoiPos && (
          <Marker position={tempPoiPos}>
            <Popup>Selected POI Location</Popup>
          </Marker>
        )}

        {/* TEMP POI MARKER WHEN INSERTING */}
        {activeTab === "poi" && poiInsertMode && tempPoiPos && (
          <Marker position={tempPoiPos}>
            <Popup>Selected Location</Popup>
          </Marker>
        )}

        {activeTab === "objects" && (
          <FitBounds positions={vehiclePositions} activeTab={activeTab} />
        )}
        {activeTab === "events" && (
          <FitBounds positions={eventPositions} activeTab={activeTab} />
        )}
        {/* 🔹 PLAYBACK MARKER: only appears when Play started */}
        {activeTab === "history" && playbackMarkerPos && showHistory && (
          <Marker
            position={playbackMarkerPos}
            icon={playbackIcon}
            ref={movingMarkerRef}
          />
        )}
        {baseLayer === "GOOGLE_ROADMAP" && (
          <TileLayer
            url="http://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}"
            subdomains={["mt0", "mt1", "mt2", "mt3"]}
          />
        )}

        {baseLayer === "GOOGLE_SATELLITE" && (
          <TileLayer
            url="http://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}"
            subdomains={["mt0", "mt1", "mt2", "mt3"]}
          />
        )}

        {baseLayer === "GOOGLE_HYBRID" && (
          <TileLayer
            url="http://{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}"
            subdomains={["mt0", "mt1", "mt2", "mt3"]}
          />
        )}

        {baseLayer === "GOOGLE_TERRAIN" && (
          <TileLayer
            url="http://{s}.google.com/vt/lyrs=p&x={x}&y={y}&z={z}"
            subdomains={["mt0", "mt1", "mt2", "mt3"]}
          />
        )}

        {baseLayer === "MAPBOX_STREETS" && (
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        )}

        {baseLayer === "MAPBOX_SATELLITE" && (
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        )}
        {/* GEOFENCES */}
        {showGeofence &&
          geofences.map((g) => {
            if (!g.geom || !g.geom.coordinates) return null;

            if (
              g.pcts_type === "circle" &&
              g.radius &&
              g.geom.type === "Point"
            ) {
              const [lng, lat] = g.geom.coordinates as [number, number];
              return (
                <Circle
                  key={`geofence-${g.id}`}
                  center={[lat, lng]}
                  radius={g.radius}
                  pathOptions={{
                    color: g.color ?? "#007bff",
                    weight: 2,
                    fillOpacity: 0.2,
                  }}
                >
                  {renderGeofenceLabel(g.pcts_name)}
                  <Popup>
                    <div>
                      <b>{g.pcts_name}</b>
                      <br />
                      Type: Circle
                      <br />
                      Radius: {g.radius} m
                    </div>
                    
                  </Popup>
                </Circle>
              );
            }

            if (g.pcts_type === "polygon" && g.geom.type === "Polygon") {
              // Force TypeScript to treat coordinates as number[][][]
              const coords = g.geom.coordinates as number[][][];
              // Use the first ring
              const latlngs: [number, number][] = coords[0].map(
                ([lng, lat]) => [lat, lng],
              );

              return (
                <Polygon
                  key={`geofence-${g.id}`}
                  positions={latlngs}
                  pathOptions={{
                    color: g.color ?? "#007bff",
                    weight: 2,
                    fillOpacity: 0.2,
                  }}
                >
                {renderGeofenceLabel(g.pcts_name)}
                  <Popup>
                    <div>
                      <b>{g.pcts_name}</b>
                      <br />
                      Type: Polygon
                    </div>
                  </Popup>
                </Polygon>
              );
            }

            return null;
          })}

        {/* ROUTES (ALL SAVED) */}
        {showRoutes && (
          <React.Fragment key={routes?.length}>
            {routes?.map((r: any) => {
              if (!r.geom) return null;

              try {
                const geo =
                  typeof r.geom === "string" ? JSON.parse(r.geom) : r.geom;

                if (geo.type !== "LineString") return null;

                const latlngs = geo.coordinates.map(
                  ([lng, lat]: [number, number]) => [lat, lng],
                );

                return (
                  <Polyline
                    key={`route-${r.id}-${JSON.stringify(r.geom)}`} // IMPORTANT
                    positions={latlngs}
                    pathOptions={{
                      color: "#0066ff",
                      weight: 4,
                      opacity: 0.8,
                    }}
                  />
                );
              } catch {
                return null;
              }
            })}
          </React.Fragment>
        )}

        {/* ================= POIs ================= */}
        {showPois &&
          pois?.map((p: any) => {
            if (p.latitude == null || p.longitude == null) return null;

            return (
              <Marker
                key={`poi-${p.id}`}
                position={[p.latitude, p.longitude]}
                icon={getPoiIcon(p.icon_name || "default.png")}
              >
                <Popup>
                  <b>{p.name}</b>
                  <br />
                  {p.description}
                </Popup>
              </Marker>
            );
          })}

        {/* ================= POI ================= */}
        {(activeTab === "poi" || showPois) &&
          pois?.map((poi) => {
            if (!poi.latitude || !poi.longitude) return null;

            const radiusNum = Number(poi.radius);
            const showRadius = Number.isFinite(radiusNum) && radiusNum > 0;

            const isSelected = selectedPoi?.id === poi.id;

            const position: [number, number] = isSelected
              ? [Number(selectedPoi.latitude), Number(selectedPoi.longitude)]
              : [Number(poi.latitude), Number(poi.longitude)];

            return (
              <React.Fragment key={poi.id}>
                <Marker
                  position={position}
                  icon={getPoiIcon(poi.markerIcon)}
                  draggable={isSelected}
                  autoPan={isSelected}
                  ref={(ref) => {
                    if (ref) markerRefs.current[poi.id] = ref;
                  }}
                  eventHandlers={{
                    drag: (e) => {
                      const latlng = e.target.getLatLng();

                      // 🔥 DIRECTLY move circle without re-render
                      const circle = markerRefs.current[`circle-${poi.id}`];
                      if (circle) {
                        circle.setLatLng(latlng);
                      }
                    },

                    dragend: (e) => {
                      const latlng = e.target.getLatLng();

                      console.log("📍 Final Drop:", latlng);

                      // ✅ final state update
                      onPoiDrag?.(poi.id, latlng.lat, latlng.lng);
                    },
                  }}
                >
                  <Popup>
                    <b>{poi.name}</b>
                    <br />
                    {poi.description}
                  </Popup>
                </Marker>

                {showRadius && (
                  <Circle
                    center={position}
                    radius={radiusNum}
                    ref={(ref) => {
                      if (ref) markerRefs.current[`circle-${poi.id}`] = ref;
                    }}
                    pathOptions={{
                      color: isSelected ? "#2563eb" : "red",
                      weight: isSelected ? 4 : 2,
                      fillOpacity: isSelected ? 0.2 : 0.1,
                    }}
                  />
                )}
              </React.Fragment>
            );
          })}

        {/* VEHICLE MARKERS */}
        {activeTab === "objects" &&
          (enableClustering ? (
            <MarkerClusterGroup
              chunkedLoading
              showCoverageOnHover={false}
              zoomToBoundsOnClick={false}
              spiderfyOnMaxZoom={false}
              spiderfyOnEveryZoom={false}
              removeOutsideVisibleBounds={true}
              maxClusterRadius={80}
              disableClusteringAtZoom={16}
              animate={true}
              spiderLegPolylineOptions={{
                weight: 0,
                opacity: 0,
              }}
              eventHandlers={{
                clusterclick: (e: any) => {
                  const cluster = e.layer;
                  const map = cluster._map;

                  if (!cluster || !map) return;

                  e.originalEvent?.preventDefault?.();
                  e.originalEvent?.stopPropagation?.();

                  if (map._popup) {
                    map.closePopup();
                  }

                  cluster.closePopup();
                  cluster.unbindPopup();

                  const childMarkers = cluster.getAllChildMarkers();

                  const vehicles: any[] = [];
                  childMarkers.forEach((m: any) => {
                    if (m?.vehicleData) vehicles.push(m.vehicleData);
                  });

                  const popupId = `cluster-popup-${cluster._leaflet_id}-${Date.now()}`;

                  cluster.bindPopup(`<div id="${popupId}"></div>`, {
                    closeButton: false,
                    autoPan: true,
                    maxWidth: 320,
                  });
                  map.flyTo(cluster.getLatLng(), map.getZoom(), {
                    animate: true,
                  });
                  cluster.openPopup();

                  setTimeout(() => {
                    const container = document.getElementById(popupId);
                    if (!container) return;

                    import("react-dom/client").then((ReactDOM) => {
                      const root = ReactDOM.createRoot(container);

                      root.render(
                        <ClusterPopup
                          cluster={cluster}
                          vehicles={vehicles}
                          onClose={() => {
                            cluster.closePopup();
                            mapRef.current?.closePopup();
                          }}
                          onVehicleClick={(vehicle) => {
                            const map = mapRef.current;
                            const marker =
                              markerRefs.current[vehicle.device_id];
                            if (!map || !marker) return;

                            map.setView(
                              [vehicle.latitude, vehicle.longitude],
                              18,
                              { animate: true },
                            );

                            marker.openPopup();
                            cluster.closePopup();
                          }}
                        />,
                      );
                    });
                  }, 10);
                },
              }}
            >
              {visibleVehicles.map((vehicle) => {
                return (
                  <StableVehicleMarker
                    key={`vehicle-${vehicle.device_id}`}
                    vehicle={vehicle}
                    markerRefs={markerRefs}
                    setOpenVehicleId={setOpenVehicleId}
                    openVehicleId={openVehicleId}
                    manuallyClosedMap={manuallyClosedMap}
                    setManuallyClosedMap={setManuallyClosedMap}
                    isTooltipActive={isTooltipActive}
                  />
                );
              })}
            </MarkerClusterGroup>
          ) : (
            /* 🔥 NORMAL MARKERS (NO CLUSTER) */
            <>
              {visibleVehicles.map((vehicle) => {
                return (
                  <StableVehicleMarker
                    key={`vehicle-${vehicle.device_id}`}
                    vehicle={vehicle}
                    markerRefs={markerRefs}
                    setOpenVehicleId={setOpenVehicleId}
                    openVehicleId={openVehicleId}
                    manuallyClosedMap={manuallyClosedMap}
                    setManuallyClosedMap={setManuallyClosedMap}
                    isTooltipActive={isTooltipActive}
                  />
                );
              })}
            </>
          ))}

        {activeTab === "history" && showHistory && (
          <>
            {fieldPolygons && fieldPolygons.length > 0 ? (
              <>
                {/* ✅ FIELD VIEW ONLY */}

                {/* AUTO FIT */}
                <FitBounds
                  positions={fieldPolygons.flatMap((f) => f.points)}
                  activeTab={activeTab}
                />

                {/* FIELD POLYGONS */}
                {fieldPolygons.map((field, idx) => (
                  <Polygon
                    key={`field-${idx}`}
                    positions={field.points}
                    pathOptions={{ color: "green", weight: 2 }}
                    eventHandlers={{
                      click: () => setActiveField(field),
                    }}

                  >
                    <Popup>
                      <b>Field {field.fieldNo}</b>
                      <br />
                      Boundary Area: {field.area?.toFixed(2)} Acre
                    </Popup>

                    <Popup className="custom-popup">
                      <div className="popup-header">
                        <b>Field {field.fieldNo}</b>
                      </div>
                      <div className="popup-body">
                        <div>
                          <b>Start time:</b> {field.stime ?? 0}
                        </div>
                        <div>
                          <b>End Time:</b> {field.etime}
                        </div>

                        <div>
                          <b>Worked Area:</b> {field.workArea?.toFixed(2)} Acre
                        </div>
                      </div>
                    </Popup>
                  </Polygon>
                ))}

                {/* WORKED AREA */}
                {workedPolylines.map((line, idx) => (
                  <Polyline
                    key={`worked-${idx}`}
                    positions={line.points}
                    pathOptions={{ color: "orange", weight: 2 }}

                  >

                  </Polyline>
                ))}
              </>
            ) : (
              <>
                {/* ✅ HISTORY VIEW ONLY */}

                {/* START MARKER */}
                {firstPoint?.latitude && firstPoint?.longitude && (
                  <Marker
                    position={[firstPoint.latitude, firstPoint.longitude]}
                    icon={startIcon}
                    ref={startMarkerRef}
                  >
                    <Popup className="custom-popup">
                      <div className="popup-header">Start</div>
                      <div className="popup-body">
                        <div>
                          <b>Speed:</b> {firstPoint.speed ?? 0} Km/h
                        </div>
                        <div>
                          <b>Time:</b> {firstPoint.deviceTime}
                        </div>
                        <div>
                          <b>Address:</b> {firstPoint.address}
                        </div>
                      </div>
                    </Popup>
                  </Marker>
                )}

                {/* PARKING + EVENTS */}
                {combindList.map((item: any, idx: number) => {
                  if (item.parking_start_time && showParkingMarkers) {
                    parkingCounter++;
                    const parkingIcon = new Icon({
                      svg: PinCircle,
                      color: "orange",
                      accentColor: "darkorange",
                      content: `P${parkingCounter}`,
                      contentColor: "white",
                      scale: 1,
                    });

                    return (
                      <Marker
                        key={`parking-${parkingCounter}`}
                        position={[item.lat, item.lon]}
                        icon={parkingIcon}
                        ref={(el) => {
                          parkingRefs.current[idx] = el;
                        }}

                      >
                        <Popup className="custom-popup">
                          <div className="popup-header">
                            P{parkingCounter} {item.name}
                          </div>
                          <div className="popup-body">
                            <div>
                              <b>Address:</b> {item.address}
                            </div>
                            <div>
                              <b>Start:</b> {item.parking_start_time}
                            </div>
                            <div>
                              <b>End:</b> {item.parking_end_time}
                            </div>
                            <div>
                              <b>Duration:</b> {item.time}
                            </div>
                          </div>
                        </Popup>
                      </Marker>
                    );
                  }

                  if (item.event_name && showEventMarkers) {
                    eventCounter++;
                    const eventIcon = new Icon({
                      svg: PinCircle,
                      color: "maroon",
                      accentColor: "darkred",
                      content: `E${eventCounter}`,
                      contentColor: "white",
                      scale: 1,
                    });

                    return (
                      <Marker
                        key={`event-${eventCounter}`}
                        position={[item.latitude, item.longitude]}
                        icon={eventIcon}
                        ref={(el) => {
                          eventRefs.current[idx] = el;
                        }}
                      >
                        <Popup className="custom-popup">
                          <div className="popup-header">
                            E{eventCounter} {item.event_name}
                          </div>
                          <div className="popup-body">
                            <div>
                              <b>Address:</b> {item.address}
                            </div>
                            <div>
                              <b>Time:</b> {item.event_time}
                            </div>
                            <div>
                              <b>Speed:</b> {item.speed}
                            </div>
                          </div>
                        </Popup>
                      </Marker>
                    );
                  }

                  return null;
                })}

                {/* END MARKER */}
                {lastPoint?.latitude && lastPoint?.longitude && (
                  <Marker
                    position={[lastPoint.latitude, lastPoint.longitude]}
                    icon={endIcon}
                    ref={endMarkerRef}
                  >
                    <Popup className="custom-popup">
                      <div className="popup-header">End</div>
                      <div className="popup-body">
                        <div>
                          <b>Speed:</b> {lastPoint.speed ?? 0} Km/h
                        </div>
                        <div>
                          <b>Time:</b> {lastPoint.deviceTime}
                        </div>
                        <div>
                          <b>Address:</b> {lastPoint.address}
                        </div>
                      </div>
                    </Popup>
                  </Marker>
                )}

                {/* POLYLINES */}
                {showTripPolyline && polylinePoints.length > 0 && (
                  <Polyline positions={polylinePoints} color="blue" />
                )}

                {showPolylineArrows && polylinePoints.length > 0 && (
                  <PolylineWithArrow positions={polylinePoints} />
                )}

                {activeDrivingLine && (
                  <Polyline
                    positions={activeDrivingLine}
                    color="rgb(14, 227, 42)"
                    weight={5}
                  />
                )}
              </>
            )}
          </>
        )}

        {/* EVENT MARKERS */}
        {activeTab === "events" &&
          events
            .filter((e) => e.latitude && e.longitude)
            .map((e, index) => (
              <Marker
                key={`event-${index}`}
                position={[e.latitude, e.longitude]}
                icon={eventIcon}
                ref={(ref) => {
                  eventRefs.current[index] = ref;
                }}
              >
                <Popup minWidth={280} closeButton={true}>
                  <EventAlertPopup
                    event={e}
                  />
                </Popup>
              </Marker>
            ))}
        {/* ================= ROUTES ================= */}
        {/* ===== ROUTES ===== */}
        {(activeTab === "route" || showRoutes) &&
  routes?.map((r: any, i: number) => {
    if (!r.geom) return null;

    try {
      const geom =
        typeof r.geom === "string" ? JSON.parse(r.geom) : r.geom;

      if (geom.type !== "LineString") return null;

      const latlngs = geom.coordinates.map(
        ([lng, lat]: [number, number]) => [lat, lng] as [number, number],
      );

      const routeName = getRouteName(r);

      return (
        <React.Fragment key={r.id ?? i}>
          <Polyline
            positions={latlngs}
            pathOptions={{ color: "#2563eb", weight: 4 }}
          >
            <Tooltip permanent direction="center" className="route-label">
              {routeName}
            </Tooltip>
          </Polyline>

          {showPolylineArrows && (
            <PolylineWithArrow positions={latlngs} />
          )}
        </React.Fragment>
      );
    } catch {
      return null;
    }
  })}


        {activeTab === "route" && routeGeom?.type === "LineString" && (
          <Polyline
            positions={routeGeom.coordinates.map(
              ([lng, lat]: [number, number]) => [lat, lng],
            )}
            pathOptions={{ color: "#ff0000", weight: 5 }}
          />
        )}
      </MapContainer>
    </div>
  );
};

export default LiveMap;
