import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { usePokemonBattle } from "../hooks/usePokemonBattle";

// ---------------------------------------------------------------------------
// Helpers / fixtures
// ---------------------------------------------------------------------------

const makePokemon = (overrides = {}) => ({
  id: 1,
  name: "bulbasaur",
  types: [{ type: { name: "grass" } }],
  stats: [
    { base_stat: 45 }, { base_stat: 49 }, { base_stat: 49 },
    { base_stat: 65 }, { base_stat: 65 }, { base_stat: 45 },
  ],
  sprites: {
    other: { "official-artwork": { front_default: "https://img.com/bulbasaur.png" } },
    front_default: "https://img.com/bulbasaur_f.png",
  },
  height: 7,
  weight: 69,
  ...overrides,
});

const makeTypeData = (doubleDamageTo = [], doubleDamageFrom = []) => ({
  damage_relations: {
    double_damage_to:   doubleDamageTo.map((n) => ({ name: n })),
    double_damage_from: doubleDamageFrom.map((n) => ({ name: n })),
  },
});

// Lightweight fetch mock factory
const mockFetch = (pokemonData, typeData = makeTypeData()) => {
  return vi.fn().mockImplementation((url) => {
    const isType = String(url).includes("/type/");
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve(isType ? typeData : pokemonData),
    });
  });
};

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("usePokemonBattle — initial state", () => {
  it("starts with all state set to null / false / 0", () => {
    const { result } = renderHook(() => usePokemonBattle());
    expect(result.current.currentPokemon).toBeNull();
    expect(result.current.previousPokemon).toBeNull();
    expect(result.current.battleResult).toBeNull();
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.loadCount).toBe(0);
    expect(result.current.champion).toBeNull();
  });

  it("returns zero scores initially", () => {
    const { result } = renderHook(() => usePokemonBattle());
    expect(result.current.scores).toMatchObject({
      matches: 0, newWins: 0, prevWins: 0, noAdvantage: 0, battles: 0,
    });
  });
});

describe("usePokemonBattle — first load", () => {
  afterEach(() => { vi.restoreAllMocks(); });

  it("sets loading to true during fetch, then false afterwards", async () => {
    global.fetch = mockFetch(makePokemon());
    const { result } = renderHook(() => usePokemonBattle());

    act(() => { result.current.loadRandomPokemon(); });
    expect(result.current.loading).toBe(true);

    await waitFor(() => expect(result.current.loading).toBe(false));
  });

  it("populates currentPokemon after first load", async () => {
    const pokemon = makePokemon();
    global.fetch = mockFetch(pokemon);
    const { result } = renderHook(() => usePokemonBattle());

    await act(() => result.current.loadRandomPokemon());
    expect(result.current.currentPokemon).toMatchObject({ id: 1, name: "bulbasaur" });
  });

  it("leaves previousPokemon as null after first load (no comparison yet)", async () => {
    global.fetch = mockFetch(makePokemon());
    const { result } = renderHook(() => usePokemonBattle());

    await act(() => result.current.loadRandomPokemon());
    expect(result.current.previousPokemon).toBeNull();
  });

  it("does not set a battleResult after the first load", async () => {
    global.fetch = mockFetch(makePokemon());
    const { result } = renderHook(() => usePokemonBattle());

    await act(() => result.current.loadRandomPokemon());
    expect(result.current.battleResult).toBeNull();
  });

  it("increments loadCount to 1", async () => {
    global.fetch = mockFetch(makePokemon());
    const { result } = renderHook(() => usePokemonBattle());

    await act(() => result.current.loadRandomPokemon());
    expect(result.current.loadCount).toBe(1);
  });

  it("sets the champion to the first pokémon loaded", async () => {
    const pokemon = makePokemon();
    global.fetch = mockFetch(pokemon);
    const { result } = renderHook(() => usePokemonBattle());

    await act(() => result.current.loadRandomPokemon());
    expect(result.current.champion).toMatchObject({ id: 1 });
  });
});

