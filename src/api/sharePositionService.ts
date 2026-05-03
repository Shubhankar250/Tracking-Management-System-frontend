import type { AxiosResponse } from "axios";
import axiosClient from "./axiosClient";

/* =========================
   DTOs
========================= */

export interface SlotBean {
  day: string;
  time: string;
  selected: boolean;
}

export interface SharePositionScheduleBean {
  id?: number;
  status: boolean;
  sharePositionId?: number;
  data: SlotBean[];
}

export interface SharePositionDTO {
  id?: number;
  accessStartTime?: string;
  accessEndTime?: string;

  accessCode?: number;
  userId?: number;
  adminId?: number;

  status: boolean;
  deviceId: string;

  createdOn?: string;
  baseUrl?: string;
  deviceName?: string;
  name?: string;
  validTime?: string;

  email?: string;
  phone?: string;
  deleteAfterExpiration?: boolean;

  sharePositionScheduleBean?: SharePositionScheduleBean;
}

export interface PageResponse<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  number: number;      // current page
  size: number;
}

/* =========================
   API CALLS
========================= */

/** Get all shares */
export const getAllShares = (
  page: number,
  size: number,
  search: string
): Promise<AxiosResponse<PageResponse<SharePositionDTO>>> => {
  return axiosClient.get("/share-positions", {
    params: { page, size, search },
  });
};

/** Get share by ID */
export const getShareById = (
  id: number
): Promise<AxiosResponse<SharePositionDTO>> => {
  return axiosClient.get(`/share-positions/${id}`);
};

/** Create share */
export const createShare = (
  data: SharePositionDTO
): Promise<AxiosResponse<string>> => {
  return axiosClient.post("/share-positions", data);
};

/** Update share */
export const updateShare = (
  data: SharePositionDTO
): Promise<AxiosResponse<string>> => {
  return axiosClient.put("/share-positions", data);
};

/** Delete share */
export const deleteShare = (
  id: number
): Promise<AxiosResponse<string>> => {
  return axiosClient.delete(`/share-positions/${id}`);
};

/** Get Live Share Data */
export const getShareLive = (
  uniqueCode: string
): Promise<AxiosResponse<any>> => {
  return axiosClient.get("/share-positions/weblive", {
    params: { uc: uniqueCode },
  });
};
