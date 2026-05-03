// Footer.tsx
import { NavLink } from "react-router-dom";

/** ✅ SINGLE SOURCE OF TRUTH (Header bhi yahi use karega) */
export const NAV_LINKS = [
  { label: "Home", path: "/home" },
  { label: "Pricing", path: "/pricing" },
  { label: "Supported Devices", path: "/supported-devices" },
  { label: "How it Works", path: "/how-it-works" },
  { label: "Contact", path: "/contact" },
  { label: "Login", path: "/login" },
];

const Footer = () => {
  const footerStyle: React.CSSProperties = {
    background: "#f0f2f6",
    padding: "25px 0",
    fontSize: "14px",
    borderTop: "1px solid #e5e7eb",
    marginTop: "40px",
  };

  const containerStyle: React.CSSProperties = {
    width: "90%",
    maxWidth: "1200px",
    margin: "0 auto",
  };

  const footerContentStyle: React.CSSProperties = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
  };

  const footerLinksStyle: React.CSSProperties = {
    display: "flex",
    gap: "18px",
    flexWrap: "wrap",
  };

  const linkStyle: React.CSSProperties = {
    textDecoration: "none",
    color: "#374151",
  };

  const activeStyle: React.CSSProperties = {
    fontWeight: 700,
    color: "#2563eb",
  };

  return (
    <footer style={footerStyle}>
      <div style={containerStyle}>
        <div style={footerContentStyle}>
          <div>© 2026 AVSG Info Systems Pvt Ltd · TrackingPath</div>

          <div style={footerLinksStyle}>
            {NAV_LINKS.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                style={({ isActive }) =>
                  isActive ? { ...linkStyle, ...activeStyle } : linkStyle
                }
              >
                {link.label}
              </NavLink>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
