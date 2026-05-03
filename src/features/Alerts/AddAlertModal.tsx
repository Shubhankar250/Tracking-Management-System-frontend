import { useEffect, useState, useRef } from "react";
import Modal from "../../components/common/Modal";
import "../../assets/css/alertsStyles.css";

import WeeklyScheduleGrid from "./AlertScheduleGrid";
import NotificationTab, { type NotificationState } from "./NotificationTab";
import CommandTab from "./CommandTab";
import UsersAlertTab from "./UsersAlertTab";

import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import { fetchGroupedDevices, fetchAllUser } from "../../slices/usersSlice";
import { fetchAllGeofencesGlobal } from "../../slices/geofenceSlice";
import {
  updateAlertThunk,
  createAlertThunk,
  fetchCommandNamesThunk,
} from "../../slices/alertSlice";
import { fetchAllDriverMap } from "../../slices/setupSlice";
import { fetchAllPoiMap } from "../../slices/poiSlice";
import { fetchAllRouteMap } from "../../slices/routesSlice";
import type {
  AlertNotificationDTO,
  AlertSettingDTO,
  SlotDTO,
} from "../../api/alertApi";
import { toast } from "react-toastify";
import { fetchAlertTypeForADASandDMS } from "../../slices/deviceModalSlice";
import type { DeviceGroupDataProjection } from "../../api/deviceModalService";

// ✅ ADD HERE (top of file, after imports)

