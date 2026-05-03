// src/components/common/VideoHistory.tsx
import React, { useState,useRef,useEffect } from "react";
import "../../assets/css/videoHistory.css";
import {useAppSelector,useAppDispatch } from "../../redux/hooks";
import { fetchDevices } from "../../slices/devicesSlice";
import anotherAxiosClient from "../../api/anotherAxiosClient";

interface Props {
  deviceId: string;
}

const VideoHistory: React.FC<Props> = ({ deviceId }) => {
  const [device, setDevice] = useState<string>(deviceId);
  const [channel, setChannel] = useState("1");
  const [stream, setStream] = useState("sub");
    const dispatch = useAppDispatch();
   const { devices: deviceList } = useAppSelector((state) => state.devices);
     const { data } = useAppSelector(
       (state) => state.liveDataByDeviceId
     );
  const [date, setDate] = useState(
  new Date().toISOString().split("T")[0]
);
  const [activeTab, setActiveTab] = useState<"time" | "files">("time");
  const [seekTime, setSeekTime] = useState("");
  const [speed, setSpeed] = useState(1);
  const [showMessage, setShowMessage] = useState(true);
  const [loadingSegments, setLoadingSegments] = useState(false);
  
const generateTimeline = () => {
  const selectedDate = date ? new Date(date) : new Date();

  return (
    <div className="vh-day">
      <div className="vh-day-label">
        {selectedDate.toLocaleDateString("en-GB", {
          weekday: "short",
          day: "2-digit",
          month: "short",
          year: "numeric"
        })}
      </div>

      <div className="vh-track">

        {/* Hour markers properly positioned */}
        {Array.from({ length: 13 }).map((_, i) => {
  const hour = i * 2; // 0,2,4,...24
  const left = 1 + (hour / 24) * 98;

  return (
    <div
      key={hour}
      className="vh-hour-marker"
      style={{ left: `${left}%` }}
    >
      {String(hour).padStart(2, "0")}:00
    </div>
  );
})}

       {/* Recording Segments */}
{segments.map((seg, index) => {
  const start = new Date(seg.start.replace(" ", "T"));
  const end = new Date(seg.end.replace(" ", "T"));

  const startMinutes =
    start.getHours() * 60 + start.getMinutes();
  const endMinutes =
    end.getHours() * 60 + end.getMinutes();

  const leftPercent = 1 + (startMinutes / 1440) * 98;
  const widthPercent = ((endMinutes - startMinutes) / 1440) * 98;

  return (
    <div
      key={index}
      className="vh-segment"
      style={{
        left: `${leftPercent}%`,
        width: `${widthPercent}%`
      }}
      title={`${start.toLocaleTimeString("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit"
      })}`}
      onClick={() => startPlayback(seg)}
    />
  );
})}
      </div>
    </div>
  );
};
const wsRef = useRef<WebSocket | null>(null);
const hbRef = useRef<any>(null);
useEffect(() => {
  const sim = data?.uniqueid;
  if (!sim) return;

  const ws = new WebSocket(
    `wss://vms.trackingpath.com/ws/live?sim=${sim}&channel=${channel}&mode=live&variant=sub`
  );

  wsRef.current = ws;

  ws.onopen = () => {
    console.log("WS connected");

    hbRef.current = setInterval(() => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: "ping" }));
      }
    }, 10000);
  };

  ws.onmessage = (e) => {
    console.log("WS message:", e.data);
  };

  ws.onclose = () => {
    console.log("WS closed");
    if (hbRef.current) clearInterval(hbRef.current);
  };

  return () => {
    // cleanup if component unmount
    if (hbRef.current) clearInterval(hbRef.current);
    ws.close();
  };
}, [data, channel]);

const timelineRef = useRef<HTMLDivElement>(null);
const playerRef = useRef<any>(null);
const [segments, setSegments] = useState<any[]>([]);
// ✅ NEW: STOP ON EXIT FUNCTION
const createPlayer = () => {
  if (!window.Jessibuca) {
    console.error("Jessibuca not loaded");
    return null;
  }

  const container = document.getElementById("jessibuca");
  if (!container) return null;

  if (playerRef.current) {
    playerRef.current.destroy();
    playerRef.current = null;
  }
playerRef.current = new window.Jessibuca({
  container: container,
   decoder: "/decoder.js",
    wasm: "/decoder.wasm",
    videoBuffer: 0.2,
    isResize: true,
    debug: false,
    forceNoOffscreen: true,

    // keep your current mode
    useMSE: true,
    useWASM: true,

    showBandwidth: true,
    operateBtns: {
      fullscreen: true,
      screenshot: true,
      play: true,
      audio: true,
      record: false
    },
    control: true,

    hasAudio: true,
    isNotMute: true,

    loadingText: "Loading stream…",
    background: "#000000",
    heartTimeout: 30,
    timeout: 30
});
  return playerRef.current;
};
const loadTimeline = async () => {
  if (!device) return;

  try {
    setLoadingSegments(true);   // 👈 START LOADER

    const sim = data?.uniqueid;
    const deviceId = device;

    const { data: result } = await anotherAxiosClient.get(
      `/live/playback/resources`,
      {
        params: {
          sim,
          deviceId,
          channel,
          date,
        },
      }
    );

    if (!result.success) return;

    setSegments(result.segments || []);
  } catch (error) {
    console.error("Failed to load segments", error);
  } finally {
    setLoadingSegments(false);  // 👈 STOP LOADER
  }
};


