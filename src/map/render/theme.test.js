import { describe, it, expect } from "vitest";
import { TILE } from "../core/tiles.js";
import { colorFor } from "./theme.js";

describe("colorFor", () => {
  it("retorna uma cor numérica para cada tile conhecido", () => {
    for (const t of Object.values(TILE)) {
      expect(typeof colorFor(t)).toBe("number");
    }
  });

  it("usa fallback para tile desconhecido", () => {
    expect(colorFor(999)).toBe(0xff00ff);
  });
});
