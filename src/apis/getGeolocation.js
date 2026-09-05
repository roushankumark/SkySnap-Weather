import { db } from "../backend/app_backend";
import Swal from "sweetalert2";
import * as weatherAPI from "./getCurrentWeather";

export const getGeolocation = () => {
  if (!navigator.geolocation) {
    Swal.fire({
      toast: true,
      position: "top",
      text: "Unable to detect your current location.",
      icon: "error",
      timer: 3000,
      showConfirmButton: false,
      background: "rgba(15, 23, 42, 0.92)",
      color: "#fff",
    });
    return;
  }

  const OPTIONS = {
    enableHighAccuracy: true,
    timeout: 10000,
    maximumAge: 60000,
  };

  const onSuccess = async (position) => {
    const lat = position.coords.latitude;
    const lon = position.coords.longitude;

    // Save coords to database
    db.create("USER_LATITUDE", lat);
    db.create("USER_LONGITUDE", lon);

    let cityName = "Current Location";

    // 1. Attempt reverse geocoding via Open-Meteo Reverse Geocoding API
    try {
      const reverseUrl = `https://geocoding-api.open-meteo.com/v1/reverse?latitude=${lat}&longitude=${lon}&format=json`;
      const res = await fetch(reverseUrl);
      if (res.ok) {
        const data = await res.json();
        if (data && data.results && data.results.length > 0) {
          const loc = data.results[0];
          cityName = `${loc.name}${loc.country ? ", " + loc.country : ""}`;
        }
      }
    } catch (e) {
      console.warn("Reverse geocode attempt failed, using coords fallback:", e);
    }

    // 2. Fetch weather using exact coordinates and resolved city name
    weatherAPI.getCurrentWeather(cityName, lat, lon);

    // 3. Show liquid-glass success toast
    Swal.fire({
      toast: true,
      position: "top",
      text: `Location detected: ${cityName}`,
      icon: "success",
      timer: 2500,
      showConfirmButton: false,
      background: "rgba(15, 23, 42, 0.92)",
      color: "#ffffff",
    });
  };

  const onError = (err) => {
    console.warn("Geolocation error code:", err.code, err.message);
    let errorMsg = "Unable to detect your current location.";

    if (err.code === 1) { // PERMISSION_DENIED
      errorMsg = "Location permission is disabled. Please allow location access in your browser.";
    } else if (err.code === 2) { // POSITION_UNAVAILABLE
      errorMsg = "Unable to detect your current location.";
    } else if (err.code === 3) { // TIMEOUT
      errorMsg = "Location detection timed out. Please try again.";
    }

    Swal.fire({
      toast: true,
      position: "top",
      text: errorMsg,
      icon: "warning",
      timer: 3000,
      showConfirmButton: false,
      background: "rgba(15, 23, 42, 0.92)",
      color: "#ffffff",
    });
  };

  navigator.geolocation.getCurrentPosition(onSuccess, onError, OPTIONS);
};

export default getGeolocation;
