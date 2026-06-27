import { validateMapRequest } from "./mapRequest.js";
import { generateMap } from "../generators/index.js";

const TYPE_LABELS = {
  dungeon: "masmorra",
  cave: "caverna",
  wilderness: "wilderness",
};

export const GENERATE_MAP_TOOL = {
  name: "generate_map",
  description:
    "Gera um mapa tático procedural para a cena atual e o torna o mapa ativo da sessão " +
    "(visível na página Mapa). Chame esta ferramenta sempre que a narrativa levar o grupo " +
    "a um novo ambiente físico explorável — uma masmorra, uma caverna ou uma região externa " +
    "(wilderness) — ANTES de descrever a cena, para que os jogadores vejam o terreno. " +
    "Escolha 'type' e 'theme' coerentes com a ficção. Omita 'seed' para um mapa novo aleatório.",
  input_schema: {
    type: "object",
    properties: {
      type: {
        type: "string",
        enum: ["dungeon", "cave", "wilderness"],
        description:
          "Tipo de terreno: 'dungeon' (salas e corredores), 'cave' (cavernas orgânicas), " +
          "'wilderness' (terreno externo aberto).",
      },
      width: {
        type: "integer",
        description: "Largura em tiles, 16..128. Opcional (padrão 48).",
      },
      height: {
        type: "integer",
        description: "Altura em tiles, 16..128. Opcional (padrão 32).",
      },
      theme: {
        type: "string",
        enum: ["crypt", "cave", "forest", "dungeon"],
        description: "Tema visual. Opcional (padrão 'dungeon').",
      },
      seed: {
        type: "integer",
        description: "Semente determinística. Opcional; omita para um mapa aleatório.",
      },
    },
    required: ["type"],
  },
};

export function summarizeMap(model) {
  const label = TYPE_LABELS[model.meta.type] ?? model.meta.type;
  const roomsPart = model.rooms.length > 0 ? `, ${model.rooms.length} salas` : "";
  return `${label} ${model.w}x${model.h}${roomsPart}, tema ${model.meta.theme}, seed ${model.seed}`;
}

export function executeMapTool(toolUseBlock) {
  const toolUseId = toolUseBlock?.id;
  try {
    const request = validateMapRequest(toolUseBlock.input);
    const model = generateMap(request);
    return {
      request,
      model,
      toolResult: {
        type: "tool_result",
        tool_use_id: toolUseId,
        content: summarizeMap(model),
      },
    };
  } catch (e) {
    return {
      request: null,
      model: null,
      toolResult: {
        type: "tool_result",
        tool_use_id: toolUseId,
        content: `Erro ao gerar mapa: ${e.message}`,
        is_error: true,
      },
    };
  }
}
