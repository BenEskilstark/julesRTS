import StatefulHTML from './StatefulHTML.js';
import { smartGet, fromKey, toKey } from '../utils/arraysAndObjects.js';

export default class GameBoard extends StatefulHTML {
  connectedCallback() {
    this.selectedUnits = [];
    this.selectionBox = null;
    this.isDragging = false;

    const canvas = this.querySelector('canvas');
    canvas.addEventListener('mousedown', this.handleMouseDown.bind(this));
    canvas.addEventListener('mousemove', this.handleMouseMove.bind(this));
    canvas.addEventListener('mouseup', this.handleMouseUp.bind(this));
    canvas.addEventListener('contextmenu', this.handleRightClick.bind(this));

    this.render(this.getState());
  }

  getGridCoords(ev) {
    const { width, height } = this.getState();
    const canvas = this.querySelector("canvas");
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const sqSize = rect.width / width;
    const x = Math.floor((ev.clientX - rect.left) / sqSize);
    const y = Math.floor((ev.clientY - rect.top) / sqSize);
    return { x, y };
  }

  handleMouseDown(ev) {
    this.isDragging = true;
    const { x, y } = this.getGridCoords(ev);
    this.selectionBox = { startX: x, startY: y, endX: x, endY: y };
  }

  handleMouseMove(ev) {
    if (!this.isDragging) return;
    const { x, y } = this.getGridCoords(ev);
    this.selectionBox.endX = x;
    this.selectionBox.endY = y;
    this.render(this.getState());
  }

  handleMouseUp(ev) {
    this.isDragging = false;
    const { units, playerId } = this.getState();
    const { startX, startY, endX, endY } = this.selectionBox;

    const minX = Math.min(startX, endX);
    const maxX = Math.max(startX, endX);
    const minY = Math.min(startY, endY);
    const maxY = Math.max(startY, endY);

    this.selectedUnits = [];
    for (const key in units) {
      const { x, y } = fromKey(key);
      const unit = smartGet(units, key);
      if (unit.player === playerId && x >= minX && x <= maxX && y >= minY && y <= maxY) {
        this.selectedUnits.push(toKey({x, y}));
      }
    }

    this.selectionBox = null;
    this.render(this.getState());
  }

  handleRightClick(ev) {
    ev.preventDefault();
    const target = this.getGridCoords(ev);
    if (this.selectedUnits.length > 0 && target) {
      this.dispatch({
        type: 'MOVE_UNITS',
        units: this.selectedUnits,
        target,
      });
    }
  }

  render(state) {
    const {width, height, grid, units} = state;

    const canvas = this.querySelector("canvas")
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const sqSize = canvas.width / width;

    ctx.fillStyle="tan";
    ctx.fillRect(0,0,canvas.width,canvas.height);

    // grid lines
    ctx.beginPath();
    for (let x = 0; x <= width; x++) {
      ctx.strokeStyle = "black";
      ctx.moveTo(x * sqSize, 0);
      ctx.lineTo(x * sqSize, canvas.height);
    }
    ctx.stroke();
    ctx.beginPath();
    for (let y = 0; y <= height; y++) {
      ctx.strokeStyle = "black";
      ctx.moveTo(0, y * sqSize);
      ctx.lineTo(canvas.width, y * sqSize);
    }
    ctx.stroke();

    // terrain
    for (const key in grid) {
      const {x, y} = fromKey(key);
      const cell = smartGet(grid, key);
      if (cell.type === 'mountain') {
        ctx.fillStyle = 'gray';
        ctx.fillRect(x * sqSize, y * sqSize, sqSize, sqSize);
      }
    }

    // units
    for (const key in units) {
      const {x, y} = fromKey(key);
      const unit = smartGet(units, key);
      ctx.fillStyle = unit.player === 'player1' ? 'blue' : 'red';
      ctx.beginPath();
      ctx.arc((x + 0.5) * sqSize, (y + 0.5) * sqSize, sqSize / 2 - 3, 0, Math.PI * 2);
      ctx.fill();

      // unit type
      ctx.fillStyle = 'white';
      ctx.font = `${sqSize / 2}px Arial`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(unit.type[0].toUpperCase(), (x + 0.5) * sqSize, (y + 0.5) * sqSize);
    }

    // selected units highlight
    ctx.strokeStyle = 'yellow';
    ctx.lineWidth = 2;
    for (const key of this.selectedUnits) {
        const {x, y} = fromKey(key);
        ctx.beginPath();
        ctx.arc((x + 0.5) * sqSize, (y + 0.5) * sqSize, sqSize / 2 - 1, 0, Math.PI * 2);
        ctx.stroke();
    }

    // selection box
    if (this.selectionBox) {
        const { startX, startY, endX, endY } = this.selectionBox;
        ctx.strokeStyle = 'green';
        ctx.lineWidth = 1;
        ctx.strokeRect(startX * sqSize, startY * sqSize, (endX - startX + 1) * sqSize, (endY - startY + 1) * sqSize);
    }
  }

  onChange(state) {
    this.render(state);
  }
}
