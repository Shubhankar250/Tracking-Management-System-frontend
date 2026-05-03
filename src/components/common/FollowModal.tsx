import React, { useEffect, useState } from "react";

import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import { clearLiveFollow } from "../../slices/liveFollowSlice";
import {
  FaUser,
  FaIdCard,
  FaPhone,
  FaEnvelope,
  FaCar,
  FaBus,
  FaMotorcycle,
  FaTractor,
  FaTruck,
  FaTachometerAlt,
  FaMapMarkerAlt,
  FaMicrochip,
  FaSimCard,
  FaCarSide,
  FaRoad,
  FaBusinessTime,
  FaClock,
  FaTools,
  FaRulerHorizontal,
} from "react-icons/fa";
import { MdPower } from "react-icons/md";
import Modal from "./Modal";
import FollowMap from "../map/FollowMap";
import FollowLiveVideoPlayer from "./FollowLiveVideoPlayer";
import "../../assets/css/livefollow.css";
import { fetchTodayActivity } from "../../slices/devicesSlice";
interface Props {
  open: boolean;
  onClose: () => void;
}
interface Service {
  serviceName: string;
  lastServiceKm: number;
  lastServiceDate: string;
}
type VehicleIconType = "car" | "bike" | "tractor" | "bus" | "truck";

const getVehicleIconType = (vehicle: any): VehicleIconType => {
  const iconName = String(
    vehicle?.deviceSetting?.object_icon ??
      vehicle?.deviceSetting?.objectIcon ??
      vehicle?.deviceSetting?.img_icon_name ??
      vehicle?.deviceSetting?.imgIconName ??
      vehicle?.objectIcon ??
      vehicle?.object_icon ??
      vehicle?.imgIconName ??
      vehicle?.img_icon_name ??
      ""
  ).toLowerCase();

  if (iconName.startsWith("bike")) return "bike";
  if (iconName.startsWith("tractor")) return "tractor";
  if (iconName.startsWith("bus")) return "bus";
  if (iconName.startsWith("truck")) return "truck";
  if (iconName.startsWith("car")) return "car";

  return "car";
};

const vehicleIconMap = {
  car: FaCar,
  bike: FaMotorcycle,
  tractor: FaTractor,
  bus: FaBus,
  truck: FaTruck,
};

