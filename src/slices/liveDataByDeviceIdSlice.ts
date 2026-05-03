// src/store/slices/liveDataSlice.ts
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getLiveDataByDeviceId } from "../api/livedatabydeviceId";
import type { LiveDataBean } from "../api/livedatabydeviceId";

interface LiveDataState {
  data: LiveDataBean | null;
  loading: boolean;
  error: string | null;
}

const initialState: LiveDataState = {
  data: null,
  loading: false,
  error: null,
};

// 🔥 THUNK
export const fetchLiveDataByDeviceId = createAsyncThunk<
  LiveDataBean,
  number,
  { rejectValue: string }
>("liveData/fetchByDeviceId", async (deviceId, { rejectWithValue }) => {
  try {
    const response = await getLiveDataByDeviceId(deviceId);
    return response.data;
  } catch (error: any) {
    return rejectWithValue(
      error?.response?.data || "Failed to fetch live device data"
    );
  }
});

const liveDataByDeviceIdSlice = createSlice({
  name: "liveData",
  initialState,
  reducers: {
    clearLiveData(state) {
      state.data = null;
      state.error = null;
      state.loading = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchLiveDataByDeviceId.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchLiveDataByDeviceId.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchLiveDataByDeviceId.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Something went wrong";
      });
  },
});

export const { clearLiveData } = liveDataByDeviceIdSlice.actions;
export default liveDataByDeviceIdSlice.reducer;
