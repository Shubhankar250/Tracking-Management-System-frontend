// slices/playbackSlice.ts

import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { getPlaybackData } from "../api/playbackApi";
import type { PlaybackRequest } from "../api/playbackApi"; // ✅ type-only import

export interface PlaybackState {
  data: any | null;
  loading: boolean;
  error: string | null;
}

const initialState: PlaybackState = {
  data: null,
  loading: false,
  error: null
};

/* -------- THUNK -------- */
export const fetchPlaybackData = createAsyncThunk<
  any,                 // response type
  PlaybackRequest,     // request type
  { rejectValue: string }
>(
  "playback/fetchPlaybackData",
  async (params, thunkAPI) => {
    try {
      return await getPlaybackData(params);
    } catch (err: any) {
      return thunkAPI.rejectWithValue(err.message);
    }
  }
);

/* -------- SLICE -------- */
const playbackSlice = createSlice({
  name: "playback",
  initialState,
  reducers: {
    clearPlaybackData(state) {
      state.data = null;
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPlaybackData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchPlaybackData.fulfilled,
        (state, action: PayloadAction<any>) => {
          state.loading = false;
          state.data = action.payload;
        }
      )
      .addCase(fetchPlaybackData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "Something went wrong";
      });
  }
});

export const { clearPlaybackData } = playbackSlice.actions;
export default playbackSlice.reducer;
