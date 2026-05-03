import { useEffect, useRef, useState } from "react";
import WaveSurfer from "wavesurfer.js";
import "../../assets/css/routeWizard.css";

type StopType = "Pickup" | "Drop";

type Stop = {
  id?: number;
  sequenceNo: number;
  stopName: string;
  stopType: StopType;
  geofenceRadius: number;
  latitude?: number;
  longitude?: number;
  passengerCount?: number;
  approved?: boolean;
  clientStopId?: number;
  announcementFile?: File | string | null;
};

type FormData = {
  stops?: Stop[];
  defaultLat?: number;
  defaultLng?: number;
};

type Props = {
  data: FormData;
  updateForm: (data: Partial<FormData>) => void;
};

const DEFAULT_STOP: Stop = {
  sequenceNo: 0,
  stopName: "",
  stopType: "Pickup",
  geofenceRadius: 50,
  clientStopId: 0,
  announcementFile: null,
};

const STOP_TYPES: StopType[] = ["Pickup", "Drop"];

const FALLBACK_LOCATION = {
  latitude: 26.8467,
  longitude: 80.9462,
};

const StopsStep = ({ data, updateForm }: Props) => {
  const [stops, setStops] = useState<Stop[]>([]);
  const [newStop, setNewStop] = useState<Stop>(DEFAULT_STOP);
  const [currentAudio, setCurrentAudio] = useState<{
    fileName: string;
    url: string;
  } | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);

  const miniWaveRef = useRef<WaveSurfer | null>(null);
  const miniWaveContainerRef = useRef<HTMLDivElement | null>(null);
  const objectUrlRef = useRef<string | null>(null);

  useEffect(() => {
    setStops(data.stops || []);
  }, [data.stops]);

  useEffect(() => {
    return () => {
      miniWaveRef.current?.destroy();
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
      }
    };
  }, []);

  const sync = (updated: Stop[]) => {
    setStops(updated);
    updateForm({ stops: updated });
  };

  const resetNewStop = () => {
    setNewStop(DEFAULT_STOP);
  };

  const generateClientStopId = () =>
    Math.floor(100000000000000 + Math.random() * 900000000000000);

  const renumberStops = (items: Stop[]) =>
    items.map((stop, index) => ({
      ...stop,
      sequenceNo: index + 1,
    }));

  const updateStop = (index: number, patch: Partial<Stop>) => {
    const updated = stops.map((stop, currentIndex) =>
      currentIndex === index ? { ...stop, ...patch } : stop,
    );
    sync(updated);
  };

  const addStop = () => {
    if (!newStop.stopName.trim()) return;

    const updated = renumberStops([
      ...stops,
      {
        ...newStop,
        stopName: newStop.stopName.trim(),
        clientStopId: generateClientStopId(),
        latitude: data.defaultLat ?? FALLBACK_LOCATION.latitude,
        longitude: data.defaultLng ?? FALLBACK_LOCATION.longitude,
      },
    ]);

    sync(updated);
    resetNewStop();
  };

  const deleteStop = (index: number) => {
    const updated = renumberStops(
      stops.filter((_, currentIndex) => currentIndex !== index),
    );
    sync(updated);
  };

  const getAudioSource = (file: File | string) => {
    if (typeof file === "string") {
      return {
        fileName: file,
        url: `${import.meta.env.VITE_SOUND_BASE_URL}/${file}`,
      };
    }

    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
    }

    const objectUrl = URL.createObjectURL(file);
    objectUrlRef.current = objectUrl;

    return {
      fileName: file.name,
      url: objectUrl,
    };
  };

  const formatTime = (time: number) => {
    if (!time || Number.isNaN(time)) return "0:00";
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handlePlay = (announcementFile?: File | string | null) => {
    if (!announcementFile) return;

    const source = getAudioSource(announcementFile);

    if (currentAudio?.fileName === source.fileName && miniWaveRef.current) {
      miniWaveRef.current.playPause();
      return;
    }

    setCurrentAudio(source);
  };

  const closePlayer = () => {
    miniWaveRef.current?.destroy();
    miniWaveRef.current = null;

    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }

    setCurrentAudio(null);
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
  };

  const togglePlayback = () => {
    miniWaveRef.current?.playPause();
  };

  useEffect(() => {
    if (!currentAudio || !miniWaveContainerRef.current) return;

    miniWaveRef.current?.destroy();

    const ws = WaveSurfer.create({
      container: miniWaveContainerRef.current,
      waveColor: "#bfdbfe",
      progressColor: "#0f766e",
      cursorColor: "#0f766e",
      barWidth: 3,
      barGap: 2,
      barRadius: 999,
      height: 44,
      normalize: true,
      dragToSeek: true,
    });

    miniWaveRef.current = ws;
    ws.load(currentAudio.url);

    ws.on("ready", () => {
      ws.setVolume(isMuted ? 0 : volume);
      setDuration(ws.getDuration());
      setCurrentTime(0);
      ws.play();
    });

    ws.on("play", () => setIsPlaying(true));
    ws.on("pause", () => setIsPlaying(false));
    ws.on("timeupdate", (time) => setCurrentTime(time));
    ws.on("seeking", (time) => setCurrentTime(time));
    ws.on("finish", () => {
      setIsPlaying(false);
      setCurrentTime(ws.getDuration());
    });

    return () => {
      ws.destroy();
    };
  }, [currentAudio]);

  useEffect(() => {
    if (!miniWaveRef.current) return;
    miniWaveRef.current.setVolume(isMuted ? 0 : volume);
  }, [volume, isMuted]);

  return (
    <section className="rws-stopstep">
      <div className="rws-stopstep__shell">
        <div className="rws-stopstep__header">
          <div>
            <p className="rws-stopstep__eyebrow">Stops</p>
            <h3 className="rws-stopstep__title">Stop Management</h3>
            <p className="rws-stopstep__subtitle">
              Keep route stops, approvals, audio, and map-ready coordinates in
              one place.
            </p>
          </div>

          <div className="rws-stopstep__metrics">
            <div className="rws-stopstep__metric">
              <span className="rws-stopstep__metric-label">Total Stops</span>
              <strong className="rws-stopstep__metric-value">
                {stops.length}
              </strong>
            </div>
            <div className="rws-stopstep__metric">
              <span className="rws-stopstep__metric-label">Approved</span>
              <strong className="rws-stopstep__metric-value">
                {stops.filter((stop) => stop.approved).length}
              </strong>
            </div>
          </div>
        </div>

        <div className="rws-stopstep__table-wrap">
          <table className="rws-stopstep__table">
            <thead>
              <tr>
                <th>Seq</th>
                <th>Stop Name</th>
                <th>Type</th>
                <th>Radius</th>
                <th>Passengers</th>
                <th>Status</th>
                <th>Location</th>
                <th>Audio File</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {stops.length === 0 ? (
                <tr>
                  <td colSpan={9} className="rws-stopstep__empty">
                    No stops added yet
                  </td>
                </tr>
              ) : (
                stops.map((stop, index) => {
                  const fileName =
                    typeof stop.announcementFile === "string"
                      ? stop.announcementFile
                      : stop.announcementFile?.name;

                  const isActive = currentAudio?.fileName === fileName;

                  return (
                    <tr
                      key={stop.id || stop.clientStopId || index}
                      className={isActive ? "is-audio-active" : ""}
                    >
                      <td>
                        <input
                          type="number"
                          value={stop.sequenceNo}
                          onChange={(event) =>
                            updateStop(index, {
                              sequenceNo: Number(event.target.value),
                            })
                          }
                          className="rws-stopstep__input rws-stopstep__input--compact"
                        />
                      </td>

                      <td>
                        <input
                          value={stop.stopName}
                          onChange={(event) =>
                            updateStop(index, { stopName: event.target.value })
                          }
                          className="rws-stopstep__input"
                        />
                      </td>

                      <td>
                        <select
                          value={stop.stopType}
                          onChange={(event) =>
                            updateStop(index, {
                              stopType: event.target.value as StopType,
                            })
                          }
                          className="rws-stopstep__select"
                        >
                          {STOP_TYPES.map((type) => (
                            <option key={type} value={type}>
                              {type}
                            </option>
                          ))}
                        </select>
                      </td>

                      <td>
                        <input
                          type="number"
                          value={stop.geofenceRadius}
                          onChange={(event) =>
                            updateStop(index, {
                              geofenceRadius: Number(event.target.value),
                            })
                          }
                          className="rws-stopstep__input rws-stopstep__input--compact"
                        />
                      </td>

                      <td>
                        <span className="rws-stopstep__pill">
                          {stop.passengerCount ?? 0}
                        </span>
                      </td>

                      <td>
                        <span
                          className={`rws-stopstep__status ${
                            stop.approved ? "is-approved" : "is-pending"
                          }`}
                        >
                          {stop.approved ? "Approved" : "Pending"}
                        </span>
                      </td>

                      <td>
                        {stop.latitude != null && stop.longitude != null ? (
                          <span className="rws-stopstep__coords">
                            {stop.latitude.toFixed(5)},{" "}
                            {stop.longitude.toFixed(5)}
                          </span>
                        ) : (
                          <span className="rws-stopstep__muted">Not Set</span>
                        )}
                      </td>

                      <td>
                        <div className="rws-stopstep__audio-cell">
                          <button
                            type="button"
                            className={`rws-stopstep__audio-btn ${
                              stop.announcementFile
                                ? "is-available"
                                : "is-disabled"
                            } ${isActive ? "is-active" : ""}`}
                            onClick={() => handlePlay(stop.announcementFile)}
                            disabled={!stop.announcementFile}
                            title={
                              !stop.announcementFile
                                ? "No audio available"
                                : isActive && isPlaying
                                  ? "Pause audio"
                                  : "Play audio"
                            }
                          >
                            <i
                              className={`fas ${
                                isActive && isPlaying ? "fa-pause" : "fa-play"
                              }`}
                            />
                          </button>
                          {/* <span className="rws-stopstep__file-name">
                            {fileName || "No file"}
                          </span> */}
                        </div>
                      </td>

                      <td>
                        <div className="rws-stopstep__actions">
                          <label
                            className="rws-stopstep__icon-btn"
                            title="Upload audio"
                          >
                            <i className="fas fa-upload" />
                            <input
                              type="file"
                              hidden
                              accept="audio/*"
                              onChange={(event) => {
                                const file = event.target.files?.[0] || null;
                                updateStop(index, { announcementFile: file });
                                event.target.value = "";
                              }}
                            />
                          </label>

                          <button
                            type="button"
                            className="rws-stopstep__action-btn is-secondary"
                            onClick={() =>
                              updateStop(index, { approved: true })
                            }
                          >
                            Approve
                          </button>

                          <button
                            type="button"
                            className="rws-stopstep__action-btn is-danger"
                            onClick={() => deleteStop(index)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {currentAudio && (
          <div className="rws-stopstep__player">
            <div className="rws-stopstep__player-main">
              <div className="rws-stopstep__player-meta">
                <div className="rws-stopstep__player-icon">
                  <i className="fas fa-music" />
                </div>
                <div>
                  <div className="rws-stopstep__player-title">
                    {currentAudio.fileName}
                  </div>
                  <div className="rws-stopstep__player-subtitle">
                    Stop Announcement
                  </div>
                </div>
              </div>

              <div className="rws-stopstep__player-center">
                <div
                  ref={miniWaveContainerRef}
                  className="rws-stopstep__wave"
                />

                <div className="rws-stopstep__player-controls">
                  <button
                    type="button"
                    className="rws-stopstep__player-btn"
                    onClick={togglePlayback}
                    title={isPlaying ? "Pause audio" : "Play audio"}
                  >
                    <i
                      className={`fas ${isPlaying ? "fa-pause" : "fa-play"}`}
                    />
                  </button>

                  <button
                    type="button"
                    className="rws-stopstep__player-btn"
                    onClick={() => setIsMuted((prev) => !prev)}
                    title={isMuted ? "Unmute audio" : "Mute audio"}
                  >
                    <i
                      className={`fas ${
                        isMuted || volume === 0
                          ? "fa-volume-mute"
                          : "fa-volume-up"
                      }`}
                    />
                  </button>

                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={isMuted ? 0 : volume}
                    onChange={(event) => {
                      const nextVolume = Number(event.target.value);
                      setVolume(nextVolume);
                      if (nextVolume > 0 && isMuted) {
                        setIsMuted(false);
                      }
                    }}
                    className="rws-stopstep__volume"
                    aria-label="Volume"
                  />

                  <div className="rws-stopstep__time">
                    {formatTime(currentTime)} / {formatTime(duration)}
                  </div>
                </div>
              </div>

              <button
                type="button"
                className="rws-stopstep__player-btn is-close"
                onClick={closePlayer}
                title="Close player"
              >
                <i className="fas fa-times" />
              </button>
            </div>
          </div>
        )}

        <div className="rws-stopstep__composer">
          <div className="rws-stopstep__composer-fields">
            <input
              placeholder="Stop name"
              value={newStop.stopName}
              onChange={(event) =>
                setNewStop({ ...newStop, stopName: event.target.value })
              }
              className="rws-stopstep__input"
            />

            <select
              value={newStop.stopType}
              onChange={(event) =>
                setNewStop({
                  ...newStop,
                  stopType: event.target.value as StopType,
                })
              }
              className="rws-stopstep__select"
            >
              {STOP_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>

            <input
              type="number"
              value={newStop.geofenceRadius}
              onChange={(event) =>
                setNewStop({
                  ...newStop,
                  geofenceRadius: Number(event.target.value),
                })
              }
              className="rws-stopstep__input"
            />
          </div>

          <button
            type="button"
            className="rws-stopstep__add-btn"
            onClick={addStop}
          >
            Add Stop
          </button>
        </div>
      </div>
    </section>
  );
};

export default StopsStep;
