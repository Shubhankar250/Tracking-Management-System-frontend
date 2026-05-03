import { useEffect, useRef, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import { fetchDevices } from "../../slices/devicesSlice";
import {
  fetchPlaybackData,
  clearPlaybackData,
} from "../../slices/playbackSlice";
import "../../assets/css/history.css";
import StoppageList from "../common/StoppageList";
import type { StoppageItem } from "./StoppageList";
import PlaybackBottomPanel from "../common/PlaybackBottomPanel";
import Select from "react-select";
import { downloadHistoryReport } from "../../slices/historyExportSlice";
import {
  fetchDrivingPlaybackData,
  clearDrivingPlaybackData,
} from "../../slices/playbackDrivingDataSlice";

// ✅ TypeScript interface
interface LiveDataBeanForCard {
  total_distance?: number;
  total_running_time?: string;
  idle_time?: string;
  max_speed?: number;
  average_speed?: number;
}
interface HistoryPanelProps {
  setSelectedPoint: (item: StoppageItem) => void;
  sidebarOpen: boolean;
  setShowHistory: (val: boolean) => void;
  // 👇 Playback controls
  onPlay?: () => void;
  onPause?: () => void;
  onStop?: () => void;
  playSpeed?: number;
  setPlaySpeed: React.Dispatch<React.SetStateAction<number>>;
  historyplayIndex?: number; // 🔹 NEW
  historyPreset?: string | null;
  presetDeviceId?: number | null;
  activeTab: TabType;
  closeMapPopupsRef?: React.RefObject<(() => void) | null>;
}
type TabType = "objects" | "history" | "events" | "geofence" | "route" | "poi";
const HistoryPanel: React.FC<HistoryPanelProps> = ({
  setSelectedPoint,
  sidebarOpen,
  setShowHistory,
  onPlay,
  onPause,
  onStop,
  playSpeed,
  closeMapPopupsRef,
  setPlaySpeed,
  historyplayIndex,
  historyPreset,
  presetDeviceId,
  activeTab,
}) => {
  const dispatch = useAppDispatch();
  const { devices: deviceList } = useAppSelector((state) => state.devices);

  const { data: playbackData, loading } = useAppSelector(
    (state) => state.playback,
  );
  const { data: drivingPlaybackData } = useAppSelector(
    (state) => state.drivingPlayback,
  );
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showDownload, setShowDownload] = useState(false);
  const [dateError, setDateError] = useState("");
  const [noDataFound, setNoDataFound] = useState("");
  const [selectedDevice, setSelectedDevice] = useState<number | null>(null);
  const [stopInterval, setStopInterval] = useState<number>(0);
  const [showPlaybackPanel, setShowPlaybackPanel] = useState(false);
  const [showSummaryCard, setShowSummaryCard] = useState(false);
  const [historyRequested, setHistoryRequested] = useState(false);
  const [activityType, setActivityType] = useState<"IDLING" | "WORKING">(
    "IDLING",
  );
  const downloadRef = useRef<HTMLDivElement>(null);
  // ✅ DATE FORMAT
  const formatDateTime = (value: string): string => {
    const d = new Date(value);
    const yyyy = d.getFullYear();
    const MM = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    const HH = String(d.getHours()).padStart(2, "0");
    const mm = String(d.getMinutes()).padStart(2, "0");
    const ss = String(d.getSeconds()).padStart(2, "0");
    return `${yyyy}-${MM}-${dd} ${HH}:${mm}:${ss}`;
  };
  const toLocalDateTimeInput = (date: Date) => {
    const pad = (n: number) => String(n).padStart(2, "0");

    return (
      date.getFullYear() +
      "-" +
      pad(date.getMonth() + 1) +
      "-" +
      pad(date.getDate()) +
      "T" +
      pad(date.getHours()) +
      ":" +
      pad(date.getMinutes()) +
      ":" +
      pad(date.getSeconds())
    );
  };
  const handleClear = () => {
    const { from, to } = getTodayRange();
    setSelectedDevice(null);
    setFromTime(from);
    setToTime(to);
    setStopInterval(0);
    setDateError("");
    setShowPlaybackPanel(false);
    setShowSummaryCard(false);
    onStop?.();
    dispatch(clearPlaybackData());
    closeMapPopupsRef?.current?.();
  };

  const isRangeValid = (from: string, to: string) => {
    const fromDate = new Date(from);
    const toDate = new Date(to);
    const diffMs = toDate.getTime() - fromDate.getTime();
    const diffDays = diffMs / (1000 * 60 * 60 * 24);
    return diffDays <= 31;
  };

  const getTodayRange = () => {
    const now = new Date();
    const yyyy = now.getFullYear();
    const MM = String(now.getMonth() + 1).padStart(2, "0");
    const dd = String(now.getDate()).padStart(2, "0");
    return {
      from: `${yyyy}-${MM}-${dd}T00:00:00`,
      to: `${yyyy}-${MM}-${dd}T23:59:59`,
    };
  };

  const { from, to } = getTodayRange();
  const [fromTime, setFromTime] = useState(from);
  const [toTime, setToTime] = useState(to);
useEffect(() => {
  const handleClickOutside = (event: MouseEvent) => {
    if (
      downloadRef.current &&
      !downloadRef.current.contains(event.target as Node)
    ) {
      setShowDownload(false);
    }
  };

  if (showDownload) {
    document.addEventListener("mousedown", handleClickOutside);
  }

  return () => {
    document.removeEventListener("mousedown", handleClickOutside);
  };
}, [showDownload]);
  // ✅ Fetch devices
  useEffect(() => {
    dispatch(fetchDevices());
  }, [dispatch]);

  // ✅ STRICT NO-DATA CHECK (eventDataList based)
  useEffect(() => {
    if (!historyRequested) return;

    if (!loading && playbackData) {
      const hasEventData =
        Array.isArray(playbackData.eventDataList) &&
        playbackData.eventDataList.length > 0;

      setNoDataFound(hasEventData ? "" : "No data found.");
    }
  }, [loading, playbackData, historyRequested]);
  useEffect(() => {
    if (!historyPreset || !presetDeviceId) return;

    setSelectedDevice(presetDeviceId);
  if (historyPreset === "custom") {
    setFromTime("");
    setToTime("");
    return;
  }
    const now = new Date();
    let from = new Date(now);
    let to = new Date(now);

    switch (historyPreset) {
      case "last_hour":
        from.setHours(from.getHours() - 1);
        break;

      case "today":
        from.setHours(0, 0, 0, 0);
        break;

      case "yesterday":
        from = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate() - 1,
          0,
          0,
          0,
        );
        to = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate() - 1,
          23,
          59,
          59,
        );
        break;

      case "this_week": {
        const day = now.getDay(); // 0 = Sunday
        const diff = day === 0 ? 6 : day - 1; // Monday start
        from = new Date(now);
        from.setDate(now.getDate() - diff);
        from.setHours(0, 0, 0, 0);
        break;
      }

      case "last_week": {
        const day = now.getDay();
        const diff = day === 0 ? 6 : day - 1;

        from = new Date(now);
        from.setDate(now.getDate() - diff - 7);
        from.setHours(0, 0, 0, 0);

        to = new Date(from);
        to.setDate(from.getDate() + 6);
        to.setHours(23, 59, 59);
        break;
      }

      case "this_month":
        from = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0);
        break;

      case "last_month":
        from = new Date(now.getFullYear(), now.getMonth() - 1, 1, 0, 0, 0);
        to = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
        break;
    }

    setFromTime(toLocalDateTimeInput(from));
    setToTime(toLocalDateTimeInput(to));
  }, [historyPreset, presetDeviceId]);

  useEffect(() => {
    if (selectedDevice && historyPreset) {
      showHistory();
    }
  }, [selectedDevice]);
  useEffect(() => {
    if (activeTab !== "history") {
      handleClear();
    }
  }, [activeTab]);

  // ✅ Show history
  const showHistory = () => {
    setDateError("");
    setNoDataFound("");
    onStop?.();
    setShowAdvanced(false);
    if (!selectedDevice) {
      setDateError("Please select object");
      return;
    }
  if (!fromTime || !toTime) {
    setDateError("Please select start time and end time");
    return;
  }

if (new Date(fromTime) > new Date(toTime)) {
  setDateError("From date cannot be greater than To date");
  return;
}

    if (!isRangeValid(fromTime, toTime)) {
      setDateError("Please select a period of up to 31 days.");
      return;
    }
    setHistoryRequested(true);
    setShowHistory(true); // ✅ MAP DRAW ENABLE
    setShowPlaybackPanel(true);
    setShowSummaryCard(true);
    // ✅ CLEAR OLD DATA (IMPORTANT)
    dispatch(clearPlaybackData());
    dispatch(clearDrivingPlaybackData()); // 🔵 clear segment data

    dispatch(
      fetchPlaybackData({
        deviceId: Number(selectedDevice),
        start_time: formatDateTime(fromTime),
        end_time: formatDateTime(toTime),
        time_interval: stopInterval,
        type: activityType,
      }),
    );
  };

  function exportExcelFile(type: "GSR" | "KML" | "GPX" | "CSV") {
    console.log("Exporting:", type);
    if (!selectedDevice) {
      setDateError("Please select object");
      return;
    }

    dispatch(
      downloadHistoryReport({
        type: type,
        deviceId: Number(selectedDevice),
        start_time: formatDateTime(fromTime),
        end_time: formatDateTime(toTime),
        time_interval: stopInterval,
      }),
    );

    setShowDownload(false);
  }
  const deviceOptions = deviceList.map((device) => ({
    value: device.id,
    label: device.name,
  }));

  return (
    <div className="history-panel">
      <div className="history-field">
        <label>Objects</label>

        <Select
          options={deviceOptions}
          isSearchable
          placeholder="Select Objects"
          value={deviceOptions.find((o) => o.value === selectedDevice) || null}
          onChange={(opt) => setSelectedDevice(opt ? opt.value : null)}
          classNamePrefix="native-select"
           styles={{
    input: (base) => ({
      ...base,
      opacity: 0,   // 👈 hide input completely
      width: 0,     // 👈 remove that vertical strip
      margin: 0,
      padding: 0,
    }),
    control: (base) => ({
      ...base,
      cursor: "pointer",
    }),
  }}
        />
      </div>

      {/* From */}
      <div className="history-field">
        <label>From</label>
        <input
          type="datetime-local"
          step="1"
          value={fromTime}
          onChange={(e) => setFromTime(e.target.value)}
        />
      </div>

      {/* To */}
      <div className="history-field">
        <label>To</label>
        <input
          type="datetime-local"
          step="1"
          value={toTime}
          onChange={(e) => setToTime(e.target.value)}
        />
      </div>

     <div className="history-advanced">
  <span onClick={() => setShowAdvanced(!showAdvanced)}>
    Advanced
  </span>
</div>

      {showAdvanced && (
        <>
          <div className="history-field">
            <label>Stops</label>
            <select
              value={stopInterval}
              onChange={(e) => setStopInterval(Number(e.target.value))}
            >
              <option value="0">&gt; 0 s</option>
              <option value="10">&gt; 10 s</option>
              <option value="180">&gt; 3 min</option>
              <option value="300">&gt; 5 min</option>
              <option value="600">&gt; 10 min</option>
              <option value="900">&gt; 15 min</option>
              <option value="1200">&gt; 20 min</option>
              <option value="1800">&gt; 30 min</option>
              <option value="2700">&gt; 45 min</option>
              <option value="3600">&gt; 1 h</option>
              <option value="7200">&gt; 2 h</option>
            </select>
          </div>

          <div className="history-field">
            <label>Trip Type</label>
            <select
              value={activityType}
              onChange={(e) =>
                setActivityType(e.target.value as "IDLING" | "WORKING")
              }
            >
              <option value="IDLING">Idling</option>
              <option value="WORKING">Working</option>
            </select>
          </div>
          
          <div className="history-checkbox">
            <input type="checkbox" defaultChecked />
            <span>Show invalid coordinates</span>
          </div>
        </>
      )}

      {/* Actions */}
      <div className="history-actions">
        <button className="btn primary" onClick={showHistory}>
          Show history
        </button>

        <button className="btn secondary" onClick={handleClear}>
          Clear
        </button>

        <div className="download-wrapper" ref={downloadRef}>
          <button
            className="btn download"
            onClick={() => setShowDownload(!showDownload)}
          >
            <i className="bi bi-download"></i>
          </button>

          {showDownload && (
            <ul className="download-menu">
              <li onClick={() => exportExcelFile("GSR")}>Export to GSR</li>
              <li onClick={() => exportExcelFile("KML")}>Export to KML</li>
              <li onClick={() => exportExcelFile("GPX")}>Export to GPX</li>
              <li onClick={() => exportExcelFile("CSV")}>Export to CSV</li>
            </ul>
          )}
        </div>
      </div>

      {/* Errors */}
      {dateError && <div className="history-error">{dateError}</div>}

      {/* ✅ SUMMARY CARD (eventDataList dependent) */}
      {showSummaryCard &&
        Array.isArray(playbackData?.eventDataList) &&
        playbackData.eventDataList.length > 0 &&
        Array.isArray(playbackData?.liveDataBeanForCard) &&
        playbackData.liveDataBeanForCard.length > 0 && (
          <div className="playback-summary-card">
            {playbackData.liveDataBeanForCard.map(
              (item: LiveDataBeanForCard, index: number) => (
                <div key={index} className="card-content">
                  {/* ✅ TOTAL DISTANCE (root level) */}
                  <div className="card-row">
                    <strong>Total Distance:</strong>
                    <span>{playbackData.distance ?? 0} Km</span>
                  </div>

                  <div className="card-row">
                    <strong>Total Running Time:</strong>
                    <span>{item.total_running_time ?? "0h 0min 0s"}</span>
                  </div>

                  <div className="card-row">
                    <strong>Max Speed:</strong>
                    <span>{item.max_speed ?? 0} km/h</span>
                  </div>

                  <div className="card-row">
                    <strong>Avg Speed:</strong>
                    <span>{item.average_speed ?? 0} km/h</span>
                  </div>

                  <div className="card-row">
                    <strong>Idle Time:</strong>
                    <span>{item.idle_time ?? "0h 0min 0s"}</span>
                  </div>
                </div>
              ),
            )}
          </div>
        )}

      {/* No data */}
      {noDataFound && <div className="no-data-found">{noDataFound}</div>}
      {/* ✅ STOPPAGE LIST (ONLY HISTORY UI) */}
      {showSummaryCard &&
        activityType === "WORKING" &&
        Array.isArray(playbackData?.summary?.fields) &&
        playbackData.summary.fields.length > 0 && (
          <StoppageList
            data={playbackData.summary.fields}
            eventDataList={[]}
            isWorking={true}
            onSelectPoint={(item) => {
              setSelectedPoint(item);
              setShowPlaybackPanel(false);
            }}
          />
        )}
      {showSummaryCard &&
        activityType === "IDLING" &&
        Array.isArray(playbackData?.combinedPlaybackList) &&
        playbackData.combinedPlaybackList.length > 0 && (
          <StoppageList
            data={playbackData.combinedPlaybackList}
            eventDataList={playbackData.eventDataList ?? []}
            onSelectPoint={(item) => {
              setSelectedPoint(item);

              if (
                item.movment_start_time &&
                item.movment_end_time &&
                selectedDevice
              ) {
                dispatch(
                  fetchDrivingPlaybackData({
                    deviceId: Number(selectedDevice),
                    start_time: item.movment_start_time,
                    end_time: item.movment_end_time,
                  }),
                );

                setShowPlaybackPanel(true);
              }
            }}
          />
        )}
      {showPlaybackPanel &&  activityType === "IDLING" && (
        <PlaybackBottomPanel
          playbackData={drivingPlaybackData ?? playbackData}
          sidebarOpen={sidebarOpen}
          onPlay={onPlay}
          onPause={onPause}
          onStop={onStop}
          playSpeed={playSpeed}
          setPlaySpeed={setPlaySpeed}
          historyplayIndex={historyplayIndex}
        />
      )}
    </div>
  );
};

export default HistoryPanel;
