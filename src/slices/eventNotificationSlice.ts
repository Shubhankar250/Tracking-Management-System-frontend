import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit";
import {
  getAllEvents,
  getRecentEvents,
  type NotificationDTO,
} from "../api/eventNotificationService";

/* =========================
   State
========================= */
interface EventNotificationState {
  events: NotificationDTO[];
  recentEvents: NotificationDTO[];
  loading: boolean;
  error: string | null;
  
}

const initialState: EventNotificationState = {
  events: [],
  recentEvents: [],
  loading: false,
  error: null,
};

/* =========================
   Thunks
========================= */

export const fetchAllEvents = createAsyncThunk(
  "events/fetchAllEvents",
  async (
    params:
      | {
          stime?: string;
          etime?: string;
          alert_type?: string;
          deviceIds?: number[];
        }
      | undefined
  ) => {
    const res = await getAllEvents(
      params?.stime,
      params?.etime,
      params?.alert_type,
      params?.deviceIds
    );
    return res.data;
  }
);

export const fetchRecentEvents = createAsyncThunk(
  "events/fetchRecentEvents",
  async (params: { start: string; end: string }) => {
    const res = await getRecentEvents(params.start, params.end);
    return res.data;
  }
);

/* =========================
   Slice
========================= */

const eventNotificationSlice = createSlice({
  name: "eventNotification",
  initialState,
  reducers: {
    clearEvents(state) {
      state.events = [];
    },
    clearRecentEvents(state) {
      state.recentEvents = [];
    },
  },
  extraReducers: (builder) => {
    builder
      /* ===== Fetch All Events ===== */
      .addCase(fetchAllEvents.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllEvents.fulfilled, (state, action: PayloadAction<NotificationDTO[]>) => {
        state.loading = false;
        state.events = action.payload;
      })
      .addCase(fetchAllEvents.rejected, (state) => {
        state.loading = false;
        state.error = "Failed to load events";
      })

      /* ===== Fetch Recent Events ===== */
      .addCase(fetchRecentEvents.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRecentEvents.fulfilled, (state, action: PayloadAction<NotificationDTO[]>) => {
        state.loading = false;
        state.recentEvents = action.payload;
      })
      .addCase(fetchRecentEvents.rejected, (state) => {
        state.loading = false;
        state.error = "Failed to load recent events";
      });
  },
});

export const { clearEvents, clearRecentEvents } = eventNotificationSlice.actions;
export default eventNotificationSlice.reducer;
