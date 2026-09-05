import jQuery from "jquery";
import { db } from "../backend/app_backend";
import { getCurrentDate } from "../inc/scripts/utilities";
import Swal from "sweetalert2";
import Thunder from "./../assets/static/thunder.svg";
import Day from "./../assets/static/day.svg";
import Drizzle from "./../assets/static/rainy-5.svg";
import Rainy from "./../assets/static/rainy-7.svg";

import FreezingRain from "./../assets/static/freezing-rain.svg";
import Misty from "./../assets/static/mist.svg";
import BrokenClouds from "./../assets/static/broken-clouds.svg";
import OvercastClouds from "./../assets/static/overcast-clouds.svg";
import ScatteredClouds from "./../assets/static/scattered-clouds.svg";
import FewClouds from "./../assets/static/few-clouds.svg";
import Haze from "./../assets/static/haze.svg";

export const closeUtilityComponent = () => {
  jQuery(($) => {
    $.noConflict();
    $(".cmp").addClass("d-none");
    $(".utility-component").removeClass("add-utility-component-height");
  });
};

export const API_KEY = "cd34f692e856e493bd936095b256b337";
export const WEATHER_UNIT = db.get("WEATHER_UNIT") || "metric";

export const scrollToElement = (elementId) => {
  const el = document.getElementById(elementId);
  if (el) {
    el.scrollIntoView({ behavior: "smooth" });
  }
};

export const checkWeatherUnitDeg = () => {
  let result;
  if (db.get("WEATHER_UNIT")) {
    switch (db.get("WEATHER_UNIT")) {
      case "celsius":
        result = "c";
        break;
      case "farenheit":
        result = "f";
        break;
      case "kelvin":
        result = "k";
        break;
      default:
        result = "c";
    }
  } else {
    db.create("WEATHER_UNIT", "celsius");
    result = "c";
  }
  return result;
};

export const handleWeatherForm = (e, search) => {
  if (e && e.preventDefault) e.preventDefault();

  if (db.get("TRACK_SAVED_LOCATION_WEATHER") === "false") {
    Swal.fire({
      text: "Changes settings to track default location",
      icon: "info",
      timer: 1500,
      toast: true,
      showConfirmButton: false,
      position: "top",
    }).then(() => {
      scrollToElement("weatherContainer");
    });
  }

  let userSearch = search || jQuery("#searchWeather").val();
  if (userSearch && userSearch.trim()) {
    getCurrentWeather(userSearch.trim());
    scrollToElement("weatherContainer");
  }
};

/* ────────────────────────────────────────────────────────────
   OPEN-METEO GEOCODING API — City Search Autocomplete
   Free, fast, reliable, no CORS issues, no API key expired
──────────────────────────────────────────────────────────── */
let geocodeAbortController = null;

