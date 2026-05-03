import { useState, useEffect, useRef } from "react";
import Sidebar from "../components/common/Sidebar";
import LiveMap from "../components/map/LiveMap";
import RightToolbar from "../components/common/RightToolbar";
import BottomPanel from "../components/common/BottomPanel";
import TopNavbar from "../components/common/TopnavBar";

import "../assets/css/livetrack.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "@fortawesome/fontawesome-free/css/all.min.css";
import "toastr/build/toastr.min.css";
import { useRecentEvents } from "../hooks/useRecentEvents";
import GeofencePage from "../features/GeofencePage";

import { useAppDispatch, useAppSelector } from "../redux/hooks";
import type { LatLngExpression } from "leaflet";
import { fetchRoutes } from "../slices/routesSlice";
import { connectWS, disconnectWS } from "../api/websocket";
import { fetchMapSettings } from "../slices/usersSlice";
import type { RootState } from "../redux/store";
import { fetchPois } from "../slices/poiSlice";
import PoiPage from "../features/PoiPage";
import { fetchUserSetup } from "../slices/setupSlice";
import { toast } from "react-toastify";
import { incrementUnread,setStatusMap } from "../slices/chatNotificationSlice";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";
import { tokenService } from "../api/tokenService";
import axiosClient from "../api/axiosClient";
import {
  setUnread,
} from "../slices/chatNotificationSlice";
import { useNavigate } from "react-router-dom";
import LogoutModal from "../features/LogoutModal";
const Livetrack = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<
    "objects" | "history" | "events" | "geofence" | "route" | "poi"
  >("objects");

  const [selectedPoint, setSelectedPoint] = useState<any | null>(null);
  const [drawType, setDrawType] = useState<
    "circle" | "polygon" | "polyline" | null
  >(null);

  const [geomData, setGeomData] = useState<any | null>(null);
  const [radius, setRadius] = useState<number | null>(null);

  const [showHistory, setShowHistory] = useState(false);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [historyplayIndex, sethistoryplayIndex] = useState(0);
  const [playSpeed, setPlaySpeed] = useState(1);
  const { data: playbackData } = useAppSelector((state) => state.playback);
  const points = playbackData?.eventDataList || [];
  const [playbackMarkerPos, setPlaybackMarkerPos] =
    useState<LatLngExpression | null>(null);

  const zoomToGeofenceRef = useRef<((g: any) => void) | null>(null);
  const [, setIsEditing] = useState(false);
  const [, setEditGeom] = useState<any>(null);
  const [, setEditRadius] = useState<number | null>(null);
  const [] = useState<any>(null);
  const [routeGeom, setRouteGeom] = useState<any>(null);

  const routes = useAppSelector((state) => state.routes.routes);

  const [showTripPolyline, setShowTripPolyline] = useState(true);
  const [showPolylineArrows, setShowPolylineArrows] = useState(true);
  const [showParkingMarkers, setShowParkingMarkers] = useState(true);
  const [showEventMarkers, setShowEventMarkers] = useState(true);
  const toggleRulerRef = useRef<(() => void) | null>(null);
  const zoomInRef = useRef<(() => void) | null>(null);
  const zoomOutRef = useRef<(() => void) | null>(null);
  const fullscreenRef = useRef<(() => void) | null>(null);

  const [showGeofence, setShowGeofence] = useState(false);
  const [baseLayer, setBaseLayer] = useState<string>("");

  const pois = useAppSelector((state) => state.poi.pois);

  const [selectedPoi, setSelectedPoi] = useState<any | null>(null);

  const [poiInsertMode, setPoiInsertMode] = useState(false);

  const dispatch = useAppDispatch();
  const mapSettings = useAppSelector((state) => state.users.mapSettings);

  const centerRef = useRef<(() => void) | null>(null);
  const [tempPoiLocation, setTempPoiLocation] = useState<any | null>(null);
  const markerRefs = useRef<{ [key: string]: any }>({});
  const [enableClustering, setEnableClustering] = useState(true);
  const closePopupRef = useRef<(() => void) | null>(null);
  const [showRoutes, setShowRoutes] = useState(false);
  const [showPois, setShowPois] = useState(false);
  
   // state foe open event marker pop up in livemap
  const [selectedEvent, setSelectedEvent] = useState<any>(null);

  const [followMarker, setFollowMarker] = useState(true);
  const [search] = useState("");
  // Datatable state
  const [page] = useState(1);
  const [pageSize] = useState(10);
  // Function to toggle tooltips
