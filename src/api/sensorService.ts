import axiosClient from "./axiosClient";

/* ================= TYPES ================= */

export interface SensorTypeDTO {
  id: number;
  sensorTypeName: string;
  calibrationRequired: boolean;
  type: string;
}

export interface CalibrationDetailDTO {
  x: number; 
  y: number; 
}

export interface DeviceSensorMappingDTO {
  id: number;
  name: string;
  sensor_type_id: number;
  parameter: string;
  type: string;
  unit_of_measurement: string;
  if_sensor_1: string;
  if_sensor_0: string;
  formula: string;
  lowest_value: number;
  highest_value: number;
  ignore_ignition_off: boolean;
  device_id: number;
  user_id: number;
  admin_id: number;
  sensor_type_name: string;
  icon_name: string;
  calibrationData: CalibrationDetailDTO[];
}
export interface DeviceSensorSaveDTO {
  id?: number;
  name: string;
  type: string;
  parameter: string;
  unit_of_measurement: string;
  if_sensor_1: string;
  if_sensor_0: string;
  formula: string;
  lowest_value: number;
  highest_value: number;
  ignore_ignition_off: boolean;
  device_id: number;
}

export interface SensorSaveDTO {
  calibratedDetailBean: { x: number; y: number }[];
  deviceSensorMappingBean: DeviceSensorSaveDTO;
}

export interface SensorDTO {
  calibratedDetailBean: CalibrationDetailDTO[];
  deviceSensorMappingBean: DeviceSensorMappingDTO;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

/* ================= API CALLS ================= */

/* GET all sensors */
export const listSensors = async (
  deviceId: number,
  page: number,
  size: number
): Promise<PageResponse<DeviceSensorMappingDTO>> => {
  const response = await axiosClient.get(
    `/sensors?deviceId=${deviceId}&page=${page}&size=${size}`
  );
  return response.data;
};

/* GET sensor by ID */
export const getSensorById = async (
  sensorId: number
): Promise<DeviceSensorMappingDTO> => {
  const response = await axiosClient.get<DeviceSensorMappingDTO>(
    `/sensors/${sensorId}`
  );
  return response.data;
};

/* GET sensor types */
export const getSensorTypes = async (): Promise<SensorTypeDTO[]> => {
  const response = await axiosClient.get<SensorTypeDTO[]>("/sensors/types");
  return response.data;
};

/* GET sensor attributes by device */
export const getSensorAttributes = async (
  deviceId: number
): Promise<Record<string, any>> => {
  const response = await axiosClient.get<Record<string, any>>(
    `/sensors/attributes?device_id=${deviceId}`
  );
  return response.data;
};

/* CREATE sensor */
export const createSensor = async (payload: SensorSaveDTO) => {
  const response = await axiosClient.post("/sensors", payload, {
    headers: { "Content-Type": "application/json" },
  });
  return response.data;
};

/* UPDATE sensor */
export const updateSensor = async (payload: SensorSaveDTO) => {
  const response = await axiosClient.put("/sensors", payload, {
    headers: { "Content-Type": "application/json" },
  });
  return response.data;
};

/* DELETE sensor */
export const deleteSensor = async (sensorId: number) => {
  const response = await axiosClient.delete(`/sensors/${sensorId}`);
  return response.data;
};
