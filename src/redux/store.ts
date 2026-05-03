import { configureStore } from "@reduxjs/toolkit";
import liveReducer from "../slices/liveSlice";
import authReducer from "../slices/authSlice";
import eventNotificationReducer from "../slices/eventNotificationSlice";
import subscriptionReducer from "../slices/subscriptionSlice";
import devicesReducer from "../slices/devicesSlice";
import playbackReducer from "../slices/playbackSlice";
import expensesReducer from "../slices/expensesSlice";
import usersReducer from "../slices/usersSlice";
import geofenceReducer from "../slices/geofenceSlice"
import poiReducer from "../slices/poiSlice";
import routesReducer from "../slices/routesSlice";
import maintenanceReducer from "../slices/maintenanceSlice"
import liveFollowReducer from "../slices/liveFollowSlice"
import sensorsReducer from "../slices/sensorsSlice";
import taskReducer from "../slices/taskSlice"
import liveDataReducer from "../slices/liveDataByDeviceIdSlice";
import setupReducer from "../slices/setupSlice";
import uiReducer from "../slices/uiSlice";
import { reportReducer, reportLogReducer } from "../slices/reportSlice";
import settingsReducer from "../slices/settingsSlice";
import sharePositionReducer from "../slices/sharePositionSlice";
import dashboardReducer from "../slices/dashboardSlice";
import commandReducer from "../slices/commandSlice";
import activityLogReducer from "../slices/activityLogSlice";
import alertReducer from "../slices/alertSlice";
import historyExportReducer from "../slices/historyExportSlice";
import drivingPlaybackReducer from "../slices/playbackDrivingDataSlice";
import zlmReducer from "../slices/zlmSlice";
import deviceModalReducer from "../slices/deviceModalSlice";
import softwareReducer from "../slices/softwareSlice";   
import chatNotificationReducer from "../slices/chatNotificationSlice";
import { plannerReducer } from "../slices/transportPlannerSlice";
import staffReducer from "../slices/staffSlice";

export const store = configureStore({
  reducer: {
    live: liveReducer,
    auth: authReducer,
    eventNotification: eventNotificationReducer,
    subscription: subscriptionReducer, 
    devices: devicesReducer,
    playback: playbackReducer,
    expenses: expensesReducer,
    users: usersReducer,
    geofence: geofenceReducer,
    poi: poiReducer,
    routes: routesReducer,
    maintenance:maintenanceReducer,
    liveFollow: liveFollowReducer, 
    sensors: sensorsReducer, 
    task : taskReducer,
    liveDataByDeviceId: liveDataReducer,
    setup: setupReducer,
    ui: uiReducer,
    reports: reportReducer,
    reportLogs: reportLogReducer, 
    settings: settingsReducer,
   sharePosition:sharePositionReducer,
   dashboard: dashboardReducer,
   commands: commandReducer,
   activityLog: activityLogReducer,
    alerts: alertReducer,
  historyExport: historyExportReducer, 
  drivingPlayback: drivingPlaybackReducer,
  zlm: zlmReducer,
    deviceModal: deviceModalReducer,
    software: softwareReducer,
    chatNotification: chatNotificationReducer,
    planner: plannerReducer,
    staff: staffReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
