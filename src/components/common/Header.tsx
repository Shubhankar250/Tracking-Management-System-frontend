import { useEffect, useRef, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { FaBars, FaTimes } from "react-icons/fa";

const Header = () => {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const menuRef = useRef<HTMLDivElement>(null); // 🔥 for outside click
 const [toolsOpen, setToolsOpen] = useState(false); 
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // ✅ OUTSIDE CLICK CLOSE
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };

    if (menuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuOpen]);

  const headerStyle: React.CSSProperties = {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "60px",
    display: "flex",
    alignItems: "center",
    background: "rgba(255,255,255,0.92)",
    backdropFilter: "blur(10px)",
    transition: "all 0.3s ease",
    zIndex: 1000,
    boxShadow: scrolled ? "0 4px 12px rgba(0,0,0,0.08)" : "none",
  };

 const containerStyle: React.CSSProperties = {
  width: "100%",
  padding: "0 20px", // thoda spacing left/right
};
  const navStyle: React.CSSProperties = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  };

  const logoStyle: React.CSSProperties = {
    fontWeight: 700,
    color: "#2563eb",
    fontSize: "18px",
  };

  const navLinksStyle: React.CSSProperties = {
    display: "flex",
    gap: "10px",
    alignItems: "center",
  };

  const mobileMenuStyle: React.CSSProperties = {
    position: "absolute",
    top: "60px",
    right: "10px",
    background: "white",
    display: menuOpen ? "flex" : "none",
    flexDirection: "column",
    gap: "10px",
    padding: "15px",
    borderRadius: "10px",
    boxShadow: "0 10px 20px rgba(0,0,0,0.1)",
    width: "100px",
  };
  const dropdownStyle: React.CSSProperties = {
    position: "absolute",
    top: "45px",
    background: "white",
    borderRadius: "8px",
    boxShadow: "0 8px 20px rgba(0,0,0,0.1)",
    display: "flex",
    flexDirection: "column",
    padding: "10px",
      gap: "8px",
  };

  const linkStyle = (isActive: boolean): React.CSSProperties => ({
    fontSize: "14px",
    textDecoration: "none",
    padding: "8px 14px",
    borderRadius: "8px",
    border: "1px solid #2563eb",
    color: isActive ? "white" : "#2563eb",
    background: isActive ? "#2563eb" : "transparent",
    transition: "0.2s",
    textAlign: "center",
  });

  const primaryButtonStyle: React.CSSProperties = {
    background: "#2563eb",
    color: "white",
    border: "none",
    padding: "8px 16px",
    borderRadius: "8px",
    cursor: "pointer",
  };
useEffect(() => {
  const handleClickOutside = (event: MouseEvent) => {
    if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
      setToolsOpen(false);
    }
  };

  document.addEventListener("mousedown", handleClickOutside);
  return () => document.removeEventListener("mousedown", handleClickOutside);
}, []);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
const toggleTools = () => {
  setToolsOpen((prev) => !prev);
};
useEffect(() => {
  const handleResize = () => {
    setIsMobile(window.innerWidth < 768);
  };

  window.addEventListener("resize", handleResize);

  return () => window.removeEventListener("resize", handleResize);
}, []);

  // ✅ CLOSE MENU FUNCTION
  const handleCloseMenu = () => setMenuOpen(false);

  return (
    <header style={headerStyle}>
      <div style={containerStyle}>
        <div style={navStyle}>
          <div style={logoStyle}>TRACKINGPATH</div>

          {/* DESKTOP */}
          {!isMobile && (
            <nav style={navLinksStyle}>
              <NavLink to="/home" style={({ isActive }) => linkStyle(isActive)}>Home</NavLink>
              <NavLink to="/pricing" style={({ isActive }) => linkStyle(isActive)}>Pricing</NavLink>
              <NavLink to="/supported-devices" style={({ isActive }) => linkStyle(isActive)}>Supported Devices</NavLink>
              <NavLink to="/how-it-works" style={({ isActive }) => linkStyle(isActive)}>How it Works</NavLink>
              <NavLink to="/contact" style={({ isActive }) => linkStyle(isActive)}>Contact</NavLink>
              
              {/* ✅ TOOLS DROPDOWN */}
            <div style={{ position: "relative" }} ref={menuRef}>
<NavLink
  to="#"
  style={({ }) => ({
    ...linkStyle(
      location.pathname === "/dashcam-4g-data-usage-calculator" ||
      location.pathname === "/dashcam-storage-calculator"
    ),
    cursor: "pointer",
  })}
  onClick={(e) => {
    e.preventDefault();
    toggleTools();
  }}
>
  Tools
</NavLink>

              {toolsOpen && (
  <div style={dropdownStyle}>
    <NavLink
      to="/dashcam-4g-data-usage-calculator"
      style={({ isActive }) => linkStyle(isActive)}
      onClick={() => setToolsOpen(false)}
    >
      Dashcam 4G Data Usage Calculator
    </NavLink>

    <NavLink
      to="/dashcam-storage-calculator"
      style={({ isActive }) => linkStyle(isActive)}
      onClick={() => setToolsOpen(false)}
    >
      Dashcam Storage Calculator
    </NavLink>
  </div>
)}
              </div>

              <NavLink to="/login" style={({ isActive }) => linkStyle(isActive)}>Login</NavLink>

              <button style={primaryButtonStyle} onClick={() => navigate("/contact")}>
                Book a Demo
              </button>
            </nav>
          )}

          {/* MOBILE ICON */}
          {isMobile && (
            <div style={{ fontSize: "20px", cursor: "pointer" }} onClick={() => setMenuOpen(!menuOpen)}>
              {menuOpen ? <FaTimes /> : <FaBars />}
            </div>
          )}
        </div>

        {/* MOBILE MENU */}
        {isMobile && (
          <div style={mobileMenuStyle} ref={menuRef}>
            <NavLink to="/home" style={({ isActive }) => linkStyle(isActive)} onClick={handleCloseMenu}>Home</NavLink>
            <NavLink to="/pricing" style={({ isActive }) => linkStyle(isActive)} onClick={handleCloseMenu}>Pricing</NavLink>
            <NavLink to="/supported-devices" style={({ isActive }) => linkStyle(isActive)} onClick={handleCloseMenu}>Supported Devices</NavLink>
            <NavLink to="/how-it-works" style={({ isActive }) => linkStyle(isActive)} onClick={handleCloseMenu}>How it Works</NavLink>
            <NavLink to="/contact" style={({ isActive }) => linkStyle(isActive)} onClick={handleCloseMenu}>Contact</NavLink>
   <div>
              <div onClick={() => setToolsOpen(!toolsOpen)} style={linkStyle(false)}>
                Tools
              </div>

              {toolsOpen && (
                <div style={{ marginTop: "5px" }}>
                  <NavLink to="/dashcam-4g-data-usage-calculator" style={({ isActive }) => linkStyle(isActive)} onClick={handleCloseMenu}>
                   Dashcam 4G Data Usage Calculator
                  </NavLink>
                  <NavLink to="/dashcam-storage-calculator" style={({ isActive }) => linkStyle(isActive)} onClick={handleCloseMenu}>
                  Dashcam Storage Calculator
                  </NavLink>
                </div>
              )}
            </div>            <NavLink to="/login" style={({ isActive }) => linkStyle(isActive)} onClick={handleCloseMenu}>Login</NavLink>

            <button
              style={primaryButtonStyle}
              onClick={() => {
                navigate("/contact");
                handleCloseMenu(); // 🔥 close after click
              }}
            >
              Book a Demo
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;