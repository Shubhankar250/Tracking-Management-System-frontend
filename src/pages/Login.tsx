import React, { useState, useEffect } from "react";
import type { FormEvent } from "react";
import { AxiosError } from "axios";
import { useNavigate } from "react-router-dom";

import { loginApi } from "../api/auth.api";
import "../assets/css/Login.css";
import ForgotPasswordModal from "../features/ForgotPasswordModal";

import { useAppDispatch } from "../redux/hooks";
import { loginSuccess } from "../slices/authSlice";
import { fetchUsers } from "../slices/usersSlice";
import {FaSignInAlt, FaTruck, FaWhatsapp } from "react-icons/fa";
import { MdHelpOutline, MdSms } from "react-icons/md";
import { RiSignalWifiFill } from "react-icons/ri";
import { fetchLoggedInUser } from "../slices/authSlice";
const Login: React.FC = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [openForgot, setOpenForgot] = useState(false);

  const navigate = useNavigate();
  const dispatch = useAppDispatch(); // ✅ get Redux dispatch

  // ✅ LOAD REMEMBERED USERNAME ON PAGE LOAD
  useEffect(() => {
    const remembered = localStorage.getItem("rememberMe");
    const savedUsername = localStorage.getItem("rememberedUsername");

    if (remembered === "true" && savedUsername) {
      setUsername(savedUsername);
      setRememberMe(true);
    }
  }, []);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    try {
      const { data } = await loginApi(username, password);

      // ✅ STORE TOKEN & USER INFO
      localStorage.setItem("token", data.token);
      localStorage.setItem("userId", data.id.toString());
      localStorage.setItem("roles", JSON.stringify(data.roles));

      // ✅ UPDATE REDUX AUTH SLICE
      dispatch(
        loginSuccess({
          token: data.token,
          roles: data.roles,
          id: data.id,
          zlm_token: data.zlm_token,
          url: data.url,
          username:data.username
        })
      );
  dispatch(fetchLoggedInUser());
      // ✅ FETCH USERS IMMEDIATELY FOR FIRST LOGIN
      dispatch(fetchUsers());

      // ✅ REMEMBER ME LOGIC
      if (rememberMe) {
        localStorage.setItem("rememberMe", "true");
        localStorage.setItem("rememberedUsername", username);
      } else {
        localStorage.removeItem("rememberMe");
        localStorage.removeItem("rememberedUsername");
      }

      // ✅ NAVIGATE TO DASHBOARD
navigate("/livetrack", { replace: true });    } catch (err) {
      const axiosError = err as AxiosError;

      if (axiosError.response?.status === 401) {
        setError("Invalid username or password");
      } else {
        setError("Server error. Please try again.");
      }
    }
  };

  const togglePassword = () => {
    const pwd = document.getElementById("password") as HTMLInputElement | null;
    const icon = document.getElementById("togglePasswordIcon");

    if (!pwd || !icon) return;

    if (pwd.type === "password") {
      pwd.type = "text";
      icon.classList.replace("fa-eye-slash", "fa-eye");
    } else {
      pwd.type = "password";
      icon.classList.replace("fa-eye", "fa-eye-slash");
    }
  };

  return (
  <div className="tp-page">

    {/* ===== Top Header ===== */}
   <header className="tp-header">

  {/* LEFT */}
  <div className="tp-header-left">
    <div className="tp-logo">
      <FaTruck size={18} color="#fff" />
    </div>

    <span className="tp-title">TRACKINGPATH</span>
  </div>

  {/* RIGHT */}
  <div className="tp-header-right">

    {/* Live icon + text */}
    <div className="tp-status-text">
      <RiSignalWifiFill className="live-icon" />
      Live Tracking Ready
    </div>

    {/* Help icon */}
    <div className="tp-help" title="Help">
      <MdHelpOutline />
    </div>

  </div>
</header>

    {/* ===== Main Container ===== */}
    <div className="tp-container">

      {/* ===== Left Info Card ===== */}
      <div className="tp-left-card tp-accent">
        <h2>Secure login for Live Tracking</h2>
        <p>
          Monitor vehicles in real-time with a clean operator-friendly interface —
          built for speed, clarity, and control.
        </p>

       <div className="tp-illus-wrap mb-4">
                <svg className="tp-illus" viewBox="0 0 980 360" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Live tracking illustration">
                  <defs>
                    <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0" stop-color="#EEF6FF"/>
                      <stop offset="1" stop-color="#FFFFFF"/>
                    </linearGradient>

                    <filter id="shadow" x="-30%" y="-30%" width="160%" height="180%">
                      <feDropShadow dx="0" dy="14" stdDeviation="12" flood-color="#0F172A" flood-opacity=".10"/>
                    </filter>

                    <filter id="shadowSoft" x="-30%" y="-30%" width="160%" height="180%">
                      <feDropShadow dx="0" dy="10" stdDeviation="10" flood-color="#0F172A" flood-opacity=".08"/>
                    </filter>

                    <linearGradient id="pinBlue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0" stop-color="#1D4ED8"/>
                      <stop offset="1" stop-color="#0B63D1"/>
                    </linearGradient>

                    <linearGradient id="pinGreen" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0" stop-color="#22C55E"/>
                      <stop offset="1" stop-color="#16A34A"/>
                    </linearGradient>

                    <linearGradient id="pinRed" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0" stop-color="#F87171"/>
                      <stop offset="1" stop-color="#EF4444"/>
                    </linearGradient>
                  </defs>

                
                  <rect x="0" y="0" width="980" height="360" rx="18" fill="url(#bg)"/>

                 
                  <circle cx="160" cy="95" r="58" fill="#0B63D1" opacity=".20"/>
                  <circle cx="860" cy="92" r="48" fill="#22C55E" opacity=".18"/>

                
                  <path id="route"
                        d="M120 225 C 220 165, 310 255, 410 200 S 600 130, 700 185 S 820 270, 920 210"
                        fill="none"
                        stroke="#0B63D1"
                        stroke-opacity=".35"
                        stroke-width="4"
                        stroke-dasharray="6 12"/>

                  <circle r="6" fill="#0B63D1">
                    <animateMotion dur="5.2s" repeatCount="indefinite"
                      path="M120 225 C 220 165, 310 255, 410 200 S 600 130, 700 185 S 820 270, 920 210" />
                    <animate attributeName="r" values="5;7;5" dur="1.2s" repeatCount="indefinite"/>
                  </circle>

                
                  <g filter="url(#shadowSoft)">
                  
                    <g transform="translate(255 165)">
                      <path d="M0 0c0-18 14-32 32-32s32 14 32 32c0 22-32 58-32 58S0 22 0 0Z" fill="url(#pinBlue)"/>
                      <circle cx="32" cy="0" r="10" fill="#fff" opacity=".98"/>
                    </g>

               
                    <g transform="translate(618 120)">
                      <path d="M0 0c0-18 14-32 32-32s32 14 32 32c0 22-32 58-32 58S0 22 0 0Z" fill="url(#pinGreen)"/>
                      <circle cx="32" cy="0" r="10" fill="#fff" opacity=".98"/>
                    </g>
                  </g>

               
                  <g transform="translate(300 230)" filter="url(#shadowSoft)">
                    <rect x="0" y="18" width="250" height="76" rx="18" fill="#FFFFFF"/>
                    <rect x="20" y="34" width="118" height="44" rx="12" fill="#0B63D1" opacity=".12"/>
                    <rect x="150" y="38" width="80" height="40" rx="12" fill="#FFFFFF"/>
                    <rect x="18" y="54" width="214" height="12" rx="6" fill="#0B63D1" opacity=".18"/>

                 
                    <circle cx="68" cy="98" r="18" fill="#0F172A" opacity=".18"/>
                    <circle cx="190" cy="98" r="18" fill="#0F172A" opacity=".18"/>
                    <circle cx="68" cy="98" r="10" fill="#475569" opacity=".55"/>
                    <circle cx="190" cy="98" r="10" fill="#475569" opacity=".55"/>

                  
                    <animateTransform attributeName="transform" attributeType="XML" type="translate"
                      values="300 230; 300 226; 300 230" dur="2.4s" repeatCount="indefinite"/>
                  </g>

               
                  <g transform="translate(700 92)" filter="url(#shadow)">
                    <rect x="0" y="0" width="210" height="250" rx="30" fill="#FFFFFF"/>
                    <rect x="12" y="16" width="186" height="200" rx="18" fill="#EAF2FF"/>
                    <circle cx="105" cy="10" r="5" fill="#94A3B8"/>

                    <path d="M32 160 C 65 130, 95 176, 130 145 S 160 130, 182 152"
                          fill="none" stroke="#0B63D1" stroke-opacity=".35" stroke-width="3" stroke-dasharray="5 9"/>
                    <circle cx="76" cy="150" r="5" fill="#0B63D1">
                      <animate attributeName="cx" values="76;150;76" dur="4.8s" repeatCount="indefinite"/>
                      <animate attributeName="cy" values="150;145;150" dur="4.8s" repeatCount="indefinite"/>
                    </circle>

                    <g transform="translate(130 60)">
                      <path d="M0 0c0-13 10-23 23-23s23 10 23 23c0 16-23 42-23 42S0 16 0 0Z" fill="url(#pinRed)"/>
                      <circle cx="23" cy="0" r="7" fill="#fff"/>
                    </g>

                    <animateTransform attributeName="transform" attributeType="XML" type="translate"
                      values="700 92; 700 88; 700 92" dur="3.2s" repeatCount="indefinite"/>
                  </g>
                </svg>
              </div>



        <div className="tp-footer">
          © 2026 AVSG Info Systems Pvt Ltd (TrackingPath)
        </div>
      </div>

      {/* ===== Right Login Card ===== */}
      <div className="tp-login-card tp-accent">

        <h3>Sign in</h3>
        <p className="sub">Enter your credentials to continue.</p>

        <form onSubmit={handleSubmit}>

          <input
            type="text"
            placeholder="Email / Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />

          <div className="pwd-group">
            <input
              type="password"
              id="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <i
              className="fa fa-eye-slash toggle"
              id="togglePasswordIcon"
              onClick={togglePassword}
            ></i>
          </div>

          <div className="login-row">
            <label>
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={() => setRememberMe(!rememberMe)}
              />
              Remember me
            </label>

            <span
              className="forgot"
              onClick={() => setOpenForgot(true)}
            >
              Forgot password?
            </span>
          </div>

<button className="login-btn">
  <FaSignInAlt className="btn-icon" />
  Login
</button>
          <div className="divider">OR</div>

         <button type="button" className="otp-btn">
  <MdSms className="btn-icon" />
  Login with OTP
</button>

<button type="button" className="support-btn">
  <FaWhatsapp className="btn-icon" />
  Support / WhatsApp
</button>

          {error && <div className="error">{error}</div>}
        </form>

        <div className="terms">
          By continuing you agree to our <span>Terms</span> & <span>Privacy</span>.
        </div>
      </div>
    </div>

    <ForgotPasswordModal open={openForgot} onClose={() => setOpenForgot(false)} />
  </div>
);

};

export default Login;