const [isTooltipActive, setIsTooltipActive] = useState(true);
 const toggleTooltips = () => {
  setIsTooltipActive(prev => !prev);
};
  const [manualMarker, setManualMarker] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  const handleShowPoint = (lat: number, lng: number) => {
    setManualMarker({ lat, lng });
  };
const [loading, setLoading] = useState(true);

const chatClientRef = useRef<Client | null>(null);
const currentUser = tokenService.getUsername();
const [showLogout, setShowLogout] = useState(false);
const navigate = useNavigate();
const isChatOpen = useAppSelector(
  (state) => state.chatNotification.isChatOpen
);
useEffect(() => {
  if (location.pathname !== "/livetrack") return;

  window.history.pushState(null, "", window.location.href);

  const handlePopState = () => {
    if (location.pathname !== "/livetrack") return;

    setShowLogout(true);
    window.history.pushState(null, "", window.location.href);
  };

  window.addEventListener("popstate", handlePopState);

  return () => {
    window.removeEventListener("popstate", handlePopState);
  };
}, [location.pathname]);
const handleLogoutConfirm = () => {
  console.log("🚪 Logging out...");

  // ❌ stop websocket
  chatClientRef.current?.deactivate();
  disconnectWS();

  // ❌ clear storage
  localStorage.clear();

  // optional: reset redux if needed

  setShowLogout(false);

  // 🔥 force login page
  navigate("/", { replace: true });
};
useEffect(() => {
  const token = tokenService.getAccessToken();

  const client = new Client({
   // webSocketFactory: () => new SockJS("http://localhost:8091/ws-chat"),
    webSocketFactory: () => new SockJS("https://fleetplus.trackingpath.com/ws-chat"),
    connectHeaders: {
      Authorization: `Bearer ${token}`,
    },
    reconnectDelay: 5000,

    onConnect: () => {
      console.log("✅ Chat WS Connected (GLOBAL)");
client.subscribe("/user/queue/inbox", (msg) => {
  const body = JSON.parse(msg.body);

  console.log("📩 GLOBAL MESSAGE:", body);

  // ✅ ONLY RECEIVER SHOULD SEE
  if (body.receiverUsername !== currentUser) {
    return; // ❌ ignore if not for me
  }

  // ❌ OPTIONAL: sender ko bhi block karna (double safety)
  if (body.senderUsername === currentUser) {
    return;
  }

  // ✅ SHOW TOAST ONLY IF CHAT CLOSED
  if (!isChatOpen) {
    dispatch(incrementUnread());

    toast.info(`💬 ${body.senderUsername}: ${body.content}`, {
      position: "bottom-right",
    });
  }
});
    },
  });

  client.activate();
  chatClientRef.current = client;

  return () => {
    client.deactivate();
  };
}, []);
 useEffect(() => {
  axiosClient.get("/api/chat/unread-count")
    .then(res => {
      dispatch(setUnread(res.data));
    });
}, []);


