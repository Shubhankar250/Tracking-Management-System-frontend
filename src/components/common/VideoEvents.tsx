import React, { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "../../assets/css/VideoEvents.css";
import RangeInput from "../common/RangeInput";


interface Props {
  deviceId: string;
}

interface EventRow {
  time: string;
  eventType: string;
  object: string;
}

const VideoEvents: React.FC<Props> = () => {

  const [alarmType, setAlarmType] = useState("All");
 const [open, setOpen] = useState(false);

  const [range, setRange] = useState<[Date | null, Date | null]>([
    new Date(new Date().setHours(0, 0, 0, 0)),
    new Date()
  ]);
  
  const [startDate, endDate] = range;
  const events: EventRow[] = [
    {
      time: "2026-01-13 10:45:12",
      eventType: "Overspeed",
      object: "Vehicle-01",
    },
  ];

  const handleSearch = () => {
    console.log("From:", startDate);
    console.log("To:", endDate);
    console.log("Alarm:", alarmType);
  };

  return (
    <div className="video-events">

      {/* Filters */}
      <div className="filters">
        <div className="filter-item date">
          <label>Date</label>     
 <DatePicker
  selectsRange
  monthsShown={2}
  startDate={startDate}
  endDate={endDate}
  onChange={(dates) => setRange(dates as [Date | null, Date | null])}
  showTimeSelect
  timeFormat="HH:mm:ss"
  timeIntervals={1}          // 👈 enables seconds
  dateFormat="yyyy-MM-dd HH:mm:ss"
  shouldCloseOnSelect={false}
  customInput={<RangeInput />}
  calendarClassName="range-calendar"
/>



          {/* Footer buttons */}
          {open && (
            <div className="range-footer">
              <button className="cancel" onClick={() => setOpen(false)}>
                Cancel
              </button>
              <button
                className="apply"
                onClick={() => setOpen(false)}
              >
                Apply
              </button>
            </div>
          )}
        </div>

        <div className="filter-item alarm">
          <label>Alarm Type</label>
          <select
            value={alarmType}
            onChange={(e) => setAlarmType(e.target.value)}
          >
            <option value="">All</option>

							<option>ACC OFF</option>
							<option>ACC ON</option>
							<option>Alcohol Alert</option>
							<option>Crash</option>
							<option>Hands-Off Detection (HOD)</option>
							<option>Back BSD</option>
							<option>Front BSD</option>
							<option>Left BSD</option>
							<option>Right BSD</option>
							<option>Too close</option>
							<option>Data Threshold Alert</option>
							<option>Disaster recovery storage failure</option>
							<option>Device Movement</option>
							<option>Infrared blocking</option>
							<option>Driver change</option>
							<option>No Driver detected</option>
							<option>Low external power</option>
							<option>Low power protection</option>
							<option>Fatigue Alert</option>
							<option>Fatigue Warning</option>
							<option>Forward collision</option>
							<option>Gps Blind Zone</option>
							<option>Phone Calling</option>
							<option>Rollover</option>
							<option>Driver ID Detection</option>
							<option>Idle Alert</option>
							<option>Entering Geofence</option>
							<option>Entering GPS Dead Zone</option>
							<option>Low internal power</option>
							<option>IO Off</option>
							<option>IO ON</option>
							<option>Lane Departure</option>
							<option>Distracted driving</option>
							<option>Memory Malfunction</option>
							<option>Camera Obstructed</option>
							<option>Exiting Geofence</option>
							<option>Exiting GPS Dead Zone</option>
							<option>Device power outage</option>
							<option>High-Speed Warning</option>
							<option>Driving Overtime</option>
							<option>Overtime parking</option>
							<option>Passenger Overload</option>
							<option>Pedestrian collision</option>
							<option>Phone Playing Detection</option>
							<option>Power Loss Alert</option>
							<option>Rapid acceleration</option>
							<option>Seatbelt Detection</option>
							<option>Device vibration</option>
							<option>Rapid Braking</option>
							<option>Smoking Detection</option>
							<option>SOS Alert</option>
							<option>Overspeed Alert</option>
							<option>Device Disassembly</option>
							<option>Unplanned Alert</option>
							<option>Camera Signal Loss</option>
							<option>Sharp turn</option>
          </select>
        </div>

        <button className="search-btn" onClick={handleSearch}>
          Search
        </button>
      </div>

      {/* Table */}
      <table className="events-table">
        <thead>
          <tr>
            <th>Time</th>
            <th>Event Type</th>
            <th>Object</th>
          </tr>
        </thead>
        <tbody>
          {events.map((e, i) => (
            <tr key={i}>
              <td>{e.time}</td>
              <td>{e.eventType}</td>
              <td>{e.object}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default VideoEvents;
