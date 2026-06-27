import { describe, it, expect } from "vitest";
import { GENERATE_MAP_TOOL, summarizeMap, executeMapTool } from "./mapTool.js";
import { isFullyConnected } from "../core/connectivity.js";

describe("GENERATE_MAP_TOOL", () => {
  it("tem a forma esperada de uma tool da Anthropic", () => {
    expect(GENERATE_MAP_TOOL.name).toBe("generate_map");
    expect(typeof GENERATE_MAP_TOOL.description).toBe("string");
    expect(GENERATE_MAP_TOOL.description.length).toBeGreaterThan(0);
    expect(GENERATE_MAP_TOOL.input_schema.type).toBe("object");
    expect(GENERATE_MAP_TOOL.input_schema.required).toContain("type");
    expect(GENERATE_MAP_TOOL.input_schema.properties.type.enum).toEqual([
      "dungeon",
      "cave",
      "wilderness",
    ]);
  });

  it("não declara strict nem additionalProperties", () => {
    expect(GENERATE_MAP_TOOL.strict).toBeUndefined();
    expect(GENERATE_MAP_TOOL.input_schema.additionalProperties).toBeUndefined();
  });
});

describe("executeMapTool", () => {
  it("com tool_use válido gera mapa conexo e tool_result sem erro", () => {
    const out = executeMapTool({
      id: "toolu_abc",
      name: "generate_map",
      input: { type: "dungeon", seed: 1337 },
    });
    expect(out.request.type).toBe("dungeon");
    expect(out.request.seed).toBe(1337);
    expect(out.model).not.toBeNull();
    expect(isFullyConnected(out.model)).toBe(true);
    expect(out.toolResult.type).toBe("tool_result");
    expect(out.toolResult.tool_use_id).toBe("toolu_abc");
    expect(out.toolResult.is_error).toBeUndefined();
    expect(typeof out.toolResult.content).toBe("string");
  });

  it("aplica defaults quando dims/seed são omitidos", () => {
    const out = executeMapTool({
      id: "toolu_def",
      name: "generate_map",
      input: { type: "cave" },
    });
    expect(out.request.width).toBe(48);
    expect(out.request.height).toBe(32);
    expect(out.request.theme).toBe("dungeon");
    expect(Number.isInteger(out.request.seed)).toBe(true);
  });

  it("com type inválido retorna erro de tool_result", () => {
    const out = executeMapTool({
      id: "toolu_err",
      name: "generate_map",
      input: { type: "castle" },
    });
    expect(out.request).toBeNull();
    expect(out.model).toBeNull();
    expect(out.toolResult.tool_use_id).toBe("toolu_err");
    expect(out.toolResult.is_error).toBe(true);
    expect(out.toolResult.content).toMatch(/type/i);
  });
});

describe("summarizeMap", () => {
  it("resume uma masmorra com contagem de salas", () => {
    const { model } = executeMapTool({
      id: "t1",
      name: "generate_map",
      input: { type: "dungeon", theme: "crypt", seed: 1337 },
    });
    const s = summarizeMap(model);
    expect(s).toMatch(/^masmorra 48x32, \d+ salas, tema crypt, seed 1337$/);
  });

  it("resume uma caverna sem o trecho de salas", () => {
    const { model } = executeMapTool({
      id: "t2",
      name: "generate_map",
      input: { type: "cave", theme: "cave", seed: 99 },
    });
    const s = summarizeMap(model);
    expect(s).toBe("caverna 48x32, tema cave, seed 99");
  });
});
