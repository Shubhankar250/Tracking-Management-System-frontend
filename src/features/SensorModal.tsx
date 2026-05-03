import { useEffect, useState } from "react";
import Modal from "../components/common/Modal";
import "../assets/css/sensor.css";
import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "../redux/store";
import {
  fetchSensorTypes,
  fetchSensorAttributes,
} from "../slices/sensorsSlice";

/* ================= TYPES ================= */

interface CalibrationRow {
  x: string;
  y: string;
}

export interface SensorForm {
  id?: number;
  name: string;
  type: string;            // sensorTypeName
  parameter: string;       // attribute key
  resultType: string;
  unit: string;
  if1: string;
  if0: string;
  formula: string;
  min: string;
  max: string;
  ignoreIgnition: boolean;
  calibration: CalibrationRow[];
}

interface Props {
  isOpen: boolean;
  mode: "add" | "edit";
  deviceId: number;
  initialData?: SensorForm;
  onClose: () => void;
  onSave: (data: SensorForm) => void;
}

/* ================= DEFAULT FORM ================= */

const emptyForm: SensorForm = {
  name: "",
  type: "",
  parameter: "",
  resultType: "",
  unit: "",
  if1: "",
  if0: "",
  formula: "",
  min: "",
  max: "",
  ignoreIgnition: false,
  calibration: [],
};

/* ================= COMPONENT ================= */

const SensorModal = ({
  isOpen,
  mode,
  deviceId,
  initialData,
  onClose,
  onSave,
}: Props) => {
  const dispatch = useDispatch<AppDispatch>();

  const { sensorTypes, attributes } = useSelector(
    (state: RootState) => state.sensors
  );

  const [form, setForm] = useState<SensorForm>(emptyForm);

  /* ---------- LOAD MASTER DATA ---------- */
  useEffect(() => {
    if (isOpen) {
      dispatch(fetchSensorTypes());
      dispatch(fetchSensorAttributes(deviceId));
    }
  }, [isOpen, deviceId]);

  /* ---------- EDIT / ADD MODE ---------- */
  useEffect(() => {
    if (mode === "edit" && initialData) {
      setForm(initialData);
    } else {
      setForm(emptyForm);
    }
  }, [mode, initialData]);

  /* ---------- HELPERS ---------- */
  const updateField = (key: keyof SensorForm, value: any) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };
const getDisabledFields = (sensorType: string) => {
  switch (sensorType) {
    case "Battery":
    case "Fuel level":
    case "Temperature":
      return {
        if1: true,
        if0: true,
        min: true,
        max: true,
      };

    case "Fuel consumption":
      return {
        if1: true,
        if0: true,
        min: true,
        max: true,
        unit: true,
      };

    case "Ignition (ACC)":
      return {
        min: true,
        max: true,
        unit: true,
        formula: true,
      };

    case "Odometer":
      return {
        if1: true,
        if0: true,
        min: true,
        max: true,
        unit: true,
      };

    case "Custom":
      return {
        min: true,
        max: true,
        unit: true,
      };

    default:
      return {};
  }
};
const disabled = getDisabledFields(form.type);

  /* ---------- SENSOR TYPE SELECTED ---------- */
  const selectedSensorType = sensorTypes.find(
    (st) => st.sensorTypeName === form.type
  );

  const calibrationEnabledTypes  = [
  "Fuel level",
  "Temperature",
  "Battery",
];
const calibrationDisabled =
  form.type !== "" &&
  !calibrationEnabledTypes.includes(form.type);


  const resultTypeOptions: string[] = selectedSensorType
    ? JSON.parse(selectedSensorType.type)
    : [];

  /* ---------- ATTRIBUTE KEYS ---------- */
  const attributeKeys = attributes ? Object.keys(attributes) : [];

  /* ---------- AUTO-FILL FROM ATTRIBUTE ---------- */
  useEffect(() => {
    if (form.parameter && attributes?.[form.parameter]) {
      const attr = attributes[form.parameter];
      updateField("unit", attr.unitOfMeasurement ?? "");
      updateField("resultType", attr.resultType ?? "");
    }
  }, [form.parameter]);
