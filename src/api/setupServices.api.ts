// src/api/setupService.api.ts
import api from "./axiosClient"; // your axios instance

/* =======================
   TYPES
======================= */

export interface DriverSetupDTO {
  id?: number;
  name: string;
  deviceId?: number;
  deviceName?: string;
  currentDeviceId?: number;
  rfid?: string;
  phone?: string;
  email?: string;
  description?: string;
  username?: string;
  password?: string;
}

export interface SetupTemplateDTO {
  id?: number;
  title: string;
  adapted?: string;
  message?: string;
  subject?: string;
  category?: string;
  templateName?: string;
}

export interface SetupDeviceDTO{

  id?: number;
  vehicle_status: string;
  name?: string;
  uniqueid?: string;
}

export interface CustomUserDTO{

  id?: number;
  smsGatewayType?: string;
  smsGatewayUrl?: string;
  smtpHost?: string;
  smtpUsername?: string;
  smtpPassword?: string;
  smtpPort?: string;
  smtpEncryption?: string;
  availableWidgets?: string;
  dashboardMenu?: string;
  availablesubscriptionpoints?: number;
  timezone ?:string;
}
/* =======================
   DRIVER APIs
======================= */

export const getDriverData = (params: {
  page: number;
  size: number;
  search: string;
}) =>
  api.get("/setup/getdriverdata", {
    params,
  });

export const addDriverData = (payload: DriverSetupDTO) =>
  api.post("/setup/adddriverData", payload);

export const updateDriverData = (payload: DriverSetupDTO) =>
  api.put("/setup/updatedriverData", payload);

export const deleteDriverData = (id: number) =>
  api.delete("/setup/deletedriver", {
    params: { id },
  });

/* =======================
   TEMPLATE APIs (SMS / EMAIL / GPRS)
======================= */

export const getSMSData = (page: number, size: number, search: string) =>
  api.get("/setup/getSMSdata", { params: { page, size, search } });

export const addSMSData = (payload: SetupTemplateDTO) =>
  api.post("/setup/addSMSData", payload);

export const updateSMSData = (payload: SetupTemplateDTO) =>
  api.put("/setup/updateSMSData", payload);

export const getEMAILData = (page: number, size: number, search: string) =>
  api.get("/setup/getEMAILdata", { params: { page, size, search } });

export const addEMAILData = (payload: SetupTemplateDTO) =>
  api.post("/setup/addEMAILData", payload);

export const updateEMAILData = (payload: SetupTemplateDTO) =>
  api.put("/setup/updateEMAILData", payload);

export const getGPRSData = (page: number, size: number, search: string) =>
  api.get("/setup/getGPRSdata", { params: { page, size, search } });

export const addGPRSData = (payload: SetupTemplateDTO) =>
  api.post("/setup/addGPRSData", payload);

export const updateGPRSData = (payload: SetupTemplateDTO) =>
  api.put("/setup/updateGPRSData", payload);

export const deleteTemplate = (id: number) =>
  api.delete("/setup/deletetemplate", {
    params: { id },
  });

export const getObjectsData = (page: number, size: number, search: string) =>
  api.get("/setup/getObjectdata", { params: { page, size, search } });

export const updateUserDataSetup  = (payload: CustomUserDTO) =>
  api.put("/setup/updateuserdatasetup", payload);

export const getUserDataSetup = () =>
  api.get("/users/getuserdata");

export const getAllDriverMap = () =>
  api.get("/setup/allDriver");