const useResponsive = () => {
  const getScreenType = () => {
    const width = window.innerWidth;

    if (width <= 768) return "mobile";
    if (width <= 1024) return "tablet";
    return "desktop";
  };

  const [screenType, setScreenType] = useState(getScreenType());

  useEffect(() => {
    const handleResize = () => {
      setScreenType(getScreenType());
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return {
    screenType,
    isMobile: screenType === "mobile",
    isTablet: screenType === "tablet",
    isDesktop: screenType === "desktop",
  };
};

const days = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const times = Array.from(
  { length: 24 },
  (_, i) => `${i.toString().padStart(2, "0")}:00`,
);

/* GRID → BACKEND */

const gridToSlots = (grid: { day: number; slot: number }[]): SlotDTO[] => {
  const selectedSet = new Set(grid.map((g) => `${g.day}-${g.slot}`));

  const result: SlotDTO[] = [];

  for (let d = 0; d < 7; d++) {
    for (let s = 0; s < 24; s++) {
      const key = `${d}-${s}`;

      result.push({
        day: days[d],
        time: times[s],
        selected: selectedSet.has(key),
      });
    }
  }

  return result;
};

/* BACKEND → GRID */

const slotsToGrid = (slots: SlotDTO[]): { day: number; slot: number }[] => {
  return slots
    .filter((s) => s.selected)
    .map((s) => ({
      day: days.indexOf(s.day),
      slot: times.indexOf(s.time),
    }))
    .filter((s) => s.day >= 0 && s.slot >= 0);
};

/* ========================= */

interface AddAlertModalProps {
  open: boolean;
  onClose: () => void;
}

export default function AddAlertModal({ open, onClose }: AddAlertModalProps) {
  const dispatch = useAppDispatch();

  const { groupedDevices, usersMap } = useAppSelector((state) => state.users);
  const { allGeofences } = useAppSelector((state) => state.geofence);
  const selectedAlert = useAppSelector((state) => state.alerts.selected);

  const isEditMode = !!selectedAlert;
  const [activeTab, setActiveTab] = useState("Object");
  const [searchTerm, setSearchTerm] = useState("");
  //const [isInitialLoad, setIsInitialLoad] = useState(true);

  const [alertState, setAlertState] = useState<AlertSettingDTO>({
    alert_name: "",
    alertDetailsDTO: {},
    alertDeviceMappingDTO: {},
    alertGeofenceMappingDTO: {},
    alertRouteMappingDTO: {},
    alertNotificationDTO: {},
    alertScheduleDTO: { data: [] },
    alertUserDTO: {},
    alertDeviceCommandDTO: {},
  });

  const alertStateRef = useRef(alertState);

  useEffect(() => {
    alertStateRef.current = alertState;
  }, [alertState]);

  useEffect(() => {
    if (!open) return;

    setActiveTab("Object");
    setDisabledTabs(["Geofencing"]);
  }, [open]);

  /* ===== MAIN STATES ===== */

  const [name, setName] = useState("");

  const [isTabsOpen, setIsTabsOpen] = useState(false);

  const [showAlertTypeList, setShowAlertTypeList] = useState(false);
  const [showIgnitionList, setShowIgnitionList] = useState(false);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;

      if (!target.closest(".alert-type-mobile")) {
        setShowAlertTypeList(false);
      }

      if (!target.closest(".ignition-wrapper")) {
        setShowIgnitionList(false);
      }

      if (!target.closest(".alert-tabs-container")) {
        setIsTabsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const { screenType, isMobile } = useResponsive();

  useEffect(() => {
    setShowAlertTypeList(false);
    setShowIgnitionList(false);
    setIsTabsOpen(false);
  }, [screenType]);

  const [selectedDevices, setSelectedDevices] = useState<number[]>([]);
  const [selectedGeofences, setSelectedGeofences] = useState<number[]>([]);
  const [alertType, setAlertType] = useState("");

  const [disabledTabs, setDisabledTabs] = useState<string[]>(["Geofencing"]);

  const [adasEvents, setAdasEvents] = useState<string[]>([]);
  const [dmsEvents, setDmsEvents] = useState<string[]>([]);

  const [selectedAdasEvents, setSelectedAdasEvents] = useState<string[]>([]);
  const [selectedDmsEvents, setSelectedDmsEvents] = useState<string[]>([]);

  const [prefillEvents, setPrefillEvents] = useState<string[]>([]);

  const [hasAdas, setHasAdas] = useState(false);
  const [hasDms, setHasDms] = useState(false);

  const [schedule, setSchedule] = useState<any[]>([]);
  const [scheduleEnabled, setScheduleEnabled] = useState(true);

  const toggleTabsMenu = () => {
    setIsTabsOpen((prev) => !prev);
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;

      const container = target.closest(".alert-tabs-container");

      if (!container) {
        setIsTabsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const [, setIsSaveAttempted] = useState(false);

  const [geofenceInOut, setGeofenceInOut] = useState<"IN" | "OUT" | "ALL">(
    "IN",
  );
  const [typeFieldError, setTypeFieldError] = useState("");
  const [geofenceError, setGeofenceError] = useState("");
  const [routeError, setRouteError] = useState("");
  const [poiError, setPoiError] = useState("");
  const [driverError, setDriverError] = useState("");
  const [adasError, setAdasError] = useState("");
  const [dmsError, setDmsError] = useState("");
  const [scheduleError, setScheduleError] = useState("");

  const defaultNotificationState: NotificationState = {
    ignore: false,
    ignoreValue: "",

    sound: false,
    soundValue: "",

    popup: false,
    popupValue: "",

    appPush: false,

    email: false,
    emailValue: "",

    webhook: false,
    webhookValue: "",

    color: false,
    colorValue: "",
  };

  /* ===== NEW TAB STATES ===== */

  const [notification, setNotification] = useState<NotificationState>(
    defaultNotificationState,
  );
  const [usersError, setUsersError] = useState("");
  const [commandError, setCommandError] = useState("");

  // ✅ MUST be ABOVE validate()
  const [notificationErrors, setNotificationErrors] = useState({
    globalError: "",
    colorValue: "",
    ignoreValue: "",
    soundValue: "",
    popupValue: "",
    emailValue: "",
    webhookValue: "",
  });

  const validateFields = () => {
    let valid = true;
    let firstErrorTab: string | null = null;
    const missingFields: string[] = [];

    const setTabIfEmpty = (tab: string) => {
      if (!firstErrorTab) firstErrorTab = tab;
    };

    const addMissing = (field: string) => {
      if (!missingFields.includes(field)) {
        missingFields.push(field);
      }
    };

    // RESET ERRORS (keep yours)
    setNameError("");
    setAlertTypeError("");
    setDeviceError("");
    setTypeFieldError("");
    setGeofenceError("");
    setRouteError("");
    setPoiError("");
    setDriverError("");
    setAdasError("");
    setDmsError("");
    setScheduleError("");

    /* ================= OBJECT TAB ================= */

    if (!name?.trim()) {
      setNameError("Alert Name is required");
      addMissing("Alert Name");
      setTabIfEmpty("Object");
      valid = false;
    }

    if (!selectedDevices.length) {
      setDeviceError("Select at least one device");
      addMissing("Devices");
      setTabIfEmpty("Object");
      valid = false;
    }

    /* ================= TYPE TAB ================= */

    if (!alertType) {
      setAlertTypeError("Alert Type is required");
      addMissing("Alert Type");
      setTabIfEmpty("Alert Type");
      valid = false;
    }

    const details = alertState.alertDetailsDTO;

    switch (alertType) {
      case "OVERSPEED":
        if (!details?.overspeed || details.overspeed <= 0) {
          setTypeFieldError("Overspeed value is required");
          addMissing("Overspeed");
          setTabIfEmpty("Alert Type");
          valid = false;
        }
        break;

      case "LOWSPEED":
        if (!details?.lowspeed || details.lowspeed <= 0) {
          setTypeFieldError("Lowspeed value is required");
          addMissing("Lowspeed");
          setTabIfEmpty("Type");
          valid = false;
        }
        break;

      case "Parking":
        if (!details?.stopDuration || details.stopDuration <= 0) {
          setTypeFieldError("Stop Duration");
          addMissing("Stop Duration");
          setTabIfEmpty("Type");
          valid = false;
        }
        break;

      case "Idling":
        if (!details?.idleDuration || details.idleDuration <= 0) {
          setTypeFieldError("Idle Duration");
          addMissing("Idle Duration");
          setTabIfEmpty("Type");
          valid = false;
        }
        break;

      case "DRIVER_CHANGE":
        if (!selectedDrivers.length) {
          setDriverError("Select at least one driver");
          addMissing("Drivers");
          setTabIfEmpty("Type");
          valid = false;
        }
        break;

      case "POI_STOP_DURATION":
      case "POI_IDLE_DURATION":
        if (!selectedPOIs.length) {
          setPoiError("Select at least one POI");
          addMissing("POI");
          setTabIfEmpty("Type");
          valid = false;
        }
        break;

      case "ROUTE_IN":
      case "ROUTE_OUT":
        if (!selectedRoutes.length) {
          setRouteError("Select at least one route");
          addMissing("Routes");
          setTabIfEmpty("Type");
          valid = false;
        }
        break;

      case "IN":
      case "OUT":
      case "ALL":
        if (!selectedGeofences.length) {
          setGeofenceError("Select at least one geofence");
          addMissing("Geofence");
          setTabIfEmpty("Geofencing");
          valid = false;
        }
        break;

      case "ADAS":
        if (!selectedAdasEvents.length) {
          setAdasError("Select ADAS event");
          addMissing("ADAS Events");
          setTabIfEmpty("Type");
          valid = false;
        }
        break;

      case "DMS":
        if (!selectedDmsEvents.length) {
          setDmsError("Select DMS event");
          addMissing("DMS Events");
          setTabIfEmpty("Type");
          valid = false;
        }
        break;
    }

    /* ================= SCHEDULE ================= */

    if (scheduleEnabled && (!schedule || schedule.length === 0)) {
      setScheduleError("Select schedule");
      addMissing("Schedule");
      setTabIfEmpty("Schedule");
      valid = false;
    }

    if (!command || command.length === 0) {
      setCommandError("Select at least one command");
      addMissing("Command");
      setTabIfEmpty("Command");
      valid = false;
    }
    /* ================= USERS ================= */

    if (!users || users.length === 0) {
      setUsersError("Select at least one user");
      addMissing("Users");
      setTabIfEmpty("Users");
      valid = false;
    }

    if (firstErrorTab) {
      setActiveTab(firstErrorTab);
    }

    return { valid, missingFields };
  };

  const [command, setCommand] = useState<string>("");

  const [users, setUsers] = useState<number[]>([]);

  useEffect(() => {
    if (selectedDevices.length > 0) {
      setDeviceError("");
    }
  }, [selectedDevices]);

  useEffect(() => {
    if (selectedDevices.length === 0) {
      setHasAdas(false);
      setHasDms(false);
      return;
    }

    dispatch(fetchAlertTypeForADASandDMS(selectedDevices))
      .unwrap()
      .then((res: DeviceGroupDataProjection[]) => {
        let adas = false;
        let dms = false;

        res.forEach((device) => {
          if (device.adasAlertType) {
            adas = true;
          }

          if (device.dmsAlertType) {
            dms = true;
          }
        });

        setHasAdas(adas);
        setHasDms(dms);

        // 🔥 CLEAR EVENTS
        setAdasEvents([]);
        setDmsEvents([]);

        // 🔥 CLEAR CHECKBOX SELECTIONS
        setSelectedAdasEvents([]);
        setSelectedDmsEvents([]);

        if (!isEditMode) {
          setAlertType("");
        }
      })
      .catch((err) => console.error(err));
  }, [selectedDevices]);

  /* =========================
   ALERT TYPE RESET — CRITICAL
========================= */

  useEffect(() => {
    if (!alertType) return;

    const previousType = alertState.alertDetailsDTO?.alertType;

    // ✅ Editing → keep prefilled data
    if (isEditMode && previousType === alertType) {
      return;
    }
    const safeType = alertType ?? "";
    const dtoKey = safeType
      .toLowerCase()
      .replace(/_([a-z])/g, (_, c) => c.toUpperCase());

    const numericAlerts = new Set([
      "overspeed",
      "lowspeed",
      "stopDuration",
      "idleDuration",
      "poiStopDuration",
      "poiIdleDuration",
    ]);

    const freshDetails: any = {
      alertType,
    };
    if (dtoKey) {
      if (dtoKey === "ignition") {
        freshDetails[dtoKey] = ""; // ✅ EMPTY STRING
      } else {
        freshDetails[dtoKey] = numericAlerts.has(dtoKey) ? null : true;
      }
    }

    setAlertState((prev) => ({
      ...prev,
      alertDetailsDTO: freshDetails,
    }));

    // ✅ Only reset UI when creating new alert
    if (!isEditMode) {
      setSelectedDrivers([]);
      setSelectedPOIs([]);
      setSelectedRoutes([]);
      setSelectedGeofences([]);
      setSchedule([]);
      setNotification(defaultNotificationState);
      setCommand("");
    }
  }, [alertType, isEditMode]);

  // ===== ENABLE/DISABLE GEOFENCE TAB + ADAS/DMS EVENTS =====
  const handleAlertTypeChange = (value: string) => {
    const previousType = alertType;

    setAlertType(value);

    const geofenceTypes = ["IN", "OUT", "ALL"];

    /* ===== GEOFENCE TAB LOGIC ===== */

    if (geofenceTypes.includes(value)) {
      // enable geofence tab
      setDisabledTabs((prev) => prev.filter((tab) => tab !== "Geofencing"));

      // auto select mode
      setGeofenceInOut(value as "IN" | "OUT" | "ALL");

      // move to geofence tab
      setActiveTab("Geofencing");
    } else {
      // disable geofence tab
      setDisabledTabs((prev) =>
        prev.includes("Geofencing") ? prev : [...prev, "Geofencing"],
      );

      // optional reset
      setGeofenceInOut("IN");

      // if user was on geofence tab, move back
      if (activeTab === "Geofencing") {
        setActiveTab("Type");
      }
    }

    /* ===== ADAS / DMS SWITCH RESET ===== */

    if (previousType === "ADAS" && value === "DMS") {
      setSelectedAdasEvents([]);
      setAdasEvents([]);
    }

    if (previousType === "DMS" && value === "ADAS") {
      setSelectedDmsEvents([]);
      setDmsEvents([]);
    }

    /* ===== FETCH EVENTS ===== */

    if (value === "ADAS" || value === "DMS") {
      dispatch(fetchAlertTypeForADASandDMS(selectedDevices))
        .unwrap()
        .then((res) => {
          const adasList: string[] = [];
          const dmsList: string[] = [];

          res.forEach((device: any) => {
            if (device.adasAlertType) {
              adasList.push(...device.adasAlertType.split(","));
            }

            if (device.dmsAlertType) {
              dmsList.push(...device.dmsAlertType.split(","));
            }
          });

          setAdasEvents([...new Set(adasList)]);
          setDmsEvents([...new Set(dmsList)]);
        });
    }

    dispatch(fetchCommandNamesThunk(value));
  };

  const selectAllDevices = () => {
    if (!groupedDevices) return;
    const allIds = Object.values(groupedDevices)
      .flat()
      .map((d) => d.id);
    setSelectedDevices(allIds);
  };

  const deselectAllDevices = () => {
    setSelectedDevices([]);
  };
  const toggleGroup = (devices: { id: number }[], checked: boolean) => {
    const ids = devices.map((d) => d.id);
    setSelectedDevices((prev) =>
      checked
        ? Array.from(new Set([...prev, ...ids]))
        : prev.filter((id) => !ids.includes(id)),
    );
  };
  useEffect(() => {
    setAlertState((prev) => ({
      ...prev,
      alertGeofenceMappingDTO: {
        geofenceIds: selectedGeofences,
        geofenceInOut,
      },
    }));
  }, [selectedGeofences, geofenceInOut]);

  // Multi-select states
  const [selectedDrivers, setSelectedDrivers] = useState<string[]>([]);
  const [driverSearch, setDriverSearch] = useState("");
  const [selectedRoutes, setSelectedRoutes] = useState<string[]>([]);
  const [routeSearch, setRouteSearch] = useState("");
  const [selectedPOIs, setSelectedPOIs] = useState<string[]>([]);
  const [poiSearch, setPoiSearch] = useState("");
  const { driverMap } = useAppSelector((state) => state.setup);
  const { poiMap } = useAppSelector((state) => state.poi);
  const { routeMap } = useAppSelector((state) => state.routes);
  const [nameError, setNameError] = useState("");
  const [alertTypeError, setAlertTypeError] = useState("");
  const [deviceError, setDeviceError] = useState("");

  useEffect(() => {
    setAlertState((prev) => ({
      ...prev,

      // ---------- DETAILS DTO ----------
      alertDetailsDTO: {
        ...prev.alertDetailsDTO,
        driverChangeIds: selectedDrivers,
        poiIds: selectedPOIs,
      },

      // ---------- ROUTE DTO ----------
      alertRouteMappingDTO: {
        ...prev.alertRouteMappingDTO,
        routeIds: selectedRoutes.map(Number),

        // only attach when route alert is selected
        ...(alertType === "ROUTE_IN" || alertType === "ROUTE_OUT"
          ? { routeInOut: alertType }
          : {}),
      },
    }));
  }, [
    selectedDrivers,
    selectedPOIs,
    selectedRoutes,
    alertType, // ← IMPORTANT
  ]);

  /* =========================
     LOAD DATA
  ========================= */

  useEffect(() => {
    if (!open) return;

    dispatch(fetchGroupedDevices());
    dispatch(fetchAllUser());
    dispatch(fetchAllGeofencesGlobal());

    dispatch(fetchAllDriverMap());
    dispatch(fetchAllPoiMap());
    dispatch(fetchAllRouteMap());
  }, [open, dispatch]);

  useEffect(() => {
    if (!open) {
      setAdasEvents([]);
      setDmsEvents([]);
      setSelectedAdasEvents([]);
      setSelectedDmsEvents([]);
      setPrefillEvents([]);
    }
  }, [open]);
  useEffect(() => {
    if (!groupedDevices || selectedDevices.length === 0) {
      setAdasEvents([]);
      setDmsEvents([]);
      setHasAdas(false);
      setHasDms(false);
      return;
    }

    let adasList: string[] = [];
    let dmsList: string[] = [];

    Object.values(groupedDevices).forEach((group: any) => {
      group.forEach((device: any) => {
        if (selectedDevices.includes(device.id)) {
          if (device.adasAlertType) {
            adasList.push(...device.adasAlertType.split(","));
          }

          if (device.dmsAlertType) {
            dmsList.push(...device.dmsAlertType.split(","));
          }
        }
      });
    });

    setAdasEvents([...new Set(adasList)]);
    setDmsEvents([...new Set(dmsList)]);

    setHasAdas(adasList.length > 0);
    setHasDms(dmsList.length > 0);
  }, [selectedDevices, groupedDevices]);

  //master helper method
  type NestedDTOKeys =
    | "alertDetailsDTO"
    | "alertDeviceMappingDTO"
    | "alertGeofenceMappingDTO"
    | "alertRouteMappingDTO"
    | "alertNotificationDTO"
    | "alertScheduleDTO"
    | "alertUserDTO"
    | "alertDeviceCommandDTO";

  const updateDTO = (section: NestedDTOKeys, field: string, value: any) => {
    setAlertState((prev) => ({
      ...prev,
      [section]: {
        ...(prev[section] || {}),
        [field]: value,
      },
    }));
  };

  function mapDtoToNotificationState(
    dto?: AlertNotificationDTO | null,
  ): NotificationState {
    if (!dto) return defaultNotificationState;

    const hasValue = (v: any) =>
      v !== null && v !== undefined && String(v).trim() !== "";

    return {
      // ✅ COLOR
      color: hasValue(dto.notificationColor),
      colorValue: dto.notificationColor || "#000000",

      // ✅ IGNORE
      ignore:
        dto.ignoreNotification !== null && dto.ignoreNotification !== undefined,
      ignoreValue:
        dto.ignoreNotification !== null && dto.ignoreNotification !== undefined
          ? String(dto.ignoreNotification)
          : "",

      // ✅ SOUND (default "Hint" also counts as valid → checkbox ON)
      sound: hasValue(dto.soundNotification),
      soundValue: dto.soundNotification || "Hint",

      // ✅ POPUP (default "10s" also counts as valid → checkbox ON)
      popup: hasValue(dto.popupNotification),
      popupValue: dto.popupNotification || "10s",

      // ✅ APP PUSH (boolean safe)
      appPush: dto.appPushNotification ?? false,

      // ✅ EMAIL
      email: hasValue(dto.emailNotification),
      emailValue: dto.emailNotification || "",

      // ✅ WEBHOOK
      webhook: hasValue(dto.webhookNotification),
      webhookValue: dto.webhookNotification || "",
    };
  }

  useEffect(() => {
    if (!prefillEvents.length) return;

    if (alertType === "ADAS") {
      if (adasEvents.length === 0) return;

      const valid = prefillEvents.filter((e) => adasEvents.includes(e));

      setSelectedAdasEvents(valid);
    }

    if (alertType === "DMS") {
      if (dmsEvents.length === 0) return;

      const valid = prefillEvents.filter((e) => dmsEvents.includes(e));

      setSelectedDmsEvents(valid);
    }
  }, [adasEvents, dmsEvents, alertType, prefillEvents]);

  /* =========================
     PREFILL EDIT DATA
========================= */

  useEffect(() => {
    if (!open) return;

    // ===== CREATE MODE RESET =====
    if (!selectedAlert) {
      setName("");
      setAlertType("");
      setSelectedDevices([]);
      setSelectedGeofences([]);
      setSchedule([]);
      setScheduleEnabled(true);
      setNotification(defaultNotificationState);
      setCommand("");
      setUsers([]);

      setAdasEvents([]);
      setDmsEvents([]);
      setSelectedAdasEvents([]);
      setSelectedDmsEvents([]);
      setPrefillEvents([]);

      return;
    }

    // ===== SET MAIN ALERT STATE =====
    setAlertState({
      ...selectedAlert,
      alertDetailsDTO: {
        ...selectedAlert.alertDetailsDTO,
      },
    });

    setName(selectedAlert.alert_name || "");

    const alertDetails = selectedAlert.alertDetailsDTO;

    // ===== DETERMINE ALERT TYPE =====
    let type = "";

    const adasCategory = Array.isArray(alertDetails?.adasDmsCategory)
      ? alertDetails?.adasDmsCategory[0]
      : alertDetails?.adasDmsCategory;

    if (adasCategory === "ADAS" || adasCategory === "DMS") {
      type = adasCategory;
    } else {
      type = alertDetails?.alertType || "";
    }

    setAlertType(type);

    // ===== DEVICE PREFILL =====
    setSelectedDevices(selectedAlert.alertDeviceMappingDTO?.deviceIds || []);

    // ===== GEOFENCE PREFILL =====
    setSelectedGeofences(
      selectedAlert.alertGeofenceMappingDTO?.geofenceIds || [],
    );

    // ===== ROUTE PREFILL =====
    setSelectedRoutes(
      selectedAlert.alertRouteMappingDTO?.routeIds?.map(String) || [],
    );

    // ===== DRIVER PREFILL =====
    setSelectedDrivers(alertDetails?.driverChangeIds || []);

    // ===== POI PREFILL =====
    setSelectedPOIs(alertDetails?.poiIds || []);

    // ===== ADAS/DMS EVENT PREFILL =====
    const events = alertDetails?.alertType
      ? alertDetails.alertType.split(",").map((e) => e.trim())
      : [];

    setPrefillEvents(events);

    // ===== SCHEDULE PREFILL =====
    setSchedule(slotsToGrid(selectedAlert.alertScheduleDTO?.data || []));

    setScheduleEnabled(selectedAlert.alertScheduleDTO?.status ?? true);

    // ===== NOTIFICATION PREFILL =====
    setNotification(
      mapDtoToNotificationState(selectedAlert.alertNotificationDTO),
    );

    // ===== COMMAND PREFILL =====
    setCommand(selectedAlert.alertDeviceCommandDTO?.commandName || "");

    // ===== USER PREFILL =====
    setUsers(selectedAlert.alertUserDTO?.user_ids || []);
  }, [selectedAlert, open]);

  useEffect(() => {
    if (activeTab?.toLowerCase() !== "type") return;

    if (alertType !== "ADAS" && alertType !== "DMS") return;

    if (!selectedDevices || selectedDevices.length === 0) return;

    dispatch(fetchAlertTypeForADASandDMS(selectedDevices))
      .unwrap()
      .then((res: DeviceGroupDataProjection[]) => {
        const adasList: string[] = [];
        const dmsList: string[] = [];

        res.forEach((device) => {
          if (device.adasAlertType) {
            adasList.push(...device.adasAlertType.split(","));
          }

          if (device.dmsAlertType) {
            dmsList.push(...device.dmsAlertType.split(","));
          }
        });

        setAdasEvents([...new Set(adasList)]);
        setDmsEvents([...new Set(dmsList)]);
      })
      .catch((err) => console.error(err));
  }, [alertType, selectedDevices, activeTab]);

  const { commandNames } = useAppSelector((state) => state.alerts);

  /*useEffect(() => {
  const geofenceMap: Record<string, "IN" | "OUT" | "ALL"> = {
    IN: "IN",
    OUT: "OUT",
    ALL: "ALL",
  };
  const mode = geofenceMap[alertType];

  if (mode) {
    setGeofenceInOut(mode);
    setActiveTab("Geofencing");
  }
}, [alertType]);*/

  if (!open) return null;

  /* =========================
     HELPERS
  ========================= */

  const toggleDevice = (id: number) => {
    setSelectedDevices((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const toggleGeofence = (id: number) => {
    setSelectedGeofences((prev) => {
      const updated = prev.includes(id)
        ? prev.filter((x) => x !== id)
        : [...prev, id];

      // ✅ CLEAR ERROR WHEN AT LEAST ONE SELECTED
      if (updated.length > 0) {
        setGeofenceError("");
      }

      return updated;
    });
  };

  const formatEventLabel = (value: string) => {
    return value
      .toLowerCase()
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const ALERT_TYPES = [
    //{ value: "", label: "Select Alert Type" },
    { value: "OVERSPEED", label: "Over speed" },
    { value: "LOWSPEED", label: "Low speed" },
    { value: "Parking", label: "Parking" },
    { value: "Idling", label: "Idling" },
    { value: "IGNITION", label: "Ignition" },
    { value: "SOS", label: "SOS" },
    { value: "IN", label: "Geofence In" },
    { value: "OUT", label: "Geofence Out" },
    { value: "ALL", label: "Geofence In / Out" },
    { value: "ROUTE_IN", label: "Route In" },
    { value: "ROUTE_OUT", label: "Route Out" },
    { value: "DRIVER_CHANGE", label: "Driver Change" },
    { value: "DRIVER_CHANGE_AUTH", label: "Driver Authorized" },
    { value: "FUEL_FILL_THEFT", label: "Fuel Fill/Theft" },
    { value: "POI_STOP_DURATION", label: "POI Stop Duration" },
    { value: "POI_IDLE_DURATION", label: "POI Idle Duration" },
    { value: "TASK_STATUS", label: "Task Status" },
    { value: "VIBRATION", label: "Vibration" },
    { value: "MOVEMENT", label: "Movement" },
    { value: "FALLDOWN", label: "Fall Down" },
    { value: "LOWPOWER", label: "Low Power" },
    { value: "LOWBATTERY", label: "Low Battery" },
    { value: "POWERCUT", label: "Power Cut" },
    { value: "POWERRESTORED", label: "Power Restored" },
  ];

  const dynamicAlertTypes = [
    ...ALERT_TYPES,
    ...(hasAdas
      ? [{ value: "ADAS", label: "ADAS-Advanced Driver Assistance System" }]
      : []),
    ...(hasDms
      ? [{ value: "DMS", label: "DMS-Driver State Monitoring System" }]
      : []),
  ];

  const renderAlertTypeDetails = (type: string) => {
    switch (type) {
      case "ADAS":
        return (
          <div>
            {/* ✅ ERROR MESSAGE */}
            {adasError && (
              <div className="text-danger" style={{ fontSize: 12 }}>
                {adasError}
              </div>
            )}

            <div className="vehicles-grid">
              {adasEvents.map((event) => (
                <label className="vehicle-item" key={event}>
                  <input
                    type="checkbox"
                    checked={selectedAdasEvents.includes(event)}
                    onChange={() =>
                      setSelectedAdasEvents((prev) => {
                        const updated = prev.includes(event)
                          ? prev.filter((e) => e !== event)
                          : [...prev, event];

                        // ✅ CLEAR ERROR WHEN AT LEAST ONE SELECTED
                        if (updated.length > 0) {
                          setAdasError("");
                        }

                        return updated;
                      })
                    }
                  />
                  {formatEventLabel(event)}
                </label>
              ))}
            </div>
          </div>
        );

      case "DMS":
        return (
          <div>
            {/* ✅ ERROR MESSAGE */}
            {dmsError && (
              <div className="text-danger" style={{ fontSize: 12 }}>
                {dmsError}
              </div>
            )}
            <div className="vehicles-grid">
              {dmsEvents.map((event) => (
                <label className="vehicle-item" key={event}>
                  <input
                    type="checkbox"
                    checked={selectedDmsEvents.includes(event)}
                    onChange={() =>
                      setSelectedDmsEvents((prev) => {
                        const updated = prev.includes(event)
                          ? prev.filter((e) => e !== event)
                          : [...prev, event];

                        // ✅ CLEAR ERROR WHEN AT LEAST ONE SELECTED
                        if (updated.length > 0) {
                          setDmsError("");
                        }

                        return updated;
                      })
                    }
                  />
                  {formatEventLabel(event)}
                </label>
              ))}
            </div>
          </div>
        );

      case "OVERSPEED":
        return (
          <div style={{ marginBottom: 16 }}>
            <label className="alert-label">Overspeed(kph)</label>

            <input
              type="number"
              className="form-control" // ✅ Added
              value={alertState.alertDetailsDTO?.overspeed || ""}
              onChange={(e) => {
                const value = e.target.value;

                updateDTO(
                  "alertDetailsDTO",
                  "overspeed",
                  value === "" ? null : Number(value),
                );

                // ✅ CLEAR ERROR WHEN USER TYPES
                if (value && Number(value) > 0) {
                  setTypeFieldError("");
                }
              }}
            />
            {/* ✅ PUT ERROR HERE */}
            {typeFieldError && (
              <div className="text-danger" style={{ fontSize: 12 }}>
                {typeFieldError}
              </div>
            )}
          </div>
        );
      case "LOWSPEED":
        return (
          <div style={{ marginBottom: 16 }}>
            <label className="alert-label">Lowspeed(kph)</label>
            <input
              type="number"
              className="form-control"
              value={alertState.alertDetailsDTO?.lowspeed || ""}
              onChange={(e) => {
                const value = e.target.value;

                // update value
                updateDTO(
                  "alertDetailsDTO",
                  "lowspeed",
                  value === "" ? null : Number(value),
                );

                // ✅ CLEAR ERROR WHEN VALID
                if (value && Number(value) > 0) {
                  setTypeFieldError("");
                }
              }}
            />
            {/* ✅ PUT ERROR HERE */}
            {typeFieldError && (
              <div className="text-danger" style={{ fontSize: 12 }}>
                {typeFieldError}
              </div>
            )}
          </div>
        );
      case "Parking":
        return (
          <div style={{ marginBottom: 16 }}>
            <label className="alert-label">
              Stop duration longer than (minutes)
            </label>
            <input
              type="number"
              className="form-control"
              value={alertState.alertDetailsDTO?.stopDuration || ""}
              onChange={(e) => {
                const value = e.target.value;

                updateDTO(
                  "alertDetailsDTO",
                  "stopDuration",
                  value === "" ? "" : Number(value),
                );

                // 🔥 CLEAR ERROR WHEN USER TYPES
                if (value && Number(value) > 0) {
                  setTypeFieldError("");
                }
              }}
            />
            {/* ✅ PUT ERROR HERE */}
            {typeFieldError && (
              <div className="text-danger" style={{ fontSize: 12 }}>
                {typeFieldError}
              </div>
            )}
          </div>
        );

      case "Idling":
        return (
          <div style={{ marginBottom: 16 }}>
            <label className="alert-label">
              Idle duration longer than (minutes)
            </label>
            <input
              type="number"
              className="form-control"
              value={alertState.alertDetailsDTO?.idleDuration || ""}
              onChange={(e) => {
                const value = e.target.value;

                updateDTO(
                  "alertDetailsDTO",
                  "idleDuration",
                  value === "" ? null : Number(value),
                );

                // 🔥 CLEAR ERROR WHEN USER TYPES
                if (value && Number(value) > 0) {
                  setTypeFieldError("");
                }
              }}
            />
            {/* ✅ PUT ERROR HERE */}
            {typeFieldError && (
              <div className="text-danger" style={{ fontSize: 12 }}>
                {typeFieldError}
              </div>
            )}
          </div>
        );

      case "IGNITION":
        return (
          <div
            className="ignition-wrapper"
            style={{ marginBottom: 16, position: "relative" }}
          >
            <label className="alert-label">Ignition</label>

            {isMobile ? (
              <>
                {/* Custom Select Box */}
                <div
                  className="ignition-box"
                  onClick={() => setShowIgnitionList(true)}
                >
                  {alertState.alertDetailsDTO?.ignition || "Select"}
                </div>

                {/* Dropdown */}
                {showIgnitionList && (
                  <div className="ignition-dropdown">
                    {["ON", "OFF", "ALL"].map((val) => (
                      <div
                        key={val}
                        className={`custom-option ${alertState.alertDetailsDTO?.ignition === val ? "active" : ""}`}
                        onClick={() => {
                          updateDTO("alertDetailsDTO", "ignition", val);
                          setShowIgnitionList(false);
                          setTypeFieldError("");
                        }}
                      >
                        {val}
                      </div>
                    ))}
                  </div>
                )}
              </>
            ) : (
              /* DESKTOP (UNCHANGED) */
              <select
                className={`form-control ${typeFieldError ? "is-invalid" : ""}`}
                value={alertState.alertDetailsDTO?.ignition ?? ""}
                onChange={(e) => {
                  const value = e.target.value;
                  updateDTO("alertDetailsDTO", "ignition", value);
                  if (value) setTypeFieldError("");
                }}
              >
                <option value="">Select</option>
                <option value="ON">On</option>
                <option value="OFF">Off</option>
                <option value="ALL">All</option>
              </select>
            )}

            {typeFieldError && (
              <div className="text-danger" style={{ fontSize: 12 }}>
                {typeFieldError}
              </div>
            )}
          </div>
        );

      case "DRIVER_CHANGE": {
        const drivers = Object.entries(driverMap ?? {});

        const filteredDrivers = drivers.filter(
          ([_, name]) =>
            typeof name === "string" &&
            name.toLowerCase().includes((driverSearch ?? "").toLowerCase()),
        );

        const toggleDriver = (id: string) => {
          setSelectedDrivers((prev) => {
            const updated = prev.includes(id)
              ? prev.filter((x) => x !== id)
              : [...prev, id];

            // ✅ Clear error when at least 1 driver is selected
            if (updated.length > 0) {
              setDriverError("");
            }

            return updated;
          });
        };

        return (
          <div style={{ marginBottom: 16 }}>
            {/* Label */}
            <label className="alert-label">
              Driver Change <span className="alert-required">*</span>
            </label>

            {/* Controls */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                marginBottom: 8,
                flexWrap: "wrap",
              }}
            >
              <div className="alert-toolbar">
                <div className="right">
                  <button
                    type="button"
                    className="alert-btn primary"
                    onClick={() => {
                      setSelectedDrivers(drivers.map(([id]) => id));
                      setDriverError(""); // ✅ Clear error
                    }}
                  >
                    Select All
                  </button>

                  <button
                    type="button"
                    className="alert-btn secondary"
                    onClick={() => setSelectedDrivers([])}
                  >
                    Deselect All
                  </button>
                </div>
              </div>

              {/* Search */}
              <div style={{ flex: 1, minWidth: 200 }}>
                <input
                  type="text"
                  placeholder="🔍 Search drivers..."
                  value={driverSearch}
                  onChange={(e) => setDriverSearch(e.target.value)}
                  className="form-control-search"
                />
              </div>
            </div>

            {/* Driver list */}
            <div
              style={{
                maxHeight: 180,
                overflowY: "auto",
              }}
            >
              {/* Error message */}
              {driverError && (
                <div
                  className="text-danger"
                  style={{ fontSize: 12, marginTop: 6 }}
                >
                  {driverError}
                </div>
              )}

              {/* No data */}
              {filteredDrivers.length === 0 && (
                <div style={{ color: "#888", padding: 6 }}>
                  No drivers found
                </div>
              )}

              {/* Driver checkboxes */}
              <div className="vehicles-grid">
                {filteredDrivers.map(([id, name]) => (
                  <label key={id} className="vehicle-item">
                    <input
                      type="checkbox"
                      checked={selectedDrivers.includes(id)}
                      onChange={() => toggleDriver(id)}
                      style={{ marginRight: 6 }}
                    />
                    {name}
                  </label>
                ))}
              </div>
            </div>
          </div>
        );
      }

      case "DRIVER_CHANGE_AUTH":
        return (
          <div>
            <label className="alert-label">Driver Authorized</label>

            <div>
              <label style={{ marginRight: 12 }} className="true-false-label">
                <input
                  type="radio"
                  name="driverAuth"
                  checked={
                    alertState.alertDetailsDTO?.driverChangeAuth === true
                  }
                  onChange={() =>
                    updateDTO("alertDetailsDTO", "driverChangeAuth", true)
                  }
                />{" "}
                True
              </label>

              <label className="true-false-label">
                <input
                  type="radio"
                  name="driverAuth"
                  checked={
                    alertState.alertDetailsDTO?.driverChangeAuth === false
                  }
                  onChange={() =>
                    updateDTO("alertDetailsDTO", "driverChangeAuth", false)
                  }
                />{" "}
                False
              </label>
            </div>
          </div>
        );

      case "POI_STOP_DURATION":
      case "POI_IDLE_DURATION": {
        const durationField =
          type === "POI_STOP_DURATION" ? "poiStopDuration" : "poiIdleDuration";

        const rawValue = alertState.alertDetailsDTO?.[durationField];
        const durationValue = typeof rawValue === "number" ? rawValue : "";

        const pois = Object.entries(poiMap ?? {});

        const filteredPOIs = pois.filter(([_, name]) =>
          (name ?? "").toLowerCase().includes((poiSearch ?? "").toLowerCase()),
        );

        const togglePOI = (id: string) => {
          setSelectedPOIs((prev) => {
            const updated = prev.includes(id)
              ? prev.filter((x) => x !== id)
              : [...prev, id];

            // ✅ Clear error when at least one selected
            if (updated.length > 0) {
              setPoiError("");
            }

            return updated;
          });
        };

        return (
          <div style={{ marginBottom: 16 }}>
            {/* Label */}
            <label className="alert-label">
              {type === "POI_STOP_DURATION"
                ? "POI Stop Duration"
                : "POI Idle Duration"}
            </label>

            {/* Duration Input */}
            <input
              type="number"
              value={durationValue}
              placeholder="Duration"
              className="form-control"
              onChange={(e) => {
                const v = e.target.value;

                updateDTO(
                  "alertDetailsDTO",
                  durationField,
                  v === "" ? null : Number(v),
                );

                if (v !== "") {
                  setTypeFieldError("");
                }
              }}
            />

            {/* Error */}
            {typeFieldError && (
              <div
                className="text-danger"
                style={{ fontSize: 12, marginBottom: 8 }}
              >
                {typeFieldError}
              </div>
            )}

            {/* Controls (MOBILE FRIENDLY, DESKTOP SAFE) */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                marginBottom: 8,
                marginTop: 12,
                flexWrap: "wrap", // ✅ enables mobile wrapping
                gap: 8, // ✅ spacing between items (like POI)
              }}
            >
              <div className="alert-toolbar">
                <div className="right">
                  <button
                    type="button"
                    className="alert-btn primary"
                    onClick={() => {
                      setSelectedPOIs(pois.map(([id]) => id));
                      setPoiError(""); // ✅ clear error
                    }}
                  >
                    Select All
                  </button>

                  <button
                    type="button"
                    className="alert-btn secondary"
                    onClick={() => setSelectedPOIs([])}
                  >
                    Deselect All
                  </button>
                </div>
              </div>

              {/* Search */}
              <div style={{ flex: 1, minWidth: 200 }}>
                <input
                  type="text"
                  placeholder="🔍 Search POI Name..."
                  value={poiSearch}
                  onChange={(e) => setPoiSearch(e.target.value)}
                  className="form-control-search"
                />
              </div>
            </div>

            {/* POI List */}
            <div
              style={{
                maxHeight: 300,
                overflowY: "auto",
              }}
            >
              {/* Error */}
              {poiError && (
                <div
                  className="text-danger"
                  style={{ fontSize: 12, marginTop: 6 }}
                >
                  {poiError}
                </div>
              )}

              {/* Empty */}
              {filteredPOIs.length === 0 && (
                <div style={{ color: "#888", padding: 6 }}>No POIs found</div>
              )}

              {/* List */}
              <div className="vehicles-grid">
                {filteredPOIs.map(([id, name]) => (
                  <label key={id} className="vehicle-item">
                    <input
                      type="checkbox"
                      checked={selectedPOIs.includes(id)}
                      onChange={() => togglePOI(id)}
                      style={{ marginRight: 6 }}
                    />
                    {name}
                  </label>
                ))}
              </div>
            </div>
          </div>
        );
      }

      case "ROUTE_IN":
      case "ROUTE_OUT":
        return (
          <div style={{ marginBottom: 16 }}>
            {/* Top controls row */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                marginBottom: 8,
                marginTop: 12,
                flexWrap: "wrap", // ✅ enables mobile wrapping
                gap: 8, // ✅ spacing between items (like POI)
              }}
            >
              {/* Buttons */}
              <div className="alert-toolbar">
                <div className="right">
                  <button
                    type="button"
                    className="alert-btn primary"
                    onClick={() => {
                      setSelectedRoutes(Object.keys(routeMap || {}));
                      setRouteError("");
                    }}
                  >
                    Select All
                  </button>

                  <button
                    type="button"
                    className="alert-btn secondary"
                    onClick={() => {
                      setSelectedRoutes([]);
                    }}
                  >
                    Deselect All
                  </button>
                </div>
              </div>

              {/* Search */}
              <div style={{ flex: 1, minWidth: 200 }}>
                <input
                  type="text"
                  placeholder="🔍 Search routes..."
                  value={routeSearch}
                  onChange={(e) => setRouteSearch(e.target.value)}
                  className="form-control-search"
                />
              </div>
            </div>
            {/* Route list */}
            <div style={{ maxHeight: 300, overflowY: "auto" }}>
              {/* ✅ Error message */}
              {routeError && (
                <div
                  className="text-danger"
                  style={{ fontSize: 12, marginBottom: 8 }}
                >
                  {routeError}
                </div>
              )}

              <div className="vehicles-grid">
                {Object.entries(routeMap || {})
                  .filter(([_, name]) =>
                    (name ?? "")
                      .toLowerCase()
                      .includes((routeSearch ?? "").toLowerCase()),
                  )
                  .map(([id, name]) => (
                    <label className="vehicle-item" key={id}>
                      <input
                        type="checkbox"
                        checked={selectedRoutes.includes(id)}
                        onChange={() => {
                          setSelectedRoutes((prev) => {
                            const updated = prev.includes(id)
                              ? prev.filter((x) => x !== id)
                              : [...prev, id];

                            // ✅ Clear error when at least one selected
                            if (updated.length > 0) {
                              setRouteError("");
                            }

                            return updated;
                          });
                        }}
                        style={{ marginRight: 8 }}
                      />
                      {name}
                    </label>
                  ))}
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  //console.log(buildNotificationDTO(notification));

  /*const sanitizeNotificationDTO = (
  dto: typeof notificationDTO
): AlertNotificationDTO | undefined => {
  if (!dto) return undefined;

  return {
    ignoreNotification: dto.ignoreNotification ?? undefined,
    soundNotification: dto.soundNotification ?? undefined,
    popupNotification: dto.popupNotification ?? undefined,
    appPushNotification: dto.appPushNotification ?? undefined,
    emailNotification: dto.emailNotification ?? undefined,
    webhookNotification: dto.webhookNotification ?? undefined,
    notificationColor: dto.notificationColor ?? undefined,
  };
};*/

  const sanitizeAlertDetails = (dto: any) => {
    const numericFields = [
      "overspeed",
      "lowspeed",
      "stopDuration",
      "idleDuration",
      "poiStopDuration",
      "poiIdleDuration",
    ];

    const clean = { ...dto };

    numericFields.forEach((key) => {
      const v = clean[key];

      if (typeof v === "boolean") {
        clean[key] = null;
      }

      if (typeof v === "string" && v.trim() === "") {
        clean[key] = null;
      }

      if (typeof v === "string") {
        const num = Number(v);
        clean[key] = isNaN(num) ? null : num;
      }
    });

    return clean;
  };

  const buildNotificationDTO = (
    n?: NotificationState | null,
  ): AlertNotificationDTO | undefined => {
    if (!n) return undefined;

    const hasAnyEnabled =
      n.ignore ||
      n.sound ||
      n.popup ||
      n.appPush ||
      n.email ||
      n.webhook ||
      n.color;

    if (!hasAnyEnabled) return undefined;

    const cleanString = (enabled: boolean, value?: string) =>
      enabled && value?.trim() ? value : undefined;

    const cleanNumber = (enabled: boolean, value?: string) => {
      if (!enabled || !value?.trim()) return undefined;
      const num = parseInt(value, 10);
      return isNaN(num) ? undefined : num;
    };

    return {
      notificationColor: n.color
        ? n.colorValue?.trim() || "#000000"
        : undefined,
      ignoreNotification: cleanNumber(n.ignore, n.ignoreValue),
      soundNotification: cleanString(n.sound, n.soundValue),
      popupNotification: cleanString(n.popup, n.popupValue),
      appPushNotification: n.appPush ? true : undefined,
      emailNotification: cleanString(n.email, n.emailValue),
      webhookNotification: cleanString(n.webhook, n.webhookValue),
    };
  };

  /* =========================
     SAVE ALERT
  ========================= */

  const handleSave = async () => {
    setIsSaveAttempted(true);
    const { valid, missingFields } = validateFields();
    if (!valid) {
      toast.error(
        <div>
          <div>Please fill the following fields:</div>
          <ul style={{ margin: "8px 0 0 18px", padding: 0 }}>
            {missingFields.map((field) => (
              <li key={field}>{field}</li>
            ))}
          </ul>
        </div>,
      );
      return;
    }

    const payload = {
      id: selectedAlert?.id,
      alert_name: name,

      alertDeviceMappingDTO: {
        deviceIds: selectedDevices,
      },

      alertDetailsDTO: sanitizeAlertDetails({
        ...alertStateRef.current.alertDetailsDTO,
        alertType,

        ...(alertType === "ADAS" && {
          adasEvents: selectedAdasEvents,
        }),

        ...(alertType === "DMS" && {
          dmsEvents: selectedDmsEvents,
        }),
      }),

      alertGeofenceMappingDTO: alertState.alertGeofenceMappingDTO,

      alertRouteMappingDTO: alertState.alertRouteMappingDTO,

      alertScheduleDTO: {
        status: scheduleEnabled,
        data: gridToSlots(schedule), // this will send all slots- selected as true, not selected as false
        //data: gridToSlots(schedule).filter(s => s.selected), //sends only selected slots
      },

      alertNotificationDTO: buildNotificationDTO(notification),

      alertDeviceCommandDTO: {
        commandName: command,
      },

      alertUserDTO: {
        user_ids: users,
      },
    };

    try {
      if (isEditMode) {
        await dispatch(updateAlertThunk(payload)).unwrap();
        toast.success("Alert updated successfully!");
      } else {
        console.log("SCHEDULE STATE:" + schedule);
        console.log("SLOTS SENT:" + gridToSlots(schedule));
        console.log("----" + payload.alertScheduleDTO);
        await dispatch(createAlertThunk(payload)).unwrap();
        toast.success("Alert created successfully!");
      }

      // ✅ RESET VALIDATION MODE AFTER SUCCESS
      setIsSaveAttempted(false);

      // Reset tabs after save
      setActiveTab("Object");
      setDisabledTabs(["Geofencing"]);

      onClose();
    } catch (error) {
      toast.error("Something went wrong while saving the alert.");
      console.error(error);
    }
  };

  // =========================
  // TAB CONTROL (ADD HERE)
  // =========================

  const handleTabChange = (nextTab: string) => {
    if (disabledTabs.includes(nextTab)) return;

    setActiveTab(nextTab);
  };

  /* =========================
     UI
  ========================= */

  const tabs = [
    "Object",
    "Alert Type",
    "Geofencing",
    "Schedule",
    "Notification",
    "Command",
    "Users",
  ];

  const filteredGroupedDevices = Object.fromEntries(
    Object.entries(groupedDevices || {}).map(([groupName, devices]) => {
      const filteredDevices = devices.filter((d) =>
        (d.name ?? "").toLowerCase().includes((searchTerm ?? "").toLowerCase()),
      );
      return [groupName, filteredDevices];
    }),
  );

  return (
    <Modal
      isOpen={open}
      title={isEditMode ? "Update Alert" : "Add Alert"}
      onClose={onClose}
      size="fullscreen"
    >
      {/* Tabs */}

      <div className="tabs-wrapper alert-tabs-container">
        {/* ☰ Hamburger (ONLY mobile) */}
        <div className="alert-tabs-toggle" onClick={toggleTabsMenu}>
          ☰
        </div>

        {/* Tabs (existing logic untouched) */}
        {/* DESKTOP TABS */}
        <div className="alert-tabs-desktop">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => handleTabChange(tab)}
              className={`tab-btn ${
                activeTab === tab ? "active" : ""
              } ${disabledTabs.includes(tab) ? "alert-tab-disabled" : ""}`}
              disabled={disabledTabs.includes(tab)}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* MOBILE DROPDOWN */}
        <div className={`alert-tabs-responsive ${isTabsOpen ? "open" : ""}`}>
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => {
                handleTabChange(tab);
                setIsTabsOpen(false);
              }}
              className={`tab-btn ${
                activeTab === tab ? "active" : ""
              } ${disabledTabs.includes(tab) ? "alert-tab-disabled" : ""}`}
              disabled={disabledTabs.includes(tab)}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="tab-content">
        {/* ================= OBJECT ================= */}
        {activeTab === "Object" && (
          <div>
            {/* Alert Name */}
            <div style={{ marginBottom: 16 }}>
              <label className="alert-label">
                Alert Name <span className="alert-required">*</span>
              </label>

              <input
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (e.target.value.trim()) setNameError("");
                }}
                className={`form-control ${nameError ? "is-invalid" : ""}`}
              />

              {nameError && (
                <div className="text-danger" style={{ fontSize: 12 }}>
                  {nameError}
                </div>
              )}
            </div>

            {/* Devices Toolbar */}
            <div className="alert-toolbar">
              <div className="right">
                <button
                  type="button"
                  className="alert-btn primary"
                  onClick={selectAllDevices}
                >
                  Select All
                </button>

                <button
                  type="button"
                  className="alert-btn secondary"
                  onClick={deselectAllDevices}
                >
                  Deselect All
                </button>

                <input
                  type="text"
                  placeholder="Search vehicle..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="form-control-search"
                />
              </div>
            </div>

            {/* Groups */}
            <div className="vehicle-groups-container">
              {deviceError && (
                <div
                  className="text-danger"
                  style={{ fontSize: 12, marginTop: 6 }}
                >
                  {deviceError}
                </div>
              )}

              {groupedDevices &&
                Object.entries(filteredGroupedDevices)
                  .filter(([_, devices]) => devices.length > 0)
                  .map(([groupName, devices]) => {
                    const groupChecked =
                      devices.length > 0 &&
                      devices.every((d) => selectedDevices.includes(d.id));

                    return (
                      <div className="group-block mb-3" key={groupName}>
                        {/* Group Header */}
                        <div className="group-header">
                          <label className="group-label">
                            <input
                              type="checkbox"
                              checked={groupChecked}
                              onChange={(e) =>
                                toggleGroup(devices, e.target.checked)
                              }
                            />
                            <span>{groupName}</span>
                          </label>
                        </div>

                        {/* Vehicles */}
                        <div className="vehicles-grid">
                          {devices.map((vehicle) => (
                            <label className="vehicle-item" key={vehicle.id}>
                              <input
                                type="checkbox"
                                checked={selectedDevices.includes(vehicle.id)}
                                onChange={() => toggleDevice(vehicle.id)}
                              />
                              <span>{vehicle.name}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    );
                  })}
            </div>
          </div>
        )}

        {/* ================= TYPE ================= */}
        {activeTab === "Alert Type" && (
          <div style={{ marginBottom: 16 }}>
            <label className="alert-label">
              Alert Type <span className="alert-required">*</span>
            </label>

            <div className="alert-type-mobile">
              {isMobile ? (
                <>
                  {/* Custom Input (looks same as select) */}
                  <div
                    className="custom-select-box"
                    onClick={() => setShowAlertTypeList((prev) => !prev)}
                  >
                    {alertType
                      ? dynamicAlertTypes.find((t) => t.value === alertType)
                          ?.label
                      : "Select Alert Type"}
                  </div>

                  {/* Custom Dropdown List */}
                  {showAlertTypeList && (
                    <div className="custom-select-dropdown">
                      {dynamicAlertTypes.map((type) => (
                        <div
                          key={type.value}
                          className={`custom-option ${alertType === type.value ? "active" : ""}`}
                          onClick={() => {
                            handleAlertTypeChange(type.value);
                            setAlertTypeError("");
                            setShowAlertTypeList(false);
                          }}
                        >
                          {type.label}
                        </div>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                /* Desktop → ORIGINAL SELECT (UNCHANGED) */
                <select
                  className={`form-control ${
                    alertTypeError ? "is-invalid" : ""
                  }`}
                  value={alertType}
                  onChange={(e) => {
                    handleAlertTypeChange(e.target.value);
                    setAlertTypeError("");
                  }}
                >
                  <option value="">Select Alert Type</option>
                  {dynamicAlertTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {alertTypeError && (
              <div className="text-danger" style={{ fontSize: 12 }}>
                {alertTypeError}
              </div>
            )}

            <div style={{ marginTop: 16 }}>
              {renderAlertTypeDetails(alertType)}
            </div>
          </div>
        )}

        {/* ================= GEOFENCING ================= */}
        {activeTab === "Geofencing" && allGeofences && (
          <div>
            <div style={{ marginBottom: 12 }}>
              <label className="alert-label">Geofence In/Out</label>

              <select
                className="form-control"
                value={geofenceInOut}
                disabled={["IN", "OUT", "ALL"].includes(alertType)}
              >
                <option value="IN">IN</option>
                <option value="OUT">OUT</option>
                <option value="ALL">IN / OUT</option>
              </select>
            </div>

            {geofenceError && (
              <div
                className="text-danger"
                style={{ fontSize: 12, marginBottom: 8 }}
              >
                {geofenceError}
              </div>
            )}

            <div className="vehicles-grid">
              {Object.entries(allGeofences).map(([id, name]) => (
                <label key={id} className="vehicle-item">
                  <input
                    type="checkbox"
                    checked={selectedGeofences.includes(Number(id))}
                    onChange={() => toggleGeofence(Number(id))}
                    style={{ marginRight: 8 }}
                  />
                  <span>{name}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* ================= SCHEDULE ================= */}
        {activeTab === "Schedule" && (
          <WeeklyScheduleGrid
            initialData={schedule}
            initialStatus={scheduleEnabled}
            error={scheduleError}
            onChange={(data, status) => {
              setSchedule(data);
              setScheduleEnabled(status);

              if (!status || data.length > 0) {
                setScheduleError("");
              }
            }}
          />
        )}

        {/* ================= NOTIFICATION ================= */}
        {activeTab === "Notification" && (
          <NotificationTab
            value={notification}
            onChange={(updated) => {
              setNotification(updated);

              setNotificationErrors((prev) => {
                const newErrors = { ...prev };

                // COLOR
                if (updated.color) {
                  if (updated.colorValue) newErrors.colorValue = "";
                } else {
                  newErrors.colorValue = "";
                }

                // IGNORE
                if (updated.ignore) {
                  if (updated.ignoreValue.trim()) newErrors.ignoreValue = "";
                } else {
                  newErrors.ignoreValue = "";
                }

                // SOUND
                if (updated.sound) {
                  if (updated.soundValue) newErrors.soundValue = "";
                } else {
                  newErrors.soundValue = "";
                }

                // POPUP
                if (updated.popup) {
                  if (updated.popupValue) newErrors.popupValue = "";
                } else {
                  newErrors.popupValue = "";
                }

                // EMAIL
                if (updated.email) {
                  if (
                    updated.emailValue &&
                    /^\S+@\S+\.\S+$/.test(updated.emailValue)
                  ) {
                    newErrors.emailValue = "";
                  }
                } else {
                  newErrors.emailValue = "";
                }

                // WEBHOOK
                if (updated.webhook) {
                  if (
                    updated.webhookValue &&
                    /^https?:\/\/.+/.test(updated.webhookValue)
                  ) {
                    newErrors.webhookValue = "";
                  }
                } else {
                  newErrors.webhookValue = "";
                }

                // GLOBAL
                // ✅ 👉 PUT IT HERE (GLOBAL FIX)
                const hasAny =
                  updated.color ||
                  updated.ignore ||
                  updated.sound ||
                  updated.popup ||
                  updated.appPush ||
                  updated.email ||
                  updated.webhook;

                if (hasAny) {
                  newErrors.globalError = "";
                }

                return newErrors;
              });
            }}
            errors={notificationErrors}
          />
        )}

        {/* ================= COMMAND ================= */}
        {activeTab === "Command" && (
          <CommandTab
            value={command}
            onChange={setCommand}
            commands={commandNames.map((cmd) => ({
              value: cmd,
              label: cmd,
            }))}
            error={commandError}
          />
        )}

        {/* ================= USERS ================= */}
        {activeTab === "Users" && (
          <UsersAlertTab
            users={Object.entries(usersMap || {}).map(([id, name]) => ({
              id: Number(id),
              name,
            }))}
            value={users}
            onChange={(updatedUsers) => {
              setUsers(updatedUsers);
              if (updatedUsers.length > 0) {
                setUsersError("");
              }
            }}
            error={usersError}
          />
        )}
      </div>

      {/* Footer */}
      <div className="modal-footer-custom">
        <button
          className="btn btn-secondary"
          onClick={() => {
            setActiveTab("Object");
            setDisabledTabs(["Geofencing"]);
            onClose();
          }}
        >
          Close
        </button>

        <button className="btn btn-primary" onClick={handleSave}>
          {isEditMode ? "Update" : "Save"}
        </button>
      </div>
    </Modal>
  );
}
