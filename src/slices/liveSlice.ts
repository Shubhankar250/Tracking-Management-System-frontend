import type { PayloadAction } from "@reduxjs/toolkit";
import { getLiveDevices } from "../api/liveService";
import type { LiveDataDto } from "../api/liveService";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

interface LiveState {
  devices: LiveDataDto[];
  selectedVehicleId: number | null;
  visibleVehicleIds: number[];
  loading: boolean;
  error: string | null;
}

const initialState: LiveState = {
  devices: [],
  selectedVehicleId: null,
  visibleVehicleIds: [],
  loading: false,
  error: null,
};

export const fetchLiveDevices = createAsyncThunk(
  "live/fetchLiveDevices",
  async () => {
    const res = await getLiveDevices();
    return res.data;
  },
);

const liveSlice = createSlice({
  name: "live",
  initialState,
  reducers: {
   setSelectedVehicle(state, action: PayloadAction<number | null>) {
  state.selectedVehicleId = action.payload;
},

    setVisibleVehicleIds(state, action: PayloadAction<number[]>) {
      state.visibleVehicleIds = action.payload;
    },

    // ✅ ONLY update device list — NEVER touch selection
    updateDevice(state, action: PayloadAction<LiveDataDto>) {
      const updated = action.payload;

      const idx = state.devices.findIndex(
        (d) => d.device_id === updated.device_id,
      );

      if (idx !== -1) {
        const prev = state.devices[idx];

        // 🔥 SHALLOW CHANGE CHECK
        if (
          prev.latitude === updated.latitude &&
          prev.longitude === updated.longitude &&
          prev.speed === updated.speed &&
          prev.devicetime === updated.devicetime
        ) {
          return; // 🚀 skip update = no render
        }

        state.devices[idx] = {
          ...prev,
          ...updated,
        };
      }
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(fetchLiveDevices.pending, (state) => {
        state.loading = true;
      })

      .addCase(fetchLiveDevices.fulfilled, (state, action) => {
        state.loading = false;
        state.devices = action.payload;

        state.visibleVehicleIds = action.payload.map((v) => v.device_id);

        // ⭐ KEEP current selection if still present
        if (
          state.selectedVehicleId === null ||
          !action.payload.some((d) => d.device_id === state.selectedVehicleId)
        ) {
          state.selectedVehicleId =
            action.payload.length > 0 ? action.payload[0].device_id : null;
        }
      })

      .addCase(fetchLiveDevices.rejected, (state) => {
        state.loading = false;
        state.error = "Failed to load live devices";
      });
  },
});

export const { setSelectedVehicle, setVisibleVehicleIds, updateDevice } =
  liveSlice.actions;

export default liveSlice.reducer;
