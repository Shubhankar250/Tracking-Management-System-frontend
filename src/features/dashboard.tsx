import "@fortawesome/fontawesome-free/css/all.min.css";
import {
  PieChart,
  Pie,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell, 
} from "recharts";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchDashboardData } from "../slices/dashboardSlice";
import type { RootState, AppDispatch } from "../redux/store";




const distanceData = [
  { name: "Business", value: 600, fill: "#312ecc" },
  { name: "Personal", value: 1200, fill: "#e6bc18" },
];

export default function Dashboard() {
  const dispatch = useDispatch<AppDispatch>();
  const { data, loading } = useSelector(
    (state: RootState) => state.dashboard
  );

  useEffect(() => {
    dispatch(fetchDashboardData());
  }, [dispatch]);

  if (loading || !data) return <div>Loading dashboard...</div>;
   /* ---------- Fleet Status ---------- */
  const fleetData = [
    { name: "Moving", value: data.vehicleMovement.Moving, fill: "#2ecc71" },
    { name: "Idle", value: data.vehicleMovement.Idle, fill: "#f1c40f" },
    { name: "Stopped", value: data.vehicleMovement.Stopped, fill: "#bfc3c4" },
    { name: "No Data", value: data.vehicleMovement.Nodata, fill: "#f03017" },
  ];
const fleetTotal = fleetData.reduce((a, b) => a + b.value, 0);
 /* ---------- Events ---------- */
 /* ---------------- Alert Meta ---------------- */
const ALERT_META: Record<string, { label: string; color: string }> = {
  OVERSPEED: { label: "Overspeed", color: "#eba6d0e3" },
  LOWSPEED: { label: "Low Speed", color: "#f39c12" },
  Parking: { label: "Parking", color: "#9b59b6" },
  Idling: { label: "Idlling", color: "#1abc9c" },
  IGNITION: { label: "Ignition", color: "#2ecc71" },
  SOS: { label: "SOS", color: "#ff2d20" },

  IN: { label: "Geofence In", color: "#3498db" },
  OUT: { label: "Geofence Out", color: "#2980b9" },
  ALL: { label: "Geofence In/Out", color: "#34495e" },

  DRIVER_CHANGE: { label: "Driver Change", color: "#8e44ad" },
  DRIVER_CHANGE_AUTH: { label: "Driver Auth", color: "#6c3483" },

  FUEL_FILL_THEFT: { label: "Fuel Fill/Theft", color: "#d35400" },

  POI_STOP_DURATION: { label: "POI Stop", color: "#16a085" },
  POI_IDLE_DURATION: { label: "POI Idle", color: "#27ae60" },

  TASK_STATUS: { label: "Task Status", color: "#7f8c8d" },
  VIBRATION: { label: "Vibration", color: "#c0392b" },
  MOVEMENT: { label: "Movement", color: "#2c3e50" },
  FALLDOWN: { label: "Fall Down", color: "#b03a2e" },

  LOW_POWER: { label: "Low Power", color: "#f1c40f" },
  LOW_BATTERY: { label: "Low Battery", color: "#f39c12" },

  POWER_CUT: { label: "Power Cut", color: "#e67e22" },
  POWER_RESTORED: { label: "Power Restored", color: "#27ae60" },
};

 /* ---------------- Events ---------------- */
 const alertTypes = data.alertTypes as Record<string, number>;

const eventData = Object.entries(alertTypes)
  .filter(([, value]) => value > 0)
  .map(([key, value]) => ({
    name: key,
    label: ALERT_META[key]?.label || key,
    value,
    fill: ALERT_META[key]?.color || "#ccc",
  }));

  const eventTotal = data.totalAlerts;
   /* ---------- Hourly Usage ---------- */
  const usage = Object.entries(data.hourlyDistanceData).map(
    ([hour, km]) => ({
      hour: Number(hour),
      km,
    })
  );
const totalFleetUsage = data.totalDistanceOfDay ?? 0;
const avgDistancePerVehicle = data.averageDistancePerVehicle ?? 0;
const maintenanceDue = data.maintenanceDataMap?.Due ?? 0;
const maintenanceOverdue = data.maintenanceDataMap?.Overdue ?? 0;
const expenseAmount = data.totalExpense??0;
  const FleetTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const { name, value, fill, total } = payload[0].payload;
    const percent = total ? ((value / total) * 100).toFixed(1) : "0.0";

    return (
      <div
        style={{
          background: "rgba(0,0,0,0.85)",
          color: "#fff",
          padding: "6px 10px",
          borderRadius: "6px",
          fontSize: "12px",
          display: "flex",
          alignItems: "center",
          gap: "6px",
        }}
      >
        {/* color box */}
        <span
          style={{
            width: "10px",
            height: "10px",
            backgroundColor: fill,
            display: "inline-block",
            borderRadius: "2px",
            border: "1px solid #fff",
          }}
        />
        <span>
          <b>{name}</b>: {percent}%
        </span>
      </div>
    );
  }
  return null;
};

 const fleetDataWithTotal = fleetData.map(item => ({
    ...item,
    total: fleetTotal,
  }));
const EventTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const { name, value, fill } = payload[0].payload;

    return (
      <div
        style={{
          background: "rgba(0,0,0,0.85)",
          color: "#fff",
          padding: "6px 10px",
          borderRadius: "6px",
          fontSize: "12px",
          display: "flex",
          alignItems: "center",
          gap: "6px",
        }}
      >
        <span
          style={{
            width: "10px",
            height: "10px",
            backgroundColor: fill,
            borderRadius: "2px",
            border: "1px solid #fff",
          }}
        />
        <span>
          <b>{name}</b>: {value}
        </span>
      </div>
    );
  }
  return null;
};

  return (
    <div className="dashboard-grid">

      {/* Fleet Status */}
      <div className="card large">
        <h4 className="fleet-title"><i className="fa fa-location-arrow me-1"></i> Fleet Status</h4>

        <div className="fleet-row">
          <ResponsiveContainer width={300} height={300}>
          <PieChart>
            <Pie
              data={fleetDataWithTotal}
              dataKey="value"
              innerRadius={95}
              outerRadius={135}
              paddingAngle={1}
            />

            <Tooltip content={<FleetTooltip />} />

            {/* Center Value */}
            <text
              x="50%"
              y="50%"
              textAnchor="middle"
              dominantBaseline="middle"
              style={{
                fontSize: "28px",
                fontWeight: 600,
                fill: "#000",
              }}
            >
              {fleetTotal}
            </text>
          </PieChart>
        </ResponsiveContainer>

          <div className="fleet-legend">
            {fleetData.map((item) => (
              <div key={item.name} className="fleet-item">
                <span className="fleet-dot" style={{ background: item.fill }} />
                <span className="fleet-name">{item.name}:</span>
                <span className="fleet-value">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Fleet Usage */}
      <div className="card large">
        <h4>
          Fleet Usage
         <span className="usage-summary">
  Total Fleet Usage <b>{totalFleetUsage} km</b><br />
  Avg. Distance / Vehicle <b>{avgDistancePerVehicle} km</b>
</span>
        </h4>

        <ResponsiveContainer width="100%" height={320}>
          <LineChart data={usage}>
            <XAxis dataKey="hour" />
            <YAxis />
            <Tooltip />
            <Line dataKey="km" strokeWidth={2} dot />
          </LineChart>
        </ResponsiveContainer>
      </div>

     {/* Events */}
 <div className="card large">
        <h4>Events</h4>

        {/* Dynamic Legend */}
        <div className="event-legend">
          {eventData.map(item => (
            <div key={item.name} className="event-item">
              <span className="event-dot" style={{ background: item.fill }} />
              {item.label}
            </div>
          ))}
        </div>

        <ResponsiveContainer width="100%" height={280}>
          <PieChart>
            <Pie data={eventData} dataKey="value" innerRadius={95} outerRadius={135}>
              {eventData.map((e, i) => (
                <Cell key={i} fill={e.fill} />
              ))}
            </Pie>
            <Tooltip content={<EventTooltip />} />
            <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" style={{ fontSize: 28 }}>
              {eventTotal}
            </text>
          </PieChart>
        </ResponsiveContainer>
      </div>


      {/* Maintenance */}
      <div className="card small alert-card">
        <h4 className="main-title">Maintenance Reminder</h4>
        <div className="maintenance-row">
          <div className="maintenance-item info">
            <i className="fa-regular fa-calendar fa-2x" />
            <div className="maintenance-value">{maintenanceDue}</div>
            <div className="maintenance-label">Due</div>
          </div>
          <div className="maintenance-item danger">
            <i className="fa-solid fa-bell fa-2x" />
           <div className="maintenance-value">{maintenanceOverdue}</div>
            <div className="maintenance-label">Overdue</div>
          </div>
        </div>
      </div>

      {/* Expense */}
      <div className="card small alert-card">
        <h4 className="main-title">Expense</h4>
        <div className="expense-row">
          <div className="expense-amount">₹{expenseAmount}</div>
         <i className="fa-solid fa-coins expense-icon" />
        </div>
      </div>

      {/* Task */}
      <div className="card small alert-card">
        <h4 className="main-title">Total Task</h4>
        <div className="expense-row">
          <div className="expense-amount">2</div>
         <i className="fa-solid fa-clipboard-list task-icon" />
        </div>
      </div>

      {/* Fuel */}
      <div className="card small alert-card">
        <h4 className="main-title">Fleet Fuel</h4>
        <div className="fuel-row">
          <div className="fuel green">
            <i className="fa-solid fa-gas-pump fa-2x" />
            <div className="fuel-value">1035 ltr</div>
            <div className="fuel-times">(105 times)</div>
          </div>
          <div className="fuel red">
            <i className="fa-solid fa-gas-pump fa-2x" />
            <div className="fuel-value">68 ltr</div>
            <div className="fuel-times">(10 times)</div>
          </div>
        </div>
      </div>

      {/* Distance */}
      <div className="card small">
        <h4>Distance Classification</h4>
        <div className="distance-row">
          <ResponsiveContainer width={140} height={140}>
            <PieChart>
              <Pie
                data={distanceData}
                dataKey="value"
                innerRadius={40}
                outerRadius={65}
              />
            </PieChart>
          </ResponsiveContainer>

          <div className="distance-values">
            {distanceData.map((item) => (
              <div key={item.name} className="distance-item">
                <span className="distance-dot" style={{ background: item.fill }} />
                {item.name}: <b>{item.value} km</b>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
}
