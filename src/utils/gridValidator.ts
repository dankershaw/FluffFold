import { FIXTURE_DEFINITIONS } from '../constants/gameData';
import {
  FixtureTypeId,
  PlacedFixture,
  PlacementValidationResult,
  TileCoord,
} from '../types/game';

export const GRID_SIZE = 12; // 12x12 tiles (6m x 6m at 0.5m/tile)
export const TILE_SIZE_METERS = 0.5;

// Front doorway sits at tile (5, 11) and (6, 11) on the South (+Z) edge
export const ENTRANCE_TILES: TileCoord[] = [
  { x: 5, z: 11 },
  { x: 6, z: 11 },
];

// Delivery doorway sits on the East (+X) edge at (11, 8)
export const DELIVERY_DOOR_TILE: TileCoord = { x: 11, z: 8 };

/**
 * Converts grid tile coordinates (x, z) in [0..gridSize-1] to 3D world coordinates (meters),
 * centered around (0, 0, 0).
 */
export function tileToWorld(
  tileX: number,
  tileZ: number,
  widthTiles = 1,
  depthTiles = 1,
  gridSize = GRID_SIZE
): [number, number, number] {
  const halfGrid = (gridSize * TILE_SIZE_METERS) / 2;
  const worldX = -halfGrid + (tileX + widthTiles / 2) * TILE_SIZE_METERS;
  const worldZ = -halfGrid + (tileZ + depthTiles / 2) * TILE_SIZE_METERS;
  return [worldX, 0, worldZ];
}

/**
 * Converts a 3D world point (x, z) to snapped integer grid coordinates.
 */
export function worldToTile(
  worldX: number,
  worldZ: number,
  gridSize = GRID_SIZE
): TileCoord {
  const halfGrid = (gridSize * TILE_SIZE_METERS) / 2;
  const tileX = Math.floor((worldX + halfGrid) / TILE_SIZE_METERS);
  const tileZ = Math.floor((worldZ + halfGrid) / TILE_SIZE_METERS);
  return {
    x: Math.max(0, Math.min(gridSize - 1, tileX)),
    z: Math.max(0, Math.min(gridSize - 1, tileZ)),
  };
}

/**
 * Computes exact footprint tiles and rotated clearance tiles for a fixture at (tileX, tileZ, rotation).
 */
export function getFixtureTiles(
  typeId: FixtureTypeId,
  tileX: number,
  tileZ: number,
  rotation: 0 | 1 | 2 | 3
): {
  width: number;
  depth: number;
  footprintTiles: TileCoord[];
  clearanceTiles: { x: number; z: number; role: 'interaction' | 'queue' | 'worker' }[];
} {
  const def = FIXTURE_DEFINITIONS[typeId];
  const isRotated90 = rotation === 1 || rotation === 3;
  const width = isRotated90 ? def.depthTiles : def.widthTiles;
  const depth = isRotated90 ? def.widthTiles : def.depthTiles;

  const footprintTiles: TileCoord[] = [];
  for (let dx = 0; dx < width; dx++) {
    for (let dz = 0; dz < depth; dz++) {
      footprintTiles.push({ x: tileX + dx, z: tileZ + dz });
    }
  }

  const clearanceTiles = def.clearanceOffsets.map((offset) => {
    let rx = offset.dx;
    let rz = offset.dz;
    if (rotation === 1) {
      // 90 deg clockwise
      rx = def.depthTiles - 1 - offset.dz;
      rz = offset.dx;
    } else if (rotation === 2) {
      // 180 deg
      rx = def.widthTiles - 1 - offset.dx;
      rz = def.depthTiles - 1 - offset.dz;
    } else if (rotation === 3) {
      // 270 deg clockwise
      rx = offset.dz;
      rz = def.widthTiles - 1 - offset.dx;
    }
    return {
      x: tileX + rx,
      z: tileZ + rz,
      role: offset.role,
    };
  });

  return { width, depth, footprintTiles, clearanceTiles };
}

/**
 * Deterministic A* / BFS reachability check between two tiles on the 2D grid.
 * Blocked tiles cannot be stepped on.
 */
export function hasPathBetween(
  start: TileCoord,
  goal: TileCoord,
  blockedSet: Set<string>,
  gridSize = GRID_SIZE
): boolean {
  const key = (x: number, z: number) => `${x},${z}`;
  if (blockedSet.has(key(start.x, start.z)) || blockedSet.has(key(goal.x, goal.z))) {
    return false;
  }
  if (start.x === goal.x && start.z === goal.z) return true;

  const visited = new Set<string>();
  const queue: TileCoord[] = [start];
  visited.add(key(start.x, start.z));

  const dirs = [
    { dx: 1, dz: 0 },
    { dx: -1, dz: 0 },
    { dx: 0, dz: 1 },
    { dx: 0, dz: -1 },
  ];

  while (queue.length > 0) {
    const curr = queue.shift()!;
    if (curr.x === goal.x && curr.z === goal.z) {
      return true;
    }
    for (const d of dirs) {
      const nx = curr.x + d.dx;
      const nz = curr.z + d.dz;
      if (nx < 0 || nx >= gridSize || nz < 0 || nz >= gridSize) continue;
      const nKey = key(nx, nz);
      if (!visited.has(nKey) && !blockedSet.has(nKey)) {
        visited.add(nKey);
        queue.push({ x: nx, z: nz });
      }
    }
  }
  return false;
}