const startPlayback = async (segment: any) => {
  const sim = data?.uniqueid;
  if (!sim || !device) return;
await closeSession(Number(channel));
  await startSession(
    Number(channel),
    stream === "sub" ? "sub" : "main"
  );

  const baseUrl: string =
    localStorage.getItem("url") ?? window.location.origin;

  const { data: result } = await anotherAxiosClient.post(
    `/live/playback/start`,
    null,
    {
      params: {
        sim,
        deviceId: device,
        channel,
        startTime: segment.start,
        endTime: segment.end,
        storageType: 0,
        playbackMode: 0,
        speed: 1,
        variant: stream === "sub" ? "sub" : "main",
        waitReady: false,
      },
    }
  );

  if (!result?.success) return;

  function absUrl(pathOrUrl: string): string {
    try {
      return new URL(pathOrUrl).toString();
    } catch {
      return new URL(pathOrUrl, baseUrl).toString();
    }
  }

  const play = result.player || {};

  const httpFlvUrl: string = play.httpFlv
    ? absUrl(play.httpFlv as string)
    : absUrl(`/rtp/${result.streamId}.live.flv`);

  const player = createPlayer();
  if (!player) return;

  player.play(httpFlvUrl);
  setShowMessage(false);
};
const stopPlayback = async () => {
  const sim = data?.uniqueid;
  const deviceId = device;

  await anotherAxiosClient.post(
  `/live/playback/control`,
  null,
  {
    params: {
      sim,
      deviceId,
      channel,
      control: 2,
    },
  }
);
 // close media session for this channel
  await closeSession(Number(channel));
  if (playerRef.current) {
    playerRef.current.destroy();
    playerRef.current = null;
  }
  setShowMessage(true);
};


const sessionvideoRef = useRef<Record<number, string>>({});

async function startSession(channel: number, streamType: "main" | "sub") {
  const sim = data?.uniqueid;
  const userId = localStorage.getItem("userId");
  const username = localStorage.getItem("username");

  if (!sim || !channel) return;

  const sessionId = crypto.randomUUID(); // 🔹 new session for this channel
  sessionvideoRef.current[channel] = sessionId; // store in map

  try {
    await anotherAxiosClient.post("/media/session/start", {
      sessionType: "PLAYBACK",
      sessionId,
      simNo: sim,
      deviceId: Number(deviceId),
      channelNo: channel,
      streamVariant: streamType,
      dataType: 0,
      userId: Number(userId),
      username: username,
    });

    console.log(`Session started for channel ${channel}`, sessionId);
  } catch (err) {
    console.error(`Failed to start session for channel ${channel}`, err);
  }
}

async function pingSessions() {
  const sessionIds = Object.values(sessionvideoRef.current);
  if (sessionIds.length === 0) return;

  try {
    await anotherAxiosClient.post("/media/session/ping", {
      sessionId: sessionIds.join(","), // comma separated
    });
    console.log("Ping successful for sessions", sessionIds);
  } catch (err) {
    console.error("Failed to ping sessions", err);
  }
}

useEffect(() => {
  const interval = setInterval(() => pingSessions().catch(console.error), 20000);
  return () => {
    clearInterval(interval);
    closeAllSessions(); // close all on unmount
  };
}, []);

const closeSession = async (channel: number) => {
  const sessionId = sessionvideoRef.current[channel];
  if (!sessionId) return;

  try {
    await anotherAxiosClient.post(
      `/media/session/close/${encodeURIComponent(sessionId)}`,
      { reason: "stopChannel" }
    );
    console.log(`Session closed for channel ${channel}`);
    delete sessionvideoRef.current[channel]; // remove from map
  } catch (err) {
    console.error(`Failed to close session for channel ${channel}`, err);
  }
};
const closeAllSessions = () => {
  Object.keys(sessionvideoRef.current).forEach((ch) => {
    closeSession(Number(ch)).catch(console.error);
  });
};
useEffect(() => {
  const handleResize = () => {
    if (playerRef.current) {
      playerRef.current.resize();
    }
  };

  window.addEventListener("resize", handleResize);

  return () => {
    window.removeEventListener("resize", handleResize);
  };
}, []);
useEffect(() => {
  return () => {
    stopPlayback().catch(console.error);
    if (playerRef.current) {
      playerRef.current.destroy();
    }
  };
}, []);
useEffect(() => {
  if (!timelineRef.current || activeTab !== "time") return;

  const now = new Date();
  const yearStart = new Date(now.getFullYear(), 0, 1);

  const dayIndex = Math.floor(
    (now.getTime() - yearStart.getTime()) / (1000 * 60 * 60 * 24)
  );

  timelineRef.current.scrollLeft = dayIndex * 420; 
  // ⬆️ 420 = vh-day min-width (CSS ke hisaab se)
}, [activeTab]);
useEffect(() => {
    dispatch(fetchDevices());
  }, [dispatch]);

