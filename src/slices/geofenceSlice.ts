import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { GeofenceDTO, AddGeoGroupDTO } from "../api/geofenceService";
import * as geofenceAPI from "../api/geofenceService";

/* =========================
   State
========================= */
interface GeofenceState {
  geofences: GeofenceDTO[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
  geoGroups: Record<number, string>;
  allGeofences: Record<number, string>;
  loading: boolean;
  error: string | null;
}

const initialState: GeofenceState = {
  geofences: [],
  totalItems: 0,
  totalPages: 0,
  currentPage: 0,
  geoGroups: {},
  allGeofences: {},
  loading: false,
  error: null,
};
/* =========================
   Thunks
========================= */

// 👉 Get all geofences
export const fetchGeofences = createAsyncThunk(
  "geofence/fetchGeofences",
  async ({ page, size, search }: any) => {
    const res = await geofenceAPI.getGeofences(page, size, search);
    return res.data;
  },
);

// 👉 Get all geo groups
export const fetchGeoGroups = createAsyncThunk(
  "geofence/fetchGeoGroups",
  async () => {
    const res = await geofenceAPI.getAllGeoGroups();
    return res.data;
  }
);

// 👉 Save geo groups
export const saveGeoGroupsThunk = createAsyncThunk(
  "geofence/saveGeoGroups",
  async (group: AddGeoGroupDTO) => {
    const res = await geofenceAPI.saveGeoGroups(group);
    return res.data;
  }
);

// 👉 CREATE
export const createGeofenceThunk = createAsyncThunk(
  "geofence/createGeofence",
  async (geo: GeofenceDTO) => {
    const res = await geofenceAPI.createGeofence(geo);
    return res.data;
  }
);

// 👉 UPDATE
export const updateGeofenceThunk = createAsyncThunk(
  "geofence/updateGeofence",
  async ({ id, geo }: { id: number; geo: GeofenceDTO }) => {
    const res = await geofenceAPI.updateGeofence(id, geo);
    return res.data;
  }
);

// 👉 DELETE
export const deleteGeofenceThunk = createAsyncThunk(
  "geofence/deleteGeofence",
  async (id: number) => {
    const res = await geofenceAPI.deleteGeofence(id);
    return res.data;
  }
);
 export const fetchAllGeofencesGlobal = createAsyncThunk(
    "geofence/fetchAllGeofencesGlobal",
    async () => {
        const res = await geofenceAPI.getAllGeofencesGlobal();
        return res.data;
    }
);
/* =========================
   Slice
========================= */

const geofenceSlice = createSlice({
  name: "geofence",
  initialState,
  reducers: {
    clearGeofences(state) {
      state.geofences = [];
    },
    clearGeoGroups(state) {
      state.geoGroups = {};
    },
  },
  extraReducers: (builder) => {
    builder

      /* ===== FETCH GEOFENCES ===== */
      .addCase(fetchGeofences.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
        .addCase(fetchGeofences.fulfilled, (state, action) => {
        state.loading = false;
        state.geofences = action.payload.data;
        state.totalItems = action.payload.totalItems;
        state.totalPages = action.payload.totalPages;
        state.currentPage = action.payload.currentPage;
      })
      .addCase(fetchGeofences.rejected, (state) => {
        state.loading = false;
        state.error = "Failed to load geofences";
      })

      /* ===== FETCH GEO GROUPS ===== */
      .addCase(fetchGeoGroups.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchGeoGroups.fulfilled, (state, action) => {
        state.loading = false;
        state.geoGroups = action.payload;
      })
      .addCase(fetchGeoGroups.rejected, (state) => {
        state.loading = false;
        state.error = "Failed to load geo groups";
      })

      /* ===== SAVE GEO GROUPS ===== */
      .addCase(saveGeoGroupsThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(saveGeoGroupsThunk.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(saveGeoGroupsThunk.rejected, (state) => {
        state.loading = false;
        state.error = "Failed to save geo groups";
      })

      /* ===== CREATE ===== */
      .addCase(createGeofenceThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createGeofenceThunk.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(createGeofenceThunk.rejected, (state) => {
        state.loading = false;
        state.error = "Failed to create geofence";
      })

      /* ===== UPDATE ===== */
      .addCase(updateGeofenceThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateGeofenceThunk.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(updateGeofenceThunk.rejected, (state) => {
        state.loading = false;
        state.error = "Failed to update geofence";
      })

      /* ===== DELETE ===== */
      .addCase(deleteGeofenceThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteGeofenceThunk.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(deleteGeofenceThunk.rejected, (state) => {
        state.loading = false;
        state.error = "Failed to delete geofence";
      })
         /* ===== FETCH ALL GEOFENCES GLOBAL ===== */
.addCase(fetchAllGeofencesGlobal.pending, (state) => {
  state.loading = true;
  state.error = null;
})
.addCase(fetchAllGeofencesGlobal.fulfilled, (state, action) => {
  state.loading = false;
  state.allGeofences = action.payload;
})
.addCase(fetchAllGeofencesGlobal.rejected, (state) => {
  state.loading = false;
  state.error = "Failed to load global geofences";
});
  },
});

export const { clearGeofences, clearGeoGroups } = geofenceSlice.actions;
export default geofenceSlice.reducer;
