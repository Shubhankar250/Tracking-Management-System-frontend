import {
  createAsyncThunk,
  createSlice,
  type PayloadAction,
} from "@reduxjs/toolkit";
import {
  createAlert,
  deleteAlert,
  getAlertById,
  getAllAlerts,
  getCommandNames,
  toggleAlertStatus,
  updateAlert,
  type AlertSettingDTO,
} from "../api/alertApi";

/* =========================
   STATE
========================= */

interface AlertState {
  list: any[];
  selected: AlertSettingDTO | null;
  commandNames: string[];   // 👈 add this

  page: number;
  size: number;
  totalElements: number;

  loading: boolean;
  error: string | null;
  message: string | null;
}

const initialState: AlertState = {
  list: [],
  selected: null,
  commandNames: [],
  page: 0,
  size: 10,
  totalElements: 0,

  loading: false,
  error: null,
  message: null,
};

/* =========================
   THUNKS
========================= */

export const fetchAlerts = createAsyncThunk(
  "alerts/fetchAll",
  async ({ page, size, search }: { page: number; size: number; search: string; }) => {
    const res = await getAllAlerts(page, size, search);
    return res.data;
  },
);

export const fetchAlertById = createAsyncThunk(
  "alerts/fetchById",
  async (id: number) => {
    const res = await getAlertById(id);
    return res.data;
  },
);

export const createAlertThunk = createAsyncThunk(
  "alerts/create",
  async (data: AlertSettingDTO, { dispatch, getState }) => {
    const res = await createAlert(data);

    const state: any = getState();
    dispatch(
      fetchAlerts({
        page: state.alerts.page,
        size: state.alerts.size,
        search: state.alerts.search,
      })
    );

    return res.data;
  }
);
;

export const updateAlertThunk = createAsyncThunk(
  "alerts/update",
  async (data: AlertSettingDTO, { dispatch, getState }) => {
    const res = await updateAlert(data);

    const state: any = getState();
    dispatch(
      fetchAlerts({
        page: state.alerts.page,
        size: state.alerts.size,
        search: state.alerts.search,
      })
    );

    return res.data.message;
  }
);


export const deleteAlertThunk = createAsyncThunk(
  "alerts/delete",
  async (id: number, { dispatch, getState }) => {
    const res = await deleteAlert(id);

    const state: any = getState();
    dispatch(
      fetchAlerts({
        page: state.alerts.page,
        size: state.alerts.size,
        search: state.alerts.search,
      })
    );

    return res.data.message;
  }
);

export const toggleAlertStatusThunk = createAsyncThunk(
  "alerts/toggleStatus",
  async (id: number, { dispatch, getState }) => {
    const res = await toggleAlertStatus(id);

    const state: any = getState();
    dispatch(
      fetchAlerts({
        page: state.alerts.page,
        size: state.alerts.size,
        search: state.alerts.search,
      })
    );

    return res.data.message;
  }
);
export const fetchCommandNamesThunk = createAsyncThunk(
  "alerts/fetchCommandNames",
  async (alertType: string) => {
    const res = await getCommandNames(alertType);
    return res.data;
  }
);
/* =========================
   SLICE
========================= */

const alertSlice = createSlice({
  name: "alerts",
  initialState,
  reducers: {
    clearAlertMessage(state) {
      state.message = null;
    },
    clearAlertError(state) {
      state.error = null;
    },
    clearSelectedAlert(state) {
      state.selected = null;
    },
  },
  extraReducers: (builder) => {
    builder

      /* FETCH ALL */
      .addCase(fetchAlerts.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAlerts.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload.content;
        state.totalElements = action.payload.totalElements;
        state.page = action.payload.number;
        state.size = action.payload.size;
      })

      .addCase(fetchAlerts.rejected, (state) => {
        state.loading = false;
        state.error = "Failed to fetch alerts";
      })

      /* FETCH BY ID */
      .addCase(fetchAlertById.pending, (state) => {
        state.loading = true;
      })
      .addCase(
        fetchAlertById.fulfilled,
        (state, action: PayloadAction<AlertSettingDTO>) => {
          state.loading = false;
          state.selected = action.payload;
        },
      )
      .addCase(fetchAlertById.rejected, (state) => {
        state.loading = false;
        state.error = "Failed to fetch alert";
      })

      /* CREATE */
      .addCase(createAlertThunk.pending, (state) => {
        state.loading = true;
      })
      .addCase(
        createAlertThunk.fulfilled,
        (state, action: PayloadAction<string>) => {
          state.loading = false;
          state.message = action.payload;
        },
      )
      .addCase(createAlertThunk.rejected, (state) => {
        state.loading = false;
        state.error = "Create alert failed";
      })

      /* UPDATE */
      .addCase(updateAlertThunk.pending, (state) => {
        state.loading = true;
      })
      .addCase(
        updateAlertThunk.fulfilled,
        (state, action: PayloadAction<string>) => {
          state.loading = false;
          state.message = action.payload;
        },
      )
      .addCase(updateAlertThunk.rejected, (state) => {
        state.loading = false;
        state.error = "Update alert failed";
      })

      /* DELETE */
      .addCase(deleteAlertThunk.pending, (state) => {
        state.loading = true;
      })
      .addCase(
        deleteAlertThunk.fulfilled,
        (state, action: PayloadAction<string>) => {
          state.loading = false;
          state.message = action.payload;
        },
      )
      .addCase(deleteAlertThunk.rejected, (state) => {
        state.loading = false;
        state.error = "Delete alert failed";
      })
      /* TOGGLE STATUS */
      .addCase(toggleAlertStatusThunk.pending, (state) => {
        state.loading = true;
      })
      .addCase(
        toggleAlertStatusThunk.fulfilled,
        (state, action: PayloadAction<string>) => {
          state.loading = false;
          state.message = action.payload;
        }
      )
      .addCase(toggleAlertStatusThunk.rejected, (state) => {
        state.loading = false;
        state.error = "Toggle alert status failed";
      })
      /* FETCH COMMAND NAMES */
      .addCase(fetchCommandNamesThunk.pending, (state) => {
        state.loading = true;
      })
      .addCase(
        fetchCommandNamesThunk.fulfilled,
        (state, action: PayloadAction<string[]>) => {
          state.loading = false;
          state.commandNames = action.payload;
        }
      )
      .addCase(fetchCommandNamesThunk.rejected, (state) => {
        state.loading = false;
        state.error = "Failed to fetch command names";
      })
  },
});

export const { clearAlertError, clearAlertMessage, clearSelectedAlert } =
  alertSlice.actions;

export default alertSlice.reducer;
