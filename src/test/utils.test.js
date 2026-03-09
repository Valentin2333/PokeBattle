import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { randomInt, calcBaseStatTotal, capitalise, getSpriteUrl } from "../utils";

// ---------------------------------------------------------------------------
// randomInt
// ---------------------------------------------------------------------------
describe("randomInt", () => {
  it("returns a number within the inclusive [min, max] range", () => {
    for (let i = 0; i < 200; i++) {
      const n = randomInt(1, 10);
      expect(n).toBeGreaterThanOrEqual(1);
      expect(n).toBeLessThanOrEqual(10);
    }
  });

  it("returns an integer (no decimals)", () => {
    for (let i = 0; i < 50; i++) {
      expect(Number.isInteger(randomInt(1, 1000))).toBe(true);
    }
  });

  it("returns exactly min when min === max", () => {
    expect(randomInt(7, 7)).toBe(7);
  });

  it("returns min or max when the range spans 1", () => {
    const results = new Set(Array.from({ length: 100 }, () => randomInt(3, 4)));
    expect(results.has(3)).toBe(true);
    expect(results.has(4)).toBe(true);
    expect(results.size).toBe(2);
  });

  it("uses Math.random under the hood (deterministic with mock)", () => {
    const spy = vi.spyOn(Math, "random").mockReturnValue(0);
    expect(randomInt(1, 10)).toBe(1); // floor(0 * 10) + 1 = 1
    spy.mockReturnValue(0.9999);
    expect(randomInt(1, 10)).toBe(10);
    spy.mockRestore();
  });
});

// ---------------------------------------------------------------------------
// calcBaseStatTotal
// ---------------------------------------------------------------------------
describe("calcBaseStatTotal", () => {
  const makePokemon = (...values) => ({
    stats: values.map((v) => ({ base_stat: v })),
  });

  it("sums all base_stat values correctly", () => {
    expect(calcBaseStatTotal(makePokemon(45, 49, 45, 65, 65, 45))).toBe(314);
  });

  it("returns 0 for a pokemon with no stats array", () => {
    expect(calcBaseStatTotal({})).toBe(0);
    expect(calcBaseStatTotal({ stats: [] })).toBe(0);
  });

  it("returns 0 for null / undefined pokemon", () => {
    expect(calcBaseStatTotal(null)).toBe(0);
    expect(calcBaseStatTotal(undefined)).toBe(0);
  });

  it("handles a single-stat pokemon", () => {
    expect(calcBaseStatTotal(makePokemon(100))).toBe(100);
  });

  it("handles large stat totals (legendary range)", () => {
    // Arceus: 720 total across 6 stats of 120 each
    expect(calcBaseStatTotal(makePokemon(120, 120, 120, 120, 120, 120))).toBe(720);
  });
});

// ---------------------------------------------------------------------------
// capitalise
// ---------------------------------------------------------------------------
describe("capitalise", () => {
  it("upper-cases the first letter of a lowercase string", () => {
    expect(capitalise("pikachu")).toBe("Pikachu");
  });

  it("leaves an already-capitalised string unchanged", () => {
    expect(capitalise("Bulbasaur")).toBe("Bulbasaur");
  });

  it("handles a single character", () => {
    expect(capitalise("a")).toBe("A");
    expect(capitalise("Z")).toBe("Z");
  });

  it("returns an empty string for empty input", () => {
    expect(capitalise("")).toBe("");
  });

  it("returns an empty string for null / undefined", () => {
    expect(capitalise(null)).toBe("");
    expect(capitalise(undefined)).toBe("");
  });

  it("does not alter characters beyond the first", () => {
    expect(capitalise("charizard-mega")).toBe("Charizard-mega");
  });
});

// ---------------------------------------------------------------------------
// getSpriteUrl
// ---------------------------------------------------------------------------
describe("getSpriteUrl", () => {
  const officialArtworkUrl = "https://example.com/official.png";
  const frontDefaultUrl    = "https://example.com/front.png";

  const withOfficialArtwork = {
    sprites: {
      other: { "official-artwork": { front_default: officialArtworkUrl } },
      front_default: frontDefaultUrl,
    },
  };

  const withFrontDefaultOnly = {
    sprites: {
      other: { "official-artwork": { front_default: null } },
      front_default: frontDefaultUrl,
    },
  };

  const withNoSprites = {
    sprites: {
      other: { "official-artwork": { front_default: null } },
      front_default: null,
    },
  };

  it("prefers official-artwork over front_default", () => {
    expect(getSpriteUrl(withOfficialArtwork)).toBe(officialArtworkUrl);
  });

  it("falls back to front_default when official-artwork is missing", () => {
    expect(getSpriteUrl(withFrontDefaultOnly)).toBe(frontDefaultUrl);
  });

  it("returns null when all sprite sources are missing", () => {
    expect(getSpriteUrl(withNoSprites)).toBeNull();
  });

  it("returns null for null / undefined pokemon", () => {
    expect(getSpriteUrl(null)).toBeNull();
    expect(getSpriteUrl(undefined)).toBeNull();
  });

  it("returns null when sprites object is absent", () => {
    expect(getSpriteUrl({})).toBeNull();
  });
});
