import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  getMaintenance,
  getMaintenanceById,
  addMaintenance,
  updateMaintenance,
  deleteMaintenance,
} from "../api/maintenance.api";
import type { Maintenance } from "../api/maintenance.api";

interface State {
  data: Maintenance[];
  totalRecords: number;
  selected: Maintenance | null;
  loading: boolean;
}

const initialState: State = {
  data: [],
  totalRecords: 0,
  selected: null,
  loading: false,
};

export const fetchMaintenance = createAsyncThunk(
  "maintenance/fetch",
  async (params: { page: number; pageSize: number; search: string }) => {
    const res = await getMaintenance(params);
    return res.data;
  }
);

export const fetchMaintenanceById = createAsyncThunk(
  "maintenance/fetchById",
  async (id: number) => {
    const res = await getMaintenanceById(id);
    return res.data;
  }
);

export const createMaintenance = createAsyncThunk(
  "maintenance/create",
  async (payload: Partial<Maintenance>) => {
    const res = await addMaintenance(payload);
    return res.data;
  }
);

export const editMaintenance = createAsyncThunk(
  "maintenance/update",
  async (payload: Partial<Maintenance>) => {
    const res = await updateMaintenance(payload);
    return res.data;
  }
);

export const removeMaintenance = createAsyncThunk(
  "maintenance/delete",
  async (id: number) => {
    await deleteMaintenance(id);
    return id;
  }
);

const maintenanceSlice = createSlice({
  name: "maintenance",
  initialState,
  reducers: {},
  extraReducers(builder) {
    builder
      .addCase(fetchMaintenance.pending, (s) => {
        s.loading = true;
      })
      .addCase(fetchMaintenance.fulfilled, (s, a) => {
        s.data = a.payload.data;
        s.totalRecords = a.payload.totalRecords;
        s.loading = false;
      })
      .addCase(fetchMaintenance.rejected, (s) => {
        s.loading = false;
      })

      .addCase(fetchMaintenanceById.fulfilled, (s, a) => {
        s.selected = a.payload;
      })

      .addCase(createMaintenance.pending, (s) => {
        s.loading = true;
      })
      .addCase(createMaintenance.fulfilled, (s) => {
        s.loading = false;
      })
      .addCase(createMaintenance.rejected, (s) => {
        s.loading = false;
      })

      .addCase(editMaintenance.pending, (s) => {
        s.loading = true;
      })
      .addCase(editMaintenance.fulfilled, (s) => {
        s.loading = false;
      })
      .addCase(editMaintenance.rejected, (s) => {
        s.loading = false;
      })

      .addCase(removeMaintenance.pending, (s) => {
        s.loading = true;
      })
      .addCase(removeMaintenance.fulfilled, (s) => {
        s.loading = false;
      })
      .addCase(removeMaintenance.rejected, (s) => {
        s.loading = false;
      });
  },
});

export default maintenanceSlice.reducer;
