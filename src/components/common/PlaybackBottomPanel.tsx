import { useState, useMemo,useEffect} from "react";
import "../../assets/css/playbackBottomPanel.css";
import {
  LineChart,Line,XAxis,YAxis,Tooltip,ResponsiveContainer,CartesianGrid,ReferenceLine,} from "recharts";
import type { TableColumn } from "react-data-table-component";
import CommonDataTable from "../common/CommonDataTable";
export interface PlaybackDataRow {
  deviceTime: string;
  serverTime: string;
  speed: number ;
  latitude: number;
  longitude: number;
  altitude: number;
  distance: number;
  ignition:boolean;
  course:number;
  battery:string;
}
interface SpeedGraphPoint {
  ts: number;
  deviceTime: string;    
  speed: number;
  address: string;
}
interface AltitudeGraphPoint {
  ts: number;
  altitude: number;
  deviceTime: string;
  address: string;
}
interface PowerGraphPoint {
  ts: number;
  deviceTime: string;
  power: number;
  address: string;
}
interface GSMGraphPoint {
  ts: number;
  rssi: number;
  deviceTime: string;
  address: string;
}
interface GPSGraphPoint {
  ts: number;
  sat: number;
  deviceTime: string;
  address: string;
}

export const playbackDataLogColumns: TableColumn<PlaybackDataRow>[] = [
  { name: "Time", selector: row => row.deviceTime, sortable: true, wrap: true },
  { name: "Server Time", selector: row => row.serverTime, sortable: true },
  { name: "Latitude", selector: row => row.latitude, sortable: true },
  { name: "Longitude", selector: row => row.longitude, sortable: true },
  { name: "Altitude", selector: row => row.altitude },
  { name: "Speed", selector: row => row.speed },
  { name: "Power", selector: row => row.battery },
 {name: "Ignition",cell: row => (row.ignition ? "ON" : "OFF"),sortable: true},
  { name: "Angle", selector: row => row.course },
  { name: "Distance", selector: row => row.distance },
];

const GRAPH_TABS = [
  "Speed",
  "Altitude",
  "Power",
  "GSM",
  "GPS",
  "Fuel Level",
  "Temperature",
];

interface Props {
  playbackData: any;
  sidebarOpen?: boolean;
  // 👇 Playback controls
  onPlay?: () => void;
  onPause?: () => void;
  onStop?: () => void;
  playSpeed?: number;
setPlaySpeed: React.Dispatch<React.SetStateAction<number>>;
 historyplayIndex?: number; // 🔹 NEW
}

