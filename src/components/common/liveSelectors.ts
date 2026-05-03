import { createSelector } from "@reduxjs/toolkit";
import type { RootState } from "../../redux/store";

export const selectDevices = (state: RootState) => state.live.devices;
export const selectSelectedId = (state: RootState) =>
  state.live.selectedVehicleId;

export const selectSelectedVehicle = createSelector(
  [selectDevices, selectSelectedId],
  (devices, id) => {
    return devices.find(d => d.device_id === id) || null;
  }
);
