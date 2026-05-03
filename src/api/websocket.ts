import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";
import { API_BASE_URL } from "../api/axiosClient";
import { store, type AppDispatch } from "../redux/store";
import { updateDevice } from "../slices/liveSlice";
import { wsUpdate } from "../slices/liveFollowSlice";

import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

let client: Client | null = null;

dayjs.extend(utc);
dayjs.extend(timezone);

export function convertToUserZone(
  deviceDateTime: string | number | null,
  userZoneId: string | null
): string | null {
  if (!deviceDateTime) return null;

  try {
    const userZone =
      userZoneId && userZoneId.trim() !== ""
        ? userZoneId
        : "UTC";

    const utcDate = dayjs.utc(deviceDateTime);

    if (!utcDate.isValid()) {
      console.error("Invalid DateTime:", deviceDateTime);
      return null;
    }

    return utcDate.tz(userZone).format();
  } catch (err) {
    console.error("Timezone conversion error:", err);
    return null;
  }
}

export function connectWS(dispatch: AppDispatch) {
  if (client?.active) {
    console.log("⚠️ WS already connected");
    return;
  }

  console.log("🔌 Connecting WS:", `${API_BASE_URL}/ws`);

  client = new Client({
    webSocketFactory: () => new SockJS(`${API_BASE_URL}/ws`),

    connectHeaders: {},
    heartbeatIncoming: 10000,
    heartbeatOutgoing: 10000,
    reconnectDelay: 5000,

    debug: (msg) => {
      console.log("STOMP:", msg);
    },

    onConnect: () => {
      console.log("✅ WS CONNECTED");

      client?.subscribe("/topic/positions", (msg) => {
        try {
          const raw = JSON.parse(msg.body);
          const formatDuration = (val: any) => {
            if (!val) return "-";
            if (typeof val === "string") return val;   
            if (typeof val === "number") {
              const now = Date.now();
              let diff = Math.floor((now - val) / 1000); // seconds

              if (diff < 0) diff = 0;

              const days = Math.floor(diff / (24 * 3600));
              diff %= 24 * 3600;

              const hours = Math.floor(diff / 3600);
              diff %= 3600;

              const minutes = Math.floor(diff / 60);
              const seconds = diff % 60;

              return `${days}d ${hours}h ${minutes}min ${seconds}s`;
            }

            return "-";
          };

          // Parse attributes safely
          let attrs = {};
          if (raw.attributes) {
            try {
              attrs =
                typeof raw.attributes === "string"
                  ? JSON.parse(raw.attributes)
                  : raw.attributes;
            } catch {
              attrs = {};
            }
          }
  const state1 = store.getState();
const userSetup = state1.setup.userSetup;
  const usertimezone=userSetup?.timezone||null;
          const rawDeviceTime = raw.devicetime || raw.fixTime;
          const rawServerTime = raw.servertime;

const convertedDeviceTime = convertToUserZone(
  rawDeviceTime,
  usertimezone
);
const convertedServerTime = convertToUserZone(
  rawServerTime,
  usertimezone
);
       const speed = raw.speed || 0;
          

          const lastmovementtime = formatDuration(raw.lastmovementtime);
          const lastidletime = formatDuration(raw.lastidletime);

          const device = {
            ...raw,
            device_id: raw.deviceId,
            device_name: raw.name ?? "Unknown Device",
            latitude: raw.latitude,
            longitude: raw.longitude,
            speed: speed,
            fixTime: raw.fixTime,
            devicetime: convertedDeviceTime,
            servertime: convertedServerTime,
            attributes: attrs,

            // ✅ add computed fields properly
            lastmovementtime,
            lastidletime,
          };

          /* ✅ CHECK VISIBILITY FILTER */
          const state = store.getState();
          const visibleIds = state.live.visibleVehicleIds;

          if (!visibleIds.includes(device.device_id)) {
            return;
          }

          /* Logging */
          const formatted = {
            device_id: device.device_id,
            device_name: device.device_name,
            latitude: device.latitude,
            longitude: device.longitude,
            speed: device.speed,
            fixTime: raw.fixTime,
            devicetime: convertedDeviceTime,
            servertime: convertedServerTime,
            attributes: device.attributes,
          };

          console.log("📡 WS Device Update");
          console.table(formatted);

          dispatch(updateDevice(device));
          dispatch(wsUpdate(device));
        } catch (err) {
          console.error("❌ WS parse error", err);
        }
      });
    },

    onWebSocketError: (e) => {
      console.error("❌ WebSocket Error:", e);
    },

    onStompError: (frame) => {
      console.error("❌ STOMP Error:", frame.headers, frame.body);
    },

    onWebSocketClose: () => {
      console.warn("🔌 WS Closed");
    },
  });

  client.activate();
}

/* ================= DISCONNECT ================= */

export function disconnectWS() {
  console.log("Disconnecting WS");
  client?.deactivate();
}
