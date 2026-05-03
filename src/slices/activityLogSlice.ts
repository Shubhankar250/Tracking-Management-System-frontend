import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  fetchAllModulesApi,
  fetchLogTypesByModuleApi,
  fetchActivityLogsApi
} from "../api/activityLogApi";

import type { ActivityLogDTO } from "../api/activityLogApi";

/* ================= STATE ================= */

interface ActivityLogState {
  modules: Record<number, string>;
  logTypes: string[];
  logs: ActivityLogDTO[];
  loading: boolean;
  error?: string;
}

const initialState: ActivityLogState = {
  modules: {},
  logTypes: [],
  logs: [],
  loading: false
};

/* ================= THUNKS ================= */

export const fetchAllModules = createAsyncThunk(
  "activityLog/fetchAllModules",
  async () => {
    return fetchAllModulesApi();
  }
);

export const fetchLogTypesByModule = createAsyncThunk(
  "activityLog/fetchLogTypesByModule",
  async (module: string) => {
    return fetchLogTypesByModuleApi(module);
  }
);

export const fetchActivityLogs = createAsyncThunk(
  "activityLog/fetchActivityLogs",
  async (params: {
    from: string;
    to: string;
    module?: string;
    log_type?: string;
  }) => {
    return fetchActivityLogsApi(params);
  }
);

/* ================= SLICE ================= */

const activityLogSlice = createSlice({
  name: "activityLog",
  initialState,
  reducers: {
    clearLogTypes(state) {
      state.logTypes = [];
    }
  },
  extraReducers: builder => {
    builder
      /* Modules */
      .addCase(fetchAllModules.pending, state => {
        state.loading = true;
      })
      .addCase(fetchAllModules.fulfilled, (state, action) => {
        state.modules = action.payload;
        state.loading = false;
      })

      /* Log Types (FIXED HERE 👇) */
      .addCase(fetchLogTypesByModule.fulfilled, (state, action) => {
        const raw = action.payload;

        // If API returns ["A,B,C"] → split it
        if (raw.length === 1 && raw[0].includes(",")) {
          state.logTypes = raw[0]
            .split(",")
            .map(t => t.trim())
            .filter(Boolean);
        } else {
          state.logTypes = raw;
        }
      })

      /* Logs */
      .addCase(fetchActivityLogs.pending, state => {
        state.loading = true;
      })
      .addCase(fetchActivityLogs.fulfilled, (state, action) => {
        state.logs = action.payload;
        state.loading = false;
      });
  }
});

export const { clearLogTypes } = activityLogSlice.actions;
export default activityLogSlice.reducer;
