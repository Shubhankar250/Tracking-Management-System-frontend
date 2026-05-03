import api from "./axiosClient";

export interface CommandDTO {
  id?: number;
  model?: string;
  commandName: string;
  commandCode?: string;
  commandStatus?: number;
  types?: string;
  deviceId: number;
  deviceName?: string;
  commandMsg?: string;
  created_on?: string;
  commandCategory?: string;       
  commandSubCategory?: string;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number; // current page
  size: number;
}


// GET /commands
export const fetchCommandsApi = (
  page: number,
  size: number,
  search: string
) =>
  api.get<PageResponse<CommandDTO>>("/commands", {
    params: { page, size, search },
  });

// GET /commands/{id}
export const fetchCommandByIdApi = (id: number) =>
  api.get<CommandDTO>(`/commands/${id}`);

// POST /commands
export const createCommandApi = (data: CommandDTO) =>
  api.post("/commands", data);

// PUT /commands
export const updateCommandApi = (data: CommandDTO) =>
  api.put("/commands", data);

// DELETE /commands?id=
export const deleteCommandApi = (id: number) =>
  api.delete("/commands", { params: { id } });

// GET /commands/byDeviceId
export const fetchCommandsByDeviceApi = (deviceId: number) =>
  api.get<Record<string, string>>("/commands/byDeviceId", {
    params: { device_id: deviceId },
  });

// POST /commands/send
export const sendCommandApi = (data: CommandDTO) =>
  api.post<string>("/commands/send", data);

// GET /commands/log
export const fetchCommandLogsApi = (
  page: number,
  size: number,
  search: string
) =>
  api.get<PageResponse<CommandDTO>>("/commands/log", {
    params: { page, size, search },
  });

// DOWNLOAD EXCEL TEMPLATE
export const downloadCommandTemplateApi = () =>
  api.get("/commands/excel/template", {
    responseType: "blob",
  });

  // PREVIEW EXCEL
export const previewCommandExcelApi = (file: File) => {
  const formData = new FormData();
  formData.append("file", file);

  return api.post("/commands/excel", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

// UPLOAD & SAVE EXCEL
export const uploadCommandExcelApi = (file: File) => {
  const formData = new FormData();
  formData.append("file", file);

  return api.post("/commands/excel/save", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};
