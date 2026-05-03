import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { SettingDTO, SettingLogoDTO } from "../api/settingsService";
import * as settingsAPI from "../api/settingsService";

/* =========================
   STATE
========================= */

interface SettingsState {
  loading: boolean;
  error: string | null;
  successMessage: string | null;
    data: SettingDTO | null;   // 👈 ADD THIS

}

const initialState: SettingsState = {
  loading: false,
  error: null,
  successMessage: null,
    data: null,                // 👈 ADD THIS

};

/* =========================
   THUNKS
========================= */

// Update Settings
export const updateSettingsThunk = createAsyncThunk(
  "settings/updateSettings",
  async (data: SettingDTO) => {
    const res = await settingsAPI.updateSettings(data);
    return res.data;
  }
);

// Update Logos
export const updateLogosThunk = createAsyncThunk<
  string,
  {
    logo: SettingLogoDTO;
    files: {
      frontpageLogo?: File;
      favicon?: File;
      loginPageLogo?: File;
      backgroundImage?: File;
    };
  }
>("settings/updateLogos", async ({ logo, files }, { rejectWithValue }) => {
  try {
    const res = await settingsAPI.updateLogos(logo, files);
    return res.data;
  } catch (err: any) {
    return rejectWithValue(err?.response?.data || "Logo update failed");
  }
});


// Welcome View
export const updateWelcomeViewThunk = createAsyncThunk(
  "settings/updateWelcomeView",
  async () => {
    const res = await settingsAPI.updateWelcomeView();
    return res.data;
  }
);
// Get Settings
export const getSettingsThunk = createAsyncThunk<
  SettingDTO,
  void,
  { rejectValue: string }
>("settings/getSettings", async (_, { rejectWithValue }) => {
  try {
    const res = await settingsAPI.getSettings();
    return res.data;
  } catch (err: any) {
    return rejectWithValue(err?.response?.data || "Failed to load settings");
  }
});

/* =========================
   SLICE
========================= */

const settingsSlice = createSlice({
  name: "settings",
  initialState,
  reducers: {
    clearSettingsState(state) {
      state.error = null;
      state.successMessage = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Update Settings
      .addCase(updateSettingsThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateSettingsThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = action.payload;
      })
      .addCase(updateSettingsThunk.rejected, (state, action: any) => {
  state.loading = false;
  state.error = action.payload || "Failed to update settings";
})


      // Update Logos
      .addCase(updateLogosThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateLogosThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = action.payload;
      })
   .addCase(updateLogosThunk.rejected, (state, action: any) => {
  state.loading = false;
  state.error = action.payload || "Failed to update logos";
})


      // Welcome View
      .addCase(updateWelcomeViewThunk.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateWelcomeViewThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = action.payload;
      })
     .addCase(updateWelcomeViewThunk.rejected, (state, action: any) => {
  state.loading = false;
  state.error = action.payload || "Failed to update welcome view";
})
// Get Settings
.addCase(getSettingsThunk.pending, (state) => {
  state.loading = true;
  state.error = null;
})
.addCase(getSettingsThunk.fulfilled, (state, action) => {
  state.loading = false;
  state.data = action.payload;   // 👈 store settings
})
.addCase(getSettingsThunk.rejected, (state, action: any) => {
  state.loading = false;
  state.error = action.payload || "Failed to fetch settings";
})

  },
});

export const { clearSettingsState } = settingsSlice.actions;
export default settingsSlice.reducer;
