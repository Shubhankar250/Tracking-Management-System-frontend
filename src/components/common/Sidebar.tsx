import { useEffect, useMemo, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import {
  fetchLiveDevices,
  setSelectedVehicle,
  setVisibleVehicleIds,
} from "../../slices/liveSlice";
import type { LiveDataDto } from "../../api/liveService";
import "../../assets/css/sidebar.css";
import "@fortawesome/fontawesome-free/css/all.min.css";
import engineOn from "../../assets/images/engine-on.png";
import engineOff from "../../assets/images/engine-off.png";
import engineIdle from "../../assets/images/orange-engine.png";
import engineDefault from "../../assets/images/default-engine.png";
import HistoryPanel from "./HistoryPanel";
import EventTab from "./EventTab";
import VehicleContextMenu from "./VehicleContextMenu";
import GeofencePage from "../../features/GeofencePage";
import RoutePage from "../../features/RoutePage";
import PoiPage from "../../features/PoiPage";
import type { StoppageItem } from "./StoppageList";
import logoImage from "../../assets/images/tracking_path-300x61.png";
import { fetchLiveFollowData } from "../../slices/liveFollowSlice";
import Device from "../../features/Device";
import DeviceGroupModal from "../../features/DeviceGroupModal";
import SharePositionModal from "../../features/SharePositionModal";
import { FaAngleLeft, FaAngleRight } from "react-icons/fa";
import { store } from "../../redux/store";
import FollowModal from "./FollowModal";
import ObjectsTable from "../../features/ObjectsTable";
import CommandChatModal from "./CommandChatModal.tsx";

interface SidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  setSelectedPoint: (item: StoppageItem) => void; // required, not optional
  onShapeSelect: (type: "circle" | "polygon" | null) => void;
  geom?: any;
  radius?: number | null;
  setShowHistory: (val: boolean) => void;
  // 👇 Playback controls
  onPlay?: () => void;
  onPause?: () => void;
  onStop?: () => void;
  playSpeed?: number;
  setPlaySpeed: React.Dispatch<React.SetStateAction<number>>;
  historyplayIndex?: number; // 🔹 NEW
  zoomToGeofenceRef: React.MutableRefObject<((g: any) => void) | null>;

  onStartRouteDraw: () => void;
  onStopRouteDraw: () => void;
  routeGeom?: any;
  selectedPoi: any | null;
  setSelectedPoi: (poi: any | null) => void;
  poiInsertMode: boolean;
  setPoiInsertMode: React.Dispatch<React.SetStateAction<boolean>>;
  tempPoiLocation?: { latitude: number; longitude: number } | null; // ✅ add

  closeMapPopupsRef?: React.RefObject<(() => void) | null>;
  setSelectedEvent: (event: any) => void;
}

type TabType = "objects" | "history" | "events" | "geofence" | "route" | "poi";
type FilterType = "All" | "Offline" | "Moving" | "Idle" | "Stopped";

