import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { getPlaybackDrivingData } from "../api/playbackDrivingData";

/* ================================
   STATE INTERFACE
================================ */
export interface DrivingPlaybackState {
  data: any | null;
  loading: boolean;
  error: string | null;
}

const initialState: DrivingPlaybackState = {
  data: null,
  loading: false,
  error: null,
};

/* ================================
   THUNK – CALL DRIVING API
================================ */
export const fetchDrivingPlaybackData = createAsyncThunk<
  any,
  { deviceId: number; start_time: string; end_time: string },
  { rejectValue: string }
>(
  "drivingPlayback/fetchDrivingPlaybackData",
  async (params, thunkAPI) => {
    try {
      return await getPlaybackDrivingData(params);
    } catch (err: any) {
      return thunkAPI.rejectWithValue(
        err?.message || "Failed to fetch driving playback data"
      );
    }
  }
);

/* ================================
   SLICE
================================ */
const drivingPlaybackSlice = createSlice({
  name: "drivingPlayback",
  initialState,
  reducers: {
    clearDrivingPlaybackData(state) {
      state.data = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder

      // 🔵 Pending
      .addCase(fetchDrivingPlaybackData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      // 🔵 Success
      .addCase(
  fetchDrivingPlaybackData.fulfilled,
  (state, action: PayloadAction<any>) => {
    state.loading = false;

    // 🔥 If API returns array → wrap only eventDataList
    if (Array.isArray(action.payload)) {
      state.data = {
        eventDataList: action.payload
      };
    } else {
      state.data = action.payload;
    }
  }
)

      // 🔴 Error
      .addCase(fetchDrivingPlaybackData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "Something went wrong";
      });
  },
});

/* ================================
   EXPORTS
================================ */
export const { clearDrivingPlaybackData } =
  drivingPlaybackSlice.actions;

export default drivingPlaybackSlice.reducer;
