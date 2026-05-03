import React, { useState, useEffect, useRef, memo } from "react";
import "../../assets/css/liveVideo.css";
import anotherAxiosClient from "../../api/anotherAxiosClient";
import axiosClient from "../../api/axiosClient";
import placeholderImage from "../../assets/images/video1.jpg";
import Modal from "../common/Modal";
import TerminalConfigUI from "../../features/ternimal/TerminalConfigUI"
import { toast } from "react-toastify";
import engineOn from "../../assets/images/engine-on.png";
import engineOff from "../../assets/images/engine-off.png";
import engineIdle from "../../assets/images/orange-engine.png";
import engineDefault from "../../assets/images/default-engine.png";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import { fetchLiveDataByDeviceId } from "../../slices/liveDataByDeviceIdSlice";
interface Props {
  deviceId: string;
  onOpenHistory: () => void;
}


const screenOptions = [2, 4, 8, 16];

//////////////////////////////////////////////////////////////
// 🏆 VIDEO TILE — OUTSIDE (DO NOT MOVE INSIDE)
//////////////////////////////////////////////////////////////

interface VideoBoxProps {
  channel?: number;
  status?: string;
  sim?: string;
  loading?: boolean;
}

const VideoBox = memo(({ channel, status, sim ,loading }: VideoBoxProps) => {
  const ref = useRef<HTMLDivElement | null>(null);
  const playerRef = useRef<any>(null);
  const playingChannel = useRef<number | null>(null);
 
 
  
  useEffect(() => {
    if (!ref.current) return;

    // 🔴 If no channel OR offline → stop player
    if (!channel || status !== "online") {
      if (playerRef.current) {
        playerRef.current.destroy();
        playerRef.current = null;
        playingChannel.current = null;
      }
      return;
    }

    // ✅ If already playing same channel → do nothing
    if (playingChannel.current === channel) return;

    const Jessibuca = (window as any).Jessibuca;
    if (!Jessibuca) return;

    const streamId = `${sim}_ch${channel}`;
    const url = `wss://vms.trackingpath.com/rtp/${streamId}.live.flv?t=${Date.now()}`;

    // 🔁 Switching channel → destroy previous
    if (playerRef.current) {
      playerRef.current.destroy();
      playerRef.current = null;
    }

    const player = new Jessibuca({
      container: ref.current,
      decoder: "/decoder.js",
      wasm: "/decoder.wasm",
      autoplay: true,
      hasAudio: true,
      isFlv: true,
      useMSE: true,
      debug: false,
      controlAutoHide: false,
      showBandwidth: true,
      operateBtns: {
        fullscreen: true,
        screenshot: true,
        play: true,
        audio: true,
      },
    });

   setTimeout(() => {
  player.play(url); // 🔥 CHANGED HERE — slight delay ensures ZLM publish ready
}, 500);

/////////////////////////////////////////////////////
// 🔥 NEW CODE — video play hote hi loader stop
/////////////////////////////////////////////////////
player.on("play", () => {
  const event = new CustomEvent("videoStarted", {
    detail: channel, // channel number bhej rahe hain
  });

  window.dispatchEvent(event);
});
/////////////////////////////////////////////////////

    player.on("pause", () => {
      console.warn("Paused — resuming...");
      setTimeout(() => player.play(), 500);
    });

    // 🔥 Auto-reconnect on error
    player.on("error", () => {
      console.warn("Error — reconnecting...");
      setTimeout(() => player.play(url), 1000);
    });

    playerRef.current = player;
    playingChannel.current = channel;

    // 🚫 IMPORTANT: DO NOT destroy on re-render
    return () => {};
  }, [channel, status, sim]);

  return (
    <div className="video-box">
      <div className="video-header">{channel ? `CH${channel}` : "Not Connected"}</div>

      <div ref={ref} className="video-body">
         {/* SHOW PLACEHOLDER ONLY IF NO CHANNEL */}
  {!channel && (
    <img src={placeholderImage} alt="" className="video-placeholder" />
  )}

  {/* SHOW LOADING IF CHANNEL SELECTED */}
  {channel && loading && (
    <div className="video-loader">
      <div className="spinner"></div>
    </div>
  )}
      </div>
    </div>
  );
});
//////////////////////////////////////////////////////////////
// 🏆 MAIN COMPONENT
//////////////////////////////////////////////////////////////

const LiveVideo: React.FC<Props> = ({ deviceId, onOpenHistory }) => {
    const dispatch = useAppDispatch();

  const [screens, setScreens] = useState<number>(2);
  const [expanded, setExpanded] = useState(false);
  const [streamType, setStreamType] = useState<"main" | "sub">("sub");
  const [channelSlots, setChannelSlots] = useState<Record<number, number>>({});
  const [showCallPopup, setShowCallPopup] = useState(false);
  //sate for talk
  const [isTalking, setIsTalking] = useState(false);

const audioCtxRef = useRef<AudioContext | null>(null);
const micStreamRef = useRef<MediaStream | null>(null);
const processorRef = useRef<ScriptProcessorNode | null>(null);
const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
const gainNodeRef = useRef<GainNode | null>(null);
const talkWsRef = useRef<WebSocket | null>(null);
const pcmQueueRef = useRef<number[]>([]);
const downlinkCtxRef = useRef<AudioContext | null>(null);
 const [availableChannels, setAvailableChannels] = useState<number[]>([]);
  const [loadingChannels, setLoadingChannels] = useState<number[]>([]);
  const [showMenu, setShowMenu] = useState(false);
  const [showRemoteConfirm, setShowRemoteConfirm] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
  if (!deviceId) return;

  dispatch(fetchLiveDataByDeviceId(Number(deviceId)));

  const interval = setInterval(() => {
    dispatch(fetchLiveDataByDeviceId(Number(deviceId)));
  }, 10000);

  return () => clearInterval(interval);
}, [deviceId, dispatch]);
  useEffect(() => {
  const handleClickOutside = (event: MouseEvent) => {
    if (
      menuRef.current &&
      !menuRef.current.contains(event.target as Node)
    ) {
      setShowMenu(false);
    }
  };

  document.addEventListener("mousedown", handleClickOutside);

  return () => {
    document.removeEventListener("mousedown", handleClickOutside);
  };
}, []);

