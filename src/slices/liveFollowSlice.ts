import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import { getLiveDataForFollow } from "../api/liveFollowService";
import type { LiveDataDto } from "../api/liveFollowService";

interface LiveFollowState {
  data: LiveDataDto | null;
  loading: boolean;
  error: string | null;
}

const initialState: LiveFollowState = {
  data: null,
  loading: false,
  error: null,
};

/* ================= API LOAD ================= */

export const fetchLiveFollowData = createAsyncThunk(
  "liveFollow/fetch",
  async (deviceId: number) => {
    return await getLiveDataForFollow(deviceId);
  }
);

/* ================= SLICE ================= */

const liveFollowSlice = createSlice({
  name: "liveFollow",
  initialState,

  reducers: {
    clearLiveFollow(state) {
      state.data = null;
    },

    /* ⭐ WebSocket realtime update ⭐ */
    wsUpdate(state, action: PayloadAction<any>) {
      const ws = action.payload;

      if (!state.data) return;
      if (ws.device_id !== state.data.device_id) return;

      state.data = {
        ...state.data,
        latitude: ws.latitude,
        longitude: ws.longitude,
        speed: ws.speed,
        course: ws.course,
        devicetime: ws.devicetime,
      };
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(fetchLiveFollowData.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchLiveFollowData.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchLiveFollowData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch live data";
      });
  },
});

export const { clearLiveFollow, wsUpdate } = liveFollowSlice.actions;
export default liveFollowSlice.reducer;
