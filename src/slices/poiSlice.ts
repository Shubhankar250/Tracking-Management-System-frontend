import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { PoiDTO, AddPoiGroupDTO } from "../api/poiService";
import * as poiAPI from "../api/poiService";

/* =========================
   State
========================= */

interface PoiState {
  pois: PoiDTO[];
  poiGroups: Record<number, string>;
  poiMap: Record<number, string>;

  totalItems: number;
  totalPages: number;
  currentPage: number;

  loading: boolean;
  error: string | null;
}

const initialState: PoiState = {
  pois: [],
  poiGroups: {},
  poiMap: {},

  totalItems: 0,
  totalPages: 0,
  currentPage: 0,

  loading: false,
  error: null,
};

/* =========================
   Thunks (TYPED)
========================= */
/* ================= FETCH POIS ================= */

export const fetchPois = createAsyncThunk(
  "poi/fetchPois",
  async ({
    page,
    size,
    search,
  }: {
    page: number;
    size: number;
    search: string;
  }) => {
    const res = await poiAPI.getPois(page, size, search);
    return res.data;
  },
);

/* ================= FETCH GROUPS ================= */

export const fetchPoiGroups = createAsyncThunk<Record<number, string>>(
  "poi/fetchPoiGroups",
  async () => {
    const res = await poiAPI.getAllPoiGroups();
    return res.data;
  },
);

/* ================= SAVE GROUPS ================= */

export const savePoiGroupsThunk = createAsyncThunk<string, AddPoiGroupDTO>(
  "poi/savePoiGroups",
  async (data) => {
    const res = await poiAPI.savePoiGroups(data);
    return res.data;
  },
);

/* ================= CREATE ================= */

export const createPoiThunk = createAsyncThunk<PoiDTO, PoiDTO>(
  "poi/createPoi",
  async (poi) => {
    const res = await poiAPI.createPoi(poi);
    return res.data;
  },
);

/* ================= UPDATE ================= */
/*
Backend returns STRING ✔
So we return ORIGINAL poi back to reducer
*/

export const updatePoiThunk = createAsyncThunk<PoiDTO, PoiDTO>(
  "poi/updatePoi",
  async (poi) => {
    await poiAPI.updatePoi(poi);
    return poi;
  },
);

/* ================= DELETE ================= */
/*
Return id directly
*/

export const deletePoiThunk = createAsyncThunk<number, number>(
  "poi/deletePoi",
  async (id) => {
    await poiAPI.deletePoi(id);
    return id;
  },
);

export const fetchAllPoiMap = createAsyncThunk<Record<number, string>>(
  "poi/fetchAllPoiMap",
  async () => {
    const res = await poiAPI.getAllPoiMap();
    return res.data;
  },
);

/* =========================
   Slice
========================= */

const poiSlice = createSlice({
  name: "poi",
  initialState,

  reducers: {
    clearPois(state) {
      state.pois = [];
    },
    clearPoiGroups(state) {
      state.poiGroups = {};
    },
  },

  extraReducers: (builder) => {
    builder

      /* FETCH POIS */

      .addCase(fetchPois.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(fetchPois.fulfilled, (state, action) => {
        state.loading = false;
        state.pois = action.payload.data;
        state.totalItems = action.payload.totalItems;
        state.totalPages = action.payload.totalPages;
        state.currentPage = action.payload.currentPage;
      })

      .addCase(fetchPois.rejected, (state) => {
        state.loading = false;
        state.error = "Failed to load POIs";
      })

      /* FETCH GROUPS */

      .addCase(fetchPoiGroups.fulfilled, (state, action) => {
        state.poiGroups = action.payload;
      })

      /* CREATE */

      .addCase(createPoiThunk.pending, (state) => {
        state.loading = true;
      })

      .addCase(createPoiThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.pois.push(action.payload);
      })

      .addCase(createPoiThunk.rejected, (state) => {
        state.loading = false;
        state.error = "Failed to create POI";
      })

      /* UPDATE */

      .addCase(updatePoiThunk.pending, (state) => {
        state.loading = true;
      })

      .addCase(updatePoiThunk.fulfilled, (state, action) => {
        state.loading = false;

        const idx = state.pois.findIndex((p) => p.id === action.payload.id);
        if (idx >= 0) {
          state.pois[idx] = action.payload;
        }
      })

      .addCase(updatePoiThunk.rejected, (state) => {
        state.loading = false;
        state.error = "Failed to update POI";
      })

      /* DELETE */

      .addCase(deletePoiThunk.pending, (state) => {
        state.loading = true;
      })

      .addCase(deletePoiThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.pois = state.pois.filter((p) => p.id !== action.payload);
      })

      .addCase(deletePoiThunk.rejected, (state) => {
        state.loading = false;
        state.error = "Failed to delete POI";
      })
      /* FETCH ALL POI MAP */

      .addCase(fetchAllPoiMap.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAllPoiMap.fulfilled, (state, action) => {
        state.loading = false;
        state.poiMap = action.payload || {};
      })
      .addCase(fetchAllPoiMap.rejected, (state) => {
        state.loading = false;
      });
  },
});

export const { clearPois, clearPoiGroups } = poiSlice.actions;
export default poiSlice.reducer;
