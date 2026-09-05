import React, { useEffect, useRef } from "react";
import Home from "./pages/Home";
import Support from "./pages/Support";
import { Routes, Route, BrowserRouter, useLocation, useNavigate } from "react-router-dom";
import WeatherApp from "./pages/Weather";
import WeatherMain from "./pages/WeatherMain";
import NotFound from "./pages/404";
import ForecastWeather from "./pages/ForecastWeather";
import Settings from "./pages/Settings";
import { registerNavigator } from "./inc/scripts/utilities";
import { db } from "./backend/app_backend";
import "./autoload";
import ParallaxBackground from "./components/parallaxBackground";

function AppContent() {
  const location = useLocation();
  const navigate = useNavigate();
  const prevPathRef = useRef(location.pathname);

  useEffect(() => {
    registerNavigator(navigate);
  }, [navigate]);

  const getOrder = (path) => {
    if (path === "/settings") return 1;
    if (path === "/support") return 2;
    return 0; // dashboard / weather / default
  };

  const prevOrder = getOrder(prevPathRef.current);
  const newOrder = getOrder(location.pathname);
  const slideDir = newOrder < prevOrder ? "slide-from-left" : "slide-from-right";

  useEffect(() => {
    prevPathRef.current = location.pathname;
  }, [location.pathname]);

  let homePageSeen = db.get("HOME_PAGE_SEEN");
  let DEFAULT_ROUTE_PAGE;
  homePageSeen
    ? (DEFAULT_ROUTE_PAGE = <WeatherApp />)
    : (DEFAULT_ROUTE_PAGE = <Home />);

  return (
    <div key={location.pathname} className={`page-transition-container ${slideDir}`}>
      <Routes location={location}>
        <Route index element={DEFAULT_ROUTE_PAGE} />
        <Route path="support" element={<Support />} />
        <Route path="weather" element={<WeatherApp />} />
        <Route path="dashboard" element={<WeatherApp />} />
        <Route path="weathermain" element={<WeatherMain />} />
        <Route path="forecast" element={<ForecastWeather />} />
        <Route path="settings" element={<Settings />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <ParallaxBackground>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </ParallaxBackground>
  );
}

export default App;
