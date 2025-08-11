import { toKey, fromKey, smartGet, smartSet } from './arraysAndObjects.js';

function heuristic(a, b) {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}

function reconstructPath(cameFrom, current) {
  const totalPath = [current];
  let currentKey = toKey(current);
  while (cameFrom[currentKey]) {
    current = cameFrom[currentKey];
    totalPath.unshift(current);
    currentKey = toKey(current);
  }
  return totalPath;
}

export function findPath(grid, units, start, end) {
  const openSet = [start];
  const closedSet = new Set();
  const cameFrom = {};

  const gScore = {};
  smartSet(gScore, start, 0);

  const fScore = {};
  smartSet(fScore, start, heuristic(start, end));

  while (openSet.length > 0) {
    let current = openSet[0];
    let currentIndex = 0;
    for (let i = 1; i < openSet.length; i++) {
      if (smartGet(fScore, openSet[i], Infinity) < smartGet(fScore, current, Infinity)) {
        current = openSet[i];
        currentIndex = i;
      }
    }

    if (current.x === end.x && current.y === end.y) {
      return reconstructPath(cameFrom, current);
    }

    openSet.splice(currentIndex, 1);
    closedSet.add(toKey(current));

    const neighbors = [
      { x: current.x + 1, y: current.y },
      { x: current.x - 1, y: current.y },
      { x: current.x, y: current.y + 1 },
      { x: current.x, y: current.y - 1 },
    ];

    for (const neighbor of neighbors) {
      if (closedSet.has(toKey(neighbor))) {
        continue;
      }

      const cell = smartGet(grid, neighbor);
      if (cell && cell.type === 'mountain') {
        continue;
      }
      const isOccupied = smartGet(units, neighbor);
      if (isOccupied && (neighbor.x !== end.x || neighbor.y !== end.y)) {
        continue;
      }

      const tentativeGScore = smartGet(gScore, current, Infinity) + 1;
      const neighborGScore = smartGet(gScore, neighbor, Infinity);

      if (tentativeGScore < neighborGScore) {
        cameFrom[toKey(neighbor)] = current;
        smartSet(gScore, neighbor, tentativeGScore);
        smartSet(fScore, neighbor, tentativeGScore + heuristic(neighbor, end));
        if (!openSet.find(node => node.x === neighbor.x && node.y === neighbor.y)) {
          openSet.push(neighbor);
        }
      }
    }
  }

  return null; // No path found
}
