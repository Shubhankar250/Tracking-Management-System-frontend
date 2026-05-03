import React, { useState, useMemo, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import "../../assets/css/bottom.css";
import Odometer from "react-odometerjs";
import "odometer/themes/odometer-theme-default.css";
import {
  FaAngleDown,
  FaAngleUp,
  FaBatteryHalf,
  FaBell,
  FaBolt,
  FaBusinessTime,
  FaCar,
  FaCarSide,
  FaClock,
  FaCube,
  FaEnvelope,
  FaGasPump,
  FaIdCard,
  FaKeyboard,
  FaMapMarkerAlt,
  FaMicrochip,
  FaPhone,
  FaRoad,
  FaRulerHorizontal,
  FaServer,
  FaSimCard,
  FaSyncAlt,
  FaTachometerAlt,
  FaTools,
  FaUser,
  FaBus,
FaMotorcycle,
FaTractor,
FaTruck,
} from "react-icons/fa";

import { MdPower } from "react-icons/md";
import { fetchTodayActivity } from "../../slices/devicesSlice";

interface BottomPanelProps {
  sidebarOpen: boolean;
}

/* ✅ Type Safety for Services */
interface Service {
  serviceName: string;
  lastServiceKm: number;
  lastServiceDate: string;
}


type VehicleIconType = "car" | "bike" | "tractor" | "bus" | "truck";

const getVehicleIconType = (vehicle: any): VehicleIconType => {
  const iconName = String(
    vehicle?.objectIcon ??
      vehicle?.object_icon ??
      vehicle?.imgIconName ??
      vehicle?.img_icon_name ??
      vehicle?.iconName ??
      vehicle?.icon_name ??
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


const BottomPanel: React.FC<BottomPanelProps> = ({ sidebarOpen }) => {
  const [isOpen, setIsOpen] = useState(true);
  const dispatch = useAppDispatch();

  const isAnyModalOpen = useAppSelector((state) => state.ui.isAnyModalOpen);

  const selectedVehicle = useAppSelector((state) => {
    const id = state.live.selectedVehicleId;
    return state.live.devices.find((d) => d.device_id === id) || null;
  });

  const vehicleIconType = getVehicleIconType(selectedVehicle);
const VehicleIcon = vehicleIconMap[vehicleIconType];

  const getAttributes = (v: any) => {
    try {
      if (!v?.attributes) return {};

      if (typeof v.attributes === "object") {
        return v.attributes;
      }

      if (typeof v.attributes === "string") {
        return JSON.parse(v.attributes);
      }

      return {};
    } catch {
      return {};
    }
  };
  const attrs = getAttributes(selectedVehicle);
  const odometerValue = Number(
    attrs?.total_odometer ??
    attrs?.odometer ??
    attrs?.distance ??
    0
  );
  const userSetup = useAppSelector((state) => state.setup.userSetup);

  /* ✅ Safe services handling */
  const services: Service[] = selectedVehicle?.services ?? [];
  const hasData = services.length > 0;
  const todayActivity = useAppSelector(
    (state) => state.devices.todayActivity
  );
  useEffect(() => {
    if (selectedVehicle?.device_id) {
      dispatch(
        fetchTodayActivity({
          deviceId: selectedVehicle.device_id,
        })
      );
    }
  }, [dispatch, selectedVehicle?.device_id]);
  /* ✅ Memoized widget parsing (Performance boost) */
  const enabledWidgets = useMemo(() => {
    return userSetup?.availableWidgets
      ? userSetup.availableWidgets.split(",").map((w) => w.trim())
      : [];
  }, [userSetup?.availableWidgets]);

  const isWidgetEnabled = (name: string) => enabledWidgets.includes(name);

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
  if (isAnyModalOpen) return null;
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
    if (selectedVehicle?.device_id) {
      dispatch(
        fetchTodayActivity({
          deviceId: selectedVehicle.device_id,
        })
      );
    }
  };
  return (
    <div
      className="bottom-panel-container"
      style={{
        left: sidebarOpen ? 300 : 0,
        width: sidebarOpen ? "calc(100% - 300px)" : "100%",
      }}
    >
      <div className={`bottom-panel ${isOpen ? "open" : "closed"}`}>
        {/* Toggle */}
        <div className="panel-toggle-btn" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <FaAngleDown /> : <FaAngleUp />}
        </div>

        {!selectedVehicle && (
          <div className="no-selection">Select a vehicle to view details</div>
        )}

        {selectedVehicle && (
          <div className="tp-widgets-content">
            {isWidgetEnabled("Today_Activity") && (
              <div className="tp-widget">
                <div className="tp-widget-heading today-heading">
                  <div className="title-left">
                    <FaClock className="widget-icon" />
                    Today Activity
                  </div>

                  <button
                    onClick={refreshTodayActivity}
                    className="activity-refresh-btn"
                    title="Refresh"
                  >
                    <FaSyncAlt />
                  </button>
                </div>

                <div className="tp-widget-body">
                  {hasTodayActivityData ? (
                    <table>
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
                          <td>
                            <FaRoad className="info-icon odometer" /> Running Time:
                          </td>
                          <td>
                            <span>{todayActivity.totalRunningTime || "-"}</span>
                          </td>
                        </tr>

                        <tr>
                          <td>
                            <FaClock className="info-icon device-time" /> Idle Time:
                          </td>
                          <td>
                            <span>{todayActivity.totalIdleTime || "-"}</span>
                          </td>
                        </tr>

                        <tr>
                          <td>
                            <MdPower className="info-icon ignition off" /> Stop Time:
                          </td>
                          <td>
                            <span>{todayActivity.totalStopTime || "-"}</span>
                          </td>
                        </tr>

                        <tr>
                          <td>
                            <FaTools className="info-icon service" /> Working Hours:
                          </td>
                          <td>
                            <span>{todayActivity.workingHours || "-"}</span>
                          </td>
                        </tr>

                        <tr>
                          <td>
                            <FaBusinessTime className="info-icon service" /> Work Duration:
                          </td>
                          <td>
                            <span style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                              {todayActivity.workStartTime && todayActivity.workStartTime !== "-"
                                ? formatEventTime(todayActivity.workStartTime)
                                : "-"}
                              {" - "}
                              {todayActivity.workEndTime && todayActivity.workEndTime !== "-"
                                ? formatEventTime(todayActivity.workEndTime)
                                : "-"}
                            </span>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  ) : (
                    <div className="no-events">No Today Activity Data</div>
                  )}
                </div>
              </div>
            )}
            {/* STREET VIEW */}
            {isWidgetEnabled("Street_view") && (
              <div className="tp-widget">
                <div className="tp-widget-heading">
                  <FaMapMarkerAlt className="widget-icon" /> Street View
                </div>

                <div className="tp-widget-body street-view-card">
                  {selectedVehicle.latitude != null &&
                    selectedVehicle.longitude != null ? (
                    <iframe
                      title="street-view"
                      className="street-view-frame"
                      loading="lazy"
                      allowFullScreen
                      src={`https://www.google.com/maps?q=&layer=c&cbll=${selectedVehicle.latitude},${selectedVehicle.longitude}&cbp=11,0,0,0,0&output=svembed`}
                    />
                  ) : (
                    <div className="no-events">No Location Available</div>
                  )}
                </div>
              </div>
            )}

            {/* DRIVER */}
            {isWidgetEnabled("Driver") && (
              <div className="tp-widget">
                <div className="tp-widget-heading">
                  <FaUser className="widget-icon" /> Driver
                </div>

                <div className="tp-widget-body">
                  {selectedVehicle.drivers?.length ? (
                    <table>
                      <tbody>
                        <tr>
                          <td>
                            <FaUser className="info-icon driver" /> Name:
                          </td>
                          <td>
                            <span>{selectedVehicle.drivers[0].name}</span>
                          </td>
                        </tr>

                        <tr>
                          <td>
                            <FaIdCard className="info-icon rfid" /> RFID:
                          </td>
                          <td>
                            <span>
                              {selectedVehicle.drivers[0].rfid ?? "-"}
                            </span>
                          </td>
                        </tr>

                        <tr>
                          <td>
                            <FaPhone className="info-icon phone" /> Phone:
                          </td>
                          <td>
                            <span>
                              {selectedVehicle.drivers[0].phone ?? "-"}
                            </span>
                          </td>
                        </tr>

                        <tr>
                          <td>
                            <FaEnvelope className="info-icon email" /> Email:
                          </td>
                          <td>
                            <span>
                              {selectedVehicle.drivers[0].email ?? "-"}
                            </span>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  ) : (
                    <div className="no-events">No Driver</div>
                  )}
                </div>
              </div>
            )}

            {/* Vehicle DETAILS */}
            {isWidgetEnabled("Device_details") && (
              <div className="tp-widget">
                <div className="tp-widget-heading">
                 <VehicleIcon className="widget-icon" /> Vehicle Details

                </div>

                <div className="tp-widget-body">
                  <table>
                    <tbody>
                      <tr>
                        <td>
                        <VehicleIcon className={`info-icon name ${vehicleIconType}`} /> Name:

                        </td>
                        <td>
                          <span>{selectedVehicle.device_name}</span>
                        </td>
                      </tr>

                      <tr>
                        <td>
                          <FaTachometerAlt className="info-icon speed" /> Speed:
                        </td>
                        <td>
                          <span>{selectedVehicle.speed ?? 0} kph</span>
                        </td>
                      </tr>
                      <tr>
                        <td>
                          <FaRoad className="info-icon odometer" /> Odometer:
                        </td>
                        <td>
                          <div className="odometer-wrapper">
                            <Odometer
                              key={odometerValue + "_" + selectedVehicle?.device_id}
                              value={odometerValue}
                              format="(ddd)"
                              duration={800}
                            /> </div>
                        </td>
                      </tr>
                      <tr>
                        <td>
                          <MdPower
                            className={`info-icon ignition ${selectedVehicle.ignition ? "on" : "off"}`}
                          />{" "}
                          Ignition:
                        </td>
                        <td>
                          <span>{selectedVehicle.ignition ? "On" : "Off"}</span>
                        </td>
                      </tr>

                      <tr className="address-row">
                        <td>
                          <FaMapMarkerAlt className="info-icon address" />{" "}
                          Address:
                        </td>
                        <td>
                          <span className="address-text" title={selectedVehicle.address ?? "-"}>{selectedVehicle.address ?? "-"}</span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}
            {/* DEVICE DETAILS */}
            {isWidgetEnabled("Device_details") && (
              <div className="tp-widget">
                <div className="tp-widget-heading">
                  <FaCube className="widget-icon" />
                  Object Details
                </div>

                <div className="tp-widget-body">
                  <table>
                    <tbody>
                      <tr>
                        <td>
                          <FaMicrochip className="info-icon imei" /> IMEI:
                        </td>
                        <td>
                          <span>{selectedVehicle.uniqueid}</span>
                        </td>
                      </tr>
                      <tr>
                        <td>
                          <FaClock className="info-icon device-time" /> Device Time:
                        </td>
                        <td>
                          <span>
                            {selectedVehicle.devicetime
                              ? formatEventTime(selectedVehicle.devicetime)
                              : "-"}
                          </span>
                        </td>
                      </tr>

                      <tr>
                        <td>
                          <FaServer className="info-icon server-time" /> Server Time:
                        </td>
                        <td>
                          <span>
                            {selectedVehicle.servertime
                              ? formatEventTime(selectedVehicle.servertime)
                              : "-"}
                          </span>
                        </td>
                      </tr>
                      <tr>
                        <td>
                          <FaSimCard className="info-icon sim" /> Sim No:
                        </td>
                        <td>
                          <span>{selectedVehicle.simCardNumber ?? 0}</span>
                        </td>
                      </tr>

                      <tr>
                        <td>
                          <FaCarSide className="info-icon devciemodal" /> Model:
                        </td>
                        <td>
                          <span>{selectedVehicle.deviceModel ?? "-"}</span>
                        </td>
                      </tr>

                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* SENSORS */}
            {isWidgetEnabled("Sensors") && (
              <div className="tp-widget">
                <div className="tp-widget-heading">
                  <FaMicrochip className="widget-icon" /> Sensors
                </div>

                <div className="tp-widget-body">
                  <table>
                    <tbody>
                      <tr>
                        <td>
                          <FaBatteryHalf className="info-icon battery" />{" "}
                          Battery:
                        </td>
                        <td>
                          <span>{selectedVehicle.battery ?? "-"}%</span>
                        </td>
                      </tr>

                      <tr>
                        <td>
                          <FaGasPump className="info-icon fuel" /> Fuel:
                        </td>
                        <td>
                          <span>{selectedVehicle.fuel ?? "-"}</span>
                        </td>
                      </tr>

                      <tr>
                        <td>
                          <FaBolt className="info-icon power" /> Power:
                        </td>
                        <td>
                          <span>{selectedVehicle.power ?? "-"}</span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* SERVICES */}
            {isWidgetEnabled("Services") && (
              <div className="tp-widget">
                <div className="tp-widget-heading">
                  <FaTools className="widget-icon" /> Services
                </div>

                <div className="tp-widget-body">
                  {hasData ? (
                    <div className="service-table-modern">

                      {/* 🔹 Header */}
                      <div className="service-header">
                        <span>Service</span>
                        <span>Last Service Time</span>
                      </div>

                      {/* 🔹 Rows */}
                      {services.map((service, index) => (
                        <div key={index} className="service-row">
                          <span className="service-name">
                            {service.serviceName}
                          </span>

                          <span className="service-date">
                            {formatEventTime(service.lastServiceDate)}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="no-events">No Service Data Available</div>
                  )}
                </div>
              </div>
            )}

            {/* EVENTS */}
            {isWidgetEnabled("Recent_Events") && (
              <div className="tp-widget">
                <div className="tp-widget-heading">
                  <FaBell className="widget-icon" /> Recent Events
                </div>

                <div className="tp-widget-body event-widget-body">
                  {selectedVehicle.events?.length ? (
                    <div className="event-list-modern">
                      {selectedVehicle.events.map((e, i) => (
                        <div key={i} className="event-card">

                          <div
                            className={`event-icon ${e.alert_type === "OVERSPEED" ? "overspeed" : ""}`}
                          >
                            <FaBell />
                          </div>

                          <div className="event-content">
                            <div className="event-type">
                              {e.alert_type}
                              {e.alert_type === "OVERSPEED" && e.speed ? (
                                <span className="overspeed-value"> - {e.speed} km/h</span>
                              ) : null}
                            </div>
                            <div className="event-time">{formatEventTime(e.alert_time)}</div>
                          </div>

                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="no-events">No Events</div>
                  )}
                </div>
              </div>
            )}

            {/* COMMAND */}
            {isWidgetEnabled("GPRS_Commands") && (
              <div className="tp-widget">
                <div className="tp-widget-heading">
                  <FaKeyboard className="widget-icon" /> Command
                </div>

                <div className="tp-widget-body command-card">
                  {/* Command UI here */}
                  <div className="no-events">No Data</div>
                </div>
              </div>
            )}

          </div>
        )}
      </div>
    </div>
  );
};

export default BottomPanel;




