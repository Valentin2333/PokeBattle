import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import ResultBanner  from "../components/ResultBanner";
import Scoreboard    from "../components/Scoreboard";
import ChampionStrip from "../components/ChampionStrip";
import PokemonCard   from "../components/PokemonCard";

// ---------------------------------------------------------------------------
// Shared fixtures
// ---------------------------------------------------------------------------
const makePokemon = (overrides = {}) => ({
  id: 25,
  name: "pikachu",
  types: [{ type: { name: "electric" } }],
  stats: [
    { base_stat: 35 }, { base_stat: 55 }, { base_stat: 40 },
    { base_stat: 50 }, { base_stat: 50 }, { base_stat: 90 },
  ],
  sprites: {
    other: { "official-artwork": { front_default: "https://img.com/pikachu.png" } },
    front_default: null,
  },
  height: 4,
  weight: 60,
  ...overrides,
});

// ---------------------------------------------------------------------------
// ResultBanner
// ---------------------------------------------------------------------------
describe("<ResultBanner />", () => {
  it("renders nothing when result is null", () => {
    const { container } = render(<ResultBanner result={null} />);
    expect(container.firstChild).toBeNull();
  });

  it("renders the result text for TYPE MATCH!", () => {
    render(<ResultBanner result="TYPE MATCH!" />);
    expect(screen.getByText("TYPE MATCH!")).toBeInTheDocument();
  });

  it("renders the correct icon for TYPE MATCH! (⚡)", () => {
    render(<ResultBanner result="TYPE MATCH!" />);
    const icons = screen.getAllByText("⚡");
    expect(icons.length).toBeGreaterThanOrEqual(1);
  });

  it("renders NEW POKÉMON WINS! with its trophy icon", () => {
    render(<ResultBanner result="NEW POKÉMON WINS!" />);
    expect(screen.getByText("NEW POKÉMON WINS!")).toBeInTheDocument();
    expect(screen.getAllByText("🏆").length).toBeGreaterThanOrEqual(1);
  });

  it("renders PREVIOUS POKÉMON WINS! with its fire icon", () => {
    render(<ResultBanner result="PREVIOUS POKÉMON WINS!" />);
    expect(screen.getByText("PREVIOUS POKÉMON WINS!")).toBeInTheDocument();
    expect(screen.getAllByText("🔥").length).toBeGreaterThanOrEqual(1);
  });

  it("renders NO ADVANTAGE with its handshake icon", () => {
    render(<ResultBanner result="NO ADVANTAGE" />);
    expect(screen.getByText("NO ADVANTAGE")).toBeInTheDocument();
    expect(screen.getAllByText("🤝").length).toBeGreaterThanOrEqual(1);
  });

  it("has role=status for accessibility", () => {
    render(<ResultBanner result="TYPE MATCH!" />);
    expect(screen.getByRole("status")).toBeInTheDocument();
  });

  it("uses a fallback icon for an unrecognised result string", () => {
    render(<ResultBanner result="SOMETHING UNKNOWN" />);
    expect(screen.getAllByText("❓").length).toBeGreaterThanOrEqual(1);
  });
});

