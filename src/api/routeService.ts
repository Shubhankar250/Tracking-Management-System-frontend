import type { AxiosResponse } from "axios";
import axiosClient from "./axiosClient";

/* =========================
   DTOs
========================= */

export interface RoutesDTO {
  id?: number;
  name: string;
  description?: string;
  group?: string;
  buffer?: number;
  geom: string;          // GeoJSON string
  buffergeom?: string;   // GeoJSON string
}

/**
 * SAME STRUCTURE AS BACKEND DGMDTO
 * Reusable for Route / Geo / POI groups
 */
export interface DGMDTO {
  group_name?: string;
  group_id?: number;
  device_name?: string;

  deviceIds?: number[];

  group_names?: string[];
  deletedIds?: number[];
}

export interface PaginatedRouteResponse {
  data: RoutesDTO[];
  currentPage: number;
  totalItems: number;
  totalPages: number;
}


/* =========================
   Routes APIs
========================= */

// READ ALL
export const getRoutes = (
  page: number,
  size: number,
  search: string
) => {
  return axiosClient.get<PaginatedRouteResponse>("/routes", {
    params: { page, size, search },
  });
};

// READ BY ID
export const getRouteById = (
  id: number
): Promise<AxiosResponse<Record<string, any>>> =>
  axiosClient.get(`/routes/${id}`);

// CREATE
export const createRoute = (
  route: RoutesDTO
): Promise<AxiosResponse<string>> =>
  axiosClient.post("/routes", route);

// UPDATE
export const updateRoute = (
  route: RoutesDTO
): Promise<AxiosResponse<string>> =>
  axiosClient.put("/routes", route);

// DELETE
export const deleteRoute = (
  id: number
): Promise<AxiosResponse<string>> =>
  axiosClient.delete(`/routes/${id}`);

/* =========================
   ROUTE GROUPS
========================= */
export const getAllRouteGroups = (): Promise<AxiosResponse<Record<number, string>>> =>
  axiosClient.get("/routes/groups");

export const saveRouteGroups = (
  data: DGMDTO
): Promise<AxiosResponse<string>> =>
  axiosClient.post("/routes/groups", data);
export const getAllRouteMap = (): Promise<AxiosResponse<Record<number, string>>> =>
  axiosClient.get("/routes/all");