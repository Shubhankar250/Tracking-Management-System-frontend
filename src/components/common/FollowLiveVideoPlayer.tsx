import React, { useState, useEffect, useRef, memo } from "react";
import "../../assets/css/followLiveVideoPlayer.css";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import anotherAxiosClient from "../../api/anotherAxiosClient";
import placeholderImage from "../../assets/images/video1.jpg";
import { fetchLiveDataByDeviceId } from "../../slices/liveDataByDeviceIdSlice";

interface Props {
  deviceId: string;
}

const screenOptions = [2, 4, 8, 16];

//////////////////////////////////////////////////////////////
// 🏆 VIDEO TILE
//////////////////////////////////////////////////////////////

interface VideoBoxProps {
  channel?: number;
  status?: string;
  sim?: string;
  loading?: boolean;
}

const VideoBox = memo(({ channel, status, sim, loading }: VideoBoxProps) => {
  const ref = useRef<HTMLDivElement | null>(null);
  const playerRef = useRef<any>(null);
  const playingChannel = useRef<number | null>(null);

  useEffect(() => {
    if (!ref.current) return;

    if (!channel || status !== "online") {
      if (playerRef.current) {
        playerRef.current.destroy();
        playerRef.current = null;
        playingChannel.current = null;
      }
      return;
    }

    if (playingChannel.current === channel) return;

    const Jessibuca = (window as any).Jessibuca;
    if (!Jessibuca) return;

    const streamId = `${sim}_ch${channel}`;
    const url = `wss://vms.trackingpath.com/rtp/${streamId}.live.flv?t=${Date.now()}`;

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
      videoBuffer: 0.2,
      isResize: true, // resize allow
      isFullResize: true, // full stretch
      controlAutoHide: false,
      operateBtns: {
        fullscreen: true,
        screenshot: true,
        play: true,
        audio: true,
      },
    });

    // 🔥 delay play
    setTimeout(() => {
      player.play(url);
    }, 500);

    // 🔥 loader stop event
    player.on("play", () => {
      window.dispatchEvent(
        new CustomEvent("videoStarted", { detail: channel })
      );
    });

    player.on("pause", () => {
      setTimeout(() => player.play(), 500);
    });

    player.on("error", () => {
      setTimeout(() => player.play(url), 1000);
    });

    playerRef.current = player;
    playingChannel.current = channel;

    return () => {};
  }, [channel, status, sim]);

  return (
    <div className="follow-video-box">
      <div className="follow-video-header">
        {channel ? `CH${channel}` : "Not Connected"}
      </div>

      <div ref={ref} className="follow-video-body">
        {!channel && (
          <img src={placeholderImage} className="follow-video-placeholder" />
        )}

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

const FollowLiveVideoPlayer: React.FC<Props> = ({ deviceId }) => {
  const [screens, setScreens] = useState<number>(2);
  const [streamType, setStreamType] = useState<"main" | "sub">("sub");
  const [channelSlots, setChannelSlots] = useState<Record<number, number>>({});
  const [availableChannels, setAvailableChannels] = useState<number[]>([]);
  const [loadingChannels, setLoadingChannels] = useState<number[]>([]);
  const [showCallPopup, setShowCallPopup] = useState(false);

  const dispatch = useAppDispatch();

  const { data } = useAppSelector(
    (state) => state.liveDataByDeviceId
  );

  //////////////////////////////////////////////////////////////
  // FETCH DATA
  //////////////////////////////////////////////////////////////

  useEffect(() => {
    if (deviceId) {
      dispatch(fetchLiveDataByDeviceId(Number(deviceId)));
    }
  }, [deviceId]);

  useEffect(() => {
    if (data?.channelNo && screenOptions.includes(data.channelNo)) {
      setScreens(data.channelNo);
    }
  }, [data?.channelNo]);

  //////////////////////////////////////////////////////////////
  // CHANNEL SETUP
  //////////////////////////////////////////////////////////////

  useEffect(() => {
    const channels = Array.from({ length: screens }, (_, i) => i + 1);
    setAvailableChannels(channels);

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

  //////////////////////////////////////////////////////////////
  // LOADER EVENT
  //////////////////////////////////////////////////////////////

  useEffect(() => {
    const handleVideoStarted = (e: any) => {
      const ch = e.detail;
      setLoadingChannels((prev) => prev.filter((c) => c !== ch));
    };

    window.addEventListener("videoStarted", handleVideoStarted);
    return () => {
      window.removeEventListener("videoStarted", handleVideoStarted);
    };
  }, []);

  //////////////////////////////////////////////////////////////
  // BACKEND
  //////////////////////////////////////////////////////////////

  const startBackendStream = async (channel: number) => {
    const sim = data?.uniqueid;
    if (!sim) return;

    await anotherAxiosClient.post("/live/start", null, {
      params: {
        sim,
        deviceId,
        channel,
        streamType,
        transport: "tcp",
        mode: "vendor",
        waitReady: "true",
      },
    });
  };

  const stopBackendStream = async (channel: number) => {
    const sim = data?.uniqueid;
    if (!sim) return;

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

  //////////////////////////////////////////////////////////////
  // TOGGLE CHANNEL
  //////////////////////////////////////////////////////////////

  const handleChannelToggle = (channel: number, checked: boolean) => {
    if (checked) {
      setLoadingChannels((prev) => [...prev, channel]);

      startBackendStream(channel).catch(console.error);

      setChannelSlots((prev) => {
        if (prev[channel] !== undefined) return prev;

        const used = Object.values(prev);
        const freeSlot = Array.from({ length: screens }, (_, i) => i).find(
          (i) => !used.includes(i)
        );

        if (freeSlot === undefined) return prev;

        return { ...prev, [channel]: freeSlot };
      });
    } else {
      setChannelSlots((prev) => {
        const updated = { ...prev };
        delete updated[channel];
        return updated;
      });

      stopBackendStream(channel).catch(console.error);

      setLoadingChannels((prev) => prev.filter((ch) => ch !== channel));
    }
  };

  const getGridClass = () => `follow-grid-${screens}`;

  //////////////////////////////////////////////////////////////
  // UI
  //////////////////////////////////////////////////////////////

  return (
    <div className="follow-live-container">
      <div className="follow-live-main">

        {/* TOP BAR */}
        <div className="follow-live-topbar">

          <div className="follow-device-card-inline">
            <div className="follow-device-header">
              <div className="follow-device-name">
                {data?.device_name}
              </div>

              <div className="follow-device-actions">
                <i
                  className="bi bi-telephone"
                  onClick={() => setShowCallPopup(true)}
                />

                <span
                  className={`follow-status-pill ${
                    data?.status === "online" ? "online" : "offline"
                  }`}
                >
                  {data?.status === "online" ? "Online" : "Offline"}
                </span>
              </div>
            </div>

            <div className="follow-channel-box-inline">
              {availableChannels.map((ch) => (
                <label key={ch} className="follow-channel-item">
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
          </div>

          {/* TYPE */}
          <div>
            Type:
            <select
              value={streamType}
              onChange={(e) =>
                setStreamType(e.target.value as "main" | "sub")
              }
            >
              <option value="main">Main</option>
              <option value="sub">Sub</option>
            </select>
          </div>

          {/* SCREENS */}
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

        {/* GRID */}
        <div className={`follow-video-grid ${getGridClass()}`}>
          {Array.from({ length: screens }).map((_, i) => {
            const entry = Object.entries(channelSlots).find(
              ([, slot]) => slot === i
            );

            const channel = entry ? Number(entry[0]) : undefined;

            return (
              <VideoBox
                key={i}
                channel={channel}
                status={data?.status}
                sim={data?.uniqueid}
                loading={channel ? loadingChannels.includes(channel) : false}
              />
            );
          })}
        </div>
      </div>

      {/* CALL POPUP */}
      {showCallPopup && (
        <div className="follow-call-overlay">
          <div className="follow-call-popup">
            <div className="follow-call-header">
              <div>{data?.device_name}</div>
              <i
                className="bi bi-x"
                onClick={() => setShowCallPopup(false)}
              />
            </div>

            <div className="follow-call-body">
              <i className="bi bi-headphones" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FollowLiveVideoPlayer;