// ---------------------------------------------------------------------------
// Scoreboard
// ---------------------------------------------------------------------------
describe("<Scoreboard />", () => {
  const defaultScores = { matches: 3, newWins: 5, prevWins: 2, noAdvantage: 1 };

  it("displays all four score categories", () => {
    render(<Scoreboard scores={defaultScores} />);
    expect(screen.getByText("3")).toBeInTheDocument(); // matches
    expect(screen.getByText("5")).toBeInTheDocument(); // newWins
    expect(screen.getByText("2")).toBeInTheDocument(); // prevWins
    expect(screen.getByText("1")).toBeInTheDocument(); // noAdvantage
  });

  it("renders with all zero scores without crashing", () => {
    render(<Scoreboard scores={{ matches: 0, newWins: 0, prevWins: 0, noAdvantage: 0 }} />);
    const zeros = screen.getAllByText("0");
    expect(zeros.length).toBe(4);
  });

  it("has an accessible section label", () => {
    render(<Scoreboard scores={defaultScores} />);
    expect(screen.getByRole("region", { name: /battle score/i })).toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// ChampionStrip
// ---------------------------------------------------------------------------
describe("<ChampionStrip />", () => {
  it("renders nothing when champion is null", () => {
    const { container } = render(<ChampionStrip champion={null} championName="" />);
    expect(container.firstChild).toBeNull();
  });

  it("renders the champion name", () => {
    render(<ChampionStrip champion={makePokemon()} championName="Pikachu" />);
    expect(screen.getByText("Pikachu")).toBeInTheDocument();
  });

  it("displays the base stat total", () => {
    render(<ChampionStrip champion={makePokemon()} championName="Pikachu" />);
    // BST = 35+55+40+50+50+90 = 320
    expect(screen.getByText(/320/)).toBeInTheDocument();
  });

  it("renders the champion sprite image", () => {
    render(<ChampionStrip champion={makePokemon()} championName="Pikachu" />);
    const img = screen.getByRole("img", { name: /pikachu/i });
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute("src", "https://img.com/pikachu.png");
  });

  it("has an accessible section label", () => {
    render(<ChampionStrip champion={makePokemon()} championName="Pikachu" />);
    expect(screen.getByRole("region", { name: /strongest pokémon/i })).toBeInTheDocument();
  });

  it("shows the STRONGEST POKÉMON SEEN label", () => {
    render(<ChampionStrip champion={makePokemon()} championName="Pikachu" />);
    expect(screen.getByText(/STRONGEST POKÉMON SEEN/i)).toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// PokemonCard
// ---------------------------------------------------------------------------
describe("<PokemonCard />", () => {
  it("renders the placeholder when pokemon is null", () => {
    render(<PokemonCard pokemon={null} label="CURRENT" isChampion={false} animKey="k1" />);
    expect(screen.getByText(/awaiting pokémon/i)).toBeInTheDocument();
  });

  it("renders the card label", () => {
    render(<PokemonCard pokemon={null} label="PREVIOUS" isChampion={false} animKey="k1" />);
    expect(screen.getByText("PREVIOUS")).toBeInTheDocument();
  });

  it("renders the pokémon name when a pokémon is provided", () => {
    render(<PokemonCard pokemon={makePokemon()} label="CURRENT" isChampion={false} animKey="k1" />);
    expect(screen.getByText("pikachu")).toBeInTheDocument();
  });

  it("renders the type badge(s)", () => {
    render(<PokemonCard pokemon={makePokemon()} label="CURRENT" isChampion={false} animKey="k1" />);
    expect(screen.getByText("electric")).toBeInTheDocument();
  });

  it("renders height and weight stats", () => {
    render(<PokemonCard pokemon={makePokemon()} label="CURRENT" isChampion={false} animKey="k1" />);
    expect(screen.getByText("0.4 m")).toBeInTheDocument();  // height: 4 / 10
    expect(screen.getByText("6.0 kg")).toBeInTheDocument(); // weight: 60 / 10
  });

  it("renders the base stat total", () => {
    render(<PokemonCard pokemon={makePokemon()} label="CURRENT" isChampion={false} animKey="k1" />);
    expect(screen.getByText("320")).toBeInTheDocument();
  });

  it("does NOT show the champion badge when isChampion is false", () => {
    render(<PokemonCard pokemon={makePokemon()} label="CURRENT" isChampion={false} animKey="k1" />);
    expect(screen.queryByText(/strongest/i)).not.toBeInTheDocument();
  });

  it("shows the champion badge when isChampion is true", () => {
    render(<PokemonCard pokemon={makePokemon()} label="CURRENT" isChampion={true} animKey="k1" />);
    expect(screen.getByText(/strongest/i)).toBeInTheDocument();
  });

  it("renders the sprite image with the pokémon name as alt text", () => {
    render(<PokemonCard pokemon={makePokemon()} label="CURRENT" isChampion={false} animKey="k1" />);
    const img = screen.getByRole("img", { name: /pikachu/i });
    expect(img).toHaveAttribute("src", "https://img.com/pikachu.png");
  });

  it("renders multi-type pokémon badges correctly", () => {
    const dualType = makePokemon({
      types: [{ type: { name: "water" } }, { type: { name: "flying" } }],
    });
    render(<PokemonCard pokemon={dualType} label="CURRENT" isChampion={false} animKey="k1" />);
    expect(screen.getByText("water")).toBeInTheDocument();
    expect(screen.getByText("flying")).toBeInTheDocument();
  });
});
