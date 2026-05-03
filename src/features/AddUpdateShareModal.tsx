import { useEffect, useState, useMemo, useRef } from "react";
import Select from "react-select";
import Modal from "../components/common/Modal";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import type { SharePositionDTO } from "../api/sharePositionService";
import { clearSelectedShare, fetchShares } from "../slices/sharePositionSlice";
import CustomMultiValueContainer, {
  CustomOption,
} from "../components/common/CustomMultiValueContainer";
import {
  createShareThunk,
  fetchShareById,
  updateShareThunk,
} from "../slices/sharePositionSlice";

import "../assets/css/SharePositionModal.css";
import type { ScheduleSlot } from "./WeeklyScheduleGrid";
import WeeklyScheduleGrid from "./WeeklyScheduleGrid";
import { toast } from "react-toastify";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  shareToEdit?: SharePositionDTO;
}

interface DeviceOption {
  value: string;
  label: string;
}

function convertScheduleToSlotBean(data: ScheduleSlot[]) {
  return data.map((s) => ({
    day: String((s.day + 1) % 7),
    time: String(s.slot),
    selected: true,
  }));
}

const AddUpdateShareModal = ({ isOpen, onClose, shareToEdit }: Props) => {
  const dispatch = useAppDispatch();
  const devicesFromStore = useAppSelector((s) => s.live.devices);

  const devices: DeviceOption[] = useMemo(
    () =>
      devicesFromStore.map((d) => ({
        value: String(d.device_id),
        label: d.device_name,
      })),
    [devicesFromStore],
  );

  const selectedShare = useAppSelector((s) => s.sharePosition.selected);
  const isEditMode = !!shareToEdit?.id;

  const [form, setForm] = useState<SharePositionDTO>({
    status: true,
    deviceId: "",
    validTime: "none",
    email: "",
    phone: "",
    deleteAfterExpiration: false,
    sharePositionScheduleBean: { status: true, data: [] },
    name: "",
  });

  const [selectedDevices, setSelectedDevices] = useState<DeviceOption[]>([]);
  const [expireDate, setExpireDate] = useState<Date | null>(null);
  const [durationMinutes, setDurationMinutes] = useState<number>(60);
  const [generatedURL, setGeneratedURL] = useState("");
  const [accessCode, setAccessCode] = useState<number | null>(null);
const [errors, setErrors] = useState({
  name: "",
  devices: "",
  phone: "",
});
  const [page] = useState(1);
  const [pageSize] = useState(10);
  const [search] = useState("");
  const deviceOptionsWithAll = [{ value: "all", label: "All" }, ...devices];
  const [deviceMenuOpen, setDeviceMenuOpen] = useState(false);
  const deviceSelectRef = useRef<any>(null);
  useEffect(() => {
    const handleClickOutside = (e: any) => {
      if (
        deviceSelectRef.current &&
        !deviceSelectRef.current.contains(e.target)
      ) {
        setDeviceMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  /* ================= Access Code ================= */
  useEffect(() => {
    if (isEditMode && selectedShare?.accessCode) {
      setAccessCode(selectedShare.accessCode);
      setGeneratedURL(
        `${window.location.origin}/weblive?uc=${selectedShare.accessCode}`,
      );
    } else if (!isEditMode) {
      const code = Math.floor(10000 + Math.random() * 90000);
      setAccessCode(code);
      setGeneratedURL(`${window.location.origin}/weblive?uc=${code}`);
    }
  }, [isEditMode, selectedShare]);

  useEffect(() => {
    if (isOpen && shareToEdit?.id) {
      dispatch(fetchShareById(shareToEdit.id));
    }
  }, [isOpen, shareToEdit, dispatch]);

  /* ================= Prefill ================= */
  useEffect(() => {
    if (isEditMode && selectedShare) {
      setForm({
        ...selectedShare,
        validTime: selectedShare.validTime || "none",
        sharePositionScheduleBean: selectedShare.sharePositionScheduleBean || {
          status: true,
          data: [],
        },
      });

      const devicesArray: DeviceOption[] = selectedShare.deviceId
        ? selectedShare.deviceId.split(",").map((id) => {
            const device = devices.find((d) => d.value === id);
            return device || { value: id, label: "Unknown" };
          })
        : [];

      setSelectedDevices(devicesArray);

      setExpireDate(
        selectedShare.accessEndTime
          ? new Date(selectedShare.accessEndTime)
          : null,
      );

      if (
        selectedShare.validTime === "duration" &&
        selectedShare.accessStartTime &&
        selectedShare.accessEndTime
      ) {
        const diffMs =
          new Date(selectedShare.accessEndTime).getTime() -
          new Date(selectedShare.accessStartTime).getTime();
        setDurationMinutes(Math.round(diffMs / 60000));
      }
    } else {
      resetForm();
    }
  }, [selectedShare, isEditMode]);

  const resetForm = () => {
    setForm({
      status: true,
      deviceId: "",
      validTime: "none",
      email: "",
      phone: "",
      deleteAfterExpiration: false,
      sharePositionScheduleBean: { status: true, data: [] },
      name: "",
    });
    setSelectedDevices([]);
    setExpireDate(null);
    setDurationMinutes(60);
  };

  const handleChange = <K extends keyof SharePositionDTO>(
    field: K,
    value: SharePositionDTO[K],
  ) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };
  const formatLocal = (d: Date) => {
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(
      d.getDate(),
    )} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
  };
  /* ================= Date Picker Logic ================= */
  const toLocalDateTimeInput = (date: Date | null) => {
    if (!date) return "";

    const pad = (n: number) => String(n).padStart(2, "0");

    return (
      date.getFullYear() +
      "-" +
      pad(date.getMonth() + 1) +
      "-" +
      pad(date.getDate()) +
      "T" +
      pad(date.getHours()) +
      ":" +
      pad(date.getMinutes()) +
      ":" +
      pad(date.getSeconds())
    );
  };

  /* ================= Save ================= */
  const handleSave = async () => {
  let newErrors = {
    name: "",
    devices: "",
    phone: "",
  };

  if (!form.name) newErrors.name = "Name is required";
  if (selectedDevices.length === 0)
    newErrors.devices = "Please select at least one object";

  if (form.phone) {
    if (!/^\d{10,14}$/.test(form.phone)) {
      newErrors.phone = "Phone must be 10 to 14 digits";
    }
  }

  setErrors(newErrors);

  // ❌ stop if any error
  if (newErrors.name || newErrors.devices || newErrors.phone) return;

  // 👉 rest same (no change below)

    const deviceIds = selectedDevices.map((d) => d.value).join(",");

    let accessStart: string | undefined;
    let accessEnd: string | undefined;

    const now = new Date();

    if (form.validTime === "duration") {
      accessStart = formatLocal(now);
      accessEnd = formatLocal(
        new Date(now.getTime() + durationMinutes * 60000),
      );
    } else if (form.validTime === "date" && expireDate) {
      accessStart = formatLocal(now);
      accessEnd = formatLocal(expireDate);
    }

    const payload: SharePositionDTO = {
      ...form,
      deviceId: deviceIds,
      accessStartTime: accessStart,
      accessEndTime: accessEnd,
      accessCode: accessCode ?? undefined,
      baseUrl: generatedURL,
    };

    if (isEditMode) {
      await dispatch(updateShareThunk(payload));
      toast.success("Updated successfully");
    } else {
      await dispatch(createShareThunk(payload));
      toast.success("Created successfully");
    }

    dispatch(fetchShares({ page: page - 1, size: pageSize, search }));

    resetForm();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      title={isEditMode ? "Update Share" : "New Share"}
      size="large"
      onClose={() => {
        resetForm();
        dispatch(clearSelectedShare());
        onClose();
      }}
    >
      <form className="share-modal-form">
        <div className="form-body">
          {/* Status */}
          <div className="row">
            <label className="checkbox-group">
              <input
                type="checkbox"
                checked={form.status}
                onChange={(e) => handleChange("status", e.target.checked)}
              />
              Active
            </label>
          </div>

          {/* Name + Device */}
          <div
            className="row"
            style={{ marginTop: "-10px", marginBottom: "5px" }}
          >
            <div className="form-group">
              <label>Name *</label>
            <input
  type="text"
  placeholder="Enter Name"
  value={form.name || ""}
  onChange={(e) => {
    handleChange("name", e.target.value);
    setErrors((prev) => ({ ...prev, name: "" }));
  }}
/>

{errors.name && <div className="error-text">{errors.name}</div>}
            </div>
 <div className="form-group">
              <label>Objects *</label>
           <div
           
  ref={deviceSelectRef}
  onMouseDown={() => {
    setDeviceMenuOpen(true);
  }}
>
 <Select
  isMulti
  options={deviceOptionsWithAll}
  value={selectedDevices}
  placeholder="Select Object"
  classNamePrefix="custom-select"
  hideSelectedOptions={false}
  closeMenuOnSelect={false}
  menuIsOpen={deviceMenuOpen}
  menuPortalTarget={document.body}
  styles={{
    menuPortal: (base) => ({
      ...base,
      zIndex: 9999,
    }),
    control: (base) => ({
      ...base,
      borderColor: "#d1d5db",
      boxShadow: "none",
      ":hover": {
        borderColor: "#d1d5db",
      },
    }),
    option: (base, state) => ({
  ...base,
  backgroundColor: state.isSelected
    ? "#2563eb"   // selected = blue
    : state.isFocused
      ? "#3b82f6" // hover = blue
      : "#fff",
  color: state.isSelected || state.isFocused ? "#fff" : "#111",
  cursor: "pointer",
  ":active": {
    ...base[":active"],
    backgroundColor: "#1d4ed8", // click darker blue
  },
}),
  }}
  onFocus={() => setDeviceMenuOpen(true)}
  onMenuClose={() => setDeviceMenuOpen(false)}
  onChange={(selected) => {
    const values = selected ? [...selected] : [];

    if (values.some((v) => v.value === "all")) {
      setSelectedDevices(devices);
    } else {
      setSelectedDevices(values.filter((v) => v.value !== "all"));
    }
  }}
  components={{
    ValueContainer: CustomMultiValueContainer,
    Option: CustomOption,
    MultiValue: () => null,
  }}
/>
{errors.devices && <div className="error-text">{errors.devices}</div>}

</div>
</div>
          </div>
          <div
            className="row"
            style={{ marginTop: "-10px", marginBottom: "5px" }}
          >
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                placeholder="Enter Email Address"
                value={form.email || ""}
                onChange={(e) => handleChange("email", e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Phone</label>
              <input
  type="text"
  placeholder="Enter Phone Number"
  value={form.phone || ""}
  onChange={(e) => {
    let value = e.target.value.replace(/\D/g, ""); // only digits

    if (value.length > 14) return; // max limit

    handleChange("phone", value);

    // live validation
    if (value && (value.length < 10 || value.length > 14)) {
      setErrors((prev) => ({
        ...prev,
        phone: "Phone must be 10 to 14 digits",
      }));
    } else {
      setErrors((prev) => ({ ...prev, phone: "" }));
    }
  }}
/>

{/* error */}
{errors.phone && <div className="error-text">{errors.phone}</div>}
            </div>
          </div>

          {/* Valid Time */}
          <div
            className="row"
            style={{ marginTop: "-10px", marginBottom: "5px" }}
          >
            <div className="form-group">
              <label>Valid Time</label>
              <select
                value={form.validTime}
                onChange={(e) => handleChange("validTime", e.target.value)}
              >
                <option value="none">None</option>
                <option value="duration">Duration</option>
                <option value="date">Date</option>
                <option value="custom">Custom</option>
              </select>
            </div>
            {/* URL */}
            <div className="form-group">
              <label>Share URL</label>
              <input value={generatedURL} readOnly />
            </div>
            {(form.validTime === "duration" || form.validTime === "date") && (
              <div className="checkbox-group">
                <input
                  type="checkbox"
                  checked={form.deleteAfterExpiration || false}
                  onChange={(e) =>
                    handleChange("deleteAfterExpiration", e.target.checked)
                  }
                />
                Delete after expiration
              </div>
            )}
          </div>

          {/* Contact */}

          {/* Duration */}
          {form.validTime === "duration" && (
            <div className="row">
              <div className="form-group">
                <label>Duration</label>
                <select
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(Number(e.target.value))}
                >
                  <option value={5}>5 min</option>
                  <option value={30}>30 min</option>
                  <option value={60}>1 hr</option>
                  <option value={120}>2 hr</option>
                  <option value={1440}>24 hr</option>
                </select>
              </div>
            </div>
          )}

          {/* Date */}
          {form.validTime === "date" && (
            <div className="row">
              <div className="form-group">
                <label>Expire On</label>
                <input
                  type="datetime-local"
                  step="1"
                  value={toLocalDateTimeInput(expireDate)}
                  onChange={(e) =>
                    setExpireDate(
                      e.target.value ? new Date(e.target.value) : null,
                    )
                  }
                  className="form-control"
                />
              </div>
            </div>
          )}

          {/* Custom */}
          {form.validTime === "custom" && (
            <WeeklyScheduleGrid
              initialData={
                form.sharePositionScheduleBean?.data?.map((d) => ({
                  day: Number(d.day),
                  slot: Number(d.time),
                })) || []
              }
              onChange={(data) => {
                const converted = convertScheduleToSlotBean(data);
                setForm((p) => ({
                  ...p,
                  sharePositionScheduleBean: {
                    status: true,
                    data: converted,
                  },
                }));
              }}
            />
          )}
        </div>

        {/* Footer */}
        <div className="modal-footer-custom">
          <button
            type="button"
            className="btn-gray"
            onClick={() => {
              resetForm();
              dispatch(clearSelectedShare());
              onClose();
            }}
          >
            Close
          </button>
          <button type="button" className="btn-blue" onClick={handleSave}>
            {isEditMode ? "Update" : "Save"}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default AddUpdateShareModal;
