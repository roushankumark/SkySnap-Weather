import React, { useEffect, useState, useRef, useCallback } from "react";
import { db } from "../backend/app_backend";
import weatherVideo from "../assets/weather.mp4";
import "./parallaxBackground.css";

/* ─────────────────────────────────────────────
   Lightweight CSS-only shooting stars rendered
   via a dedicated <canvas> — GPU-accelerated,
   no heavy library needed.
───────────────────────────────────────────── */
const ShootingStarCanvas = () => {
  const canvasRef = useRef(null);
  const starsRef  = useRef([]);
  const rafRef    = useRef(null);

  const createStar = useCallback((w, h) => ({
    x:       Math.random() * w * 0.7,
    y:       Math.random() * h * 0.45,
    len:     Math.random() * 120 + 60,
    speed:   Math.random() * 5  + 4,
    opacity: 0,
    maxOp:   Math.random() * 0.55 + 0.25,
    angle:   Math.PI / 5,
    phase:   "fade-in",
    life:    0,
    delay:   Math.random() * 420 + 180,
  }), []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let w = canvas.width  = window.innerWidth;
    let h = canvas.height = window.innerHeight;

    const POOL = 5;
    starsRef.current = Array.from({ length: POOL }, () => createStar(w, h));

    const onResize = () => {
      w = canvas.width  = window.innerWidth;
      h = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", onResize, { passive: true });

    const draw = () => {
      ctx.clearRect(0, 0, w, h);

      starsRef.current.forEach((s, i) => {
        if (s.delay > 0) { s.delay--; return; }

        if (s.phase === "fade-in") {
          s.opacity = Math.min(s.opacity + 0.04, s.maxOp);
          if (s.opacity >= s.maxOp) s.phase = "travel";
        } else if (s.phase === "travel") {
          s.x     += Math.cos(s.angle) * s.speed;
          s.y     += Math.sin(s.angle) * s.speed;
          s.life  += s.speed;
          if (s.life > s.len * 1.5) s.phase = "fade-out";
        } else {
          s.opacity = Math.max(s.opacity - 0.05, 0);
          s.x      += Math.cos(s.angle) * s.speed;
          s.y      += Math.sin(s.angle) * s.speed;
          if (s.opacity <= 0) {
            starsRef.current[i] = createStar(w, h);
            return;
          }
        }

        const dx = Math.cos(s.angle) * s.len;
        const dy = Math.sin(s.angle) * s.len;
        const grad = ctx.createLinearGradient(
          s.x, s.y, s.x - dx, s.y - dy
        );
        grad.addColorStop(0,   `rgba(255,255,255,${s.opacity})`);
        grad.addColorStop(0.3, `rgba(200,230,255,${s.opacity * 0.5})`);
        grad.addColorStop(1,   `rgba(200,230,255,0)`);

        ctx.beginPath();
        ctx.strokeStyle = grad;
        ctx.lineWidth   = 1.5;
        ctx.moveTo(s.x, s.y);
        ctx.lineTo(s.x - dx, s.y - dy);
        ctx.stroke();

        ctx.beginPath();
        ctx.fillStyle = `rgba(255,255,255,${s.opacity})`;
        ctx.arc(s.x, s.y, 1.2, 0, Math.PI * 2);
        ctx.fill();
      });

      rafRef.current = requestAnimationFrame(draw);
    };

    rafRef.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", onResize);
    };
  }, [createStar]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 4,
        pointerEvents: "none",
        opacity: 1,
      }}
    />
  );
};

/* ─────────────────────────────────────────────
   Main background component with weather.mp4
───────────────────────────────────────────── */
const ParallaxBackground = ({ children }) => {
  const [weatherCondition, setWeatherCondition] = useState("sunny");
  const videoRef = useRef(null);

  useEffect(() => {
    // Force playback to bypass Chrome strict autoplay restrictions
    if (videoRef.current) {
      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch((err) => {
          console.warn("Autoplay playback notice:", err);
        });
      }
    }
  }, []);

  useEffect(() => {
    const updateCondition = () => {
      const code  = parseInt(db.get("WEATHER_CODE") || 800);
      const hour  = new Date().getHours();
      const isNight  = hour < 6 || hour >= 19;
      const isSunset = (hour >= 17 && hour < 19) || (hour >= 5 && hour < 6);

      if      (isSunset && (code === 800 || code === 801))  setWeatherCondition("sunset");
      else if (isNight  && (code === 800 || code === 801))  setWeatherCondition("night");
      else if (code >= 200 && code < 300)                   setWeatherCondition("thunderstorm");
      else if (code >= 300 && code < 600)                   setWeatherCondition("rainy");
      else if (code >= 600 && code < 700)                   setWeatherCondition("snowy");
      else if (code > 800)                                  setWeatherCondition("cloudy");
      else                                                  setWeatherCondition("sunny");
    };

    updateCondition();
    const interval = setInterval(updateCondition, 3000);
    return () => clearInterval(interval);
  }, []);

  const showStars = weatherCondition === "night";

  return (
    <React.Fragment>
      <div className="parallax-background-container">
        {/* Fullscreen Video Background */}
        <video
          ref={videoRef}
          autoPlay
          loop
          muted
          playsInline
          className="background-video"
        >
          <source src={weatherVideo} type="video/mp4" />
          <source src="/weather.mp4" type="video/mp4" />
        </video>

        {/* Video Overlay Tint for subtle contrast & readability */}
        <div className="background-video-overlay" />

        {/* Atmosphere Mesh Layers (translucent accent overlay) */}
        {["sunny", "cloudy", "rainy", "thunderstorm", "snowy", "night", "sunset"].map((c) => (
          <div
            key={c}
            className={`atmosphere-layer atmosphere-${c} ${weatherCondition === c ? "active" : ""}`}
          >
            <div className="mesh-gradient" />
          </div>
        ))}

        {/* Shooting stars — only at night */}
        {showStars && <ShootingStarCanvas />}
      </div>

      {/* App content */}
      {children}
    </React.Fragment>
  );
};

export default ParallaxBackground;
