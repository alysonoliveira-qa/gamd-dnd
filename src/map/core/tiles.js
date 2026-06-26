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
