import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { dashboardService } from "../api/dashboardService";

export interface DashboardState {
  loading: boolean;
  data: any;
  error: string | null;
}

const initialState: DashboardState = {
  loading: false,
  data: null,
  error: null,
};

export const fetchDashboardData = createAsyncThunk(
  "dashboard/fetchDashboardData",
  async (_, { rejectWithValue }) => {
    try {
      return await dashboardService.getDashboardData();
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

const dashboardSlice = createSlice({
  name: "dashboard",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboardData.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchDashboardData.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchDashboardData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default dashboardSlice.reducer;
