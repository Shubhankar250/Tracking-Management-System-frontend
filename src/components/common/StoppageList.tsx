import React from "react";

export interface StoppageItem {
  parking_start_time?: string;
  parking_end_time?: string;
  movment_start_time?: string;
  movment_end_time?: string;
  event_name?: string;
  event_time?: string;
  latitude?: number;
  longitude?: number;
  address?: string;
  seg_address?: string;
  seg_running_time?: string;
  seg_distance?: number;
  seg_max_speed?: number;
  seg_avg_speed?: number;
  deviceTime?: string;
  time?: string;
  speed?: number;

  fieldNo?: number;
  startTime?: string;
  endTime?: string;

  clusterBoundaryAreaSqm?: number;
  clusterBoundaryAreaAcre?: number;
  clusterBoundaryAreaHectare?: number;

  workedAreaSqm?: number;
  workedAreaAcre?: number;
  workedAreaHectare?: number;

  boundaryPoints?: { lat: number; lng: number }[];
  workedPoints?: { lat: number; lng: number }[];
}

interface Props {
  data: StoppageItem[];
  eventDataList?: StoppageItem[];
  onSelectPoint: (item: StoppageItem) => void;
  isWorking?: boolean;
}

const StoppageList: React.FC<Props> = ({
  data = [],
  eventDataList = [],
  onSelectPoint,
  isWorking = false,
}) => {
  let p = 1,
    t = 1,
    e = 1;

  // ✅ SAFE FIRST/LAST POINT
  const firstPoint = eventDataList.length > 0 ? eventDataList[0] : data[0];

  const lastPoint =
    eventDataList.length > 0
      ? eventDataList[eventDataList.length - 1]
      : data[data.length - 1];

  return (
    <div id="stoppage-info-list" className="stoppage-list">
      {/* ================= START ================= */}
      {!isWorking && firstPoint && (
        <div
          className="stoppage-card"
          onClick={() => onSelectPoint(firstPoint)}
        >
          <div className="icon green">
            <i className="fa-solid fa-flag"></i>
          </div>
          <div className="details">
            <div className="title">{firstPoint.deviceTime || "-"}</div>
            <div className="sub">{firstPoint.address || "No address"}</div>
          </div>
        </div>
      )}

      {/* ================= MAIN LIST ================= */}
      {data.map((item, idx) => {
        /* ================= WORKING MODE ================= */
        if (isWorking && item.fieldNo) {
          
          const workedHa = item.workedAreaHectare ?? 0;
          const workedAcre = item.workedAreaAcre ?? 0;

          
          return (
            <div
              key={idx}
              className="stoppage-card"
              onClick={() => onSelectPoint(item)}
            >
              <div className="icon green" style={{ marginTop: 15 }}>
                F{item.fieldNo}
              </div>
              <div className="details" style={{ marginLeft: 20 }}>
                <div className="title">
                  <b>Field-{item.fieldNo || "-"} <br /></b>
                  {item.startTime || "-"} <br />
                  {item.endTime || "-"}
                </div>

                <div className="sub">
                 
                  {workedHa.toFixed(2)} Hec | {workedAcre.toFixed(2)} acre
                </div>
              </div>
            </div>
          );
        }

        /* ================= PARKING ================= */
        if (item.parking_start_time) {
          return (
            <div
              key={idx}
              className="stoppage-card"
              onClick={() => onSelectPoint(item)}
            >
              <div className="icon orange">P{p++}</div>

              <div className="details">
                <div className="title">
                  {item.parking_start_time} <i className="fas fa-clock"></i>{" "}
                  {item.time || "-"}
                </div>

                <div className="sub">{item.address || "No address"}</div>
              </div>
            </div>
          );
        }

        /* ================= TRIP ================= */
        if (item.movment_start_time) {
          return (
            <div
              key={idx}
              className="stoppage-card"
              onClick={() => onSelectPoint(item)}
            >
              <div className="icon blue">T{t++}</div>

              <div className="details">
                <div className="title">{item.movment_start_time}</div>

                <div className="sub">
                  <span>
                    <i className="fas fa-clock"></i>{" "}
                    {item.seg_running_time || "-"}
                  </span>

                  <span style={{ marginLeft: 8 }}>
                    <i className="fas fa-road"></i> {item.seg_distance ?? 0} km
                  </span>

                  <br />
                  {item.seg_address || "No address"}
                </div>
              </div>
            </div>
          );
        }

        /* ================= EVENT ================= */
        if (item.event_name) {
          return (
            <div
              key={idx}
              className="stoppage-card"
              onClick={() => onSelectPoint(item)}
            >
              <div className="icon red">E{e++}</div>

              <div className="details">
                <div className="title">
                  {item.event_time || "-"}{" "}
                  <span className="history-event-badge">{item.event_name}</span>
                </div>

                <div className="sub">{item.address || "No address"}</div>
              </div>
            </div>
          );
        }

        return null;
      })}

      {/* ================= END ================= */}
      {!isWorking && lastPoint && (
        <div className="stoppage-card" onClick={() => onSelectPoint(lastPoint)}>
          <div className="icon red">
            <i className="fa-solid fa-flag"></i>
          </div>
          <div className="details">
            <div className="title">{lastPoint.deviceTime || "-"}</div>
            <div className="sub">{lastPoint.address || "No address"}</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StoppageList;
