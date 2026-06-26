import { describe, it, expect } from "vitest";
import { validateMapRequest } from "./mapRequest.js";

describe("validateMapRequest", () => {
  it("aplica defaults para um request mínimo", () => {
    const p = validateMapRequest({ type: "dungeon" });
    expect(p.type).toBe("dungeon");
    expect(p.width).toBe(48);
    expect(p.height).toBe(32);
    expect(p.theme).toBe("dungeon");
    expect(Number.isInteger(p.seed)).toBe(true);
    expect(p.options.roomDensity).toBe(0.6);
    expect(p.options.loopiness).toBe(0.2);
  });

  it("preserva opções fornecidas e mescla com defaults", () => {
    const p = validateMapRequest({ type: "cave", options: { steps: 8 } });
    expect(p.options.steps).toBe(8);
    expect(p.options.fillProb).toBe(0.45); // default mantido
  });

  it("preserva a seed quando informada", () => {
    const p = validateMapRequest({ type: "dungeon", seed: 1337 });
    expect(p.seed).toBe(1337);
  });

  it("rejeita tipo inválido", () => {
    expect(() => validateMapRequest({ type: "castle" })).toThrow();
  });

  it("rejeita dimensões fora da faixa", () => {
    expect(() => validateMapRequest({ type: "dungeon", width: 8 })).toThrow();
    expect(() => validateMapRequest({ type: "dungeon", height: 999 })).toThrow();
  });

  it("rejeita request não-objeto", () => {
    expect(() => validateMapRequest(null)).toThrow();
  });
});
