import { useEffect, useState } from "react";
import type {
  DeviceSensorMappingDTO,
  SensorSaveDTO,
} from "../api/sensorService";
import Datatable, { type Column } from "../components/common/DatatableNew";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import {
  createNewSensor,
  deleteExistingSensor,
  fetchSensors,
  updateExistingSensor,
} from "../slices/sensorsSlice";
import { FaEdit, FaTrash } from "react-icons/fa";
import SensorModal from "./SensorModal";
import type { SensorForm } from "./SensorModal";

interface Props {
  deviceId: number;
}

const DeviceSensors = ({ deviceId }: Props) => {
  const dispatch = useAppDispatch();
  const { sensors, loading, totalElements } = useAppSelector(
    (state) => state.sensors,
  );

  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"add" | "edit">("add");
  const [selected, setSelected] = useState<SensorForm | undefined>();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [search, setSearch] = useState("");

  /* fetch sensors */
  useEffect(() => {
    if (deviceId) {
      dispatch(fetchSensors({ deviceId, page: page - 1, size: pageSize }));
    }
  }, [deviceId, page, pageSize, dispatch]);

  /* filter by device */
  const deviceSensors = sensors;

  const mapFormToPayload = (
    form: SensorForm,
    deviceId: number,
  ): SensorSaveDTO => ({
    calibratedDetailBean: form.calibration.map((c) => ({
      x: Number(c.x),
      y: Number(c.y),
    })),
    deviceSensorMappingBean: {
      id: form.id,
      name: form.name,
      type: form.type,
      parameter: form.parameter,
      unit_of_measurement: form.unit,
      if_sensor_1: form.if1,
      if_sensor_0: form.if0,
      formula: form.formula,
      lowest_value: Number(form.min || 0),
      highest_value: Number(form.max || 0),
      ignore_ignition_off: form.ignoreIgnition,
      device_id: deviceId,
    },
  });
  /* map DTO → modal form */
  const mapDtoToForm = (row: DeviceSensorMappingDTO): SensorForm => ({
    id: row.id,
    name: row.name ?? "",
    type: row.type ?? "",
    parameter: row.parameter ?? "",
    resultType: "",
    unit: row.unit_of_measurement ?? "",
    if1: row.if_sensor_1 ?? "",
    if0: row.if_sensor_0 ?? "",
    formula: row.formula ?? "",
    min: row.lowest_value?.toString() ?? "",
    max: row.highest_value?.toString() ?? "",
    ignoreIgnition: row.ignore_ignition_off ?? false,
    calibration:
      row.calibrationData?.map((c) => ({
        x: c.x.toString(),
        y: c.y.toString(),
      })) ?? [],
  });

  /* table columns */
  const columns: Column<DeviceSensorMappingDTO>[] = [
    { key: "name", label: "Sensor Name" },
    { key: "type", label: "Type" },
    { key: "parameter", label: "Parameter" },
    {
      key: "action",
      label: "Action",
      render: (row) => (
        <div style={{ display: "flex", gap: 10 }}>
          <FaEdit
            style={{ cursor: "pointer", color: "#2563eb" }}
            onClick={() => {
              setMode("edit");
              setSelected(mapDtoToForm(row));
              setOpen(true);
            }}
          />
          <FaTrash
            style={{ cursor: "pointer", color: "#dc2626" }}
            onClick={() => {
              if (confirm("Delete this sensor?")) {
                console.log("delete", row.id);
                dispatch(deleteExistingSensor({ sensorId: row.id, deviceId }));
              }
            }}
          />
        </div>
      ),
    },
  ];

  if (loading) {
    return (
      <div style={{ padding: "2rem", textAlign: "center" }}>
        Loading sensors...
      </div>
    );
  }

  return (
    <div className="sensor-tab">
      {/* ADD BUTTON */}
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
        }}
      >
        <button
          style={{
            backgroundColor: "#066fd1",
            color: "#fff",
            border: "none",
            padding: "6px 10px",
            borderRadius: "5px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "14px",
            transition: "background 0.2s",
          }}
          onClick={() => {
            setMode("add");
            setSelected(undefined);
            setOpen(true);
          }}
        >
          <i className="fas fa-plus"></i>
        </button>
      </div>

      {/* TABLE */}
      {/*<Datatable columns={columns} data={deviceSensors} pageSize={5} />*/}
      <Datatable
        columns={columns}
        data={deviceSensors}
        totalRecords={totalElements}
        pageSize={pageSize}
        page={page}
        search={search}
        onPageChange={(p) => setPage(p)}
        onSearchChange={(s) => {
          setSearch(s);
          setPage(1);
        }}
        onPageSizeChange={(size) => {
          setPageSize(size);
          setPage(1);
        }}
      />

      {/* MODAL */}
      <SensorModal
        isOpen={open}
        mode={mode}
        deviceId={deviceId}
        initialData={selected}
        onClose={() => setOpen(false)}
        onSave={(form) => {
          const payload = mapFormToPayload(form, deviceId);

          if (mode === "add") {
            dispatch(createNewSensor({ payload, deviceId }));
          } else {
            dispatch(updateExistingSensor({ payload, deviceId }));
          }

          setOpen(false);
        }}
      />
    </div>
  );
};

export default DeviceSensors;
