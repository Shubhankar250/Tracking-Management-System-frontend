import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { exportHistoryReport } from "../api/historyExportApi";
import type { HistoryExportRequest } from "../api/historyExportApi";

export interface HistoryExportState {
  loading: boolean;
  error: string | null;
}

const initialState: HistoryExportState = {
  loading: false,
  error: null
};

/* -------- THUNK -------- */
export const downloadHistoryReport = createAsyncThunk<
  any,
  HistoryExportRequest,
  { rejectValue: string }
>(
  "historyExport/downloadHistoryReport",
  async (params, thunkAPI) => {
    try {
      return await exportHistoryReport(params); // full axios response
    } catch (err: any) {
      return thunkAPI.rejectWithValue(err.message);
    }
  }
);

/* -------- SLICE -------- */
const historyExportSlice = createSlice({
  name: "historyExport",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(downloadHistoryReport.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(
        downloadHistoryReport.fulfilled,
        (state, action: PayloadAction<any>) => {
          state.loading = false;

          //console.log("Headers:", action.payload.headers); // 🔍 debug

          const blob = new Blob([action.payload.data]);
          const url = window.URL.createObjectURL(blob);

          //  Extract filename from backend header
         const contentDisposition =
  action.payload.headers["content-disposition"];

let fileName = "download";

if (contentDisposition) {
  const fileNameMatch = contentDisposition
    .split("filename=")[1];

  if (fileNameMatch) {
    fileName = fileNameMatch
      .replace(/"/g, "")
      .trim();
  }
}
          const link = document.createElement("a");
          link.href = url;
          link.download = fileName;
          document.body.appendChild(link);
          link.click();
          link.remove();

          window.URL.revokeObjectURL(url);
        }
      )

      .addCase(downloadHistoryReport.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "Download failed";
      });
  }
});

export default historyExportSlice.reducer;
