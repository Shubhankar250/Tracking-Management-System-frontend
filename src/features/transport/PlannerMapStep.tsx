import { useEffect, useMemo, useRef, useState, type ChangeEvent } from "react";
import L from "leaflet";
import "@geoman-io/leaflet-geoman-free";
import "@geoman-io/leaflet-geoman-free/dist/leaflet-geoman.css";
import "leaflet/dist/leaflet.css";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import "../../assets/css/routeWizard.css";

import {
  importKmlFile,
  importKmlText,
  importGpsText,
} from "../../api/transportPlannerService";

type Stop = {
  id?: number;
  clientStopId?: number;
  stopName: string;
  stopType: string;
  geofenceRadius: number;
  latitude?: number;
  longitude?: number;
  sequenceNo: number;
  passengerCount?: number;
  approved?: boolean;
};

type ImportedStop = Partial<Stop>;

type PlannerData = {
  sourceType?: "manual" | "kml" | "gps";
  routeGeoJson?: string;
  stops?: Stop[];
};

type Props = {
  data?: PlannerData;
  updateForm?: (data: Partial<PlannerData>) => void;
};

const DEFAULT_CENTER: L.LatLngExpression = [26.8467, 80.9462];

delete (L.Icon.Default.prototype as any)._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const PlannerMapStep = ({ data, updateForm }: Props) => {
  const mapRef = useRef<L.Map | null>(null);
  const drawnItemsRef = useRef<L.FeatureGroup | null>(null);
  const addStopModeRef = useRef(false);
  const stopsRef = useRef<Stop[]>([]);
  const markersRef = useRef<Map<number, L.Marker>>(new Map());
  const circlesRef = useRef<Map<number, L.Circle>>(new Map());

  const [mapReady, setMapReady] = useState(false);
  const [addStopMode, setAddStopMode] = useState(false);
  const [kmlText, setKmlText] = useState("");
  const [gpsText, setGpsText] = useState("");
  const [gpsIdleMinutes, setGpsIdleMinutes] = useState(5);
  const [gpsStopRadiusMeters, setGpsStopRadiusMeters] = useState(50);

  const method = data?.sourceType || "manual";
  const totalStops = data?.stops?.length || 0;
  const hasRoute = Boolean(data?.routeGeoJson);

  const getKey = (stop: Stop, index: number) =>
    stop.clientStopId ?? stop.id ?? index;

  const generateClientStopId = () =>
    Math.floor(100000000000000 + Math.random() * 900000000000000);

  const renumberStops = (items: Stop[]) =>
    items.map((stop, index) => ({
      ...stop,
      sequenceNo: index + 1,
    }));

  const createStop = (
    lat: number,
    lng: number,
    existingStops: Stop[],
  ): Stop => ({
    stopName: `Stop ${existingStops.length + 1}`,
    stopType: "Pickup",
    geofenceRadius: 50,
    latitude: lat,
    longitude: lng,
    sequenceNo: existingStops.length + 1,
    clientStopId: generateClientStopId(),
    passengerCount: 0,
    approved: false,
  });

  const normalizeImportedStops = (stops: ImportedStop[] = []): Stop[] =>
    stops.map((stop, index) => ({
      id: stop.id,
      clientStopId: stop.clientStopId ?? generateClientStopId(),
      stopName: stop.stopName || `Stop ${index + 1}`,
      stopType: stop.stopType || "Pickup",
      geofenceRadius: stop.geofenceRadius ?? 50,
      latitude: stop.latitude,
      longitude: stop.longitude,
      sequenceNo: stop.sequenceNo ?? index + 1,
      passengerCount: stop.passengerCount ?? 0,
      approved: stop.approved ?? false,
    }));

  const syncStops = (updatedStops: Stop[]) => {
    updateForm?.({ stops: renumberStops(updatedStops) });
  };

  const syncStopPosition = (key: number, lat: number, lng: number) => {
    const updatedStops = stopsRef.current.map((stop, index) => {
      const stopKey = getKey(stop, index);
      return stopKey === key
        ? { ...stop, latitude: lat, longitude: lng }
        : stop;
    });

    updateForm?.({ stops: updatedStops });
  };

  const updateGeoJson = () => {
    if (!drawnItemsRef.current) return;
    const geoJson = drawnItemsRef.current.toGeoJSON();
    updateForm?.({ routeGeoJson: JSON.stringify(geoJson) });
  };

  const fitRoute = () => {
    if (!mapRef.current) return;

    const bounds = new L.LatLngBounds([]);

    drawnItemsRef.current?.eachLayer((layer) => {
      if ("getBounds" in layer) {
        bounds.extend((layer as L.Polygon | L.Polyline).getBounds());
      } else if ("getLatLng" in layer) {
        bounds.extend((layer as L.Marker).getLatLng());
      }
    });

    stopsRef.current.forEach((stop) => {
      if (stop.latitude != null && stop.longitude != null) {
        bounds.extend([stop.latitude, stop.longitude]);
      }
    });

    if (bounds.isValid()) {
      mapRef.current.fitBounds(bounds.pad(0.15));
    }
  };

  const clearRoute = () => {
    drawnItemsRef.current?.clearLayers();
    updateForm?.({ routeGeoJson: "" });
  };

  const clearStops = () => {
    markersRef.current.forEach((marker) => marker.remove());
    circlesRef.current.forEach((circle) => circle.remove());
    markersRef.current.clear();
    circlesRef.current.clear();
    updateForm?.({ stops: [] });
  };

  const renderStopLayers = (map: L.Map, stop: Stop, index: number) => {
    const key = getKey(stop, index);
    const lat = stop.latitude ?? 26.8467;
    const lng = stop.longitude ?? 80.9462;

    const marker = L.marker([lat, lng], { draggable: true }).addTo(map);
    marker.pm.enable({ draggable: true });

    const circle = L.circle([lat, lng], {
      radius: stop.geofenceRadius || 50,
      color: "#0f766e",
      fillColor: "#99f6e4",
      fillOpacity: 0.15,
      weight: 1.5,
    }).addTo(map);

    const applyPosition = (nextLat: number, nextLng: number) => {
      circle.setLatLng([nextLat, nextLng]);
      syncStopPosition(key, nextLat, nextLng);
    };

    marker.on("dragend", () => {
      const pos = marker.getLatLng();
      applyPosition(pos.lat, pos.lng);
    });

    marker.on("pm:dragend", (event: any) => {
      const pos = event.layer.getLatLng();
      applyPosition(pos.lat, pos.lng);
    });

    marker.on("pm:update", (event: any) => {
      const pos = event.layer.getLatLng();
      applyPosition(pos.lat, pos.lng);
    });

    markersRef.current.set(key, marker);
    circlesRef.current.set(key, circle);
  };

  useEffect(() => {
    stopsRef.current = data?.stops || [];
  }, [data?.stops]);

  useEffect(() => {
    addStopModeRef.current = addStopMode;
  }, [addStopMode]);

  useEffect(() => {
    if (!mapReady || !mapRef.current) return;

    const map = mapRef.current;
    markersRef.current.forEach((marker) => map.removeLayer(marker));
    circlesRef.current.forEach((circle) => map.removeLayer(circle));
    markersRef.current.clear();
    circlesRef.current.clear();

    (data?.stops || []).forEach((stop, index) => {
      renderStopLayers(map, stop, index);
    });
  }, [data?.stops, mapReady]);

  useEffect(() => {
    if (
      !mapReady ||
      !data?.routeGeoJson ||
      !drawnItemsRef.current ||
      !mapRef.current
    )
      return;

    const drawnItems = drawnItemsRef.current;
    drawnItems.clearLayers();

    try {
      const geoJson = JSON.parse(data.routeGeoJson);

      const layer = L.geoJSON(geoJson, {
        style: {
          color: "#2563eb",
          weight: 3,
          fillColor: "#60a5fa",
          fillOpacity: 0.2,
        },
      });

      layer.eachLayer((child: any) => {
        drawnItems.addLayer(child);
      });
      setTimeout(() => {
        const bounds = layer.getBounds();
        if (bounds.isValid()) {
          mapRef.current!.fitBounds(bounds.pad(0.2));
        }
      }, 100);
    } catch (error) {
      console.error("Invalid GeoJSON", error);
    }
    console.log("Parsed GeoJSON:", JSON.parse(data.routeGeoJson));
  }, [data?.routeGeoJson, mapReady]);

  useEffect(() => {
    if (mapRef.current) return;

    const map = L.map("plannerMap").setView(DEFAULT_CENTER, 12);
    mapRef.current = map;

    const drawnItems = new L.FeatureGroup();
    drawnItemsRef.current = drawnItems;
    map.addLayer(drawnItems);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap contributors",
    }).addTo(map);

    setMapReady(true);

    map.pm.addControls({
      position: "topleft",
      drawMarker: true,
      editMode: true,
      dragMode: true,
      removalMode: true,
      drawPolyline: true,
      drawPolygon: false,
      drawCircle: false,
      drawCircleMarker: false,
      drawRectangle: false,
      drawText: false,
      cutPolygon: false,
      rotateMode: false,
    });

    map.off("click");
    map.on("click", (event: any) => {
      if (!addStopModeRef.current) return;

      const { lat, lng } = event.latlng;
      const updatedStops = [
        ...stopsRef.current,
        createStop(lat, lng, stopsRef.current),
      ];
      syncStops(updatedStops);
    });

    map.on("pm:create", (event: any) => {
      const layer = event.layer;

      if (event.shape === "Line") {
        drawnItems.addLayer(layer);
        updateGeoJson();
        return;
      }

      if (event.shape === "Marker") {
        const latlng = layer.getLatLng();
        layer.remove();
        const updatedStops = [
          ...stopsRef.current,
          createStop(latlng.lat, latlng.lng, stopsRef.current),
        ];
        syncStops(updatedStops);
      }
    });

    map.on("pm:edit", updateGeoJson);
    map.on("pm:update", updateGeoJson);

    map.on("pm:globaleditmodetoggled", (event: any) => {
      if (!event.enabled) updateGeoJson();
    });

    map.on("pm:globaldragmodetoggled", (event: any) => {
      if (!event.enabled) updateGeoJson();
    });

    map.on("pm:globalremovalmodetoggled", (event: any) => {
      if (!event.enabled) updateGeoJson();
    });

    map.on("pm:remove", (event: any) => {
      const layer = event.layer;

      if (drawnItemsRef.current?.hasLayer(layer)) {
        drawnItemsRef.current.removeLayer(layer);
        updateGeoJson();
        return;
      }

      markersRef.current.forEach((marker, key) => {
        if (marker !== layer) return;

        const updatedStops = stopsRef.current.filter(
          (stop, index) => getKey(stop, index) !== key,
        );
        const circle = circlesRef.current.get(key);

        if (circle) {
          map.removeLayer(circle);
          circlesRef.current.delete(key);
        }

        markersRef.current.delete(key);
        syncStops(updatedStops);
      });
    });

    return () => {
      map.remove();
      mapRef.current = null;
      drawnItemsRef.current = null;
    };
  }, []);

  const handleKmlFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const res = await importKmlFile(file);
    updateForm?.({
      stops: normalizeImportedStops(res.data.stops),
      routeGeoJson: res.data.routeGeoJson,
    });
  };

  const handleKmlText = async () => {
    if (!kmlText.trim()) return;

    const res = await importKmlText(kmlText);
    updateForm?.({
      stops: normalizeImportedStops(res.data.stops),
      routeGeoJson: res.data.routeGeoJson,
    });
  };

  const handleGpsText = async () => {
    if (!gpsText.trim()) return;

    const res = await importGpsText({
      csv: gpsText,
      idleMinutes: gpsIdleMinutes,
      stopRadiusMeters: gpsStopRadiusMeters,
    });

    updateForm?.({
      stops: normalizeImportedStops(res.data.stops),
      routeGeoJson: res.data.routeGeoJson,
    });
  };

  const plannerMetrics = useMemo(
    () => [
      { label: "Mode", value: method.toUpperCase() },
      { label: "Stops", value: String(totalStops) },
      { label: "Route", value: hasRoute ? "Ready" : "Not Drawn" },
    ],
    [hasRoute, method, totalStops],
  );

  return (
    <section className="rwpm-plannermap">
      <div className="rwpm-plannermap__shell">
        <div className="rwpm-plannermap__header">
          <div>
            <p className="rwpm-plannermap__eyebrow">Planner Map</p>
            <h3 className="rwpm-plannermap__title">Route Planner</h3>
            <p className="rwpm-plannermap__subtitle">
              Draw routes, place stops, import KML or GPS history, and fine-tune
              the map with Geoman tools.
            </p>
          </div>

          <div className="rwpm-plannermap__metrics">
            {plannerMetrics.map((metric) => (
              <div className="rwpm-plannermap__metric" key={metric.label}>
                <span className="rwpm-plannermap__metric-label">
                  {metric.label}
                </span>
                <strong className="rwpm-plannermap__metric-value">
                  {metric.value}
                </strong>
              </div>
            ))}
          </div>
        </div>

        <div className="rwpm-plannermap__toolbar">
          <div>
            <strong className="rwpm-plannermap__toolbar-title">
              Map Editing Tools
            </strong>
            <p className="rwpm-plannermap__hint">
              Use draw, edit, drag, and delete tools to modify route and stops.
            </p>
          </div>

          <div className="rwpm-plannermap__toolset">
            <button
              type="button"
              className={`rwpm-plannermap__tool ${addStopMode ? "is-active" : ""}`}
              onClick={() => setAddStopMode((prev) => !prev)}
            >
              Add Stop {addStopMode ? "ON" : "OFF"}
            </button>
            <button
              type="button"
              className="rwpm-plannermap__tool"
              onClick={clearRoute}
            >
              Clear Route
            </button>
            <button
              type="button"
              className="rwpm-plannermap__tool"
              onClick={clearStops}
            >
              Clear Stops
            </button>
            <button
              type="button"
              className="rwpm-plannermap__tool"
              onClick={fitRoute}
            >
              Fit Route
            </button>
          </div>
        </div>

        {method !== "manual" && (
          <div className="rwpm-plannermap__imports">
            {method === "kml" && (
              <div className="rwpm-plannermap__import-card">
                <h4 className="rwpm-plannermap__import-title">KML Import</h4>

                <div className="rwpm-plannermap__field">
                  <label className="rwpm-plannermap__label">KML File</label>
                  <input
                    type="file"
                    onChange={handleKmlFile}
                    className="rwpm-plannermap__input"
                  />
                </div>

                <div className="rwpm-plannermap__field">
                  <label className="rwpm-plannermap__label">
                    Paste KML Text
                  </label>
                  <textarea
                    className="rwpm-plannermap__textarea"
                    value={kmlText}
                    onChange={(event) => setKmlText(event.target.value)}
                  />
                </div>

                <button
                  type="button"
                  className="rwpm-plannermap__import-btn"
                  onClick={handleKmlText}
                >
                  Import KML
                </button>
              </div>
            )}

            {method === "gps" && (
              <div className="rwpm-plannermap__import-card">
                <h4 className="rwpm-plannermap__import-title">
                  GPS History Import
                </h4>

                <div className="rwpm-plannermap__field-grid">
                  <div className="rwpm-plannermap__field">
                    <label className="rwpm-plannermap__label">
                      Idle Minutes
                    </label>
                    <input
                      type="number"
                      className="rwpm-plannermap__input"
                      value={gpsIdleMinutes}
                      onChange={(event) =>
                        setGpsIdleMinutes(Number(event.target.value))
                      }
                    />
                  </div>

                  <div className="rwpm-plannermap__field">
                    <label className="rwpm-plannermap__label">
                      Stop Radius
                    </label>
                    <input
                      type="number"
                      className="rwpm-plannermap__input"
                      value={gpsStopRadiusMeters}
                      onChange={(event) =>
                        setGpsStopRadiusMeters(Number(event.target.value))
                      }
                    />
                  </div>
                </div>

                <div className="rwpm-plannermap__field">
                  <label className="rwpm-plannermap__label">GPS CSV</label>
                  <textarea
                    className="rwpm-plannermap__textarea"
                    value={gpsText}
                    onChange={(event) => setGpsText(event.target.value)}
                  />
                </div>

                <button
                  type="button"
                  className="rwpm-plannermap__import-btn"
                  onClick={handleGpsText}
                >
                  Import GPS History
                </button>
              </div>
            )}
          </div>
        )}

        <div className="rwpm-plannermap__map-frame">
          <div id="plannerMap" className="rwpm-plannermap__map" />
        </div>
      </div>
    </section>
  );
};

export default PlannerMapStep;
