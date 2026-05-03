import { createSlice } from "@reduxjs/toolkit";

interface UIState {
  isAnyModalOpen: boolean;
}

const initialState: UIState = {
  isAnyModalOpen: false,
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    openModal(state) {
      state.isAnyModalOpen = true;
    },
    closeModal(state) {
      state.isAnyModalOpen = false;
    },
  },
});

export const { openModal, closeModal } = uiSlice.actions;
export default uiSlice.reducer;
