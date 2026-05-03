import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import * as plannerApi from "../api/transportPlannerService";

/* ================= STATE ================= */

interface PlannerState {
  route: plannerApi.RoutePlannerResponse | null;
  routes: plannerApi.RoutePlannerResponse[];
  totalPages: number;
  totalElements: number;
  importData: plannerApi.RouteImportResponse | null;
  loading: boolean;
  error: string | null;
}

const initialState: PlannerState = {
  route: null,
  routes: [],
  totalPages: 0,
  totalElements: 0,
  importData: null,
  loading: false,
  error: null,
};

/* ================= THUNKS ================= */

// Get route
export const fetchRoutePlannerById = createAsyncThunk(
  "planner/fetchRoute",
  async (routeId: number, { rejectWithValue }) => {
    try {
      const res = await plannerApi.getRouteById(routeId);
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data || "Failed to fetch route");
    }
  },
);

// Save route
export const createRoutePlanner = createAsyncThunk(
  "planner/createRoute",
  async (data: plannerApi.RoutePlannerRequest, { rejectWithValue }) => {
    try {
      const res = await plannerApi.saveRouteWithFiles(data);
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data || "Failed to save route");
    }
  },
);

// Update route
export const editRoute = createAsyncThunk(
  "planner/updateRoute",
  async (
    {
      routeId,
      data,
    }: { routeId: number; data: plannerApi.RoutePlannerRequest },
    { rejectWithValue },
  ) => {
    try {
      const res = await plannerApi.updateRouteWithFiles(routeId, data);
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data || "Failed to update route");
    }
  },
);

// Import KML text
export const importKml = createAsyncThunk(
  "planner/importKml",
  async (kml: string, { rejectWithValue }) => {
    try {
      const res = await plannerApi.importKmlText(kml);
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data || "Failed to import KML");
    }
  },
);

// Import GPS CSV
export const importGps = createAsyncThunk(
  "planner/importGps",
  async (
    data: { csv: string; idleMinutes?: number; stopRadiusMeters?: number },
    { rejectWithValue },
  ) => {
    try {
      const res = await plannerApi.importGpsText(data);
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data || "Failed to import GPS");
    }
  },
);
export const fetchRoutesPlanner = createAsyncThunk(
  "planner/fetchRoutes",
  async (
    {
      page,
      size,
      search,
      routeType,
    }: {
      page: number;
      size: number;
      search?: string;
      routeType?: string;
    },
    { rejectWithValue, signal },
  ) => {
    try {
      const res = await plannerApi.getRoutes(
        { page, size, search, routeType },
        signal, // 🔥 pass signal
      );
      return res.data;
    } catch (err: any) {
      // 🚀 Ignore cancelled requests
      if (err.name === "CanceledError") return;
      return rejectWithValue(err.response?.data || "Failed to fetch routes");
    }
  },
);

/* ================= SLICE ================= */

const plannerSlice = createSlice({
  name: "planner",
  initialState,
  reducers: {
    clearRoute(state) {
      state.route = null;
    },
    clearImportData(state) {
      state.importData = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // FETCH
      .addCase(fetchRoutePlannerById.pending, (state) => {
        state.loading = true;
      })
      .addCase(
        fetchRoutePlannerById.fulfilled,
        (state, action: PayloadAction<any>) => {
          state.loading = false;
          state.route = action.payload;
        },
      )
      .addCase(fetchRoutePlannerById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // SAVE
      .addCase(createRoutePlanner.fulfilled, (state, action) => {
        state.route = action.payload;
      })

      // UPDATE
      .addCase(editRoute.fulfilled, (state, action) => {
        state.route = action.payload;
      })

      // IMPORT KML / GPS
      .addCase(importKml.fulfilled, (state, action) => {
        state.importData = action.payload;
      })
      .addCase(importGps.fulfilled, (state, action) => {
        state.importData = action.payload;
      })
      .addCase(fetchRoutesPlanner.pending, (state) => {
        state.loading = true;
      })
      .addCase(
        fetchRoutesPlanner.fulfilled,
        (state, action: PayloadAction<any>) => {
          state.loading = false;
          state.routes = action.payload.content;
          state.totalPages = action.payload.totalPages;
          state.totalElements = action.payload.totalElements;
        },
      )
      .addCase(fetchRoutesPlanner.rejected, (state, action) => {
        if (action.error.name === "AbortError") return; // ignore cancel
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

/* ================= EXPORTS ================= */

export const { clearRoute, clearImportData } = plannerSlice.actions;
export const plannerReducer = plannerSlice.reducer;
