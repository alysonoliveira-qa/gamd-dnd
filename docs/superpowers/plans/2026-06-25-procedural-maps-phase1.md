# Sistema de Mapas Procedural — Fase 1 (Implementation Plan)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Gerar mapas proceduralmente (masmorra, caverna, wilderness) de forma determinística e exibi-los, com pan/zoom, numa nova página `Mapa` da DnD Suite.

**Architecture:** Pipeline unificado — três geradores implementam `(params, rng) → MapModel` (estrutura neutra de tiles). Um registry valida o `MapRequest`, gera, garante conectividade e devolve o `MapModel`, que o `MapRenderer` (PixiJS) desenha. Lógica pura é 100% testável sem PixiJS; o renderer é verificado manualmente.

**Tech Stack:** React 18 + Vite 6, PixiJS v8 (WebGL), `simplex-noise` (ruído determinístico), Vitest (testes).

## Global Constraints

- Node/Vite já configurados; não alterar `react`/`react-dom` (^18.3.1) nem `vite` (^6.0.7).
- Geradores são **funções puras** `(params, rng, seed) → MapModel` — sem `Math.random`, sem DOM, sem I/O. Toda aleatoriedade vem do `rng` injetado.
- Determinismo é requisito: mesma `seed` ⇒ mesmo `MapModel`.
- Não usar TypeScript (projeto é JS/JSX). Não adicionar React Router.
- Cores alinhadas aos design tokens em `src/tokens.js` (objeto `T`).
- Toda mensagem de commit termina com a linha de trailer:
  `Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>`
- Dimensões válidas de mapa: inteiros em `16..128`. Tipos válidos: `dungeon`, `cave`, `wilderness`.
- **Refinamento sobre o spec:** a garantia de conectividade usa `keepLargestRegion` (mantém a maior região andável, converte o resto em parede). É mais robusto que o "retry seed+1" original, que entraria em loop com cavernas. `isFullyConnected` continua sendo a asserção de teste.

---

### Task 1: Tooling — Vitest + dependências

**Files:**
- Modify: `package.json` (scripts + deps)
- Modify: `vite.config.js`
- Create: `src/map/__smoke__/smoke.test.js`

**Interfaces:**
- Consumes: nada.
- Produces: comando `npm test` operacional (Vitest em ambiente `node`); pacotes `pixi.js` e `simplex-noise` disponíveis para tasks seguintes.

- [ ] **Step 1: Instalar dependências**

Run:
```bash
npm install pixi.js@^8 simplex-noise@^4
npm install -D vitest@^2
```
Expected: `package.json` ganha `pixi.js`, `simplex-noise` em `dependencies` e `vitest` em `devDependencies`.

- [ ] **Step 2: Adicionar script de teste**

Em `package.json`, dentro de `"scripts"`, adicionar a linha `"test"`:
```json
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "test": "vitest run",
    "test:watch": "vitest"
  },
```

- [ ] **Step 3: Configurar Vitest no vite.config.js**

Substituir o conteúdo de `vite.config.js` por:
```js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "node",
    include: ["src/**/*.test.js"],
  },
});
```

- [ ] **Step 4: Escrever smoke test**

Create `src/map/__smoke__/smoke.test.js`:
```js
import { describe, it, expect } from "vitest";

describe("tooling", () => {
  it("roda o vitest", () => {
    expect(1 + 1).toBe(2);
  });
});
```

- [ ] **Step 5: Rodar e verificar que passa**

Run: `npm test`
Expected: PASS — 1 teste passa.

- [ ] **Step 6: Commit**

```bash
git add package.json package-lock.json vite.config.js src/map/__smoke__/smoke.test.js
git commit -m "chore: add vitest + pixi.js + simplex-noise tooling

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 2: PRNG determinístico (`core/rng.js`)

**Files:**
- Create: `src/map/core/rng.js`
- Test: `src/map/core/rng.test.js`

**Interfaces:**
- Consumes: nada.
- Produces:
  - `makeRng(seed: number) → () => number` — gera floats em `[0,1)`.
  - `randInt(rng, min, max) → number` — inteiro inclusivo em `[min, max]`.

- [ ] **Step 1: Escrever o teste que falha**

Create `src/map/core/rng.test.js`:
```js
import { describe, it, expect } from "vitest";
import { makeRng, randInt } from "./rng.js";

describe("makeRng", () => {
  it("é determinística para a mesma seed", () => {
    const a = makeRng(42);
    const b = makeRng(42);
    const seqA = [a(), a(), a()];
    const seqB = [b(), b(), b()];
    expect(seqA).toEqual(seqB);
  });

  it("produz sequências diferentes para seeds diferentes", () => {
    const a = makeRng(1);
    const b = makeRng(2);
    expect(a()).not.toBe(b());
  });

  it("retorna floats em [0,1)", () => {
    const r = makeRng(7);
    for (let i = 0; i < 100; i++) {
      const v = r();
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    }
  });
});

