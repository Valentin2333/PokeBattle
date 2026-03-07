import { useState, useCallback, useMemo, useRef } from "react";
import { MAX_POKEMON_ID } from "../constants";
import { randomInt, calcBaseStatTotal } from "../utils";

export function usePokemonBattle() {
  const [currentPokemon,  setCurrentPokemon]  = useState(null);
  const [previousPokemon, setPreviousPokemon] = useState(null);
  const [battleResult,    setBattleResult]    = useState(null);
  const [loading,         setLoading]         = useState(false);
  const [error,           setError]           = useState(null);
  const [loadCount,       setLoadCount]       = useState(0);
  const [animKey,         setAnimKey]         = useState(0);
  const [scores,          setScores]          = useState({ matches: 0, newWins: 0, prevWins: 0 });
  const [champion,        setChampion]        = useState(null);

  const typeCache = useRef({});

  const fetchTypeData = useCallback(async (typeName) => {
    if (typeCache.current[typeName]) return typeCache.current[typeName];
    const res = await fetch(`https://pokeapi.co/api/v2/type/${typeName}`);
    if (!res.ok) throw new Error(`Failed to fetch type data for: ${typeName}`);
    const data = await res.json();
    typeCache.current[typeName] = data;
    return data;
  }, []);

  const determineResult = useCallback(async (newPoke, prevPoke) => {
    const newType  = newPoke.types[0].type.name;
    const prevType = prevPoke.types[0].type.name;

    if (newType === prevType) return "TYPE MATCH!";

    const newTypeData      = await fetchTypeData(newType);
    const doubleDamageTo   = newTypeData.damage_relations.double_damage_to.map(t => t.name);
    const doubleDamageFrom = newTypeData.damage_relations.double_damage_from.map(t => t.name);

    if (doubleDamageTo.includes(prevType))  return "NEW POKÉMON WINS!";
    if (doubleDamageFrom.includes(newType)) return "PREVIOUS POKÉMON WINS!";

    const prevTypeData = await fetchTypeData(prevType);
    const prevDamageTo = prevTypeData.damage_relations.double_damage_to.map(t => t.name);

    if (prevDamageTo.includes(newType)) return "PREVIOUS POKÉMON WINS!";

    return "NO ADVANTAGE";
  }, [fetchTypeData]);

  const loadRandomPokemon = useCallback(async () => {
    setLoading(true);
    setError(null);
    setBattleResult(null);

    try {
      const id  = randomInt(1, MAX_POKEMON_ID);
      const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
      if (!res.ok) throw new Error("Failed to fetch Pokémon — please try again.");
      const newPoke = await res.json();

      setAnimKey(k => k + 1);
      setLoadCount(c => c + 1);

      setChampion(prev => {
        const newBST  = calcBaseStatTotal(newPoke);
        const prevBST = calcBaseStatTotal(prev);
        return newBST > prevBST ? newPoke : prev;
      });

      if (currentPokemon) {
        const result = await determineResult(newPoke, currentPokemon);
        setBattleResult(result);
        setScores(s => ({
          matches:  s.matches  + (result === "TYPE MATCH!"            ? 1 : 0),
          newWins:  s.newWins  + (result === "NEW POKÉMON WINS!"      ? 1 : 0),
          prevWins: s.prevWins + (result === "PREVIOUS POKÉMON WINS!" ? 1 : 0),
        }));
      }

      setPreviousPokemon(currentPokemon);
      setCurrentPokemon(newPoke);

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [currentPokemon, determineResult]);

  const scoreSummary = useMemo(() => {
    const battles     = Math.max(0, loadCount - 1);
    const counted     = scores.matches + scores.newWins + scores.prevWins;
    const noAdvantage = Math.max(0, battles - counted);
    return { ...scores, noAdvantage, battles };
  }, [scores, loadCount]);

  return {
    currentPokemon,
    previousPokemon,
    battleResult,
    loading,
    error,
    loadCount,
    animKey,
    scores: scoreSummary,
    champion,
    loadRandomPokemon,
  };
}
