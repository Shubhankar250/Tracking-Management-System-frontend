import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit"; // <- type-only import
import * as reportApi from "../api/reportService";

/* ================= TYPES ================= */

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
sheduleReportType?:string
createdAt?:string
  daily?: string;
  weekly?: string;
  monthly?: string;
  template_id?: number
  scheduleType?:string
  skip_column?: string[];
  devices?: number[];
  geofences?: number[];
  admin_id?: number;
  user_id?: number;
  
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number; // current page (0-based)
  size: number;
}

interface ReportState {
  reports: PageResponse<ReportDTO> | null;
  selectedReport: ReportDTO | null;
  templates: TemplateDTO[];
  loading: boolean;
  columns: string[];
  error: string | null;
  reportTypes: string[];

  
}
export interface TemplateDTO {
  id: number;
  templateName: string;
}
export interface ReportScheduleLogDTO {
  logId: number;
  scheduleId: number;
fileSize?:string
  title: string;
  reportType: string;
  outputFormat: string;

  startedAt: string;
  completedAt: string;
sheduleReportType?:string
  status: string;
  recipientCount: number;

  filePath: string;
  errorMessage: string;
}

interface ReportLogState {
  logs: PageResponse<ReportScheduleLogDTO> | null;
  loading: boolean;
  error: string | null;
}


/* ================= STATE ================= */

const initialReportState: ReportState = {
  reports: null,
  selectedReport: null,
  columns: [],
  templates: [],
  reportTypes: [], 
  loading: false,
  error: null,
};

const initialReportLogState: ReportLogState = {
  logs: null,
  loading: false,
  error: null,
};


/* ================= THUNKS ================= */

// Fetch all reports
export const fetchReports = createAsyncThunk<
  PageResponse<ReportDTO>,
  { page: number; size: number; search: string }
>("reports/fetchAll", async ({ page, size, search  }, { rejectWithValue }) => {
  try {
    const res = await reportApi.getReports(page, size, search);
    return res.data as PageResponse<ReportDTO>;
  } catch (err: any) {
    return rejectWithValue(err.response?.data || "Failed to fetch reports");
  }
});

// Create report
export const createReport = createAsyncThunk<ReportDTO, ReportDTO>(
  "reports/create",
  async (data, { rejectWithValue }) => {
    try {
      const res = await reportApi.addReport(data);
      return res.data as ReportDTO; // <- cast to frontend type
    } catch (err: any) {
      return rejectWithValue(err.response?.data || "Failed to create report");
    }
  },
);
// Update report
export const updateReport = createAsyncThunk<ReportDTO, ReportDTO>(
  "reports/update",
  async (data, { rejectWithValue }) => {
    try {
      const res = await reportApi.updateReport(data);
      return res.data as ReportDTO;
    } catch (err: any) {
      return rejectWithValue(err.response?.data || "Failed to update report");
    }
  },
);

// Delete report
export const removeReport = createAsyncThunk<number, number>(
  "reports/delete",
  async (id, { rejectWithValue }) => {
    try {
      await reportApi.deleteReport(id);
      return id;
    } catch (err: any) {
      return rejectWithValue(err.response?.data || "Failed to delete report");
    }
  },
);

// Fetch columns
export const fetchColumnsByReportType = createAsyncThunk<string[], string>(
  "reports/fetchColumnsByReportType",
  async (reportType, { rejectWithValue }) => {
    try {
      const res = await reportApi.getColumnsByReportType(reportType);
      return res.data as string[];
    } catch (err: any) {
      return rejectWithValue(err.response?.data || "Failed to fetch columns");
    }
  },
);

// Fetch report logs
export const fetchReportLogs = createAsyncThunk<
  PageResponse<ReportScheduleLogDTO>,
  { page: number; size: number; search: string },
  { rejectValue: string }
>(
  "reportLogs/fetch",
  async ({ page, size, search }, { rejectWithValue }) => {
    try {
      const res = await reportApi.getReportLogs(page, size, search);

      // ✅ DO NOT transform
      return res.data as PageResponse<ReportScheduleLogDTO>;

    } catch {
      return rejectWithValue("Failed to fetch report logs");
    }
  }
);


