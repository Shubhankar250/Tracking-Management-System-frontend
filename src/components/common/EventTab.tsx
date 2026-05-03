import {
  useEffect,
  useRef,
  useState,
  type MouseEvent as ReactMouseEvent,
} from "react";
import Select from "react-select";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import { fetchAllEvents } from "../../slices/eventNotificationSlice";
import type { NotificationDTO } from "../../api/eventNotificationService";
import "../../assets/css/events.css";
import "@fortawesome/fontawesome-free/css/all.min.css";
import { fetchDevices } from "../../slices/devicesSlice";
import CustomMultiValueContainer, {
  CustomOption,
} from "../common/CustomMultiValueContainer";
import {
  FaBus,
  FaCar,
  FaMotorcycle,
  FaTractor,
  FaTruck,
} from "react-icons/fa";

/* =========================
   ALERT OPTIONS
========================= */
const ALERT_OPTIONS = [
  { value: "OVERSPEED", label: "Overspeed" },
  { value: "LOWSPEED", label: "Low Speed" },
  { value: "Parking", label: "Parking" },
  { value: "Idling", label: "Idling" },
  { value: "IGNITION", label: "Ignition" },
  { value: "SOS", label: "SOS" },
  { value: "IN", label: "Geofence In" },
  { value: "OUT", label: "Geofence Out" },
  { value: "ALL", label: "Geofence In/Out" },
  { value: "DRIVER_CHANGE", label: "Driver Change" },
  { value: "DRIVER_CHANGE_AUTH", label: "Driver Auth" },
  { value: "FUEL_FILL_THEFT", label: "Fuel Fill/Theft" },
  { value: "POI_STOP_DURATION", label: "POI Stop" },
  { value: "POI_IDLE_DURATION", label: "POI Idle" },
  { value: "TASK_STATUS", label: "Task Status" },
  { value: "VIBRATION", label: "Vibration" },
  { value: "MOVEMENT", label: "Movement" },
  { value: "FALLDOWN", label: "Fall Down" },
  { value: "LOW_POWER", label: "Low Power" },
  { value: "LOW_BATTERY", label: "Low Battery" },
  { value: "POWER_CUT", label: "Power Cut" },
  { value: "POWER_RESTORED", label: "Power Restored" },
];

type VehicleIconType = "car" | "bike" | "tractor" | "bus" | "truck";

const vehicleIconMap = {
  car: FaCar,
  bike: FaMotorcycle,
  tractor: FaTractor,
  bus: FaBus,
  truck: FaTruck,
};

