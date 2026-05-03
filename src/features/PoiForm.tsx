import React, { useEffect, useRef, useState } from "react";
import type { PoiDTO } from "../api/poiService";
import { markerIcons } from "../utils/markerIcons";
import { toast } from "react-toastify";
import "../assets/css/poi.css";

interface Props {
  initialData?: PoiDTO;
  poiGroups: Record<number, string>;
  onSubmit: (data: PoiDTO) => void;
  onCancel: () => void;
  onOpenGroupModal: () => void;
  onShapeSelect: (type: "poi" | null) => void;
  tempLocation?: { latitude: number; longitude: number } | null;
}

const emptyForm: PoiDTO = {
  name: "",
  description: "",
  poiGroupId: undefined,
  markerIcon: "",
  radius: 0,
  latitude: 0,
  longitude: 0,
};

const PoiForm: React.FC<Props> = ({
  initialData,
  poiGroups,
  onSubmit,
  onCancel,
  onOpenGroupModal,
  onShapeSelect,
  tempLocation,
}) => {
  const [data, setData] = useState<PoiDTO>(emptyForm);
  const [errors, setErrors] = useState<any>({});
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  /* =========================
     Sync form (edit / add)
  ========================= */
  useEffect(() => {
    if (initialData) {
      setData(initialData);
    } else {
      setData(emptyForm);
    }
  }, [initialData]);

  /* =========================
     Sync map location
  ========================= */
  useEffect(() => {
    if (!tempLocation) return;

    setData((prev) => ({
      ...prev,
      latitude: tempLocation.latitude,
      longitude: tempLocation.longitude,
    }));
  }, [tempLocation]);

  /* =========================
     Validation (same as route)
  ========================= */
  const validate = () => {
    let newErrors: any = {};

    if (!data.name?.trim()) {
      newErrors.name = "POI name is required";
    }

    if (!data.poiGroupId) {
      newErrors.poiGroupId = "POI group is required";
    }

    if (data.radius === null || data.radius === undefined) {
      newErrors.radius = "Radius is required";
    }

    if (!data.markerIcon) {
      newErrors.markerIcon = "Marker icon is required";
    }

    setErrors(newErrors);

    // ❌ stop if field errors
    if (Object.keys(newErrors).length > 0) return false;

    // ❗ same as route geom check
    if (!data.id && (!data.latitude || !data.longitude)) {
      toast.error("Please select location on map");
      return false;
    }

    return true;
  };

  /* =========================
     Handle change
  ========================= */
  const handleChange = (
    name: keyof PoiDTO,
    value: any
  ) => {
    setData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // clear error instantly
    setErrors((prev: any) => ({
      ...prev,
      [name]: "",
    }));
  };

  /* =========================
     Close dropdown on outside
  ========================= */
  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  const selectedIcon = markerIcons.find(
    (i) => i.name === data.markerIcon
  );

  return (
    <div className="poi-side-form">
      <style>
        {`
        .poi-field input:focus,
        .poi-field select:focus {
          outline: none;
          border: 1px solid #2563eb;
        }

        .poi-error {
          color: red;
          font-size: 12px;
          margin-top: 4px;
        }
      `}
      </style>

      {/* ❌ CLOSE */}
      <button
        type="button"
        onClick={() => {
          onShapeSelect(null);
          onCancel();
        }}
        style={{
          position: "absolute",
          top: "30px",
          right: "10px",
          backgroundColor: "white",
          color: "red",
          border: "none",
          marginTop: "63px",
          marginRight: "-9px",
          width: "35px",
          height: "25px",
          cursor: "pointer",
          fontSize: "20px",
          fontWeight: "bold",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        ×
      </button>

      {!initialData && (
        <div className="poi-hint">
          Click on map to select location.
        </div>
      )}

      {/* NAME */}
      <div className="poi-field">
        <label>Name</label>
        <input
          value={data.name}
          onChange={(e) => handleChange("name", e.target.value)}
        />
        {errors.name && <div className="poi-error">{errors.name}</div>}
      </div>

      {/* GROUP */}
      <div className="poi-field">
        <label>Group</label>
        <div className="poi-group-row">
          <select
            value={data.poiGroupId ?? ""}
            onChange={(e) =>
              handleChange("poiGroupId", Number(e.target.value))
            }
          >
            <option value="">Select group</option>
            {Object.entries(poiGroups).map(([id, name]) => (
              <option key={id} value={id}>
                {name}
              </option>
            ))}
          </select>

          <button
            type="button"
            className="poi-plus-btn"
            onClick={onOpenGroupModal}
          >
            <i className="fas fa-plus"></i>
          </button>
        </div>
        {errors.poiGroupId && (
          <div className="poi-error">{errors.poiGroupId}</div>
        )}
      </div>

      {/* DESCRIPTION */}
      <div className="poi-field">
        <label>Description</label>
        <input
          value={data.description ?? ""}
          onChange={(e) =>
            handleChange("description", e.target.value)
          }
        />
      </div>

      {/* RADIUS */}
      <div className="poi-field">
        <label>Radius (meters)</label>
        <input
          type="number"
          value={data.radius ?? 0}
          onChange={(e) =>
            handleChange("radius", Number(e.target.value))
          }
        />
        {errors.radius && (
          <div className="poi-error">{errors.radius}</div>
        )}
      </div>

      {/* ICON */}
      <div className="poi-field">
        <label>Marker Icon</label>

        <div className="icon-only-dropdown" ref={ref}>
          <div
            className="icon-selected"
            onClick={() => setOpen((o) => !o)}
          >
            {selectedIcon ? (
              <img src={selectedIcon.src} />
            ) : (
              <span className="icon-placeholder">
                Select Marker Icon
              </span>
            )}
            <span className="arrow">▾</span>
          </div>

          {open && (
            <div className="icon-list">
              {markerIcons.map((icon) => (
                <div
                  key={icon.name}
                  className={`icon-item ${
                    data.markerIcon === icon.name ? "active" : ""
                  }`}
                  onClick={() => {
                    handleChange("markerIcon", icon.name);
                    setOpen(false);
                  }}
                >
                  <img src={icon.src} />
                </div>
              ))}
            </div>
          )}
        </div>

        {errors.markerIcon && (
          <div className="poi-error">{errors.markerIcon}</div>
        )}
      </div>

      {/* ACTIONS */}
      <div className="poi-actions">
        <button
          className="poi-btn poi-btn-gray"
          onClick={() => {
            onShapeSelect(null);
            onCancel();
          }}
        >
          Close
        </button>

        <button
          className="poi-btn poi-btn-blue"
          onClick={() => {
            if (validate()) {
              onSubmit(data);
            }
          }}
        >
          {data.id ? "Update" : "Save"}
        </button>
      </div>
    </div>
  );
};

export default PoiForm;