describe("randInt", () => {
  it("respeita os limites inclusivos", () => {
    const r = makeRng(3);
    for (let i = 0; i < 200; i++) {
      const v = randInt(r, 5, 10);
      expect(Number.isInteger(v)).toBe(true);
      expect(v).toBeGreaterThanOrEqual(5);
      expect(v).toBeLessThanOrEqual(10);
    }
  });
});
```

- [ ] **Step 2: Rodar e verificar que falha**

Run: `npm test -- rng`
Expected: FAIL — "Failed to resolve import ./rng.js".

- [ ] **Step 3: Implementar `rng.js`**

Create `src/map/core/rng.js`:
```js
// mulberry32 — PRNG rápido e determinístico (32-bit).
export function makeRng(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Inteiro inclusivo em [min, max].
export function randInt(rng, min, max) {
  return min + Math.floor(rng() * (max - min + 1));
}
```

- [ ] **Step 4: Rodar e verificar que passa**

Run: `npm test -- rng`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/map/core/rng.js src/map/core/rng.test.js
git commit -m "feat(map): deterministic PRNG (mulberry32)

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 3: Tiles + MapModel (`core/tiles.js`, `core/MapModel.js`)

**Files:**
- Create: `src/map/core/tiles.js`
- Create: `src/map/core/MapModel.js`
- Test: `src/map/core/MapModel.test.js`

**Interfaces:**
- Consumes: nada.
- Produces:
  - `tiles.js`: `TILE = { WALL:0, FLOOR:1, DOOR:2, WATER:3, GRASS:4, ROCK:5, SAND:6 }`; `WALKABLE: Set<number>` (FLOOR, DOOR, GRASS, SAND).
  - `MapModel.js`:
    - `createMapModel(w, h, fill=TILE.WALL) → { w, h, tiles:Uint8Array, rooms:[], meta:{}, seed:0, params:null }`
    - `idx(m, x, y) → number`
    - `inBounds(m, x, y) → boolean`
    - `getTile(m, x, y) → number` (fora dos limites retorna `TILE.WALL`)
    - `setTile(m, x, y, t) → void` (no-op fora dos limites)

- [ ] **Step 1: Escrever o teste que falha**

Create `src/map/core/MapModel.test.js`:
```js
import { describe, it, expect } from "vitest";
import { TILE, WALKABLE } from "./tiles.js";
import {
  createMapModel,
  idx,
  inBounds,
  getTile,
  setTile,
} from "./MapModel.js";

describe("tiles", () => {
  it("define os tipos esperados", () => {
    expect(TILE.WALL).toBe(0);
    expect(TILE.FLOOR).toBe(1);
    expect(WALKABLE.has(TILE.FLOOR)).toBe(true);
    expect(WALKABLE.has(TILE.WALL)).toBe(false);
  });
});

describe("createMapModel", () => {
  it("cria um grid preenchido com WALL por padrão", () => {
    const m = createMapModel(4, 3);
    expect(m.w).toBe(4);
    expect(m.h).toBe(3);
    expect(m.tiles.length).toBe(12);
    expect(Array.from(m.tiles).every((t) => t === TILE.WALL)).toBe(true);
  });
});

describe("acesso a tiles", () => {
  it("idx mapeia (x,y) para o índice linear", () => {
    const m = createMapModel(4, 3);
    expect(idx(m, 0, 0)).toBe(0);
    expect(idx(m, 3, 2)).toBe(11);
  });

  it("inBounds detecta limites", () => {
    const m = createMapModel(4, 3);
    expect(inBounds(m, 0, 0)).toBe(true);
    expect(inBounds(m, 3, 2)).toBe(true);
    expect(inBounds(m, 4, 2)).toBe(false);
    expect(inBounds(m, -1, 0)).toBe(false);
  });

  it("get/set respeitam limites", () => {
    const m = createMapModel(4, 3);
    setTile(m, 1, 1, TILE.FLOOR);
    expect(getTile(m, 1, 1)).toBe(TILE.FLOOR);
    setTile(m, 99, 99, TILE.FLOOR); // no-op
    expect(getTile(m, 99, 99)).toBe(TILE.WALL); // fora = WALL
  });
});
```

- [ ] **Step 2: Rodar e verificar que falha**

Run: `npm test -- MapModel`
Expected: FAIL — imports não resolvem.

- [ ] **Step 3: Implementar `tiles.js`**

Create `src/map/core/tiles.js`:
```js
export const TILE = {
  WALL: 0,
  FLOOR: 1,
  DOOR: 2,
  WATER: 3,
  GRASS: 4,
  ROCK: 5,
  SAND: 6,
};

// Tiles em que tokens podem andar.
export const WALKABLE = new Set([TILE.FLOOR, TILE.DOOR, TILE.GRASS, TILE.SAND]);
```

- [ ] **Step 4: Implementar `MapModel.js`**

Create `src/map/core/MapModel.js`:
```js
import { TILE } from "./tiles.js";

export function createMapModel(w, h, fill = TILE.WALL) {
  const tiles = new Uint8Array(w * h);
  if (fill !== 0) tiles.fill(fill);
  return { w, h, tiles, rooms: [], meta: {}, seed: 0, params: null };
}

export const idx = (m, x, y) => y * m.w + x;

export const inBounds = (m, x, y) => x >= 0 && y >= 0 && x < m.w && y < m.h;

export function getTile(m, x, y) {
  return inBounds(m, x, y) ? m.tiles[idx(m, x, y)] : TILE.WALL;
}

export function setTile(m, x, y, t) {
  if (inBounds(m, x, y)) m.tiles[idx(m, x, y)] = t;
}
```

- [ ] **Step 5: Rodar e verificar que passa**

Run: `npm test -- MapModel`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/map/core/tiles.js src/map/core/MapModel.js src/map/core/MapModel.test.js
git commit -m "feat(map): tile enum and MapModel structure

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 4: Conectividade (`core/connectivity.js`)

**Files:**
- Create: `src/map/core/connectivity.js`
- Test: `src/map/core/connectivity.test.js`

**Interfaces:**
- Consumes: `MapModel` (idx, inBounds), `WALKABLE`.
- Produces:
  - `floodFill(m, sx, sy) → Uint8Array` — máscara (1/0) das células andáveis alcançáveis a partir de (sx,sy).
  - `countWalkable(m) → number`
  - `firstWalkable(m) → [x,y] | null`
  - `isFullyConnected(m) → boolean` — true se toda célula andável é alcançável a partir da primeira.
  - `keepLargestRegion(m) → m` — converte em `WALL` toda célula andável fora da maior região conexa (muta e retorna `m`).

- [ ] **Step 1: Escrever o teste que falha**

Create `src/map/core/connectivity.test.js`:
```js
import { describe, it, expect } from "vitest";
import { TILE } from "./tiles.js";
import { createMapModel, setTile } from "./MapModel.js";
import {
  floodFill,
  countWalkable,
  firstWalkable,
  isFullyConnected,
  keepLargestRegion,
} from "./connectivity.js";

// Mapa 5x1: FLOOR FLOOR WALL FLOOR FLOOR  → duas regiões
function twoRegions() {
  const m = createMapModel(5, 1);
  setTile(m, 0, 0, TILE.FLOOR);
  setTile(m, 1, 0, TILE.FLOOR);
  setTile(m, 3, 0, TILE.FLOOR);
  setTile(m, 4, 0, TILE.FLOOR);
  return m;
}

describe("floodFill", () => {
  it("alcança apenas células conexas", () => {
    const m = twoRegions();
    const mask = floodFill(m, 0, 0);
    let reached = 0;
    for (const v of mask) reached += v;
    expect(reached).toBe(2); // só a região da esquerda
  });
});

describe("countWalkable / firstWalkable", () => {
  it("conta e localiza tiles andáveis", () => {
    const m = twoRegions();
    expect(countWalkable(m)).toBe(4);
    expect(firstWalkable(m)).toEqual([0, 0]);
  });
});

describe("isFullyConnected", () => {
  it("é falso quando há regiões separadas", () => {
    expect(isFullyConnected(twoRegions())).toBe(false);
  });

  it("é verdadeiro para uma única região", () => {
    const m = createMapModel(3, 1);
    setTile(m, 0, 0, TILE.FLOOR);
    setTile(m, 1, 0, TILE.FLOOR);
    setTile(m, 2, 0, TILE.FLOOR);
    expect(isFullyConnected(m)).toBe(true);
  });
});

describe("keepLargestRegion", () => {
  it("mantém a maior região e remove o resto", () => {
    // esquerda tem 2, direita tem 2 — empate resolvido pela primeira encontrada;
    // tornamos a direita maior para um teste determinístico:
    const m = createMapModel(6, 1);
    setTile(m, 0, 0, TILE.FLOOR); // região A (1)
    setTile(m, 2, 0, TILE.FLOOR); // região B
    setTile(m, 3, 0, TILE.FLOOR); // região B
    setTile(m, 4, 0, TILE.FLOOR); // região B (3)
    keepLargestRegion(m);
    expect(isFullyConnected(m)).toBe(true);
    expect(countWalkable(m)).toBe(3);
  });
});
```

- [ ] **Step 2: Rodar e verificar que falha**

Run: `npm test -- connectivity`
Expected: FAIL — import não resolve.

- [ ] **Step 3: Implementar `connectivity.js`**

Create `src/map/core/connectivity.js`:
```js
import { idx, inBounds } from "./MapModel.js";
import { TILE, WALKABLE } from "./tiles.js";

const DIRS = [
  [1, 0],
  [-1, 0],
  [0, 1],
  [0, -1],
];

export function floodFill(m, sx, sy) {
  const seen = new Uint8Array(m.w * m.h);
  if (!inBounds(m, sx, sy) || !WALKABLE.has(m.tiles[idx(m, sx, sy)])) return seen;
  const stack = [[sx, sy]];
  seen[idx(m, sx, sy)] = 1;
  while (stack.length) {
    const [x, y] = stack.pop();
    for (const [dx, dy] of DIRS) {
      const nx = x + dx;
      const ny = y + dy;
      if (
        inBounds(m, nx, ny) &&
        !seen[idx(m, nx, ny)] &&
        WALKABLE.has(m.tiles[idx(m, nx, ny)])
      ) {
        seen[idx(m, nx, ny)] = 1;
        stack.push([nx, ny]);
      }
    }
  }
  return seen;
}

export function countWalkable(m) {
  let c = 0;
  for (let i = 0; i < m.tiles.length; i++) if (WALKABLE.has(m.tiles[i])) c++;
  return c;
}

export function firstWalkable(m) {
  for (let y = 0; y < m.h; y++) {
    for (let x = 0; x < m.w; x++) {
      if (WALKABLE.has(m.tiles[idx(m, x, y)])) return [x, y];
    }
  }
  return null;
}

export function isFullyConnected(m) {
  const start = firstWalkable(m);
  if (!start) return false;
  const mask = floodFill(m, start[0], start[1]);
  let reached = 0;
  for (let i = 0; i < mask.length; i++) reached += mask[i];
  return reached === countWalkable(m);
}

export function keepLargestRegion(m) {
  const visited = new Uint8Array(m.w * m.h);
  let best = null;
  let bestSize = 0;
  for (let y = 0; y < m.h; y++) {
    for (let x = 0; x < m.w; x++) {
      const i = idx(m, x, y);
      if (visited[i] || !WALKABLE.has(m.tiles[i])) continue;
      const region = floodFill(m, x, y);
      let size = 0;
      for (let k = 0; k < region.length; k++) {
        if (region[k]) {
          visited[k] = 1;
          size++;
        }
      }
      if (size > bestSize) {
        bestSize = size;
        best = region;
      }
    }
  }
  if (!best) return m;
  for (let i = 0; i < m.tiles.length; i++) {
    if (WALKABLE.has(m.tiles[i]) && !best[i]) m.tiles[i] = TILE.WALL;
  }
  return m;
}
```

- [ ] **Step 4: Rodar e verificar que passa**

Run: `npm test -- connectivity`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/map/core/connectivity.js src/map/core/connectivity.test.js
git commit -m "feat(map): flood-fill connectivity helpers

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 5: Validação do contrato (`schema/mapRequest.js`)

**Files:**
- Create: `src/map/schema/mapRequest.js`
- Test: `src/map/schema/mapRequest.test.js`

**Interfaces:**
- Consumes: nada.
- Produces:
  - `validateMapRequest(req) → params` normalizado: `{ type, width, height, theme, seed, options }`. Aplica defaults; lança `Error` em entrada inválida.
  - Defaults por tipo: dungeon `{roomDensity:0.6, loopiness:0.2}`; cave `{fillProb:0.45, steps:5}`; wilderness `{scale:0.08, waterLevel:0.3}`.
  - `width`/`height` default `48`/`32`; `theme` default `dungeon`; `seed` default aleatório (inteiro).

- [ ] **Step 1: Escrever o teste que falha**

Create `src/map/schema/mapRequest.test.js`:
```js
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
```

- [ ] **Step 2: Rodar e verificar que falha**

Run: `npm test -- mapRequest`
Expected: FAIL — import não resolve.

- [ ] **Step 3: Implementar `mapRequest.js`**

Create `src/map/schema/mapRequest.js`:
```js
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
```

- [ ] **Step 4: Rodar e verificar que passa**

Run: `npm test -- mapRequest`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/map/schema/mapRequest.js src/map/schema/mapRequest.test.js
git commit -m "feat(map): MapRequest validation and defaults

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 6: Gerador de masmorra — BSP (`generators/dungeon.js`)

**Files:**
- Create: `src/map/generators/dungeon.js`
- Test: `src/map/generators/dungeon.test.js`

**Interfaces:**
- Consumes: `createMapModel`, `setTile`, `TILE`, `randInt`, params normalizado (Task 5).
- Produces: `generateDungeon(params, rng, seed) → MapModel` com `rooms[]` preenchido e `meta.type === "dungeon"`.

- [ ] **Step 1: Escrever o teste que falha**

Create `src/map/generators/dungeon.test.js`:
```js
import { describe, it, expect } from "vitest";
import { makeRng } from "../core/rng.js";
import { validateMapRequest } from "../schema/mapRequest.js";
import { generateDungeon } from "./dungeon.js";
import { TILE } from "../core/tiles.js";

function gen(seed) {
  const params = validateMapRequest({ type: "dungeon", width: 48, height: 32, seed });
  return generateDungeon(params, makeRng(seed), seed);
}

describe("generateDungeon", () => {
  it("é determinística para a mesma seed", () => {
    const a = gen(123);
    const b = gen(123);
    expect(Array.from(a.tiles)).toEqual(Array.from(b.tiles));
  });

  it("produz pelo menos uma sala e algum piso", () => {
    const m = gen(123);
    expect(m.rooms.length).toBeGreaterThan(0);
    const floors = Array.from(m.tiles).filter((t) => t === TILE.FLOOR).length;
    expect(floors).toBeGreaterThan(0);
  });

  it("grava metadados e seed", () => {
    const m = gen(123);
    expect(m.meta.type).toBe("dungeon");
    expect(m.seed).toBe(123);
  });
});
```

- [ ] **Step 2: Rodar e verificar que falha**

Run: `npm test -- dungeon`
Expected: FAIL — import não resolve.

- [ ] **Step 3: Implementar `dungeon.js`**

Create `src/map/generators/dungeon.js`:
```js
import { createMapModel, setTile } from "../core/MapModel.js";
import { TILE } from "../core/tiles.js";
import { randInt } from "../core/rng.js";

const MIN_LEAF = 6;

// Particiona recursivamente o retângulo em folhas (BSP).
function splitNode(node, rng, out) {
  const { w, h } = node;
  if (w <= MIN_LEAF * 2 && h <= MIN_LEAF * 2) {
    out.push(node);
    return;
  }
  const horizontal = w < h ? true : h < w ? false : rng() < 0.5;
  if (horizontal) {
    if (h < MIN_LEAF * 2) {
      out.push(node);
      return;
    }
    const cut = randInt(rng, MIN_LEAF, h - MIN_LEAF);
    splitNode({ x: node.x, y: node.y, w, h: cut }, rng, out);
    splitNode({ x: node.x, y: node.y + cut, w, h: h - cut }, rng, out);
  } else {
    if (w < MIN_LEAF * 2) {
      out.push(node);
      return;
    }
    const cut = randInt(rng, MIN_LEAF, w - MIN_LEAF);
    splitNode({ x: node.x, y: node.y, w: cut, h }, rng, out);
    splitNode({ x: node.x + cut, y: node.y, w: w - cut, h }, rng, out);
  }
}

// Escava uma sala dentro de uma folha; retorna o retângulo ou null.
function carveRoom(m, leaf, rng, density) {
  const maxW = leaf.w - 2;
  const maxH = leaf.h - 2;
  if (maxW < 3 || maxH < 3) return null;
  const minW = Math.max(3, Math.floor(maxW * density));
  const minH = Math.max(3, Math.floor(maxH * density));
  const rw = randInt(rng, minW, maxW);
  const rh = randInt(rng, minH, maxH);
  const rx = leaf.x + 1 + randInt(rng, 0, maxW - rw);
  const ry = leaf.y + 1 + randInt(rng, 0, maxH - rh);
  for (let yy = ry; yy < ry + rh; yy++) {
    for (let xx = rx; xx < rx + rw; xx++) setTile(m, xx, yy, TILE.FLOOR);
  }
  return { x: rx, y: ry, w: rw, h: rh };
}

function carveCorridor(m, ax, ay, bx, by, rng) {
  let x = ax;
  let y = ay;
  const stepX = () => {
    x += Math.sign(bx - x);
    setTile(m, x, y, TILE.FLOOR);
  };
  const stepY = () => {
    y += Math.sign(by - y);
    setTile(m, x, y, TILE.FLOOR);
  };
  setTile(m, x, y, TILE.FLOOR);
  if (rng() < 0.5) {
    while (x !== bx) stepX();
    while (y !== by) stepY();
  } else {
    while (y !== by) stepY();
    while (x !== bx) stepX();
  }
}

const center = (r) => [r.x + Math.floor(r.w / 2), r.y + Math.floor(r.h / 2)];

export function generateDungeon(params, rng, seed) {
  const { width: w, height: h, options } = params;
  const m = createMapModel(w, h, TILE.WALL);

  const leaves = [];
  splitNode({ x: 0, y: 0, w, h }, rng, leaves);

  const rooms = [];
  const density = 1 - options.roomDensity * 0.5; // densidade alta = salas maiores
  for (const leaf of leaves) {
    const room = carveRoom(m, leaf, rng, density);
    if (room) rooms.push(room);
  }

  for (let i = 1; i < rooms.length; i++) {
    const [ax, ay] = center(rooms[i - 1]);
    const [bx, by] = center(rooms[i]);
    carveCorridor(m, ax, ay, bx, by, rng);
  }

  // loopiness: conexões extras aleatórias
  const extra = Math.floor(rooms.length * options.loopiness);
  for (let k = 0; k < extra && rooms.length > 1; k++) {
    const [ax, ay] = center(rooms[randInt(rng, 0, rooms.length - 1)]);
    const [bx, by] = center(rooms[randInt(rng, 0, rooms.length - 1)]);
    carveCorridor(m, ax, ay, bx, by, rng);
  }

  m.rooms = rooms;
  m.meta = { type: "dungeon", theme: params.theme };
  m.seed = seed;
  m.params = params;
  return m;
}
```

- [ ] **Step 4: Rodar e verificar que passa**

Run: `npm test -- dungeon`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/map/generators/dungeon.js src/map/generators/dungeon.test.js
git commit -m "feat(map): BSP dungeon generator

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 7: Gerador de caverna — Cellular Automata (`generators/cave.js`)

**Files:**
- Create: `src/map/generators/cave.js`
- Test: `src/map/generators/cave.test.js`

**Interfaces:**
- Consumes: `createMapModel`, `getTile`, `setTile`, `inBounds`, `TILE`, params normalizado.
- Produces: `generateCave(params, rng, seed) → MapModel` com `meta.type === "cave"`. (A conectividade global é resolvida no registry da Task 9.)

- [ ] **Step 1: Escrever o teste que falha**

Create `src/map/generators/cave.test.js`:
```js
import { describe, it, expect } from "vitest";
import { makeRng } from "../core/rng.js";
import { validateMapRequest } from "../schema/mapRequest.js";
import { generateCave } from "./cave.js";
import { TILE } from "../core/tiles.js";

function gen(seed) {
  const params = validateMapRequest({ type: "cave", width: 40, height: 30, seed });
  return generateCave(params, makeRng(seed), seed);
}

describe("generateCave", () => {
  it("é determinística para a mesma seed", () => {
    expect(Array.from(gen(9).tiles)).toEqual(Array.from(gen(9).tiles));
  });

  it("produz uma mistura de piso e parede", () => {
    const m = gen(9);
    const floors = Array.from(m.tiles).filter((t) => t === TILE.FLOOR).length;
    const walls = Array.from(m.tiles).filter((t) => t === TILE.WALL).length;
    expect(floors).toBeGreaterThan(0);
    expect(walls).toBeGreaterThan(0);
  });

  it("mantém as bordas como parede", () => {
    const m = gen(9);
    expect(m.tiles[0]).toBe(TILE.WALL);
    expect(m.tiles[m.w - 1]).toBe(TILE.WALL);
  });
});
```

- [ ] **Step 2: Rodar e verificar que falha**

Run: `npm test -- cave`
Expected: FAIL — import não resolve.

- [ ] **Step 3: Implementar `cave.js`**

Create `src/map/generators/cave.js`:
```js
import { createMapModel, getTile, setTile, inBounds } from "../core/MapModel.js";
import { TILE } from "../core/tiles.js";

function wallsAround(m, x, y) {
  let count = 0;
  for (let dy = -1; dy <= 1; dy++) {
    for (let dx = -1; dx <= 1; dx++) {
      if (dx === 0 && dy === 0) continue;
      const nx = x + dx;
      const ny = y + dy;
      if (!inBounds(m, nx, ny) || getTile(m, nx, ny) === TILE.WALL) count++;
    }
  }
  return count;
}

function step(m) {
  const next = createMapModel(m.w, m.h, TILE.WALL);
  for (let y = 0; y < m.h; y++) {
    for (let x = 0; x < m.w; x++) {
      if (x === 0 || y === 0 || x === m.w - 1 || y === m.h - 1) {
        setTile(next, x, y, TILE.WALL);
        continue;
      }
      setTile(next, x, y, wallsAround(m, x, y) >= 5 ? TILE.WALL : TILE.FLOOR);
    }
  }
  return next;
}

export function generateCave(params, rng, seed) {
  const { width: w, height: h, options } = params;
  let m = createMapModel(w, h, TILE.WALL);

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (x === 0 || y === 0 || x === w - 1 || y === h - 1) {
        setTile(m, x, y, TILE.WALL);
      } else {
        setTile(m, x, y, rng() < options.fillProb ? TILE.WALL : TILE.FLOOR);
      }
    }
  }

  for (let s = 0; s < options.steps; s++) m = step(m);

  m.meta = { type: "cave", theme: params.theme };
  m.seed = seed;
  m.params = params;
  return m;
}
```

- [ ] **Step 4: Rodar e verificar que passa**

Run: `npm test -- cave`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/map/generators/cave.js src/map/generators/cave.test.js
git commit -m "feat(map): cellular-automata cave generator

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 8: Gerador wilderness — Simplex noise (`generators/wilderness.js`)

**Files:**
- Create: `src/map/generators/wilderness.js`
- Test: `src/map/generators/wilderness.test.js`

**Interfaces:**
- Consumes: `createNoise2D` de `simplex-noise`, `createMapModel`, `setTile`, `TILE`, params normalizado.
- Produces: `generateWilderness(params, rng, seed) → MapModel` com `meta.type === "wilderness"`. Usa `createNoise2D(rng)` para determinismo.

- [ ] **Step 1: Escrever o teste que falha**

Create `src/map/generators/wilderness.test.js`:
```js
import { describe, it, expect } from "vitest";
import { makeRng } from "../core/rng.js";
import { validateMapRequest } from "../schema/mapRequest.js";
import { generateWilderness } from "./wilderness.js";
import { TILE } from "../core/tiles.js";