useEffect(() => {
  if (selectedSensorType) {
    const parsedTypes: string[] = JSON.parse(selectedSensorType.type);

    // reset old value
    updateField("resultType", "");

    // auto select if only one
    if (parsedTypes.length === 1) {
      updateField("resultType", parsedTypes[0]);
    }
  }
}, [form.type]);
useEffect(() => {
  if (!isOpen) {
    setForm(emptyForm);
  }
}, [isOpen]);

  /* ---------- CALIBRATION ---------- */
  const addCalibrationRow = () => {
    updateField("calibration", [...form.calibration, { x: "", y: "" }]);
  };

  const updateCalibration = (
    index: number,
    key: "x" | "y",
    value: string
  ) => {
    const rows = [...form.calibration];
    rows[index][key] = value;
    updateField("calibration", rows);
  };

  const removeCalibration = (index: number) => {
    updateField(
      "calibration",
      form.calibration.filter((_, i) => i !== index)
    );
  };

  /* ================= RENDER ================= */

  return (
    <Modal
      isOpen={isOpen}
      title={mode === "add" ? "Add Sensor" : "Update Sensor"}
      size="large"
      draggable
      onClose={onClose}
    >
          <div className="sensor-modal-body">

      <div className="sensor-wrapper">

        {/* ================= LEFT PANEL ================= */}
        <div className="sensor-panel">
          <h3 className="panel-title">Sensor</h3>

          <div className="form-row">
            <label>Name</label>
            <input
              value={form.name}
              onChange={(e) => updateField("name", e.target.value)}
            />
          </div>

          <div className="form-row">
            <label>Sensor Type</label>
            <select
              value={form.type}
              onChange={(e) => {
                updateField("type", e.target.value);
                updateField("resultType", "");
                updateField("parameter", "");
              }}
            >
              <option value="">Select Type</option>
              {sensorTypes.map((st) => (
                <option key={st.id} value={st.sensorTypeName}>
                  {st.sensorTypeName}
                </option>
              ))}
            </select>
          </div>

          <div className="form-row">
            <label>Parameter</label>
            <select
              value={form.parameter}
              onChange={(e) => updateField("parameter", e.target.value)}
            >
              <option value="">Select Parameter</option>
              {attributeKeys.map((key) => (
                <option key={key} value={key}>
                  {key}
                </option>
              ))}
            </select>
          </div>

          <h3 className="panel-title">Result</h3>

          <div className="form-row">
            <label>Result Type</label>
            <select
  value={form.resultType}
  onChange={(e) => updateField("resultType", e.target.value)}
>
  <option value="">Select Result Type</option>
  {resultTypeOptions.map((rt) => (
    <option key={rt} value={rt}>
      {rt}
    </option>
  ))}
</select>

          </div>

          <div className="form-row">
            <label>Unit</label>
            <input
              value={form.unit}
              disabled={disabled.unit}
              onChange={(e) => updateField("unit", e.target.value)}
            />
          </div>

          <div className="form-row">
            <label>If sensor "1"</label>
            <input
              value={form.if1}
               disabled={disabled.if1}
              onChange={(e) => updateField("if1", e.target.value)}
            />
          </div>

          <div className="form-row">
            <label>If sensor "0"</label>
            <input
              value={form.if0}
                disabled={disabled.if0}
              onChange={(e) => updateField("if0", e.target.value)}
            />
          </div>

          <div className="form-row">
            <label>Formula</label>
            <input
              placeholder="(X+1)/2*3"
              value={form.formula}
               disabled={disabled.formula}
              onChange={(e) => updateField("formula", e.target.value)}
            />
          </div>

          <div className="form-row">
            <label>Min</label>
            <input
              value={form.min}
              disabled={disabled.min}
              onChange={(e) => updateField("min", e.target.value)}
            />
          </div>

          <div className="form-row">
            <label>Max</label>
            <input
              value={form.max}
               disabled={disabled.max}
              onChange={(e) => updateField("max", e.target.value)}
            />
          </div>

          <div className="checkbox-row">
            <input
              type="checkbox"
              checked={form.ignoreIgnition}
              onChange={(e) =>
                updateField("ignoreIgnition", e.target.checked)
              }
            />
            <span>Ignore if ignition is off</span>
          </div>
        </div>

        {/* ================= RIGHT PANEL ================= */}
<div className={`sensor-panel ${calibrationDisabled ? "disabled-panel" : ""}`}>
            <h3 className="panel-title">Calibration</h3>

            {form.calibration.map((row, i) => (
              <div className="calibration-row" key={i}>
                <span>X =</span>
                <input
                  value={row.x}
                  onChange={(e) =>
                    updateCalibration(i, "x", e.target.value)
                  }
                />
                <span>Y =</span>
                <input
                  value={row.y}
                  onChange={(e) =>
                    updateCalibration(i, "y", e.target.value)
                  }
                />
                <button
                  className="add-btn remove"
                  onClick={() => removeCalibration(i)}
                      disabled={calibrationDisabled}

                >
                  ✖
                </button>
              </div>
            ))}

            <button className="add-btn" onClick={addCalibrationRow}
            
                disabled={calibrationDisabled}
>
              +
            </button>
          </div>
        
      </div>
</div>
      {/* ================= FOOTER ================= */}
        <div className="modal-footer sensor-modal-footer">
    <button className="btn-gray" onClick={onClose}>
      Close
    </button>
    <button className="btn-blue" onClick={() => onSave(form)}>
      {mode === "add" ? "Insert" : "Update"}
    </button>
  </div>
    </Modal>
  );
};

export default SensorModal;