const EventTab: React.FC<{ setSelectedEvent: (e: any) => void }> = ({
  setSelectedEvent,
}) => {
  const dispatch = useAppDispatch();
  const { events, loading } = useAppSelector((state) => state.eventNotification);
  const { devices: deviceList } = useAppSelector((state) => state.devices);
  const liveDeviceList = useAppSelector((state) => state.live.devices);

  const [fromTime, setFromTime] = useState("");
  const [toTime, setToTime] = useState("");

  /* =========================
     STATE
  ========================= */
  const [selectedAlerts, setSelectedAlerts] = useState<any[]>([]);
  const [selectedDevices, setSelectedDevices] = useState<any[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<"object" | "event" | null>(
    null
  );

  const objectDropdownRef = useRef<HTMLDivElement | null>(null);
  const eventDropdownRef = useRef<HTMLDivElement | null>(null);

  /* =========================
     OPTIONS
  ========================= */
  const deviceOptions = deviceList.map((device) => ({
    value: device.id,
    label: device.name,
  }));

  const getEventVehicleIconType = (event: NotificationDTO): VehicleIconType => {
    const eventData: any = event;

    const eventDeviceId = String(
      eventData.deviceId ?? eventData.device_id ?? ""
    );
    const eventDeviceName = String(
      eventData.deviceName ?? eventData.device_name ?? ""
    );

    const matchedDevice: any =
      liveDeviceList.find(
        (device: any) =>
          String(device.device_id ?? device.id ?? "") === eventDeviceId
      ) ||
      deviceList.find(
        (device: any) =>
          String(device.device_id ?? device.id ?? "") === eventDeviceId
      ) ||
      liveDeviceList.find(
        (device: any) =>
          String(device.device_name ?? device.name ?? "") === eventDeviceName
      ) ||
      deviceList.find(
        (device: any) =>
          String(device.device_name ?? device.name ?? "") === eventDeviceName
      );

    const iconName = String(
      eventData?.deviceSetting?.object_icon ??
        eventData?.deviceSetting?.objectIcon ??
        eventData?.deviceSetting?.img_icon_name ??
        eventData?.deviceSetting?.imgIconName ??
        eventData?.objectIcon ??
        eventData?.object_icon ??
        eventData?.imgIconName ??
        eventData?.img_icon_name ??
        matchedDevice?.deviceSetting?.object_icon ??
        matchedDevice?.deviceSetting?.objectIcon ??
        matchedDevice?.deviceSetting?.img_icon_name ??
        matchedDevice?.deviceSetting?.imgIconName ??
        matchedDevice?.objectIcon ??
        matchedDevice?.object_icon ??
        matchedDevice?.imgIconName ??
        matchedDevice?.img_icon_name ??
        ""
    ).toLowerCase();

    if (iconName.startsWith("bike")) return "bike";
    if (iconName.startsWith("tractor")) return "tractor";
    if (iconName.startsWith("bus")) return "bus";
    if (iconName.startsWith("truck")) return "truck";
    if (iconName.startsWith("car")) return "car";

    return "car";
  };

  const alertOptionsWithAll = [
    { value: "all", label: "All" },
    ...ALERT_OPTIONS,
  ];
  const deviceOptionsWithAll = [
    { value: "all", label: "All" },
    ...deviceOptions,
  ];

  /* =========================
     UTIL
  ========================= */
  const formatDateTime = (val: string) => {
    if (!val) return undefined;

    let formatted = val.replace("T", " ");

    if (formatted.length === 16) {
      formatted += ":00";
    }

    return formatted;
  };

  const isDateRangeInvalid =
    Boolean(fromTime) &&
    Boolean(toTime) &&
    new Date(toTime).getTime() < new Date(fromTime).getTime();

  const handleReset = () => {
    setSelectedAlerts([]);
    setSelectedDevices([]);
    setOpenDropdown(null);

    const pad = (n: number) => String(n).padStart(2, "0");
    const now = new Date();

    const dateStr =
      now.getFullYear() +
      "-" +
      pad(now.getMonth() + 1) +
      "-" +
      pad(now.getDate());

    const stime = dateStr + " 00:00:00";
    const etime = dateStr + " 23:59:59";

    setFromTime(stime.replace(" ", "T"));
    setToTime(etime.replace(" ", "T"));

    dispatch(fetchAllEvents({ stime, etime }));
  };

  const closeAllDropdowns = () => {
    setOpenDropdown(null);
  };

  const handleDropdownToggle = (
    event: ReactMouseEvent<HTMLDivElement>,
    dropdown: "object" | "event"
  ) => {
    const target = event.target as HTMLElement;

    if (
      target.closest(".native-select__menu") ||
      target.closest(".native-select__option") ||
      target.closest(".native-select__multi-value__remove") ||
      target.closest(".native-select__clear-indicator")
    ) {
      return;
    }

    if (target.closest(".native-select__control")) {
      if (openDropdown === dropdown) {
        event.preventDefault();
        setOpenDropdown(null);
        return;
      }

      setOpenDropdown(dropdown);
    }
  };

  /* =========================
     API CALL
  ========================= */
  const handleLookup = () => {
    if (isDateRangeInvalid) {
      return;
    }

    const alertTypes = selectedAlerts.map((a) => a.value).join(",");
    const deviceIds = selectedDevices.map((d) => d.value);

    dispatch(
      fetchAllEvents({
        stime: formatDateTime(fromTime),
        etime: formatDateTime(toTime),
        alert_type: alertTypes,
        deviceIds: deviceIds.length ? deviceIds : undefined,
      })
    );
  };

  /* =========================
     INITIAL LOAD
  ========================= */
  useEffect(() => {
    dispatch(fetchDevices());
  }, [dispatch]);

  useEffect(() => {
    const pad = (n: number) => String(n).padStart(2, "0");
    const now = new Date();

    const dateStr =
      now.getFullYear() +
      "-" +
      pad(now.getMonth() + 1) +
      "-" +
      pad(now.getDate());

    const stime = dateStr + " 00:00:00";
    const etime = dateStr + " 23:59:59";

    setFromTime(stime.replace(" ", "T"));
    setToTime(etime.replace(" ", "T"));

    dispatch(
      fetchAllEvents({
        stime,
        etime,
      })
    );
  }, [dispatch]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      const clickedInsideObject = objectDropdownRef.current?.contains(target);
      const clickedInsideEvent = eventDropdownRef.current?.contains(target);

      if (!clickedInsideObject && !clickedInsideEvent) {
        closeAllDropdowns();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const formatToUserTime = (time?: string) => {
    if (!time) return "";

    const date = new Date(
      time.includes("T") ? time : time.replace(" ", "T") + "Z"
    );

    const pad = (n: number) => String(n).padStart(2, "0");

    return (
      date.getFullYear() +
      "-" +
      pad(date.getMonth() + 1) +
      "-" +
      pad(date.getDate()) +
      " " +
      pad(date.getHours()) +
      ":" +
      pad(date.getMinutes()) +
      ":" +
      pad(date.getSeconds())
    );
  };

  return (
    <div className="events-tab-container">
      <div className="events-header">
        <div className="events-count">
          Total Events: <b>{events.length}</b>
        </div>
        <button
          className="filter-toggle-btn"
          onClick={() => setShowFilters((prev) => !prev)}
        >
          <i className="fas fa-filter"></i>
        </button>
      </div>

      {showFilters && (
        <div className="events-filter-column">
          <div className="filter-item datetime">
            <label className="filter-label">From</label>
            <input
              type="datetime-local"
              step="1"
              value={fromTime}
              onChange={(e) => setFromTime(e.target.value)}
              className="datetime-input"
            />
          </div>

          <div className="filter-item datetime">
            <label className="filter-label">To</label>
            <input
              type="datetime-local"
              step="1"
              min={fromTime || undefined}
              value={toTime}
              onChange={(e) => setToTime(e.target.value)}
              className="datetime-input"
            />
            {isDateRangeInvalid && (
              <div style={{ color: "#d32f2f", fontSize: "12px", marginTop: "4px" }}>
                To date/time cannot be less than From date/time.
              </div>
            )}
          </div>

          <div
            className="filter-item"
            ref={objectDropdownRef}
            onMouseDown={(e) => handleDropdownToggle(e, "object")}
          >
            <label className="filter-label">Objects</label>
            <Select
              isMulti
              
              menuIsOpen={openDropdown === "object"}
              openMenuOnClick={false}
              closeMenuOnSelect={false}
              options={deviceOptionsWithAll}
              value={selectedDevices}
              placeholder="Select Object"
              classNamePrefix="native-select"
              hideSelectedOptions={false}
              onFocus={() => setOpenDropdown("object")}
              onKeyDown={(e) => {
                if (e.key === "Escape") {
                  setOpenDropdown(null);
                }
              }}
              onChange={(selected) => {
                const values = selected ? [...selected] : [];

                if (values.some((v) => v.value === "all")) {
                  setSelectedDevices(deviceOptions);
                } else {
                  setSelectedDevices(values.filter((v) => v.value !== "all"));
                }
              }}
               styles={{
   input: (base) => ({
    ...base,
    opacity: 0,        // 👈 hide completely
    width: 0,          // 👈 remove space
    margin: 0,
    padding: 0,
  }),
    control: (base) => ({
  ...base,
  cursor: "pointer",
}),
  }}
              components={{
                ValueContainer: CustomMultiValueContainer,
                Option: CustomOption,
                MultiValue: () => null,
                
              }}
            />
          </div>

          <div
            className="filter-item"
            ref={eventDropdownRef}
            onMouseDown={(e) => handleDropdownToggle(e, "event")}
          >
            <label className="filter-label">Events</label>
            <Select
              isMulti
              menuIsOpen={openDropdown === "event"}
              openMenuOnClick={false}
              closeMenuOnSelect={false}
              options={alertOptionsWithAll}
              value={selectedAlerts}
              placeholder="Select Events"
              classNamePrefix="native-select"
              hideSelectedOptions={false}
              onFocus={() => setOpenDropdown("event")}
              onKeyDown={(e) => {
                if (e.key === "Escape") {
                  setOpenDropdown(null);
                }
              }}
              onChange={(selected) => {
                const values = selected ? [...selected] : [];

                if (values.some((v) => v.value === "all")) {
                  setSelectedAlerts(ALERT_OPTIONS);
                  return;
                }

                setSelectedAlerts(values.filter((v) => v.value !== "all"));
              }}
               styles={{
      input: (base) => ({
    ...base,
    opacity: 0,        // 👈 hide completely
    width: 0,          // 👈 remove space
    margin: 0,
    padding: 0,
  }),
    control: (base) => ({
  ...base,
  cursor: "pointer",
}),
  }}
  
              components={{
                ValueContainer: CustomMultiValueContainer,
                Option: CustomOption,
                MultiValue: () => null,
              }}
            />
          </div>

          <div className="filter-item button">
            <button className="events-lookup-btn" onClick={handleLookup}>
              Show Events
            </button>
            <button className="events-reset-btn" onClick={handleReset}>
              Clear
            </button>
          </div>
        </div>
      )}

      <div className="events-card-wrapper">
        {loading && <div className="events-empty">Loading...</div>}

        {!loading && events.length === 0 && (
          <div className="events-empty">No events found</div>
        )}

        {!loading &&
          events.map((e: NotificationDTO, i: number) => {
            const vehicleIconType = getEventVehicleIconType(e);
            const VehicleIcon = vehicleIconMap[vehicleIconType];

            return (
              <div
                key={i}
                className="eventtab-card"
                onClick={() => setSelectedEvent(e)}
              >
                <div className="iconevents" title={e.alertType}>
                  {e.alertType?.charAt(0)?.toUpperCase() || "E"}
                </div>

                <div className="details">
                  <div className="rowevent">
                    <VehicleIcon className={`info-icon name ${vehicleIconType}`} />
                    {e.deviceName}
                  </div>

                  <div className="rowevent">
                    <i className="fas fa-clock"></i>
                    {formatToUserTime(e.alertTime)}
                  </div>
<div className="rowevent">
  <i className="fas fa-map-marker-alt"></i>
  {(e.address || "No address").replace(/[\s,]+$/, "")}
</div>
                  <div className="rowevent alert-row">
                    <span
                      className={`eventalert-badge ${e.alertType?.toLowerCase()}`}
                    >
                      {e.alertType}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
};

export default EventTab;
