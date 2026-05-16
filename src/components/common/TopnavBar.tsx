import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { getUsers, type UserDTO } from "../../api/users.api";
import LogoutModal from "../../features/LogoutModal";
import "../../assets/css/TopNavbar.css";
import "leaflet-draw/dist/leaflet.draw.css";
import SubscriptionPlanModal from "../../features/SubscriptionPlanModal";
import ExpensesModal from "../../features/expenses/ExpensesModal";
import UsersModal from "../../features/users/UserModal";
import MaintenanceModal from "../../features/maintenance/MaintenanceModal";
import TaskModal from "../../features/task/TaskModal";
import DashboardModal from "../../features/dashboardModal";
import SetupModal from "../../features/setup/SetupModal";
import ReportModal from "./ReportModal";
import SubscriptionPage from "../../features/SubscriptionPage";
import { resetUnread } from "../../slices/chatNotificationSlice";
import axiosClient from "../../api/axiosClient";

import LogModal from "../../features/logModal";
import CommandModal from "../../features/commands/CommandModal";
import AlertModal from "./AlertModal";

import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import CpanelPage from "./CpanelPage";
import ChatModal from "../../features/chat/ChatModal";
import AiAgentModal from "../../features/ai-agent/AiAgentModal";
import { logout } from "../../slices/authSlice";
import TransportRouteList from "../../features/transport/TransportRouteList";
import TransportStaffList from "../../features/transport/TransportStaffList"

interface TopNavbarProps {
  setActiveTab: (tab: "geofence" | "route" | "poi") => void;
}

