import React from "react";

const FutureWeatherComponent = (props) => {
  return (
    <div 
      className="hourly-card" 
      onClick={props.onClick}
      role="button"
      tabIndex="0"
    >
      <span className="hourly-time">{props.time}</span>
      <img
        src={props.icon}
        className="hourly-icon"
        alt="forecast weather icon"
      />
      <span className="hourly-temp">{props.weatherUnit}°</span>
    </div>
  );
};

export default FutureWeatherComponent;