const [showSnapshotModal, setShowSnapshotModal] = useState(false);
const [snapshotChannels, setSnapshotChannels] = useState<number[]>([]);
  const { data } = useAppSelector((state) => state.liveDataByDeviceId);

// 🔥 ADD THIS
const v = data ?? {
  status: "offline",
  modalType: "",
  attributes: {},
}; // fallback empty object
const isDataAvailable = data !== null && data !== undefined;

  const [isMuted, setIsMuted] = useState(false);
const [isSpeakerMuted, setIsSpeakerMuted] = useState(false);
  // CODE FOR MAKE CALLING MODAL DRAGGABLE START
//////////////////////////////////////////////////////////////
  const popupRef = useRef<HTMLDivElement | null>(null);
const dragOffset = useRef({ x: 0, y: 0 });
const isDragging = useRef(false);

// vihicle ICONS ////////////////////////////////////////////////

// ✅ SAFE ATTRIBUTE PARSER
const getAttributes = (device: any) => {
  try {
    if (!device?.attributes) return {};

    if (typeof device.attributes === "object") {
      return device.attributes;
    }

    return JSON.parse(device.attributes);
  } catch (e) {
    console.error("Invalid attributes JSON", e);
    return {};
  }
};

// ✅ ENGINE STATUS
const getEngineIconAndTitle = (v: any) => {
    let icon = engineDefault;
    let title = "No Data";

    const attrs = getAttributes(v);
    const ignition =
      attrs?.ignition === true;
    if (v.speed > 0) {
      icon = engineOn;
      title = "Engine On (Moving)";
    } else if (v.speed === 0 && ignition === true) {
      icon = engineIdle;
      title = "Engine Idle";
    } else if (v.speed === 0 && ignition === false) {
      icon = engineOff;
      title = "Engine Off (Stopped)";
    } else if (v.latitude === 0 && v.longitude === 0) {
      icon = engineDefault;
      title = "No Data";
    }

    return { icon, title };
  };



const handleMouseDown = (e: React.MouseEvent) => {
  if (!popupRef.current) return;

  isDragging.current = true;

  const rect = popupRef.current.getBoundingClientRect();

  dragOffset.current = {
    x: e.clientX - rect.left,
    y: e.clientY - rect.top,
  };

  document.addEventListener("mousemove", handleMouseMove);
  document.addEventListener("mouseup", handleMouseUp);
};

const handleMouseMove = (e: MouseEvent) => {
  if (!isDragging.current || !popupRef.current) return;

  popupRef.current.style.left = `${e.clientX - dragOffset.current.x}px`;
  popupRef.current.style.top = `${e.clientY - dragOffset.current.y}px`;
};

const handleMouseUp = () => {
  isDragging.current = false;
  document.removeEventListener("mousemove", handleMouseMove);
  document.removeEventListener("mouseup", handleMouseUp);
};
const handleTouchStart = (e: React.TouchEvent) => {
  if (!popupRef.current) return;

  isDragging.current = true;

  const touch = e.touches[0];
  const rect = popupRef.current.getBoundingClientRect();

  dragOffset.current = {
    x: touch.clientX - rect.left,
    y: touch.clientY - rect.top,
  };

  document.addEventListener("touchmove", handleTouchMove);
  document.addEventListener("touchend", handleTouchEnd);
};

const handleTouchMove = (e: TouchEvent) => {
  if (!isDragging.current || !popupRef.current) return;

  e.preventDefault(); // VERY IMPORTANT

  const touch = e.touches[0];

  popupRef.current.style.left = `${touch.clientX - dragOffset.current.x}px`;
  popupRef.current.style.top = `${touch.clientY - dragOffset.current.y}px`;
};

const handleTouchEnd = () => {
  isDragging.current = false;

  document.removeEventListener("touchmove", handleTouchMove);
  document.removeEventListener("touchend", handleTouchEnd);
};
// CODE FOR MAKE CALLING MODAL DRAGGABLE END
//////////////////////////////////////////////////////////////
// States for ternimal configuration open start
const [showTerminalModal, setShowTerminalModal] = useState(false);
const [terminalData, setTerminalData] = useState<any>(null);
const [loadingTerminal, setLoadingTerminal] = useState(false);
// States for ternimal configuration open end
const [isPopupEnabled, setIsPopupEnabled] = useState(false);
const [snapshotImage, setSnapshotImage] = useState<string | null>(null);
const [showPreviewModal, setShowPreviewModal] = useState(false);

