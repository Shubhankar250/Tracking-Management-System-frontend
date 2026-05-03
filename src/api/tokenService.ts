// src/api/tokenService.ts
export const tokenService = {
  getAccessToken(): string | null {
    return localStorage.getItem("token");
  },

  getRefreshToken(): string | null {
    return localStorage.getItem("refreshToken");
  },

  setTokens(accessToken: string, refreshToken?: string) {
    localStorage.setItem("token", accessToken);
    if (refreshToken) {
      localStorage.setItem("refreshToken", refreshToken);
    }
  },

  getZlmToken(): string | null {
    return localStorage.getItem("zlm_token");
  },

  setZlmToken(token: string) {
    localStorage.setItem("zlm_token", token);
  },

  clearZlmToken() {
    localStorage.removeItem("zlm_token");
  },
getZlmUrl(): string | null {
  return localStorage.getItem("zlm_url");
},

setZlmUrl(url: string) {
  localStorage.setItem("zlm_url", url);
},
 getUsername(): string | null {
    return localStorage.getItem("username");
  },

  setUsername(username: string) {
    localStorage.setItem("username", username);
  },
  clear() {
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("zlm_token");
    localStorage.removeItem("zlm_url");  

  },
};
