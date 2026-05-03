import React, { useEffect, useRef, useState } from "react";
import ReactDOM from "react-dom";
import "../../assets/css/vehicleContextMenu.css";

interface Props {
  x: number;
  y: number;
  visible: boolean;
  onClose: () => void;
  deviceId: number;
  modalType: string | null;
  status?: string;
  devicetime?: string | number | Date | null;
  onHistorySelect: (
    type: string,
    deviceId: number,
    stime?: string,
    etime?: string,
  ) => void; // ✅ NEW
  onFollowClick: (deviceId: number) => void; // ✅ NEW
  onEditDevice: (deviceId: number) => void; // ✅ NEW
  onSharePosition: (deviceId: number) => void; // ✅ NEW
  onCommandClick: (deviceId: number) => void; // ✅ NEW
}

const VehicleContextMenu: React.FC<Props> = ({
  x,
  y,
  visible,
  onClose,
  deviceId,
  modalType,
  status,
  onHistorySelect,
  onFollowClick,
  onEditDevice,
  onSharePosition,
  onCommandClick,
  devicetime,
}) => {
  const menuRef = useRef<HTMLDivElement>(null);
  const submenuRef = useRef<HTMLDivElement>(null);

  const [menuPos, setMenuPos] = useState({ top: y, left: x });
  const [submenuPos, setSubmenuPos] = useState({ top: 0, left: 0 });
  const [showSubmenu, setShowSubmenu] = useState(false);
  const submenuTimeout = useRef<any>(null);
  const normalizedStatus = status?.toLowerCase();

  const isOnline = normalizedStatus === "online";
  const isOffline = normalizedStatus === "offline";
  const hasDeviceTime = !!(devicetime && new Date(devicetime).getTime());
  /* Close menu on outside click */
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  useEffect(() => {
    if (!visible) return;

    const handleScroll = (e: Event) => {
      const target = e.target as Node;

      if (menuRef.current && menuRef.current.contains(target)) {
        return;
      }

      onClose();
    };

    window.addEventListener("scroll", handleScroll, true);

    return () => {
      window.removeEventListener("scroll", handleScroll, true);
    };
  }, [visible, onClose]);

  /* Adjust main menu to stay inside viewport */

  /* Adjust main menu to stay inside viewport */
  useEffect(() => {
    if (!visible || !menuRef.current) return;

    const updatePosition = () => {
      const rect = menuRef.current!.getBoundingClientRect();

      const margin = 10;

      // click position ke aas paas open karo
      let newTop = y;
      let newLeft = x;

      // optional: agar center ke aas paas chahiye to ye use karo
      // let newTop = y - rect.height / 2;
      // let newLeft = x - rect.width / 2;

      // bottom overflow
      if (newTop + rect.height > window.innerHeight) {
        newTop = window.innerHeight - rect.height - margin;
      }

      // top overflow
      if (newTop < margin) {
        newTop = margin;
      }

      // right overflow
      if (newLeft + rect.width > window.innerWidth) {
        newLeft = window.innerWidth - rect.width - margin;
      }

      // left overflow
      if (newLeft < margin) {
        newLeft = margin;
      }

      setMenuPos({
        top: newTop,
        left: newLeft,
      });
    };

    requestAnimationFrame(updatePosition);
  }, [x, y, visible]);

  /* Calculate submenu position */
  const calculateSubmenuPos = (event?: React.MouseEvent<HTMLDivElement>) => {
    if (!submenuRef.current) return;

    const triggerRect = (
      event?.currentTarget as HTMLDivElement
    )?.getBoundingClientRect();
    if (!triggerRect) return;

    const submenuHeight = menuRef.current?.offsetHeight || 300;
    const submenuWidth = submenuRef.current.offsetWidth || 190;

    let left = triggerRect.right + 4;

    // same row se start ho
    let top = triggerRect.top;

    // right overflow
    if (left + submenuWidth > window.innerWidth) {
      left = triggerRect.left - submenuWidth - 4;
    }

    // bottom overflow only tab handle karo
    if (top + submenuHeight > window.innerHeight - 10) {
      top = window.innerHeight - submenuHeight - 10;
    }

    // top overflow
    if (top < 10) {
      top = 10;
    }

    setSubmenuPos({ top, left });
  };

  useEffect(() => {
    if (!visible) return;

    const handleResize = () => {
      setShowSubmenu(false);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [visible]);

  if (!visible) return null;

  const playback = (type: string) => {
    console.log("Playback:", type, "Device:", deviceId);

    onClose();

    // 🔥 Custom case
    if (type === "custom") {
      onHistorySelect(type, deviceId, undefined, undefined);
      return;
    }

    onHistorySelect(type, deviceId);
  };
  const menu = (
    <div
      ref={menuRef}
      className="vehicle-context-menu"
      style={{
        top: menuPos.top,
        left: menuPos.left,
        position: "fixed",
        scrollbarWidth: "thin",
      }}
    >
      {/* 🔥 IF NO DEVICE TIME → ONLY EDIT */}
      {!hasDeviceTime ? (
        <div
          className="menu-item"
          onClick={() => {
            onEditDevice(deviceId);
            onClose();
          }}
        >
          <span className="icon-edit">Edit</span>
        </div>
      ) : (
        <>
          {/* ONLINE/OFFLINE COMMON MENU */}
          {(isOnline || isOffline) && (
            <>
              {/* History */}
              <div
                className="menu-item has-submenu"
                onMouseEnter={(e) => {
                  if (submenuTimeout.current)
                    clearTimeout(submenuTimeout.current);
                  calculateSubmenuPos(e);
                  setShowSubmenu(true);
                }}
                onMouseLeave={() => {
                  submenuTimeout.current = setTimeout(() => {
                    setShowSubmenu(false);
                  }, 120);
                }}
              >
                <span className="icon-time">History</span>
                <i className="fas fa-chevron-right submenu-arrow"></i>

                <div
                  ref={submenuRef}
                  className={`submenu ${showSubmenu ? "show" : ""}`}
                  style={{
                    top: submenuPos.top,
                    left: submenuPos.left,
                    position: "fixed",
                    maxHeight: `${menuRef.current?.offsetHeight || 300}px`,
                    overflowY: "auto",
                  }}
                >
                  <div onClick={() => playback("last_hour")}>Last Hour</div>
                  <div onClick={() => playback("today")}>Today</div>
                  <div onClick={() => playback("yesterday")}>Yesterday</div>
                  <div onClick={() => playback("this_week")}>This Week</div>
                  <div onClick={() => playback("last_week")}>Last Week</div>
                  <div onClick={() => playback("this_month")}>This Month</div>
                  <div onClick={() => playback("last_month")}>Last Month</div>
                  <div onClick={() => playback("custom")}>Custom</div>
                </div>
              </div>

              {/* Follow */}
              <div
                className="menu-item"
                onClick={() => {
                  onFollowClick(deviceId);
                  onClose();
                }}
              >
                <span className="icon-follow">Follow</span>
              </div>

              {/* Share */}
              <div
                className="menu-item"
                onClick={() => {
                  onSharePosition(deviceId);
                  onClose();
                }}
              >
                <span className="icon-share">Share Position</span>
              </div>

              {/* Command */}
              <div
                className="menu-item"
                onClick={() => {
                  onCommandClick(deviceId);
                  onClose();
                }}
              >
                <span className="icon-send">Send Command</span>
              </div>
            </>
          )}

          {/* VIDEO */}
          {(modalType === "DashCam" || modalType === "Gps+DashCam") && (
            <div
              className="menu-item"
              onClick={() => {
                window.open(`/video/${deviceId}`, "_blank");
                onClose();
              }}
            >
              <span className="icon-video">Video</span>
            </div>
          )}

          {/* EDIT ALWAYS */}
          <div
            className="menu-item"
            onClick={() => {
              onEditDevice(deviceId);
              onClose();
            }}
          >
            <span className="icon-edit">Edit</span>
          </div>
        </>
      )}
    </div>
  );

  return ReactDOM.createPortal(menu, document.body);
};

export default VehicleContextMenu;
