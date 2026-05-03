import axiosClient from "./axiosClient";
import type { PageResponse } from "../slices/reportSlice";

export interface ReportDTO {
  id?: number;

  from_date?: string;
  to_date?: string;

  title: string;
  reportType: string;
  outputFormat?: string;
  period?: string;
  emailTo?: string;
  emailCc?: string; 
  speed_limit?: string;
  stops?: string;
scheduleType?:string
sheduleReportType?:string
createdAt?:string
  daily?: string;
  weekly?: string;
  monthly?: string;
  template_id?:number
  skip_column?: string[];
  devices?: number[];
  geofences?: number[];
  admin_id?: number;
  user_id?: number;
}
export interface ReportScheduleLogDTO {
  logId: number;
  scheduleId: number;

  title: string;
  reportType: string;
  outputFormat: string;

  startedAt: string;
  completedAt: string;
fileSize?:string
sheduleReportType?:string
  status: string;
  recipientCount: number;
  filePath: string;
  errorMessage: string;
}
export interface TemplateDTO {
  id: number;
  templateName: string;
}
// POST: /api/reports/add
export const addReport = (data: ReportDTO) => {
  return axiosClient.post("/report-schedules", data);
};

// GET: /api/reports/getReportData
export const getReports = (page: number, size: number, search: string) => {
  return axiosClient.get<PageResponse<ReportDTO>>(
    "/report-schedules/data",
    {
      params: { page, size, search },
    },
  );
};

// GET: /api/reports/log
export const getReportLogs = (page: number, size: number, search: string ) => {
  return axiosClient.get<PageResponse<ReportScheduleLogDTO>>("/report-schedules/log",
    {
      params: { page, size, search },
    },
  );
};

// DELETE: /api/reports/delete?id=1
export const deleteReport = (id: number) => {
  return axiosClient.delete(`/report-schedules/${id}`);
};

// DELETE: /api/reports/log/delete?id=1
export const deleteReportLog = (id: number) => {
  return axiosClient.delete(`/report-schedules/log/${id}`);
};
// GET: /api/reports/byId?id=1
export const getReportById = (id: number) => {
  return axiosClient.get<ReportDTO>(`/report-schedules/${id}`);
};

// POST: /api/reports/update
export const updateReport = (data: ReportDTO) => {
  return axiosClient.put(`/report-schedules/${data.id}`, data);
};

// GET: /api/reports/ColumnByReportType?reportType=movement
export const getColumnsByReportType = (reportType: string) => {
  return axiosClient.get<string[]>("/reports/ColumnByReportType", {
    params: { reportType },
  });

  
};
// GET: /api/reports/types
export const getReportTypes = () => {
  return axiosClient.get<{ reporttypes: string[] }>("/reports/types");
};
export const getTemplates = () => {
  return axiosClient.get<TemplateDTO[]>("/report-schedules/template");
};