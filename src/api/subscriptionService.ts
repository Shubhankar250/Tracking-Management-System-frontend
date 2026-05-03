import type { AxiosResponse } from "axios";
import axiosClient from "./axiosClient";

/* =========================
   SubscriptionMasterDTO
========================= */
export interface SubscriptionMasterDTO {
  id?: number;

  subDetails: string;
  subPoints: number;
  totalAmount: number;
  discount: number;

  countrySubId: number;
  country: string;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

/* =========================
   API CALLS
========================= */

/**
 * Get all countries
 */
export const getAllCountries = (): Promise<AxiosResponse<Record<number, string>>> => {
  return axiosClient.get("/subscriptions/countries");
};

/**
 * Get all subscriptions
 */
export const getAllSubscriptions = (
  page: number,
  size: number,
  search: string
): Promise<AxiosResponse<PageResponse<SubscriptionMasterDTO>>> => {
  return axiosClient.get("/subscriptions", {
    params: { page, size, search },
  });
};

/**
 * Get subscription by ID
 */
export const getSubscriptionById = (
  id: number
): Promise<AxiosResponse<SubscriptionMasterDTO>> => {
  return axiosClient.get(`/subscriptions/${id}`);
};

/**
 * Add new subscription
 */
export const addSubscription = (
  data: SubscriptionMasterDTO
): Promise<AxiosResponse<string>> => {
  return axiosClient.post("/subscriptions", data);
};

/**
 * Update subscription
 */
export const updateSubscription = (
  data: SubscriptionMasterDTO
): Promise<AxiosResponse<string>> => {
  return axiosClient.put("/subscriptions", data);
};


export const updateSubscriptionPoints = (
  points: number
): Promise<AxiosResponse<string>> => {
  return axiosClient.put("/subscriptions/updateSubscriptionPoints", null, {
    params: { points },
  });
};