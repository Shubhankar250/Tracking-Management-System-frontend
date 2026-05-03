import { useEffect, useRef } from "react";
import toastr from "toastr";
import {
  getRecentEvents,
  type NotificationDTO,
} from "../api/eventNotificationService";
import alarmBeep from "../assets/sound/alarm_beeps.mp3";
import beep from "../assets/sound/beep.mp3";
import loudAlarm from "../assets/sound/loud_alarm_sound.mp3";       
/* =========================
   SOUND SETUP
========================= */
const soundMap: Record<string, HTMLAudioElement> = {
  ALARM: new Audio(alarmBeep),
  BEEP: new Audio(beep),
  BEEP2: new Audio(loudAlarm),
  HINT: new Audio(beep),   
};

// Preload sounds
Object.values(soundMap).forEach((audio) => {
  audio.preload = "auto";
  audio.load();
});

/* =========================
   DATE FORMATTER
========================= */
const formatDateEvents = (dateObj: Date) => {
  const pad = (n: number) => n.toString().padStart(2, "0");

  return (
    dateObj.getFullYear() +
    "-" +
    pad(dateObj.getMonth() + 1) +
    "-" +
    pad(dateObj.getDate()) +
    " " +
    pad(dateObj.getHours()) +
    ":" +
    pad(dateObj.getMinutes()) +
    ":" +
    pad(dateObj.getSeconds())
  );
};

