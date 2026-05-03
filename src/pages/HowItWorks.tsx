import React from "react";
import "../assets/css/how.css";
import { FiTool, FiSettings, FiTrendingUp, FiCalendar, FiLogIn } from "react-icons/fi";

const HowItWorks: React.FC = () => {
  return (
    <section className="how-section">

      {/* TOP BADGE */}
      <div className="how-badge">⚙️ Simple onboarding</div>

      {/* TITLE */}
      <h2 className="how-title">How TrackingPath Works</h2>
      <p className="how-sub">
        From device installation to live tracking in a few steps.
      </p>

      {/* 3 CARDS */}
      <div className="how-grid">

        {/* CARD 1 */}
        <div className="how-card">
          <div className="how-icon blue"><FiTool /></div>
          <h3>1) Install Device</h3>
          <p>
            Install GPS tracker / dashcam and ensure SIM + power connectivity.
          </p>

          <hr />

          <h4>Includes:</h4>
          <ul>
            <li>Wiring & calibration</li>
            <li>SIM network verification</li>
            <li>Basic health checks</li>
          </ul>
        </div>

        {/* CARD 2 */}
        <div className="how-card">
          <div className="how-icon red"><FiSettings /></div>
          <h3>2) Configure Platform</h3>
          <p>
            Add vehicles, drivers, groups, alerts, geofence and roles.
          </p>

          <hr />

          <h4>Configure:</h4>
          <ul>
            <li>Overspeed / ignition alerts</li>
            <li>Geofence zones</li>
            <li>Reports & schedules</li>
          </ul>
        </div>

        {/* CARD 3 */}
        <div className="how-card">
          <div className="how-icon blue"><FiTrendingUp /></div>
          <h3>3) Track & Improve</h3>
          <p>
            Track live, analyse trips, reduce idle time and improve efficiency.
          </p>

          <hr />

          <h4>Monitor:</h4>
          <ul>
            <li>Live map & playback</li>
            <li>Trips / idle / stoppage</li>
            <li>Events & compliance</li>
          </ul>
        </div>

      </div>

      {/* BOTTOM CTA CARD */}
      <div className="how-cta">
        <div>
          <h3>Need custom workflow?</h3>
          <p>
            We support custom dashboards, device integrations, video telematics,
            and project-specific compliance reporting.
          </p>
        </div>

        <div className="how-cta-btns">
          <button className="btn-primary">
            <FiCalendar /> Book Demo
          </button>

          <button className="btn-outline">
            <FiLogIn /> Login
          </button>
        </div>
      </div>

    </section>
  );
};

export default HowItWorks;
