import axiosClient from "./axiosClient";

export interface Task {
  id: number;
  name: string;
  priority: string;
  object:string;
  status: string;
  description: string;
  pickup_address: string;
  delivery_address: string;
  pickup_start_time: string;
  pickup_end_time: string;
  delivery_start_time: string;
  delivery_end_time: string;
  device_name: string;
  pickup_latitude: number;
  pickup_longitude: number;
  delivery_latitude: number;
  delivery_longitude: number;
}

export interface TaskPageResponse {
  content: Task[];
  totalElements: number;
}
export const getTask = (params: {
  page: number;
  pageSize: number;
  search?: string;
  deviceId: number;
  start_time?: string;
  end_time?: string;
}) =>
  axiosClient.get<TaskPageResponse>("/tasks", {
    params,
  });

  
export const getTaskById = (id: number) =>
  axiosClient.get<Task>(`/tasks/${id}`);

export const addTask = (data: Partial<Task>) =>
  axiosClient.post<Task>("/tasks", data);



export const updateTask = (data: Partial<Task>) =>
  axiosClient.put<Task>("/tasks", data);

export const deleteTask = (id: number) =>
  axiosClient.delete(`/tasks/${id}`);
