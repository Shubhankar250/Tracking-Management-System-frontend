import type { AxiosResponse } from "axios";
import axiosClient from "./axiosClient";

/* =========================
   DTOs — MATCH BACKEND
========================= */

export interface SlotDTO {
  day: string;
  time: string;
  selected: boolean;
}

export interface AlertScheduleDTO {
  id?: number;
  status?: boolean;
  alertId?: number;
  data?: SlotDTO[];
}

export interface AlertDeviceMappingDTO {
  id?: number;
  alertId?: number;
  deviceIds?: number[];
}

export interface AlertDetailsDTO {
  id?: number;
  alertType?: string;

  overspeed?: number;
  stopDuration?: number;
  idleDuration?: number;
  lowspeed?: number;

  ignition?: string;
  sos?: boolean;
  vibration?: boolean;
  movement?: boolean;
  falldown?: boolean;
  lowpower?: boolean;
  lowbattery?: boolean;
  powercut?: boolean;
  powerrestored?: boolean;

  alertId?: number;

  driverChangeIds?: string[];
  driverChangeAuth?: boolean;

  poiStopDuration?: number;
  poiIdleDuration?: number;
  poiIds?: string[];

  adasEvents?: string[];
  dmsEvents?: string[];
  adasDmsCategory?: string[];
}

export interface AlertGeofenceMappingDTO {
  id?: number;
  alertId?: number;
  geofenceIds?: number[];
  geofenceInOut?: string;
}

export interface AlertNotificationDTO {
  id?: number;
  ignoreNotification?: number;
  soundNotification?: string;
  popupNotification?: string;
  appPushNotification?: boolean;
  emailNotification?: string;
  webhookNotification?: string;
  notificationColor?: string;
  alertId?: number;
}

export interface AlertDeviceCommandDTO {
  alertId?: number;
  commandName?: string;
}

export interface AlertUserDTO {
  id?: number;
  alertId?: number;
  user_ids?: number[];
}


export interface AlertRouteMappingDTO {
  id?: number;
  alertId?: number;
  routeIds?: number[];
  routeInOut?: string;
}

/* ===== MAIN ALERT DTO ===== */

export interface AlertSettingDTO {
  
  id?: number;
  alert_name?: string;

  alertDeviceMappingDTO?: AlertDeviceMappingDTO;
  alertDetailsDTO?: AlertDetailsDTO;
  alertGeofenceMappingDTO?: AlertGeofenceMappingDTO;
  alertNotificationDTO?: AlertNotificationDTO;
  alertScheduleDTO?: AlertScheduleDTO;
  alertDeviceCommandDTO?: AlertDeviceCommandDTO;
  alertUserDTO?: AlertUserDTO;
  alertRouteMappingDTO?: AlertRouteMappingDTO;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number; // current page (0-based)
  size: number;
}

/* =========================
   API CALLS
========================= */

export const getAllAlerts = (
  page: number,
  size: number,
  search: string
): Promise<AxiosResponse<PageResponse<any>>> =>
  axiosClient.get("/alerts", {
    params: {
      page,
      size,
      search
    },
  });

export const getAlertById = (
  id: number
): Promise<AxiosResponse<AlertSettingDTO>> =>
  axiosClient.get(`/alerts/${id}`);

export const createAlert = (
  data: AlertSettingDTO
): Promise<AxiosResponse<string>> =>
  axiosClient.post("/alerts", data);

export const updateAlert = (
  data: AlertSettingDTO
): Promise<AxiosResponse<{ message: string }>> =>
  axiosClient.put("/alerts/updateAlert", data);


export const deleteAlert = (
  id: number
): Promise<AxiosResponse<{ message: string }>> =>
  axiosClient.delete(`/alerts/${id}`);


  export const toggleAlertStatus = (
  id: number
): Promise<AxiosResponse<{ message: string }>> =>
  axiosClient.put(`/alerts/${id}/changeAlertStatus`);

  export const getCommandNames = (
  alertType: string
): Promise<AxiosResponse<string[]>> =>
  axiosClient.get("/alerts/command-names", {
    params: {
      alertType,
    },
  });