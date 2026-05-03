import axiosClient from "./axiosClient";

export interface HistoryExportRequest {
  type: "CSV" | "KML" | "GPX" | "GSR";
  deviceId: number;
  start_time: string;
  end_time: string;
  time_interval: number;
}

export async function exportHistoryReport(
  params: HistoryExportRequest
) {

  const response = await axiosClient.get("/export/historyReports", {
    params: {
      type: params.type,
      deviceId: params.deviceId,
      start_time: params.start_time,
      end_time: params.end_time,
      time_interval: params.time_interval
    },
    responseType: "blob"
  });

  return response; // ✅ return full response (data + headers)
}
