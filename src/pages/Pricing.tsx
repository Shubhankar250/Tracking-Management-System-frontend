import React from "react";
import {TbCalendar, TbDeviceDesktop, TbLogin } from "react-icons/tb";
import "../assets/css/Pricing.css";

const Pricing: React.FC = () => {
  return (
    <div className="pr-page">
      <div className="pr-container">

        {/* HEADER */}
        <div className="pr-header">
               <div className="pr-badge mb-3"><span className="dot"></span> Simple plans • Upgrade anytime</div>


          <h1>Pricing</h1>
          <p>Starter, Business, and Enterprise plans for every fleet size.</p>
        </div>

        {/* TOP GRID */}
        <div className="pr-grid">

          {/* STARTER */}
          <div className="pr-card pr-accent">
            <div className="pr-chip blue">Best for small fleets</div>

            <h3>Starter</h3>
            <p className="pr-muted">
              Live tracking essentials for teams getting started.
            </p>

            <h4>Pricing</h4>
            <h2>₹ —</h2>
            <p className="pr-muted">Plan-based • Contact for quote</p>

            <ul className="pr-list">
              <li>Live tracking dashboard</li>
              <li>Vehicle history & playback</li>
              <li>Geofence (basic)</li>
              <li>Standard alerts</li>
              <li>Basic reports</li>
            </ul>

            <button className="pr-btn-outline">Request Quote</button>
          </div>

          {/* BUSINESS */}
          <div className="pr-card pr-accent pr-highlight">
            <div className="pr-chip">Most popular</div>

            <h3>Business</h3>
            <p className="pr-muted">
              Advanced control, analytics, and teams access.
            </p>

            <h4>Pricing</h4>
            <h2>₹ —</h2>
            <p className="pr-muted">Plan-based • Contact for quote</p>

            <ul className="pr-list">
              <li>Everything in Starter</li>
              <li>Advanced reports & exports</li>
              <li>Driver/vehicle profiling</li>
              <li>Role-based users</li>
              <li>Groups, alerts & automation</li>
              <li>Priority support</li>
            </ul>

            <button className="pr-btn-primary">
              <TbCalendar style={{ marginRight: 6 }} />
              Book a Demo
            </button>
          </div>

          {/* ENTERPRISE */}
          <div className="pr-card pr-accent">
            <div className="pr-chip red">Custom</div>

            <h3>Enterprise</h3>
            <p className="pr-muted">
              For government, large fleets, and custom integrations.
            </p>

            <h4>Pricing</h4>
            <h2>Custom</h2>
            <p className="pr-muted">
              SLA • Integrations • Dedicated onboarding
            </p>

            <ul className="pr-list">
              <li>Everything in Business</li>
              <li>API integrations / SSO (optional)</li>
              <li>Custom reports & dashboards</li>
              <li>Video telematics (optional)</li>
              <li>Dedicated account manager</li>
              <li>Enterprise support & SLA</li>
            </ul>

            <button className="pr-btn-outline">
              Talk to Sales
            </button>
          </div>
        </div>

        {/* FAQ */}
        <div className="pr-card pr-accent pr-bottom">
          <h3>Pricing FAQs</h3>

          <div className="pr-bottom-grid">

            <div>
              <h4>Do you provide a demo?</h4>
              <p className="pr-muted">
                Yes. We can show live tracking, reports, and workflows as per your use-case.
              </p>
            </div>

            <div>
              <h4>Can we start small and upgrade later?</h4>
              <p className="pr-muted">
                Yes. Plans can be upgraded anytime as your fleet grows.
              </p>
            </div>

            <div>
              <h4>Do you support devices we already have?</h4>
              <p className="pr-muted">
                Yes. Check devices page or ask our team for compatibility.
              </p>
            </div>

          </div>

          <div className="pr-btn-row">
            <button className="pr-btn-primary">
              <TbCalendar style={{ marginRight: 6 }} />
              Book Demo
            </button>

            <button className="pr-btn-outline">
              <TbDeviceDesktop style={{ marginRight: 6 }} />
              Supported Devices
            </button>

            <button className="pr-btn-outline">
              <TbLogin style={{ marginRight: 6 }} />
              Login
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Pricing;
