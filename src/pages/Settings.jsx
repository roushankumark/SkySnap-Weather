import React, { useState } from "react";
import Spinner from "../components/spinner";
import Footer from "../components/footer";
import navigate from "../inc/scripts/utilities";
import { db } from "../backend/app_backend";
import * as settings from "./../backend/settings";
import * as formHandler from "../apis/getCurrentWeather";
import getGeolocation from "../apis/getGeolocation";
import Swal from "sweetalert2";

// Top-level sub-components (defined OUTSIDE to prevent unmount/remount on keystroke)
const SettingRow = ({ icon, title, subtitle, children }) => (
  <div className="settings-row">
    <div className="settings-row-left">
      <div className="settings-row-icon">{icon}</div>
      <div>
        <p className="settings-row-title">{title}</p>
        {subtitle && <p className="settings-row-subtitle">{subtitle}</p>}
      </div>
    </div>
    <div className="settings-row-control">{children}</div>
  </div>
);

const SectionHeader = ({ label }) => (
  <p className="settings-section-header">{label}</p>
);

const Settings = () => {
  const [defaultLocation, setDefaultLocation] = useState(settings.getDefaultLocation() || "");
  const [weatherUnit, setWeatherUnit] = useState(db.get("WEATHER_UNIT") || "metric");
  const trackedLocation = db.get("TRACK_SAVED_LOCATION_WEATHER");
  const [trackLocation, setTrackLocation] = useState(trackedLocation === "true" || trackedLocation === true);

  const handleSaveLocation = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    const newLoc = defaultLocation.trim();
    if (!newLoc) {
      Swal.fire({ toast: true, position: "top", text: "Please enter a valid location.", icon: "warning", timer: 2000, showConfirmButton: false, background: "rgba(15,23,42,0.95)", color: "#fff" });
      return;
    }
    
    // Save to database
    if (db.get("USER_DEFAULT_LOCATION")) {
      db.update("USER_DEFAULT_LOCATION", newLoc);
    } else {
      db.create("USER_DEFAULT_LOCATION", newLoc);
    }

    // Immediately fetch and update weather data for the new default city!
    formHandler.getCurrentWeather(newLoc);

    Swal.fire({
      toast: true,
      position: "top",
      text: `Default location saved: ${newLoc}`,
      icon: "success",
      timer: 2000,
      showConfirmButton: false,
      background: "rgba(15, 23, 42, 0.95)",
      color: "#fff"
    });
  };

  const handleSaveUnit = () => {
    if (db.get("WEATHER_UNIT")) {
      db.update("WEATHER_UNIT", weatherUnit);
    } else {
      db.create("WEATHER_UNIT", weatherUnit);
    }
    // Refresh weather data with new unit if location is saved
    const currentLoc = db.get("WEATHER_LOCATION") || db.get("USER_DEFAULT_LOCATION");
    if (currentLoc) {
      formHandler.getCurrentWeather(currentLoc);
    }

    Swal.fire({ toast: true, position: "top", text: "Temperature unit updated!", icon: "success", timer: 2000, showConfirmButton: false, background: "rgba(15,23,42,0.95)", color: "#fff" });
  };

  const handleTrackToggle = () => {
    const newVal = !trackLocation;
    setTrackLocation(newVal);
    db.create("TRACK_SAVED_LOCATION_WEATHER", newVal ? "true" : "false");

    if (newVal) {
      getGeolocation();
    } else {
      Swal.fire({ toast: true, position: "top", text: "Location tracking disabled", icon: "info", timer: 1500, showConfirmButton: false, background: "rgba(15,23,42,0.95)", color: "#fff" });
    }
  };

  const handleRestoreFactory = () => {
    Swal.fire({
      title: "Reset Everything?",
      text: "This will erase all your saved data and take you back to setup.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#334155",
      confirmButtonText: "Yes, Reset",
      background: "rgba(15,23,42,0.97)",
      color: "#fff",
    }).then((result) => {
      if (result.isConfirmed) {
        settings.restoreFactorySettings();
      }
    });
  };

  return (
    <React.Fragment>
      <Spinner />
      <div id="settingsPage">
        <div className="page-card">
          {/* Header */}
          <section className="app-header">
            <div className="toggle-btn" onClick={() => navigate("/weather")} title="Back">
              <svg height="20" viewBox="0 0 512 512" width="20" xmlns="http://www.w3.org/2000/svg" fill="white">
                <polygon points="352,128.4 319.7,96 160,256 319.7,416 352,383.6 224.7,256" />
              </svg>
            </div>
            <div style={{ textAlign: "center" }}>
              <h5 className="fw-bold" style={{ margin: 0, fontSize: "1.15rem" }}>Settings</h5>
              <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.75rem", margin: 0 }}>SkySnap Weather</p>
            </div>
            <div style={{ width: 40 }} />
          </section>

          {/* Location Settings */}
          <SectionHeader label="📍 Location" />
          <div className="settings-card">
            <SettingRow
              icon={<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512" width="18" height="18" fill="rgba(255,255,255,0.8)"><path d="M172.268 501.67C26.97 291.031 0 269.413 0 192 0 85.961 85.961 0 192 0s192 85.961 192 192c0 77.413-26.97 99.031-172.268 309.67-9.535 13.774-29.93 13.773-39.464 0zM192 272c44.183 0 80-35.817 80-80s-35.817-80-80-80-80 35.817-80 80 35.817 80 80 80z"/></svg>}
              title="Default Location"
              subtitle="City shown on launch"
            >
              <form onSubmit={handleSaveLocation} className="settings-input-group m-0 p-0">
                <input
                  type="text"
                  className="settings-input"
                  value={defaultLocation}
                  placeholder="e.g. London, Mumbai"
                  onChange={(e) => setDefaultLocation(e.target.value)}
                />
                <button type="submit" className="settings-save-btn">Save</button>
              </form>
            </SettingRow>

            <SettingRow
              icon={<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="18" height="18" fill="rgba(255,255,255,0.8)"><path d="M256 8C119 8 8 119 8 256s111 248 248 248 248-111 248-248S393 8 256 8zm0 448c-110.5 0-200-89.5-200-200S145.5 56 256 56s200 89.5 200 200-89.5 200-200 200zm61.8-104.4l-84.9-61.7c-3.1-2.3-4.9-5.9-4.9-9.7V116c0-6.6 5.4-12 12-12h32c6.6 0 12 5.4 12 12v141.7l66.8 48.6c5.4 3.9 6.5 11.4 2.6 16.8L334.6 349c-3.9 5.3-11.4 6.5-16.8 2.6z"/></svg>}
              title="Auto-Track Location"
              subtitle="Automatically load your saved location"
            >
              <div className={`toggle-switch ${trackLocation ? "on" : ""}`} onClick={handleTrackToggle}>
                <div className="toggle-thumb" />
              </div>
            </SettingRow>
          </div>

          {/* Temperature */}
          <SectionHeader label="🌡️ Temperature Unit" />
          <div className="settings-card">
            <div className="settings-segmented">
              {[
                { label: "°C Celsius", value: "metric" },
                { label: "°F Fahrenheit", value: "imperial" },
                { label: "K Kelvin", value: "default" },
              ].map((opt) => (
                <button
                  key={opt.value}
                  className={`segmented-option ${weatherUnit === opt.value ? "active" : ""}`}
                  onClick={() => setWeatherUnit(opt.value)}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            <div className="mt-3 text-center">
              <button className="settings-action-btn" onClick={handleSaveUnit}>Apply Unit</button>
            </div>
          </div>

          {/* System */}
          <SectionHeader label="⚙️ Factory Reset" />
          <div className="settings-card">
            <SettingRow
              icon={<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="18" height="18" fill="#ef4444"><path d="M256 8C119 8 8 119 8 256s111 248 248 248 248-111 248-248S393 8 256 8zm0 448c-110.5 0-200-89.5-200-200S145.5 56 256 56s200 89.5 200 200-89.5 200-200 200zm105.4-142.6c4.7 4.7 4.7 12.3 0 17l-22.6 22.6c-4.7 4.7-12.3 4.7-17 0L256 289l-65.8 65.8c-4.7 4.7-12.3 4.7-17 0l-22.6-22.6c-4.7-4.7-4.7-12.3 0-17L217 256l-65.8-65.8c-4.7-4.7-4.7-12.3 0-17l22.6-22.6c4.7-4.7 12.3-4.7 17 0L256 223l65.8-65.8c4.7-4.7 12.3-4.7 17 0l22.6 22.6c4.7 4.7 4.7 12.3 0 17L295 256l66.4 65.4z"/></svg>}
              title="Reset Application"
              subtitle="Clear all cached data"
            >
              <button className="settings-danger-btn" onClick={handleRestoreFactory}>Reset</button>
            </SettingRow>
          </div>
        </div>
        <Footer />
      </div>
    </React.Fragment>
  );
};

export default Settings;
