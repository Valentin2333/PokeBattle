import { describe, it, expect } from "vitest";
import { MAX_POKEMON_ID, TYPE_COLORS, RESULT_CONFIG } from "../constants";

// ---------------------------------------------------------------------------
// MAX_POKEMON_ID
// ---------------------------------------------------------------------------
describe("MAX_POKEMON_ID", () => {
  it("is a positive integer", () => {
    expect(Number.isInteger(MAX_POKEMON_ID)).toBe(true);
    expect(MAX_POKEMON_ID).toBeGreaterThan(0);
  });

  it("is at least 1010 (Generation I–IX coverage)", () => {
    expect(MAX_POKEMON_ID).toBeGreaterThanOrEqual(1010);
  });
});

// ---------------------------------------------------------------------------
// TYPE_COLORS
// ---------------------------------------------------------------------------
describe("TYPE_COLORS", () => {
  const EXPECTED_TYPES = [
    "normal", "fire", "water", "electric", "grass", "ice",
    "fighting", "poison", "ground", "flying", "psychic", "bug",
    "rock", "ghost", "dragon", "dark", "steel", "fairy",
  ];

  it("contains entries for all 18 standard Pokémon types", () => {
    EXPECTED_TYPES.forEach((type) => {
      expect(TYPE_COLORS).toHaveProperty(type);
    });
  });

  it("every entry has a bg and accent field", () => {
    Object.entries(TYPE_COLORS).forEach(([type, colors]) => {
      expect(colors, `${type} should have a bg`).toHaveProperty("bg");
      expect(colors, `${type} should have an accent`).toHaveProperty("accent");
    });
  });

  it("every bg and accent value is a CSS hex color string", () => {
    const hexRe = /^#[0-9A-Fa-f]{6}$/;
    Object.entries(TYPE_COLORS).forEach(([type, { bg, accent }]) => {
      expect(bg,     `${type}.bg should be a hex color`).toMatch(hexRe);
      expect(accent, `${type}.accent should be a hex color`).toMatch(hexRe);
    });
  });

  it("fire type has the expected red bg", () => {
    expect(TYPE_COLORS.fire.bg).toBe("#E62829");
  });

  it("water type has the expected blue bg", () => {
    expect(TYPE_COLORS.water.bg).toBe("#2980EF");
  });
});

// ---------------------------------------------------------------------------
// RESULT_CONFIG
// ---------------------------------------------------------------------------
describe("RESULT_CONFIG", () => {
  const EXPECTED_RESULTS = [
    "TYPE MATCH!",
    "NEW POKÉMON WINS!",
    "PREVIOUS POKÉMON WINS!",
    "NO ADVANTAGE",
  ];

  it("contains entries for all four possible battle outcomes", () => {
    EXPECTED_RESULTS.forEach((key) => {
      expect(RESULT_CONFIG).toHaveProperty(key);
    });
  });

  it("every entry has a color and icon field", () => {
    Object.entries(RESULT_CONFIG).forEach(([key, cfg]) => {
      expect(cfg, `${key} should have a color`).toHaveProperty("color");
      expect(cfg, `${key} should have an icon`).toHaveProperty("icon");
    });
  });

  it("every color is a valid hex string", () => {
    const hexRe = /^#[0-9A-Fa-f]{6}$/;
    Object.entries(RESULT_CONFIG).forEach(([key, { color }]) => {
      expect(color, `${key}.color should be a hex color`).toMatch(hexRe);
    });
  });

  it("every icon is a non-empty string", () => {
    Object.entries(RESULT_CONFIG).forEach(([key, { icon }]) => {
      expect(typeof icon).toBe("string");
      expect(icon.length).toBeGreaterThan(0);
    });
  });

  it("TYPE MATCH! uses the expected gold color", () => {
    expect(RESULT_CONFIG["TYPE MATCH!"].color).toBe("#FAC000");
  });
});
