import React from "react";
import { RESULT_CONFIG } from "../constants";

const ResultBanner = React.memo(function ResultBanner({ result }) {
  if (!result) return null;

  const config = RESULT_CONFIG[result] ?? { color: "#fff", icon: "❓" };

  return (
    <div
      className="result-banner flash-in"
      style={{ "--result-color": config.color }}
      role="status"
      aria-live="polite"
    >
      <span className="result-icon" aria-hidden="true">{config.icon}</span>
      <span className="result-text">{result}</span>
      <span className="result-icon" aria-hidden="true">{config.icon}</span>
    </div>
  );
});

export default ResultBanner;