export const findCity = async (searchTerm, updateDataArray) => {
  if (!searchTerm || searchTerm.trim().length < 2) {
    if (updateDataArray) updateDataArray([]);
    return;
  }

  // Cancel previous pending request if any
  if (geocodeAbortController) {
    geocodeAbortController.abort();
  }
  geocodeAbortController = new AbortController();

  const query = encodeURIComponent(searchTerm.trim());
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${query}&count=8&language=en&format=json`;

  try {
    const res = await fetch(url, { signal: geocodeAbortController.signal });
    if (!res.ok) {
      console.warn("Geocoding API non-200 status:", res.status);
      if (updateDataArray) updateDataArray([]);
      return;
    }
    const data = await res.json();
    if (data && data.results && data.results.length > 0) {
      const formatted = data.results.map((item) => ({
        name: item.name,
        admin1: item.admin1 || "",
        country: item.country || "",
        latitude: item.latitude,
        longitude: item.longitude,
        displayName: `${item.name}${item.admin1 ? ", " + item.admin1 : ""}${item.country ? ", " + item.country : ""}`
      }));
      if (updateDataArray) updateDataArray(formatted);
    } else {
      if (updateDataArray) updateDataArray([]);
    }
  } catch (err) {
    if (err.name !== "AbortError") {
      console.error("Geocoding API error:", err);
      if (updateDataArray) updateDataArray([]);
    }
  }
};

// Weather icon mapper
export let weatherSvg;
export const checkWeatherCode = (code) => {
  if (code >= 200 && !(code >= 300)) {
    weatherSvg = Thunder;
  } else if (code >= 300 && !(code !== 400)) {
    weatherSvg = Drizzle;
  } else if (code >= 500 && code !== 511 && !(code >= 600)) {
    weatherSvg = Rainy;
  } else if (code >= 700 && code !== 701 && !(code >= 800)) {
    weatherSvg = Haze;
  } else if (code === 701) {
    weatherSvg = Misty;
  } else if (code === 511) {
    weatherSvg = FreezingRain;
  } else if (code === 800) {
    weatherSvg = Day;
  } else if (code === 803) {
    weatherSvg = BrokenClouds;
  } else if (code === 804) {
    weatherSvg = OvercastClouds;
  } else if (code === 801) {
    weatherSvg = FewClouds;
  } else if (code === 802) {
    weatherSvg = ScatteredClouds;
  } else {
    weatherSvg = Day;
  }
  return weatherSvg;
};

export const updateReactDom = (result) => {
  jQuery(($) => {
    $.noConflict();
    closeUtilityComponent();
    scrollToElement("weatherContainer");

    const locationName = `${result.name}${result.sys && result.sys.country ? ", " + result.sys.country : ""}`;

    $("#weatherLocation").html(locationName);
    $("#currentDeg").html(Math.ceil(result.main.temp));
    if (result.weather && result.weather[0]) {
      $("#weatherDes").html(result.weather[0].description);
      checkWeatherCode(result.weather[0].id);
      $("#main-weather-icon-container").html(
        `<img src=${weatherSvg} alt="main-weather-icon" width="64" height="64"/>`
      );
    }
    $("#currentDate").html(getCurrentDate());

    if (result.wind) $("#wind-value").html(`${result.wind.speed} m/s`);
    if (result.main) {
      $("#humidity-value").html(`${result.main.humidity} %`);
      $("#pressure-value").html(`${result.main.pressure} hPa`);
    }

    // Database cache for offline persistence
    db.create("WEATHER_LOCATION", locationName);
    db.create("WEATHER_DEG", result.main.temp);
    db.create("WEATHER_FEELS_LIKE", result.main.feels_like);
    db.create("WEATHER_TEMP_MAX", result.main.temp_max);
    db.create("WEATHER_TEMP_MIN", result.main.temp_min);
    if (result.weather && result.weather[0]) {
      db.create("WEATHER_DESCRIPTION", result.weather[0].description);
      db.create("WEATHER_CODE", result.weather[0].id);
    }
    if (result.wind) db.create("SUB_WEATHER_WIND_VALUE", `${result.wind.speed} m/s`);
    if (result.main) {
      db.create("SUB_WEATHER_HUMIDITY_VALUE", `${result.main.humidity} %`);
      db.create("SUB_WEATHER_PRESSURE_VALUE", `${result.main.pressure} hPa`);
    }
  });
};

/* ────────────────────────────────────────────────────────────
   GET CURRENT WEATHER (by Coordinates or City Name)
──────────────────────────────────────────────────────────── */
export const getCurrentWeather = (location, lat = null, lon = null) => {
  let SEARCH_URL;

  if (lat !== null && lon !== null) {
    SEARCH_URL = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=${WEATHER_UNIT}`;
  } else {
    SEARCH_URL = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(location)}&appid=${API_KEY}&units=${WEATHER_UNIT}`;
  }

  fetch(SEARCH_URL)
    .then((res) => {
      if (res.status === 404) {
        Swal.fire({
          toast: true,
          position: "top",
          text: "Location not found",
          icon: "info",
          showConfirmButton: false,
          timer: 2000,
        });
        throw new Error("Location not found");
      }
      if (!res.ok) {
        throw new Error(`HTTP error ${res.status}`);
      }
      return res.json();
    })
    .then((result) => {
      if (result && result.cod === 200) {
        updateReactDom(result);
      }
    })
    .catch((err) => {
      console.error("Fetch weather error:", err);
      if (err.message !== "Location not found") {
        Swal.fire({
          toast: true,
          position: "top",
          text: "Unable to load weather data. Please try again.",
          icon: "warning",
          showConfirmButton: false,
          timer: 2000,
        });
      }
    });
};
