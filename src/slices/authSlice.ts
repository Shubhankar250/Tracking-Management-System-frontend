import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { getUserById } from "../api/users.api";

interface Permission {
  permission: string;
  read: boolean;
  write: boolean;
  delete: boolean;
}

interface AuthState {
  token: string | null;
  roles: string[];
  userId: number | null;
  zlm_token: string | null;
  url: string | null;
  username: string | null;
  user?: any;
  permissions: Permission[];
  loading: boolean;
}

const initialState: AuthState = {
  token: localStorage.getItem("token"),
  roles: JSON.parse(localStorage.getItem("roles") || "[]"),
  userId: localStorage.getItem("userId")
    ? Number(localStorage.getItem("userId"))
    : null,
  zlm_token: localStorage.getItem("zlm_token"),
  url: localStorage.getItem("url") || null,
  username: localStorage.getItem("username"),
  user: undefined,
  permissions: [],
  loading: false,
};

interface LoginPayload {
  token: string;
  roles: string[];
  id: number;
  zlm_token: string;
  url: string;
  username:string
}

export const fetchLoggedInUser = createAsyncThunk(
  "auth/fetchLoggedInUser",
  async () => {
    const res = await getUserById(0); // 👈 key part
    return res.data;
  },
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    loginSuccess(state, action: PayloadAction<LoginPayload>) {
      state.token = action.payload.token;
      state.roles = action.payload.roles;
      state.userId = action.payload.id;
      state.zlm_token = action.payload.zlm_token;
      state.url = action.payload.url;
      state.username=action.payload.username
      localStorage.setItem("token", action.payload.token);
      localStorage.setItem("roles", JSON.stringify(action.payload.roles));
      localStorage.setItem("userId", action.payload.id.toString());
      localStorage.setItem("zlm_token", action.payload.zlm_token);
      localStorage.setItem("url", action.payload.url);
      localStorage.setItem("username", action.payload.username);
    },

    /* 🔥 ADD THIS HERE */
    updateZlmToken(
      state,
      action: PayloadAction<{ zlm_token: string; url: string }>,
    ) {
      state.zlm_token = action.payload.zlm_token;
      state.url = action.payload.url;

      localStorage.setItem("zlm_token", action.payload.zlm_token);
      localStorage.setItem("url", action.payload.url);
    },

    logout(state) {
      state.token = null;
      state.roles = [];
      state.userId = null;
      state.zlm_token = null;
      state.url = null;
      state.username=null;
      state.user = undefined;
      state.permissions = [];

      localStorage.removeItem("token");
      localStorage.removeItem("roles");
      localStorage.removeItem("userId");
      localStorage.removeItem("zlm_token");
      localStorage.removeItem("url");
      localStorage.removeItem("permissions");
      localStorage.removeItem("username");
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(fetchLoggedInUser.pending, (state) => {
        state.loading = true;
      })

      .addCase(fetchLoggedInUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;

        // ✅ Safe permission parsing
        try {
          const raw = action.payload.permissions;
          state.permissions =
            typeof raw === "string" ? JSON.parse(raw) : raw || [];
        } catch {
          state.permissions = [];
        }
        localStorage.setItem("permissions", JSON.stringify(state.permissions));

        // ✅ Sync roles from backend
        state.roles = action.payload.role || [];
        localStorage.setItem("roles", JSON.stringify(state.roles));
      })

      .addCase(fetchLoggedInUser.rejected, (state) => {
        state.loading = false;
      });
  },
});

export const { loginSuccess, logout, updateZlmToken } = authSlice.actions;
export default authSlice.reducer;
