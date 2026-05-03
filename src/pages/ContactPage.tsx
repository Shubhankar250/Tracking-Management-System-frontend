
import "../assets/css/ContactPage.css";
import { TbHeadset } from "react-icons/tb";

const ContactPage = () => {
  return (
    <div className="cp-page">
  

      <div className="cp-container">

        {/* HEADER */}
        <div className="cp-header">
<span className="cp-badge">
  <TbHeadset style={{ marginRight: "6px" }} />
  We respond fast
</span>          <h1>Contact us</h1>
          <p>Tell us your requirement. We'll share demo and pricing.</p>
        </div>

        <div className="cp-grid">

          {/* LEFT CARD */}
          <div className="cp-card cp-accent">
            <h3>Sales & Support</h3>

            <div className="cp-info">
              <label>Email</label>
              <a href="mailto:amitkverma@trackingpath.com">
                amitkverma@trackingpath.com
              </a>
            </div>

            <div className="cp-info">
              <label>Phone / WhatsApp</label>
              <a href="tel:+919871734569">+91 98717 34569</a>
            </div>

            <div className="cp-info">
              <label>Company</label>
              <p>AVSG Info Systems Pvt Ltd (TrackingPath)</p>
            </div>

            <div className="cp-note">
              Prefer email communication for official requests.
              <br />
              (Fast response via WhatsApp available)
            </div>

            <div className="cp-btn-row">
              <button className="cp-btn-outline">🔐 Login</button>
              <button className="cp-btn-primary">📅 Book Demo</button>
            </div>
          </div>

          {/* RIGHT CARD */}
          <div className="cp-card cp-accent">
            <h3>Request a Demo</h3>

            <div className="cp-form-grid">
              <input className="cp-input" placeholder="Your name" />
              <input className="cp-input" placeholder="Company name" />
              <input className="cp-input" placeholder="+91..." />
              <input className="cp-input" placeholder="you@company.com" />

              <select className="cp-input">
                <option>Select</option>
                <option>GPS Tracking</option>
                <option>Fleet Management</option>
                <option>Video Telematics</option>
              </select>

              <select className="cp-input">
                <option>1-10</option>
                <option>10-50</option>
                <option>50-100</option>
                <option>100+</option>
              </select>
            </div>

            <textarea
              className="cp-textarea"
              placeholder="Tell us what you need..."
            />

            <div className="cp-btn-row">
              <button className="cp-btn-primary">✈ Submit Request</button>
              <button className="cp-btn-outline">✉ Email Instead</button>
            </div>
          </div>

        </div>
      </div>


    </div>
  );
};

export default ContactPage;
