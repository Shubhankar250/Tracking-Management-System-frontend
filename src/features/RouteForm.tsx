import React, { useEffect, useState } from "react";
import type { RoutesDTO } from "../api/routeService";
import { toast } from "react-toastify";

type RouteFormData = Omit<RoutesDTO, "geom" | "buffergeom">;

interface Props {
  initialData?: RoutesDTO;
  routeGroups: string[];
  onSubmit: (data: RouteFormData) => void;
  onCancel: () => void;
  onOpenRouteGroup: () => void;
  onShapeSelect: (type: "route" | null) => void;
  geom?: any; // ✅ comes from parent
}

const emptyForm: RouteFormData = {
  name: "",
  description: "",
  group: "",
  buffer: 0,
};

const RouteForm: React.FC<Props> = ({
  initialData,
  routeGroups,
  onSubmit,
  onCancel,
  onOpenRouteGroup,
  onShapeSelect,
  geom,
}) => {
  const [data, setData] = useState<RouteFormData>(emptyForm);
  const [errors, setErrors] = useState<any>({});

  /* =========================
     Sync form (edit / add)
  ========================= */
  useEffect(() => {
    if (initialData) {
      const { geom, buffergeom, ...rest } = initialData;
      setData(rest);
    } else {
      setData(emptyForm);
    }
  }, [initialData]);

  /* =========================
     Validation
  ========================= */
  const validate = () => {
    let newErrors: any = {};

    if (!data.name?.trim()) {
      newErrors.name = "Route name is required";
    }

    if (!data.group) {
      newErrors.group = "Route group is required";
    }

    if (data.buffer === null || data.buffer === undefined) {
      newErrors.buffer = "Buffer is required";
    }

    setErrors(newErrors);

    // ❗ Stop if field errors
    if (Object.keys(newErrors).length > 0) return false;

    // ✅ FIX: use latest geom from props
    if (!data.id && !geom) {
      toast.error("Please draw route on the map");
      return false;
    }

    return true;
  };

  /* =========================
     Handle change
  ========================= */
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    setData((prev) => ({
      ...prev,
      [name]: name === "buffer" ? Number(value) : value,
    }));

    // ✅ clear error instantly
    setErrors((prev: any) => ({
      ...prev,
      [name]: "",
    }));
  };

  return (
    <div className="route-side-form">
      <style>
        {`
        .route-field input:focus,
        .route-field select:focus {
          outline: none;
          border: 1px solid #2563eb;
        }

        .route-error {
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

      {/* Hint */}
      {!initialData && (
        <div className="route-hint">
          Draw a route on the map first.
        </div>
      )}

      {/* NAME */}
      <div className="route-field">
        <label>Name</label>
        <input
          name="name"
          value={data.name}
          placeholder="Enter route name"
          onChange={handleChange}
        />
        {errors.name && <div className="route-error">{errors.name}</div>}
      </div>

      {/* GROUP */}
      <div className="route-field">
        <label>Group</label>
        <div className="route-group-row">
          <select name="group" value={data.group} onChange={handleChange}>
            <option value="">Select a group</option>
            {routeGroups.map((g, i) => (
              <option key={i} value={g}>
                {g}
              </option>
            ))}
          </select>

          <button
            type="button"
            className="route-plus-btn"
            onClick={onOpenRouteGroup}
          >
            <i className="fas fa-plus"></i>
          </button>
        </div>
        {errors.group && <div className="route-error">{errors.group}</div>}
      </div>

      {/* DESCRIPTION */}
      <div className="route-field">
        <label>Description</label>
        <input
          name="description"
          value={data.description ?? ""}
          placeholder="Enter description"
          onChange={handleChange}
        />
      </div>

      {/* BUFFER */}
      <div className="route-field">
        <label>Buffer (meters)</label>
        <input
          name="buffer"
          type="number"
          value={data.buffer ?? 0}
          onChange={handleChange}
        />
        {errors.buffer && <div className="route-error">{errors.buffer}</div>}
      </div>

      {/* ACTIONS */}
      <div className="route-actions">
        <button
          className="route-btn route-btn-gray"
          onClick={() => {
            onShapeSelect(null);
            onCancel();
          }}
        >
          Close
        </button>

        <button
          className="route-btn route-btn-blue"
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

export default RouteForm;