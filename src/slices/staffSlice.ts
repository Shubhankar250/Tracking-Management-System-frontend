import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  getStaff,
  getStaffById,
  addStaff,
  updateStaff,
  deleteStaff,
} from "../api/staffApi";

import type { Staff } from "../api/staffApi";

interface State {
  data: Staff[];
  totalRecords: number;
  selected: Staff | null;
  loading: boolean;
}

const initialState: State = {
  data: [],
  totalRecords: 0,
  selected: null,
  loading: false,
};

// 🔥 FETCH LIST
export const fetchStaff = createAsyncThunk(
  "staff/fetch",
  async (params: {
    page: number;
    pageSize: number;
    search?: string;
  }) => {
    const res = await getStaff(params);
    return res.data;
  }
);

// 🔥 FETCH BY ID
export const fetchStaffById = createAsyncThunk(
  "staff/fetchById",
  async (id: number) => {
    const res = await getStaffById(id);
    return res.data;
  }
);

// 🔥 CREATE
export const createStaff = createAsyncThunk(
  "staff/create",
  async (payload: Partial<Staff>) => {
    const res = await addStaff(payload);
    return res.data;
  }
);

// 🔥 UPDATE
export const editStaff = createAsyncThunk(
  "staff/update",
  async (payload: Partial<Staff>) => {
    const res = await updateStaff(payload);
    return res.data;
  }
);

// 🔥 DELETE
export const removeStaff = createAsyncThunk(
  "staff/delete",
  async (id: number) => {
    await deleteStaff(id);
    return id;
  }
);

const staffSlice = createSlice({
  name: "staff",
  initialState,
  reducers: {},
  extraReducers(builder) {
    builder

      // ✅ FETCH LIST
      .addCase(fetchStaff.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchStaff.fulfilled, (state, action) => {
        state.loading = false;

        state.data = action.payload.data || [];
        state.totalRecords = action.payload.totalItems || 0;
      })
      .addCase(fetchStaff.rejected, (state) => {
        state.loading = false;
        state.data = [];
      })

      // ✅ FETCH BY ID
      .addCase(fetchStaffById.fulfilled, (state, action) => {
        state.selected = action.payload;
      })

      // ✅ CREATE
      .addCase(createStaff.pending, (s) => {
        s.loading = true;
      })
      .addCase(createStaff.fulfilled, (s) => {
        s.loading = false;
      })
      .addCase(createStaff.rejected, (s) => {
        s.loading = false;
      })

      // ✅ UPDATE
      .addCase(editStaff.pending, (s) => {
        s.loading = true;
      })
      .addCase(editStaff.fulfilled, (s) => {
        s.loading = false;
      })
      .addCase(editStaff.rejected, (s) => {
        s.loading = false;
      })

      // ✅ DELETE
      .addCase(removeStaff.pending, (s) => {
        s.loading = true;
      })
      .addCase(removeStaff.fulfilled, (s) => {
        s.loading = false;
      })
      .addCase(removeStaff.rejected, (s) => {
        s.loading = false;
      });
  },
});

export default staffSlice.reducer;