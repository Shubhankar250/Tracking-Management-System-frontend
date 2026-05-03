import axiosClient from "./axiosClient";

export interface Staff {
  id: number;
  name: string;
  designation: string;
  email: string;
  employeeCode: string;
  mobileNumber: string;
}

// 🔥 GET ALL (pagination ready)
export interface StaffPageResponse {
  data: Staff[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
}

export const getStaff = (params: {
  page: number;
  pageSize: number;
  search?: string;
}) =>
  axiosClient.get<StaffPageResponse>("/staff", {
    params: {
      page: params.page,
      size: params.pageSize,
      search: params.search,
    },
  });

// 🔥 GET BY ID
export const getStaffById = (id: number) =>
  axiosClient.get<Staff>(`/staff/${id}`);

// 🔥 ADD
export const addStaff = (data: Partial<Staff>) =>
  axiosClient.post<Staff>("/staff", data);

// 🔥 UPDATE (same API if backend supports)
export const updateStaff = (data: Partial<Staff>) =>
  axiosClient.post<Staff>("/staff", data);

// 🔥 DELETE
export const deleteStaff = (id: number) =>
  axiosClient.delete(`/staff/${id}`);