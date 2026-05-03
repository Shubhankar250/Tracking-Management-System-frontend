import { createAsyncThunk } from "@reduxjs/toolkit";
import { downloadMovementReport } from "../api/movementreportExportService";
import type { ReportDTO } from "./reportSlice";

export const generateMovementReport = createAsyncThunk(
  "reports/generateMovement",
  async (report: ReportDTO) => {
    const res = await downloadMovementReport(report);
    return res;
  }
);
