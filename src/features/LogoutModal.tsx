import React from "react";
import ReactDOM from "react-dom";

interface LogoutModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const LogoutModal: React.FC<LogoutModalProps> = ({ open, onClose, onConfirm }) => {
  if (!open) return null;

  return ReactDOM.createPortal(
    <div style={overlayStyle}>
      <div style={boxStyle}>
        {/* Header */}
        <div style={headerStyle}>
          <div style={headerLeft}>
            <i className="fas fa-sign-out-alt" style={{ marginRight: 8 }}></i>
            <span>Logout</span>
          </div>
          <span style={closeStyle} onClick={onClose}>×</span>
        </div>

        {/* Body */}
        <div style={bodyStyle}>
          <p style={textStyle}>
            Are you sure you want to logout from your account?
          </p>

          <div style={actionsStyle}>
            <div style={noBtnStyle} onClick={onClose}>
              Cancel
            </div>

           <div style={yesBtnStyle} onClick={onConfirm}>
  Yes,&nbsp;&nbsp;Logout
</div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default LogoutModal;

/* ================= PREMIUM STYLES ================= */

const overlayStyle: React.CSSProperties = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.55)",
  backdropFilter: "blur(4px)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 99999,
};

const boxStyle: React.CSSProperties = {
  width: "380px",
  background: "linear-gradient(180deg, #ffffff 0%, #fafafa 100%)",
  borderRadius: "14px",
  overflow: "hidden",
  boxShadow: "0 15px 40px rgba(0,0,0,0.35)",
  animation: "premiumZoom 0.28s ease",
};

const headerStyle: React.CSSProperties = {
  background: "linear-gradient(135deg, #2563eb, #3b82f6)",
  color: "#fff",
  padding: "14px 18px",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  fontSize: "18px",
  fontWeight: 600,
};

const headerLeft: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
};

const closeStyle: React.CSSProperties = {
  cursor: "pointer",
  fontSize: "22px",
  fontWeight: "bold",
  lineHeight: 1,
};

const bodyStyle: React.CSSProperties = {
  padding: "26px 22px 24px",
  textAlign: "center",
};

const textStyle: React.CSSProperties = {
  fontSize: "16px",
  color: "#333",
  lineHeight: 1.5,
};

const actionsStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "center",
  gap: "16px",
  marginTop: "26px",
};

const noBtnStyle: React.CSSProperties = {
  padding: "10px 24px",
  borderRadius: "8px",
  background: "#f1f1f1",
  color: "#333",
  cursor: "pointer",
  fontWeight: 500,
};

const yesBtnStyle: React.CSSProperties = {
  padding: "10px 26px",
  borderRadius: "8px",
  background: "linear-gradient(135deg, #2563eb, #3b82f6)",
  color: "#fff",
  cursor: "pointer",
  fontWeight: 600,
  boxShadow: "0 6px 14px rgba(41, 73, 216, 0.4)",
};