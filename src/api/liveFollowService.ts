import axiosClient from "./axiosClient";

export interface AlertDTO {
  alert_type: string;
  alert_time: string; // LocalDateTime → string (ISO)
}

// Maintenance
export interface MaintenanceView {
  lastServiceDate: string; // LocalDate → string
  lastServiceKm: number;
  serviceName: string;
}

// Driver
export interface DriverView {
  id: number;
  name: string;
  email?: string;
  phone?: string;
  rfid?: string;
  device?: {
    id: number;
    name: string;
  };
}

// Device Setting
export interface DeviceSettingCustomBean {
  icon_type: string;
  moving_icon_color: string;
  stopped_icon_color: string;
  offline_icon_color: string;
  engine_idle_color: string;
  img_icon_name: string;
  img_icon_type: string;
}

// MAIN DTO
export interface LiveDataDto {
  device_name: string;
  device_id: number;
  group_id: number;
  group_name: string;
  uniqueid:string;
  devicetime: string;   // LocalDateTime
  servertime: string;   // LocalDateTime

  lastidletime: string;
  lastmovementtime: string;

  course: number;
  attributes: string;

  vehicle_status: string;
  gps_status: string;
  status: string;

  latitude: number;
  longitude: number;
  altitude: number;
  speed: number;

  address: string;
  simCardNumber: string;
  deviceModel: string;
  ignition: boolean;
  last_command: string | null;

  satelite: number;
  ac: boolean;
  fuel: number;
  power: number;

  engine_status: string | null;
  parking: string | null;

  battery: number;
  distance: number;
  motion: boolean;

  tail: string;
  tail_width: number;
  min_moving_speed: string;

  events: AlertDTO[];

  service_name: string;
  last_service_date: string;
  last_service_km: number;

  services: MaintenanceView[];
  filter_status: string | null;

  objectIcon: string;

  drivers: DriverView[];
modalType:String;
  deviceSetting: DeviceSettingCustomBean;
}

export const getLiveDataForFollow = async (
  deviceId: number,
  date?: string
): Promise<LiveDataDto> => {
  const response = await axiosClient.get<LiveDataDto>(
    "/devices/livedataforfollow",
    {
      params: {
        deviceId,
        date,
      },
    }
  );

  return response.data;
};
