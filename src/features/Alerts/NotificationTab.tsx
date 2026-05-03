import React from "react";
import "../../assets/css/alertsStyles.css";

export type NotificationState = {
  color: boolean;
  colorValue: string;

  ignore: boolean;
  ignoreValue: string;

  sound: boolean;
  soundValue: string;

  popup: boolean;
  popupValue: string;

  appPush: boolean;

  email: boolean;
  emailValue: string;

  webhook: boolean;
  webhookValue: string;
};

interface NotificationTabProps {
  value: NotificationState | null;
  onChange: (val: NotificationState) => void;
   errors: {
    globalError: string,
    colorValue: string;
    ignoreValue: string;
    soundValue: string;
    popupValue: string;
    emailValue: string;
    webhookValue: string;
  };
}

export default function NotificationTab({
  value,
  onChange,
  errors,
}: NotificationTabProps) {
  // fallback defaults
  const state: NotificationState =
    value ?? {
      color: false,
      colorValue: "#000000",

      ignore: false,
      ignoreValue: "",

      sound: true,
      soundValue: "Hint",

      popup: true,
      popupValue: "10s",

      appPush: true,

      email: false,
      emailValue: "",

      webhook: false,
      webhookValue: "",
    };

  // toggle helper
  const toggle = (key: keyof NotificationState) => {
    onChange({ ...state, [key]: !state[key] });
  };

  // value updater
  const update = <K extends keyof NotificationState>(
    key: K,
    val: NotificationState[K]
  ) => {
    onChange({ ...state, [key]: val });
  };

  const inputStyle = (enabled: boolean): React.CSSProperties => ({
    background: enabled ? "#fff" : "#e9ecef",
    color: enabled ? "#000" : "#6c757d",
  });

  return (
    <div>
      {errors.globalError && (
  <div
    className="text-danger"
    style={{ fontSize: 13, marginBottom: 10, fontWeight: 500 }}
  >
    {errors.globalError}
  </div>
)}
      {/* COLOR */}
      <Row>
            <div className="alert-label">
                  <Check
                    checked={state.color}
                    onChange={() => toggle("color")}
                    label="Color notification"
                  />
            </div>
        
                <input
                  type="color"
                  value={state.colorValue}
                  disabled={!state.color}
                  className="alert-input"
                  style={{ ...inputStyle(state.color), height: 40 }}
                  onChange={(e) => update("colorValue", e.target.value)}
                />
            {errors.colorValue && (
              <div className="text-danger" style={{ fontSize: 12 }}>
                {errors.colorValue}
              </div>
            )}
      </Row>

      {/* IGNORE */}
<Row>
  <div className="alert-label">
  <Check
    checked={state.ignore}
    onChange={() => toggle("ignore")}
    label="Ignore notification"
  />
</div>
  <input
  type="text"
  inputMode="numeric"
  value={state.ignoreValue}
  disabled={!state.ignore}
  className="alert-input"
  placeholder="Ignore value"
  style={inputStyle(state.ignore)}
  onChange={(e) => {
    const val = e.target.value;

    if (/^\d*$/.test(val)) {
      update("ignoreValue", val);
    }
  }}
/>
{/* ✅ ERROR */}
  {errors.ignoreValue && (
    <div className="text-danger" style={{ fontSize: 12 }}>
      {errors.ignoreValue}
    </div>
  )}
</Row>


      {/* SOUND */}
      <Row>
        <div className="alert-label">        
          <Check
          checked={state.sound}
          onChange={() => toggle("sound")}
          label="Sound notification"
        />
        </div>
        <select
          value={state.soundValue}
          disabled={!state.sound}
          className="alert-select"
          style={inputStyle(state.sound)}
          onChange={(e) => update("soundValue", e.target.value)}
        >
          <option>Hint</option>
          <option>Alarm</option>
          <option>Beep</option>
          <option>Beep 2</option>
        </select>
        {/* ✅ ERROR */}
  {errors.soundValue && (
    <div className="text-danger" style={{ fontSize: 12 }}>
      {errors.soundValue}
    </div>
  )}
      </Row>

      {/* POPUP */}
      <Row>
        <div className="alert-label">
        <Check
          checked={state.popup}
          onChange={() => toggle("popup")}
          label="Popup notification"
        />
        </div>
        <select
          value={state.popupValue}
          disabled={!state.popup}
          className="alert-select"
          style={inputStyle(state.popup)}
          onChange={(e) => update("popupValue", e.target.value)}
        >
          <option>10s</option>
          <option>Sticky</option>
          <option>5s</option>
        </select>
         {/* ✅ ERROR */}
  {errors.popupValue && (
    <div className="text-danger" style={{ fontSize: 12 }}>
      {errors.popupValue}
    </div>
  )}
      </Row>

      {/* APP PUSH */}
      <Row>
        <div className="alert-label">
        <Check
          checked={state.appPush}
          onChange={() => toggle("appPush")}
          label="App push notification"
        />
        </div>
      </Row>

      {/* EMAIL */}
      <Row>
        <div className="alert-label">
        <Check
          checked={state.email}
          onChange={() => toggle("email")}
          label="Email notification"
        />
        </div>
        <input
          type="text"
          value={state.emailValue}
          disabled={!state.email}
          className="alert-input"
          placeholder="email@example.com"
          style={inputStyle(state.email)}
          onChange={(e) => update("emailValue", e.target.value)}
        />
         {/* ✅ ERROR */}
  {errors.emailValue && (
    <div className="text-danger" style={{ fontSize: 12 }}>
      {errors.emailValue}
    </div>
  )}
      </Row>
      <small>Email will receive alert messages</small>

      {/* WEBHOOK */}
      <Row>
        <div className="alert-label">
        <Check
          checked={state.webhook}
          onChange={() => toggle("webhook")}
          label="Webhook notification"
        />
        </div>
        <input
          type="text"
          value={state.webhookValue}
          disabled={!state.webhook}
          className="alert-input"
          placeholder="Webhook URL"
          style={inputStyle(state.webhook)}
          onChange={(e) => update("webhookValue", e.target.value)}
        />
        {/* ✅ ERROR */}
  {errors.webhookValue && (
    <div className="text-danger" style={{ fontSize: 12 }}>
      {errors.webhookValue}
    </div>
  )}
      </Row>
      <small>Webhook endpoint for alert events</small>
    </div>
  );
}

/* helpers */
const Row: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      gap: 12,
      marginBottom: 14,
      flexWrap: "wrap",
    }}
  >
    {children}
  </div>
);

const Check: React.FC<{
  checked: boolean;
  onChange: () => void;
  label: string;
}> = ({ checked, onChange, label }) => (
  <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
    <input
      type="checkbox"
      checked={checked}
      onChange={onChange}
    />
    {label}
  </label>
);
