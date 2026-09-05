import React, { useState } from "react";
import Footer from "../components/footer";
import Spinner from "../components/spinner";
import navigate from "../inc/scripts/utilities";

const faqs = [
  {
    q: "How do I change my location?",
    a: "Tap the Search icon in the bottom navigation, type your city name, and select it from the suggestions. Your weather will update immediately."
  },
  {
    q: "How do I use my current GPS location?",
    a: "On the main weather screen, tap the 'Current Location' button in the location card. Your browser will ask for permission — allow it and SkySnap will load weather for your exact location."
  },
  {
    q: "How do I switch between °C and °F?",
    a: "Go to Settings (⚙️ icon in the navigation), find the Temperature Unit section, and tap Celsius or Fahrenheit. Tap 'Apply Unit' and then search your city again to refresh the data."
  },
  {
    q: "Why can't my city be found?",
    a: "Try spelling the city name differently or include the country code (e.g. 'Paris, FR' or 'Springfield, US'). Some very small towns may not be in the OpenWeatherMap database."
  },
  {
    q: "How often is weather data updated?",
    a: "Weather data is fetched live from the OpenWeatherMap API every time you search or use current location. Data is typically updated every 10 minutes at the source."
  },
  {
    q: "Why is the forecast not showing?",
    a: "The 5-day hourly forecast requires a successful location search first. Search your city on the main page, then tap the 'Tomorrow' or '5 Days' tab to see the extended forecast."
  },
  {
    q: "What does 'Feels Like' mean?",
    a: "'Feels Like' (apparent temperature) accounts for wind chill, humidity, and solar radiation to give you a more accurate sense of how the weather actually feels on your skin."
  },
  {
    q: "How do I reset the app?",
    a: "Go to Settings → Reset → Restore Factory Settings. This clears all saved data and returns you to the initial setup screen."
  },
];

