// src/api/axiosClient.ts
import axios from "axios";
import type { AxiosError, InternalAxiosRequestConfig } from "axios";
import { tokenService } from "./tokenService";
import { logout } from "../slices/authSlice";
import { store } from "../redux/store";

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ??
  (import.meta.env.DEV ? "/api-proxy" : "http://localhost:8091/");

/* ================= TYPE AUGMENTATION ================= */
declare module "axios" {
  export interface AxiosRequestConfig {
    skipAuth?: boolean;
    _retry?: boolean;
  }

  export interface InternalAxiosRequestConfig {
    skipAuth?: boolean;
    _retry?: boolean;
  }
}
/* ===================================================== */

const axiosClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

/* ================= REQUEST INTERCEPTOR ================= */
axiosClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (config.skipAuth) return config;

    const token = tokenService.getAccessToken();
    if (token) {
      config.headers.set("Authorization", `Bearer ${token}`);
    }

    return config;
  },
  (error) => Promise.reject(error),
);

/* ================= RESPONSE INTERCEPTOR ================= */
axiosClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config;

    // No config → just fail
    if (!originalRequest) {
      return Promise.reject(error);
    }

    //  401 handling
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.skipAuth
    ) {
      originalRequest._retry = true;

      try {
        const refreshToken = tokenService.getRefreshToken();
        if (!refreshToken) throw new Error("No refresh token");

        // 🔁 Refresh token API
        const res = await axiosClient.post(
          "/auth/refresh-token",
          { refreshToken },
          { skipAuth: true },
        );

        const newAccessToken = res.data.token;
        tokenService.setTokens(newAccessToken);

        // 🔁 Retry original request
        originalRequest.headers?.set(
          "Authorization",
          `Bearer ${newAccessToken}`,
        );

        return axiosClient(originalRequest);
      } catch (refreshError) {
        // ❌ Refresh failed → logout
        if (
          error.response?.status === 401 &&
          originalRequest._retry &&
          !originalRequest.skipAuth
        ) {
          store.dispatch(logout());
          window.location.replace("/");
        }
        return Promise.reject(refreshError);
      }
    }

    // 🚨 Global error handler
    console.error("API Error:", error.response?.data || error.message);
    return Promise.reject(error);
  },
);

export default axiosClient;
