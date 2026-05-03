// src/slices/setupSlice.ts
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  getDriverData,
  addDriverData,
  updateDriverData,
  deleteDriverData,
  getSMSData,
  addSMSData,
  updateSMSData,
  getEMAILData,
  addEMAILData,
  updateEMAILData,
  getGPRSData,
  addGPRSData,
  updateGPRSData,
  deleteTemplate,
  getObjectsData,
  getUserDataSetup,
  updateUserDataSetup,
  type CustomUserDTO,
  getAllDriverMap,
} from "../api/setupServices.api";

/* =======================
   STATE
======================= */

export interface SetupObject {
  id: number;
  name: string;
  vehicle_status: string;
}

interface SetupState {
  drivers: any[];
  driverMap: Record<number, string>;   
  templates: any[];
  objects: SetupObject[];
  userSetup: CustomUserDTO | null;
  totalRecords: number;
  loading: boolean;
}

const initialState: SetupState = {
  drivers: [],
  driverMap: {},  
  templates: [],
  objects: [],
  userSetup: null,
  totalRecords: 0,
  loading: false,
};

/* =======================
   THUNKS – DRIVERS
======================= */

export const fetchDrivers = createAsyncThunk(
  "setup/fetchDrivers",
  async (params: { page: number; size: number; search: string }) => {
    const res = await getDriverData(params);
    return res.data;
  },
);

export const createDriver = createAsyncThunk(
  "setup/createDriver",
  async (payload: any) => {
    const res = await addDriverData(payload);
    return res.data;
  },
);

export const editDriver = createAsyncThunk(
  "setup/editDriver",
  async (payload: any) => {
    const res = await updateDriverData(payload);
    return res.data;
  },
);

export const removeDriver = createAsyncThunk(
  "setup/removeDriver",
  async (id: number) => {
    const res = await deleteDriverData(id);
    return res.data;
  },
);

/* =======================
   THUNKS – TEMPLATES
======================= */

export const fetchSMS = createAsyncThunk(
  "setup/fetchSMS",
  async ({ page, size, search }: any) => {
    const res = await getSMSData(page, size, search);
    return res.data;
  },
);

export const createSMSTemplate = createAsyncThunk(
  "setup/createSMSTemp",
  async (payload: any) => {
    const res = await addSMSData(payload);
    return res.data;
  },
);

export const editSMSTemplate = createAsyncThunk(
  "setup/editSMSTemp",
  async (payload: any) => {
    const res = await updateSMSData(payload);
    return res.data;
  },
);

export const fetchEMAIL = createAsyncThunk(
  "setup/fetchEMAIL",
  async ({ page, size, search }: any) => {
    const res = await getEMAILData(page, size, search);
    return res.data;
  },
);

export const createEMAILTemplate = createAsyncThunk(
  "setup/createEMAILTemplate",
  async (payload: any) => {
    const res = await addEMAILData(payload);
    return res.data;
  },
);

export const editEMAILTemplate = createAsyncThunk(
  "setup/editEMAILTemplate",
  async (payload: any) => {
    const res = await updateEMAILData(payload);
    return res.data;
  },
);

export const fetchGPRS = createAsyncThunk(
  "setup/fetchGPRS",
  async ({ page, size, search }: any) => {
    const res = await getGPRSData(page, size, search);
    return res.data;
  },
);

export const createGPRSTemplate = createAsyncThunk(
  "setup/createGPRSTemplate",
  async (payload: any) => {
    const res = await addGPRSData(payload);
    return res.data;
  },
);

export const editGPRSTemplate = createAsyncThunk(
  "setup/editGPRSTemplate",
  async (payload: any) => {
    const res = await updateGPRSData(payload);
    return res.data;
  },
);

export const fetchObjects = createAsyncThunk(
  "setup/fetchObjects",
  async ({ page, size, search }: any) => {
    const res = await getObjectsData(page, size, search);
    return res.data;
  },
);

export const removeTemplate = createAsyncThunk(
  "setup/removeTemplate",
  async (id: number) => {
    const res = await deleteTemplate(id);
    return res.data;
  },
);

export const updateusersetup = createAsyncThunk(
  "setup/updateusersetup",
  async (payload: any) => {
    const res = await updateUserDataSetup(payload);
    return res.data;
  },
);

export const fetchUserSetup = createAsyncThunk(
  "setup/fetchUserSetup",
  async () => {
    const res = await getUserDataSetup();
    return res.data;
  },
);
export const fetchAllDriverMap = createAsyncThunk(
  "setup/fetchAllDriverMap",
  async () => {
    const res = await getAllDriverMap();
    return res.data;
  },
);

/* =======================
   SLICE
======================= */

const setupSlice = createSlice({
  name: "setup",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder

      /* ---------- DRIVERS ---------- */
      .addCase(fetchDrivers.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchDrivers.fulfilled, (state, action) => {
        state.loading = false;
        state.drivers = action.payload.data || [];
        state.totalRecords = action.payload.totalItems || 0;
      })
      .addCase(fetchDrivers.rejected, (state) => {
        state.loading = false;
      })

      /* ---------- TEMPLATES ---------- */
      .addCase(fetchSMS.fulfilled, (state, action) => {
        state.templates = action.payload.data || [];
        state.totalRecords = action.payload.totalItems || 0;
      })
      .addCase(fetchEMAIL.fulfilled, (state, action) => {
        state.templates = action.payload.data || [];
        state.totalRecords = action.payload.totalItems || 0;
      })
      .addCase(fetchGPRS.fulfilled, (state, action) => {
        state.templates = action.payload.data || [];
        state.totalRecords = action.payload.totalItems || 0;
      })
      .addCase(fetchObjects.fulfilled, (state, action) => {
        state.objects = action.payload.data || [];
        state.totalRecords = action.payload.totalItems || 0;
      })

      /* ---------- USER SETUP ---------- */
      .addCase(fetchUserSetup.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchUserSetup.fulfilled, (state, action) => {
        state.loading = false;
        state.userSetup = action.payload;
      })
      .addCase(fetchUserSetup.rejected, (state) => {
        state.loading = false;
      })
     .addCase(fetchAllDriverMap.pending, (state) => {
  state.loading = true;
})
.addCase(fetchAllDriverMap.fulfilled, (state, action) => {
  state.loading = false;
  state.driverMap = action.payload || {};
})
.addCase(fetchAllDriverMap.rejected, (state) => {
  state.loading = false;
});

  },
});

export default setupSlice.reducer;