/**
 * Validates whether placing a fixture of `typeId` at `(tileX, tileZ, rotation)` is legal:
 * 1. Entire footprint AND clearance tiles stay inside the [0..gridSize-1] room boundary.
 * 2. Footprint does not overlap any existing fixture footprint or clearance tile, nor doorway entrance tiles.
 * 3. Clearance tiles do not overlap any existing fixture footprint.
 * 4. Preserves A* path connectivity from the Entrance tile to all placed Shelves and the Checkout Counter.
 */
export function validateFixturePlacement(
  typeId: FixtureTypeId,
  tileX: number,
  tileZ: number,
  rotation: 0 | 1 | 2 | 3,
  existingFixtures: PlacedFixture[],
  gridSize = GRID_SIZE,
  ignoreFixtureId?: string
): PlacementValidationResult {
  const { footprintTiles, clearanceTiles } = getFixtureTiles(typeId, tileX, tileZ, rotation);
  const key = (x: number, z: number) => `${x},${z}`;

  // 1. Check room bounds for footprint
  for (const t of footprintTiles) {
    if (t.x < 0 || t.x >= gridSize || t.z < 0 || t.z >= gridSize) {
      return {
        valid: false,
        reason: 'Outside shop floor walls',
        footprintTiles,
        clearanceTiles,
        pathConnected: false,
      };
    }
  }

  // Check room bounds for clearance tiles
  for (const c of clearanceTiles) {
    if (c.x < 0 || c.x >= gridSize || c.z < 0 || c.z >= gridSize) {
      return {
        valid: false,
        reason: 'Interaction clearance blocked by wall',
        footprintTiles,
        clearanceTiles,
        pathConnected: false,
      };
    }
  }

  // Build occupied footprint set and existing clearance set
  const occupiedFootprints = new Set<string>();
  const existingClearances = new Set<string>();

  const activeFixtures = existingFixtures.filter((f) => f.id !== ignoreFixtureId);
  for (const fix of activeFixtures) {
    const tiles = getFixtureTiles(fix.typeId, fix.tileX, fix.tileZ, fix.rotation);
    for (const ft of tiles.footprintTiles) {
      occupiedFootprints.add(key(ft.x, ft.z));
    }
    for (const ct of tiles.clearanceTiles) {
      existingClearances.add(key(ct.x, ct.z));
    }
  }

  // Doorway tiles must remain walkable
  const doorwaySet = new Set<string>([
    ...ENTRANCE_TILES.map((t) => key(t.x, t.z)),
    key(DELIVERY_DOOR_TILE.x, DELIVERY_DOOR_TILE.z),
  ]);

  // 2. Check footprint collision
  for (const t of footprintTiles) {
    const k = key(t.x, t.z);
    if (occupiedFootprints.has(k)) {
      return {
        valid: false,
        reason: 'Overlaps an existing fixture',
        footprintTiles,
        clearanceTiles,
        pathConnected: false,
      };
    }
    if (doorwaySet.has(k)) {
      return {
        valid: false,
        reason: 'Blocks shop entrance or delivery doorway',
        footprintTiles,
        clearanceTiles,
        pathConnected: false,
      };
    }
    if (existingClearances.has(k)) {
      return {
        valid: false,
        reason: 'Intrudes into another fixture’s required aisle clearance',
        footprintTiles,
        clearanceTiles,
        pathConnected: false,
      };
    }
  }

  // 3. Check new fixture's clearance tiles against existing footprints
  for (const c of clearanceTiles) {
    if (occupiedFootprints.has(key(c.x, c.z))) {
      return {
        valid: false,
        reason: 'Required front clearance tile is blocked by another fixture',
        footprintTiles,
        clearanceTiles,
        pathConnected: false,
      };
    }
  }

  // 4. Verify A* path connectivity from Entrance (5,11) to every fixture's primary interaction/queue/worker tile
  const simulatedBlocked = new Set<string>(occupiedFootprints);
  for (const t of footprintTiles) {
    simulatedBlocked.add(key(t.x, t.z));
  }

  const entranceTile = ENTRANCE_TILES[0];
  if (simulatedBlocked.has(key(entranceTile.x, entranceTile.z))) {
    return {
      valid: false,
      reason: 'Blocks main shop entrance',
      footprintTiles,
      clearanceTiles,
      pathConnected: false,
    };
  }

  const allFixturesToTest = [
    ...activeFixtures.map((f) => getFixtureTiles(f.typeId, f.tileX, f.tileZ, f.rotation)),
    { footprintTiles, clearanceTiles },
  ];

  for (const fixTiles of allFixturesToTest) {
    if (fixTiles.clearanceTiles.length === 0) continue;
    // At least one interaction/queue tile and one worker tile (if applicable) must be reachable from the entrance
    const reachable = fixTiles.clearanceTiles.every((ct) =>
      hasPathBetween(entranceTile, { x: ct.x, z: ct.z }, simulatedBlocked, gridSize)
    );
    if (!reachable) {
      return {
        valid: false,
        reason: 'Breaks customer or staff A* path between Entrance, Shelves & Checkout',
        footprintTiles,
        clearanceTiles,
        pathConnected: false,
      };
    }
  }

  return {
    valid: true,
    footprintTiles,
    clearanceTiles,
    pathConnected: true,
  };
}