const formatAlertTime = (dateStr: string) => {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  const pad = (n: number) => n.toString().padStart(2, "0");
  return (
    `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ` +
    `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
  );
};

/* =========================
   HOOK
========================= */
export const useRecentEvents = () => {
  const lastFetchTimeRef = useRef<Date>(
    new Date(new Date().getTime() - 30 * 1000),
  );

  /* ===== Unlock audio on first user interaction ===== */
  useEffect(() => {
    const unlockAudio = () => {
      Object.values(soundMap).forEach((audio) => {
        audio
          .play()
          .then(() => {
            audio.pause();
            audio.currentTime = 0;
          })
          .catch(() => {});
      });
      document.removeEventListener("click", unlockAudio);
      document.removeEventListener("keydown", unlockAudio);
    };

    document.addEventListener("click", unlockAudio);
    document.addEventListener("keydown", unlockAudio);

    return () => {
      document.removeEventListener("click", unlockAudio);
      document.removeEventListener("keydown", unlockAudio);
    };
  }, []);

  useEffect(() => {
  const style = document.createElement("style");
  style.innerHTML = `
    #toast-container > div.custom-toast-fix {
      opacity: 1 !important;
      padding: 0 !important;
      background-image: none !important;
      background-position: 0 0 !important;
    }
  `;
  document.head.appendChild(style);

  return () => {
    document.head.removeChild(style);
  };
}, []);
  /* ===== Play sound for duration ===== */
  const playSoundForDuration = (soundType: string, duration: number) => {
    if (!soundMap[soundType]) return;

    const audio = soundMap[soundType].cloneNode(true) as HTMLAudioElement;
    audio.loop = true;
    audio.play().catch(() => {});

    setTimeout(() => {
      audio.pause();
      audio.currentTime = 0;
    }, duration);
  };
  const shownAlertsRef = useRef<Set<string>>(new Set());
  /* ===== Show toastr ===== */
  const showToast = (alert: NotificationDTO) => {
    const key = `${alert.deviceName}-${alert.alertType}-${alert.alertTime}`;
    if (shownAlertsRef.current.has(key)) return;

    shownAlertsRef.current.add(key);

    setTimeout(() => {
      shownAlertsRef.current.delete(key);
    }, 60000);

    let timeout = 5000;

    if (alert.popupNotification) {
      const match = alert.popupNotification.match(/^(\d+)(S|M)$/i);
      if (match) {
        const value = parseInt(match[1], 10);
        const unit = match[2].toUpperCase();
        timeout = unit === "S" ? value * 1000 : value * 60000;
      }
    }

  toastr.options = {
    closeButton: true,
    newestOnTop: true,
    progressBar: true,
    positionClass: "toast-top-right",
    timeOut: timeout,
    extendedTimeOut: timeout,
    showMethod: "fadeIn",
    hideMethod: "fadeOut",
  };
    // Use toastr's title parameter for proper title placement
   const $toast = toastr.error(
  `
  <div style="font-size:12px; line-height:1.4;">
    <div><strong>Device:</strong> ${alert.deviceName || "N/A"}</div>
    ${
      alert.alertType?.toUpperCase() === "OVERSPEED"
        ? `<div><strong>Speed:</strong> ${alert.speed ?? 0} km/h</div>`
        : ""
    }
    <div><strong>Address:</strong> ${alert.address || "N/A"}</div>
    <div><strong>Alert Time:</strong> ${formatAlertTime(alert.alertTime)}</div>
  </div>
  `,
  alert.alertType || "Alert",
);

   if ($toast) {
  setTimeout(() => {
    const toastEl = ($toast as any)[0];
    if (!toastEl) return;
    toastEl.classList.add("custom-toast-fix");

    const baseColor = alert.notificationColor || "#c0392b";

    const adjustColor = (color: string, amount: number) => {
      let col = color.startsWith("#") ? color.slice(1) : color;
      let num = parseInt(col, 16);

      let r = Math.min(255, Math.max(0, (num >> 16) + amount));
      let g = Math.min(255, Math.max(0, ((num >> 8) & 0x00ff) + amount));
      let b = Math.min(255, Math.max(0, (num & 0x0000ff) + amount));

      return "#" + ((r << 16) | (g << 8) | b).toString(16).padStart(6, "0");
    };

    const headerColor = adjustColor(baseColor, -40);
    const bodyColor = adjustColor(baseColor, +10);
    
    // MAIN
    toastEl.style.cssText = `
      border-radius: 6px !important;
      overflow: hidden !important;
      border: 1px solid #444 !important;
      padding: 0 !important;                
      background-image: none !important;     
      transition: none !important;          
    `;

    // 🆕 FORCE NO HOVER CHANGE (JS way)
    toastEl.onmouseenter = () => {
      toastEl.style.backgroundColor = "transparent";
    };
    toastEl.onmouseleave = () => {
      toastEl.style.backgroundColor = "transparent";
    };

    // HEADER
    const titleEl = toastEl.querySelector(".toast-title");
    if (titleEl) {
      titleEl.style.cssText = `
        background: ${headerColor} !important;
        color: #fff !important;
        padding: 10px 12px !important;
        font-size: 15px !important;
        font-weight: 700 !important;
        margin: 0 !important;
      `;
    }

    // BODY
    const messageEl = toastEl.querySelector(".toast-message");
    if (messageEl) {
      messageEl.style.cssText = `
        background: ${bodyColor} !important;
        color: #fff !important;
        padding: 10px 12px !important;
        font-size: 13px !important;
        line-height: 1.4 !important;
        margin: 0 !important;   /* 🆕 remove extra spacing */
      `;
    }

    // CLOSE BUTTON
    const closeBtn = toastEl.querySelector(".toast-close-button");
    if (closeBtn) {
      closeBtn.style.cssText = `
        color: #fff !important;
        opacity: 1 !important;
        margin: 13px !important;
      `;
    }

  }, 0);
}
    // Play sound
    if (alert.soundNotification) {
      playSoundForDuration(alert.soundNotification, timeout);
    }
  };
  /* ===== Fetch recent events ===== */
  const fetchRecentAlerts = async () => {
    const now = new Date();
    const start = formatDateEvents(lastFetchTimeRef.current);
    const end = formatDateEvents(now);

    try {
      const res = await getRecentEvents(start, end);

      if (res.data && res.data.length > 0) {
        res.data.forEach((alert) => showToast(alert));
      }
    } catch (err) {
      console.error("Error fetching recent events", err);
    }

    lastFetchTimeRef.current = now;
  };

  /* ===== Poll every 30 seconds ===== */
  useEffect(() => {
    fetchRecentAlerts(); // initial
    const interval = setInterval(fetchRecentAlerts, 30000);
    return () => clearInterval(interval);
  }, []);
};
