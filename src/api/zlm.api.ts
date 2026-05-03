import axiosClient from "./axiosClient";

/* ================= TYPES ================= */

export interface ExternalAccessTokenDTO {
  id?: number;
  username: string;
  password: string;
  projectName: string;
  externalAccessToken?: string;
  url: string;
}

export interface PageResponse<T> {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  data: T[];
}

/* ================= API ================= */

/* SAVE */
export const createZlm = (data: ExternalAccessTokenDTO) =>
  axiosClient.post<ExternalAccessTokenDTO>("/zlm", data);
/* GET ALL WITH PAGINATION */
export const getAllZlm = (
  page: number,
  size: number,
  search: string  
) =>
  axiosClient.get<PageResponse<ExternalAccessTokenDTO>>("/zlm", {
    params: {
      page,
      size,
      search,
    },
  });
export const deleteZlm = (id: number) =>
  axiosClient.delete<string>(`/zlm/${id}`);

export interface ExternalTokenResponse {
  projectName: string;
  url: string;
  token: string;
}

export const fetchTokenByProject = (projectName: string) =>
  axiosClient.post<ExternalTokenResponse>(
    "/zlm/fetch-token",
    null,
    {
      params: { projectName },
    }
  );