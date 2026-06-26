import { validateMapRequest } from "../schema/mapRequest.js";
import { makeRng } from "../core/rng.js";
import { keepLargestRegion, isFullyConnected } from "../core/connectivity.js";
import { generateDungeon } from "./dungeon.js";
import { generateCave } from "./cave.js";
import { generateWilderness } from "./wilderness.js";

const REGISTRY = {
  dungeon: generateDungeon,
  cave: generateCave,
  wilderness: generateWilderness,
};

export function generateMap(request) {
  const params = validateMapRequest(request);
  const fn = REGISTRY[params.type];
  const rng = makeRng(params.seed);
  const model = fn(params, rng, params.seed);
  keepLargestRegion(model);
  if (!isFullyConnected(model)) {
    throw new Error(`falha ao garantir conectividade (${params.type})`);
  }
  return model;
}