const PlaybackBottomPanel: React.FC<Props> = ({ playbackData, sidebarOpen , onPlay,
  onPause,onStop,playSpeed,setPlaySpeed,historyplayIndex
}) => {
  const [activeMainTab, setActiveMainTab] = useState<"graph" | "datalog">("graph");
  const [activeGraphTab, setActiveGraphTab] = useState("Speed");
  const [expanded, setExpanded] = useState(false);
  const [graphIndex, setGraphIndex] = useState(0);

  // 🔹 Map backend data → table data
  const dataLogRows: PlaybackDataRow[] = useMemo(() => {
  return (
    playbackData?.eventDataList?.map((row: any) => {
      let ignition = false;

      try {
        if (row.attributes) {
          const attrObj = JSON.parse(row.attributes);
          ignition = Boolean(attrObj.ignition);
        }
      } catch (e) {
        console.error("Invalid attributes JSON", e);
      }

      return {
        deviceTime: row.deviceTime ?? "-",
        serverTime: row.serverTime ?? "-",
        speed: row.speed ?? 0,
        latitude: row.latitude ?? 0,
        longitude: row.longitude ?? 0,
        altitude: row.altitude ?? 0,
        distance: row.distance ?? 0,
        ignition: ignition, 
        course: row.course ?? 0,
        battery: row.battery ?? "-",
      };
    }) || []
  );
}, [playbackData]);
const parseDeviceTime = (dt: string) => {
  const [date, time] = dt.split(" ");
  const [dd, mm, yyyy] = date.split("-").map(Number);
  const [HH, MM, SS] = time.split(":").map(Number);

  return new Date(yyyy, mm - 1, dd, HH, MM, SS).getTime();
};


  /* ===== GRAPH DATA (SORTED) ===== */
 const speedGraphData = useMemo<SpeedGraphPoint[]>(() => {
  if (!playbackData?.eventDataList?.length) return [];

  return playbackData.eventDataList
    .map((row: any) => ({
     ts: parseDeviceTime(row.deviceTime),
      deviceTime:row.deviceTime,
      speed: row.speed ?? 0,
      address: row.address ?? "-",
    }))
    .sort((a: SpeedGraphPoint, b: SpeedGraphPoint) => a.ts - b.ts);
}, [playbackData]);

const altitudeGraphData = useMemo<AltitudeGraphPoint[]>(() => {
  if (!playbackData?.eventDataList?.length) return [];

  return playbackData.eventDataList
    .map((row: any) => ({
     ts: parseDeviceTime(row.deviceTime),
      deviceTime:row.deviceTime,
      altitude: row.altitude ?? 0,
      address: row.address ?? "-",
    }))
    .sort((a: AltitudeGraphPoint, b: AltitudeGraphPoint) => a.ts - b.ts);
}, [playbackData]);
// ===== Parse Power Graph =====
const powerGraphData = useMemo<PowerGraphPoint[]>(() => {
  if (!playbackData?.eventDataList?.length) return [];

  return playbackData.eventDataList
    .map((row: any) => {
      let attrs = row.attributes;
      if (!attrs) return null;

      if (typeof attrs === "string") {
        try { attrs = JSON.parse(attrs); } catch { return null; }
      }

      const power = parseFloat(attrs.power);
      if (isNaN(power)) return null;

      return {
        ts: parseDeviceTime(row.deviceTime),
        power,
        address: row.address ?? "-",
        deviceTime:row.deviceTime,
      };
    })
    .filter(Boolean)
   .sort((a: PowerGraphPoint, b: PowerGraphPoint) => a.ts - b.ts);
}, [playbackData]);
// ===== Parse GSM Graph =====
const gsmGraphData = useMemo<GSMGraphPoint[]>(() => {
  if (!playbackData?.eventDataList?.length) return [];

  return playbackData.eventDataList
    .map((row: any) => {
      let attrs = row.attributes;
      if (!attrs) return null;

      if (typeof attrs === "string") {
        try { attrs = JSON.parse(attrs); } catch { return null; }
      }

      const rssi = parseFloat(attrs.rssi);
      if (isNaN(rssi)) return null;

      return {
        ts: parseDeviceTime(row.deviceTime),
        rssi,
        address: row.address ?? "-",
        deviceTime:row.deviceTime,
      };
    })
    .filter(Boolean)
   .sort((a: GSMGraphPoint, b: GSMGraphPoint) => a.ts - b.ts);
}, [playbackData]);

// ===== Parse GPS Graph =====
const gpsGraphData = useMemo<GPSGraphPoint[]>(() => {
  if (!playbackData?.eventDataList?.length) return [];

  return playbackData.eventDataList
    .map((row: any) => {
      let attrs = row.attributes;
      if (!attrs) return null;

      if (typeof attrs === "string") {
        try { attrs = JSON.parse(attrs); } catch { return null; }
      }

      const sat = parseInt(attrs.sat);
      if (isNaN(sat)) return null;

      return {
        ts: parseDeviceTime(row.deviceTime),
        sat,
        address: row.address ?? "-",
        deviceTime:row.deviceTime,
      };
    })
    .filter(Boolean)
    .sort((a: GPSGraphPoint, b: GPSGraphPoint) => a.ts - b.ts);
}, [playbackData]);
const MONTHS_3 = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const isMultiDay = (data: { ts: number }[]) => {
  if (!data.length) return false;
  const start = new Date(data[0].ts);
  const end = new Date(data[data.length - 1].ts);
  return start.toDateString() !== end.toDateString();
};
const generateMultiDayTicks = (data: { ts: number }[]) => {
  if (!data.length) return [];

  const start = new Date(data[0].ts);
  const end = new Date(data[data.length - 1].ts);

  // 👇 normalize to day start
  start.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);

  const ticks: number[] = [];
  const cur = new Date(start);

  while (cur <= end) {
    ticks.push(cur.getTime());
    cur.setDate(cur.getDate() + 1); // next day
  }

  return ticks;
};
const generateSingleDayTicks = (data: { ts: number }[]) => {
  if (!data.length) return [];

  const first = new Date(data[0].ts);
  const last = new Date(data[data.length - 1].ts);

  // 👇 tick ke liye floor
  const start = new Date(first);
  start.setMinutes(Math.floor(first.getMinutes() / 30) * 30, 0, 0);

  // 👇 tick ke liye ceil
  const end = new Date(last);
  let endMin = Math.ceil(last.getMinutes() / 30) * 30;

  if (endMin === 60) {
    end.setHours(end.getHours() + 1);
    end.setMinutes(0, 0, 0);
  } else {
    end.setMinutes(endMin, 0, 0);
  }

  const ticks: number[] = [];
  const cur = new Date(start);

  while (cur <= end) {
    ticks.push(cur.getTime());
    cur.setMinutes(cur.getMinutes() + 30);
  }

  return ticks;
};
const renderTimeXAxis = (data: { ts: number }[]) => {
  const multiDay = isMultiDay(data);
  const ticks = multiDay
    ? generateMultiDayTicks(data)
    : generateSingleDayTicks(data);

  return (
    <XAxis
      dataKey="ts"
      type="number"
      scale="time"
      
      // 🔥 FIX: use ticks range instead of dataMin/dataMax
      domain={[ticks[0], ticks[ticks.length - 1]]}

      ticks={ticks}
      tickFormatter={(ts) => {
        const d = new Date(ts);

        if (multiDay) {
          const day = String(d.getDate()).padStart(2, "0");
          const month = MONTHS_3[d.getMonth()];
          return `${day} ${month}`;
        }

        return d.toLocaleTimeString("en-GB", {
          hour: "2-digit",
          minute: "2-digit",
        });
      }}
    />
  );
};

