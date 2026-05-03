import type { AxiosResponse } from "axios";
import axiosClient from "./axiosClient";

/* =========================
   DTOs
========================= */

export interface SettingLogoDTO {
  frontpageLogo?: string;
  favicon?: string;
  loginPageLogo?: string;
  backgroundImage?: string;

  loginTextColor?: string;
  loginPanelColor?: string;
  loginPanelTransparency?: string;
  welcomeText?: string;
  bottomText?: string;
  appleStoreLink?: string;
  googlePlayLink?: string;
}

export interface SettingDTO {
  serverName?: string;
  serverDescription?: string;
  defaultLanguage?: string;
  defaultDateFormat?: string;
  defaultTimeFormat?: string;
  defaultDurationFormat?: string;
  defaultUnitOfDistance?: string;
  defaultUnitOfCapacity?: string;
  defaultUnitOfAltitude?: string;
  mapZoomLevel?: string;
  latitude?: string;
  longitude?: string;
  noReplyEmailAddress?: string;
  fromName?: string;
  logo?: SettingLogoDTO;
}

/* =========================
   SETTINGS APIs
========================= */

// Update Settings
export const updateSettings = (
  data: SettingDTO
): Promise<AxiosResponse<string>> => {
  return axiosClient.put("/settings", data);
};

// Update Logos (Multipart)
export const updateLogos = (
  logo: SettingLogoDTO,
  files: {
    frontpageLogo?: File;
    favicon?: File;
    loginPageLogo?: File;
    backgroundImage?: File;
  }
): Promise<AxiosResponse<string>> => {
  const formData = new FormData();

  // ❗ send ONLY logo JSON (as string)
  formData.append("data", JSON.stringify(logo));

  if (files.frontpageLogo)
    formData.append("frontpageLogo", files.frontpageLogo);

  if (files.favicon)
    formData.append("favicon", files.favicon);

  if (files.loginPageLogo)
    formData.append("loginPageLogo", files.loginPageLogo);

  if (files.backgroundImage)
    formData.append("backgroundImage", files.backgroundImage);

  return axiosClient.put("/settings/logos", formData, {
    headers: {
      "Content-Type": "multipart/form-data",   // 👈 IMPORTANT
    },
  });
};


// Welcome View Update
export const updateWelcomeView = (): Promise<AxiosResponse<string>> => {
  return axiosClient.post("/settings/welcome");
};

export const getSettings = (): Promise<AxiosResponse<SettingDTO>> => {
  return axiosClient.get("/settings");
};