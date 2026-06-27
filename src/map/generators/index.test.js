import { describe, it, expect } from "vitest";
import { generateMap } from "./index.js";
import { isFullyConnected } from "../core/connectivity.js";

describe("generateMap", () => {
  it.each(["dungeon", "cave", "wilderness"])(
    "gera %s totalmente conexo",
    (type) => {
      const m = generateMap({ type, width: 48, height: 32, seed: 2024 });
      expect(m.meta.type).toBe(type);
      expect(isFullyConnected(m)).toBe(true);
    }
  );

  it("é determinística via seed", () => {
    const a = generateMap({ type: "dungeon", seed: 77 });
    const b = generateMap({ type: "dungeon", seed: 77 });
    expect(Array.from(a.tiles)).toEqual(Array.from(b.tiles));
  });

  it("propaga erro de request inválido", () => {
    expect(() => generateMap({ type: "nope" })).toThrow();
  });
});
