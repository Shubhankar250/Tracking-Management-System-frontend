import anotherAxiosClient from "./anotherAxiosClient";

export interface ZlmLoginRequest {
  email: string;
  password: string;
}

export interface ZlmLoginResponse {
  token: string;
  expiresIn: number;
}

/** LOGIN → GET EXTERNAL TOKEN */
export const loginZlm = (data: ZlmLoginRequest) =>
  anotherAxiosClient.post<ZlmLoginResponse>("/auth/login", data, {
    skipAuth: true,
  });
