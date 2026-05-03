import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  getSoftwareReleases,
  getSoftwareReleaseById,
  addSoftwareRelease,
  updateSoftwareRelease,
  deleteSoftwareRelease,
} from "../api/software.api";

import type { SoftwareRelease } from "../api/software.api";

interface State {
  data: SoftwareRelease[];
  totalRecords: number;
  selected: SoftwareRelease | null;
  loading: boolean;
}

const initialState: State = {
  data: [],
  totalRecords: 0,
  selected: null,
  loading: false,
};

export const fetchSoftwareReleases = createAsyncThunk(
  "software/fetch",
  async (params: { page: number; pageSize: number; search: string }) => {
    const res = await getSoftwareReleases(params);
    return res.data;
  }
);

export const fetchSoftwareReleaseById = createAsyncThunk(
  "software/fetchById",
  async (id: number) => {
    const res = await getSoftwareReleaseById(id);
    return res.data;
  }
);

export const createSoftwareRelease = createAsyncThunk(
  "software/create",
  async (payload: Partial<SoftwareRelease>) => {
    const res = await addSoftwareRelease(payload);
    return res.data;
  }
);

export const editSoftwareRelease = createAsyncThunk(
  "software/update",
  async (payload: Partial<SoftwareRelease>) => {
    const res = await updateSoftwareRelease(payload);
    return res.data;
  }
);

export const removeSoftwareRelease = createAsyncThunk(
  "software/delete",
  async (id: number) => {
    await deleteSoftwareRelease(id);
    return id;
  }
);

const softwareSlice = createSlice({
  name: "software",
  initialState,
  reducers: {},
  extraReducers(builder) {
    builder
      .addCase(fetchSoftwareReleases.pending, (s) => {
        s.loading = true;
      })
      .addCase(fetchSoftwareReleases.fulfilled, (s, a) => {
        s.data = a.payload.data;
        s.totalRecords = a.payload.totalRecords;
        s.loading = false;
      })
      .addCase(fetchSoftwareReleases.rejected, (s) => {
        s.loading = false;
      })

      .addCase(fetchSoftwareReleaseById.fulfilled, (s, a) => {
        s.selected = a.payload;
      })

      .addCase(createSoftwareRelease.pending, (s) => {
        s.loading = true;
      })
      .addCase(createSoftwareRelease.fulfilled, (s) => {
        s.loading = false;
      })
      .addCase(createSoftwareRelease.rejected, (s) => {
        s.loading = false;
      })

      .addCase(editSoftwareRelease.pending, (s) => {
        s.loading = true;
      })
      .addCase(editSoftwareRelease.fulfilled, (s) => {
        s.loading = false;
      })
      .addCase(editSoftwareRelease.rejected, (s) => {
        s.loading = false;
      })

      .addCase(removeSoftwareRelease.pending, (s) => {
        s.loading = true;
      })
      .addCase(removeSoftwareRelease.fulfilled, (s) => {
        s.loading = false;
      })
      .addCase(removeSoftwareRelease.rejected, (s) => {
        s.loading = false;
      });
  },
});

export default softwareSlice.reducer;