useEffect(() => {
  console.log("🔥 Heartbeat started");

  const interval = setInterval(() => {
    console.log("💓 sending heartbeat...");
    
    axiosClient.post("/api/chat/heartbeat")
      .then(() => console.log("✅ heartbeat success"))
      .catch((err) => console.error("❌ heartbeat failed", err));

  }, 6000);

  return () => clearInterval(interval);
}, []);
useEffect(() => {
  const loadStatus = async () => {
    try {
      const res = await axiosClient.get("/api/chat/status-by-username");

      dispatch(setStatusMap(res.data)); // 🔥 Redux me store
    } catch (err) {
      console.error("❌ status load failed", err);
    }
  };

  loadStatus();

  const interval = setInterval(loadStatus, 10000);
  return () => clearInterval(interval);

}, []);
useEffect(() => {
  if (mapSettings) {
    setLoading(false);
  }
}, [mapSettings]);
  useEffect(() => {
    dispatch(fetchMapSettings());
  }, [dispatch]);
  useEffect(() => {
    if (mapSettings?.defaultSelectedMaps?.length) {
      setBaseLayer(mapSettings.defaultSelectedMaps[0]);
    }
  }, [mapSettings]);

  const selectedVehicle = useAppSelector(
    (state: RootState) => state.live.selectedVehicleId,
  );

  useEffect(() => {
    if (activeTab === "route") {
    }
  }, [activeTab]);

  useRecentEvents();

  useEffect(() => {
    if (activeTab === "route" || showRoutes) {
      console.log("🚀 Fetching routes...");
      dispatch(
        fetchRoutes({
          page: page - 1,
          size: pageSize,
          search,
        }),
      );
    }
  }, [activeTab, showRoutes]);


  useEffect(() => {
    connectWS(dispatch);

    return () => {
      disconnectWS();
    };
  }, [dispatch]);

  useEffect(() => {
    if (activeTab === "poi" || showPois) {
      dispatch(
        fetchPois({
          page: page - 1,
          size: pageSize,
          search,
        }),
      );
    }
  }, [activeTab, showPois, dispatch]);

  useEffect(() => {
  if (activeTab !== "history") {
    console.log("Tab changed — clearing POI & Routes");

    setShowPois(false);
    setShowRoutes(false);
  }
}, [activeTab]);
 /* if active tab is not event close pop up  */
useEffect(() => {
  if (activeTab !== "events") {
    setSelectedEvent(null); // reset
  }
}, [activeTab]);

  /* ▶ PLAYBACK ENGINE */
  const BASE_INTERVAL = 800; // thoda fast base (1000 se better feel)