useEffect(() => {
  if (historyplayIndex === undefined) return;
  setGraphIndex(historyplayIndex);
}, [historyplayIndex]);


  return (
    <div
      className={`playback-panel ${expanded ? "expanded" : ""}`}
      style={{
        marginLeft: sidebarOpen ? "300px" : "0",
        width: sidebarOpen ? "calc(100% - 300px)" : "100%",
      }}
    >
      {/* HEADER */}
      <div className="playback-header">
        <div
          className={`graph-subtabs left ${
            activeMainTab === "graph" ? "" : "hidden"
          }`}
        >
          {GRAPH_TABS.map(tab => (
            <button
              key={tab}
              className={activeGraphTab === tab ? "active" : ""}
              onClick={() => setActiveGraphTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="header-right">
          <div className="playback-tabs">
            <button
              className={activeMainTab === "graph" ? "active" : ""}
              onClick={() => setActiveMainTab("graph")}
            >
              📈 Graph
            </button>
            <button
              className={activeMainTab === "datalog" ? "active" : ""}
              onClick={() => setActiveMainTab("datalog")}
            >
              📄 Data log
            </button>
          </div>

         <button
  className="expand-btn"
  onClick={() => setExpanded(prev => !prev)}
>
  {expanded ? "−" : "+"}
</button>
        </div>
      </div>

      {/* ▶ PLAYBACK CONTROLS */}
      <div className="playback-controls">
        <button className="media-btn" onClick={onPlay} title="Play">
  ▶
</button>

<button className="media-btn" onClick={onPause} title="Pause">
  ⏸
</button>

<button className="media-btn" onClick={onStop} title="Stop">
  ⏹
</button>
<select value={playSpeed} onChange={e => setPlaySpeed(+e.target.value)}>
  <option value={2}>1x</option>
  <option value={3}>2x</option>
  <option value={4}>3x</option>
  <option value={5}>4x</option>
  <option value={6}>5x</option>
  <option value={11}>10x</option>
</select>
      </div>

      {/* BODY */}
      <div className="playback-body">
        {activeMainTab === "graph" && (
          <div className="graph-container">
  {activeGraphTab === "Speed" && (
  <ResponsiveContainer width="100%" height={250}>
  <LineChart data={speedGraphData}>
    <CartesianGrid strokeDasharray="3 3" />
{renderTimeXAxis(speedGraphData)}


    <YAxis />

    <Tooltip
        content={({ active, payload }) => {
          if (!active || !payload || payload.length === 0) return null;
          const point = payload[0].payload as SpeedGraphPoint;
          return (
            <div style={{
              background: "white",
              border: "1px solid #ccc",
              borderRadius: "8px",
              padding: "8px",
              maxWidth: "250px",
              fontSize:"12px",
            }}>
              <div><strong>Speed: </strong>{point.speed} km/h</div>
              <div><strong>Time: </strong>{point.deviceTime}</div>              
              <div><strong>Address: </strong>{point.address}</div>
            </div>
          );
        }}
      />

    <Line
      dataKey="speed"
      stroke="#1976d2"
      dot={false}
      isAnimationActive={false}
    />
     {/* 🔹 Playback crosshair */}
  {historyplayIndex != null && historyplayIndex > 0 && graphIndex < speedGraphData.length && (
  <ReferenceLine
    x={speedGraphData[graphIndex]?.ts}
    stroke="red"
  />
)}
  </LineChart>
</ResponsiveContainer>

  )}
  {activeGraphTab === "Altitude" && (
  <ResponsiveContainer width="100%" height={250}>
    <LineChart data={altitudeGraphData}>
      <CartesianGrid strokeDasharray="3 3" />

      {renderTimeXAxis(altitudeGraphData)}


      <YAxis domain={[0, 120]} />

      <Tooltip
        content={({ active, payload }) => {
          if (!active || !payload || payload.length === 0) return null;
          const point = payload[0].payload as AltitudeGraphPoint;
          return (
            <div style={{
              background: "white",
              border: "1px solid #ccc",
              borderRadius: "8px",
              padding: "8px",
              maxWidth: "250px",
              fontSize:"12px",
            }}>
              <div><strong>Altitude: </strong>{point.altitude}</div>
              <div><strong>Time: </strong>{point.deviceTime}</div>
              <div><strong>Address: </strong>{point.address}</div>
            </div>
          );
        }}
      />

      <Line
        dataKey="altitude"
        stroke="#67b7dc"
        dot={false}
        isAnimationActive={false}
      />
       {/* 🔹 Playback crosshair */}
 {historyplayIndex != null && historyplayIndex > 0 && graphIndex < altitudeGraphData.length && (
    <ReferenceLine
      x={altitudeGraphData[graphIndex].ts}
      stroke="red"
      strokeWidth={2}
      label={{ value: "▶", position: "top", fill: "red" }}
    />
  )}
    </LineChart>
  </ResponsiveContainer>
)}
{activeGraphTab === "Power" && (
  <ResponsiveContainer width="100%" height={250}>
    <LineChart data={powerGraphData}>
      <CartesianGrid strokeDasharray="3 3" />
      {renderTimeXAxis(powerGraphData)}

      <YAxis domain={[0, 100]} />
       <Tooltip
        content={({ active, payload }) => {
          if (!active || !payload || payload.length === 0) return null;
          const point = payload[0].payload as PowerGraphPoint;
          return (
            <div style={{
              background: "white",
              border: "1px solid #ccc",
              borderRadius: "8px",
              padding: "8px",
              maxWidth: "250px",
              fontSize:"12px",
            }}>
              <div><strong>Power: </strong>{Number(point.power).toFixed(2)} V</div>
              <div><strong>Time: </strong>{point.deviceTime}</div>
              <div><strong>Address: </strong>{point.address}</div>
            </div>
          );
        }}
      />
      <Line dataKey="power" stroke="#67b7dc" dot={false} isAnimationActive={false} />
       {/* 🔹 Playback crosshair */}
{historyplayIndex != null && historyplayIndex > 0 && graphIndex < powerGraphData.length && (
    <ReferenceLine
      x={powerGraphData[graphIndex].ts}
      stroke="red"
      strokeWidth={2}
      label={{ value: "▶", position: "top", fill: "red" }}
    />
  )}
    </LineChart>
  </ResponsiveContainer>
)}

{activeGraphTab === "GSM" && (
  <ResponsiveContainer width="100%" height={250}>
    <LineChart data={gsmGraphData}>
      <CartesianGrid strokeDasharray="3 3" />
       {renderTimeXAxis(gsmGraphData)}

      <YAxis />
      <Tooltip
        content={({ active, payload }) => {
          if (!active || !payload || payload.length === 0) return null;
          const point = payload[0].payload as GSMGraphPoint;
          return (
            <div style={{
              background: "white",
              border: "1px solid #ccc",
              borderRadius: "8px",
              padding: "8px",
              maxWidth: "250px",
              fontSize:"12px",
            }}>
              <div><strong>GSM: </strong>{point.rssi} </div>
              <div><strong>Time: </strong>{point.deviceTime}</div>            
              <div><strong>Address: </strong>{point.address}</div>
            </div>
          );
        }}
      />
      <Line dataKey="rssi" stroke="#f57c00" dot={false} isAnimationActive={false} />
       {/* 🔹 Playback crosshair */}
  {historyplayIndex != null && historyplayIndex > 0 && graphIndex < gsmGraphData.length && (
    <ReferenceLine
      x={gsmGraphData[graphIndex].ts}
      stroke="red"
      strokeWidth={2}
      label={{ value: "▶", position: "top", fill: "red" }}
    />
  )}
    </LineChart>
  </ResponsiveContainer>
)}

{activeGraphTab === "GPS" && (
  <ResponsiveContainer width="100%" height={250}>
    <LineChart data={gpsGraphData}>
      <CartesianGrid strokeDasharray="3 3" />
       {renderTimeXAxis(gpsGraphData)}

      <YAxis />
      <Tooltip
        content={({ active, payload }) => {
          if (!active || !payload || payload.length === 0) return null;
          const point = payload[0].payload as GPSGraphPoint;
          return (
            <div style={{
              background: "white",
              border: "1px solid #ccc",
              borderRadius: "8px",
              padding: "8px",
              maxWidth: "250px",
              fontSize:"12px",
            }}>
              <div><strong>GPS: </strong>{point.sat} </div>
              <div><strong>Time: </strong>{point.deviceTime}</div>           
              <div><strong>Address: </strong>{point.address}</div>
            </div>
          );
        }}
      />
      <Line dataKey="sat" stroke="#388e3c" dot={false} isAnimationActive={false} />
       {/* 🔹 Playback crosshair */}
  {historyplayIndex != null && historyplayIndex > 0 && graphIndex < gpsGraphData.length && (
    <ReferenceLine
      x={gpsGraphData[graphIndex].ts}
      stroke="red"
      strokeWidth={2}
      label={{ value: "▶", position: "top", fill: "red" }}
    />
  )}
    </LineChart>
  </ResponsiveContainer>
)}


</div>

        )}

        {activeMainTab === "datalog" && (
          <div className="datalog-table-wrapper">
            <CommonDataTable
              data={dataLogRows}
              columns={playbackDataLogColumns}
              searchableFields={["deviceTime", "speed"]}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default PlaybackBottomPanel;
