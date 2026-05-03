import { useEffect, useRef, useState, type FC } from "react";
import * as pdfjsLib from "pdfjs-dist";
import pdfWorker from "pdfjs-dist/build/pdf.worker.min.mjs?url";

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

import Modal from "../components/common/Modal";
import "../assets/css/device.css";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../redux/store";
import {
  fetchGroups,
  fetchUsers,
  createNewDevice,
  fetchDeviceByIdForUpdate,
  updateExistingDevice,
} from "../slices/devicesSlice";
import type { DeviceSettingDto, DevicesUpdateDto } from "../api/deviceService";
import DeviceSensors from "./DeviceSensors";
import { toast } from "react-toastify";
import { fetchLiveDevices } from "../slices/liveSlice";
import { openModal, closeModal } from "../slices/uiSlice";
import DeviceMaintenance from "./DeviceMaintenance";
import { useAppSelector } from "../redux/hooks";
import { fetchAllModalNames } from "../slices/deviceModalSlice";
import Select from "react-select";

const objectIconModules = import.meta.glob(
  "../assets/images/device_icon/objectIcon/*.{png,jpg,svg}",
  { eager: true },
);
const mapIconModules = import.meta.glob(
  "../assets/images/device_icon/icon/*.{png,jpg,svg}",
  { eager: true },
);
const rotatingIconModules = import.meta.glob(
  "../assets/images/device_icon/rotating_icon/*.{png,jpg,svg}",
  { eager: true },
);

const toList = (modules: any) =>
  Object.entries(modules).map(([path, mod]: any) => ({
    name: path.split("/").pop(),
    src: mod.default,
  }));

const objectIconList = toList(objectIconModules);
const mapIconList = toList(mapIconModules);
const rotatingIconList = toList(rotatingIconModules);

type IconCategory = "all" | "car" | "bike" | "tractor" | "bus" | "truck";
type IconType = "Icon" | "Rotating_Icon" | "Arrow";

interface DeviceProps {
  open: boolean;
  onClose: () => void;
  deviceId?: number;
  onSaveSuccess?: () => void;
}

const detectType = (iconName: string): IconCategory => {
  const n = iconName.toLowerCase();
  if (n.startsWith("car")) return "car";
  if (n.startsWith("bike")) return "bike";
  if (n.startsWith("tractor")) return "tractor";
  if (n.startsWith("bus")) return "bus";
  if (n.startsWith("truck")) return "truck";
  return "all";
};