useEffect(() => {
  if (deviceId) {
    setDevice(deviceId);
  }
}, [deviceId]);
const sendPlaybackControl = async (
  control: number,
  extraParams: Record<string, any> = {}
) => {
  const sim = data?.uniqueid;
  if (!sim || !device) return;

  await anotherAxiosClient.post(
    `/live/playback/control`,
    null,
    {
      params: {
        sim,
        deviceId: device,
        channel,
        control,
        ...extraParams,
      },
    }
  );
};
//code for seek render 
const isValidHms = (val: string) => {
  return /^([0-1]\d|2[0-3]):([0-5]\d):([0-5]\d)$/.test(val);
};
const handleSeek = async () => {
  if (!seekTime || !isValidHms(seekTime)) {
    alert("Use format HH:MM:SS");
    return;
  }

  if (!date) return;

  const fullSeekDateTime = `${date}T${seekTime}`;

  await sendPlaybackControl(5, {
    seekTime: fullSeekDateTime,
  });
};
//code for speed of video 
const handleSpeedChange = async (newSpeed: number) => {
  setSpeed(newSpeed);

  await sendPlaybackControl(3, {
    speed: newSpeed,
  });
};
const handlePlaybackJump = async (type: "rewind" | "forward") => {
  const controlCode = type === "rewind" ? 4 : 3;

  await sendPlaybackControl(controlCode, {
    speed: 2,
  });
};
const startUploadForSegment = async (seg: any) => {
  const sim = data?.uniqueid;
  if (!sim || !device) return;

  const streamType = stream === "main" ? 2 : 1;
  const { data: result } = await anotherAxiosClient.post(
    `/live/file-upload`,
    null,
    {
      params: {
        sim,
        deviceId: device,
        channel,
        startTime: seg.start,
        endTime: seg.end,
        streamType: streamType,
        fileSize:seg.sizeMb
      },
    }
  );

  if (!result) {
    throw new Error("Upload API failed");
  }

  return result; // task object
};
const handleUpload = async (seg: any, index: number) => {
  try {
    // change status to UPLOADING
    setSegments((prev) =>
      prev.map((s, i) =>
        i === index ? { ...s, uploadStatus: "UPLOADING" } : s
      )
    );

   await startUploadForSegment(seg);

    // change status to SENT
    setSegments((prev) =>
      prev.map((s, i) =>
        i === index ? { ...s, uploadStatus: "SENT" } : s
      )
    );

  } catch (error) {
    console.error(error);

    // change status to FAILED
    setSegments((prev) =>
      prev.map((s, i) =>
        i === index ? { ...s, uploadStatus: "FAILED" } : s
      )
    );
  }
};
  return (
    <div className="vh-wrapper">
      {/* LEFT SIDEBAR */}
      <div className="vh-sidebar">
        <p className="vh-title">DVR Playback</p>

      
        <label>Device</label>
<select
  value={device}
  onChange={(e) => setDevice(e.target.value)}
>
  <option value="">Select Device</option>

  {deviceList?.map((d: any) => (
    <option key={d.id} value={d.id}>
      {d.name}
    </option>
  ))}
</select>

        <label>Channel</label>
<select value={channel} onChange={(e) => setChannel(e.target.value)}>
  <option value="1">CH1</option>
  <option value="2">CH2</option>
  <option value="3">CH3</option>
  <option value="4">CH4</option>
</select>

        <label>Stream</label>
        <select value={stream} onChange={(e) => setStream(e.target.value)}>
          <option value="main">Main Stream</option>
          <option value="sub">Sub Stream</option>
        </select>

        <label>Date</label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />

  <button
  className="vh-load-btn"
  onClick={loadTimeline}
  disabled={loadingSegments}
>
  <i className="bi bi-search"></i> Load Timeline
</button>

   <div className="vh-tips">
  <strong>Tips:</strong>
  <ul>
    <li>Blue bars = recording segments</li>
    <li>Click a segment to start playback</li>
    <li>
      Device is online, but ignition is OFF. Please check the camera configuration, as some devices go offline when ignition is turned off
    </li>
  </ul>
</div>
      </div>

      {/* RIGHT CONTENT */}
      <div className="vh-right">
        {/* VIDEO */}
        <div className="vh-video">
          <div id="jessibucaWrap">
    <div id="jessibuca"></div>
   {showMessage && (
  <div className="video-message">
    Select a recording segment on the timeline to start playback
  </div>
)}
  </div>


          <div className="vh-controls">
  {/* LEFT CONTROLS */}
  <div className="vh-controls-left">
    <button onClick={stopPlayback} title="Stop" style={{ cursor: "pointer" }}>
  <i className="bi bi-stop-fill" />
</button>
{/*
    <button><i className="bi bi-skip-backward-fill" /></button>
    <button><i className="bi bi-play-fill" /></button>
    <button onClick={() => {
  playerRef.current?.pause();
}}>
  <i className="bi bi-pause-fill" />
</button>
    <button><i className="bi bi-skip-forward-fill" /></button>*/}
  </div>

  {/* MIDDLE CONTROLS */}
  <div className="vh-controls-center">
   <span className="vh-speed">speed</span>
    <button style={{ cursor: "pointer", fontWeight: speed === 1 ? "bold" : "normal"}} onClick={() => handleSpeedChange(1)}> 1x </button>
    <button style={{ cursor: "pointer", fontWeight: speed === 1 ? "bold" : "normal"}} onClick={() => handleSpeedChange(2)}> 2x </button>
    <button style={{ cursor: "pointer", fontWeight: speed === 1 ? "bold" : "normal" }} onClick={() => handleSpeedChange(4)}> 4x </button>
    <button title="Previous" style={{ cursor: "pointer" }} onClick={() => handlePlaybackJump("rewind")}><i className="bi bi-skip-backward-fill" /></button>
    <button title="Next" style={{ cursor: "pointer" }} onClick={() => handlePlaybackJump("forward")}><i className="bi bi-skip-forward-fill" /></button>
  </div>

  {/* RIGHT CONTROLS */}
  <div className="vh-controls-right">
    <span className="vh-speed">seek</span>
    <input placeholder="HH:MM:SS" value={seekTime} 
    onChange={(e) => setSeekTime(e.target.value)} 
    onKeyDown={(e) => {
    if (e.key === "Enter") {
      handleSeek();
    }
  }}
/>
<button className="vh-seek" style={{ cursor: "pointer" }} onClick={handleSeek}><i className="bi bi-arrow-return-right" /></button>
  </div>
</div>
        
  </div>
        {/* BOTTOM PANEL */}
        <div className="vh-bottom">
          <div className="vh-tabs">
            <button
              className={activeTab === "time" ? "active" : ""}
              onClick={() => setActiveTab("time")}
            >
              <i className="bi bi-clock"></i> Time
            </button>
            <button
              className={activeTab === "files" ? "active" : ""}
              onClick={() => setActiveTab("files")}
            >
              <i className="bi bi-folder"></i> Files
            </button>
          </div>
<div className="vh-bottom-content">
          {activeTab === "files" && (
            <div className="vh-table">
              <table>
                <thead>
                  <tr>
                    <th>Actions</th>
                    <th>Name</th>
                    <th>Device Name</th>
                    <th>Channel</th>
                    <th>Size (MB)</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
{segments.map((seg, index) => (
    <tr key={index}>
      <td className="vh-action-cell">
  <button
    className="vh-icon-btn vh-play"
    title="Play"
    onClick={() => startPlayback(seg)}
  >
    <i className="bi bi-play-fill"></i>
  </button>

 <button
  className="vh-icon-btn vh-upload"
  title="Upload to FTP"
  onClick={() => handleUpload(seg, index)}
>
  <i className="bi bi-cloud-upload-fill"></i>
</button>
</td>
      <td>{seg.name}</td>
      <td>{device}</td>
      <td>{channel}</td>
      <td>{seg.sizeMb}</td>
     <td
  className={
    seg.uploadStatus === "SENT"
      ? "vh-sent"
      : seg.uploadStatus === "FAILED"
      ? "vh-failed"
      : seg.uploadStatus === "UPLOADING"
      ? "vh-uploading"
      : "vh-ok"
  }
>
  {seg.uploadStatus || "READY"}
</td>
    </tr>
  ))}
</tbody>
              </table>
            </div>
          )}

          {activeTab === "time" && (
    <div className="vh-time-panel">
      <div className="vh-timeline-wrapper" ref={timelineRef}>
        <div className="vh-timeline">
          {generateTimeline()}
        </div>
      </div>
    </div>
  )}
</div>

        </div>
    {loadingSegments && (
  <div className="vh-loader-overlay">
    <div className="vh-loader-content">
      <div className="spinner"></div>
      <p>Loading segments...</p>
    </div>
  </div>
)}
      </div>
    </div>
  );
};

export default VideoHistory;
