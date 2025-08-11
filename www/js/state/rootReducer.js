import { smartSet, smartGet, fromKey, toKey } from '../utils/arraysAndObjects.js';
import { findPath } from '../utils/pathfinding.js';

function getNeighbors(pos) {
  return [
    { x: pos.x + 1, y: pos.y },
    { x: pos.x - 1, y: pos.y },
    { x: pos.x, y: pos.y + 1 },
    { x: pos.x, y: pos.y - 1 },
  ];
}

function findAvailableCells(grid, units, start, target, count) {
  const availableCells = [];
  const queue = [target];
  const visited = new Set([toKey(target)]);

  while (queue.length > 0 && availableCells.length < count) {
    const current = queue.shift();
    const cellIsOccupied = smartGet(units, current);
    const cellIsMountain = smartGet(grid, current)?.type === 'mountain';

    if (!cellIsOccupied && !cellIsMountain) {
      availableCells.push(current);
    }

    for (const neighbor of getNeighbors(current)) {
      const neighborKey = toKey(neighbor);
      if (!visited.has(neighborKey)) {
        visited.add(neighborKey);
        queue.push(neighbor);
      }
    }
  }

  return availableCells;
}

export const rootReducer = (state, action) => {
  if (state === undefined) state = initState();

  switch (action.type) {
    case 'TURN':
      return {...state, turn: state.turn + 1};
    case 'MOVE_UNITS': {
      const { units, target } = action;
      const newUnits = { ...state.units };

      const availableCells = findAvailableCells(state.grid, state.units, target, target, units.length);

      for (let i = 0; i < units.length; i++) {
        const unitKey = units[i];
        const unit = smartGet(newUnits, unitKey);
        const start = fromKey(unitKey);
        const end = availableCells[i];

        if (!end) continue; // No available cell for this unit

        const path = findPath(state.grid, start, end);
        if (path && path.length > 1 && unit.fuel >= path.length - 1) {
          const newFuel = unit.fuel - (path.length - 1);
          const newUnit = { ...unit, fuel: newFuel };
          const newUnitKey = toKey(end);

          delete newUnits[unitKey];
          newUnits[newUnitKey] = newUnit;
        }
      }
      return {...state, units: newUnits};
    }
    default:
      return state;
  }
};

export const initState = () => {
  const grid = {};
  // Add some mountains
  smartSet(grid, {x: 3, y: 3}, {type: 'mountain'});
  smartSet(grid, {x: 3, y: 4}, {type: 'mountain'});
  smartSet(grid, {x: 3, y: 5}, {type: 'mountain'});
  smartSet(grid, {x: 4, y: 5}, {type: 'mountain'});
  smartSet(grid, {x: 5, y: 5}, {type: 'mountain'});

  const units = {};
  // Add some units
  smartSet(units, {x: 1, y: 1}, {id: 1, type: 'tank', player: 'player1', fuel: 100});
  smartSet(units, {x: 2, y: 2}, {id: 2, type: 'artillery', player: 'player1', fuel: 80});
  smartSet(units, {x: 8, y: 8}, {id: 3, type: 'tank', player: 'player2', fuel: 100});

  return {
    turn: 0,
    playerId: 'player1',
    grid,
    units,
    width: 10,
    height: 10,
  };
}
