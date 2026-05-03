import { createSlice } from "@reduxjs/toolkit";
interface ChatNotificationState {
  unreadCount: number;
  isChatOpen: boolean;
  statusMap: { [key: string]: string };  // ✅ ADD THIS
}

const initialState:ChatNotificationState = {
  unreadCount: 0,
  isChatOpen: false,
  statusMap: {},
};
const chatNotificationSlice = createSlice({
  name: "chatNotification",
  initialState,
  
  reducers: {
    incrementUnread: (state) => {
      state.unreadCount += 1;
    },
    resetUnread: (state) => {
      state.unreadCount = 0;
    },
    setUnread: (state, action) => {   // ✅ ADD THIS
      state.unreadCount = action.payload;
    },
    setChatOpen: (state, action) => {
      state.isChatOpen = action.payload;
    },
    setStatusMap: (state, action) => {
  state.statusMap = action.payload;
}
  },
});

export const { incrementUnread, resetUnread ,setChatOpen , setUnread,setStatusMap,} = chatNotificationSlice.actions;
export default chatNotificationSlice.reducer;