const FollowModal: React.FC<Props> = ({ open, onClose }) => {
  const dispatch = useAppDispatch();
  const { data: followData, loading: followLoading } = useAppSelector(
    (state) => state.liveFollow,
  );
  const todayActivity = useAppSelector(
  (state) => state.devices.todayActivity
);

useEffect(() => {
if (followData?.device_id) {
  dispatch(
    fetchTodayActivity({
      deviceId: followData.device_id,
    })
  );
}
}, [dispatch, followData?.device_id]);
 const services: Service[] = followData?.services ?? [];
  const hasData = services.length > 0;

  const [activeVideoTab, setActiveVideoTab] = useState("Today_Activity");

useEffect(() => {
    if (open) {
        setActiveVideoTab("Today_Activity");
    }
}, [open]);

  const showVideo =
    followData?.modalType === "DashCam" ||
    followData?.modalType === "Gps+DashCam";



    const vehicleIconType = getVehicleIconType(followData);
const VehicleIcon = vehicleIconMap[vehicleIconType];

if (!followData) {
  return (
    <Modal
      className="follow-modal"
      isOpen={open}
      size="fullscreen"
      draggable={false}
      title="Follow Vehicle"
      onClose={() => {
        onClose();
        dispatch(clearLiveFollow());
      }}
    >
      <div className="loading">Loading live data...</div>
    </Modal>
  );
}



const hasTodayActivityData =
  todayActivity &&
  !(
    todayActivity.totalRunningTime === "00:00:00" &&
    todayActivity.totalIdleTime === "00:00:00" &&
    todayActivity.totalStopTime === "00:00:00" &&
    todayActivity.workingHours === "00:00:00" &&
    (todayActivity.workStartTime === "-" ||
      !todayActivity.workStartTime) &&
    (todayActivity.workEndTime === "-" ||
      !todayActivity.workEndTime)
  );
  const refreshTodayActivity = () => {
  if (followData?.device_id) {
    dispatch(
      fetchTodayActivity({
        deviceId: followData.device_id,
      })
    );
  }
};
   const formatEventTime = (time: string) => {
    if (!time) return "-";

    // Fix for LocalDateTime string like 2026-04-06T06:42:14
    const normalizedTime = time.replace("T", " ");

    const d = new Date(normalizedTime);

    if (isNaN(d.getTime())) {
      return time;
    }

    const pad = (n: number) => String(n).padStart(2, "0");

    return (
      pad(d.getDate()) +
      "-" +
      pad(d.getMonth() + 1) +
      "-" +
      d.getFullYear() +
      " " +
      pad(d.getHours()) +
      ":" +
      pad(d.getMinutes()) +
      ":" +
      pad(d.getSeconds())
    );
  };
  return (
    <Modal
        className="follow-modal"
        isOpen={open}
        size="fullscreen"
        draggable={false}
       title={
  (followData ? (
    <div className="follow-header">

      {(() => {
        const iconType =
          followData?.deviceSetting?.icon_type?.toLowerCase() || "icon";
        const course = followData?.course || 0;

        /* ================= ARROW ================= */
        if (iconType === "arrow") {
          return (
            <div
              className="follow-header-icon"
              style={{
                transform: `rotate(${course}deg)`,
                fontSize: "22px",
                color: "#ff3b30",
                lineHeight: 1,
              }}
            >
              ▲
            </div>
          );
        }

        /* ================= ROTATING ICON ================= */
        if (iconType === "rotating_icon") {
          const iconName =
            followData?.deviceSetting?.img_icon_name || "car1.png";

          const iconUrl = new URL(
            `../../assets/images/device_icon/rotating_icon/${iconName}`,
            import.meta.url
          ).href;

          return (
            <img
              src={iconUrl}
              className="follow-header-icon"
              style={{
                width: 28,
                height: 28,
                transform: `rotate(${course}deg)`,
                transformOrigin: "center",
              }}
              alt="vehicle"
            />
          );
        }

        /* ================= NORMAL ICON ================= */
        const iconName =
          followData?.deviceSetting?.img_icon_name || "car1.png";

        const iconUrl = new URL(
          `../../assets/images/device_icon/icon/${iconName}`,
          import.meta.url
        ).href;
         

        return (
          <img
            src={iconUrl}
            className="follow-header-icon"
            style={{ width: 28, height: 28 }}
            alt="vehicle"
          />
        );
      })()}

      <span className="follow-label">Follow</span>
      <span className="follow-vehicle-name">
        ({followData.device_name})
      </span>
    </div>
  ) : (
    "Follow Vehicle"
  )) as unknown as string
}

        onClose={() => {
          onClose();
          dispatch(clearLiveFollow());
        }}
      >
         <div
    className={`follow-split-container ${
      !showVideo ? "full-map" : ""
    }`}
  >
              <div className="follow-map-section">

          {followLoading && <div className="loading">Loading live data...</div>}

          {followData && (
            <FollowMap
              lat={followData.latitude}
              lng={followData.longitude}
              speed={followData.speed}
              vehicleName={followData.device_name}
              deviceSetting={followData.deviceSetting}
              course={followData.course}
            />
          )}
          </div>
   <div className="follow-video-section">
    {/* Top 60% → Video */}
    {showVideo && (
  <div className="video-top">
    {followData && (
      <FollowLiveVideoPlayer deviceId={String(followData.device_id)} />
    )}
  </div>
)}

    {/* Bottom 40% → Tabs like Cpanel */}
    <div className="video-bottom-tabs">
      <div  className="modal-tabs">
        {["Today_Activity","Driver", "Vehicle Details", "Object Details","Services","Recent Events"].map((tab) => (
          <button
            key={tab}
            className={`tab-btn ${activeVideoTab === tab ? "active" : ""}`}
            onClick={() => setActiveVideoTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

    <div id="follow-tab-content" className="tab-content">

  {/* ================= Today Activity ================= */}
  
{activeVideoTab === "Today_Activity" && (
  <>
    <div className="today-activity-header">
      <button
        className="refresh-btn"
        onClick={refreshTodayActivity}
      >
        🔄 Refresh
      </button>
    </div>

    {hasTodayActivityData ? (
      <table id="follow-Today_Activity-table" className="info-table">
        <tbody>
           <tr>
                                    <td>
                                      <FaRulerHorizontal className="info-icon odometer" /> Distance:
                                    </td>
                                    <td>
                                      <span>{todayActivity.totalDistance ?? 0} km</span>
                                    </td>
                                  </tr>
          <tr>
            <td><FaRoad className="info-icon odometer" /> Running Time:</td>
            <td>{todayActivity.totalRunningTime || "-"}</td>
          </tr>

          <tr>
            <td><FaClock className="info-icon device-time" /> Idle Time:</td>
            <td>{todayActivity.totalIdleTime || "-"}</td>
          </tr>

          <tr>
            <td><MdPower className="info-icon ignition off" /> Stop Time:</td>
            <td>{todayActivity.totalStopTime || "-"}</td>
          </tr>

          <tr>
            <td><FaTools className="info-icon service" /> Working Hours:</td>
            <td>{todayActivity.workingHours || "-"}</td>
          </tr>

          <tr>
            <td><FaBusinessTime className="info-icon service" /> Work Duration:</td>
            <td>
              {todayActivity.workStartTime && todayActivity.workStartTime !== "-"
                ? formatEventTime(todayActivity.workStartTime)
                : "-"}
              {" - "}
              {todayActivity.workEndTime && todayActivity.workEndTime !== "-"
                ? formatEventTime(todayActivity.workEndTime)
                : "-"}
            </td>
          </tr>
          
        </tbody>
      </table>
    ) : (
      <div className="no-events">No Today Activity Data</div>
    )}
  </>
)}

  {activeVideoTab === "Driver" && (
    <table id="follow-driver-table" className="info-table">
      <tbody>
        {followData.drivers.length ? (
          <>
            <tr>
              <td><FaUser className="info-icon driver" /> Name:</td>
              <td>{followData.drivers[0].name}</td>
            </tr>

            <tr>
              <td><FaIdCard className="info-icon rfid" /> RFID:</td>
              <td>{followData.drivers[0].rfid ?? "-"}</td>
            </tr>

            <tr>
              <td><FaPhone className="info-icon phone" /> Phone:</td>
              <td>{followData.drivers[0].phone ?? "-"}</td>
            </tr>

            <tr>
              <td><FaEnvelope className="info-icon email" /> Email:</td>
              <td>{followData.drivers[0].email ?? "-"}</td>
            </tr>
          </>
        ) : (
          <tr>
            <td colSpan={2}>No Driver</td>
          </tr>
        )}
      </tbody>
    </table>
  )}

  {/* ================= VEHICLE DETAILS ================= */}
  {activeVideoTab === "Vehicle Details" && (
    <table id="follow-vehicle-table" className="info-table">
      <tbody>
        <tr>
          <td><VehicleIcon className={`info-icon name ${vehicleIconType}`} /> Name:</td>

          <td>{followData.device_name}</td>
        </tr>

        <tr>
          <td><FaTachometerAlt className="info-icon speed" /> Speed:</td>
          <td>{followData.speed ?? 0} km/h</td>
        </tr>

        <tr>
          <td>
            <MdPower className={`info-icon ignition ${followData.ignition ? "on" : "off"}`} />
            Ignition:
          </td>
          <td>{followData.ignition ? "On" : "Off"}</td>
        </tr>

        <tr>
          <td><FaMapMarkerAlt className="info-icon address" /> Address:</td>
          <td>{followData.address ?? "-"}</td>
        </tr>
      </tbody>
    </table>
  )}

  {/* ================= OBJECT DETAILS ================= */}
  {activeVideoTab === "Object Details" && (
    <table id="follow-object-table" className="info-table">
      <tbody>
        <tr>
          <td><FaMicrochip className="info-icon imei" /> IMEI:</td>
          <td>{followData.uniqueid}</td>
        </tr>

        <tr>
          <td><FaSimCard className="info-icon sim" /> Sim No:</td>
          <td>{followData.simCardNumber ?? "-"}</td>
        </tr>

        <tr>
          <td><FaCarSide className="info-icon devciemodal" /> Model:</td>
          <td>{followData.deviceModel ?? "-"}</td>
        </tr>
      </tbody>
    </table>
  )}

  {/* ================= SERVICES ================= */}
{activeVideoTab === "Services" && (
  <div className="follow-service-modern">

    {hasData ? (
      <>
        {/* 🔹 Header */}
        <div className="follow-service-header">
          <span>Service</span>
          <span>Last Service Time</span>
        </div>

        {/* 🔹 Rows */}
        {services.map((service, index) => (
          <div key={index} className="follow-service-row">
            <span className="follow-service-name">
              {service.serviceName}
            </span>

            <span className="follow-service-date">
              {service.lastServiceDate}
            </span>
          </div>
        ))}
      </>
    ) : (
      <div className="no-data">No Service Data Available</div>
    )}
  </div>
)}

  {/* ================= RECENT EVENTS ================= */}
  {activeVideoTab === "Recent Events" && (
    <div id="follow-events" className="events-list">
      {followData.events?.length ? (
        followData.events.map((e, i) => (
          <div key={i} className="event-item">
            <span>{e.alert_time}</span> - <span>{e.alert_type}</span>
          </div>
        ))
      ) : (
        <div className="no-events">No Events</div>
      )}
    </div>
  )}

</div>
    </div>
  </div>

        </div>
      </Modal>
  );
};

export default FollowModal;