function gen(seed) {
  const params = validateMapRequest({ type: "wilderness", width: 40, height: 30, seed });
  return generateWilderness(params, makeRng(seed), seed);
}

describe("generateWilderness", () => {
  it("é determinística para a mesma seed", () => {
    expect(Array.from(gen(5).tiles)).toEqual(Array.from(gen(5).tiles));
  });

  it("usa tiles de terreno externo (grass/water/sand/rock)", () => {
    const m = gen(5);
    const set = new Set(Array.from(m.tiles));
    const outdoor = [TILE.GRASS, TILE.WATER, TILE.SAND, TILE.ROCK];
    expect(outdoor.some((t) => set.has(t))).toBe(true);
  });

  it("grava metadados de wilderness", () => {
    expect(gen(5).meta.type).toBe("wilderness");
  });
});
```

- [ ] **Step 2: Rodar e verificar que falha**

Run: `npm test -- wilderness`
Expected: FAIL — import não resolve.

- [ ] **Step 3: Implementar `wilderness.js`**

Create `src/map/generators/wilderness.js`:
```js
import { createNoise2D } from "simplex-noise";
import { createMapModel, setTile } from "../core/MapModel.js";
import { TILE } from "../core/tiles.js";

export function generateWilderness(params, rng, seed) {
  const { width: w, height: h, options } = params;
  const m = createMapModel(w, h, TILE.GRASS);
  const noise2D = createNoise2D(rng);

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const e = (noise2D(x * options.scale, y * options.scale) + 1) / 2; // 0..1
      let t;
      if (e < options.waterLevel) t = TILE.WATER;
      else if (e < options.waterLevel + 0.08) t = TILE.SAND;
      else if (e > 0.8) t = TILE.ROCK;
      else t = TILE.GRASS;
      setTile(m, x, y, t);
    }
  }

  m.meta = { type: "wilderness", theme: params.theme };
  m.seed = seed;
  m.params = params;
  return m;
}
```

- [ ] **Step 4: Rodar e verificar que passa**

Run: `npm test -- wilderness`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/map/generators/wilderness.js src/map/generators/wilderness.test.js
git commit -m "feat(map): simplex-noise wilderness generator

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 9: Registry + `generateMap` (`generators/index.js`)

**Files:**
- Create: `src/map/generators/index.js`
- Test: `src/map/generators/index.test.js`

**Interfaces:**
- Consumes: `validateMapRequest`, `makeRng`, `keepLargestRegion`, `isFullyConnected`, os três geradores.
- Produces: `generateMap(request) → MapModel` — valida, gera pelo tipo, garante conectividade (`keepLargestRegion`), e devolve o `MapModel`. É o **único** ponto de entrada usado pela UI e (futuramente) pela tool do DM Agent.

- [ ] **Step 1: Escrever o teste que falha**

Create `src/map/generators/index.test.js`:
```js
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
```

- [ ] **Step 2: Rodar e verificar que falha**

Run: `npm test -- generators/index`
Expected: FAIL — import não resolve.

- [ ] **Step 3: Implementar `index.js`**

Create `src/map/generators/index.js`:
```js
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
```

- [ ] **Step 4: Rodar e verificar que passa**

Run: `npm test -- generators/index`
Expected: PASS.

- [ ] **Step 5: Rodar a suíte completa**

Run: `npm test`
Expected: PASS — todos os testes (rng, MapModel, connectivity, mapRequest, 3 geradores, index, smoke).

- [ ] **Step 6: Commit**

```bash
git add src/map/generators/index.js src/map/generators/index.test.js
git commit -m "feat(map): generator registry with connectivity guarantee

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 10: Paleta de tiles (`render/theme.js`)

