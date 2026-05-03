import api from "./axiosClient";

/* =======================
   TYPES
======================= */

export interface DeviceModalDTO {
  id?: number;
  companyName?: string;
  modalName?: string;
  modalType?: string;
  noOfChannel?: number;
  image?: string;
  userManual?: string;
  protocolManual?: string;
  commands?: string;
  connectedIP?: string;
  connectedPort?: string;
  noOfDIN?: number;
	noOfAIN?: number;
	noOfDOUT?: number;
	protocolName?: string;
   adasAlertType?: string;
    dmsAlertType?: string;
    active:boolean

}

export interface DeviceModalResponse {
  totalItems: number;
  totalPages: number;
  currentPage: number;
  data: DeviceModalDTO[];
}


 export interface DeviceGroupDataProjection {
    id: number;
    modalName: string;
    adasAlertType?: string;
    dmsAlertType?: string;
}

/* =======================
   APIs
======================= */

// GET with pagination + search
export const getDeviceModals = (params: {
  page: number;
  size: number;
  search: string;
}) =>
  api.get<DeviceModalResponse>("/devicemodal", {
    params,
  });

// CREATE (multipart)
export const createDeviceModal = (formData: FormData) =>
  api.post("/devicemodal", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

// UPDATE (multipart)
export const updateDeviceModal = (
  id: number,
  formData: FormData
) =>
  api.put(`/devicemodal/${id}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

// DELETE
export const deleteDeviceModal = (id: number) =>
  api.delete(`/devicemodal/${id}`);


export const getAllModalNames = () => api.get<string[]>("/devicemodal/names");

export interface DeviceModalSearchDTO {
  id: number;
  modalName: string;
  image: string;
}

// SEARCH API
export const searchDeviceModal = (keyword: string) =>
  api.get<DeviceModalSearchDTO[]>("/devicemodal/search", {
    params: { keyword },
  });
  // 1️⃣ GET all company names
export const getAllCompanyNames = () => api.get<string[]>("/devicemodal/allCompanyNames");

// 2️⃣ GET all devices by company name
export const getDevicesByCompanyName = (companyName?: string) =>
  api.get<DeviceModalDTO[]>("/devicemodal/allDevicesByCompanyNames", {
    params: companyName ? { companyName } : {},
  });

   export const getAlertTypeForADASandDMS = (deviceIds: number[]) =>
    api.post<DeviceGroupDataProjection[]>("/devicemodal/AlertTypeForADASandDMS", deviceIds);