import axiosClient from "./axiosClient";

/* ================= DTOs ================= */

export interface UserDTO {
  id: number;
  firstname: string;
  lastname: string;
  username: string;
  email: string;
  phoneNumber: string | null;
  groupId: number;
  city: string | null;
  country: string | null;
  timezone: string;
  accountname: string;
  enabled: number;
  role: string[];
  access_type?: string;
  available_maps?: string;
  assign_device_ids?: string; // comma separated IDs
  permissions?: string;

  objectlist?: string;
  available_subscription_points?: number;

}

export interface CustomUserDTO {
  id?: number;
  firstname: string;
  lastname: string;
  username: string;
  password?: string;
  email: string;
  phone_number1?: string;
  country?: string;
  timezone: string;
  address?: string;
  city?: string;

  enabled?: number;
  access_type?: string;
  available_maps?: string;
  assign_device_ids?: string; // comma separated IDs
  permissions?: string;

  objectlist?: string;
  available_subscription_points?: number;
  role: string[];
}

export interface UserModulePermission {
  permission: string;
  read: boolean;
  write: boolean;
  delete: boolean;
}

export interface MapSettings {
  availableMaps: string[];
  defaultSelectedMaps: string[];
}

/* ================= DEVICE DTOs ================= */

export interface DeviceForUserDTO {
  id: number;
  name: string;
}
export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
}
/**
 * Backend:
 * Map<String, List<DeviceForUserBean>>
 */
export type GroupedDevicesDTO = Record<string, DeviceForUserDTO[]>;
export type UsersMapDTO = Record<number, string>;
/* ================= API CALLS ================= */

export const getUsers = (
  page: number,
  size: number,
  search: string
) =>
  axiosClient.get<PageResponse<UserDTO>>("/users", {
    params: {
      page: page - 1,
      size,
      search,
    },
  });

export const getUserById = (id: number) =>
  axiosClient.get<UserDTO>(`/users/${id}`);

export const addUser = (data: CustomUserDTO, groupId: number) =>
  axiosClient.post<string>(`/users?group_id=${groupId}`, data);

export const updateUser = (data: CustomUserDTO, groupId: number) =>
  axiosClient.put<string>(`/users?group_id=${groupId}`, data);

export const deleteUser = (id: number) =>
  axiosClient.delete<string>(`/users/${id}`);

export const getDefaultPermissions = () =>
  axiosClient.get<UserModulePermission[]>("/users/permission");

export const getMapSettings = () =>
  axiosClient.get<MapSettings>("/users/maps");

/* ✅ NEW: GROUPED DEVICES API */
export const getDevicesGrouped = () =>
  axiosClient.get<GroupedDevicesDTO>("/users/devices/grouped");
/* ================= NEW API: ALL USER MAP ================= */

export const getAllUserMap = () =>
  axiosClient.get<UsersMapDTO>("/users/allUser");