describe("usePokemonBattle — second load (battle logic)", () => {
  afterEach(() => { vi.restoreAllMocks(); });

  const runTwoLoads = async (firstPoke, secondPoke, typeData) => {
    let callCount = 0;
    global.fetch = vi.fn().mockImplementation((url) => {
      const isType = String(url).includes("/type/");
      if (isType) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve(typeData) });
      }
      callCount++;
      const pokemon = callCount === 1 ? firstPoke : secondPoke;
      return Promise.resolve({ ok: true, json: () => Promise.resolve(pokemon) });
    });

    const { result } = renderHook(() => usePokemonBattle());
    await act(() => result.current.loadRandomPokemon());
    await act(() => result.current.loadRandomPokemon());
    return result;
  };

  it("moves the first pokémon to previousPokemon on the second load", async () => {
    const first  = makePokemon({ id: 1, name: "bulbasaur", types: [{ type: { name: "grass" } }] });
    const second = makePokemon({ id: 4, name: "charmander", types: [{ type: { name: "fire" } }] });
    const result = await runTwoLoads(first, second, makeTypeData(["grass"], []));

    expect(result.current.previousPokemon).toMatchObject({ id: 1 });
    expect(result.current.currentPokemon).toMatchObject({ id: 4 });
  });

  it("produces TYPE MATCH! when both pokémon share the same type", async () => {
    const first  = makePokemon({ id: 1, name: "bulbasaur", types: [{ type: { name: "grass" } }] });
    const second = makePokemon({ id: 2, name: "ivysaur",   types: [{ type: { name: "grass" } }] });
    const result = await runTwoLoads(first, second, makeTypeData());

    expect(result.current.battleResult).toBe("TYPE MATCH!");
  });

  it("produces NEW POKÉMON WINS! when the new type is super-effective against the previous", async () => {
    // fire is super-effective against grass
    const first  = makePokemon({ id: 1, types: [{ type: { name: "grass" } }] });
    const second = makePokemon({ id: 4, types: [{ type: { name: "fire"  } }] });
    const result = await runTwoLoads(first, second, makeTypeData(["grass"], []));

    expect(result.current.battleResult).toBe("NEW POKÉMON WINS!");
  });

  it("produces PREVIOUS POKÉMON WINS! when the previous type is super-effective against the new", async () => {
    // water beats fire: when we fetch *water* (prevType) data, its double_damage_to includes "fire"
    // newType = fire, prevType = water
    // fire type data → no advantage for fire, so falls through to fetching water type data
    // water type data → double_damage_to includes "fire" → PREVIOUS POKÉMON WINS!
    const first  = makePokemon({ id: 1, types: [{ type: { name: "water" } }] });
    const second = makePokemon({ id: 2, types: [{ type: { name: "fire"  } }] });

    let callCount = 0;
    global.fetch = vi.fn().mockImplementation((url) => {
      const urlStr = String(url);
      if (urlStr.includes("/type/fire")) {
        // fire has no advantage over water in this mock
        return Promise.resolve({ ok: true, json: () => Promise.resolve(makeTypeData([], [])) });
      }
      if (urlStr.includes("/type/water")) {
        // water beats fire
        return Promise.resolve({ ok: true, json: () => Promise.resolve(makeTypeData(["fire"], [])) });
      }
      callCount++;
      return Promise.resolve({ ok: true, json: () => Promise.resolve(callCount === 1 ? first : second) });
    });

    const { result } = renderHook(() => usePokemonBattle());
    await act(() => result.current.loadRandomPokemon());
    await act(() => result.current.loadRandomPokemon());

    expect(result.current.battleResult).toBe("PREVIOUS POKÉMON WINS!");
  });

  it("increments the matches counter on TYPE MATCH!", async () => {
    const poke = makePokemon({ types: [{ type: { name: "grass" } }] });
    const result = await runTwoLoads(poke, poke, makeTypeData());

    expect(result.current.scores.matches).toBe(1);
  });

  it("increments newWins counter on NEW POKÉMON WINS!", async () => {
    const first  = makePokemon({ id: 1, types: [{ type: { name: "grass" } }] });
    const second = makePokemon({ id: 4, types: [{ type: { name: "fire"  } }] });
    const result = await runTwoLoads(first, second, makeTypeData(["grass"], []));

    expect(result.current.scores.newWins).toBe(1);
  });

  it("reports correct battles count in scoreSummary", async () => {
    const poke = makePokemon({ types: [{ type: { name: "normal" } }] });
    const result = await runTwoLoads(poke, poke, makeTypeData());
    expect(result.current.scores.battles).toBe(1);
  });

  it("tracks loadCount across multiple loads", async () => {
    global.fetch = mockFetch(makePokemon());
    const { result } = renderHook(() => usePokemonBattle());

    await act(() => result.current.loadRandomPokemon());
    await act(() => result.current.loadRandomPokemon());
    await act(() => result.current.loadRandomPokemon());

    expect(result.current.loadCount).toBe(3);
  });
});