**Files:**
- Create: `src/map/render/theme.js`
- Test: `src/map/render/theme.test.js`

**Interfaces:**
- Consumes: `TILE`.
- Produces: `colorFor(tile) → number` (cor hex 0xRRGGBB). Cobre todos os tiles; fallback magenta `0xff00ff`.

- [ ] **Step 1: Escrever o teste que falha**

Create `src/map/render/theme.test.js`:
```js
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
```

- [ ] **Step 2: Rodar e verificar que falha**

Run: `npm test -- theme`
Expected: FAIL — import não resolve.

- [ ] **Step 3: Implementar `theme.js`**

Create `src/map/render/theme.js`:
```js
import { TILE } from "../core/tiles.js";

// Paleta alinhada aos design tokens (dark parchment / arcane / gold).
export const TILE_COLORS = {
  [TILE.WALL]: 0x1a1622,
  [TILE.FLOOR]: 0x2e2742,
  [TILE.DOOR]: 0xc9a84c,
  [TILE.WATER]: 0x2b4a6f,
  [TILE.GRASS]: 0x3b4a2a,
  [TILE.ROCK]: 0x4a4452,
  [TILE.SAND]: 0x8a7a4f,
};

export function colorFor(tile) {
  return TILE_COLORS[tile] ?? 0xff00ff;
}
```

