import { useMemo } from "react";
import { usePokemonBattle } from "./hooks/usePokemonBattle";
import { capitalise } from "./utils";

import Header        from "./components/Header";
import PokemonCard   from "./components/PokemonCard";
import ResultBanner  from "./components/ResultBanner";
import Scoreboard    from "./components/Scoreboard";
import ChampionStrip from "./components/ChampionStrip";

export default function App() {
  const {
    currentPokemon,
    previousPokemon,
    battleResult,
    loading,
    error,
    loadCount,
    animKey,
    scores,
    champion,
    loadRandomPokemon,
  } = usePokemonBattle();

  const championName = useMemo(
    () => capitalise(champion?.name ?? ""),
    [champion?.name]
  );

  return (
    <div className="app">
      <Header />

      <button
        className="load-btn"
        onClick={loadRandomPokemon}
        disabled={loading}
        aria-label="Load a random Pokémon"
      >
        {loading ? "LOADING…" : "⚡ LOAD RANDOM POKÉMON"}
      </button>

      {loadCount > 0 && (
        <p className="load-counter">POKÉMON #{loadCount}</p>
      )}

      {error && (
        <p className="error-msg" role="alert">ERROR: {error}</p>
      )}

      <div className="arena" role="main" aria-label="Battle arena">
        <PokemonCard
          pokemon={previousPokemon}
          label="PREVIOUS"
          isChampion={
            !!champion &&
            !!previousPokemon &&
            champion.id === previousPokemon.id &&
            champion.id !== currentPokemon?.id
          }
          animKey={`prev-${animKey}`}
        />

        <div className="vs-divider" aria-hidden="true">
          <div className="vs-line" />
          <span className="vs-text">VS</span>
          <div className="vs-line" />
        </div>

        <PokemonCard
          pokemon={currentPokemon}
          label="CURRENT"
          isChampion={!!champion && !!currentPokemon && champion.id === currentPokemon.id}
          animKey={`curr-${animKey}`}
        />
      </div>

      <ResultBanner result={battleResult} />
      <Scoreboard scores={scores} />
      <ChampionStrip champion={champion} championName={championName} />
    </div>
  );
}