const Support = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const toggle = (i) => setOpenIndex(openIndex === i ? null : i);

  return (
    <React.Fragment>
      <Spinner />
      <div id="supportPage">
        <div className="page-card">
          {/* Header */}
          <section className="app-header">
            <div className="toggle-btn" onClick={() => navigate("/weather")} title="Back">
              <svg height="20" viewBox="0 0 512 512" width="20" xmlns="http://www.w3.org/2000/svg" fill="white">
                <polygon points="352,128.4 319.7,96 160,256 319.7,416 352,383.6 224.7,256" />
              </svg>
            </div>
            <div style={{ textAlign: "center" }}>
              <h5 className="fw-bold" style={{ margin: 0, fontSize: "1.15rem" }}>Help & Support</h5>
              <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.75rem", margin: 0 }}>SkySnap Weather</p>
            </div>
            <div style={{ width: 40 }} />
          </section>

          {/* Hero blurb */}
          <div className="support-hero">
            <div className="support-hero-icon">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="32" height="32" fill="white">
                <path d="M256 8C119.043 8 8 119.083 8 256c0 136.997 111.043 248 248 248s248-111.003 248-248C504 119.083 392.957 8 256 8zm0 110c23.196 0 42 18.804 42 42s-18.804 42-42 42-42-18.804-42-42 18.804-42 42-42zm56 254c0 6.627-5.373 12-12 12h-88c-6.627 0-12-5.373-12-12v-24c0-6.627 5.373-12 12-12h12v-64h-12c-6.627 0-12-5.373-12-12v-24c0-6.627 5.373-12 12-12h64c6.627 0 12 5.373 12 12v100h12c6.627 0 12 5.373 12 12v24z"/>
              </svg>
            </div>
            <div>
              <h6 style={{ fontWeight: 700, margin: "0 0 4px 0" }}>How can we help?</h6>
              <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.85rem", margin: 0 }}>Find answers to common questions below</p>
            </div>
          </div>

          {/* FAQ */}
          <p className="settings-section-header">❓ Frequently Asked Questions</p>
          <div className="faq-list">
            {faqs.map((item, i) => (
              <div key={i} className={`faq-item ${openIndex === i ? "open" : ""}`} onClick={() => toggle(i)}>
                <div className="faq-question">
                  <span>{item.q}</span>
                  <svg
                    className="faq-arrow"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 320 512"
                    width="12" height="12" fill="rgba(255,255,255,0.5)"
                    style={{ transform: openIndex === i ? "rotate(90deg)" : "rotate(0deg)", transition: "transform 0.25s ease" }}
                  >
                    <path d="M285.476 272.971L91.132 467.314c-9.373 9.373-24.569 9.373-33.941 0l-22.667-22.667c-9.357-9.357-9.375-24.522-.04-33.901L188.505 256 34.484 101.255c-9.335-9.379-9.317-24.544.04-33.901l22.667-22.667c9.373-9.373 24.569-9.373 33.941 0L285.475 239.03c9.373 9.372 9.373 24.568.001 33.941z"/>
                  </svg>
                </div>
                {openIndex === i && (
                  <div className="faq-answer">{item.a}</div>
                )}
              </div>
            ))}
          </div>

          {/* How to use */}
          <p className="settings-section-header">🚀 Quick Start Guide</p>
          <div className="settings-card">
            {[
              { step: "1", text: "Open SkySnap and enter a city name on the setup screen." },
              { step: "2", text: "The current weather loads automatically for your city." },
              { step: "3", text: "Use the Search tab to look up any city in the world." },
              { step: "4", text: "Tap 'Tomorrow' or '5 Days' tabs to see the extended forecast." },
              { step: "5", text: "Visit Settings to change temperature units or your default city." },
            ].map(({ step, text }) => (
              <div key={step} className="guide-step">
                <div className="guide-step-number">{step}</div>
                <p style={{ margin: 0, fontSize: "0.9rem", color: "rgba(255,255,255,0.8)" }}>{text}</p>
              </div>
            ))}
          </div>

          {/* App Info */}
          <p className="settings-section-header">📬 About</p>
          <div className="settings-card">
            <div className="settings-row" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", paddingBottom: 16, marginBottom: 16 }}>
              <div className="settings-row-left">
                <div className="settings-row-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 496 512" width="18" height="18" fill="rgba(255,255,255,0.8)"><path d="M165.9 397.4c0 2-2.3 3.6-5.2 3.6-3.3.3-5.6-1.3-5.6-3.6 0-2 2.3-3.6 5.2-3.6 3-.3 5.6 1.3 5.6 3.6zm-31.1-4.5c-.7 2 1.3 4.3 4.3 4.9 2.6 1 5.6 0 6.2-2s-1.3-4.3-4.3-5.2c-2.6-.7-5.5.3-6.2 2.3zm44.2-1.7c-2.9.7-4.9 2.6-4.6 4.9.3 2 2.9 3.3 5.9 2.6 2.9-.7 4.9-2.6 4.6-4.6-.3-1.9-3-3.2-5.9-2.9zM244.8 8C106.1 8 0 113.3 0 252c0 110.9 69.8 205.8 169.5 239.2 12.8 2.3 17.3-5.6 17.3-12.1 0-6.2-.3-40.4-.3-61.4 0 0-70 15-84.7-29.8 0 0-11.4-29.1-27.8-36.6 0 0-22.9-15.7 1.6-15.4 0 0 24.9 2 38.6 25.8 21.9 38.6 58.6 27.5 72.9 20.9 2.3-16 8.8-27.1 16-33.7-55.9-6.2-112.3-14.3-112.3-110.5 0-27.5 7.6-41.3 23.6-58.9-2.6-6.5-11.1-33.3 2.6-67.9 20.9-6.5 69 27 69 27 20-5.6 41.5-8.5 62.8-8.5s42.8 2.9 62.8 8.5c0 0 48.1-33.6 69-27 13.7 34.7 5.2 61.4 2.6 67.9 16 17.7 25.8 31.5 25.8 58.9 0 96.5-58.9 104.2-114.8 110.5 9.2 7.9 17 22.9 17 46.4 0 33.7-.3 75.4-.3 83.6 0 6.5 4.6 14.4 17.3 12.1C428.2 457.8 496 362.9 496 252 496 113.3 383.5 8 244.8 8zM97.2 352.9c-1.3 1-1 3.3.7 5.2 1.6 1.6 3.9 2.3 5.2 1 1.3-1 1-3.3-.7-5.2-1.6-1.6-3.9-2.3-5.2-1zm-10.8-8.1c-.7 1.3.3 2.9 2.3 3.9 1.6 1 3.6.7 4.3-.7.7-1.3-.3-2.9-2.3-3.9-2-.6-3.6-.3-4.3.7zm32.4 35.6c-1.6 1.3-1 4.3 1.3 6.2 2.3 2.3 5.2 2.6 6.5 1 1.3-1.3.7-4.3-1.3-6.2-2.2-2.3-5.2-2.6-6.5-1zm-11.4-14.7c-1.6 1-1.6 3.6 0 5.9 1.6 2.3 4.3 3.3 5.6 2.3 1.6-1.3 1.6-3.9 0-6.2-1.4-2.3-4-3.3-5.6-2z"/></svg>
                </div>
                <div>
                  <p className="settings-row-title">View Source Code ~ Roushan Kumar </p>
                  <p className="settings-row-subtitle">github.com/roushankumark</p>
                </div>
              </div>
              <button className="settings-action-btn" onClick={() => window.open("https://github.com/roushankumark", "_blank")}>Open</button>
            </div>
            <div style={{ textAlign: "center", paddingTop: 8 }}>
              <p style={{ color: "rgba(255,255,255,0.35)", fontSize: "0.75rem" }}>SkySnap v1.0 · Built with React & OpenWeatherMap</p>
            </div>
          </div>

        </div>
        <Footer />
      </div>
    </React.Fragment>
  );
};

export default Support;