- [ ] **Step 4: Rodar e verificar que passa**

Run: `npm test -- theme`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/map/render/theme.js src/map/render/theme.test.js
git commit -m "feat(map): tile color palette

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 11: Renderer PixiJS (`render/MapRenderer.js`)

> Camada visual — verificação **manual** (sem teste unitário, conforme spec §8).

**Files:**
- Create: `src/map/render/MapRenderer.js`

**Interfaces:**
- Consumes: `Application, Container, Graphics` de `pixi.js`; `colorFor`.
- Produces: classe `MapRenderer` com:
  - `async init(hostEl) → void` — cria a `Application` PixiJS e anexa o canvas a `hostEl`.
  - `render(model) → void` — desenha terreno + grade; centraliza; tolera `model` nulo.
  - `destroy() → void` — libera a `Application`.

- [ ] **Step 1: Implementar `MapRenderer.js`**

Create `src/map/render/MapRenderer.js`:
```js
import { Application, Container, Graphics } from "pixi.js";
import { colorFor } from "./theme.js";

export class MapRenderer {
  constructor() {
    this.app = null;
    this.world = null;
    this.tileSize = 22;
    this._drag = null;
  }

  async init(hostEl) {
    this.app = new Application();
    await this.app.init({
      background: "#0d0b10",
      resizeTo: hostEl,
      antialias: true,
    });
    hostEl.appendChild(this.app.canvas);

    this.world = new Container();
    this.app.stage.addChild(this.world);
    this._setupInteraction(hostEl);
  }

  render(model) {
    if (!this.world) return;
    this.world.removeChildren();
    if (!model) return;

    const ts = this.tileSize;

    const terrain = new Graphics();
    for (let y = 0; y < model.h; y++) {
      for (let x = 0; x < model.w; x++) {
        const t = model.tiles[y * model.w + x];
        terrain.rect(x * ts, y * ts, ts, ts).fill(colorFor(t));
      }
    }

    const grid = new Graphics();
    for (let x = 0; x <= model.w; x++) {
      grid.moveTo(x * ts, 0).lineTo(x * ts, model.h * ts);
    }
    for (let y = 0; y <= model.h; y++) {
      grid.moveTo(0, y * ts).lineTo(model.w * ts, y * ts);
    }
    grid.stroke({ width: 1, color: 0x000000, alpha: 0.25 });

    this.world.addChild(terrain);
    this.world.addChild(grid);
    this._center(model);
  }

  _center(model) {
    const ts = this.tileSize;
    const sw = this.app.screen.width;
    const sh = this.app.screen.height;
    this.world.x = (sw - model.w * ts) / 2;
    this.world.y = (sh - model.h * ts) / 2;
  }

  _setupInteraction(hostEl) {
    // Pan via arraste
    hostEl.addEventListener("pointerdown", (e) => {
      this._drag = { x: e.clientX, y: e.clientY, wx: this.world.x, wy: this.world.y };
    });
    window.addEventListener("pointerup", () => {
      this._drag = null;
    });
    window.addEventListener("pointermove", (e) => {
      if (!this._drag) return;
      this.world.x = this._drag.wx + (e.clientX - this._drag.x);
      this.world.y = this._drag.wy + (e.clientY - this._drag.y);
    });
    // Zoom via roda
    hostEl.addEventListener(
      "wheel",
      (e) => {
        e.preventDefault();
        const factor = e.deltaY < 0 ? 1.1 : 0.9;
        const next = Math.min(3, Math.max(0.3, this.world.scale.x * factor));
        this.world.scale.set(next);
      },
      { passive: false }
    );
  }

  destroy() {
    if (this.app) {
      this.app.destroy(true, { children: true });
      this.app = null;
      this.world = null;
    }
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/map/render/MapRenderer.js
git commit -m "feat(map): PixiJS renderer with pan/zoom

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

(Verificação visual acontece na Task 12, quando a página monta o renderer.)

---

### Task 12: Página Mapa + integração na navegação

> Verificação **manual** via `npm run dev`.

**Files:**
- Create: `src/pages/MapPage.jsx`
- Modify: `src/App.jsx` (importar e rotear a página `map`)
- Modify: `src/components/Sidebar.jsx:3-9` (adicionar item de navegação)
- Modify: `src/components/Topbar.jsx:1-7` (adicionar título da página)

**Interfaces:**
- Consumes: `generateMap` (Task 9), `MapRenderer` (Task 11), `T` (tokens).
- Produces: componente `MapPage` (default export) e a rota `map` na navegação.

- [ ] **Step 1: Criar `MapPage.jsx`**

Create `src/pages/MapPage.jsx`:
```jsx
import { useEffect, useRef, useState } from "react";
import { T } from "../tokens.js";
import { generateMap } from "../map/generators/index.js";
import { MapRenderer } from "../map/render/MapRenderer.js";

