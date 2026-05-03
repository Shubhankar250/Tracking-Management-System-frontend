import axiosClient from "../api/axiosClient";

/* ================= TYPES ================= */

export interface ActivityLogDTO {
  id: number;
  module: string;
  logType: string;
  message: string;
  createdAt: string;
}

/* ================= API CALLS ================= */

export const fetchAllModulesApi = async () => {
  const res = await axiosClient.get<Record<number, string>>(
    "/api/allModules"
  );
  return res.data;
};

export const fetchLogTypesByModuleApi = async (module: string) => {
  const res = await axiosClient.get<string[]>(
    "/api/logTypesByModule",
    {
      params: { module }
    }
  );
  return res.data;
};

export const fetchActivityLogsApi = async (params: {
  from: string;
  to: string;
  module?: string;
  log_type?: string;
}) => {
  const res = await axiosClient.get<ActivityLogDTO[]>(
    "/api/activitylogs",
    { params }
  );
  return res.data;
};
export const downloadActivityLogsApi = async (params: {
  from: string;
  to: string;
  module?: string;
  log_type?: string;
  format: "csv" | "excel";
}) => {
  const response = await axiosClient.get(
    "/export/activitylogs",
    {
      params,
      responseType: "blob"
    }
  );

  const blob = new Blob([response.data], {
    type:
      params.format === "csv"
        ? "text/csv"
        : "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  });

  const url = window.URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download =
    params.format === "csv"
      ? "ActivityLogs.csv"
      : "ActivityLogs.xlsx";

  document.body.appendChild(link);
  link.click();
  link.remove();

  window.URL.revokeObjectURL(url);
};
