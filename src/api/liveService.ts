import type { AxiosResponse } from "axios";
import axiosClient from "./axiosClient";

/* =========================
   AlertDTO
========================= */
export interface AlertDTO {
  alert_type: string;
  alert_time: string; // LocalDateTime -> string
  speed:number;
}

/* =========================
   MaintenanceView
========================= */
export interface MaintenanceView {
  lastServiceDate: string;   // LocalDate -> string
  lastServiceKm: number;
  serviceName: string;
}

/* =========================
   DriverView
========================= */
export interface DriverDeviceView {
  id: number;
  name: string;
}

export interface DriverView {
  id: number;
  name: string;
  device: DriverDeviceView;
  rfid:string;
  email:string;
  phone:number;

}

/* =========================
   DeviceSettingCustomBean
========================= */
export interface DeviceSettingCustomBean {
  icon_type: string;
  moving_icon_color: string;
  stopped_icon_color: string;
  offline_icon_color: string;
  engine_idle_color: string;
  img_icon_name: string;
  img_icon_type: string;
}

/* =========================
   LiveDataDto
========================= */
export interface LiveDataDto {
  device_name: string;
  device_id: number;
  group_id: number;
  group_name: string;

  devicetime: string;
  servertime: string;

  lastidletime: string;
  lastmovementtime: string;

  course: number;
  attributes: string;
  vehicle_status: string;
  status: string;

  latitude: number;
  longitude: number;
  altitude: number;
  speed: number;

  address: string;
  ignition: boolean;

  last_command: string;
  satelite: number;
  ac: boolean;
  fuel: number;
  power: number;

  engine_status: string;
  parking: string;

  battery: number;
  distance: number;
  motion: boolean;

  tail: string;
  tail_width: number;
  min_moving_speed: number;

  events: AlertDTO[];

  service_name: string;
  last_service_date: string;
  last_service_km: number;

  services: MaintenanceView[];

  filter_status: string;
  objectIcon: string;

  drivers: DriverView[];

  deviceSetting: DeviceSettingCustomBean;

uniqueid:String;
simCardNumber:  String;
deviceModel: String;
modalType: string;
devicetimezone: string;
}

/* =========================
   API CALL
========================= */

/**
 * Get Live Devices Data
 * @param date optional (yyyy-MM-dd). If empty, backend uses today.
 */

export const getLiveDevices = (
  date?: string
): Promise<AxiosResponse<LiveDataDto[]>> => {
  return axiosClient.get("/devices/live/devices", {
    params: { date: date ?? "" },
  });
};
