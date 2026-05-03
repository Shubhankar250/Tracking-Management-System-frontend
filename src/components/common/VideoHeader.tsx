import React, { useState, useRef, useEffect } from "react";
import logoImgae from "../../assets/images/tracking_path-300x61.png";

// ✅ IMPORT SAME MODALS
import LogModal from "../../features/logModal";
import LogoutModal from "../../features/LogoutModal";

const VideoHeader: React.FC = () => {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  // ✅ MODAL STATES (same as TopNavbar)
  const [openLogs, setOpenLogs] = useState(false);
  const [logoutModal, setLogoutModal] = useState(false);

  const profileRef = useRef<HTMLDivElement | null>(null);

  // ✅ OUTSIDE CLICK CLOSE
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setOpenDropdown(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ✅ SAME LOGOUT FUNCTION
  const confirmLogout = () => {
    localStorage.clear();
    setLogoutModal(false);
    window.location.replace("/");
  };

  return (
    <>
      <style>{`
      

        .video-header-bar {
          height: 70px;
          background: linear-gradient(90deg, #2563eb, #1d4ed8);
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 20px;
          box-shadow: 0 8px 25px rgba(0,0,0,0.15);
        }

        .vi-left {
          display: flex;
          align-items: center;
          gap: 14px;
          color: white;
        }

        .vi-logo {
          width: 46px;
          height: 46px;
          border-radius: 14px;
          background: rgba(255,255,255,0.15);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .vi-text {
          display: flex;
          flex-direction: column;
        }

       .vi-title-logo {
  height: 28px;
  object-fit: contain;
  background: #fff;       /* 👈 white background */
  padding: 4px 8px;       /* thoda spacing */
  border-radius: 6px;     /* smooth corners */
}

        .vi-right {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .vi-icon {
          width: 42px;
          height: 42px;
          border-radius: 50%;
          background: rgba(255,255,255,0.15);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          cursor: pointer;
          transition: all 0.25s ease;
        }

        .vi-icon:hover {
          background: white;
          color: #2563eb;
          transform: translateY(-2px);
        }

        /* DROPDOWN */
        .dropdown-menu {
          position: absolute;
          top: 55px;
          right: 0;
          background: white;
          border-radius: 10px;
          min-width: 180px;
          box-shadow: 0 10px 25px rgba(0,0,0,0.2);
          padding: 6px 0;
          z-index: 999;
        }

        .dropdown-item {
          padding: 10px 14px;
          cursor: pointer;
          font-size: 14px;
          display: flex;
          align-items: center;
        }

        .dropdown-item:hover {
          background: #f1f5f9;
        }

        .dropdown-divider {
          margin: 6px 0;
        }
          /* 📱 MOBILE RESPONSIVE */
@media (max-width: 768px) {

  .video-header-bar {
    height: auto;                 /* 🔥 flexible height */
    flex-direction: column;       /* 🔥 stack */
    align-items: flex-start;
    padding: 10px 12px;
    gap: 8px;
  }

  .vi-left {
    width: 100%;
    justify-content: flex-start;
  }

  .vi-logo {
    width: 38px;
    height: 38px;
  }

  .vi-title-logo {
    height: 22px;                 /* 🔥 smaller logo */
    padding: 3px 6px;
  }



  .vi-right {
    width: 100%;
    justify-content: space-between; /* 🔥 spread icons */
    flex-wrap: wrap;                /* 🔥 wrap if needed */
    gap: 6px;
  }

  .vi-icon {
    width: 34px;
    height: 34px;
    font-size: 14px;
  }

  /* dropdown fix */
  .dropdown-menu {
    right: 0;
    left: auto;
  }
}
      `}</style>

      <div className="video-header-wrapper">
        <div className="video-header-bar">

          {/* LEFT */}
          <div className="vi-left">
            <div className="vi-logo">
              <i className="bi bi-camera-video-fill"></i>
            </div>

            <div className="vi-text">
              <img
                src={logoImgae}
                alt="TrackingPath"
                className="vi-title-logo"
              />
          
            </div>
          </div>

          {/* RIGHT */}
          <div className="vi-right">
            {/* ✅ PROFILE DROPDOWN */}
            <div
              className="dropdown"
              ref={profileRef}
              style={{ position: "relative" }}
            >
              <div
                className="vi-icon"
                onClick={() =>
                  setOpenDropdown(openDropdown === "profile" ? null : "profile")
                }
              >
                <i className="bi bi-person"></i>
              </div>

              {openDropdown === "profile" && (
                <ul className="dropdown-menu">
                  
                  <li>
                    <div
                      className="dropdown-item"
                      onClick={() => {
                        setOpenDropdown(null);
                        setOpenLogs(true); // ✅ OPEN LOG MODAL
                      }}
                    >
                      <i className="bi bi-file-earmark-text me-2"></i> Logs
                    </div>
                  </li>

                  <li><hr className="dropdown-divider" /></li>

                  <li>
                    <div
                      className="dropdown-item logout-item"
                      onClick={() => {
                        setOpenDropdown(null);
                        setLogoutModal(true); // ✅ OPEN LOGOUT MODAL
                      }}
                    >
                      <i className="bi bi-box-arrow-right me-2"></i>
                      Logout
                    </div>
                  </li>

                </ul>
              )}
            </div>

          </div>

        </div>
      </div>

      {/* ✅ MODALS (IMPORTANT) */}
      <LogModal
        open={openLogs}
        onClose={() => setOpenLogs(false)}
      />

      <LogoutModal
        open={logoutModal}
        onClose={() => setLogoutModal(false)}
        onConfirm={confirmLogout}
      />
    </>
  );
};

export default VideoHeader;