import type { AxiosResponse } from "axios";
import axiosClient from "./axiosClient";

/* =========================
   DTOs
========================= */

export interface GeofenceDTO {
  id?: number; 
  pcts_name: string;
  color: string;
  geom: any;
  pcts_type: string;
  geo_group: string;
  speed_limit: string;
  radius: number;  

}

export interface AddGeoGroupDTO {
  group_names?: string[];
  deletedIds?: number[];
}

/* =========================
   Geofence APIs
========================= */

export const getGeofences = (page: number, size: number, search: string) => {
  return axiosClient.get("/geofences", { params: { page, size, search } });
};

export const createGeofence = (
  geo: GeofenceDTO
): Promise<AxiosResponse<string>> => {
  return axiosClient.post("/geofences", geo);
};

export const updateGeofence = (
  id: number,
  geo: GeofenceDTO
): Promise<AxiosResponse<string>> => {
  return axiosClient.put(`/geofences/${id}`, geo);
};

export const deleteGeofence = (
  id: number
): Promise<AxiosResponse<string>> => {
  return axiosClient.delete(`/geofences/${id}`);
};

/* =========================
   Geo Groups APIs
========================= */

export const getAllGeoGroups = (): Promise<
  AxiosResponse<Record<number, string>>
> => {
  return axiosClient.get("/geofences/geogroups");
};

export const saveGeoGroups = (
  group: AddGeoGroupDTO
): Promise<AxiosResponse<string>> => {
  return axiosClient.post("/geofences/geogroups", group);
};

export const getAllGeofencesGlobal = (): Promise<
  AxiosResponse<Record<number, string>>
> => {
  return axiosClient.get("/geofences/all");
};
