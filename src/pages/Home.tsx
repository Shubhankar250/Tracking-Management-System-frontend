
import "../assets/css/home.css";
import {
  FaCalendarAlt,
  FaGraduationCap,
  FaMapMarkedAlt,
  FaRecycle,
  FaSignInAlt,
  FaVideo,
} from "react-icons/fa";

const Home = () => {
  return (
    <div className="home">
     

      {/* HERO SECTION */}
      <section className="hero">
        <div className="container hero-grid">
          <div className="hero-text">
            <div className="tp-pill mb-3"><span className="dot"></span> Real-time GPS Tracking • Alerts • Reports</div>

            <h1>
              GPS Tracking & Telematics Platform for Fleets, Schools &
              Government
            </h1>

            <p>
              TrackingPath helps you track vehicles live, monitor driver
              behavior, manage routes, and generate compliance-ready reports.
            </p>

            <div className="hero-buttons">
              <button className="btn-primary">Start Tracking</button>
              <button className="btn-outline">How it Works</button>
              <button className="btn-outline">View Pricing</button>
            </div>

            <div className="hero-meta">
              <span>Secure access</span>
              <span>Fast setup</span>
              <span>Multi-tenant ready</span>
            </div>
          </div>

          <div className="tp-illus-wrap">
            <svg
              viewBox="0 0 980 380"
              width="100%"
              xmlns="http://www.w3.org/2000/svg"
              role="img"
              aria-label="Tracking illustration"
            >
              <defs>
                <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stop-color="#EEF6FF" />
                  <stop offset="1" stop-color="#FFFFFF" />
                </linearGradient>
                <filter
                  id="shadow"
                  x="-30%"
                  y="-30%"
                  width="160%"
                  height="180%"
                >
                  <feDropShadow
                    dx="0"
                    dy="14"
                    stdDeviation="12"
                    flood-color="#0F172A"
                    flood-opacity=".10"
                  />
                </filter>
              </defs>
              <rect
                x="0"
                y="0"
                width="980"
                height="380"
                rx="18"
                fill="url(#bg)"
              />
              <path
                id="route"
                d="M70 250 C 180 170, 280 300, 390 220 S 580 120, 690 205 S 830 310, 930 210"
                fill="none"
                stroke="#0B63D1"
                stroke-opacity=".32"
                stroke-width="4"
                stroke-dasharray="6 12"
              />
              <circle r="6" fill="#0B63D1">
                <animateMotion
                  dur="5.2s"
                  repeatCount="indefinite"
                  path="M70 250 C 180 170, 280 300, 390 220 S 580 120, 690 205 S 830 310, 930 210"
                />
                <animate
                  attributeName="r"
                  values="5;7;5"
                  dur="1.2s"
                  repeatCount="indefinite"
                />
              </circle>
              <g transform="translate(260 185)" filter="url(#shadow)">
                <path
                  d="M0 0c0-18 14-32 32-32s32 14 32 32c0 22-32 58-32 58S0 22 0 0Z"
                  fill="#0B63D1"
                />
                <circle cx="32" cy="0" r="10" fill="#fff" opacity=".98" />
              </g>
              <g transform="translate(610 120)" filter="url(#shadow)">
                <path
                  d="M0 0c0-18 14-32 32-32s32 14 32 32c0 22-32 58-32 58S0 22 0 0Z"
                  fill="#EF4444"
                />
                <circle cx="32" cy="0" r="10" fill="#fff" opacity=".98" />
              </g>
              <g transform="translate(320 255)" filter="url(#shadow)">
                <rect
                  x="0"
                  y="18"
                  width="260"
                  height="78"
                  rx="18"
                  fill="#FFFFFF"
                />
                <rect
                  x="20"
                  y="36"
                  width="130"
                  height="42"
                  rx="12"
                  fill="#0B63D1"
                  opacity=".10"
                />
                <rect
                  x="160"
                  y="38"
                  width="80"
                  height="40"
                  rx="12"
                  fill="#FFFFFF"
                />
                <rect
                  x="18"
                  y="54"
                  width="220"
                  height="12"
                  rx="6"
                  fill="#EF4444"
                  opacity=".14"
                />
                <circle cx="78" cy="100" r="18" fill="#0F172A" opacity=".18" />
                <circle cx="198" cy="100" r="18" fill="#0F172A" opacity=".18" />
                <circle cx="78" cy="100" r="10" fill="#475569" opacity=".55" />
                <circle cx="198" cy="100" r="10" fill="#475569" opacity=".55" />
                <animateTransform
                  attributeName="transform"
                  attributeType="XML"
                  type="translate"
                  values="320 255; 320 251; 320 255"
                  dur="2.6s"
                  repeatCount="indefinite"
                />
              </g>
            </svg>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="features">
        <div className="container feature-grid">
          <div className="feature-card tp-accent">
            <h3 className="feature-title">
              <span className="icon-circle green">
                <FaMapMarkedAlt />
              </span>
              Fleet Tracking
            </h3>

            <p>Live map, history, routes, and alerts.</p>
            <button className="btn-outline">Learn More</button>
          </div>

          <div className="feature-card tp-accent">
              <h3 className="feature-title">
              <span className="icon-circle red">
                <FaVideo />
              </span>
              Video Telematics
            </h3>
           
            <p>Live view, playback, AI events, evidence.</p>
            <button className="btn-outline">Get Demo</button>
          </div>

          <div className="feature-card tp-accent">
            <h3 className="feature-title">
              <span className="icon-circle blue">
                <FaGraduationCap />
              </span>
              School Bus
            </h3>

            <p>Parent app, ETA, RFID, safety alerts.</p>
            <button className="btn-outline">See Plans</button>
          </div>

          <div className="feature-card tp-accent">
              <h3 className="feature-title">
              <span className="icon-circle orange">
                <FaRecycle />
              </span>
               Smart SWM
            </h3>
          
            <p>Route coverage, POIs, compliance dashboards.</p>
            <button className="btn-outline">Talk to Sales</button>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta">
        <div className="container cta-box">
          <div>
            <h3>Ready to start tracking?</h3>
            <p>Login to your account or request a demo for your fleet.</p>
          </div>

        <div className="cta-buttons">
  <button className="btn-light">
    <FaSignInAlt style={{ marginRight: "8px" }} />
    Open Login
  </button>
  <button className="btn-dark">
    <FaCalendarAlt style={{ marginRight: "8px" }} />
    Book Demo
  </button>
</div>
        </div>
      </section>

 
    </div>
  );
};

export default Home;
