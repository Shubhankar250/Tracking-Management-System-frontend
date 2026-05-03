import axiosClient from "./axiosClient";
export interface Maintenance {
  id: number;
  serviceName: string;
  deviceId: number;
  device_name: string;

  datalist: boolean;
  popup: boolean;

  odometerIntervalKm: boolean;
  odometerIntervalKmVal: number | null;
  lastServiceKm: number | null;

  engineHourInterval: boolean;
  engineHourIntervalVal: number | null;
  lastServiceHours: number | null;

  daysInterval: boolean;
  daysIntervalVal: number | null;

  odometerLeftKm: boolean;
  odometerLeftKmVal: number | null;

  engineHoursLeft: boolean;
  engineHoursLeftVal: number | null;

  updateLastService: boolean;

  daysLeft: boolean;
  daysLeftVal: number | null;

  eventTrigger: boolean;

  lastServiceDate: string | null;

  userId: number | null;
  adminId: number | null;

  username: string;
  admin_name: string;
}

export interface MaintenanceResponse {
  data: Maintenance[];
  totalRecords: number;
}

export const getMaintenance = (params: {
  page: number;
  pageSize: number;
  search: string;
}) =>
  axiosClient.get<MaintenanceResponse>("/maintenance", {
    params,
  });

export const getMaintenanceById = (id: number) =>
  axiosClient.get<Maintenance>(`/maintenance/${id}`);

export const addMaintenance = (data: Partial<Maintenance>) =>
  axiosClient.post<Maintenance>("/maintenance", data);

export const updateMaintenance = (data: Partial<Maintenance>) =>
  axiosClient.put<Maintenance>("/maintenance", data);

export const deleteMaintenance = (id: number) =>
  axiosClient.delete(`/maintenance/${id}`);
