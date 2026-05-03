import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  getDeviceModals,
  createDeviceModal,
  updateDeviceModal,
  deleteDeviceModal,
  getAllModalNames,
  searchDeviceModal,
  type DeviceModalDTO,
  type DeviceModalSearchDTO,
  getAllCompanyNames,
  getDevicesByCompanyName,
  getAlertTypeForADASandDMS,
  type DeviceGroupDataProjection,
} from "../api/deviceModalService";

/* =======================
   STATE
======================= */

interface DeviceModalState {
  deviceModals: DeviceModalDTO[];
  searchResults: DeviceModalSearchDTO[];
  groupedDevices: DeviceGroupDataProjection[]; // <-- new
  modalNames: string[];
  companyNames: string[];
  devicesByCompany: DeviceModalDTO[];
  totalRecords: number;
  totalPages: number;
  currentPage: number;
  loading: boolean;
  actionLoading: boolean;
}

const initialState: DeviceModalState = {
  deviceModals: [],
  searchResults: [],
  groupedDevices: [],
  companyNames: [],
  devicesByCompany: [],
  modalNames: [],
  totalRecords: 0,
  totalPages: 0,
  currentPage: 0,
  loading: false,
  actionLoading: false,
};

/* =======================
   THUNKS
======================= */

// FETCH WITH PAGINATION
export const fetchDeviceModals = createAsyncThunk(
  "deviceModal/fetch",
  async (params: { page: number; size: number; search: string }) => {
    const res = await getDeviceModals(params);
    return res.data;
  },
);

// SEARCH DEVICE MODAL
export const searchDeviceModals = createAsyncThunk(
  "deviceModal/search",
  async (keyword: string) => {
    const res = await searchDeviceModal(keyword);
    return res.data;
  },
);

// ADD
export const addDeviceModal = createAsyncThunk(
  "deviceModal/add",
  async (formData: FormData, { rejectWithValue }) => {
    try {
      const res = await createDeviceModal(formData);
      return res.data;
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data || { message: "Something went wrong" },
      );
    }
  },
);

// UPDATE
export const editDeviceModal = createAsyncThunk(
  "deviceModal/edit",
  async (
    { id, formData }: { id: number; formData: FormData },
    { rejectWithValue },
  ) => {
    try {
      const res = await updateDeviceModal(id, formData);
      return res.data;
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data || { message: "Something went wrong" },
      );
    }
  },
);

// DELETE
export const removeDeviceModal = createAsyncThunk(
  "deviceModal/delete",
  async (id: number) => {
    const res = await deleteDeviceModal(id);
    return res.data;
  },
);

// FETCH ALL MODAL NAMES
export const fetchAllModalNames = createAsyncThunk(
  "deviceModal/fetchNames",
  async () => {
    const res = await getAllModalNames();
    return res.data;
  },
);
// 1️⃣ Fetch all company names
export const fetchAllCompanyNames = createAsyncThunk(
  "deviceModal/fetchCompanyNames",
  async () => {
    const res = await getAllCompanyNames();
    return res.data;
  }
);

// 2️⃣ Fetch devices by company name
export const fetchDevicesByCompany = createAsyncThunk(
  "deviceModal/fetchDevicesByCompany",
  async (companyName?: string) => {
    const res = await getDevicesByCompanyName(companyName);
    return res.data;
  }
);


export const fetchAlertTypeForADASandDMS = createAsyncThunk(
    "deviceModal/fetchAlertTypes",
    async (deviceIds: number[], { rejectWithValue }) => {
        try {
            const res = await getAlertTypeForADASandDMS(deviceIds);
            return res.data;
        } catch (err: any) {
            return rejectWithValue(err.response?.data || { message: "Something went wrong" });
        }
    }
);

/* =======================
   SLICE
======================= */

const deviceModalSlice = createSlice({
  name: "deviceModal",
  initialState,
  reducers: {
    clearSearchResults: (state) => {
      state.searchResults = [];
    },
  },
  extraReducers: (builder) => {
    builder

      /* ---------- FETCH PAGINATION ---------- */
      .addCase(fetchDeviceModals.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchDeviceModals.fulfilled, (state, action) => {
        state.loading = false;
        state.deviceModals = action.payload.data || [];
        state.totalRecords = action.payload.totalItems || 0;
        state.totalPages = action.payload.totalPages || 0;
        state.currentPage = action.payload.currentPage || 0;
      })
      .addCase(fetchDeviceModals.rejected, (state) => {
        state.loading = false;
      })

      /* ---------- SEARCH ---------- */
      .addCase(searchDeviceModals.pending, (state) => {
        state.loading = true;
      })
      .addCase(searchDeviceModals.fulfilled, (state, action) => {
        state.loading = false;
        state.searchResults = action.payload || [];
      })
      .addCase(searchDeviceModals.rejected, (state) => {
        state.loading = false;
      })

      /* ---------- FETCH NAMES ---------- */
      .addCase(fetchAllModalNames.fulfilled, (state, action) => {
        state.modalNames = action.payload || [];
      })

      /* ---------- ADD ---------- */
      .addCase(addDeviceModal.pending, (state) => {
        state.actionLoading = true;
      })
      .addCase(addDeviceModal.fulfilled, (state) => {
        state.actionLoading = false;
      })
      .addCase(addDeviceModal.rejected, (state) => {
        state.actionLoading = false;
      })

      /* ---------- UPDATE ---------- */
      .addCase(editDeviceModal.pending, (state) => {
        state.actionLoading = true;
      })
      .addCase(editDeviceModal.fulfilled, (state) => {
        state.actionLoading = false;
      })
      .addCase(editDeviceModal.rejected, (state) => {
        state.actionLoading = false;
      })

      /* ---------- DELETE ---------- */
      .addCase(removeDeviceModal.pending, (state) => {
        state.actionLoading = true;
      })
      .addCase(removeDeviceModal.fulfilled, (state) => {
        state.actionLoading = false;
      })
      .addCase(removeDeviceModal.rejected, (state) => {
        state.actionLoading = false;
      })
    builder.addCase(fetchAllCompanyNames.fulfilled, (state, action) => {
      state.companyNames = action.payload || [];
    });

    builder.addCase(fetchDevicesByCompany.fulfilled, (state, action) => {
      state.devicesByCompany = action.payload || [];
    })

    .addCase(fetchAlertTypeForADASandDMS.pending, (state) => {
    state.loading = true;
})
.addCase(fetchAlertTypeForADASandDMS.fulfilled, (state, action) => {
    state.loading = false;
    state.groupedDevices = action.payload || [];
})
.addCase(fetchAlertTypeForADASandDMS.rejected, (state) => {
    state.loading = false;
});

  },
});

export const { clearSearchResults } = deviceModalSlice.actions;

export default deviceModalSlice.reducer;
