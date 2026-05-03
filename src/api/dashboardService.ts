import axiosClient from "./axiosClient";

export const dashboardService = {
  getDashboardData: async () => {
    const res = await axiosClient.get("/api/dashboard/data");
    return res.data;
  },
};