useEffect(() => {
  if (activeTab !== "history") return;
  if (!isPlaying || isPaused || points.length === 0) return;

  // 🔥 interval control (smoothness)
  const interval = BASE_INTERVAL / playSpeed;

  // 🔥 step control (extra speed at higher values)
  const step = playSpeed >= 4 ? 2 : 1;

  const timer = setInterval(() => {
    sethistoryplayIndex((prev) => {
      const next = prev + step;

      if (next >= points.length - 1) {
        setIsPlaying(false);
        return points.length - 1;
      }

      return next;
    });
  }, interval);

  return () => clearInterval(timer);
}, [activeTab, isPlaying, isPaused, playSpeed, points]);

  // ✅ PUT THIS RIGHT HERE 👇
  useEffect(() => {
    if (!isPlaying) return; // 🔥 KEY FIX

    const point = points[historyplayIndex];
    if (!point) return;

    console.log("📍 Moving marker to:", point.latitude, point.longitude);
  }, [historyplayIndex, isPlaying]);

  const handlePlay = () => {
    console.log("▶ PLAY clicked");
    setIsPlaying(true);
    setIsPaused(false);
  };

  const handlePause = () => {
    console.log("⏸ PAUSE clicked");
    setIsPaused(true);
  };

  const handleStop = () => {
    console.log("⏹ STOP clicked");
    setIsPlaying(false);
    setIsPaused(false);
    sethistoryplayIndex(0);
    setPlaybackMarkerPos(null);
  };
  useEffect(() => {
    if (activeTab !== "history") {
      setShowHistory(false);
    }
  }, [activeTab]);
  useEffect(() => {
    setRouteGeom(null);
    setDrawType(null);
  }, [activeTab]);

  useEffect(() => {
    dispatch(fetchUserSetup());
  }, [dispatch]);
  const startRouteDraw = () => {
    console.log("🟢 Route drawing started");
    setDrawType("polyline");
    setRouteGeom(null);
  };

  const stopRouteDraw = () => {
    console.log("🔴 Route drawing stopped");
    setDrawType(null);
  };
  useEffect(() => {
    if (activeTab !== "geofence") {
      setShowGeofence(false); // 🔹 reset button
    }
  }, [activeTab]);
  useEffect(() => {
    if (activeTab !== "history") {
      closePopupRef?.current?.();
    }
  }, [activeTab]);

  return (
    <div className="live-container">
      <TopNavbar setActiveTab={setActiveTab} />

      <div className="map-container">
        <LiveMap
          activeTab={activeTab}
          selectedPlaybackPoint={selectedPoint}
          drawType={drawType}
          showHistory={showHistory}
          showTripPolyline={showTripPolyline}
          showPolylineArrows={showPolylineArrows}
          showParkingMarkers={showParkingMarkers}
          showEventMarkers={showEventMarkers}
          historyplayIndex={historyplayIndex}
          isPlaying={isPlaying}
          playbackMarkerPos={playbackMarkerPos}
          setPlaybackMarkerPos={setPlaybackMarkerPos}
          selectedVehicle={selectedVehicle}
          geom={geomData} // ✅ PASS AS PROPS
          radius={radius}
          onRegisterZoom={(fn) => {
            zoomToGeofenceRef.current = fn;
          }}
          onGeomCreated={({ geom, radius }) => {
            if (activeTab === "geofence") {
              setGeomData(geom);
              setRadius(radius ?? null);
            }

            if (activeTab === "route") {
              setRouteGeom(geom); // 🔥 store route LineString
            }
          }}
          routes={activeTab === "route" || showRoutes ? routes : []}
          routeGeom={activeTab === "route" || showRoutes ? routeGeom : null}
          onRegisterRuler={(fn) => {
            toggleRulerRef.current = fn;
          }}
          onRegisterZoomIn={(fn) => (zoomInRef.current = fn)}
          onRegisterZoomOut={(fn) => (zoomOutRef.current = fn)}
          onRegisterFullscreen={(fn) => (fullscreenRef.current = fn)}
          showGeofence={showGeofence}
          baseLayer={baseLayer}
          pois={pois}
          selectedPoi={selectedPoi}
          poiInsertMode={poiInsertMode}
          setPoiInsertMode={setPoiInsertMode}
          onPoiPointSelected={(lat, lng) => {
            console.log("📍 POI selected:", lat, lng);
            setTempPoiLocation({
              latitude: lat,
              longitude: lng,
            });
            setPoiInsertMode(false);
          }}
          onRegisterCenter={(fn) => {
            centerRef.current = fn;
          }}
          markerRefs={markerRefs}
          enableClustering={enableClustering}
          manualMarker={manualMarker}
          onRegisterClosePopups={(fn) => {
            closePopupRef.current = fn;
          }}
          showRoutes={showRoutes}
          showPois={showPois}
          selectedEvent={selectedEvent}
           followMarker={followMarker}

    onPoiDrag={(id, lat, lng) => {
  console.log("🔥 Drag update:", id, lat, lng);

  setSelectedPoi((prev: any) => {
    if (!prev || prev.id !== id) return prev;

    return {
      ...prev,
      latitude: lat,
      longitude: lng,
    };
  });

  // 🔥 ADD THIS (THIS IS CRITICAL)
  setTempPoiLocation({
    latitude: lat,
    longitude: lng,
  });
}}
isTooltipActive={isTooltipActive} 
        />
          {loading && (
    <div className="map-loader">
      <div className="spinner"></div>
    </div>
  )}
      </div>

      <Sidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        setSelectedPoint={setSelectedPoint}
        onShapeSelect={setDrawType}
        geom={geomData}
        radius={radius} // pass radius separately
        setShowHistory={setShowHistory}
        onPlay={handlePlay}
        onPause={handlePause}
        onStop={handleStop}
        playSpeed={playSpeed}
        setPlaySpeed={setPlaySpeed}
        historyplayIndex={historyplayIndex}
        zoomToGeofenceRef={zoomToGeofenceRef}
        onStartRouteDraw={startRouteDraw}
        onStopRouteDraw={stopRouteDraw}
        routeGeom={routeGeom}
        selectedPoi={selectedPoi}
        setSelectedPoi={setSelectedPoi}
        poiInsertMode={poiInsertMode}
        setPoiInsertMode={setPoiInsertMode}
        tempPoiLocation={tempPoiLocation}
        closeMapPopupsRef={closePopupRef}
        setSelectedEvent={setSelectedEvent}
      />

      <RightToolbar
        activeTab={activeTab}
        showTripPolyline={showTripPolyline}
        setShowTripPolyline={setShowTripPolyline}
        showPolylineArrows={showPolylineArrows}
        setShowPolylineArrows={setShowPolylineArrows}
        showParkingMarkers={showParkingMarkers}
        setShowParkingMarkers={setShowParkingMarkers}
        showEventMarkers={showEventMarkers}
        setShowEventMarkers={setShowEventMarkers}
        onToggleRuler={() => {
          toggleRulerRef.current?.();
        }}
        onZoomIn={() => zoomInRef.current?.()}
        onZoomOut={() => zoomOutRef.current?.()}
        onFullscreen={() => fullscreenRef.current?.()}
        onToggleTooltips={toggleTooltips}
        isTooltipActive={isTooltipActive}
        showGeofence={showGeofence}
        onToggleGeofence={() => setShowGeofence((prev) => !prev)}
        baseLayer={baseLayer}
        setBaseLayer={setBaseLayer}
        availableMaps={mapSettings?.availableMaps || []}
        onCenterDevices={() => {
          centerRef.current?.();
        }}
        enableClustering={enableClustering}
        setEnableClustering={setEnableClustering}
        onShowPoint={handleShowPoint}
        onToggleRoutes={() => {
          setShowRoutes((prev) => {
            return !prev;
          });
        }}
        onTogglePois={() => {
          setShowPois((prev) => {
            return !prev;
          });
        }}
        showPois={showPois}
        showRoutes={showRoutes}
        followMarker={followMarker}
  onToggleFollowMarker={() =>
    setFollowMarker((prev) => !prev)
  }
      />

      {activeTab === "objects" && <BottomPanel sidebarOpen={sidebarOpen} />}
      {activeTab === "poi" && (
        <PoiPage
          poiInsertMode={poiInsertMode}
          setPoiInsertMode={setPoiInsertMode}
          onStartInsert={() => console.log("POI insert started")}
          onSelectPoi={(poi) => setSelectedPoi(poi)}
          selectedPoi={selectedPoi} 
          tempPoiLocation={tempPoiLocation} 
        />
      )}
      {activeTab === "geofence" && (
        <GeofencePage
          geom={geomData}
          radius={radius}
          onShapeSelect={setDrawType}
          onEditStart={(g) => {
            if (g) {
              setIsEditing(true);
              setEditGeom(g.geom);
              setEditRadius(g.radius);
            } else {
              setIsEditing(false);
              setEditGeom(null);
              setEditRadius(null);
            }
          }}
          onZoom={(g) => {
            if (!zoomToGeofenceRef.current) {
              return;
            }

            zoomToGeofenceRef.current(g);
          }}
        />
      )}
   {location.pathname === "/livetrack" && (
  <LogoutModal
    open={showLogout}
    onClose={() => setShowLogout(false)}
    onConfirm={handleLogoutConfirm}
  />
)}
    </div>
  );
};

export default Livetrack;