describe("usePokemonBattle — champion tracking", () => {
  afterEach(() => { vi.restoreAllMocks(); });

  it("updates champion to the pokémon with the higher BST", async () => {
    const weak   = makePokemon({ id: 1, name: "weak",   stats: [{ base_stat: 100 }] });
    const strong = makePokemon({ id: 2, name: "strong", stats: [{ base_stat: 999 }] });

    let callCount = 0;
    global.fetch = vi.fn().mockImplementation((url) => {
      const isType = String(url).includes("/type/");
      if (isType) return Promise.resolve({ ok: true, json: () => Promise.resolve(makeTypeData()) });
      callCount++;
      return Promise.resolve({ ok: true, json: () => Promise.resolve(callCount === 1 ? weak : strong) });
    });

    const { result } = renderHook(() => usePokemonBattle());
    await act(() => result.current.loadRandomPokemon()); // champion = weak  (BST 100)
    await act(() => result.current.loadRandomPokemon()); // champion = strong (BST 999)

    expect(result.current.champion).toMatchObject({ name: "strong" });
  });

  it("retains current champion when a weaker pokémon is loaded", async () => {
    const strong = makePokemon({ id: 1, name: "strong", stats: [{ base_stat: 999 }] });
    const weak   = makePokemon({ id: 2, name: "weak",   stats: [{ base_stat: 1   }] });

    let callCount = 0;
    global.fetch = vi.fn().mockImplementation((url) => {
      const isType = String(url).includes("/type/");
      if (isType) return Promise.resolve({ ok: true, json: () => Promise.resolve(makeTypeData()) });
      callCount++;
      return Promise.resolve({ ok: true, json: () => Promise.resolve(callCount === 1 ? strong : weak) });
    });

    const { result } = renderHook(() => usePokemonBattle());
    await act(() => result.current.loadRandomPokemon());
    await act(() => result.current.loadRandomPokemon());

    expect(result.current.champion).toMatchObject({ name: "strong" });
  });
});

describe("usePokemonBattle — error handling", () => {
  afterEach(() => { vi.restoreAllMocks(); });

  it("sets error message when fetch returns a non-ok response", async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: false });
    const { result } = renderHook(() => usePokemonBattle());

    await act(() => result.current.loadRandomPokemon());
    expect(result.current.error).toMatch(/failed to fetch/i);
  });

  it("clears a previous error before the next fetch", async () => {
    global.fetch = vi.fn()
      .mockResolvedValueOnce({ ok: false })           // first call fails
      .mockResolvedValue({ ok: true, json: () => Promise.resolve(makePokemon()) });

    const { result } = renderHook(() => usePokemonBattle());
    await act(() => result.current.loadRandomPokemon()); // sets error
    expect(result.current.error).not.toBeNull();

    await act(() => result.current.loadRandomPokemon()); // clears error
    expect(result.current.error).toBeNull();
  });

  it("sets loading back to false even when fetch throws", async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error("Network failure"));
    const { result } = renderHook(() => usePokemonBattle());

    await act(() => result.current.loadRandomPokemon());
    expect(result.current.loading).toBe(false);
  });
});
