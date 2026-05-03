import { useState, useEffect } from "react";   // 👈 useEffect added

import { useAppDispatch, useAppSelector } from "../redux/hooks";
import {
  updateSettingsThunk,
  updateLogosThunk,
  getSettingsThunk,   // 👈 ADDED
} from "../slices/settingsSlice";
import "../assets/css/setting.css";


const SettingPage = () => {
  const dispatch = useAppDispatch();
  const { loading, data } = useAppSelector((s) => s.settings);  // 👈 data added

  /* ================= SETTINGS STATE ================= */

  const [form, setForm] = useState({
    serverName: "",
    serverDescription: "",
    defaultLanguage: "EN",
    defaultDateFormat: "dd-MM-yyyy HH:mm:ss",
    defaultTimeFormat: "24 hour clock",
    defaultDurationFormat: "h min s",
    defaultUnitOfDistance: "Kilometer",
    defaultUnitOfCapacity: "Liter",
    defaultUnitOfAltitude: "Meter",
    mapZoomLevel: "12",
    latitude: "",
    longitude: "",
    noReplyEmailAddress: "",
    fromName: "",
  });

  /* ================= BRANDING STATE ================= */

const BASE_URL = import.meta.env.VITE_IMAGE_BASE_URL;

  const [logoForm, setLogoForm] = useState({
    loginTextColor: "#000000",
    loginPanelColor: "#ffffff",
    loginPanelTransparency: "0",
    welcomeText: "",
    bottomText: "",
    appleStoreLink: "",
    googlePlayLink: "",
  });

  const [files, setFiles] = useState<{
    frontpageLogo?: File;
    favicon?: File;
    loginPageLogo?: File;
    backgroundImage?: File;
  }>({});

  /* ================= LOAD SETTINGS WHEN MODAL OPENS ================= */

useEffect(() => {
  dispatch(getSettingsThunk());
}, [dispatch]);

  /* ================= AUTO FILL FORM FROM BACKEND ================= */

  useEffect(() => {
    if (!data) return;

    setForm({
      serverName: data.serverName || "",
      serverDescription: data.serverDescription || "",
      defaultLanguage: data.defaultLanguage || "EN",
      defaultDateFormat: data.defaultDateFormat || "dd-MM-yyyy HH:mm:ss",
      defaultTimeFormat: data.defaultTimeFormat || "24 hour clock",
      defaultDurationFormat: data.defaultDurationFormat || "h min s",
      defaultUnitOfDistance: data.defaultUnitOfDistance || "Kilometer",
      defaultUnitOfCapacity: data.defaultUnitOfCapacity || "Liter",
      defaultUnitOfAltitude: data.defaultUnitOfAltitude || "Meter",
      mapZoomLevel: data.mapZoomLevel || "12",
      latitude: data.latitude || "",
      longitude: data.longitude || "",
      noReplyEmailAddress: data.noReplyEmailAddress || "",
      fromName: data.fromName || "",
    });

    if (data.logo) {
      setLogoForm({
        loginTextColor: data.logo.loginTextColor || "#000000",
        loginPanelColor: data.logo.loginPanelColor || "#ffffff",
        loginPanelTransparency: data.logo.loginPanelTransparency || "0",
        welcomeText: data.logo.welcomeText || "",
        bottomText: data.logo.bottomText || "",
        appleStoreLink: data.logo.appleStoreLink || "",
        googlePlayLink: data.logo.googlePlayLink || "",
      });

      const setPreview = (id: string, file?: string) => {
        if (!file) return;
        const img = document.getElementById("preview_" + id) as HTMLImageElement;
        if (img) img.src = `${BASE_URL}/${file}`;   // backend should send full URL
      };

      setPreview("frontpageLogo", data.logo.frontpageLogo);
      setPreview("favicon", data.logo.favicon);
      setPreview("loginPageLogo", data.logo.loginPageLogo);
      setPreview("backgroundImage", data.logo.backgroundImage);
    }
  }, [data, BASE_URL]);

  /* ================= HANDLERS ================= */

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.id]: e.target.value });
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setLogoForm({ ...logoForm, [e.target.id]: e.target.value });
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const id = e.target.id as keyof typeof files;

    setFiles((prev) => ({ ...prev, [id]: file }));

    const reader = new FileReader();
    reader.onload = () => {
      const img = document.getElementById("preview_" + id) as HTMLImageElement;
      if (img) img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  };

  /* ================= SAVE ================= */

  const saveSettings = () => {
    dispatch(updateSettingsThunk(form));
  };

  const saveLogos = () => {
    dispatch(
      updateLogosThunk({
        logo: logoForm,
        files,
      })
    );
  };

  /* ================= UI ================= */

  return (
     <>
      <div className="settings-topbar">
        To use software with your Branding, use this URL to login:
        <span> http://fleetplus.trackingpath.com/</span>
      </div>

      <div className="settings-wrapper">

        {/* ================= LEFT PANEL ================= */}
        <div className="panel">
          <div className="panel-title">⚙ Settings</div>

          {[
            ["serverName", "Server Name"],
            ["serverDescription", "Server Description"],
            ["latitude", "Latitude"],
            ["longitude", "Longitude"],
            ["noReplyEmailAddress", "No Reply Email"],
            ["fromName", "From Name"],
          ].map(([id, label]) => (
            <div key={id} className="form-group">
              <label>{label}</label>
              <input id={id} value={(form as any)[id]} onChange={handleChange} />
            </div>
          ))}

          {/* Dropdowns */}
          <div className="form-group">
            <label>Default Language</label>
            <select id="defaultLanguage" value={form.defaultLanguage} onChange={handleChange}>
              <option value="EN">English</option>
              <option value="HN">Hindi</option>
            </select>
          </div>

          <div className="form-group">
            <label>Date Format</label>
            <select id="defaultDateFormat" value={form.defaultDateFormat} onChange={handleChange}>
              <option>dd-MM-yyyy HH:mm:ss</option>
              <option>MM-dd-yyyy HH:mm:ss</option>
              <option>yyyy-MM-dd HH:mm:ss</option>
            </select>
          </div>

          <div className="form-group">
            <label>Time Format</label>
            <select id="defaultTimeFormat" value={form.defaultTimeFormat} onChange={handleChange}>
              <option>24 hour clock</option>
              <option>12 hour clock</option>
            </select>
          </div>

          <div className="form-group">
            <label>Duration Format</label>
            <select id="defaultDurationFormat" value={form.defaultDurationFormat} onChange={handleChange}>
              <option>h min s</option>
              <option>hh:mm:ss</option>
            </select>
          </div>

          <div className="form-group">
            <label>Unit of Distance</label>
            <select id="defaultUnitOfDistance" value={form.defaultUnitOfDistance} onChange={handleChange}>
              <option>Kilometer</option>
              <option>Miles</option>
            </select>
          </div>

          <div className="form-group">
            <label>Unit of Capacity</label>
            <select id="defaultUnitOfCapacity" value={form.defaultUnitOfCapacity} onChange={handleChange}>
              <option>Liter</option>
              <option>Gallon</option>
            </select>
          </div>

          <div className="form-group">
            <label>Unit of Altitude</label>
            <select id="defaultUnitOfAltitude" value={form.defaultUnitOfAltitude} onChange={handleChange}>
              <option>Meter</option>
              <option>Feet</option>
            </select>
          </div>

          <div className="form-group">
            <label>Map Zoom Level</label>
            <input
              id="mapZoomLevel"
              type="number"
              value={form.mapZoomLevel}
              onChange={handleChange}
            />
          </div>

          <button className="btn-save" onClick={saveSettings}>
            {loading ? "Saving..." : "Save Settings"}
          </button>
        </div>

        {/* ================= RIGHT PANEL ================= */}
        <div className="panel">
          <div className="panel-title">🎨 Logo & Branding</div>

          {[
            { id: "frontpageLogo", label: "Frontpage Logo" },
            { id: "favicon", label: "Favicon (16x16)" },
            { id: "loginPageLogo", label: "Login Page Logo" },
            { id: "backgroundImage", label: "Background Image" },
          ].map(({ id, label }) => (
            <div key={id} className="upload-card">
              <div className="upload-title">{label}</div>

              <div className="upload-box">
                <img id={"preview_" + id} alt="" />
<label htmlFor={id} className="upload-btn">
  <i className="fa-solid fa-cloud-arrow-up"></i>
</label>
                <input type="file" id={id} hidden onChange={handleFile} />
              </div>
            </div>
          ))}

          {[
            ["welcomeText", "Welcome Text"],
            ["bottomText", "Bottom Text"],
            ["appleStoreLink", "Apple Store Link"],
            ["googlePlayLink", "Google Play Link"],
          ].map(([id, label]) => (
            <div key={id} className="form-group">
              <label>{label}</label>
              <input id={id} value={(logoForm as any)[id]} onChange={handleLogoChange} />
            </div>
          ))}

          <div className="form-group">
            <label>Login Text Color</label>
            <input
              type="color"
              id="loginTextColor"
              value={logoForm.loginTextColor}
              onChange={handleLogoChange}
            />
          </div>

          <div className="form-group">
            <label>Login Panel Color</label>
            <input
              type="color"
              id="loginPanelColor"
              value={logoForm.loginPanelColor}
              onChange={handleLogoChange}
            />
          </div>

          <div className="form-group">
            <label>Panel Transparency</label>
            <select
              id="loginPanelTransparency"
              value={logoForm.loginPanelTransparency}
              onChange={handleLogoChange}
            >
              <option value="0">0%</option>
              <option value="25">25%</option>
              <option value="50">50%</option>
              <option value="75">75%</option>
              <option value="100">100%</option>
            </select>
          </div>

          <button className="btn-save" onClick={saveLogos}>
            {loading ? "Saving..." : "Save Branding"}
          </button>
        </div>
      </div>
  </>
  );
};

export default SettingPage;
