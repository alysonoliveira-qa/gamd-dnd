const TYPES = new Set(["dungeon", "cave", "wilderness"]);
const THEMES = new Set(["crypt", "cave", "forest", "dungeon"]);
const MIN_DIM = 16;
const MAX_DIM = 128;

function defaultsFor(type) {
  switch (type) {
    case "dungeon":
      return { roomDensity: 0.6, loopiness: 0.2 };
    case "cave":
      return { fillProb: 0.45, steps: 5 };
    case "wilderness":
      return { scale: 0.08, waterLevel: 0.3 };
    default:
      return {};
  }
}

function checkDim(value, name) {
  if (!Number.isInteger(value) || value < MIN_DIM || value > MAX_DIM) {
    throw new Error(`${name} fora da faixa ${MIN_DIM}..${MAX_DIM}: ${value}`);
  }
}

export function validateMapRequest(req) {
  if (!req || typeof req !== "object") {
    throw new Error("MapRequest deve ser um objeto");
  }
  const { type } = req;
  if (!TYPES.has(type)) throw new Error(`type inválido: ${type}`);

  const width = req.width ?? 48;
  const height = req.height ?? 32;
  checkDim(width, "width");
  checkDim(height, "height");

  const seed = Number.isInteger(req.seed)
    ? req.seed
    : Math.floor(Math.random() * 2 ** 31);
  const theme = THEMES.has(req.theme) ? req.theme : "dungeon";
  const options = { ...defaultsFor(type), ...(req.options || {}) };

  return { type, width, height, theme, seed, options };
}
