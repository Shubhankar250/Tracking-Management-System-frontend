import {
  createAsyncThunk,
  createSlice,
  type PayloadAction,
} from "@reduxjs/toolkit";
import {
  createShare,
  deleteShare,
  getAllShares,
  getShareById,
  getShareLive,
  updateShare,
  type SharePositionDTO,
} from "../api/sharePositionService";

/* =========================
   State
========================= */

interface SharePositionState {
  list: SharePositionDTO[];

  totalPages: number;
  totalElements: number;
  page: number;
  size: number;

  selected: SharePositionDTO | null;
  liveData: any;

  loading: boolean;
  error: string | null;
  message: string | null;
}

const initialState: SharePositionState = {
  list: [],
  totalPages: 0,
  totalElements: 0,
  page: 0,
  size: 10,

  selected: null,
  liveData: null,

  loading: false,
  error: null,
  message: null,
};

/* =========================
   Thunks
========================= */

/** Fetch all shares */
export const fetchShares = createAsyncThunk(
  "sharePosition/fetchShares",
  async ({
    page,
    size,
    search,
  }: {
    page: number;
    size: number;
    search: string;
  }) => {
    const res = await getAllShares(page, size, search);
    return res.data;
  },
);

/** Fetch share by ID */
export const fetchShareById = createAsyncThunk(
  "sharePosition/fetchShareById",
  async (id: number) => {
    const res = await getShareById(id);
    return res.data;
  },
);

/** Create share */
export const createShareThunk = createAsyncThunk(
  "sharePosition/createShare",
  async (data: SharePositionDTO) => {
    const res = await createShare(data);
    return res.data;
  },
);

/** Update share */
export const updateShareThunk = createAsyncThunk(
  "sharePosition/updateShare",
  async (data: SharePositionDTO) => {
    const res = await updateShare(data);
    return res.data;
  },
);

/** Delete share */
export const deleteShareThunk = createAsyncThunk(
  "sharePosition/deleteShare",
  async (id: number) => {
    const res = await deleteShare(id);
    return res.data;
  },
);

/** Get Live Share */
export const fetchShareLiveThunk = createAsyncThunk(
  "sharePosition/fetchShareLive",
  async (uniqueCode: string) => {
    const res = await getShareLive(uniqueCode);
    return res.data;
  },
);

/* =========================
   Slice
========================= */

const sharePositionSlice = createSlice({
  name: "sharePosition",
  initialState,
  reducers: {
    clearSelectedShare(state) {
      state.selected = null;
    },
    clearMessage(state) {
      state.message = null;
    },
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder

      /* ===== Fetch All Shares ===== */
      .addCase(fetchShares.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchShares.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload.content;
        state.totalPages = action.payload.totalPages;
        state.totalElements = action.payload.totalElements;
        state.page = action.payload.number;
        state.size = action.payload.size;
      })
      .addCase(fetchShares.rejected, (state) => {
        state.loading = false;
        state.error = "Failed to load shares";
      })

      /* ===== Fetch Share By ID ===== */
      .addCase(fetchShareById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchShareById.fulfilled,
        (state, action: PayloadAction<SharePositionDTO>) => {
          state.loading = false;
          state.selected = action.payload;
        },
      )
      .addCase(fetchShareById.rejected, (state) => {
        state.loading = false;
        state.error = "Failed to load share";
      })

      /* ===== Create Share ===== */
      .addCase(createShareThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        createShareThunk.fulfilled,
        (state, action: PayloadAction<string>) => {
          state.loading = false;
          state.message = action.payload;
        },
      )
      .addCase(createShareThunk.rejected, (state) => {
        state.loading = false;
        state.error = "Failed to create share";
      })

      /* ===== Update Share ===== */
      .addCase(updateShareThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        updateShareThunk.fulfilled,
        (state, action: PayloadAction<string>) => {
          state.loading = false;
          state.message = action.payload;
        },
      )
      .addCase(updateShareThunk.rejected, (state) => {
        state.loading = false;
        state.error = "Failed to update share";
      })

      /* ===== Delete Share ===== */
      .addCase(deleteShareThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        deleteShareThunk.fulfilled,
        (state, action: PayloadAction<string>) => {
          state.loading = false;
          state.message = action.payload;
        },
      )
      .addCase(deleteShareThunk.rejected, (state) => {
        state.loading = false;
        state.error = "Failed to delete share";
      })

      /* ===== Live Share ===== */
      .addCase(fetchShareLiveThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchShareLiveThunk.fulfilled,
        (state, action: PayloadAction<any>) => {
          state.loading = false;
          state.liveData = action.payload;
        },
      )
      .addCase(fetchShareLiveThunk.rejected, (state) => {
        state.loading = false;
        state.error = "Failed to fetch live share";
      });
  },
});

export const { clearSelectedShare, clearMessage, clearError } =
  sharePositionSlice.actions;

export default sharePositionSlice.reducer;
