import type { AxiosResponse } from "axios";
import axiosClient from "./axiosClient";

/* =========================
   NotificationDTO
========================= */
export interface NotificationDTO {
  deviceId: number;
  userId: number;

  deviceName: string;
  alertType: string;
  message: string;
  address: string;

  latitude: number;
  longitude: number;
  speed: number;
  course: number;
  altitude: number;

  attributes: string;
  status: string;
  alertTime: string;

  popupNotification?: string;
  soundNotification?: string;
  notificationColor?: string;
}



/* =========================
   API CALLS
========================= */

/**
 * Get All Events
 * @param date optional (yyyy-MM-dd)
 * @param alertType optional
 */
export const getAllEvents = (
  stime?: string,
  etime?: string,
  alertType?: string,
  deviceIds?: number[]
): Promise<AxiosResponse<NotificationDTO[]>> => {
  return axiosClient.get("/getAllEvents", {
    params: {
      ...(stime && { stime }),
      ...(etime && { etime }),
      ...(alertType && { alert_type: alertType }),
      ...(deviceIds && deviceIds.length > 0 && {
        deviceIds: deviceIds.join(","),
      }),
    },
  });
};
/**
 * Get Recent Events (Popup)
 * @param start required
 * @param end required
 */
export const getRecentEvents = (
  start: string,
  end: string
): Promise<AxiosResponse<NotificationDTO[]>> => {
  return axiosClient.get("/recentEvents", {
    params: {
      start,
      end,
    },
  });
};