// Delete report log
export const removeReportLog = createAsyncThunk<number, number>(
  "reportLogs/delete",
  async (id) => {
    await reportApi.deleteReportLog(id);
    return id;
  },
);
export const fetchReportTypes = createAsyncThunk<string[]>(
  "reports/fetchTypes",
  async (_, { rejectWithValue }) => {
    try {
      const res = await reportApi.getReportTypes();
      return res.data.reporttypes;
    } catch (err: any) {
      return rejectWithValue(err.response?.data || "Failed to fetch report types");
    }
  }
);
export const fetchTemplates = createAsyncThunk<
  TemplateDTO[]
>(
  "reports/fetchTemplates",
  async (_, { rejectWithValue }) => {
    try {
      const res = await reportApi.getTemplates();
      return res.data as TemplateDTO[];
    } catch (err: any) {
      return rejectWithValue(err.response?.data || "Failed to fetch templates");
    }
  }
);


/* ================= REPORT SLICE ================= */

const reportSlice = createSlice({
  name: "reports",
  initialState: initialReportState,
  reducers: {
    clearSelectedReport(state) {
      state.selectedReport = null;
    },
    clearColumns(state) {
      state.columns = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchReports.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchReports.fulfilled, (state, action) => {
        state.loading = false;
        state.reports = action.payload;
      })
      .addCase(fetchReports.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(
        removeReport.fulfilled,
        (state, action: PayloadAction<number>) => {
          if (state.reports) {
            state.reports.content = state.reports.content.filter(
              (r) => r.id !== action.payload,
            );
            state.reports.totalElements -= 1;
          }
        },
      )

      .addCase(
        fetchColumnsByReportType.fulfilled,
        (state, action: PayloadAction<string[]>) => {
          state.loading = false;
          state.columns = action.payload;
        },
      );
    builder
      .addCase(fetchReportById.pending, (state) => {
        state.loading = true;
      })
      .addCase(
        fetchReportById.fulfilled,
        (state, action: PayloadAction<ReportDTO>) => {
          state.loading = false;
          state.selectedReport = action.payload;
        },
      )
      .addCase(fetchReportById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(updateReport.pending, (state) => {
        state.loading = true;
      })
      .addCase(
        updateReport.fulfilled,
        (state, action: PayloadAction<ReportDTO>) => {
          state.loading = false;

          if (!state.reports) return;

          const index = state.reports.content.findIndex(
            (r) => r.id === action.payload.id,
          );

          if (index !== -1) {
            state.reports.content[index] = action.payload;
          }
        },
      )
.addCase(fetchReportTypes.fulfilled, (state, action: PayloadAction<string[]>) => {
  state.reportTypes = action.payload;
})
      .addCase(updateReport.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchTemplates.pending, (state) => {
  state.loading = true;
})
.addCase(fetchTemplates.fulfilled, (state, action: PayloadAction<TemplateDTO[]>) => {
  state.loading = false;
  state.templates = action.payload;
})
.addCase(fetchTemplates.rejected, (state, action) => {
  state.loading = false;
  state.error = action.payload as string;
});
  
  },
});

/* ================= REPORT LOG SLICE ================= */

const reportLogSlice = createSlice({
  name: "reportLogs",
  initialState: initialReportLogState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchReportLogs.pending, (state) => {
        state.loading = true;
      })
      .addCase(
        fetchReportLogs.fulfilled,
        (state, action: PayloadAction<PageResponse<ReportScheduleLogDTO>>) => {
          state.loading = false;
          state.logs = action.payload;
        }
      )
      .addCase(fetchReportLogs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(
        removeReportLog.fulfilled,
        (state, action: PayloadAction<number>) => {
          if (!state.logs) return;

          state.logs.content = state.logs.content.filter(
            (l) => l.logId !== action.payload
          );
          state.logs.totalElements -= 1;
        }
      );
  },
});

/* ================= EXPORTS ================= */
export const fetchReportById = createAsyncThunk<ReportDTO, number>(
  "reports/fetchById",
  async (id, { rejectWithValue }) => {
    try {
      const res = await reportApi.getReportById(id);
      return res.data as ReportDTO;
    } catch (err: any) {
      return rejectWithValue(err.response?.data || "Failed to fetch report");
    }
  },
);

export const { clearSelectedReport, clearColumns } = reportSlice.actions;

export const reportReducer = reportSlice.reducer;
export const reportLogReducer = reportLogSlice.reducer;