const Sidebar: React.FC<SidebarProps> = ({
  sidebarOpen,
  setSidebarOpen,
  activeTab,
  setActiveTab,
  setSelectedPoint,
  onShapeSelect,
  geom,
  radius,
  setShowHistory,
  onPlay,
  onPause,
  onStop,
  playSpeed,
  setPlaySpeed,
  historyplayIndex,
  zoomToGeofenceRef,
  onStartRouteDraw,
  onStopRouteDraw,
  routeGeom,
  setSelectedPoi,
  poiInsertMode,
  setPoiInsertMode,
  tempPoiLocation,
  closeMapPopupsRef,
  setSelectedEvent,
}) => {
  const dispatch = useAppDispatch();
  const { loading: historyLoading } = useAppSelector((state) => state.playback);

  const { devices, loading } = useAppSelector((state) => state.live);

  const [activeFilter, setActiveFilter] = useState<FilterType>("All");
  const [showVehicles, setShowVehicles] = useState(true);
  const [groupOpenMap, setGroupOpenMap] = useState<Record<string, boolean>>({});
  const [activeVehicleId, setActiveVehicleId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [checkedVehicleIds, setCheckedVehicleIds] = useState<Set<number>>(
    new Set(),
  );
  const [menuVisible, setMenuVisible] = useState(false);
  const [menuPos, setMenuPos] = useState({ x: 0, y: 0 });
  const [menuDeviceId, setMenuDeviceId] = useState<number | null>(null);
  const [menumodalType, setMenumodalType] = useState<string | null>(null);

  const [, setIsEditing] = useState(false);
  const [, setEditGeom] = useState<any>(null);
  const [, setEditRadius] = useState<number | null>(null);
  const [, setEditingGeofenceId] = useState<number | null>(null);

  const [deviceModalOpen, setDeviceModalOpen] = useState(false);
  const [editingDeviceId, setEditingDeviceId] = useState<number>();

  const openEditDevice = (id: number) => {
    setEditingDeviceId(id);
    setDeviceModalOpen(true);
  };
  const [showShareModal, setShowShareModal] = useState(false);
  const [, setShareDeviceId] = useState<number | null>(null);
  const openShareModal = (deviceId: number) => {
    setShareDeviceId(deviceId);
    setShowShareModal(true);
  };

  const [historyPreset, setHistoryPreset] = useState<string | null>(null);
  const [historyDeviceId, setHistoryDeviceId] = useState<number | null>(null);
  const [showFollowModal, setShowFollowModal] = useState(false);
  const [openDevice, setDevice] = useState(false);

  const [deviceGroupModalOpen, setDeviceGroupModalOpen] = useState(false);
  const [editingGroupName, setEditingGroupName] = useState<string | undefined>(
    undefined,
  );
  const [editingGroupId, setEditingGroupId] = useState<number | undefined>();

  const [showCommandModal, setShowCommandModal] = useState(false);
  const [commandDeviceId, setCommandDeviceId] = useState<number | null>(null);
  const openCommandModal = (deviceId: number) => {
    setCommandDeviceId(deviceId);
    setShowCommandModal(true);
  };
  const [showObjectsModal, setShowObjectsModal] = useState(false);
  const [menuDeviceStatus, setMenuDeviceStatus] = useState<string>("");
    const [menuDeviceTime, setMenuDeviceTime] = useState<string | null>(null);

  useEffect(() => {
    if (showFollowModal) {
      document.body.classList.add("no-follow-blur");
    } else {
      document.body.classList.remove("no-follow-blur");
    }

    return () => {
      document.body.classList.remove("no-follow-blur");
    };
  }, [showFollowModal]);

  useEffect(() => {
    if (activeTab === "objects") {
      setActiveFilter("All");
    }
  }, [activeTab]);

  useEffect(() => {
    if (activeTab !== "history") {
      setHistoryPreset(null);
      setHistoryDeviceId(null);
    }
  }, [activeTab]);

  useEffect(() => {
    dispatch(fetchLiveDevices());
  }, [dispatch]);

  const selectedVehicleId = useAppSelector(
    (state) => state.live.selectedVehicleId,
  );

  useEffect(() => {
    if (devices.length === 0) return;

    const ids = devices.map((v) => v.device_id);

    // Always update visible IDs
    setCheckedVehicleIds((prev) => (prev.size === 0 ? new Set(ids) : prev));

    dispatch(setVisibleVehicleIds(ids));

    // ✅ ONLY set default selection if nothing selected yet
    if (selectedVehicleId === null) {
      setActiveVehicleId(devices[0].device_id);
      dispatch(setSelectedVehicle(devices[0].device_id));
    }
  }, [devices, dispatch, selectedVehicleId]);

  const groupedData = useMemo(() => {
    const map: Record<
      string,
      { groupName: string; group_id: number; vehicles: LiveDataDto[] }
    > = {};

    devices.forEach((item) => {
      const groupName = item.group_name?.trim() || "Ungrouped";
      const groupId = item.group_id ?? 0; // 👈 ADD THIS

      if (!map[groupName]) {
        map[groupName] = {
          groupName,
          group_id: groupId, // 👈 STORE HERE
          vehicles: [],
        };
      }

      map[groupName].vehicles.push(item);
    });

    return map;
  }, [devices]);

  const openMenu = (
    e: React.MouseEvent,
    deviceId: number,
    modalType: string,
    status: string,
    devicetime?: string
  ) => {
    e.stopPropagation();

    setMenuPos({
      x: e.clientX,
      y: e.clientY,
    });

    setMenuDeviceId(deviceId);
    setMenumodalType(modalType);
    setMenuDeviceStatus(status);
    setMenuDeviceTime(devicetime || null);
    setMenuVisible(true);
  };
  const getAttributes = (v: LiveDataDto) => {
    try {
      if (!v.attributes) return {};

      // already object
      if (typeof v.attributes === "object") {
        return v.attributes;
      }

      // string JSON
      if (typeof v.attributes === "string") {
        return JSON.parse(v.attributes);
      }

      return {};
    } catch {
      return {};
    }
  };
  const applyFilter = (v: LiveDataDto) => {
    const currentTime = Date.now();
    let deviceTimeEpoch = 0;

    if (v.devicetime) {
      const dt = new Date(v.devicetime);
      if (!isNaN(dt.getTime())) {
        deviceTimeEpoch = dt.getTime();
      }
    }

    const attrs = getAttributes(v);
    const ignition =
      attrs?.ignition === true;

    const isRecent = currentTime - deviceTimeEpoch <= 10 * 60 * 1000;

    // ✅ ALL
    if (activeFilter === "All") return true;

    // ✅ OFFLINE (STRICT)
    if (activeFilter === "Offline") {
      return v.status !== "online" || !isRecent;
    }

    // ✅ Only consider ONLINE devices below
    if (v.status !== "online") return false;

    // 🟢 MOVING
    if (activeFilter === "Moving") {
      return v.speed > v.min_moving_speed;
    }

    // 🟡 IDLE
    if (activeFilter === "Idle") {
      return (
        (v.speed > 0 && v.speed <= v.min_moving_speed) ||
        (v.speed === 0 && ignition === true)
      );
    }

    // ⚫ STOPPED
    if (activeFilter === "Stopped") {
      return v.speed === 0 && ignition === false;
    }

    return true;
  };

  const searchFilter = (v: LiveDataDto) => {
    const name = v.device_name ?? "";
    const term = searchTerm ?? "";
    return name.toLowerCase().includes(term.toLowerCase());
  };
  const hasValidDeviceTime = (v: LiveDataDto) => {
    if (!v.devicetime) return false;

    const dt = new Date(v.devicetime);
    return !isNaN(dt.getTime());
  };

  const filteredVehicleCount = useMemo(() => {
    return devices.filter(applyFilter).filter(searchFilter).length;
  }, [devices, activeFilter, searchTerm]);

const getStatusClass = (v: LiveDataDto) => {
  const currentTime = Date.now();

  let deviceTimeEpoch = 0;

  if (v.devicetime) {
    const dt = new Date(v.devicetime);
    if (!isNaN(dt.getTime())) {
      deviceTimeEpoch = dt.getTime();
    }
  }

  const isRecent = currentTime - deviceTimeEpoch <= 5 * 60 * 1000;

  // agar last data 10 min se purana hai to offline
  if (!isRecent) return "offline";

  if (v.status === "online") return "online";

  return "offline";
};
const isDeviceRecent = (v: LiveDataDto) => {
  if (!v.devicetime) return false;

  const dt = new Date(v.devicetime);
  if (isNaN(dt.getTime())) return false;

  return Date.now() - dt.getTime() <= 10 * 60 * 1000;
};
  const getEngineIconAndTitle = (v: any) => {
    let icon = engineDefault;
    let title = "No Data";

    const attrs = getAttributes(v);
    const ignition =
      attrs?.ignition === true;
    if (v.speed > 0) {
      icon = engineOn;
      title = "Engine On (Moving)";
    } else if (v.speed === 0 && ignition === true) {
      icon = engineIdle;
      title = "Engine Idle";
    } else if (v.speed === 0 && ignition === false) {
      icon = engineOff;
      title = "Engine Off (Stopped)";
    } else if (v.latitude === 0 && v.longitude === 0) {
      icon = engineDefault;
      title = "No Data";
    }

    return { icon, title };
  };
  const settings = useAppSelector((state) => state.settings.data);
  const Servername = settings?.serverName;

  const BASE_URL = import.meta.env.VITE_IMAGE_BASE_URL;

  const logoSrc = settings?.logo?.frontpageLogo
    ? `${BASE_URL}/${settings.logo.frontpageLogo}`
    : logoImage;

 const handleHistoryFromMenu = (type: string, deviceId: number) => {
        setHistoryPreset(type);
        setHistoryDeviceId(deviceId);

        // open history tab
        setActiveTab("history");

        // also select vehicle globally (map + redux)
        // const vehicle = devices.find((d) => d.device_id === deviceId);
        // if (vehicle) {
        //     dispatch(setSelectedVehicle(vehicle.device_id));
        // }
    };


  const toggleGroup = (groupId: string) => {
    setGroupOpenMap((prev) => ({
      ...prev,
      [groupId]: !prev[groupId],
    }));
  };

  const handleVehicleCheck = (vehicleId: number, checked: boolean) => {
    const newSet = new Set(checkedVehicleIds);
    checked ? newSet.add(vehicleId) : newSet.delete(vehicleId);
    setCheckedVehicleIds(newSet);
    dispatch(setVisibleVehicleIds(Array.from(newSet)));
  };

  const handleGroupCheck = (group: LiveDataDto[], checked: boolean) => {
    const newSet = new Set(checkedVehicleIds);
    group.forEach((v) =>
      checked ? newSet.add(v.device_id) : newSet.delete(v.device_id),
    );
    setCheckedVehicleIds(newSet);
    dispatch(setVisibleVehicleIds(Array.from(newSet)));
  };
  const handleVehicleSelect = (v: LiveDataDto) => {
    setActiveVehicleId(v.device_id);

    // 🔥 Always pick latest device object from store
    const latest = store
      .getState()
      .live.devices.find((d) => d.device_id === v.device_id);

    if (latest) {
      dispatch(setSelectedVehicle(latest.device_id));
    }
  };
  const truncate = (text: string, len = 18) =>
    text.length > len ? text.slice(0, len) + ".." : text;
  const getTimeAgo = (val: any) => {
    if (!val) return "";

    const date = new Date(val);
    if (isNaN(date.getTime())) return "";

    const diffMs = Date.now() - date.getTime();

    const seconds = Math.floor(diffMs / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (seconds < 60) return `${seconds} sec ago`;
    if (minutes < 60) return `${minutes} min ago`;
    if (hours < 24) return `${hours} hr ago`;
    return `${days} day ago`;
  };
  const formatDeviceTime = (val: any) => {
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

    const formatted = new Intl.DateTimeFormat("en-IN", options)
      .format(date)
      .replace(",", "");

    return formatted.replace(/\//g, "-");
  };

  const formatGroupName = (name: string) => {
    if (name.length <= 20) return name;
    return name.slice(0, 17) + "...";
  };

  return (
    <div className={`sidebar-wrapper ${sidebarOpen ? "open" : "closed"}`}>
      <div className="sidebar">
        <div className="sidebar-header">
          <div className="tooltip-wrap" style={{ display: "inline-block" }}>
            <img src={logoSrc} alt="TrackingPath" className="sidebar-logo" />
            <span className="tooltip-text">{Servername || "No Server"}</span>
          </div>
        </div>

        {/* Tabs */}
        <ul className="sidebar-main-tabs">
          {["objects", "history", "events", "geofence", "route", "poi"].map(
            (tab) => {
              // Hide Route by default
              if (tab === "route" && activeTab !== "route") return null;
              if (tab === "poi" && activeTab !== "poi") return null;
              // Hide Geofence when Route is active
              if (tab === "geofence" && activeTab === "route") return null;
              if (tab === "geofence" && activeTab === "poi") return null;

              return (
                <li
                  key={tab}
                  className={activeTab === tab ? "active" : ""}
                  onClick={() => setActiveTab(tab as TabType)}
                >
                  {tab.toUpperCase()}
                </li>
              );
            },
          )}
        </ul>

        {activeTab === "objects" && (
          <>
            {/* Filters */}
            <ul className="sidebar-sub-tabs">
              {["All", "Offline", "Moving", "Idle", "Stopped"].map((tab) => (
                <li
                  key={tab}
                  className={activeFilter === tab ? "active" : ""}
                  onClick={() => setActiveFilter(tab as FilterType)}
                >
                  {tab}
                </li>
              ))}
            </ul>

            {/* Search */}
            <div
              className="sidebar-search"
              style={{ display: "flex", alignItems: "center", gap: "5px" }}
            >
              <input
                type="text"
                placeholder="Search vehicles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="sidebar-search-input"
              />

              {/* Buttons next to search */}
              <button
                className="sidebar-search-btn"
                title="Show List"
                onClick={() => setShowObjectsModal(true)}
              >
                <i className="fas fa-list"></i>
              </button>

              <button
                className="sidebar-search-btn"
                title="Add Vehicle"
                onClick={() => setDevice(true)}
              >
                <i className="fas fa-plus"></i>
              </button>
            </div>

            <div className="vehicle-header">
              <span>Objects ({filteredVehicleCount})</span>
              <button
                className="vehicle-toggle-btn"
                onClick={() => setShowVehicles(!showVehicles)}
              >
                {showVehicles ? "[−]" : "[+]"}
              </button>
            </div>

            {showVehicles && (
              <div className="vehicle-list">
                {loading && (
                  <div className="sidebar-loader">
                    <div className="spinner"></div>
                  </div>
                )}
                {!loading &&
                  Object.entries(groupedData).map(([groupId, group]) => {
                    const isOpen = groupOpenMap[groupId] ?? true;
                    const filteredVehicles = group.vehicles
                      .filter(applyFilter)
                      .filter(searchFilter);

                    if (filteredVehicles.length === 0) return null;

                    const groupChecked = filteredVehicles.every((v) =>
                      checkedVehicleIds.has(v.device_id),
                    );

                    return (
                      <div key={groupId}>
                        <div className="group-header">

                          <div className="group-left">
                            <input
                              type="checkbox"
                              checked={groupChecked}
                              onChange={(e) =>
                                handleGroupCheck(
                                  filteredVehicles,
                                  e.target.checked,
                                )
                              }
                            />

                            <span className="group-name">
                              {formatGroupName(group.groupName)} ({filteredVehicles.length})
                            </span>


                          </div>
                          <span
                            className="group-arrow"
                            onClick={() => toggleGroup(groupId)}
                          >
                            {isOpen ? "[−]" : "[+]"}
                          </span>
                          {/* 🔹 Group menu (three dots) */}
                          <span
                            className="group-menu"
                            onClick={(e) => {
                              e.stopPropagation();
                              // Open DeviceGroupModal
                              setEditingGroupName(
                                group.groupName === "Ungrouped"
                                  ? undefined
                                  : group.groupName,
                              );
                              setEditingGroupId(group.group_id); // 👈 IMPORTANT

                              setDeviceGroupModalOpen(true);
                            }}
                          >
                            <i className="fas fa-ellipsis-v"></i>
                          </span>
                        </div>

                        {isOpen &&
                          filteredVehicles.map((v) => {
                            const isDataAvailable = hasValidDeviceTime(v);

const isInactive = !isDataAvailable || getStatusClass(v) === "offline";
                            return (
                              <div
                                key={v.device_id}
                                className={`vehicle-item ${activeVehicleId === v.device_id ? "active" : ""
                                  }`}
                              >
                                {/* Checkbox */}
                                <input
                                  type="checkbox"
                                  className="vehicle-check"
                                  checked={checkedVehicleIds.has(v.device_id)}
                                  onChange={(e) =>
                                    handleVehicleCheck(
                                      v.device_id,
                                      e.target.checked,
                                    )
                                  }
                                />

                                {/* Vehicle Icon */}
                                <span
                                  className="vehicle-icon"
                                  style={{
                                    transform:
                                      v.motion && v.speed > 0
                                        ? "rotate(15deg)"
                                        : "rotate(0deg)",
                                  }}
                                >
                                  <img
                                    src={
                                      new URL(
                                        `../../assets/images/device_icon/objectIcon/${v.objectIcon || "car4.png"}`,
                                        import.meta.url,
                                      ).href
                                    }
                                    alt="vehicle"
                                    className="vehicle-img-icon"
                                    onError={(e) => {
                                      (e.currentTarget as HTMLImageElement).src =
                                        new URL(
                                          `../../assets/images/device_icon/objectIcon/car4.png`,
                                          import.meta.url,
                                        ).href;
                                    }}
                                  />
                                </span>

                                {/* Info */}
                                <div
                                  className="vehicle-info"
                                  onClick={() => handleVehicleSelect(v)}
                                  style={{ cursor: "pointer" }}
                                >
                                  <div className="vehicle-title">
                                    <div className="vehicle-name tooltip-wrap">
                                      <span className="vehicle-name-text">
                                        {truncate(v.device_name)}
                                      </span>

                                      <span className="tooltip-text">
                                        <div>{v.device_name}</div>
                                        <div
                                          style={{
                                            fontSize: "11px",
                                            opacity: 0.8,
                                          }}
                                        >
                                          {isDataAvailable
                                            ? `Last seen ${getTimeAgo(v.devicetime)}`
                                            : "Waiting for data"}
                                        </div>
                                      </span>
                                    </div>
                                    <span className="speed tooltip-wrap">
                                      ({v.speed} kph)
                                      <span className="tooltip-text">Speed</span>
                                    </span>
                                  </div>

                                  <div className="vehicle-time">
                                    {v.devicetime
                                      ? formatDeviceTime(v.devicetime)
                                      : "Waiting for data"}
                                  </div>

                                  {/* STATUS ICON ROW */}
                                  <div className="vehicle-status">
                                    {/* STATUS DOT */}
                                    <span
                                      className={`status-dot ${getStatusClass(v)} tooltip-wrap ${!isDataAvailable ? "disabled-status" : ""
                                        }`}
                                    >
                                     <span className="tooltip-text">
  {v.status === "online" && isDeviceRecent(v)
    ? "Online"
    : "Offline"}
</span>
                                    </span>

                                    {/* IGNITION */}
                                    {(() => {
                                      const attrs = getAttributes(v);
                                      const ignitionOn =
                                        attrs.ignition === true;
                                      return (
                                        <span
                                          className={`status-icon ignition tooltip-wrap ${isInactive? "disabled-status" : ""
                                            } ${v.status !== "online" ? "ignition-disabled" : ""} ${ignitionOn ? "ignition-on" : "ignition-off"
                                            }`}
                                        >
                                          <i className="fas fa-key"></i>
                                          <span className="tooltip-text">
                                            Ignition: {ignitionOn ? "ON" : "OFF"}
                                          </span>
                                        </span>
                                      );
                                    })()}

                                    {/* ENGINE */}
                                    {(() => {
                                      const engine = getEngineIconAndTitle(v);

                                      return (
                                        <span
                                          className={`status-icon engine tooltip-wrap ${isInactive ? "disabled-status" : ""
                                            } ${v.status !== "online" ? "engine-disabled" : ""}`}
                                        >
                                          <img
                                            src={engine.icon}
                                            alt="Engine"
                                            className="engine-img"
                                          />
                                          <span className="tooltip-text">
                                            {engine.title}
                                          </span>
                                        </span>
                                      );
                                    })()}

                                    {/* ODOMETER */}
                                    {(() => {
                                      const attrs = getAttributes(v);
                                      const totalOdo = attrs?.total_odometer;

                                      return (
                                        <span
                                          className={`status-icon odometer tooltip-wrap ${isInactive? "disabled-status" : ""
                                            }`}
                                        >
                                          <i className="fas fa-tachometer-alt"></i>

                                          <span className="tooltip-text">
                                            {isDataAvailable && totalOdo !== undefined
                                              ? `Total Odometer: ${totalOdo} km`
                                              : "Total Odometer: 0 km"}
                                            <br />
                                          </span>
                                        </span>
                                      );
                                    })()}

                                    {/* GPS */}
                                    {(() => {
                                      const attrs = getAttributes(v);

                                      return (
                                        <span
                                          className={`status-icon gps tooltip-wrap ${isInactive? "disabled-status" : ""
                                            }`}
                                        >
                                          <i className="fas fa-satellite-dish"></i>

                                          <span className="tooltip-text">
                                            {isDataAvailable
                                              ? `Gps: ${attrs.sat ?? 0}`
                                              : "Gps: --"}
                                          </span>
                                        </span>
                                      );
                                    })()}

                                    {/* GSM */}
                                    {(() => {
                                      const attrs = getAttributes(v);
                                      const rssi = Number(attrs?.rssi ?? 0);

                                      let percent = 0;

                                      if (rssi <= 5) {
                                        percent = rssi * 20;
                                      } else {
                                        percent = Math.min(Math.max(rssi, 0), 100);
                                      }

                                      let colorClass = "gsm-gray";

                                      if (percent > 0 && percent <= 40) {
                                        colorClass = "gsm-red";
                                      } else if (percent > 40 && percent < 80) {
                                        colorClass = "gsm-orange";
                                      } else if (percent >= 80) {
                                        colorClass = "gsm-green";
                                      }
                                      const activeBars =
                                        percent >= 100
                                          ? 5
                                          : percent >= 80
                                            ? 4
                                            : percent >= 60
                                              ? 3
                                              : percent >= 40
                                                ? 2
                                                : percent > 0
                                                  ? 1
                                                  : 0;
                                      return (
                                        <span
                                          className={`status-icon gsm tooltip-wrap ${isInactive ? "disabled-status" : ""
                                            }`}
                                        >
                                          <div className={`gsm-bars ${colorClass}`}>
                                            {[1, 2, 3, 4, 5].map((n) => {
                                              const isActive =
                                                isDataAvailable && n <= activeBars;

                                              return (
                                                <span
                                                  key={n}
                                                  className={`bar ${isActive ? "active" : ""}`}
                                                ></span>
                                              );
                                            })}
                                          </div>
                                          <span className="tooltip-text">
                                            {isDataAvailable ? `GSM Signal: ${percent}%` : "GSM Signal: --"}
                                          </span>
                                        </span>
                                      );
                                    }
                                    )()}
                                    {v.modalType?.toLowerCase().includes("dashcam") && (
                                      <span
                                        className={`status-icon dashcam tooltip-wrap ${isInactive ? "disabled-status" : ""
                                          }`}
                                      >
                                        <i className="fas fa-video-camera"></i>    <span className="tooltip-text">
                                          Cam Available
                                        </span>
                                      </span>
                                    )}
                                  </div>
                                </div>

                                {/* Right menu */}
                                <span
                                  className="vehicle-menu"
                                  onClick={(e) =>
                                    openMenu(e, v.device_id, String(v.modalType), String(v.status),v.devicetime)
                                  }
                                >
                                  ⋮
                                </span>
                              </div>
                            );
                          })}
                      </div>
                    );
                  })}
              </div>
            )}
          </>
        )}
        {/* ================= HISTORY TAB ================= */}
        {/* ================= HISTORY TAB ================= */}
        {activeTab === "history" && (
          <div className="history-panel-wrapper">
            <HistoryPanel
              setSelectedPoint={setSelectedPoint}
              sidebarOpen={sidebarOpen}
              setShowHistory={setShowHistory}
              onPlay={onPlay}
              onPause={onPause}
              onStop={onStop}
              playSpeed={playSpeed}
              setPlaySpeed={setPlaySpeed}
              historyplayIndex={historyplayIndex}
              historyPreset={historyPreset}
              presetDeviceId={historyDeviceId}
              activeTab={activeTab}
              closeMapPopupsRef={closeMapPopupsRef}
            />

            {/* ✅ SIDEBAR LOADER */}
            {historyLoading && (
              <div className="history-loader">
                <div className="spinner"></div>
              </div>
            )}
          </div>
        )}

        {/* ================= EVENTS TAB ================= */}
        {activeTab === "events" && (
          <EventTab setSelectedEvent={setSelectedEvent} />
        )}

        {/* ================= GEOFENCE TAB ================= */}
        {activeTab === "geofence" && (
          <GeofencePage
            geom={geom}
            radius={radius} // ✅ pass radius
            onShapeSelect={onShapeSelect}
            onEditStart={(g) => {
              if (g) {
                setIsEditing(true);
                setEditGeom(g.geom);
                setEditRadius(g.radius);
                setEditingGeofenceId(g.id);
              } else {
                setIsEditing(false);
                setEditGeom(null);
                setEditRadius(null);
                setEditingGeofenceId(null);
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

        {activeTab === "route" && (
          <RoutePage
            geom={routeGeom} // ✅ CORRECT
            onStartDraw={onStartRouteDraw}
            onStopDraw={onStopRouteDraw}
            onZoomRoute={(route) => {
              if (!zoomToGeofenceRef.current) return;

              const geom =
                typeof route.geom === "string"
                  ? JSON.parse(route.geom)
                  : route.geom;

              zoomToGeofenceRef.current({ geom });
            }}
          />
        )}

        {activeTab === "poi" && (
          <PoiPage
            onSelectPoi={setSelectedPoi}
            onStartInsert={() => setPoiInsertMode(true)}
            poiInsertMode={poiInsertMode}
            setPoiInsertMode={setPoiInsertMode}
            tempPoiLocation={tempPoiLocation}
          />
        )}
      </div>

      <button
        className="sidebar-toggle-btn"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        {sidebarOpen ? <FaAngleLeft /> : <FaAngleRight />}
      </button>
      <Device
        open={deviceModalOpen}
        deviceId={editingDeviceId}
        onClose={() => setDeviceModalOpen(false)}
      />
      {menuDeviceId !== null && (
        <VehicleContextMenu
          x={menuPos.x}
          y={menuPos.y}
          visible={menuVisible}
          deviceId={menuDeviceId}
          modalType={menumodalType}
          status={menuDeviceStatus}
           devicetime={menuDeviceTime}
          onClose={() => setMenuVisible(false)}
          onHistorySelect={handleHistoryFromMenu}
          onFollowClick={(deviceId) => {
            dispatch(fetchLiveFollowData(deviceId));
            setShowFollowModal(true);
          }}
          onSharePosition={openShareModal}
          onCommandClick={(deviceId) => {
            openCommandModal(deviceId);
            setMenuVisible(false);
          }}
          onEditDevice={(deviceId) => {
            openEditDevice(deviceId); // ✅ CALL THE FUNCTION
          }}
        />
      )}
      {showShareModal && (
        <SharePositionModal
          open={showShareModal}
          onClose={() => setShowShareModal(false)}
        />
      )}

      <DeviceGroupModal
        isOpen={deviceGroupModalOpen}
        onClose={() => setDeviceGroupModalOpen(false)}
        groupName={editingGroupName}
        groupId={editingGroupId} // 👈 NEW
      />

      <Device open={openDevice} onClose={() => setDevice(false)} />

      {showCommandModal && (
        <CommandChatModal
          isOpen={showCommandModal}
          onClose={() => setShowCommandModal(false)}
          deviceId={commandDeviceId} // 👈 pass selected vehicle
        />
      )}
      {/* Follow Modal */}

      <FollowModal
        open={showFollowModal}
        onClose={() => setShowFollowModal(false)}
      />
      <ObjectsTable
        open={showObjectsModal}
        onClose={() => setShowObjectsModal(false)}
      />
    </div>
  );
};

export default Sidebar;
