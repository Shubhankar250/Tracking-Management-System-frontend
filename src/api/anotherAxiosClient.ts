import axios, { type InternalAxiosRequestConfig } from "axios";
// 🔹 baseURL now comes from localStorage (url)
export const ANOTHER_API_BASE = localStorage.getItem("url") || "";

const anotherAxiosClient = axios.create({
  baseURL: ANOTHER_API_BASE,
  headers: {
    "Content-Type": "application/json",
  },
});

// (Optional) reuse same interceptors
anotherAxiosClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if ((config as any).skipAuth) return config;

    // 🔹 token now comes from zlm_token
    const token = localStorage.getItem("zlm_token");
console.log(token)
    if (token) {
      config.headers.set("Authorization", `Bearer ${token}`);
    }

    return config;
  }
);

export default anotherAxiosClient;
