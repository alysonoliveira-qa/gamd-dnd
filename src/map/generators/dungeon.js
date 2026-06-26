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