/////////////////////////////////////////////////////
// 🔥 NEW CODE — jab video start ho to loader remove
/////////////////////////////////////////////////////
useEffect(() => {
  const handleVideoStarted = (e: any) => {
    const ch = e.detail;

    setLoadingChannels((prev) =>
      prev.filter((c) => c !== ch)
    );
  };

  window.addEventListener("videoStarted", handleVideoStarted);

  return () => {
    window.removeEventListener("videoStarted", handleVideoStarted);
  };
}, []);
/////////////////////////////////////////////////////
  useEffect(() => {
    if (data?.channelNo && screenOptions.includes(data.channelNo)) {
      setScreens(data.channelNo);
    }
  }, [data?.channelNo]);
useEffect(() => {
  const channels = Array.from({ length: screens }, (_, i) => i + 1);
  setAvailableChannels(channels);

  // Remove channels that exceed new screen count
  setChannelSlots((prev) => {
    const updated: Record<number, number> = {};
    Object.entries(prev).forEach(([ch, slot]) => {
      if (slot < screens) {
        updated[Number(ch)] = slot;
      }
    });
    return updated;
  });

}, [screens]);
  const getGridClass = () => `grid-${screens}`;

  //////////////////////////////////////////////////////////////
  // 🔥 BACKEND CONTROL
  //////////////////////////////////////////////////////////////

  const startBackendStream = async (channel: number) => {
    const sim = data?.uniqueid;
    const token = localStorage.getItem("zlm_token");
    if (!sim || !token) return;

    await anotherAxiosClient.post("/live/start", null, {
      params: {
        sim,
        deviceId,
        channel,
        streamType,
        transport: "tcp",
        mode:"vendor",
        waitReady: "true",
      },
    });
  };

  const stopBackendStream = async (channel: number) => {
    const sim = data?.uniqueid;
    const token = localStorage.getItem("zlm_token");
    if (!sim || !token) return;

    await anotherAxiosClient.post("/live/avctl", null, {
      params: {
        sim,
        deviceId,
        channel,
        action: "stopStream",
        turnOffType: 2,
      },
    });
  };
//start livevideo close 
const sessionMapRef = useRef<Record<number, string>>({});

