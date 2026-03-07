import React from "react";
import { TYPE_COLORS } from "../constants";
import { calcBaseStatTotal, getSpriteUrl } from "../utils";

const PokemonCard = React.memo(function PokemonCard({ pokemon, label, isChampion, animKey }) {
  const primaryType = pokemon?.types?.[0]?.type?.name ?? "normal";
  const colors = TYPE_COLORS[primaryType] ?? TYPE_COLORS.normal;

  return (
    <div
      className="card-wrapper"
      style={{ "--accent": colors.accent, "--type-bg": colors.bg }}
    >
      <span className="card-label">{label}</span>

      {isChampion && (
        <span className="champion-badge">⚔ STRONGEST</span>
      )}

      {pokemon ? (
        <div key={animKey} className="pokemon-card fade-in">
          <div
            className="sprite-container"
            style={{
              background: `radial-gradient(circle, ${colors.accent}44 0%, transparent 70%)`,
            }}
          >
            <img
              src={getSpriteUrl(pokemon)}
              alt={pokemon.name}
              className="sprite"
            />
          </div>

          <h2 className="pokemon-name">{pokemon.name}</h2>

          <div className="types-row">
            {pokemon.types.map((t) => {
              const c = TYPE_COLORS[t.type.name] ?? TYPE_COLORS.normal;
              return (
                <span
                  key={t.type.name}
                  className="type-badge"
                  style={{ background: c.bg, boxShadow: `0 0 8px ${c.accent}88` }}
                >
                  {t.type.name}
                </span>
              );
            })}
          </div>

          <div className="stats-grid">
            <div className="stat-box">
              <span className="stat-label">HEIGHT</span>
              <span className="stat-value">{(pokemon.height / 10).toFixed(1)} m</span>
            </div>
            <div className="stat-box">
              <span className="stat-label">WEIGHT</span>
              <span className="stat-value">{(pokemon.weight / 10).toFixed(1)} kg</span>
            </div>
            <div className="stat-box full-width">
              <span className="stat-label">BASE STAT TOTAL</span>
              <span className="stat-value">{calcBaseStatTotal(pokemon)}</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="pokemon-card placeholder">
          <div className="pokeball-placeholder">
            <div className="pokeball-top" />
            <div className="pokeball-band" />
            <div className="pokeball-bottom" />
            <div className="pokeball-button" />
          </div>
          <p className="placeholder-text">Awaiting Pokémon…</p>
        </div>
      )}
    </div>
  );
});

export default PokemonCard;
