import React from "react";

const Scoreboard = React.memo(function Scoreboard({ scores }) {
  const items = [
    { label: "TYPE\nMATCHES",  value: scores.matches },
    { label: "NEW\nWINS",      value: scores.newWins },
    { label: "PREV\nWINS",     value: scores.prevWins },
    { label: "NO\nADVANTAGE", value: scores.noAdvantage },
  ];

  return (
    <section className="scoreboard" aria-label="Battle score counters">
      {items.map(({ label, value }) => (
        <div className="score-item" key={label}>
          <span className="score-label" style={{ whiteSpace: "pre" }}>
            {label}
          </span>
          <span className="score-value">{value}</span>
        </div>
      ))}
    </section>
  );
});

export default Scoreboard;
