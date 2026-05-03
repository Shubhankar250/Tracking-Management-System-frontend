import React, { useEffect, useState } from "react";
import type { GeofenceDTO } from "../api/geofenceService";
import { toast } from "react-toastify";
interface Props {
  initialData?: GeofenceDTO & { id?: number };
  geoGroups: string[];
  onSubmit: (data: GeofenceDTO & { id?: number }) => void;
  onCancel: () => void;
  onOpenGeoGroup: () => void;
  onShapeSelect: (type: "circle" | "polygon" | null) => void;
  geom?: any;
  radius?: number | null;
}


const GeofenceForm: React.FC<Props> = ({
  initialData,
  geoGroups,
  onSubmit,
  onCancel,
  onOpenGeoGroup,
  onShapeSelect,
  geom,
  radius,
}) => {
  const [data, setData] = useState<GeofenceDTO & { id?: number }>({
    pcts_name: "",
    pcts_type: "",
    geo_group: "",
    color: "#D000DF",
    speed_limit: "",
    radius: 0,
    geom: null,
    ...initialData,
  });
  useEffect(() => {
    if (geom !== undefined || radius !== undefined) {
      setData(p => ({
        ...p,
        geom: geom ?? null,
        radius: radius ?? 0,
      }));
    }
  }, [geom, radius]);


const [errors, setErrors] = useState<any>({});


const validate = () => {
  let newErrors: any = {};

  if (!data.pcts_name?.trim()) {
    newErrors.pcts_name = "Name is required";
  }

  if (!data.pcts_type) {
    newErrors.pcts_type = "Type is required";
  }

  if (!data.geo_group) {
    newErrors.geo_group = "Geo group is required";
  }

  if (!data.speed_limit) {
    newErrors.speed_limit = "Speed limit is required";
  } else if (isNaN(Number(data.speed_limit))) {
    newErrors.speed_limit = "Must be a number";
  }

  setErrors(newErrors);

  // ❗ stop if basic errors exist
  if (Object.keys(newErrors).length > 0) return false;

  // ✅ detect type change
  const isTypeChanged = initialData && data.pcts_type !== initialData.pcts_type;

  // ✅ CASE 1: New geofence
  if (!data.id && !data.geom) {
    toast.error("Please draw geofence on the map");
    return false;
  }

  // ✅ CASE 2: Update + type changed → must redraw
  if (data.id && isTypeChanged && !data.geom) {
    toast.error("Please redraw geofence after changing type");
    return false;
  }

  // ✅ CASE 3: Update + same type → allow old geom
  return true;
};
const handleChange = (
  e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
) => {
  const { name, value } = e.target;

  setData((p) => ({ ...p, [name]: value }));

  // ✅ Clear error when user starts typing/selecting
  setErrors((prev: any) => ({
    ...prev,
    [name]: "",
  }));
};

  return (
    <div className="geo-side-form">
    
      {/* ✅ LOCAL STYLE (ONLY THIS COMPONENT) */}
      <style>
        {`
          .geo-side-form input:focus,
          .geo-side-form select:focus,
          .geo-side-form textarea:focus {
            outline: none;
            border-color: #2563eb;
          }

           .geo-error {
      color: red;
      font-size: 12px;
      margin-top: 4px;
    }
        `}
      </style>
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
   marginTop:"63px",
   marginRight:"-9px",
    width: "35px",
    height: "25px",
    cursor: "pointer",
    fontSize: "20px",
    fontWeight: "bold",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  }
  
  
  }
>
  ×
</button>

      {!initialData && <div className="geo-hint">Select type and draw geofence on the map</div>}

      <div className="geo-field">
        <label>Name</label>
        <input
          name="pcts_name"
          placeholder="Enter geofence name"
          value={data.pcts_name}
          onChange={handleChange}
        />
        {errors.pcts_name && <div className="geo-error">{errors.pcts_name}</div>}
      </div>

      <div className="geo-field">
        <label>Type</label>
        <select
          name="pcts_type"
          value={data.pcts_type}
          onChange={(e) => {
            const value = e.target.value;

            // Clear existing geofence
            setData(p => ({
              ...p,
              pcts_type: value,
              geom: null,
              radius: 0,
            }));
// ✅ clear type error
  setErrors((prev: any) => ({
    ...prev,
    pcts_type: "",
  }));
            // Reset map
            onShapeSelect(null);

            // Enable new draw mode
            if (value === "circle" || value === "polygon") {
              onShapeSelect(value);
            }
          }}
        >
        

          <option value="">Select Type</option>
          <option value="circle">Circle</option>
          <option value="polygon">Polygon</option>
        </select>
        {errors.pcts_type && <div className="geo-error">{errors.pcts_type}</div>}
      </div>

      <div className="geo-field">
        <label>Geo Group</label>
        <div className="geo-group-row">
          <select name="geo_group" value={data.geo_group} onChange={handleChange}>
            <option value="">Select a group</option>
            {geoGroups.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
         
          <button type="button" className="geo-plus-btn" onClick={onOpenGeoGroup}>
            <i className="fas fa-plus"></i>
          </button>
          
        </div>
         {errors.geo_group && <div className="geo-error">{errors.geo_group}</div>}
      </div>

      <div className="geo-field">
        <label>Speed Limit</label>
        <input
          name="speed_limit"
          placeholder="Enter limit in km/h"
          value={data.speed_limit}
          onChange={handleChange}
        />
        {errors.speed_limit && <div className="geo-error">{errors.speed_limit}</div>}
      </div>

      <div className="geo-field">
        <label>Background Color</label>
        <input
          type="color"
          name="color"
          value={data.color}
          onChange={handleChange}
          className="geo-color"
        />
      </div>

      <div className="geo-actions">
        <button
          className="geo-btn geo-btn-gray"
          onClick={() => {
            onShapeSelect(null);
            onCancel();
          }}
        >
          Close
        </button>
    <button
  className="geo-btn geo-btn-blue"
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

export default GeofenceForm;
