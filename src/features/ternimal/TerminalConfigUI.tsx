import { useState } from "react";
import "../../assets/css/terminalConfig.css";
type TerminalConfigUIProps = {
  terminalData: any;
  deviceName: any;
  loading: boolean;
};

const TerminalConfigUI = ({
  terminalData,
  deviceName,
  loading,
}: TerminalConfigUIProps) => {
   type SectionType = "video" | "vendor" | "other";

const [openSection, setOpenSection] = useState<SectionType | null>(null);

const toggleSection = (section: SectionType) => {
  setOpenSection(openSection === section ? null : section);
};
 // ✅ Loading handling
  if (loading) {
    return <div style={{ padding: "20px" }}>Loading terminal data...</div>;
  }
  return (
    <div className="page" style={{ maxHeight: "100vh", overflowY: "auto" }}>
      
      {/* Topbar */}
      <div className="topbar">
        <div className="topbar-inner">

          <div className="topbar-left">
            <div className="device-title"> {deviceName || "Vehicle"}</div>
            <div className="device-sub">
               SIM {terminalData?.[0]?.sim || "N/A"} · Device ID {terminalData?.[0]?.deviceId || "N/A"}
            </div>
          </div>

          <div className="topbar-right">
            <span className="terminal-badge terminal-status-online">
              Online
            </span>
            <span className="terminal-badge terminal-badge-primary-custom">
              Huabao Dashcam
            </span>
            <span className="terminal-badge terminal-badge-warning-custom">
              JT808 / JT1078
            </span>
          </div>

        </div>
      </div>

      {/* Metrics */}
    
      <div className="metrics-row">
         
        {[
          ["Reporting Interval", `${terminalData?.[0]?.reportIntervalSec || "-"} sec`],
          ["Maximum Speed", `${terminalData?.[0]?.maxSpeedKph || "-"} km/h`],
          ["Main Server Port", "5015"],
          ["Supported Parameters", "105"],
        ].map((item, i) => (
          <div className="metric-card" key={i}>
            <div className="metric-title">{item[0]}</div>
            <div className="metric-value">{item[1]}</div>
          </div>
        ))}
      </div>

      <div className="main-layout">

        {/* LEFT */}
        <div className="left-panel">
          <div className="card custom-card">

            <div className="section-title">Editable Settings</div>
            <div className="setting-meta" style={{ marginTop: "10px" }}>
  Only safe and commonly used parameters are editable here.
</div>

            {/* ✅ GRID FIX */}
          <div className="settings-grid">
  {[
    ["APN","Mobile internet APN · Param ID 0x0010", terminalData?.[0]?.apn, "text"],
    ["Main Server IP","Primary tracking server · Param ID 0x0013", terminalData?.[0]?.serverIp, "text"],
    ["Main Server Port","Primary communication port · Param ID 0x0018","5015","text"],
    ["Reporting Interval","Location reporting frequency · Param ID 0x0029", terminalData?.[0]?.reportIntervalSec,"sec"],
    ["Turn Angle Threshold","Turn-based reporting sensitivity · Param ID 0x0030", terminalData?.[0]?.turnAngle,"deg"],
    ["Maximum Speed","Speed threshold for the terminal · Param ID 0x0055", terminalData?.[0]?.maxSpeedKph,"km/h"],
    ["Overspeed Duration","Overspeed trigger duration · Param ID 0x0056", terminalData?.[0]?.overspeedDurationSec,"sec"],
  ].map((item, i) => {
    const isReadonly = i < 3; // ✅ first 3 readonly

    return (
      <div key={i}>
        <div className="setting-box">

          <div className="setting-header">
            <div>
              <div className="setting-name">{item[0]}</div>
              <div className="setting-meta">{item[1]}</div>
            </div>

            <span className={`status-tag ${isReadonly ? "status-read" : "status-edit"}`}>
              {isReadonly ? "Read Only" : "Editable"}
            </span>
          </div>

          {item[3] === "text" ? (
            <input
              className={`form-control ${isReadonly ? "readonly-input" : ""}`}
              defaultValue={item[2] || "-"}
              readOnly={isReadonly} // ✅ APPLY HERE
            />
          ) : (
            <div className="input-unit-wrapper">
              <input
                className={`form-control ${isReadonly ? "readonly-input" : ""}`}
                defaultValue={item[2] || "-"}
                readOnly={isReadonly} // ✅ APPLY HERE
              />
              <span className="unit-inside">{item[3]}</span>
            </div>
          )}

        </div>
      </div>
    );
  })}
</div>

           <div className="card-actions" style={{ display: "flex", gap: "10px", marginTop: "14px" }}>
  
  {/* Save Button */}
  <button
    style={{
      backgroundColor: "#007bff",
      color: "#fff",
      border: "1px solid #007bff",
      borderRadius: "8px",
      padding: "6px 14px",
      fontSize: "13px",
      cursor: "pointer",
      transition: "0.2s",
      outline: "none",
      boxShadow: "none"
    }}
    onMouseOver={(e) => {
      e.currentTarget.style.backgroundColor = "#0069d9";
    }}
    onMouseOut={(e) => {
      e.currentTarget.style.backgroundColor = "#007bff";
    }}
  >
    Save Editable Settings
  </button>

  {/* Read Again */}
  <button
    style={{
      backgroundColor: "transparent",
      color: "#007bff",
      border: "1px solid #007bff",
      borderRadius: "8px",
      padding: "6px 14px",
      fontSize: "13px",
      cursor: "pointer",
      transition: "0.2s",
      outline: "none",
      boxShadow: "none"
    }}
    onMouseOver={(e) => {
      e.currentTarget.style.backgroundColor = "#007bff";
      e.currentTarget.style.color = "#fff";
    }}
    onMouseOut={(e) => {
      e.currentTarget.style.backgroundColor = "transparent";
      e.currentTarget.style.color = "#007bff";
    }}
  >
    Read Again
  </button>

  {/* Restart */}
  <button
    style={{
      backgroundColor: "transparent",
      color: "#dc3545",
      border: "1px solid #dc3545",
      borderRadius: "8px",
      padding: "6px 14px",
      fontSize: "13px",
      cursor: "pointer",
      transition: "0.2s",
      outline: "none",
      boxShadow: "none"
    }}
    onMouseOver={(e) => {
      e.currentTarget.style.backgroundColor = "#dc3545";
      e.currentTarget.style.color = "#fff";
    }}
    onMouseOut={(e) => {
      e.currentTarget.style.backgroundColor = "transparent";
      e.currentTarget.style.color = "#dc3545";
    }}
  >
    Restart Device
  </button>

</div>
          </div>
          {/* Read Only */}
<div className="card p-3 mb-3">
          <div className="section-title">Read Only Information</div>
         <div className="setting-meta" style={{ marginTop: "10px" }}>These values are detected from the device but are not editable from the main screen.</div>

          
            <div className="settings-grid">
              <div className="setting-box">
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <div className="setting-name">Local IP</div>
                    <div className="setting-meta">Device-side network address · Param ID 0x0017</div>
                  </div>
                  <span className="status-tag status-read">Read Only</span>
                </div>
                <input className="form-control readonly-input" value={terminalData?.[0]?.localIp } readOnly/>
              </div>                 
              <div className="setting-box">
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <div className="setting-name">Secondary Port</div>
                    <div className="setting-meta">Additional configured port · Param ID 0x0019</div>
                  </div>
                  <span className="status-tag status-read">Read Only</span>
                </div>
                <input className="form-control readonly-input" value="9000" readOnly/>             
              </div>           
              <div className="setting-box">
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <div className="setting-name">Heartbeat Interval</div>
                    <div className="setting-meta">Terminal keep-alive timing · Param ID 0x0001</div>
                  </div>
                  <span className="status-tag status-read">Read Only</span>
                </div>
                <input className="form-control readonly-input" value="60 sec" readOnly/>          
              </div>
            

            
              <div className="setting-box">
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <div className="setting-name">Distance Interval</div>
                    <div className="setting-meta">Distance-based reporting threshold · Param ID 0x002C</div>
                  </div>
                  <span className="status-tag status-read">Read Only</span>
                </div>
                <input className="form-control readonly-input" value="100" readOnly/>             
              </div>
            

           
              <div className="setting-box">
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <div className="setting-name">Sleep Report Interval</div>
                    <div className="setting-meta">Sleep mode reporting interval · Param ID 0x0027</div>
                  </div>
                  <span className="status-tag status-read">Read Only</span>
                </div>
                <input className="form-control readonly-input" value="300 sec" readOnly/>            
              </div>
          

            
              <div className="setting-box mb-0">
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <div className="setting-name">Alarm Report Interval</div>
                    <div className="setting-meta">Alarm reporting interval · Param ID 0x0028</div>
                  </div>
                  <span className="status-tag status-read">Read Only</span>
                </div>
                <input className="form-control readonly-input" value="10 sec" readOnly/>                 
              </div>
            </div>
          
        </div>

{/* Advanced */}
  <div className="card p-3">
            <div className="section-title">Advanced Parameters</div>
          <div className="setting-meta" style={{ marginTop: "10px" }}>Advanced and vendor-specific parameters are shown separately. These are not editable from the normal screen.</div>
            <div className="accordion">

              {/* VIDEO */}
              <div className="accordion-item">
            <button
  onClick={() => toggleSection("video")}
  style={{
    width: "100%",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    background: "#f4f7fb",
    border: "1px solid #e6e9f0",
    borderRadius: "10px",
    padding: "10px 12px",
    fontSize: "13px",
    cursor: "pointer",
     marginBottom:"5px"
  }}
>
  <span>Video & JT1078 Parameters</span>

   <span
    style={{
      transition: "transform 0.3s ease",
      transform: openSection === "video" ? "rotate(180deg)" : "rotate(0deg)"
    }}
  >
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#6c757d"
      strokeWidth="2"
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  </span>
</button>

                {openSection === "video" && (
                  <div className="accordion-body">
                    <table className="table table-sm table-bordered mb-0">
                    <thead>
                      <tr>
                        <th>Param ID</th>
                        <th>Name</th>
                        <th>Status</th>
                        <th>Use</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr><td>0x0075</td><td>Main Stream Configuration</td><td><span className="status-tag status-adv">Advanced</span></td><td>Live/store video configuration</td></tr>
                      <tr><td>0x0076</td><td>Channel Mapping</td><td><span className="status-tag status-adv">Advanced</span></td><td>Audio/video channel list</td></tr>
                      <tr><td>0x0077</td><td>Per Channel Configuration</td><td><span className="status-tag status-adv">Advanced</span></td><td>Single channel stream settings</td></tr>
                      <tr><td>0x0079</td><td>Special Alarm Recording</td><td><span className="status-tag status-adv">Advanced</span></td><td>Alarm recording rules</td></tr>
                      <tr><td>0x007A</td><td>Video Alarm Mask</td><td><span className="status-tag status-adv">Advanced</span></td><td>Alarm mask word</td></tr>
                      <tr><td>0x007B</td><td>Image Analysis Alarm</td><td><span className="status-tag status-adv">Advanced</span></td><td>Passenger/fatigue thresholds</td></tr>
                      <tr><td>0x007C</td><td>Sleep / Wake Settings</td><td><span className="status-tag status-adv">Advanced</span></td><td>Sleep and wake-up rules</td></tr>
                    </tbody>
                  </table>
                  </div>
                )}
              </div>

              {/* VENDOR */}
              <div className="accordion-item">
             <button
  onClick={() => toggleSection("vendor")}
  style={{
    width: "100%",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    background: "#f4f7fb",
    border: "1px solid #e6e9f0",
    borderRadius: "10px",
    padding: "10px 12px",
    fontSize: "13px",
    cursor: "pointer",
     marginBottom:"5px"
  }}
>
  <span>Vendor / AI Parameters</span>

  <span
    style={{
      transition: "transform 0.3s ease",
      transform: openSection === "vendor" ? "rotate(180deg)" : "rotate(0deg)"
    }}
  >
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#6c757d"
      strokeWidth="2"
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  </span>
</button>

                {openSection === "vendor" && (
                  <div className="accordion-body">
                    <table className="table table-sm table-bordered mb-0">
                    <thead>
                      <tr>
                        <th>Param ID</th>
                        <th>Name</th>
                        <th>Status</th>
                        <th>Use</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr><td>0xF364</td><td>ADAS Configuration</td><td><span className="status-tag status-vendor">Vendor</span></td><td>ADAS rules and thresholds</td></tr>
                      <tr><td>0xF365</td><td>DMS Configuration</td><td><span className="status-tag status-vendor">Vendor</span></td><td>Driver monitoring rules</td></tr>
                      <tr><td>0xF366</td><td>Calibration Configuration</td><td><span className="status-tag status-vendor">Vendor</span></td><td>Camera or AI calibration</td></tr>
                      <tr><td>0xF367</td><td>Camera Install Configuration</td><td><span className="status-tag status-vendor">Vendor</span></td><td>Camera installation settings</td></tr>
                      <tr><td>0xF368</td><td>Image Algorithm Configuration</td><td><span className="status-tag status-vendor">Vendor</span></td><td>AI image algorithm config</td></tr>
                      <tr><td>0xF0E9</td><td>Firmware Custom Config</td><td><span className="status-tag status-vendor">Vendor</span></td><td>Firmware-defined block</td></tr>
                      <tr><td>0xFF00</td><td>Debug / Device Control Config</td><td><span className="status-tag status-vendor">Vendor</span></td><td>Diagnostics or custom control</td></tr>
                    </tbody>
                  </table>
                  </div>
                )}
              </div>

              {/* OTHER */}
              <div className="accordion-item">
   <button
  onClick={() => toggleSection("other")}
  style={{
    width: "100%",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    background: "#f4f7fb",
    border: "1px solid #e6e9f0",
    borderRadius: "10px",
    padding: "10px 12px",
    fontSize: "13px",
    cursor: "pointer",
   
  }}
>
  <span>Other Read Only Parameters</span>

  <span
    style={{
      transition: "transform 0.3s ease",
      transform: openSection === "other" ? "rotate(180deg)" : "rotate(0deg)"
    }}
  >
   <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#6c757d"
      strokeWidth="2"
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  </span>
</button>

                {openSection === "other" && (
                  <div className="accordion-body">
                    <table className="table table-sm table-bordered mb-0">
                    <thead>
                      <tr>
                        <th>Param ID</th>
                        <th>Name</th>
                        <th>Status</th>
                        <th>Current Value</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr><td>0x0022</td><td>Driver Not Login Interval</td><td><span className="status-tag status-read">Read Only</span></td><td>30</td></tr>
                      <tr><td>0x002D</td><td>Sleep Distance Interval</td><td><span className="status-tag status-read">Read Only</span></td><td>300</td></tr>
                      <tr><td>0x002E</td><td>Alarm Distance Interval</td><td><span className="status-tag status-read">Read Only</span></td><td>300</td></tr>
                      <tr><td>0x0057</td><td>Continuous Driving Time</td><td><span className="status-tag status-read">Read Only</span></td><td>14400</td></tr>
                      <tr><td>0x0058</td><td>Daily Driving Time</td><td><span className="status-tag status-read">Read Only</span></td><td>57600</td></tr>
                      <tr><td>0x0059</td><td>Minimum Rest Time</td><td><span className="status-tag status-read">Read Only</span></td><td>1200</td></tr>
                      <tr><td>0x005A</td><td>Maximum Parking Time</td><td><span className="status-tag status-read">Read Only</span></td><td>3600</td></tr>
                      <tr><td>0x005B</td><td>Overspeed Warning Difference</td><td><span className="status-tag status-read">Read Only</span></td><td>250</td></tr>
                      <tr><td>0x005C</td><td>Fatigue Driving Time</td><td><span className="status-tag status-read">Read Only</span></td><td>1200</td></tr>
                      <tr><td>0x005D</td><td>Fatigue Rest Time</td><td><span className="status-tag status-read">Read Only</span></td><td>2660</td></tr>
                      <tr><td>0x005E</td><td>Fatigue Warning Time</td><td><span className="status-tag status-read">Read Only</span></td><td>30</td></tr>
                      <tr><td>0x0080</td><td>Device Mode</td><td><span className="status-tag status-read">Read Only</span></td><td>3</td></tr>
                      <tr><td>0x0090</td><td>Sensor Config 1</td><td><span className="status-tag status-read">Read Only</span></td><td>4</td></tr>
                      <tr><td>0x0100</td><td>Extended Device Config 1</td><td><span className="status-tag status-read">Read Only</span></td><td>0</td></tr>
                    </tbody>
                  </table>
                  </div>
                )}
              </div>

            </div>
          </div>
        </div>

        {/* RIGHT */}
        <div className="right-panel">

          <div className="card custom-card">
            <div className="section-title">Quick Summary</div>

            <table className="table table-bordered">
              <tbody>
                <tr><th>APN</th><td>{terminalData?.[0]?.apn || "-"}</td></tr>
                <tr><th>Main Server IP</th><td>{terminalData?.[0]?.serverIp || "-"}</td></tr>
                <tr><th>Local IP</th><td>{terminalData?.[0]?.localIp || "-"}</td></tr>
                <tr><th>Main Port</th><td>5015</td></tr>
                <tr><th>Secondary Port</th><td>9000</td></tr>
                <tr><th>Reporting Interval</th><td> {terminalData?.[0]?.reportIntervalSec || "-"} sec</td></tr>
                <tr><th>Turn Angle</th><td>{terminalData?.[0]?.turnAngle || "-"}°</td></tr>
                <tr><th>Max Speed</th><td>{terminalData?.[0]?.maxSpeedKph || "-"} km/h</td></tr>
                <tr><th>Overspeed Duration</th><td>{terminalData?.[0]?.overspeedDurationSec || "-"} sec</td></tr>
              </tbody>
            </table>
          </div>

          <div className="card custom-card">
            <div className="section-title"  style={{  marginBottom: "14px" }}>Parameter Status Guide</div>

            <div className="status-list">
              <div  style={{  marginBottom: "10px" }}><span className="status-tag status-edit">Editable</span> Can be changed safely</div>
              <div  style={{  marginBottom: "10px" }}><span className="status-tag status-read">Read Only</span> Device values</div>
              <div  style={{  marginBottom: "10px" }}><span className="status-tag status-adv">Advanced</span> Technical</div>
              <div  style={{  marginBottom: "10px" }}><span className="status-tag status-vendor">Vendor</span> Vendor config</div>
            </div>
          </div>
{/* Actions */}
  <div className="card p-3">
  <div className="section-title" style={{ marginBottom: "10px" }}>Actions</div>

  <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>

    {/* Save */}
    <button
    style={{
      backgroundColor: "#007bff",
      color: "#fff",
      border: "1px solid #007bff",
      borderRadius: "8px",
      padding: "6px 14px",
      fontSize: "13px",
      cursor: "pointer",
      transition: "0.2s",
      outline: "none",
      boxShadow: "none"
    }}
    onMouseOver={(e) => {
      e.currentTarget.style.backgroundColor = "#0069d9";
    }}
    onMouseOut={(e) => {
      e.currentTarget.style.backgroundColor = "#007bff";
    }}
  >
      Save Editable Settings
    </button>

    {/* Read Again */}
    <button
      style={{
        width: "100%",
        backgroundColor: "transparent",
        color: "#007bff",
        border: "1px solid #007bff",
        borderRadius: "8px",
        padding: "8px",
        fontSize: "13px",
        cursor: "pointer",
        transition: "0.2s",
        outline: "none"
      }}
      onMouseOver={(e) => {
        e.currentTarget.style.backgroundColor = "#007bff";
        e.currentTarget.style.color = "#fff";
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.backgroundColor = "transparent";
        e.currentTarget.style.color = "#007bff";
      }}
    >
      Read Settings Again
    </button>

    {/* Export */}
    <button
      style={{
        width: "100%",
        backgroundColor: "transparent",
        color: "#6c757d",
        border: "1px solid #6c757d",
        borderRadius: "8px",
        padding: "8px",
        fontSize: "13px",
        cursor: "pointer",
        transition: "0.2s",
        outline: "none"
      }}
      onMouseOver={(e) => {
        e.currentTarget.style.backgroundColor = "#6c757d";
        e.currentTarget.style.color = "#fff";
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.backgroundColor = "transparent";
        e.currentTarget.style.color = "#6c757d";
      }}
    >
      Export Settings
    </button>

    {/* Restart */}
    <button
      style={{
        width: "100%",
        backgroundColor: "transparent",
        color: "#dc3545",
        border: "1px solid #dc3545",
        borderRadius: "8px",
        padding: "8px",
        fontSize: "13px",
        cursor: "pointer",
        transition: "0.2s",
        outline: "none"
      }}
      onMouseOver={(e) => {
        e.currentTarget.style.backgroundColor = "#dc3545";
        e.currentTarget.style.color = "#fff";
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.backgroundColor = "transparent";
        e.currentTarget.style.color = "#dc3545";
      }}
    >
      Restart Device
    </button>

  </div>

          <div className="setting-meta" style={{ marginTop: "10px" }}>
            Only the editable section should generate `0x8103` update commands. Read only, advanced, and vendor sections should not be modified unless you explicitly support them.
          </div>
        </div>
        </div>

      </div>
    </div>
  );
};

export default TerminalConfigUI;