const Device: FC<DeviceProps> = ({
  open,
  onClose,
  deviceId,
  onSaveSuccess,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const { groups, users, deviceDetails } = useSelector(
    (state: RootState) => state.devices,
  );

  const [deviceName, setDeviceName] = useState("");
  const [imei, setImei] = useState("");
  const [active, setActive] = useState(true);

  const [iconCategory, setIconCategory] = useState<IconCategory>("all");
  const [iconType, setIconType] = useState<IconType>("Icon");
  const [selectedObjectIcon, setSelectedObjectIcon] = useState<string | null>(
    null,
  );
  const [selectedMapIcon, setSelectedMapIcon] = useState<string | null>(null);
  const [movingIconColor, setMovingIconColor] = useState<string>("");
  const [stoppedIconColor, setStoppedIconColor] = useState<string>("");
  const [offlineIconColor, setOfflineIconColor] = useState<string>("");
  const [engineIdleColor, setEngineIdleColor] = useState<string>("");

  const [tailColor, setTailColor] = useState("Red");
  const [tailLength, setTailLength] = useState(5);

  const [selectedGroup, setSelectedGroup] = useState<number | "">("");
  const [selectedUser, setSelectedUser] = useState<number | "">("");
  const [simNumber, setSimNumber] = useState("");
  const [installationDate, setInstallationDate] = useState("");
  const [simActivationDate, setSimActivationDate] = useState("");
  const [simExpirationDate, setSimExpirationDate] = useState("");
  const [vin, setVin] = useState("");
  const [plateNumber, setPlateNumber] = useState("");
  const [registrationNumber, setRegistrationNumber] = useState("");
  const [owner, setOwner] = useState("");
  const [odometer, setOdometer] = useState<number | undefined>(undefined);
  const [fuelMeasurement, setFuelMeasurement] = useState("lpkm");
  const [fuelMeasureValue, setFuelMeasureValue] = useState<number | undefined>(
    undefined,
  );
  const [fuelCost, setFuelCost] = useState<number | undefined>(undefined);
  const [deviceTimezone, setDeviceTimezone] = useState("Asia/Kolkata");
  const [deviceModel, setDeviceModel] = useState("");

  const [groupError, setGroupError] = useState("");
  const [userError, setUserError] = useState("");
  const [simError, setSimError] = useState("");
  const [installationDateError, setInstallationDateError] = useState("");
  const [simActivationDateError, setSimActivationDateError] = useState("");
  const [simExpirationDateError, setSimExpirationDateError] = useState("");
  const [vinError, setVinError] = useState("");
  const [plateError, setPlateError] = useState("");
  const [registrationError, setRegistrationError] = useState("");
  const [ownerError, setOwnerError] = useState("");
  const [odometerError, setOdometerError] = useState("");
  const [deviceModelError, setDeviceModelError] = useState("");
  const [fuelMeasureValueError, setFuelMeasureValueError] = useState("");
  const [fuelCostError, setFuelCostError] = useState("");
  const [objectIconError, setObjectIconError] = useState("");
  const [mapIconError, setMapIconError] = useState("");

  const [checkAvgSpeed, setCheckAvgSpeed] = useState(true);
  const [maxSpeedEnabled, setMaxSpeedEnabled] = useState(false);
  const [maxSpeedValue, setMaxSpeedValue] = useState("");
  const [minMovingSpeed, setMinMovingSpeed] = useState(6);
  const [minFuelFillings, setMinFuelFillings] = useState(10);
  const [minFuelTheft, setMinFuelTheft] = useState(10);
  const [fuelChangeAfterStop, setFuelChangeAfterStop] = useState(false);
  const [fuelChangeAfterStopTime, setFuelChangeAfterStopTime] = useState(60);
  const [activeTabName, setActiveTabName] = useState("Main");
  const modalNames = useAppSelector((state) => state.deviceModal.modalNames);
  const deviceModelOptions = modalNames.map((name) => ({
    value: name,
    label: name,
  }));

  const [showRcPreview, setShowRcPreview] = useState(false);
  const [showInsurancePreview, setShowInsurancePreview] = useState(false);

  const [fileErrors, setFileErrors] = useState({
    rc: "",
    insurance: "",
  });

  const validateFile = (file: File | null) => {
    if (!file) return "File is required";

    const MAX_FILE_SIZE = 5 * 1024 * 1024;

    const allowedExtensions = [
      ".pdf",
      ".png",
      ".jpg",
      ".jpeg",
      ".heic",
      ".webp",
      ".bmp",
      ".gif",
      ".tiff",
    ];

    const lowerName = file.name.toLowerCase();
    const isAllowed = allowedExtensions.some((ext) => lowerName.endsWith(ext));

    if (!isAllowed) {
      return "Only image or PDF files are allowed";
    }

    if (file.size > MAX_FILE_SIZE) {
      return "File size must be less than 5 MB";
    }

    return "";
  };

  const tabNames = [
    "Main",
    "Icons",
    "Tail",
    ...(deviceId ? ["Sensor"] : []),
    "Advanced",
    "Accuracy",
    ...(deviceId ? ["Maintenance"] : []),
    "Documents",
    ...(deviceId ? ["Info"] : []),
  ];

  type DocumentFileKey = "rc" | "insurance";

  const [documentFiles, setDocumentFiles] = useState<
    Record<DocumentFileKey, File | null>
  >({
    rc: null,
    insurance: null,
  });

  const rcFile = documentFiles.rc;
  const insuranceFile = documentFiles.insurance;

  const resetForm = () => {
    setActiveTabName("Main");
    setDeviceName("");
    setImei("");
    setActive(true);

    setIconCategory("all");
    setIconType("Icon");
    setSelectedObjectIcon(null);
    setSelectedMapIcon(null);
    setMovingIconColor("");
    setStoppedIconColor("");
    setOfflineIconColor("");
    setEngineIdleColor("");

    setTailColor("Red");
    setTailLength(5);

    setSelectedGroup("");
    setSelectedUser("");
    setSimNumber("");
    setInstallationDate("");
    setSimActivationDate("");
    setSimExpirationDate("");
    setVin("");
    setPlateNumber("");
    setRegistrationNumber("");
    setOwner("");
    setOdometer(undefined);
    setFuelMeasurement("lpkm");
    setFuelMeasureValue(undefined);
    setFuelCost(undefined);
    setDeviceTimezone("Asia/Kolkata");
    setDeviceModel("");
    setCheckAvgSpeed(true);
    setMaxSpeedEnabled(false);
    setMaxSpeedValue("");
    setMinMovingSpeed(6);
    setMinFuelFillings(10);
    setMinFuelTheft(10);
    setFuelChangeAfterStop(false);
    setFuelChangeAfterStopTime(60);

    setShowRcPreview(false);
    setShowInsurancePreview(false);
    setDocumentFiles({
      rc: null,
      insurance: null,
    });

    setDeviceNameError("");
    setImeiError("");
    setGroupError("");
    setUserError("");
    setSimError("");
    setInstallationDateError("");
    setSimActivationDateError("");
    setSimExpirationDateError("");
    setVinError("");
    setPlateError("");
    setRegistrationError("");
    setOwnerError("");
    setOdometerError("");
    setDeviceModelError("");
    setFuelMeasureValueError("");
    setFuelCostError("");
    setObjectIconError("");
    setMapIconError("");

    setFileErrors({
      rc: "",
      insurance: "",
    });
  };

  const handleClose = () => {
    dispatch(closeModal());
    resetForm();
    onClose();
  };

  const filterByCategory = (icons: any[]) => {
    if (iconCategory === "all") return icons;
    return icons.filter((icon) => detectType(icon.name) === iconCategory);
  };

  const filteredObjectIcons = filterByCategory(objectIconList);

  const getMapIcons = () => {
    if (iconType === "Icon") return filterByCategory(mapIconList);
    if (iconType === "Rotating_Icon") return filterByCategory(rotatingIconList);
    return [];
  };

  const existingRcPath = deviceId
    ? deviceDetails?.deviceData?.rcPath || ""
    : "";
  const existingInsurancePath = deviceId
    ? deviceDetails?.deviceData?.insurancePath || ""
    : "";

  const uploadBaseUrl = import.meta.env.VITE_IMAGE_BASE_URL;

  const existingRcUrl =
    existingRcPath && uploadBaseUrl
      ? `${uploadBaseUrl}/${encodeURIComponent(existingRcPath)}`
      : "";

  const existingInsuranceUrl =
    existingInsurancePath && uploadBaseUrl
      ? `${uploadBaseUrl}/${encodeURIComponent(existingInsurancePath)}`
      : "";

  const [deviceNameError, setDeviceNameError] = useState("");
  const [imeiError, setImeiError] = useState("");

  useEffect(() => {
    dispatch(fetchAllModalNames());
  }, [dispatch]);

  useEffect(() => {
    if (!deviceId && open) {
      const formatDate = (date: Date) => {
        const pad = (n: number) => n.toString().padStart(2, "0");

        return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}:00`;
      };

      const today = new Date();
      const nextYear = new Date();
      nextYear.setFullYear(nextYear.getFullYear() + 1);

      setInstallationDate(formatDate(today));
      setSimActivationDate(formatDate(today));
      setSimExpirationDate(formatDate(nextYear));
    }
  }, [open, deviceId]);

  useEffect(() => {
    if (!deviceId) {
      setSelectedObjectIcon(null);
      setSelectedMapIcon(null);
    }
  }, [iconCategory, iconType, deviceId]);

  useEffect(() => {
    if (open) {
      dispatch(fetchGroups());
      dispatch(fetchUsers());

      if (deviceId) {
        dispatch(fetchDeviceByIdForUpdate(deviceId));
      }
    }
  }, [open, deviceId, dispatch]);

  useEffect(() => {
    if (open) {
      setFileErrors({ rc: "", insurance: "" });
      setDocumentFiles({
        rc: null,
        insurance: null,
      });
    }
  }, [open]);

  useEffect(() => {
    if (deviceDetails && deviceId) {
      const d = deviceDetails.deviceData;

      setDeviceName(d.deviceName || "");
      setImei(d.deviceImei || "");
      setActive(d.vehicleStatus === "ACTIVE");
      setSelectedGroup(d.groupId ?? "");
      setSelectedUser(d.userId ?? "");

      setSimNumber(d.simCardNumber || "");
      setInstallationDate(d.installationDate || "");
      setSimActivationDate(d.simActivationDate || "");
      setSimExpirationDate(d.simExpirationDate || "");

      setVin(d.vin || "");
      setPlateNumber(d.plateNumber || "");
      setRegistrationNumber(d.registrationNumber || "");
      setOwner(d.owner || "");

      setMovingIconColor(d.movingIconColor || "");
      setStoppedIconColor(d.stoppedIconColor || "");
      setOfflineIconColor(d.offlineIconColor || "");
      setEngineIdleColor(d.engineIdleColor || "");

      setOdometer(d.odometer);
      setFuelMeasurement(d.fuelMeasureName || "lpkm");
      setFuelMeasureValue(d.fuelMeasurement);
      setFuelCost(d.fuelCost);

      setDeviceTimezone(d.deviceTimezone || "Asia/Kolkata");
      setDeviceModel(d.deviceModel || "");

      if (d.objectIcon) {
        setIconCategory(detectType(d.objectIcon));
      }

      setIconType((d.iconType as IconType) || "Icon");
      setSelectedObjectIcon(d.objectIcon || null);
      setSelectedMapIcon(d.imgIconName || null);

      setTailColor(d.tailColor || "Red");
      setTailLength(d.tailLength ?? 5);

      setMaxSpeedValue(d.maxSpeed || "");
      setMaxSpeedEnabled(Boolean(d.maxSpeed));
      setMinMovingSpeed(Number(d.minMovingSpeed) || 6);
      setMinFuelFillings(Number(d.minFuelFillings) || 10);
      setMinFuelTheft(Number(d.minFuelTheft) || 10);
      setFuelChangeAfterStop(Boolean(d.fuelChangeAfterStop));
      setFuelChangeAfterStopTime(Number(d.fuelChangeAfterStop) || 60);
    }
  }, [deviceDetails, deviceId]);

  useEffect(() => {
    if (open) {
      dispatch(openModal());
    } else {
      dispatch(closeModal());
    }
  }, [open, dispatch]);

  const [fileInputKey, setFileInputKey] = useState<
    Record<DocumentFileKey, number>
  >({
    rc: Date.now(),
    insurance: Date.now(),
  });

  const handleSelectedFile = (file: File | null, field: DocumentFileKey) => {
    if (!file) return;

    const error = validateFile(file);

    if (error) {
      setFileErrors((prev) => ({
        ...prev,
        [field]: error,
      }));

      setDocumentFiles((prev) => ({
        ...prev,
        [field]: null,
      }));

      setFileInputKey((prev) => ({
        ...prev,
        [field]: Date.now(),
      }));

      return;
    }

    setFileErrors((prev) => ({
      ...prev,
      [field]: "",
    }));

    setDocumentFiles((prev) => ({
      ...prev,
      [field]: file,
    }));

    setFileInputKey((prev) => ({
      ...prev,
      [field]: Date.now(),
    }));
  };

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: DocumentFileKey,
  ) => {
    const file = e.target.files?.[0] ?? null;
    handleSelectedFile(file, field);
    e.target.value = "";
  };

  const handleRemoveFile = (field: DocumentFileKey) => {
    setDocumentFiles((prev) => ({
      ...prev,
      [field]: null,
    }));

    setFileErrors((prev) => ({
      ...prev,
      [field]: "",
    }));

    setFileInputKey((prev) => ({
      ...prev,
      [field]: Date.now(),
    }));
  };

  const onObjectIconClick = (iconName: string) => {
    setObjectIconError("");
    const newCategory = detectType(iconName);
    setIconCategory(newCategory);
    setSelectedObjectIcon(iconName);
  };

  const onMapIconClick = (iconName: string) => {
    setMapIconError("");
    const newCategory = detectType(iconName);
    setIconCategory(newCategory);
    setSelectedMapIcon(iconName);
  };

  const validateFields = () => {
    let valid = true;
    let firstErrorTab: string | null = null;
    const missingFields: string[] = [];

    const setTabIfEmpty = (tabName: string) => {
      if (!firstErrorTab) firstErrorTab = tabName;
    };

    const addMissingField = (fieldName: string) => {
      if (!missingFields.includes(fieldName)) {
        missingFields.push(fieldName);
      }
    };

    if (!deviceName || !deviceName.trim()) {
      setDeviceNameError("Device name is required");
      addMissingField("Object Name");
      setTabIfEmpty("Main");
      valid = false;
    } else {
      setDeviceNameError("");
    }

    if (!imei || imei.length < 8) {
      setImeiError("IMEI must be 8 digits or more");
      addMissingField("IMEI");
      setTabIfEmpty("Main");
      valid = false;
    } else {
      setImeiError("");
    }

    if (!selectedObjectIcon) {
      setObjectIconError("Please select an object icon");
      addMissingField("Object Icon");
      setTabIfEmpty("Icons");
      valid = false;
    } else {
      setObjectIconError("");
    }

    if (!selectedMapIcon && iconType !== "Arrow") {
      setMapIconError("Please select a map icon");
      addMissingField("Map Icon");
      setTabIfEmpty("Icons");
      valid = false;
    } else {
      setMapIconError("");
    }

    if (selectedObjectIcon && selectedMapIcon && iconType !== "Arrow") {
      const objType = detectType(selectedObjectIcon);
      const mapType = detectType(selectedMapIcon);

      if (objType !== mapType) {
        setMapIconError(
          "Map icon must match selected object type (car, bike, etc.)",
        );
        setTabIfEmpty("Icons");
        valid = false;
      }
    }

    // if (!selectedUser) {
    //     setUserError("User is required");
    //     addMissingField("Users");
    //     setTabIfEmpty("Advanced");
    //     valid = false;
    // } else {
    //     setUserError("");
    // }

    if (!installationDate) {
      setInstallationDateError("Installation date is required");
      addMissingField("Installation Date");
      setTabIfEmpty("Advanced");
      valid = false;
    } else {
      setInstallationDateError("");
    }

    const install = installationDate ? new Date(installationDate) : null;
    const activation = simActivationDate ? new Date(simActivationDate) : null;
    const expiry = simExpirationDate ? new Date(simExpirationDate) : null;

    if (install && activation && expiry) {
      if (!(install <= activation && activation < expiry)) {
        setSimExpirationDateError(
          "Installation date must be before Activation and Activation before Expiry",
        );
        setTabIfEmpty("Advanced");
        valid = false;
      } else {
        setSimExpirationDateError("");
      }
    }

    if (!simActivationDate) {
      setSimActivationDateError("SIM activation date is required");
      addMissingField("SIM Activation Date");
      setTabIfEmpty("Advanced");
      valid = false;
    } else {
      setSimActivationDateError("");
    }

    if (!simExpirationDate) {
      setSimExpirationDateError("SIM expiration date is required");
      addMissingField("SIM Expiration Date");
      setTabIfEmpty("Advanced");
      valid = false;
    } else if (!(install && activation && expiry)) {
      setSimExpirationDateError("");
    }

    if (!deviceModel) {
      setDeviceModelError("Device model is required");
      addMissingField("Device Model");
      setTabIfEmpty("Advanced");
      valid = false;
    } else {
      setDeviceModelError("");
    }

    if (firstErrorTab) {
      setActiveTabName(firstErrorTab);
    }

    return { valid, missingFields };
  };

  const handleSave = async () => {
    const { valid, missingFields } = validateFields();

    if (!valid) {
      if (missingFields.length) {
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
      }
      return;
    }

    if (fileErrors.rc || fileErrors.insurance) {
      setActiveTabName("Documents");
      return;
    }

    let finalMovingIconColor = movingIconColor;
    let finalStoppedIconColor = stoppedIconColor;
    let finalOfflineIconColor = offlineIconColor;

    if (engineIdleColor && !finalMovingIconColor) {
      finalMovingIconColor = engineIdleColor;
    }

    const isOffline = deviceDetails?.liveData?.status === "offline";
    if (isOffline) {
      finalMovingIconColor = "DarkGray";
      finalStoppedIconColor = "DarkGray";
      finalOfflineIconColor = "DarkGray";
    }

    const normalizeDateTime = (value: string) => {
      if (!value) return value;

      if (value.length === 16) {
        return value + ":00";
      }

      return value;
    };

    try {
      if (deviceId) {
        const payload: DevicesUpdateDto = {
          deviceId,
          deviceName,
          deviceImei: imei,
          deviceModel,
          deviceTimezone,
          groupId: Number(selectedGroup),
          groupName: "",
          userId: Number(selectedUser),
          username: "",
          accountName: "",
          simCardNumber: simNumber,
          simActivationDate: normalizeDateTime(simActivationDate),
          simExpirationDate: normalizeDateTime(simExpirationDate),
          vin,
          installationDate: normalizeDateTime(installationDate),
          plateNumber,
          registrationNumber,
          owner,
          odometer: odometer || 0,
          fuelMeasureName: fuelMeasurement,
          fuelMeasurement: fuelMeasureValue || 0,
          fuelCost: fuelCost || 0,
          iconType,
          objectIcon: selectedObjectIcon || "",
          imgIconName: selectedMapIcon || "",
          movingIconColor: finalMovingIconColor,
          stoppedIconColor: finalStoppedIconColor,
          offlineIconColor: finalOfflineIconColor,
          engineIdleColor,
          tailColor,
          tailLength,
          vehicleStatus: active ? "ACTIVE" : "INACTIVE",
          maxSpeed: maxSpeedEnabled ? maxSpeedValue || "0" : "",
          minMovingSpeed: minMovingSpeed.toString(),
          minFuelFillings: minFuelFillings.toString(),
          minFuelTheft: minFuelTheft.toString(),
          fuelChangeAfterStop: fuelChangeAfterStop
            ? fuelChangeAfterStopTime.toString()
            : "",
        };

        await dispatch(
          updateExistingDevice({
            deviceId,
            payload: {
              ...payload,
              rcFile,
              insuranceFile,
            },
          }),
        ).unwrap();

        await dispatch(fetchDeviceByIdForUpdate(deviceId));
        toast.success("Device updated successfully");
      } else {
        const payload: DeviceSettingDto = {
          name: deviceName,
          uniqueid: imei,
          vehicleStatus: active ? "ACTIVE" : "INACTIVE",
          objectIcon: selectedObjectIcon || undefined,
          imgIconName: selectedMapIcon || undefined,
          iconType,
          movingIconColor: finalMovingIconColor,
          stoppedIconColor: finalStoppedIconColor,
          offlineIconColor: finalOfflineIconColor,
          engineIdleColor,
          tailColor,
          tailLength,
          groupId: selectedGroup ? Number(selectedGroup) : undefined,
          userId: selectedUser ? Number(selectedUser) : undefined,
          simCardNumber: simNumber,
          installationDate,
          simActivationDate,
          simExpirationDate,
          vin,
          plateNumber,
          registrationNumber,
          owner,
          odometer,
          fuelMeasureName: fuelMeasurement,
          deviceModel,
          fuelCost,
          deviceTimezone,
          maxSpeed: maxSpeedEnabled ? maxSpeedValue : undefined,
          minMovingSpeed: minMovingSpeed.toString(),
          minFuelFillings: minFuelFillings.toString(),
          minFuelTheft: minFuelTheft.toString(),
          fuelChangeAfterStop: fuelChangeAfterStop
            ? fuelChangeAfterStopTime.toString()
            : undefined,
        };

        await dispatch(
          createNewDevice({
            ...payload,
            rcFile,
            insuranceFile,
          }),
        ).unwrap();
        toast.success("Device created successfully");
      }

      dispatch(fetchLiveDevices());
      if (onSaveSuccess) onSaveSuccess();
      handleClose();
    } catch (err: any) {
      console.error("Save failed", err);

      const errorMessage = err || "Something went wrong";
      toast.error(errorMessage);
      if (errorMessage === "Insufficient subscription balance!") {
        handleClose();
      }
    }
  };

  const getFileExtension = (url: string) => {
    const cleanUrl = url.split("?")[0].toLowerCase();
    return cleanUrl.substring(cleanUrl.lastIndexOf("."));
  };

  const isPdfFile = (url: string) => getFileExtension(url) === ".pdf";

  const renderDocumentPreview = (url: string, title: string) => {
    if (!url) return null;

    if (isPdfFile(url)) {
      return <PdfPreview url={url} />;
    }

    return <img src={url} alt={title} className="document-preview-image" />;
  };

  const handleDocumentDownload = async (url: string, fileName: string) => {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("Failed to download file");
      }

      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      link.remove();

      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      toast.error("Unable to download document");
    }
  };

  const sanitizeFileNamePart = (value: string) =>
    value.replace(/[<>:"/\\|?*]+/g, "").trim();

  const getDownloadFileName = (
    prefix: "RegistrationCertificate" | "Insurance",
    deviceNameValue: string,
    sourcePath: string,
  ) => {
    const safeDeviceName = sanitizeFileNamePart(deviceNameValue || "Device");
    const extension = getFileExtension(sourcePath) || ".pdf";
    return `${prefix}(${safeDeviceName})${extension}`;
  };

  const PdfPreview: FC<{ url: string }> = ({ url }) => {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
      let cancelled = false;

      const renderPdf = async () => {
        try {
          setLoading(true);
          setError("");

          const response = await fetch(url);
          if (!response.ok) throw new Error("PDF fetch failed");

          const arrayBuffer = await response.arrayBuffer();
          const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

          if (!containerRef.current || cancelled) return;

          const container = containerRef.current;
          container.innerHTML = "";

          const parentWidth = container.clientWidth || 600;

          for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);

            const canvas = document.createElement("canvas");
            const context = canvas.getContext("2d");
            if (!context) continue;

            const baseViewport = page.getViewport({ scale: 1 });
            const scale = parentWidth / baseViewport.width;
            const viewport = page.getViewport({ scale });

            canvas.width = viewport.width;
            canvas.height = viewport.height;
            canvas.className = "pdf-page-canvas";

            container.appendChild(canvas);

            await page.render({
              canvasContext: context,
              viewport,
              canvas: canvas,
            }).promise;
          }
        } catch (err) {
          console.error(err);
          setError("Unable to preview PDF");
        } finally {
          if (!cancelled) setLoading(false);
        }
      };

      renderPdf();

      return () => {
        cancelled = true;
      };
    }, [url]);

    return (
      <div className="document-preview-wrapper">
        {loading && (
          <div className="document-preview-loading">Loading PDF...</div>
        )}
        {error && <div className="document-preview-error">{error}</div>}

        <div
          ref={containerRef}
          className="pdf-scroll-container"
          style={{ display: loading || error ? "none" : "block" }}
        />
      </div>
    );
  };

  type DocumentFieldProps = {
    label: string;
    deviceId?: number;
    existingUrl: string;
    existingPath: string;
    deviceName: string;
    showPreview: boolean;
    setShowPreview: React.Dispatch<React.SetStateAction<boolean>>;
    fileError: string;
    fileType: "rc" | "insurance";
    selectedFile?: File | null;
    handleFileChange: (
      e: React.ChangeEvent<HTMLInputElement>,
      field: "rc" | "insurance",
    ) => void;
    handleSelectedFile: (file: File | null, field: "rc" | "insurance") => void;
    handleRemoveFile: (field: "rc" | "insurance") => void;
    handleDocumentDownload: (url: string, fileName: string) => void;
    getDownloadFileName: (
      prefix: "RegistrationCertificate" | "Insurance",
      deviceNameValue: string,
      sourcePath: string,
    ) => string;
    renderDocumentPreview: (url: string, title: string) => React.ReactNode;
    downloadPrefix: "RegistrationCertificate" | "Insurance";
  };

  const DocumentField: FC<DocumentFieldProps> = ({
    label,
    deviceId,
    existingUrl,
    existingPath,
    deviceName,
    showPreview,
    setShowPreview,
    fileError,
    fileType,
    selectedFile,
    handleFileChange,
    handleSelectedFile,
    handleRemoveFile,
    handleDocumentDownload,
    getDownloadFileName,
    renderDocumentPreview,
    downloadPrefix,
  }) => {
    const hasUploadedDocument = Boolean(deviceId && existingUrl);
    const inputId = `${fileType}-document-input`;

    const onDrop = (e: React.DragEvent<HTMLLabelElement>) => {
      e.preventDefault();
      e.currentTarget.classList.remove("drag-active");

      const file = e.dataTransfer.files?.[0] ?? null;
      handleSelectedFile(file, fileType);
    };

    const formatFileSize = (size: number) => {
      if (size < 1024 * 1024) return `${Math.round(size / 1024)} KB`;
      return `${(size / (1024 * 1024)).toFixed(2)} MB`;
    };

    return (
      <div className="document-column">
        <label className="form-label">{label}</label>

        {hasUploadedDocument && (
          <div className="document-action-row">
            <button
              type="button"
              className="document-toggle-btn"
              onClick={() => setShowPreview((prev) => !prev)}
            >
              {showPreview
                ? "Hide Uploaded Document"
                : "View Uploaded Document"}
            </button>
          </div>
        )}

        {!showPreview && (
          <>
            <label
              htmlFor={inputId}
              className={`google-upload-box ${fileError ? "error" : ""}`}
              onDragOver={(e) => {
                e.preventDefault();
                e.currentTarget.classList.add("drag-active");
              }}
              onDragLeave={(e) => {
                e.currentTarget.classList.remove("drag-active");
              }}
              onDrop={onDrop}
            >
              <div className="google-upload-icon">↑</div>

              <div className="google-upload-text">
                <strong>Drag file here or browse</strong>
                <span>PDF or image, up to 5 MB</span>
              </div>

              <span className="google-upload-button">Browse</span>

              <input
                key={`${fileType}-${fileInputKey[fileType]}`}
                id={inputId}
                name={`${fileType}Document`}
                type="file"
                className="document-hidden-file-input"
                accept=".pdf,.png,.jpg,.jpeg,.heic,.webp,.bmp,.gif,.tiff,image/*,application/pdf"
                onChange={(e) => handleFileChange(e, fileType)}
              />
            </label>

            {selectedFile && (
              <div className="selected-document-card">
                <div className="selected-document-icon">
                  {selectedFile.name.toLowerCase().endsWith(".pdf")
                    ? "PDF"
                    : "IMG"}
                </div>

                <div className="selected-document-info">
                  <div className="selected-document-name">
                    {selectedFile.name}
                  </div>
                  <div className="selected-document-size">
                    {formatFileSize(selectedFile.size)}
                  </div>
                </div>

                <button
                  type="button"
                  className="selected-document-remove"
                  onClick={() => handleRemoveFile(fileType)}
                >
                  Remove
                </button>
              </div>
            )}

            {fileError && (
              <div className="text-danger" style={{ fontSize: "12px" }}>
                {fileError}
              </div>
            )}
          </>
        )}

        {hasUploadedDocument && showPreview && (
          <div className="document-preview-box">
            <div className="document-preview-toolbar">
              <button
                type="button"
                className="document-download-btn"
                onClick={() =>
                  handleDocumentDownload(
                    existingUrl,
                    getDownloadFileName(
                      downloadPrefix,
                      deviceName,
                      existingPath,
                    ),
                  )
                }
              >
                Download
              </button>
            </div>

            <div className="document-preview-content">
              {renderDocumentPreview(existingUrl, label)}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <Modal
      isOpen={open}
      title={deviceId ? "Update Object" : "Add Object"}
      onClose={handleClose}
      size="large"
    >
      <div className="modal-tabs">
        {tabNames.map((t) => (
          <button
            key={t}
            className={`tab-btn ${activeTabName === t ? "active" : ""}`}
            onClick={() => {
              setActiveTabName(t);
            }}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="tab-content">
        {activeTabName === "Main" && (
          <div className="tab-pane">
            <div className="form-check mb-3">
              <input
                type="checkbox"
                className="form-check-input"
                checked={active}
                onChange={(e) => setActive(e.target.checked)}
              />
              <label className="form-check-label">Active</label>
            </div>

            <div className="mb-3 mt-2">
              <label className="form-label required">Object Name</label>
              <input
                className="form-control"
                value={deviceName}
                onChange={(e) => {
                  setDeviceName(e.target.value);
                  if (e.target.value.trim()) setDeviceNameError("");
                }}
              />
              {deviceNameError && (
                <div className="text-danger" style={{ fontSize: "12px" }}>
                  {deviceNameError}
                </div>
              )}
            </div>

            <div className="mb-3">
              <label className="form-label required">IMEI</label>
              <input
                className="form-control"
                value={imei}
                minLength={8}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, "");
                  setImei(value);

                  if (value.length < 8) setImeiError("");
                }}
              />
              {imeiError && (
                <div className="text-danger" style={{ fontSize: "12px" }}>
                  {imeiError}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTabName === "Icons" && (
          <div className="tab-pane">
            <label className="form-label">Object Icon Type</label>
            <select
              className="form-select"
              value={iconCategory}
              onChange={(e) => setIconCategory(e.target.value as IconCategory)}
            >
              <option value="all">All</option>
              <option value="car">Car</option>
              <option value="bike">Bike</option>
              <option value="tractor">Tractor</option>
              <option value="bus">Bus</option>
              <option value="truck">Truck</option>
            </select>

            <div className="icon-grid mt-2">
              {filteredObjectIcons.map((icon) => (
                <div
                  key={icon.name}
                  className={`icon-box ${selectedObjectIcon === icon.name ? "selected-icon" : ""}`}
                  onClick={() => onObjectIconClick(icon.name)}
                >
                  <img src={icon.src} />
                </div>
              ))}
            </div>

            {objectIconError && (
              <div className="text-danger" style={{ fontSize: "12px" }}>
                {objectIconError}
              </div>
            )}

            {selectedObjectIcon && (
              <div className="icon-preview">
                <img
                  src={
                    objectIconList.find((i) => i.name === selectedObjectIcon)
                      ?.src
                  }
                />
              </div>
            )}

            <hr />

            <label className="form-label">Map Icon Type</label>
            <select
              className="form-select"
              value={iconType}
              onChange={(e) => setIconType(e.target.value as IconType)}
            >
              <option value="Icon">Icon</option>
              <option value="Rotating_Icon">Rotating Icon</option>
              <option value="Arrow">Arrow</option>
            </select>

            {iconType !== "Arrow" && (
              <>
                <div className="icon-grid mt-2">
                  {getMapIcons().map((icon) => (
                    <div
                      key={icon.name}
                      className={`icon-box ${selectedMapIcon === icon.name ? "selected-icon" : ""}`}
                      onClick={() => onMapIconClick(icon.name)}
                    >
                      <img src={icon.src} />
                    </div>
                  ))}
                </div>
                {mapIconError && (
                  <div className="text-danger" style={{ fontSize: "12px" }}>
                    {mapIconError}
                  </div>
                )}
                {selectedMapIcon && (
                  <div className="icon-preview">
                    <img
                      src={
                        getMapIcons().find((i) => i.name === selectedMapIcon)
                          ?.src
                      }
                    />
                  </div>
                )}
              </>
            )}

            {iconType === "Arrow" && (
              <div className="grid-2 mt-3">
                {["Moving", "Stopped", "Idle", "Offline"].map((s) => {
                  const valueMap: Record<string, string | undefined> = {
                    Moving: movingIconColor,
                    Stopped: stoppedIconColor,
                    Idle: engineIdleColor,
                    Offline: offlineIconColor,
                  };

                  const setterMap: Record<string, (val: string) => void> = {
                    Moving: setMovingIconColor,
                    Stopped: setStoppedIconColor,
                    Idle: setEngineIdleColor,
                    Offline: setOfflineIconColor,
                  };

                  const value = valueMap[s];
                  const setValue = setterMap[s];

                  return (
                    <div key={s}>
                      <label className="form-label">{s}</label>
                      <select
                        className="form-select"
                        value={value || ""}
                        onChange={(e) => setValue(e.target.value)}
                      >
                        <option value="">Select Color</option>
                        <option value="Green">Green</option>
                        <option value="Red">Red</option>
                        <option value="Blue">Blue</option>
                        <option value="Black">Black</option>
                        <option value="Yellow">Yellow</option>
                      </select>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {activeTabName === "Tail" && (
          <div className="tab-pane">
            <div className="mb-3">
              <label className="normal-label">Tail Color</label>

              <select
                className="form-select"
                value={tailColor}
                onChange={(e) => setTailColor(e.target.value)}
              >
                <option>Red</option>
                <option>Green</option>
                <option>Blue</option>
              </select>
            </div>
            <div className="mb-3">
              <label className="normal-label">Tail Length</label>
              <input
                type="number"
                style={{ marginTop: "5px" }}
                className="form-control"
                value={tailLength}
                onChange={(e) => setTailLength(Number(e.target.value))}
              />
            </div>
          </div>
        )}

        {deviceId && activeTabName === "Sensor" && (
          <DeviceSensors deviceId={deviceId} />
        )}

        {activeTabName === "Advanced" && (
          <div className="tab-pane grid-2">
            <div>
              <label className="form-label">Group</label>
              <select
                className="form-select"
                value={selectedGroup}
                onChange={(e) => {
                  setSelectedGroup(
                    e.target.value ? Number(e.target.value) : "",
                  );
                  setGroupError("");
                }}
              >
                <option value="">Select Group</option>

                {groups.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.name}
                  </option>
                ))}
              </select>

              {groupError && (
                <div className="text-danger" style={{ fontSize: "12px" }}>
                  {groupError}
                </div>
              )}
            </div>

            <div>
              <label className="form-label">Users</label>
              <select
                className="form-select"
                value={selectedUser}
                onChange={(e) => {
                  setSelectedUser(e.target.value ? Number(e.target.value) : "");
                  setUserError("");
                }}
              >
                <option value="">Select User</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name}
                  </option>
                ))}
              </select>
              {userError && (
                <div className="text-danger" style={{ fontSize: "12px" }}>
                  {userError}
                </div>
              )}
            </div>

            <div>
              <label className="form-label">SIM Number</label>
              <input
                className="form-control"
                value={simNumber}
                onChange={(e) => {
                  setSimNumber(e.target.value);
                  setSimError("");
                }}
              />
              {simError && (
                <div className="text-danger" style={{ fontSize: "12px" }}>
                  {simError}
                </div>
              )}
            </div>

            <div>
              <label className="form-label">Installation Date</label>
              <input
                type="datetime-local"
                className="form-control"
                value={installationDate}
                onChange={(e) => {
                  setInstallationDate(e.target.value);
                  setInstallationDateError("");
                }}
              />
              {installationDateError && (
                <div className="text-danger" style={{ fontSize: "12px" }}>
                  {installationDateError}
                </div>
              )}
            </div>

            <div>
              <label className="form-label">SIM Activation Date</label>
              <input
                type="datetime-local"
                className="form-control"
                value={simActivationDate}
                onChange={(e) => {
                  setSimActivationDate(e.target.value);
                  setSimActivationDateError("");
                }}
              />
              {simActivationDateError && (
                <div className="text-danger" style={{ fontSize: "12px" }}>
                  {simActivationDateError}
                </div>
              )}
            </div>

            <div>
              <label className="form-label">SIM Expiration Date</label>
              <input
                type="datetime-local"
                className="form-control"
                value={simExpirationDate}
                onChange={(e) => {
                  setSimExpirationDate(e.target.value);
                  setSimExpirationDateError("");
                }}
              />
              {simExpirationDateError && (
                <div className="text-danger" style={{ fontSize: "12px" }}>
                  {simExpirationDateError}
                </div>
              )}
            </div>

            <div>
              <label className="form-label">VIN</label>
              <input
                className="form-control"
                value={vin}
                onChange={(e) => {
                  setVin(e.target.value);
                  setVinError("");
                }}
              />
              {vinError && (
                <div className="text-danger" style={{ fontSize: "12px" }}>
                  {vinError}
                </div>
              )}
            </div>

            <div>
              <label className="form-label">Plate Number</label>
              <input
                className="form-control"
                value={plateNumber}
                onChange={(e) => {
                  setPlateNumber(e.target.value);
                  setPlateError("");
                }}
              />
              {plateError && (
                <div className="text-danger" style={{ fontSize: "12px" }}>
                  {plateError}
                </div>
              )}
            </div>

            <div>
              <label className="form-label">Registration Number</label>
              <input
                className="form-control"
                value={registrationNumber}
                onChange={(e) => {
                  setRegistrationNumber(e.target.value);
                  setRegistrationError("");
                }}
              />
              {registrationError && (
                <div className="text-danger" style={{ fontSize: "12px" }}>
                  {registrationError}
                </div>
              )}
            </div>

            <div>
              <label className="form-label">Owner Name</label>
              <input
                className="form-control"
                value={owner}
                onChange={(e) => {
                  setOwner(e.target.value);
                  setOwnerError("");
                }}
              />
              {ownerError && (
                <div className="text-danger" style={{ fontSize: "12px" }}>
                  {ownerError}
                </div>
              )}
            </div>

            <div>
              <label className="form-label">Odometer</label>
              <input
                type="number"
                className="form-control"
                value={odometer || ""}
                onChange={(e) => {
                  const val = e.target.value;
                  setOdometer(val ? Number(val) : undefined);
                  setOdometerError("");
                }}
              />
              {odometerError && (
                <div className="text-danger" style={{ fontSize: "12px" }}>
                  {odometerError}
                </div>
              )}
            </div>

            <div>
              <label className="form-label required">Device Model</label>

              <Select
                classNamePrefix="device-select"
                options={deviceModelOptions}
                placeholder="Search Model..."
                isSearchable
                components={{ IndicatorSeparator: () => null }}
                value={
                  deviceModelOptions.find(
                    (option) => option.value === deviceModel,
                  ) || null
                }
                onChange={(selected) => {
                  setDeviceModel(selected ? selected.value : "");
                  setDeviceModelError("");
                }}
              />

              {deviceModelError && (
                <div className="text-danger" style={{ fontSize: "12px" }}>
                  {deviceModelError}
                </div>
              )}
            </div>

            <div>
              <label className="form-label">Fuel Measurement</label>
              <select
                className="form-select"
                value={fuelMeasurement}
                onChange={(e) => setFuelMeasurement(e.target.value)}
              >
                <option value="lpkm">LPKM</option>
                <option value="mpg">MPG</option>
                <option value="kwh">KWH</option>
                <option value="lph">LPH</option>
                <option value="kmpl">KMPL</option>
              </select>
            </div>

            <div>
              <label className="form-label">Default Fuel Measure</label>
              <input
                type="number"
                className="form-control"
                value={fuelMeasureValue || ""}
                onChange={(e) => {
                  const val = e.target.value;
                  setFuelMeasureValue(val ? Number(val) : undefined);
                  setFuelMeasureValueError("");
                }}
              />
              {fuelMeasureValueError && (
                <div className="text-danger" style={{ fontSize: "12px" }}>
                  {fuelMeasureValueError}
                </div>
              )}
            </div>

            <div>
              <label className="form-label">Default Fuel Cost</label>
              <input
                type="number"
                className="form-control"
                value={fuelCost || ""}
                onChange={(e) => {
                  const val = e.target.value;
                  setFuelCost(val ? Number(val) : undefined);
                  setFuelCostError("");
                }}
              />
              {fuelCostError && (
                <div className="text-danger" style={{ fontSize: "12px" }}>
                  {fuelCostError}
                </div>
              )}
            </div>

            <div>
              <label className="form-label">Time Zone</label>
              <select
                className="form-select"
                value={deviceTimezone}
                onChange={(e) => setDeviceTimezone(e.target.value)}
              >
                <option value="">Select Time Zone</option>
                <option value="Etc/UTC">
                  UTC (Coordinated Universal Time)
                </option>
                <option value="Asia/Kolkata">India (Asia/Kolkata)</option>
                <option value="Asia/Shanghai">China (Asia/Shanghai)</option>
                <option value="America/New_York">USA (New York)</option>
                <option value="Europe/London">UK (London)</option>
                <option value="Asia/Tokyo">Japan (Tokyo)</option>
                <option value="Australia/Sydney">Australia (Sydney)</option>
              </select>
            </div>
          </div>
        )}

        {activeTabName === "Accuracy" && (
          <div className="tab-pane accuracy-tab">
            <div className="accuracy-row">
              <input
                type="checkbox"
                checked={checkAvgSpeed}
                onChange={(e) => setCheckAvgSpeed(e.target.checked)}
              />
              <label>Check position validity by average speed</label>
            </div>

            <div className="accuracy-block">
              <label className="accuracy-label">Max Speed</label>

              <div className="accuracy-row">
                <input
                  type="checkbox"
                  checked={maxSpeedEnabled}
                  onChange={(e) => setMaxSpeedEnabled(e.target.checked)}
                />

                <input
                  type="number"
                  className="form-control"
                  disabled={!maxSpeedEnabled}
                  value={maxSpeedValue}
                  onChange={(e) => setMaxSpeedValue(e.target.value)}
                  placeholder="Enter max speed"
                />
              </div>
            </div>

            <div className="accuracy-block">
              <label className="accuracy-label">
                Min. moving speed in km/h (default 6)
              </label>
              <input
                type="number"
                className="form-control"
                value={minMovingSpeed}
                onChange={(e) => {
                  const val = e.target.value;
                  setMinMovingSpeed(val ? Number(val) : 6);
                }}
              />
            </div>

            <div className="accuracy-block">
              <label className="accuracy-label">
                Min. fuel difference to detect fuel fillings (default 10)
              </label>
              <input
                type="number"
                className="form-control"
                value={minFuelFillings}
                onChange={(e) => {
                  const val = e.target.value;
                  setMinFuelFillings(val ? Number(val) : 10);
                }}
              />
            </div>

            <div className="accuracy-block">
              <label className="accuracy-label">
                Min. fuel difference to detect fuel thefts (default 10)
              </label>
              <input
                type="number"
                className="form-control"
                value={minFuelTheft}
                onChange={(e) => {
                  const val = e.target.value;
                  setMinFuelTheft(val ? Number(val) : 10);
                }}
              />
            </div>

            <div className="accuracy-block">
              <label className="accuracy-label">
                Detect fuel change after stop
              </label>

              <div className="accuracy-row">
                <input
                  type="checkbox"
                  checked={fuelChangeAfterStop}
                  onChange={(e) => setFuelChangeAfterStop(e.target.checked)}
                />

                <select
                  className="form-select"
                  disabled={!fuelChangeAfterStop}
                  value={fuelChangeAfterStopTime}
                  onChange={(e) =>
                    setFuelChangeAfterStopTime(Number(e.target.value))
                  }
                >
                  <option value={60}>1 min</option>
                  <option value={120}>2 min</option>
                  <option value={180}>3 min</option>
                  <option value={300}>5 min</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {deviceId && activeTabName === "Maintenance" && (
          <div className="tab-pane text-center">
            <DeviceMaintenance deviceId={deviceId} />
          </div>
        )}

        <div
          style={{ display: activeTabName === "Documents" ? "block" : "none" }}
        >
          <div className="tab-pane grid-2 documents-grid">
            <DocumentField
              label="Registration Certificate"
              deviceId={deviceId}
              existingUrl={existingRcUrl}
              existingPath={existingRcPath}
              deviceName={deviceName}
              showPreview={showRcPreview}
              setShowPreview={setShowRcPreview}
              fileError={fileErrors.rc}
              fileType="rc"
              selectedFile={rcFile}
              handleFileChange={handleFileChange}
              handleSelectedFile={handleSelectedFile}
              handleRemoveFile={handleRemoveFile}
              handleDocumentDownload={handleDocumentDownload}
              getDownloadFileName={getDownloadFileName}
              renderDocumentPreview={renderDocumentPreview}
              downloadPrefix="RegistrationCertificate"
            />

            <DocumentField
              label="Insurance"
              deviceId={deviceId}
              existingUrl={existingInsuranceUrl}
              existingPath={existingInsurancePath}
              deviceName={deviceName}
              showPreview={showInsurancePreview}
              setShowPreview={setShowInsurancePreview}
              fileError={fileErrors.insurance}
              fileType="insurance"
              selectedFile={insuranceFile}
              handleFileChange={handleFileChange}
              handleSelectedFile={handleSelectedFile}
              handleRemoveFile={handleRemoveFile}
              handleDocumentDownload={handleDocumentDownload}
              getDownloadFileName={getDownloadFileName}
              renderDocumentPreview={renderDocumentPreview}
              downloadPrefix="Insurance"
            />
          </div>
        </div>

        {deviceId && activeTabName === "Info" && deviceDetails?.liveData && (
          <div className="live-data-table">
            <table>
              <thead>
                <tr>
                  <th>Data</th>
                  <th>Value</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Altitude</td>
                  <td>{deviceDetails.liveData.altitude} m</td>
                </tr>
                <tr>
                  <td>Angle</td>
                  <td>{deviceDetails.liveData.course ?? "-"}</td>
                </tr>
                <tr>
                  <td>Latitude</td>
                  <td>{deviceDetails.liveData.latitude}°</td>
                </tr>
                <tr>
                  <td>Longitude</td>
                  <td>{deviceDetails.liveData.longitude}°</td>
                </tr>
                <tr>
                  <td>Status</td>
                  <td>{deviceDetails.liveData.status}</td>
                </tr>
                <tr>
                  <td>Speed</td>
                  <td>{deviceDetails.liveData.speed} km/h</td>
                </tr>
                <tr>
                  <td>Time (Device)</td>
                  <td>{deviceDetails.liveData.devicetime}</td>
                </tr>
                <tr>
                  <td>Time (Server)</td>
                  <td>{deviceDetails.liveData.servertime}</td>
                </tr>
                <tr>
                  <td>Attributes</td>
                  <td>
                    <pre>
                      {JSON.stringify(
                        deviceDetails.liveData.attributes,
                        null,
                        2,
                      )}
                    </pre>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="modal-footer-custom">
        <button className="btn btn-secondary" onClick={handleClose}>
          Close
        </button>
        <button className="btn btn-primary" onClick={handleSave}>
          {deviceId ? "Update" : "Save"}
        </button>
      </div>
    </Modal>
  );
};

export default Device;
