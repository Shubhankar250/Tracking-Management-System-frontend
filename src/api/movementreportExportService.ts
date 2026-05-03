import axiosClient from "../api/axiosClient"; // adjust path
import type { ReportDTO } from "../slices/reportSlice";

export const downloadMovementReport = async (report: ReportDTO) => {
  const params = new URLSearchParams();
  const s = (v?: string) => v ?? "";
 params.append("reportType", s(report.reportType));
  params.append("type", s(report.outputFormat));
  params.append("from_date", s(report.from_date));
  params.append("to_date", s(report.to_date));
  params.append("speed", s(report.speed_limit));
  params.append("stops", s(report.stops));

  if (report.devices?.length) {
    params.append("deviceIds", report.devices.join(","));
  }

  if (report.geofences?.length) {
    params.append("geofences", report.geofences.join(","));
  }

  report.skip_column?.forEach((col) => {
    params.append("selectedColumns", col);
  });

  return axiosClient.get("/export/report", {
    params,
    responseType: "blob", // 🔥 IMPORTANT
  });
};
