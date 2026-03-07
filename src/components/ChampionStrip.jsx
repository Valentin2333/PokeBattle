import React from "react";
import { calcBaseStatTotal, getSpriteUrl } from "../utils";

const ChampionStrip = React.memo(function ChampionStrip({ champion, championName }) {
  if (!champion) return null;

  return (
    <section className="champion-strip" aria-label="Strongest Pokémon tracker">
      <img
        src={getSpriteUrl(champion)}
        alt={champion.name}
        className="champion-sprite"
      />
      <div className="champion-info">
        <span className="champion-label">⚔ STRONGEST POKÉMON SEEN</span>
        <span className="champion-poke-name">{championName}</span>
        <span className="champion-bst">
          BASE STAT TOTAL: {calcBaseStatTotal(champion)}
        </span>
      </div>
    </section>
  );
});

export default ChampionStrip;
