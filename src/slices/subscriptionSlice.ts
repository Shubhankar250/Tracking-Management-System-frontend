import {
  createAsyncThunk,
  createSlice,
  type PayloadAction,
} from "@reduxjs/toolkit";
import {
  addSubscription,
  getAllCountries,
  getAllSubscriptions,
  getSubscriptionById,
  updateSubscription,
  updateSubscriptionPoints,
  type SubscriptionMasterDTO,
} from "../api/subscriptionService";

/* =========================
   State
========================= */
interface SubscriptionState {
  list: SubscriptionMasterDTO[];
  selected: SubscriptionMasterDTO | null;
  countries: Record<number, string>;
  loading: boolean;
  error: string | null;
  message: string | null;
  page: number;
  size: number;
  totalPages: number;
  totalElements: number;
}

const initialState: SubscriptionState = {
  list: [],
  selected: null,
  countries: {},
  loading: false,
  error: null,
  message: null,
  page: 0,
  size: 10,
  totalPages: 0,
  totalElements: 0,
};

/* =========================
   Thunks
========================= */

/** Get Countries */
export const fetchCountries = createAsyncThunk(
  "subscription/fetchCountries",
  async () => {
    const res = await getAllCountries();
    return res.data;
  },
);

/** Get All Subscriptions */
export const fetchSubscriptions = createAsyncThunk(
  "subscription/fetchSubscriptions",
  async ({ page, size, search }: { page: number; size: number; search: string; }) => {
    const res = await getAllSubscriptions(page, size, search);
    return res.data;
  },
);

/** Get Subscription By ID */
export const fetchSubscriptionById = createAsyncThunk(
  "subscription/fetchSubscriptionById",
  async (id: number) => {
    const res = await getSubscriptionById(id);
    return res.data;
  },
);

/** Add Subscription */
export const createSubscription = createAsyncThunk(
  "subscription/createSubscription",
  async (data: SubscriptionMasterDTO) => {
    const res = await addSubscription(data);
    return res.data;
  },
);

/** Update Subscription */
export const editSubscription = createAsyncThunk(
  "subscription/editSubscription",
  async (data: SubscriptionMasterDTO) => {
    const res = await updateSubscription(data);
    return res.data;
  },
);

/** Update Subscription Points */
export const updateUserSubscriptionPoints = createAsyncThunk(
  "subscription/updateUserSubscriptionPoints",
  async (points: number) => {
    const res = await updateSubscriptionPoints(points);
    return res.data; // "Payment Done Successfully" or "Failed!"
  },
);

/* =========================
   Slice
========================= */
const subscriptionSlice = createSlice({
  name: "subscription",
  initialState,
  reducers: {
    clearSelectedSubscription(state) {
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
      /* ===== Fetch Countries ===== */
      .addCase(fetchCountries.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchCountries.fulfilled,
        (state, action: PayloadAction<Record<number, string>>) => {
          state.loading = false;
          state.countries = action.payload;
        },
      )
      .addCase(fetchCountries.rejected, (state) => {
        state.loading = false;
        state.error = "Failed to load countries";
      })

      /* ===== Fetch Subscriptions ===== */
      .addCase(fetchSubscriptions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSubscriptions.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload.content;
        state.totalPages = action.payload.totalPages;
        state.totalElements = action.payload.totalElements;
        state.page = action.payload.number;
        state.size = action.payload.size;
      })

      .addCase(fetchSubscriptions.rejected, (state) => {
        state.loading = false;
        state.error = "Failed to load subscriptions";
      })

      /* ===== Fetch Subscription By ID ===== */
      .addCase(fetchSubscriptionById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchSubscriptionById.fulfilled,
        (state, action: PayloadAction<SubscriptionMasterDTO>) => {
          state.loading = false;
          state.selected = action.payload;
        },
      )
      .addCase(fetchSubscriptionById.rejected, (state) => {
        state.loading = false;
        state.error = "Failed to load subscription";
      })

      /* ===== Create Subscription ===== */
      .addCase(createSubscription.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createSubscription.fulfilled, (state) => {
        state.loading = false;
        state.message = "Subscription added successfully";
      })
      .addCase(createSubscription.rejected, (state) => {
        state.loading = false;
        state.error = "Failed to add subscription";
      })

      /* ===== Update Subscription ===== */
      .addCase(editSubscription.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(editSubscription.fulfilled, (state) => {
        state.loading = false;
        state.message = "Subscription updated successfully";
      })
      .addCase(editSubscription.rejected, (state) => {
        state.loading = false;
        state.error = "Failed to update subscription";
      })

      /* ===== Update Subscription Points ===== */
      .addCase(updateUserSubscriptionPoints.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.message = null;
      })
      .addCase(
        updateUserSubscriptionPoints.fulfilled,
        (state, action: PayloadAction<string>) => {
          state.loading = false;
          state.message = action.payload; // e.g. "Payment Done Successfully"
        },
      )
      .addCase(updateUserSubscriptionPoints.rejected, (state) => {
        state.loading = false;
        state.error = "Failed to update subscription points";
      });
  },
});

export const { clearSelectedSubscription, clearMessage, clearError } =
  subscriptionSlice.actions;
export default subscriptionSlice.reducer;
