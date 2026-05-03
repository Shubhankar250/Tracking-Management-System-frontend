import { useState, useRef, useEffect } from "react";
import "../../assets/css/righttoolbar.css";
import Modal from "../../components/common/Modal";

type RightToolbarProps = {
  activeTab: "objects" | "history" | "events" | "geofence" | "route" | "poi";
  showTripPolyline: boolean;
  setShowTripPolyline: React.Dispatch<React.SetStateAction<boolean>>;
  showPolylineArrows: boolean;
  setShowPolylineArrows: React.Dispatch<React.SetStateAction<boolean>>;
  showParkingMarkers: boolean;
  setShowParkingMarkers: React.Dispatch<React.SetStateAction<boolean>>;
  showEventMarkers: boolean;
  setShowEventMarkers: React.Dispatch<React.SetStateAction<boolean>>;
  onToggleRuler?: () => void;
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  onFullscreen?: () => void;
  onToggleTooltips: () => void;
  isTooltipActive:boolean,
  showGeofence: boolean;
  onToggleGeofence: () => void;
  baseLayer: string;
  setBaseLayer: React.Dispatch<React.SetStateAction<string>>;
  availableMaps: string[];
  onCenterDevices?: () => void;
  enableClustering: boolean;
  setEnableClustering: React.Dispatch<React.SetStateAction<boolean>>;
  onShowPoint?: (lat: number, lng: number) => void;
  onToggleRoutes: () => void;
  onTogglePois: () => void;
  onToggleFollowMarker?: () => void;
followMarker?: boolean;
showPois:boolean;
showRoutes:boolean;
};
const RightToolbar: React.FC<RightToolbarProps> = ({
  activeTab,
  showTripPolyline,
  setShowTripPolyline,
  showPolylineArrows,
  setShowPolylineArrows,
  showParkingMarkers,
  setShowParkingMarkers,
  showEventMarkers,
  setShowEventMarkers,
  onToggleRuler,
  onZoomIn,
  onZoomOut,
  enableClustering,
  setEnableClustering,
  onFullscreen,
  onToggleTooltips,
  isTooltipActive,
  showGeofence,
  onToggleGeofence,
  baseLayer,
  setBaseLayer,
  availableMaps,
  onCenterDevices,
  onShowPoint,
  onToggleRoutes,
  onTogglePois,
  showPois,
  showRoutes,
  onToggleFollowMarker,
  followMarker,
}) => {
  const isHistory = activeTab === "history";

  const handlePrintMap = () => {
    if (typeof manualPrint === "function") {
      manualPrint();
    } else {
      console.error("manualPrint function is not defined");
    }
  };
  function manualPrint() {
    window.print();
  }
  const handleShowPoint = () => {
    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);

    if (isNaN(latitude) || isNaN(longitude)) {
      alert("Please enter valid latitude and longitude");
      return;
    }

    onShowPoint?.(latitude, longitude);

    setShowPointModal(false);
    setLat("");
    setLng("");
  };
  const formatLayerName = (layer: string) => {
    const names: Record<string, string> = {
      GOOGLE_ROADMAP: "Google Roadmap",
      GOOGLE_SATELLITE: "Google Satellite",
      GOOGLE_HYBRID: "Google Hybrid",
      GOOGLE_TERRAIN: "Google Terrain",
      MAPBOX_STREETS: "MapBox Streets",
      MAPBOX_SATELLITE: "MapBox Satellite",
    };

    return names[layer] || layer;
  };
  // Show Point Modal State
  const [showPointModal, setShowPointModal] = useState(false);
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");
  const [showLayerDropdown, setShowLayerDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowLayerDropdown(false);
      }
    };

    if (showLayerDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showLayerDropdown]);

  return (
    <>
      <div className="right-toolbar floating-toolbar">
        {/* Always visible buttons */}
        <button className="toolbar-btn mt-2" id="btn-ruler" title="Ruler" 
        onClick={() => {onToggleRuler?.();}}><i className="fas fa-ruler"></i></button>

        <button className="toolbar-btn mt-2" id="btn-fullscreen" title="Fullscreen" onClick={onFullscreen}>
          <i className="fas fa-expand-arrows-alt"></i> </button>

        <button className="toolbar-btn" title="Toggle Layer" onClick={() => setShowLayerDropdown((prev) => !prev)}>
        <i className="fas fa-layer-group"></i></button>

        <button className="toolbar-btn" id="btn-zoom-in" title="Zoom In" onClick={onZoomIn}>
          <i className="fas fa-plus"></i></button>
        
        <button className="toolbar-btn" id="btn-zoom-out" title="Zoom Out" onClick={onZoomOut}>
          <i className="fas fa-minus"></i></button>

        {activeTab !== "history" && (
          <>
            <button className="toolbar-btn" id="btn-center" title="Center on Devices" onClick={onCenterDevices}>
            <i className="fas fa-bullseye"></i></button>
            
            <button className="toolbar-btn" id="btn-print" title="Print Map" onClick={handlePrintMap}>
            <i className="fas fa-print"></i></button>

            <button className={`toolbar-btn ${showGeofence ? "active" : ""}`} id="btn-geofence" title="Toggle Geofence" onClick={onToggleGeofence}>
            <i className="fas fa-draw-polygon"></i> </button>

            <button className="toolbar-btn" title="Show Point" onClick={() => setShowPointModal(true)}>
            <i className="fas fa-map-pin"></i> </button>

            <button  className={`toolbar-btn ${isTooltipActive ? "active" : ""}`} id="btn-tooltip" title="Toggle Tooltip"onClick={onToggleTooltips}>
            <i className="bi bi-eye"></i> </button>

            <button className={`toolbar-btn ${enableClustering ? "" : "active"}`} title="Toggle Clustering" 
            onClick={() => setEnableClustering((prev) => !prev)}>
            <i className="fas fa-broom"></i> </button>
          </>
        )}    
        {/* Show ONLY in history tab */}
        {isHistory && (
          <>
            <button
              className={`toolbar-btn ${showTripPolyline && showPolylineArrows ? "" : "active"}`}
              title="Trip + Arrows" onClick={() => {               
                setShowTripPolyline((prev) => !prev);
                setShowPolylineArrows((prev) => !prev);
              }}
            ><i className="fas fa-route"></i> </button>
            {/*
          <button className={`toolbar-btn ${showPolylineArrows ? "active" : ""}`}
           title="Arrows" onClick={() => setShowPolylineArrows(prev => !prev)}>➤</button>
          */}

            <button className={`toolbar-btn ${showParkingMarkers ? "" : "active"}`}
             title="Stops" onClick={() => setShowParkingMarkers((prev) => !prev)}>🅿</button>

            <button className={`toolbar-btn ${showEventMarkers ? "" : "active"}`}
            title="Events" onClick={() => setShowEventMarkers((prev) => !prev)}>🔔</button>
            
            <button  className={`toolbar-btn ${showRoutes ? "active" : ""}`}           
            title="Route" onClick={() => {onToggleRoutes(); }}><i className="fas fa-road"></i></button>

            <button className={`toolbar-btn ${showPois ? "active" : ""}`}
            title="POI"  onClick={() => {onTogglePois(); }}>📌</button>

            <button className={`toolbar-btn ${followMarker ? "" : "active"}`}
            title={followMarker ? "Disable Auto Follow" : "Enable Auto Follow"}
            onClick={onToggleFollowMarker}><i className="fas fa-bullseye"></i></button>
          </>
        )}

        <button className="toolbar-btn" id="tooltipToggleBtn" style={{ display: "none" }} title="Toggle Tooltip">👁</button>
      </div>
     
      <Modal
        isOpen={showPointModal}
        title="Show Point"
        onClose={() => setShowPointModal(false)}
        size="medium"
        className="show-point-modal"
      >
        <div className="show-point-body">
          <div className="form-group">
            <label>Latitude</label>
            <input
              type="text"
              placeholder="Enter latitude"
              value={lat}
              onChange={(e) => setLat(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Longitude</label>
            <input
              type="text"
              placeholder="Enter longitude"
              value={lng}
              onChange={(e) => setLng(e.target.value)}
            />
          </div>
        </div>

        <div className="show-point-footer">
          <button
            className="btn-secondary"
            onClick={() => setShowPointModal(false)}
          >
            Close
          </button>
          <button className="btn-primary" onClick={handleShowPoint}>
            Show
          </button>
        </div>
      </Modal>
      {showLayerDropdown && (
        <div className="layer-dropdown" ref={dropdownRef}>
          {availableMaps.map((layer) => (
            <label key={layer} className="layer-option">
              <input
                type="radio"
                name="mapLayer"
                checked={baseLayer === layer}
                onChange={() => {
                  setBaseLayer(layer);
                  setShowLayerDropdown(false);
                }}
              />
              {formatLayerName(layer)}
            </label>
          ))}
        </div>
      )}
    </>
  );
};

export default RightToolbar;
