import React, { useState, useEffect, useRef } from "react";
import Button from "./../components/button";
import Footer from "../components/footer";
import FutureWeatherComponent from "../components/futureWeatherComponent";
import navigate from "../inc/scripts/utilities";
import Spinner from "../components/spinner";
import Location from "./../assets/map.png";
import * as formHandler from "./../apis/getCurrentWeather";
import { db } from "../backend/app_backend";
import getGeolocation from "../apis/getGeolocation";
import { getCurrentDate } from "../inc/scripts/utilities";

// Icons
import Day from "./../assets/static/day.svg";
import HumidityIcon from "./../assets/humidity-icon.svg";
import WindIcon from "./../assets/wind-icon.svg";
import PressureIcon from "./../assets/pressure-icon.svg";

/* ────────────────────────────────────────────────────────────
   Autocomplete Suggestions Dropdown (Debounced 250ms)
──────────────────────────────────────────────────────────── */
const SearchMenuComponent = ({ search, onSelect }) => {
  const [dataArray, changeDataArray] = useState([]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (search && search.trim().length >= 2) {
        formHandler.findCity(search, changeDataArray);
      } else {
        changeDataArray([]);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [search]);

  if (!dataArray || dataArray.length === 0) return null;

  return (
    <ul className="header-search-autocomplete m-0 p-0">
      {dataArray.map((item, ind) => (
        <li
          key={ind}
          onMouseDown={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onSelect(item);
          }}
        >
          <div className="d-flex flex-column">
            <span className="search-city-title">{item.name}</span>
            {(item.admin1 || item.country) && (
              <span className="search-city-subtitle">
                {item.admin1 ? `${item.admin1}, ` : ""}{item.country}
              </span>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
};

const WeatherApp = () => {
  if (!db.get("HOME_PAGE_SEEN")) {
    navigate("/");
  }

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [weatherInput, setWeatherInput] = useState("");
  const searchInputRef = useRef(null);

  // Auto-track location on mount if enabled, or load saved USER_DEFAULT_LOCATION
  useEffect(() => {
    const isAutoTrack = db.get("TRACK_SAVED_LOCATION_WEATHER");
    if (isAutoTrack === "true" || isAutoTrack === true) {
      getGeolocation();
    } else {
      const defaultLoc = db.get("USER_DEFAULT_LOCATION") || db.get("WEATHER_LOCATION");
      if (defaultLoc) {
        formHandler.getCurrentWeather(defaultLoc);
      }
    }
  }, []);

  // Format values
  const currentTemp = Math.ceil(db.get("WEATHER_DEG") || 30);
  const feelsLike = Math.ceil(db.get("WEATHER_FEELS_LIKE") || 32);
  const tempMax = Math.ceil(db.get("WEATHER_TEMP_MAX") || 33);
  const tempMin = Math.ceil(db.get("WEATHER_TEMP_MIN") || 25);
  const condition = db.get("WEATHER_DESCRIPTION") || "Clear Sky";

  const toggleSearch = () => {
    if (!isSearchOpen) {
      setIsSearchOpen(true);
      setTimeout(() => {
        if (searchInputRef.current) {
          searchInputRef.current.focus();
        }
      }, 80);
    } else {
      setIsSearchOpen(false);
      setWeatherInput("");
    }
  };

  const handleSearchSubmit = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (weatherInput && weatherInput.trim()) {
      formHandler.getCurrentWeather(weatherInput.trim());
      setIsSearchOpen(false);
    }
  };

  const handleSelectCity = (item) => {
    setWeatherInput(item.displayName || item.name);
    formHandler.getCurrentWeather(item.name, item.latitude, item.longitude);
    setIsSearchOpen(false);
  };

  const navigateToForecast = () => {
    navigate("/forecast");
  };

  class MappedSavedDataTemplate {
    constructor(id, time, icon, unit) {
      this.id = id;
      this.time = time;
      this.icon = icon;
      this.unit = unit;
    }
  }

  const mapDbSavedData = () => {
    const count = 8;
    let weatherData = [];

    for (let i = 0; i < count; i++) {
      const FORECAST_TIME = db.get(`WEATHER_FORECAST_TIME_${i}`) || "12pm";
      const FORECAST_ICON = db.get(`WEATHER_FORECAST_ICON_${i}`) || "800";
      const FORECAST_UNIT = db.get(`WEATHER_FORECAST_UNIT_${i}`) || "26";

      weatherData.push(
        new MappedSavedDataTemplate(
          i,
          FORECAST_TIME,
          formHandler.checkWeatherCode(parseInt(FORECAST_ICON)),
          FORECAST_UNIT
        )
      );
    }

    return weatherData.map((data) => (
      <FutureWeatherComponent
        key={data.id}
        time={data.time}
        icon={data.icon}
        weatherUnit={data.unit}
        onClick={navigateToForecast}
      />
    ));
  };

  return (
    <React.Fragment>
      <Spinner />
      <div id="weatherContainer">
        
        {/* LEVEL 2: Main Dashboard Surface */}
        <div className="page-card">

          {/* HEADER */}
          <section className="app-header">
            <div className="city-location">
              <h5 id="weatherLocation">
                {db.get("WEATHER_LOCATION") || "Lagos, NG"}
              </h5>
              <p className="date-time" id="date-time">
                {getCurrentDate()}
              </p>
            </div>

            {/* IN-PLACE EXPANDING LIQUID GLASS SEARCH CONTROL */}
            <div className={`header-search-container ${isSearchOpen ? "open" : ""}`}>
              <form onSubmit={handleSearchSubmit} className="d-flex align-items-center w-100 m-0">
                <button
                  type="button"
                  className="header-search-icon-btn"
                  onClick={toggleSearch}
                  title="Search City"
                  aria-label="Search"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="16" height="16" fill="var(--ink-1)">
                    <path d="M505 442.7L405.3 343c-4.5-4.5-10.6-7-17-7H372c27.6-35.3 44-79.7 44-128C416 93.1 322.9 0 208 0S0 93.1 0 208s93.1 208 208 208c48.3 0 92.7-16.4 128-44v16.3c0 6.4 2.5 12.5 7 17l99.7 99.7c9.4 9.4 24.6 9.4 33.9 0l28.3-28.3c9.4-9.4 9.4-24.6.1-34zM208 336c-70.7 0-128-57.2-128-128 0-70.7 57.2-128 128-128 70.7 0 128 57.2 128 128 0 70.7-57.2 128-128 128z"/>
                  </svg>
                </button>

                {isSearchOpen && (
                  <input
                    ref={searchInputRef}
                    type="text"
                    name="searchWeather"
                    id="searchWeather"
                    placeholder="Search for a city..."
                    value={weatherInput}
                    className="header-search-input"
                    onChange={(e) => setWeatherInput(e.target.value)}
                    autoComplete="off"
                  />
                )}

                {isSearchOpen && (
                  <button
                    type="button"
                    className="header-search-close-btn"
                    onClick={() => {
                      setIsSearchOpen(false);
                      setWeatherInput("");
                    }}
                    title="Close Search"
                    aria-label="Close"
                  >
                    ✕
                  </button>
                )}
              </form>

              {/* Autocomplete Dropdown */}
              {isSearchOpen && (
                <SearchMenuComponent
                  search={weatherInput}
                  onSelect={handleSelectCity}
                />
              )}
            </div>
          </section>

          {/* DESKTOP GRID */}
          <div className="weather-desktop-grid">
            
            {/* LEFT COLUMN */}
            <div className="left-weather-column d-flex flex-column" style={{ gap: "20px" }}>
              
              {/* HERO CARD */}
              <section className="weather-hero-card">
                <div className="current-weather-wrapper">
                  <div className="hero-temp-block">
                    <div className="d-flex align-items-start">
                      <span className="brand-large-text" id="currentDeg">{currentTemp}</span>
                      <span className="current-weather-unit">°</span>
                    </div>
                    <div>
                      <p className="hero-weather-description" id="weatherDes">{condition}</p>
                      <p className="hero-weather-hl mt-1">
                        Feels like {feelsLike}° • H: {tempMax}° L: {tempMin}°
                      </p>
                    </div>
                  </div>
                  <div className="current-weather-icon" id="main-weather-icon-container">
                    <img
                      src={formHandler.checkWeatherCode(db.get("WEATHER_CODE")) || Day}
                      alt="current weather icon"
                      id="main-weather-icon"
                    />
                  </div>
                </div>

                {/* DETAILS GRID */}
                <div className="weather-details-grid">
                  <div className="detail-card">
                    <img src={WindIcon} className="detail-icon" alt="wind" />
                    <p className="detail-value" id="wind-value">{db.get("SUB_WEATHER_WIND_VALUE") || "2.9 m/s"}</p>
                    <p className="detail-label">Wind</p>
                  </div>
                  <div className="detail-card">
                    <img src={HumidityIcon} className="detail-icon" alt="humidity" />
                    <p className="detail-value" id="humidity-value">{db.get("SUB_WEATHER_HUMIDITY_VALUE") || "98 %"}</p>
                    <p className="detail-label">Humidity</p>
                  </div>
                  <div className="detail-card">
                    <img src={PressureIcon} className="detail-icon" alt="pressure" />
                    <p className="detail-value" id="pressure-value">{db.get("SUB_WEATHER_PRESSURE_VALUE") || "1013 hPa"}</p>
                    <p className="detail-label">Pressure</p>
                  </div>
                </div>
              </section>

            </div>

            {/* RIGHT COLUMN */}
            <div className="right-weather-column forecast-section">
              
              {/* HOURLY FORECAST */}
              <section className="forecast-card-wrapper">
                <div className="forecast-tabs">
                  <span className="forecast-tab active">Today</span>
                  <span className="forecast-tab" onClick={navigateToForecast}>Tomorrow</span>
                  <span className="forecast-tab" onClick={navigateToForecast}>5 Days</span>
                </div>
                
                {/* Scrollable Container */}
                <div className="forecast-scroll-wrapper">
                  <div className="future-weather-forecast">
                    {mapDbSavedData()}
                  </div>
                </div>
              </section>

              {/* MAP / LOCATION */}
              <section className="map-card-container">
                <div className="ripple-container">
                  <img src={Location} alt="location" className="map-icon" />
                  <div className="loader rainbow">
                    {Array.from({ length: 100 }, (_, i) => (
                      <div className="circle" key={i + 1} style={{ "--i": i + 1 }} />
                    ))}
                  </div>
                </div>
                <Button
                  text="Current Location"
                  className="brand-btn"
                  onClick={getGeolocation}
                />
              </section>

            </div>
          </div>
        </div>

        {/* FOOTER NAV */}
        <Footer utilityTags={null} onClick={toggleSearch} />
      </div>
    </React.Fragment>
  );
};

export default WeatherApp;
