import type { AxiosResponse } from "axios";
import axiosClient from "./axiosClient";

/* =========================
   DTOs
========================= */

export interface PoiDTO {
  id?: number;
  name: string;
  description?: string;
  poiGroupId?: number;
  poiGroupName?: string;
  markerIcon?: string;
  radius?: number;
  latitude: number;
  longitude: number;
}

export interface AddPoiGroupDTO {
  groupNames?: string[];
  deletedIds?: number[];
}

export interface PaginatedPoiResponse {
  data: PoiDTO[];
  currentPage: number;
  totalItems: number;
  totalPages: number;
}

/* =========================
   POI APIs
========================= */

// Get all POIs
export const getPois = (
  page: number,
  size: number,
  search: string
): Promise<AxiosResponse<PaginatedPoiResponse>> => {
  return axiosClient.get("/poi", {
    params: { page, size, search },
  });
};


// Get POI by id
export const getPoiById = (
  id: number
): Promise<AxiosResponse<PoiDTO>> => {
  return axiosClient.get(`/poi/${id}`);
};

// Create POI
export const createPoi = (
  poi: PoiDTO
): Promise<AxiosResponse<PoiDTO>> => {
  return axiosClient.post("/poi", poi);
};

// Update POI
export const updatePoi = (
  poi: PoiDTO
): Promise<AxiosResponse<string>> => {
  return axiosClient.put("/poi", poi);
};

// Delete POI
export const deletePoi = (
  id: number
): Promise<AxiosResponse<string>> => {
  return axiosClient.delete(`/poi/${id}`);
};

/* =========================
   POI GROUP APIs
========================= */

export const getAllPoiGroups = (): Promise<
  AxiosResponse<Record<number, string>>
> => {
  return axiosClient.get("/poi/groups");
};

export const savePoiGroups = (
  data: AddPoiGroupDTO
): Promise<AxiosResponse<string>> => {
  return axiosClient.post("/poi/groups", data);
};
export const getAllPoiMap = (): Promise<
  AxiosResponse<Record<number, string>>
> => {
  return axiosClient.get("/poi/all");
};