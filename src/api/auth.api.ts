// src/api/authApi.ts
import axiosClient from "./axiosClient";

/* ===================== Interfaces ===================== */

export interface LoginResponse {
  id: number;
  token: string;
  expiresIn: number;
  roles: string[];
  zlm_token: string;  
  url: string;
  username: string;
}

export interface ForgotPasswordRequest {
  email: string;
  username: string;
}

export interface VerifyUserRequest {
  token: string;
  new_password: string;
  confirm_password: string;
}

export interface LinkExpireResponse {
  status: boolean;
  msg: string;
}

/* ===================== Auth APIs (NO TOKEN) ===================== */

export const loginApi = (username: string, password: string) => {
  return axiosClient.post<LoginResponse>(
    "/auth/login",
    { username, password },
    { skipAuth: true } // 👈 IMPORTANT
  );
};

export const resetPassword = (data: ForgotPasswordRequest) => {
  return axiosClient.post<string>(
    "/auth/resetPassword",
    null,
    {
      params: {
        username: data.username,
        email: data.email,
      },
      skipAuth: true, // 👈 IMPORTANT
    }
  );
};

export const verifyUserPassword = (data: VerifyUserRequest) => {
  const params = new URLSearchParams({
    token: data.token,
    new_password: data.new_password,
    confirm_password: data.confirm_password,
  });

  return axiosClient.post(
    `/auth/users_verfication?${params.toString()}`,
    null,
    { skipAuth: true } // 👈 IMPORTANT
  );
};

export const checkLinkExpire = (token: string) =>
  axiosClient.get<LinkExpireResponse>(
    "/auth/linkexpire",
    {
      params: { token },
      skipAuth: true, // 👈 IMPORTANT
    }
  );