const TopNavbar: React.FC<TopNavbarProps> = ({ setActiveTab }) => {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [openUsers, setOpenUsers] = useState(false);
  const [, setUsers] = useState<UserDTO[]>([]);
  const [logoutModal, setLogoutModal] = useState(false);
  const [subscriptionModal, setSubscriptionModal] = useState(false);
  const [openExpenses, setOpenExpenses] = useState(false);
  const [openMaintenance, setOpenMaintenance] = useState(false);
  const [openSetup, setOpenSetup] = useState(false);
  const [openReport, setOpenReport] = useState(false);
  const [openSubscriptionPage, setOpenSubscriptionPage] = useState(false);
  const [openLogs, setOpenLogs] = useState(false);
  const [openTask, setOpenTask] = useState(false);
  const [openDashboard, setOpenDashboard] = useState(false);
  const [openCommmand, setOpenCommand] = useState(false);
  const [openAlert, setOpenAlert] = useState(false);
  const [openZlm, setOpenZlm] = useState(false);
  const [openAiAgent, setOpenAiAgent] = useState(false);
  const systemRef = useRef<HTMLDivElement | null>(null);
  const profileRef = useRef<HTMLDivElement | null>(null);
  const transportRef = useRef<HTMLDivElement | null>(null);

  const [openChat, setOpenChat] = useState(false);
   const [openTransport, setOpenTransport] = useState(false);
   const [openStaff, setOpenStaff] = useState(false);
const unreadCount = useAppSelector(
  (state) => state.chatNotification.unreadCount
);
  // Outside click close
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;

     if (
  systemRef.current &&
  !systemRef.current.contains(target) &&
  profileRef.current &&
  !profileRef.current.contains(target) &&
  transportRef.current &&
  !transportRef.current.contains(target)
) {
  setOpenDropdown(null);
}
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleDropdown = (name: string) => {
    setOpenDropdown((prev) => (prev === name ? null : name));
  };

  useEffect(() => {
    getUsers(1, 100, "").then((res) => setUsers(res.data.content));
  }, []);
  const dispatch = useAppDispatch();
const confirmLogout = async () => {
  try {
    await axiosClient.post("/api/chat/logout"); 
  } catch (err) {
    console.error("Logout API failed", err);
  }

  dispatch(logout());
  setLogoutModal(false);
  window.location.replace("/");
};
  const { permissions, roles, loading } = useAppSelector((s) => s.auth);
  const availablepoints = useAppSelector(
    (state) => state.setup.userSetup?.availablesubscriptionpoints,
  );
  const isAdmin = useMemo(() => roles?.includes("ROLE_ADMIN"), [roles]);

  const hasAccess = useCallback((name: string) => {
    if (isAdmin) return true;
    const perm = permissions.find((p) => p.permission === name);
    return perm?.read === true;
  }, [isAdmin, permissions]);

  const hasAnySystemAccess = useMemo(() => {
    const items = [
      "Alert",
      "Expense",
      "Maintenance",
      "Setup",
      "Commands",
      "Report",
      "Poi",
      "Route",
      "Task",
      "User",
      "Subscription",
      "Geofence",
    ];

    return items.some((name) => hasAccess(name));
  }, [hasAccess]);

  const hasTopGroup =
    hasAccess("Alert") ||
    hasAccess("Expense") ||
    hasAccess("Maintenance") ||
    hasAccess("Setup") ||
    hasAccess("Commands") ||
    hasAccess("Report");

  const hasMiddleGroup = hasAccess("POI") || hasAccess("Route");

  const hasTaskGroup = hasAccess("Task");

  // ✅ prevent flicker
  if (loading) return null;

  return (
    <div className="top-navbar">
      <div className="nav-icons">
        {/* Points */}

        {!isAdmin && (
          <div
            className="points-pill"
            style={{ cursor: "pointer" }}
            onClick={() => setSubscriptionModal(true)}
          >
            <div className="points-left">
              <span className="points-star">★</span>
              <span className="points-text">Points</span>
            </div>
            <div className="points-value">{availablepoints}</div>
          </div>
        )}

        {/* Dashboard */}
        {/* Dashboard */}
        {hasAccess("Dashboard") && (
          <div
            className="icon-wrapper"
            title="Dashboard"
            onClick={() => setOpenDashboard(true)}
          >
            <i className="bi bi-speedometer"></i>
          </div>
        )}
 {/* TransportRoutes */}
  <div className="dropdown" ref={transportRef}>
  <div
    className="icon-wrapper"
    title="Transport"
    onClick={() => toggleDropdown("transport")}
  >
    <i className="bi bi-bus-front"></i>
  </div>

  {openDropdown === "transport" && (
    <ul className="dropdown-menu center">
      
      {/* Route List */}
      <li>
  <div
    className="dropdown-item"
    onClick={() => {
      setOpenDropdown(null);

      setTimeout(() => {
        setOpenTransport(true);
      }, 0);
    }}
  >
    <i className="bi bi-signpost-2 me-2"></i> Route List
  </div>
</li>

      {/* Staff List */}
      <li>
  <div
    className="dropdown-item"
    onClick={() => {
      setOpenDropdown(null);

      setTimeout(() => {
        setOpenStaff(true);
      }, 0);
    }}
  >
    <i className="bi bi-people me-2"></i> Staff List
  </div>
</li>   
    </ul>
  )}
</div>
        {/* Subscription */}
        {hasAccess("Subscription") && (
          <div
            className="icon-wrapper"
            title="Subscription"
            onClick={() => setOpenSubscriptionPage(true)}
          >
            <i className="fas fa-credit-card"></i>
          </div>
        )}

        <SubscriptionPage
          open={openSubscriptionPage}
          onClose={() => setOpenSubscriptionPage(false)}
        />
        {/* Users */}
        {hasAccess("User") && (
          <div
            className="icon-wrapper"
            title="Users"
            onClick={() => setOpenUsers(true)}
          >
            <i className="fas fa-users"></i>
          </div>
        )}

        <UsersModal open={openUsers} onClose={() => setOpenUsers(false)} />
        <ExpensesModal
          open={openExpenses}
          onClose={() => setOpenExpenses(false)}
        />
        <MaintenanceModal
          open={openMaintenance}
          onClose={() => setOpenMaintenance(false)}
        />
        <CommandModal
          open={openCommmand}
          onClose={() => setOpenCommand(false)}
        />
        <SetupModal open={openSetup} onClose={() => setOpenSetup(false)} />
        <AlertModal open={openAlert} onClose={() => setOpenAlert(false)} />
        <ReportModal open={openReport} onClose={() => setOpenReport(false)} />

        <LogModal open={openLogs} onClose={() => setOpenLogs(false)} />

        {/* ===== SYSTEM MENU ===== */}
        {hasAnySystemAccess && (
          <div className="dropdown" ref={systemRef}>
            <div
              className="icon-wrapper profile-icon"
              title="System Menu"
              onClick={() => toggleDropdown("system")}
            >
              <i className="bi bi-grid-3x3-gap"></i>
            </div>
            {openDropdown === "system" && (
              <ul className="dropdown-menu center">
                {hasAccess("Alert") && (
                  <li>
                    <div
                      className="dropdown-item"
                      onClick={() => {
                        setOpenDropdown(null);
                        setOpenAlert(true);
                      }}
                    >
                      <i className="bi bi-exclamation-triangle me-2"></i> Alerts
                    </div>
                  </li>
                )}

                {hasAccess("Expense") && (
                  <li>
                    <div
                      className="dropdown-item"
                      onClick={() => {
                        setOpenDropdown(null);
                        setOpenExpenses(true);
                      }}
                    >
                      <i className="bi bi-cash-stack me-2"></i> Expense
                    </div>
                  </li>
                )}

                {hasAccess("Maintenance") && (
                  <li>
                    <div
                      className="dropdown-item"
                      onClick={() => {
                        setOpenDropdown(null);
                        setOpenMaintenance(true);
                      }}
                    >
                      <i className="bi bi-tools me-2"></i> Maintenance
                    </div>
                  </li>
                )}

                {hasAccess("Setup") && (
                  <li>
                    <div
                      className="dropdown-item"
                      onClick={() => {
                        setOpenDropdown(null);
                        setOpenSetup(true);
                      }}
                    >
                      <i className="bi bi-gear me-2"></i> Setup
                    </div>
                  </li>
                )}

                {hasAccess("Commands") && (
                  <li>
                    <div
                      className="dropdown-item"
                      onClick={() => {
                        setOpenDropdown(null);
                        setOpenCommand(true);
                      }}
                    >
                      <i className="bi bi-robot me-2"></i> Commands
                    </div>
                  </li>
                )}

                {hasAccess("Report") && (
                  <li>
                    <div
                      className="dropdown-item"
                      onClick={() => {
                        setOpenDropdown(null);
                        setOpenReport(true);
                      }}
                    >
                      <i className="bi bi-file-earmark-text me-2"></i> Reports
                    </div>
                  </li>
                )}

                {hasTopGroup && hasMiddleGroup && (
                  <li>
                    <hr className="dropdown-divider" />
                  </li>
                )}

                {hasAccess("POI") && (
                  <li>
                    <div
                      className="dropdown-item"
                      onClick={() => {
                        setOpenDropdown(null);
                        setActiveTab("poi");
                      }}
                    >
                      <i className="bi bi-grid-3x3-gap me-2"></i> POI
                    </div>
                  </li>
                )}

                {hasAccess("Route") && (
                  <li>
                    <div
                      className="dropdown-item"
                      onClick={() => {
                        setOpenDropdown(null);
                        setActiveTab("route");
                      }}
                    >
                      <i className="bi bi-signpost-2 me-2"></i> Route
                    </div>
                  </li>
                )}

                {hasMiddleGroup && hasTaskGroup && (
                  <li>
                    <hr className="dropdown-divider" />
                  </li>
                )}

                {hasAccess("Task") && (
                  <li>
                    <div
                      className="dropdown-item"
                      onClick={() => {
                        setOpenDropdown(null);
                        setOpenTask(true);
                      }}
                    >
                      <i className="fas fa-tasks me-2"></i> Task
                    </div>
                  </li>
                )}
                {hasAccess("Chat") && (
                  <li style={{ position: "relative" }}>
  <div
    className="dropdown-item"
    onClick={() => {
      setOpenDropdown(null);
      setOpenChat(true);

      // ✅ reset unread on open
      dispatch(resetUnread());
    }}
  >
    <i className="bi bi-chat-dots"></i> Chat

    {/* 🔴 BADGE */}
    {unreadCount > 0 && (
      <span className="chat-badge">
        {unreadCount}
      </span>
    )}
  </div>
</li>
                )}
                <li>
                  <div
                    className="dropdown-item"
                    onClick={() => {
                      setOpenDropdown(null);
                      setOpenAiAgent(true);
                    }}
                  >
                    <i className="bi bi-stars me-2"></i> AI Agent
                  </div>
                </li>
              </ul>
            )}
          </div>
        )}
        {isAdmin && (
          <div
            className="icon-wrapper profile-icon"
            title="Cpanel"
            onClick={() => setOpenZlm(true)}
          >
            <i className="bi bi-sliders"></i>
          </div>
        )}

        {/* Language */}
        <select className="lang-select">
          <option>English</option>
          <option>Hindi</option>
        </select>

        {/* ===== PROFILE MENU ===== */}
        <div className="dropdown" ref={profileRef}>
          <div
            className="icon-wrapper profile-icon"
            title="Profile"
            onClick={() => toggleDropdown("profile")}
          >
            <i className="fas fa-user"></i>
          </div>

          {openDropdown === "profile" && (
            <ul className="dropdown-menu right">
              <li>
                <div
                  className="dropdown-item"
                  onClick={() => {
                    setOpenDropdown(null);
                    setOpenLogs(true);
                  }}
                >
                  <i className="fas fa-file-alt me-2"></i> Logs
                </div>
              </li>

              <li>
                <hr className="dropdown-divider" />
              </li>

              {/* LOGOUT */}
              <li>
                <div
                  className="dropdown-item  logout-item"
                  onClick={() => {
                    setOpenDropdown(null);
                    setLogoutModal(true);
                  }}
                >
                  <i className="fas fa-sign-out-alt me-2"></i>
                  <span>Logout</span>
                </div>
              </li>
            </ul>
          )}
        </div>
      </div>
      <TaskModal open={openTask} onClose={() => setOpenTask(false)} />
      <DashboardModal
        open={openDashboard}
        onClose={() => setOpenDashboard(false)}
      />
      <SubscriptionPlanModal
        open={subscriptionModal}
        onClose={() => setSubscriptionModal(false)}
      />
      {/* LOGOUT MODAL */}
      <LogoutModal
        open={logoutModal}
        onClose={() => setLogoutModal(false)}
        onConfirm={confirmLogout}
      />
  <TransportRouteList
        open={openTransport}
        onClose={() => setOpenTransport(false)}
      />
      
  <TransportStaffList  open={openStaff}
  onClose={() => setOpenStaff(false)}/>

      <CpanelPage open={openZlm} onClose={() => setOpenZlm(false)} />
      <ChatModal open={openChat} onClose={() => setOpenChat(false)} />
      <AiAgentModal open={openAiAgent} onClose={() => setOpenAiAgent(false)} />
    </div>
  );
};

export default TopNavbar;
