import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { RoutesDTO, DGMDTO } from "../api/routeService";
import * as routeAPI from "../api/routeService";

interface RoutesState {
  routes: RoutesDTO[];
  routeMap: Record<number, string>;

  totalItems: number;
  totalPages: number;
  currentPage: number;

  loading: boolean;
  error: string | null;
}

const initialState: RoutesState = {
  routes: [],
  routeMap: {},

  totalItems: 0,
  totalPages: 0,
  currentPage: 0,

  loading: false,
  error: null,
};

/* =========================
   Thunks
========================= */

export const fetchRoutes = createAsyncThunk(
  "routes/fetchRoutes",
  async ({
    page,
    size,
    search,
  }: {
    page: number;
    size: number;
    search: string;
  }) => {
    const res = await routeAPI.getRoutes(page, size, search);
    return res.data;
  },
);

export const fetchRouteById = createAsyncThunk<RoutesDTO, number>(
  "routes/fetchRouteById",
  async (id) => {
    const res = await routeAPI.getRouteById(id);
    return res.data as RoutesDTO;
  },
);

export const createRouteThunk = createAsyncThunk(
  "routes/createRoute",
  async (route: RoutesDTO) => {
    const res = await routeAPI.createRoute(route);
    return res.data;
  },
);

export const updateRouteThunk = createAsyncThunk(
  "routes/updateRoute",
  async (route: RoutesDTO) => {
    const res = await routeAPI.updateRoute(route);
    return res.data;
  },
);

export const deleteRouteThunk = createAsyncThunk(
  "routes/deleteRoute",
  async (id: number) => {
    const res = await routeAPI.deleteRoute(id);
    return res.data;
  },
);

export const saveRouteGroupsThunk = createAsyncThunk(
  "routes/saveRouteGroups",
  async (data: DGMDTO) => {
    const res = await routeAPI.saveRouteGroups(data);
    return res.data;
  },
);
export const fetchAllRouteMap = createAsyncThunk<Record<number, string>>(
  "routes/fetchAllRouteMap",
  async () => {
    const res = await routeAPI.getAllRouteMap();
    return res.data;
  },
);

/* =========================
   Slice
========================= */

const routesSlice = createSlice({
  name: "routes",
  initialState,
  reducers: {
    clearRoutes(state) {
      state.routes = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchRoutes.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRoutes.fulfilled, (state, action) => {
        state.loading = false;
        state.routes = action.payload.data;
        state.totalItems = action.payload.totalItems;
        state.totalPages = action.payload.totalPages;
        state.currentPage = action.payload.currentPage;
      })
      .addCase(fetchRoutes.rejected, (state) => {
        state.loading = false;
        state.error = "Failed to load routes";
      })

      .addCase(createRouteThunk.pending, (state) => {
        state.loading = true;
      })
      .addCase(createRouteThunk.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(createRouteThunk.rejected, (state) => {
        state.loading = false;
        state.error = "Failed to create route";
      })

      .addCase(updateRouteThunk.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateRouteThunk.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(updateRouteThunk.rejected, (state) => {
        state.loading = false;
        state.error = "Failed to update route";
      })

      .addCase(deleteRouteThunk.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteRouteThunk.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(deleteRouteThunk.rejected, (state) => {
        state.loading = false;
        state.error = "Failed to delete route";
      })

      .addCase(saveRouteGroupsThunk.pending, (state) => {
        state.loading = true;
      })
      .addCase(saveRouteGroupsThunk.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(saveRouteGroupsThunk.rejected, (state) => {
        state.loading = false;
        state.error = "Failed to save route groups";
      })
      .addCase(fetchAllRouteMap.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAllRouteMap.fulfilled, (state, action) => {
        state.loading = false;
        state.routeMap = action.payload || {};
      })
      .addCase(fetchAllRouteMap.rejected, (state) => {
        state.loading = false;
      });
  },
});

export const { clearRoutes } = routesSlice.actions;
export default routesSlice.reducer;