const TYPES = [
  { id: "dungeon", label: "Masmorra" },
  { id: "cave", label: "Caverna" },
  { id: "wilderness", label: "Wilderness" },
];

export default function MapPage() {
  const hostRef = useRef(null);
  const rendererRef = useRef(null);
  const [type, setType] = useState("dungeon");
  const [seed, setSeed] = useState(1337);
  const [error, setError] = useState(null);

  // Monta o renderer uma vez.
  useEffect(() => {
    const renderer = new MapRenderer();
    rendererRef.current = renderer;
    let alive = true;
    renderer.init(hostRef.current).then(() => {
      if (alive) generate();
    });
    return () => {
      alive = false;
      renderer.destroy();
      rendererRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function generate(nextSeed = seed, nextType = type) {
    try {
      const model = generateMap({ type: nextType, seed: nextSeed, width: 48, height: 32 });
      rendererRef.current?.render(model);
      setError(null);
    } catch (e) {
      setError(e.message);
    }
  }

  function randomize() {
    const s = Math.floor(Math.random() * 2 ** 31);
    setSeed(s);
    generate(s, type);
  }

  const btn = {
    background: T.bg3,
    color: T.text,
    border: `1px solid ${T.border}`,
    borderRadius: 6,
    padding: "8px 14px",
    cursor: "pointer",
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: 13,
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <div
        style={{
          display: "flex",
          gap: 10,
          alignItems: "center",
          padding: 16,
          borderBottom: `1px solid ${T.border}`,
          background: T.bg1,
          flexWrap: "wrap",
        }}
      >
        {TYPES.map((tp) => (
          <button
            key={tp.id}
            style={{
              ...btn,
              borderColor: type === tp.id ? T.gold : T.border,
              color: type === tp.id ? T.gold : T.text,
            }}
            onClick={() => {
              setType(tp.id);
              generate(seed, tp.id);
            }}
          >
            {tp.label}
          </button>
        ))}
        <span style={{ color: T.textDim, fontFamily: "'JetBrains Mono', monospace", fontSize: 12 }}>
          seed
        </span>
        <input
          type="number"
          value={seed}
          onChange={(e) => setSeed(Number(e.target.value))}
          style={{
            ...btn,
            width: 120,
            background: T.bg2,
          }}
        />
        <button style={btn} onClick={() => generate(seed, type)}>
          Gerar
        </button>
        <button style={{ ...btn, borderColor: T.arcane, color: T.arcaneBright }} onClick={randomize}>
          🎲 Aleatório
        </button>
        {error && (
          <span style={{ color: T.crimsonBright, fontSize: 13 }}>⚠ {error}</span>
        )}
      </div>
      <div ref={hostRef} style={{ flex: 1, minHeight: 0, position: "relative" }} />
    </div>
  );
}
```

- [ ] **Step 2: Rotear a página em `App.jsx`**

Em `src/App.jsx`, adicionar o import junto aos outros (após a linha do `CampaignPage`):
```jsx
import MapPage from "./pages/MapPage.jsx";
```
E adicionar a rota dentro de `.content`, após a linha `{page === "campaign" && <CampaignPage />}`:
```jsx
            {page === "map" && <MapPage />}
```
Também incluir `map` na condição de padding zero (o mapa ocupa a tela inteira, como o DM):
```jsx
          <div className="content" style={page === "dm" || page === "map" ? { padding: 0 } : {}}>
```

- [ ] **Step 3: Adicionar item na Sidebar**

Em `src/components/Sidebar.jsx`, no array `PAGES` (linhas 3-9), adicionar o item antes de `campaign`:
```jsx
export const PAGES = [
  { id: "dashboard", label: "Painel", icon: "🏰" },
  { id: "dm", label: "Dungeon Master", icon: "🎭" },
  { id: "players", label: "Aventureiros", icon: "⚔️" },
  { id: "dice", label: "Dados", icon: "🎲" },
  { id: "map", label: "Mapa", icon: "🗺️" },
  { id: "campaign", label: "Campanha", icon: "📜" },
];
```

- [ ] **Step 4: Adicionar título na Topbar**

Em `src/components/Topbar.jsx`, no objeto `PAGE_TITLES` (linhas 1-7), adicionar:
```jsx
export const PAGE_TITLES = {
  dashboard: "Painel da Campanha",
  dm: "Dungeon Master — IA",
  players: "Aventureiros",
  dice: "Mesa de Dados",
  map: "Mapa — Geração Procedural",
  campaign: "Diário da Campanha",
};
```

- [ ] **Step 5: Verificação manual**

Run: `npm run dev`
Expected:
- App sobe sem erros no console.
- Item "🗺️ Mapa" aparece na sidebar; ao clicar, abre a página.
- Um mapa de masmorra é desenhado automaticamente.
- Alternar Masmorra/Caverna/Wilderness redesenha; "Gerar" com a mesma seed produz o mesmo mapa; "🎲 Aleatório" muda.
- Arrastar faz pan; roda do mouse faz zoom.

- [ ] **Step 6: Rodar a suíte de testes (regressão)**

Run: `npm test`
Expected: PASS — nenhuma regressão.

- [ ] **Step 7: Commit**

```bash
git add src/pages/MapPage.jsx src/App.jsx src/components/Sidebar.jsx src/components/Topbar.jsx
git commit -m "feat(map): Map page wired into navigation

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Resultado da Fase 1

Página **Mapa** funcional: gera masmorras (BSP), cavernas (cellular automata) e
wilderness (simplex noise) de forma determinística por seed, garante conectividade,
e renderiza em PixiJS com pan/zoom. Toda a lógica de geração é coberta por testes
unitários; o renderer é verificado manualmente.

**Próximas fases (planos separados):**
- **Fase 2:** tokens arrastáveis com snap ao grid, fog of war, medição de distância.
- **Fase 3:** tool `generate_map` no DM Agent + persistência seed/overlay (v0.2).
```
