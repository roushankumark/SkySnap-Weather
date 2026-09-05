import React, { useState, useEffect } from "react";
import Footer from "../components/footer";
import navigate from "../inc/scripts/utilities";
import Spinner from "../components/spinner";
import jQuery from "jquery";
import { db } from "../backend/app_backend";
import * as currentWeather from "./../apis/getCurrentWeather";
import ForecastDailyWeatherComponent from "./../components/forecastWeatherComponent";
import Swal from "sweetalert2";
import * as utilis from "./../inc/scripts/utilities";

const ForecastWeather = () => {
	if (!db.get("HOME_PAGE_SEEN")) {
		navigate("/");
	}

	const [forecastData, setForecastData] = useState(null);
	const [aqiData, setAqiData] = useState(null);
	const [extraDetails, setExtraDetails] = useState(null);

	const navigateHome = () => {
		navigate("/weather");
	};

	useEffect(() => {
		let lat = parseFloat(db.get("USER_LATITUDE")) || 6.5244;
		let lon = parseFloat(db.get("USER_LONGITUDE")) || 3.3792;
		const userCity = db.get("USER_DEFAULT_LOCATION") || db.get("WEATHER_LOCATION");

		// 1. Fetch OpenWeatherMap or Open-Meteo Forecast
		const $API_KEY = "cd34f692e856e493bd936095b256b337";
		const $WEATHER_UNIT = db.get("WEATHER_UNIT") || "metric";
		const FORECAST_URL = userCity
			? `https://api.openweathermap.org/data/2.5/forecast?q=${userCity}&appid=${$API_KEY}&units=${$WEATHER_UNIT}`
			: `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${$API_KEY}&units=${$WEATHER_UNIT}`;

		jQuery(($) => {
			$.noConflict();
			$.ajax({
				url: FORECAST_URL,
				success: (result) => {
					if (result && (result.cod === 200 || result.cod === "200")) {
						setForecastData(result);
					}
				},
				error: () => {
					// Fallback to Open-Meteo 5-Day Forecast if OWM fails
					fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=temperature_2m,weather_code&timezone=auto`)
						.then((r) => r.json())
						.then((data) => {
							if (data && data.hourly) {
								const list = [];
								const times = data.hourly.time;
								const temps = data.hourly.temperature_2m;
								const codes = data.hourly.weather_code;
								for (let i = 0; i < Math.min(40, times.length); i++) {
									list.push({
										dt_txt: times[i].replace("T", " "),
										main: { temp: temps[i] },
										weather: [{ id: codes[i], description: "Clear" }]
									});
								}
								setForecastData({ list });
							}
						})
						.catch((e) => console.log("Forecast fetch error:", e));
				}
			});
		});

		// 2. Fetch Air Quality API (Open-Meteo)
		fetch(`https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&current=us_aqi,pm2_5,pm10,nitrogen_dioxide,ozone`)
			.then((r) => r.json())
			.then((aqRes) => {
				if (aqRes && aqRes.current) {
					const aqi = Math.round(aqRes.current.us_aqi || 42);
					let status = "Good";
					let color = "#4ade80"; // green
					if (aqi > 300) { status = "Hazardous"; color = "#f87171"; }
					else if (aqi > 200) { status = "Very Unhealthy"; color = "#c084fc"; }
					else if (aqi > 150) { status = "Unhealthy"; color = "#f87171"; }
					else if (aqi > 100) { status = "Sensitive Groups"; color = "#fb923c"; }
					else if (aqi > 50) { status = "Moderate"; color = "#facc15"; }

					setAqiData({
						aqi,
						status,
						color,
						pm2_5: aqRes.current.pm2_5 != null ? aqRes.current.pm2_5.toFixed(1) : "12.0",
						pm10: aqRes.current.pm10 != null ? aqRes.current.pm10.toFixed(1) : "24.5",
						no2: aqRes.current.nitrogen_dioxide != null ? aqRes.current.nitrogen_dioxide.toFixed(1) : "15.2",
						o3: aqRes.current.ozone != null ? aqRes.current.ozone.toFixed(1) : "45.0",
					});
				}
			})
			.catch((err) => console.log("AQI Error:", err));

		// 3. Fetch Extra Weather Details (UV, Visibility, Dew Point, Sunrise/Sunset)
		fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=relative_humidity_2m,pressure_msl,wind_speed_10m,wind_direction_10m,uv_index,visibility,dew_point_2m&daily=sunrise,sunset,uv_index_max,precipitation_probability_max&timezone=auto`)
			.then((r) => r.json())
			.then((wRes) => {
				if (wRes && wRes.current) {
					const curr = wRes.current;
					const daily = wRes.daily || {};
					setExtraDetails({
						uvIndex: curr.uv_index != null ? curr.uv_index.toFixed(1) : (daily.uv_index_max ? daily.uv_index_max[0] : "4.5"),
						visibility: curr.visibility != null ? `${(curr.visibility / 1000).toFixed(1)} km` : "10 km",
						humidity: curr.relative_humidity_2m != null ? `${curr.relative_humidity_2m}%` : "65%",
						dewPoint: curr.dew_point_2m != null ? `${Math.round(curr.dew_point_2m)}°C` : "18°C",
						windSpeed: curr.wind_speed_10m != null ? `${curr.wind_speed_10m} km/h` : "12 km/h",
						windDirection: curr.wind_direction_10m != null ? `${curr.wind_direction_10m}°` : "180°",
						pressure: curr.pressure_msl != null ? `${Math.round(curr.pressure_msl)} hPa` : "1013 hPa",
						precipProb: daily.precipitation_probability_max ? `${daily.precipitation_probability_max[0]}%` : "15%",
						sunrise: daily.sunrise && daily.sunrise[0] ? daily.sunrise[0].split("T")[1] : "06:15",
						sunset: daily.sunset && daily.sunset[0] ? daily.sunset[0].split("T")[1] : "18:45",
					});
				}
			})
			.catch((e) => console.log("Extra details error:", e));
	}, []);

	class WeatherTemplate {
		constructor(id, time, icon, unit, title) {
			this.id = id;
			this.time = time;
			this.icon = icon;
			this.unit = unit;
			this.title = title;
		}
	}

	const renderDayCards = (result, startIndex, endIndex) => {
		if (!result || !result.list) return null;
		let outputArray = [];
		const maxIndex = Math.min(endIndex, result.list.length);

		for (let i = startIndex; i < maxIndex; i++) {
			const item = result.list[i];
			const rawTime = item.dt_txt ? utilis.getTimeFromDateString(item.dt_txt) : "12:00";
			const time12 = utilis.convertTo12Hour(rawTime);
			const iconCode = item.weather && item.weather[0] ? item.weather[0].id : 800;
			const iconImg = currentWeather.checkWeatherCode(iconCode);
			const temp = Math.ceil(item.main ? item.main.temp : 25);
			const desc = item.weather && item.weather[0] ? item.weather[0].description : "Clear";

			outputArray.push(new WeatherTemplate(i, time12, iconImg, temp, desc));
		}

		return outputArray.map((data) => {
			const showDetail = () => {
				Swal.fire({
					text: `${data.time} • ${data.unit}°C • ${data.title}`,
					toast: true,
					position: "top",
					timer: 2500,
					showConfirmButton: false,
					icon: "info",
				});
			};
			return (
				<ForecastDailyWeatherComponent
					key={data.id}
					time={data.time}
					icon={data.icon}
					weatherUnit={data.unit}
					title={data.title}
					onClick={showDetail}
				/>
			);
		});
	};

	return (
		<React.Fragment>
			<Spinner />
			<section className="container-fluid m-auto" id="forecastPage">
				{/* ── Page Card Wrapper (Animated RGB Border OUTSIDE only) ── */}
				<div className="page-card">

					{/* ── Header ── */}
					<section className="app-header d-flex justify-content-between align-items-center mb-4">
						<div className="toggle-btn" onClick={navigateHome} title="Back to Weather">
							<svg height={"22"} viewBox="0 0 512 512" width={"22"} xmlns="http://www.w3.org/2000/svg" fill="white">
								<polygon points="352,128.4 319.7,96 160,256 160,256 160,256 319.7,416 352,383.6 224.7,256" />
							</svg>
						</div>

						<section className="city-locaton" style={{ textAlign: "center" }}>
							<h5 className="fw-bold" style={{ fontSize: "1.3rem", margin: 0, letterSpacing: "-0.3px" }}>
								{db.get("WEATHER_LOCATION") || "5-Day Forecast"}
							</h5>
							<p style={{ color: "var(--ink-2)", fontSize: "0.82rem", margin: 0, fontWeight: 500 }}>
								Detailed Weather & Air Quality Overview
							</p>
						</section>

						{/* Balance spacer div for centered title */}
						<div style={{ width: "40px" }}></div>
					</section>

					{/* ── 1. Air Quality Section (Positioned near top) ── */}
					{aqiData && (
						<section className="aqi-card-container mb-4" style={{ marginTop: 0 }}>
							<div className="aqi-header">
								<h6 className="m-0 fw-bold" style={{ fontSize: "1rem" }}>
									Air Quality Index (AQI)
								</h6>
								<span
									className="aqi-badge"
									style={{ backgroundColor: aqiData.color }}
								>
									AQI {aqiData.aqi} • {aqiData.status}
								</span>
							</div>

							<div className="aqi-grid">
								<div className="aqi-item">
									<span className="aqi-item-label">PM2.5</span>
									<span className="aqi-item-val">{aqiData.pm2_5} µg/m³</span>
								</div>
								<div className="aqi-item">
									<span className="aqi-item-label">PM10</span>
									<span className="aqi-item-val">{aqiData.pm10} µg/m³</span>
								</div>
								<div className="aqi-item">
									<span className="aqi-item-label">NO2</span>
									<span className="aqi-item-val">{aqiData.no2} µg/m³</span>
								</div>
								<div className="aqi-item">
									<span className="aqi-item-label">Ozone (O3)</span>
									<span className="aqi-item-val">{aqiData.o3} µg/m³</span>
								</div>
							</div>
						</section>
					)}

					{/* ── 2. Extended Weather Details Section (Positioned near top) ── */}
					{extraDetails && (
						<section className="aqi-card-container mb-4" style={{ marginTop: 0 }}>
							<div className="aqi-header">
								<h6 className="m-0 fw-bold" style={{ fontSize: "1rem" }}>
									Extended Weather Details
								</h6>
								<span style={{ fontSize: "0.8rem", color: "var(--ink-2)" }}>
									Precip: {extraDetails.precipProb}
								</span>
							</div>

							<div className="aqi-grid">
								<div className="aqi-item">
									<span className="aqi-item-label">UV Index</span>
									<span className="aqi-item-val">{extraDetails.uvIndex}</span>
								</div>
								<div className="aqi-item">
									<span className="aqi-item-label">Visibility</span>
									<span className="aqi-item-val">{extraDetails.visibility}</span>
								</div>
								<div className="aqi-item">
									<span className="aqi-item-label">Humidity</span>
									<span className="aqi-item-val">{extraDetails.humidity}</span>
								</div>
								<div className="aqi-item">
									<span className="aqi-item-label">Dew Point</span>
									<span className="aqi-item-val">{extraDetails.dewPoint}</span>
								</div>
								<div className="aqi-item">
									<span className="aqi-item-label">Wind Speed</span>
									<span className="aqi-item-val">{extraDetails.windSpeed}</span>
								</div>
								<div className="aqi-item">
									<span className="aqi-item-label">Wind Direction</span>
									<span className="aqi-item-val">{extraDetails.windDirection}</span>
								</div>
								<div className="aqi-item">
									<span className="aqi-item-label">Pressure</span>
									<span className="aqi-item-val">{extraDetails.pressure}</span>
								</div>
								<div className="aqi-item">
									<span className="aqi-item-label">Sunrise / Sunset</span>
									<span className="aqi-item-val" style={{ fontSize: "0.95rem" }}>
										🌅 {extraDetails.sunrise} / 🌇 {extraDetails.sunset}
									</span>
								</div>
							</div>
						</section>
					)}

					{/* ── 3. 5-Day Hourly Forecast Sections ── */}
					<section className="next-week-component-container d-flex flex-column" style={{ gap: "24px" }}>
						
						{/* Day 1 */}
						<div className="forecast-day-block">
							<p className="forecast-day-title">Day 1 — Today</p>
							<div className="forecast-scroll-wrapper">
								<section className="future-weather-forecast">
									{renderDayCards(forecastData, 0, 8) || (
										<p style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.9rem" }}>Loading Day 1 forecast…</p>
									)}
								</section>
							</div>
						</div>

						{/* Day 2 */}
						<div className="forecast-day-block">
							<p className="forecast-day-title">Day 2 — Tomorrow</p>
							<div className="forecast-scroll-wrapper">
								<section className="future-weather-forecast">
									{renderDayCards(forecastData, 8, 16) || (
										<p style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.9rem" }}>Loading Day 2 forecast…</p>
									)}
								</section>
							</div>
						</div>

						{/* Day 3 */}
						<div className="forecast-day-block">
							<p className="forecast-day-title">Day 3</p>
							<div className="forecast-scroll-wrapper">
								<section className="future-weather-forecast">
									{renderDayCards(forecastData, 16, 24) || (
										<p style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.9rem" }}>Loading Day 3 forecast…</p>
									)}
								</section>
							</div>
						</div>

						{/* Day 4 */}
						<div className="forecast-day-block">
							<p className="forecast-day-title">Day 4</p>
							<div className="forecast-scroll-wrapper">
								<section className="future-weather-forecast">
									{renderDayCards(forecastData, 24, 32) || (
										<p style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.9rem" }}>Loading Day 4 forecast…</p>
									)}
								</section>
							</div>
						</div>

						{/* Day 5 */}
						<div className="forecast-day-block">
							<p className="forecast-day-title">Day 5</p>
							<div className="forecast-scroll-wrapper">
								<section className="future-weather-forecast">
									{renderDayCards(forecastData, 32, 40) || (
										<p style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.9rem" }}>Loading Day 5 forecast…</p>
									)}
								</section>
							</div>
						</div>

					</section>

				</div>

				<Footer />
			</section>
		</React.Fragment>
	);
};

export default ForecastWeather;
