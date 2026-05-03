import axiosClient from "./axiosClient";

export interface SoftwareRelease {
  id: number;
  date: string;
  text: string;
  userId: number;
}

export interface SoftwareReleaseResponse {
  data: SoftwareRelease[];
  totalRecords: number;
}

export const getSoftwareReleases = (params: {
  page: number;
  pageSize: number;
  search: string;
}) =>
  axiosClient.get<SoftwareReleaseResponse>("/software", {
    params,
  });

export const getSoftwareReleaseById = (id: number) =>
  axiosClient.get<SoftwareRelease>(`/software/${id}`);

export const addSoftwareRelease = (data: Partial<SoftwareRelease>) =>
  axiosClient.post("/software", data);

export const updateSoftwareRelease = (data: Partial<SoftwareRelease>) =>
  axiosClient.put("/software", data);

export const deleteSoftwareRelease = (id: number) =>
  axiosClient.delete(`/software/${id}`);