import axiosClient from "./axiosClient";

export interface DeviceSettingCustomBean {
  icon_type: string;
  moving_icon_color: string;
  stopped_icon_color: string;
  offline_icon_color: string;
  engine_idle_color: string;
  img_icon_name: string;
  img_icon_type: string;
}
export interface LiveDataBean {
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
  gps_status: string;
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
  min_moving_speed: string;

  service_name: string;
  last_service_date: string;
  last_service_km: number;

 

  filter_status: string;
  objectIcon: string;

  channelNo:number;

  deviceSetting: DeviceSettingCustomBean;
  uniqueid:string
}
	    
export const getLiveDataByDeviceId = (deviceId: number) => {
  return axiosClient.get<LiveDataBean>("/devices/livedataByDeviceId", {
    params: { deviceId },
  });
};