async function startSession(channel: number, streamType: "main" | "sub") {
  const sim = data?.uniqueid;
  const userId = localStorage.getItem("userId");
  const username = localStorage.getItem("username");

  if (!sim || !channel) return;

  const sessionId = crypto.randomUUID(); // 🔹 new session for this channel
  sessionMapRef.current[channel] = sessionId; // store in map

  try {
    await anotherAxiosClient.post("/media/session/start", {
      sessionType: "LIVE",
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
  const liveSessionIds = Object.values(sessionMapRef.current);
  const talkSessionIds = Object.values(talkSessionMapRef.current);

  const allSessionIds = [...liveSessionIds, ...talkSessionIds];

  if (allSessionIds.length === 0) return;

  try {
    await anotherAxiosClient.post("/media/session/ping", {
      sessionId: allSessionIds.join(","),
    });

    console.log("Ping successful for sessions", allSessionIds);
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
  const sessionId = sessionMapRef.current[channel];
  if (!sessionId) return;

  try {
    await anotherAxiosClient.post(
      `/media/session/close/${encodeURIComponent(sessionId)}`,
      { reason: "stopChannel" }
    );
    console.log(`Session closed for channel ${channel}`);
    delete sessionMapRef.current[channel]; // remove from map
  } catch (err) {
    console.error(`Failed to close session for channel ${channel}`, err);
  }
};
const closeAllSessions = () => {
  Object.keys(sessionMapRef.current).forEach((ch) => {
    closeSession(Number(ch)).catch(console.error);
  });

  Object.keys(talkSessionMapRef.current).forEach((ch) => {
    closeTalkSession(Number(ch)).catch(console.error);
  });
};//end live video close
// start talk session close
const talkSessionMapRef = useRef<Record<number, string>>({});

const startTalkSession = async (channel: number, streamType: "main" | "sub") => {
  const sim = data?.uniqueid;
  const userId = localStorage.getItem("userId");
  const username = localStorage.getItem("username");

  if (!sim) return;

  const sessionId = crypto.randomUUID();

  talkSessionMapRef.current[channel] = sessionId;

  try {
    await anotherAxiosClient.post("/media/session/start", {
      sessionType: "TALK",
      sessionId,
      simNo: sim,
      deviceId: Number(deviceId),
      channelNo: channel,
      streamVariant: streamType,
      dataType: 1,
      userId: Number(userId),
      username: username,
    });

    console.log(`Talk session started for channel ${channel}`, sessionId);
  } catch (err) {
    console.error(`Failed to start talk session for channel ${channel}`, err);
  }
};
const closeTalkSession = async (channel: number) => {
  const sessionId = talkSessionMapRef.current[channel];
  if (!sessionId) return;

  try {
    await anotherAxiosClient.post(
      `/media/session/close/${encodeURIComponent(sessionId)}`,
      { reason: "stopTalk" }
    );

    console.log(`Talk session closed for channel ${channel}`);

    delete talkSessionMapRef.current[channel];
  } catch (err) {
    console.error(`Failed to close talk session for channel ${channel}`, err);
  }
};
// end talk session close
  //////////////////////////////////////////////////////////////
  // 🏆 SLOT-BASED CHANNEL TOGGLE
  //////////////////////////////////////////////////////////////

const handleChannelToggle = async (channel: number, checked: boolean) => {
  if (checked) {

    // 🔥 CHANGE 1 — loader turant start karo
    setLoadingChannels((prev) => [...prev, channel]);

    // 🔥 CHANGE 2 — API ko await mat karo (background me call ho)
    startBackendStream(channel).catch(console.error);
    startSession(channel, streamType).catch(console.error); // this is for session insert

    // 🔥 SLOT ASSIGNMENT SAME RAKHO
    setChannelSlots((prev) => {
      if (prev[channel] !== undefined) return prev;

      const used = Object.values(prev);
      const freeSlot = Array.from({ length: screens }, (_, i) => i).find(
        (i) => !used.includes(i),
      );

      if (freeSlot === undefined) return prev;

      return { ...prev, [channel]: freeSlot };
    });

  } else {

    // 🔥 CHANNEL OFF
    setChannelSlots((prev) => {
      const updated = { ...prev };
      delete updated[channel];
      return updated;
    });

    stopBackendStream(channel).catch(console.error);
    closeSession(channel).catch(console.error); // 🔹 close only this channel session

    // 🔥 loader remove
    setLoadingChannels((prev) =>
      prev.filter((ch) => ch !== channel)
    );
  }
};
////talk/////
function alawToLinear(a_val: number) {
  a_val ^= 0x55;
  let t = (a_val & 0x0f) << 4;
  let seg = (a_val & 0x70) >> 4;

  switch (seg) {
    case 0: t += 8; break;
    case 1: t += 0x108; break;
    default:
      t += 0x108;
      t <<= seg - 1;
  }

  return (a_val & 0x80) ? t : -t;
}

function decodeG711AlawToPcm16(g711: Uint8Array) {
  const pcm = new Int16Array(g711.length);
  for (let i = 0; i < g711.length; i++) {
    pcm[i] = alawToLinear(g711[i]);
  }
  return pcm;
}
let downlinkTime = 0;
function playDownlinkPcm(pcm16: Int16Array) {
  //// 🔥🔥🔥 CHANGED HERE — persistent AudioContext + jitter buffer

  if (!downlinkCtxRef.current) {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    downlinkCtxRef.current = new AudioCtx();
    downlinkTime = downlinkCtxRef.current.currentTime; // important
  }

  const ctx = downlinkCtxRef.current;

const buffer = ctx.createBuffer(
  1,
  pcm16.length,
  ctx.sampleRate
);
  const ch = buffer.getChannelData(0);

  for (let i = 0; i < pcm16.length; i++) {
    ch[i] = pcm16[i] / 32768;
  }

  const src = ctx.createBufferSource();
  src.buffer = buffer;
  src.connect(ctx.destination);

  //// 🔥🔥🔥 CHANGED HERE — continuous scheduling
  if (downlinkTime < ctx.currentTime) {
    downlinkTime = ctx.currentTime;
  }

  src.start(downlinkTime);
  downlinkTime += buffer.duration;
}


const TALK_TARGET_SAMPLE_RATE = 8000;
const TALK_FRAME_SAMPLES = 160;
const TALK_GAIN = 0.8;

function downsampleFloat32ToPCM16( input: Float32Array,   // input audio buffer
  inRate: number,        // input sample rate
  outRate: number ) : Int16Array {
  if (!input || !input.length) return new Int16Array(0);

  const ratio = inRate / outRate;
  const outLen = Math.floor(input.length / ratio);
  const out = new Int16Array(outLen);

  let pos = 0;

  for (let i = 0; i < outLen; i++) {
    const idx = Math.floor(pos);
    const next = input[idx + 1] || input[idx];
    const frac = pos - idx;

    // linear interpolation resample
    let s = input[idx] * (1 - frac) + next * frac;

    // moderate gain
    s *= TALK_GAIN;

    // noise gate
    if (Math.abs(s) < 0.015) s = 0;

    // limiter
    if (s > 0.90) s = 0.90;
    if (s < -0.90) s = -0.90;

    out[i] = Math.round(s * 0x7FFF);
    pos += ratio;
  }

  return out;
}

const cleanupTalk = () => {
  try {
    if (talkWsRef.current?.readyState === WebSocket.OPEN) {
      talkWsRef.current.send(JSON.stringify({ type: "closeTalk" }));
      talkWsRef.current.close();
    }
  } catch (e) {
    console.warn("Talk WS close error");
  }

  processorRef.current?.disconnect();
  sourceRef.current?.disconnect();
  gainNodeRef.current?.disconnect();
  audioCtxRef.current?.close();
  micStreamRef.current?.getTracks().forEach((t) => t.stop());

  talkWsRef.current = null;
  processorRef.current = null;
  sourceRef.current = null;
  gainNodeRef.current = null;
  audioCtxRef.current = null;
  micStreamRef.current = null;
  pcmQueueRef.current = [];

  downlinkCtxRef.current?.close();
  downlinkCtxRef.current = null;
  downlinkTime = 0;

  setIsTalking(false);
};
const openTalkWebSocket = (channel: number): Promise<void> => {
  return new Promise((resolve, reject) => {
    const sim = data?.uniqueid;
    const token = localStorage.getItem("zlm_token");

    const ws = new WebSocket(
      `wss://vms.trackingpath.com/ws/talk?token=${token}&sim=${sim}&ch=${channel}`
    );

    ws.binaryType = "arraybuffer";

    ws.onopen = () => {
      console.log("Talk WS connected");
      resolve();
    };

    ws.onerror = (e) => {
      console.error("Talk WS error", e);
      reject(e);
    };

    ws.onclose = () => console.log("Talk WS closed");

    ws.onmessage = (event) => {
      if (!(event.data instanceof ArrayBuffer)) return;

      const g711 = new Uint8Array(event.data);
      const pcm16 = decodeG711AlawToPcm16(g711);
      console.log("First byte:", g711[0]);
      playDownlinkPcm(pcm16);
      console.log("Downlink size:", event.data.byteLength);
    };

    talkWsRef.current = ws;
  });
};
const toggleTalk = async () => {
  const sim = data?.uniqueid;
  const channel = 1;

  if (!sim) return;

  if (!isTalking) {
    try {
         // 🔥 create separate talk session
      await startTalkSession(channel,streamType);
      // 🔥 1️⃣ Backend Start FIRST
      await anotherAxiosClient.post("/live/talk/start", null, {
        params: { sim, deviceId, channel },
      });

      // 🔥 2️⃣ Open WebSocket and WAIT until connected
      await openTalkWebSocket(channel);

      // 🔥 3️⃣ Now start mic AFTER WS is ready
      const micStream = await navigator.mediaDevices.getUserMedia({
  audio: {
    channelCount: 1,
    echoCancellation: true,
    noiseSuppression: true,
    autoGainControl: true
  }
});

    //   const micStream = await navigator.mediaDevices.getUserMedia({
    //     audio: {
    //       echoCancellation: true,
    // noiseSuppression: true,
    // autoGainControl: true,
    //     },
    //   });

      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      // const audioCtx = new AudioCtx();
      const audioCtx = new AudioCtx({
  latencyHint: 'interactive'
});
      await audioCtx.resume();

      const source = audioCtx.createMediaStreamSource(micStream);
      const processor = audioCtx.createScriptProcessor(2048, 1, 1);
      const gainNode = audioCtx.createGain();
      gainNode.gain.value = 0;

      processor.onaudioprocess = (e) => {
        const input = e.inputBuffer.getChannelData(0);
        const pcm16 = downsampleFloat32ToPCM16(
          input,
          audioCtx.sampleRate,
          TALK_TARGET_SAMPLE_RATE
        );

        const q = pcmQueueRef.current;
        for (let i = 0; i < pcm16.length; i++) q.push(pcm16[i]);

       while (q.length >= TALK_FRAME_SAMPLES) {
  const samples = q.splice(0, TALK_FRAME_SAMPLES);

  const payload = new ArrayBuffer(TALK_FRAME_SAMPLES * 2); // 320 bytes
  const view = new DataView(payload);

  for (let i = 0; i < TALK_FRAME_SAMPLES; i++) {
    view.setInt16(i * 2, samples[i], true); // little endian
  }

  console.log("sending bytes", payload.byteLength); // MUST be 320

  if (talkWsRef.current?.readyState === WebSocket.OPEN) {
    talkWsRef.current.send(payload);
  }
}
      };

      source.connect(processor);
      processor.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      audioCtxRef.current = audioCtx;
      micStreamRef.current = micStream;
      processorRef.current = processor;
      sourceRef.current = source;
      gainNodeRef.current = gainNode;

      setIsTalking(true);
    } catch (err) {
      console.error("Talk start failed", err);
      cleanupTalk();
      closeTalkSession(channel).catch(console.error);

    }
  } else {
    try {
      await anotherAxiosClient.post("/live/talk/stop", null, {
        params: { sim, deviceId, channel },
      });
    } catch {
      console.warn("Talk stop failed");
    }

    cleanupTalk();
    closeTalkSession(channel).catch(console.error);

  }
};
useEffect(() => {
  if (!showCallPopup) {
    cleanupTalk();
  }
}, [showCallPopup]);


const toggleSnapshotChannel = (ch: number) => {
  setSnapshotChannels((prev) =>
    prev.includes(ch)
      ? prev.filter((c) => c !== ch)
      : [...prev, ch]
  );
};
const sendSnapshot = async () => {

  const sim = data?.uniqueid;

  if (!sim || snapshotChannels.length === 0) {
    alert("Select at least one channel");
    return;
  }

  try {

    for (const ch of snapshotChannels) {

      await axiosClient.post("/command/snapshot", null, {
        params: {
          sim: sim,
          deviceId: deviceId,
          channel: ch,   // 👈 CH1 → 1, CH2 → 2        
        }
      });

    }
    // ✅ modal close
    setShowSnapshotModal(false);

    // ✅ polling start only if popup enabled
    if (isPopupEnabled) {
      startSnapshotPolling();
    }
  toast.success("Please wait for a moment while the snapshot is being processed. Command sent successfully.");

   setSnapshotChannels([]);
    setIsPopupEnabled(false);
  } catch (err) {
    console.error(err);
    alert("Failed to send snapshot");
  }
};
const startSnapshotPolling = () => {

  const today = new Date().toISOString().split("T")[0];

  const timeout = 60000;       // 1 min
  const intervalTime = 5000;   // 5 sec
  const start = Date.now();

  const BASE_URL = "https://fleetplus.trackingpath.com";
  let isHandled = false; 
  const interval = setInterval(async () => {
    try {

      for (const ch of snapshotChannels) {

        const res = await axiosClient.get("/command/snapshot-data", {
          params: {
            deviceId: deviceId,
            startTime: today,
            endTime: today,
            channel: ch
          }
        });

        if (res.data.success && res.data.data.length > 0) {

          const data = res.data.data;

          // ✅ ONLY LAST RECORD (as you want)
          const lastRow = data[data.length - 1];

          const imagePath =
            lastRow.imagePath ||
            lastRow.image ||
            lastRow.url;

          // 🔥 CASE 1: IMAGE MIL GAYI
          if (imagePath && imagePath !== "" && imagePath !== "null") {

            const publicPath = imagePath.replace(
              "/home/dashcam_upload/snapshot/",
              "/snapshots/"
            );

            const fullUrl = BASE_URL + publicPath;

            clearInterval(interval);

            if (!isHandled) {
              isHandled = true;

              setSnapshotImage(fullUrl);
              setShowPreviewModal(true);
            }

            return;
          }
        }
      }

      // ⛔ TIMEOUT → IMAGE NAHI MILI
      if (Date.now() - start > timeout) {
        clearInterval(interval);

        if (!isHandled) {
          isHandled = true;
           toast.error("Something went wrong!");     
        }
      }

    } catch (err) {
      console.error(err);
      clearInterval(interval);

      if (!isHandled) {
        isHandled = true;
        toast.error("API error");
      }
    }

  }, intervalTime);
};
const sendTerminalConfiguration = async () => {
  const sim = data?.uniqueid;

  if (!sim) {
    alert("Select sim");
    return;
  }

  try {
    setShowTerminalModal(true);
    setTerminalData(null);
    setLoadingTerminal(true);

    // ✅ 1. Command send
    await axiosClient.post("/command/terminal-configuration", null, {
      params: {
        sim: sim,
        deviceId: deviceId,
      },
    });

    toast.success("Terminal configuration command sent successfully");

    // ✅ 2. Thoda delay (important - device response ke liye)
    setTimeout(async () => {
      try {
        const res = await axiosClient.get(
          "/command/terminal-configuration-data",
          {
            params: { deviceId: deviceId },
          }
        );

        if (res.data?.success) {
          setTerminalData({
            configData: res.data.data,
            deviceName: data?.device_name, // 👈 separate bhejna
          });
        }
      } catch (err) {
        console.error(err);
        toast.error("Failed to fetch terminal configuration data");
      } finally {
        setLoadingTerminal(false);
      }
    }, 60000); // ⏱️ adjust (2–5 sec)

  } catch (err) {
    console.error(err);
    toast.error("Failed to send terminal configuration");
    setShowTerminalModal(false);
    setLoadingTerminal(false);
  }
};
const sendRestart = async () => {

  const sim = data?.uniqueid;

  if (!sim ) {
    alert("Select sim!");
    return;
  }

  try {
      await axiosClient.post("/command/restart-command", null, {
        params: {
          sim: sim,
          deviceId: deviceId           
        }
      });
       toast.success("Restart command sent successfully");
  } catch (err) {
    console.error(err);
    toast.error("Failed to send restart command");
  }
};
// 👇 yaha bana do (component ke andar)
const openPopupWindow = (url: string) => {
  const width = 360;
  const height = 600;

  const left = window.screenX + 50;
  const top = window.screenY + 50;

  window.open(
    url,
    "MDVR_REMOTE",
    `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes`
  );
};

const sendRemoteConfig = async () => {
  const sim = data?.uniqueid;

  if (!sim) {
    alert("SIM not available");
    return;
  }

  try {
    const res = await axiosClient.post("/command/remote-access", null, {
      params: {
        sim: sim,
        deviceId: deviceId,
      },
    });

    // 🔥 IMPORTANT: get URL from response
    const url = res?.data?.url;

    if (res?.data?.success && url) {
      // ✅ Open in new tab
 openPopupWindow(url);    } else {
      alert("Command sent but no URL received");
    }

  } catch (err) {
    console.error(err);
    alert("Failed to send remote configuration");
  }
};
  //////////////////////////////////////////////////////////////
  // 🏆 UI
  //////////////////////////////////////////////////////////////

  return (
    <div className="live-container">
      {/* SIDEBAR */}
      <div className="live-sidebar">
        <div className="livesidebar-header">Device</div>

        <div className="device-card">
          <div className="device-header">
            <span className="toggle-btn" onClick={() => setExpanded(!expanded)}>
              {expanded ? "−" : "+"}
            </span>

            <div className="device-info">
              <div className="device-name">{data?.device_name}</div>
            </div>

            <span
              className={`status-pill ${
                data?.status === "online" ? "online" : "offline"
              }`}
            >
              {data?.status === "online" ? "Online" : "Offline"}
            </span>
          </div>

         {expanded && (
  <div className="channel-box">
    {availableChannels.map((ch) => (
      <label key={ch} className="channel-item">
        <input
          type="checkbox"
          onChange={(e) =>
            handleChannelToggle(ch, e.target.checked)
          }
        />
        <span>CH{ch}</span>
      </label>
    ))}
  </div>
)}

          <div className="device-footer">
           {/* <i className="bi bi-car-front" />
            <i className="bi bi-gear" />*/}


{/* STATUS ICON ROW */}
                                  <div className="vehicle-status">

                                    {/* IGNITION */}
                                    {(() => {
                                      const attrs = getAttributes(v);
                                      const ignitionOn =
                                        attrs.ignition === true;
                                      return (
                                        <span
                                          className={`status-icon ignition tooltip-wrap ${!isDataAvailable ? "disabled-status" : ""
                                            } ${v.status !== "online" ? "ignition-disabled" : ""} ${ignitionOn ? "ignition-on" : "ignition-off"
                                            }`}
                                        >
                                          <i className="fas fa-key"></i>
                                          <span className="tooltip-text">
                                            Ignition: {ignitionOn ? "ON" : "OFF"}
                                          </span>
                                        </span>
                                      );
                                    })()}

                                    {/* ENGINE */}
                                    {(() => {
                                      const engine = getEngineIconAndTitle(v);

                                      return (
                                        <span
                                          className={`status-icon engine tooltip-wrap ${!isDataAvailable ? "disabled-status" : ""
                                            } ${v.status !== "online" ? "engine-disabled" : ""}`}
                                        >
                                          <img
                                            src={engine.icon}
                                            alt="Engine"
                                            className="engine-img"
                                          />
                                          <span className="tooltip-text">
                                            {engine.title}
                                          </span>
                                        </span>
                                      );
                                    })()}

                                    {/* ODOMETER */}
                                    {(() => {
                                      const attrs = getAttributes(v);
                                      const totalOdo = attrs?.total_odometer;

                                      return (
                                        <span
                                          className={`status-icon odometer tooltip-wrap ${!isDataAvailable ? "disabled-status" : ""
                                            }`}
                                        >
                                          <i className="fas fa-tachometer-alt"></i>

                                          <span className="tooltip-text">
                                            {isDataAvailable && totalOdo !== undefined
                                              ? `Total Odometer: ${totalOdo} km`
                                              : "Total Odometer: 0 km"}
                                            <br />
                                          </span>
                                        </span>
                                      );
                                    })()}

                                    {/* GPS */}
                                    {(() => {
                                      const attrs = getAttributes(v);

                                      return (
                                        <span
                                          className={`status-icon gps tooltip-wrap ${!isDataAvailable ? "disabled-status" : ""
                                            }`}
                                        >
                                          <i className="fas fa-satellite-dish"></i>

                                          <span className="tooltip-text">
                                            {isDataAvailable
                                              ? `Gps: ${attrs.sat ?? 0}`
                                              : "Gps: --"}
                                          </span>
                                        </span>
                                      );
                                    })()}

                                    {/* GSM */}
                                    {(() => {
                                      const attrs = getAttributes(v);
                                      const rssi = Number(attrs?.rssi ?? 0);

                                      let percent = 0;

                                      if (rssi <= 5) {
                                        percent = rssi * 20;
                                      } else {
                                        percent = Math.min(Math.max(rssi, 0), 100);
                                      }

                                      let colorClass = "gsm-gray";

                                      if (percent > 0 && percent <= 40) {
                                        colorClass = "gsm-red";
                                      } else if (percent > 40 && percent < 80) {
                                        colorClass = "gsm-orange";
                                      } else if (percent >= 80) {
                                        colorClass = "gsm-green";
                                      }
                                      const activeBars =
                                        percent >= 100
                                          ? 5
                                          : percent >= 80
                                            ? 4
                                            : percent >= 60
                                              ? 3
                                              : percent >= 40
                                                ? 2
                                                : percent > 0
                                                  ? 1
                                                  : 0;
                                      return (
                                        <span
                                          className={`status-icon gsm tooltip-wrap ${!isDataAvailable ? "disabled-status" : ""
                                            }`}
                                        >
                                          <div className={`gsm-bars ${colorClass}`}>
                                            {[1, 2, 3, 4, 5].map((n) => {
                                              const isActive =
                                                isDataAvailable && n <= activeBars;

                                              return (
                                                <span
                                                  key={n}
                                                  className={`bar ${isActive ? "active" : ""}`}
                                                ></span>
                                              );
                                            })}
                                          </div>
                                          <span className="tooltip-text">
                                            {isDataAvailable ? `GSM Signal: ${percent}%` : "GSM Signal: --"}
                                          </span>
                                        </span>
                                      );
                                    }
                                    )()}
                                  </div>







            <i
              className="bi bi-camera"
              title="Open History"
              style={{ cursor: "pointer", marginTop: "4px" }}
              onClick={onOpenHistory}
            />
            <i
              className="bi bi-telephone"
              onClick={() => setShowCallPopup(true)}
              style={{ cursor: "pointer", marginTop: "4px" }}
            />
            {/* Three dot icon */}
           <i
           className="bi bi-three-dots"
          style={{ cursor: "pointer", marginTop: "4px" }}
         onClick={(e) => {
    e.stopPropagation();
    setShowMenu(!showMenu);
  }}
          />
               {showMenu && (
  <div className="device-menu" ref={menuRef}>
    <div className="menu-item">
      <i className="bi bi-share" /> Share
    </div>

   <div
  className="menu-item"
  onClick={() => {
    setShowMenu(false);   // menu close ho jaye
    sendTerminalConfiguration(); // 🔥 API call
  }}
>
  <i className="bi bi-terminal" /> Terminal Configuration
</div>
    <div className="menu-item">
      <i className="bi bi-plug" /> Fuel-electric Control
    </div>

    <div className="menu-item"  onClick={() => {
    setShowMenu(false);
    setShowSnapshotModal(true);
  }}>
      <i className="bi bi-camera" /> Snapshot
    </div>

    <div className="menu-item">
      <i className="bi bi-card-list" /> Check Device Parameters
    </div>

  <div
  className="menu-item"
  onClick={() => {
    setShowMenu(false);
    setShowRemoteConfirm(true); // 🔥 open modal
  }}
>
  <i className="bi bi-sliders" /> Remote Configuration
</div>

    <div className="menu-item" onClick={() => {setShowMenu(false); sendRestart(); }}style={{ cursor: "pointer" }}>
  <i className="bi bi-power" /> Restart Command
</div>
  </div>
)}
          </div>
        </div>
        
<div className="vh-tips">
  <strong>Tips:</strong>
  <ul>
    <li>
      Device is online, but ignition is OFF. Please check the camera configuration, as some devices go offline when ignition is turned off.
    </li>
  </ul>
</div>

      </div>

      {/* MAIN */}
      <div className="live-main">
        <div className="live-topbar">
          <div>
            Type:
            <select
              value={streamType}
              onChange={(e) => setStreamType(e.target.value as "main" | "sub")}
            >
              <option value="main">Main</option>
              <option value="sub">Sub</option>
            </select>
          </div>

          <div>
            Screens:
            <select
              value={screens}
              onChange={(e) => setScreens(Number(e.target.value))}
            >
              {screenOptions.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* 🏆 GRID */}
        <div className={`video-grid ${getGridClass()}`}>
          {Array.from({ length: screens }).map((_, i) => {
            const entry = Object.entries(channelSlots).find(
              ([, slot]) => slot === i,
            );

            const channel = entry ? Number(entry[0]) : undefined;

            return (
              <VideoBox
                key={i} // 🔥 SLOT KEY
                channel={channel}
                status={data?.status}
                sim={data?.uniqueid}
                 loading={channel ? loadingChannels.includes(channel) : false}
              />
            );
          })}
        </div>
      </div>

   {showCallPopup && (
  <div className="call-overlay">
    <div
      className="call-popup"
      ref={popupRef}
      style={{ position: "absolute" }}
    >
      <div className="call-header" onMouseDown={handleMouseDown} onTouchStart={handleTouchStart} >
        <div className="call-title">{data?.device_name}</div>

        <div className="call-actions">
          <i
            className="bi bi-x close-icon"
            onClick={() => setShowCallPopup(false)}
          />
        </div>
      </div>

      <div className="call-body">
        {!isTalking ? (
          <i className="bi bi-headphones call-icon" />
        ) : (
          <div className="call-controls">
            
            {/* 🔊 Speaker */}
            <i
              className={`bi ${
                isSpeakerMuted ? "bi-volume-mute" : "bi-volume-up"
              } control-icon`}
              onClick={() => setIsSpeakerMuted(!isSpeakerMuted)}
              title="Speaker"
            />

            {/* 🎤 Mic */}
            <i
              className={`bi ${
                isMuted ? "bi-mic-mute" : "bi-mic"
              } control-icon ${isMuted ? "mic-muted" : ""}`}
              onClick={() => setIsMuted(!isMuted)}
              title="Mic"
            />
          </div>
        )}

        {isTalking && (
          <div className="talking-status">Talking...</div>
        )}
      </div>

      <button className="call-open-btn" onClick={toggleTalk}>
        {isTalking ? "Stop" : "Open"}
      </button>
    </div>
  </div>
)}
     <Modal
  isOpen={showSnapshotModal}
  title="Snapshot"
  onClose={() => setShowSnapshotModal(false)}
  size="medium"
  draggable
  className="snapshot-modal" 
>
  {/* CHANNELS */}
  <div className="snapshot-channels">
  <span className="snapshot-label">Channel</span>

  {availableChannels.map((ch) => (
    <label key={ch} className="snapshot-channel">
      <input
        type="checkbox"
        checked={snapshotChannels.includes(ch)}
        onChange={() => toggleSnapshotChannel(ch)}
      />
      CH{ch}
    </label>
  ))}
</div>

<div className="snapshot-popup-row">
  <span className="snapshot-label">Pop-up Image</span>

  <label className="switch">
   <input 
  type="checkbox" 
  checked={isPopupEnabled}
  onChange={(e) => setIsPopupEnabled(e.target.checked)}
/>
    <span className="slider"></span>
  </label>
</div>

<div className="snapshot-footer">
  <button className="btn-send" onClick={sendSnapshot}>
    Send
  </button>
</div>
</Modal> 
 
<Modal
  isOpen={showRemoteConfirm}
  title="Remote Configuration"
  onClose={() => setShowRemoteConfirm(false)}
  size="small"
  draggable
  className="modal-small"
>
  <div className="remote-confirm">
    
    <div className="remote-icon">
      <i className="bi bi-exclamation-triangle" />
    </div>

    <div className="remote-text">
      <p>
        Please ensure <b>ACC is ON</b> and vehicle speed is 
        <b> ≤ 5 km/h</b> to access remote configuration.
      </p>

      <p className="sub-text">
        If it still doesn’t work, check the device network or contact support.
      </p>
    </div>

    <div className="remote-actions">
  <button
    className="remotbtn primary"
    onClick={() => {
      setShowRemoteConfirm(false);
      sendRemoteConfig();
    }}
  >
    Continue
  </button>

  <button
    className="remotbtn secondary"
    onClick={() => setShowRemoteConfirm(false)}
  >
    Cancel
  </button>
</div>

  </div>
</Modal>
<Modal
  isOpen={showTerminalModal}
  title="Device Settings"
  onClose={() => setShowTerminalModal(false)}
  size="fullscreen"
  draggable={false}
>
    <TerminalConfigUI 
    terminalData={terminalData?.configData}
    deviceName={terminalData?.deviceName}
    loading={loadingTerminal}/>
</Modal>
<Modal
  isOpen={showPreviewModal}
  title="Snapshot Preview"
  onClose={() => setShowPreviewModal(false)}
  size="fullscreen"
>
  {snapshotImage ? (
    <img
      src={snapshotImage}
      alt="snapshot"     
    />
  ) : (
    <p>No Image</p>
  )}
</Modal>
 
    </div>
  );
};

export default LiveVideo;
