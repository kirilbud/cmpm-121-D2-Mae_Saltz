import "./style.css";

//classes
class MarkerLine {
  public points: Array<Cursor> = [];
  public width: number = 2;
  public drag(x: number, y: number) {
    this.points.push({ x: x, y: y, active: true });
  }
  public display(ctx: CanvasRenderingContext2D) {
    if (this.points.length > 0) {
      ctx.beginPath();
      const { x, y } = this.points[0];
      ctx.moveTo(x, y);
      for (const { x, y } of this.points) {
        ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
  }
}

document.body.innerHTML = `
  <h1>Draw a thing (now with stickers!)</h1>
`;

const redrawEvent = new Event("drawing-changed");

const canvas = document.createElement("canvas");
canvas.width = 256;
canvas.height = 256;
document.body.append(canvas);
const ctx = canvas.getContext("2d");
canvas.addEventListener("drawing-changed", redraw);

// buttons
// clear button
const clearButton = document.createElement("button");
clearButton.innerHTML = "clear";
document.body.appendChild(clearButton);

// undo button
const undoButton = document.createElement("button");
undoButton.innerHTML = "undo";
document.body.appendChild(undoButton);

//redo button
const redoButton = document.createElement("button");
redoButton.innerHTML = "redo";
document.body.appendChild(redoButton);

//line variables
const lines: Array<MarkerLine> = [];
const redoLines: Array<MarkerLine> = [];

let currentLine: MarkerLine = new MarkerLine();

const cursor: Cursor = { active: false, x: 0, y: 0 };

interface Cursor {
  active: boolean;
  x: number;
  y: number;
}

//clears canvas
clearButton.addEventListener("click", () => {
  if (ctx) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    lines.length = 0;
    redoLines.length = 0;
  }
});

undoButton.addEventListener("click", () => {
  if (lines.length > 0) {
    const redoline = lines.pop();
    if (!(redoline === undefined)) {
      redoLines.push(redoline);
      console.log("pushed");
    }
    canvas.dispatchEvent(redrawEvent);
  }
});

redoButton.addEventListener("click", () => {
  if (redoLines.length > 0) {
    const tempLine = redoLines.pop();
    if (!(tempLine === undefined)) {
      lines.push(tempLine);
    }
    canvas.dispatchEvent(redrawEvent);
  }
});

// Draw
canvas.addEventListener("mousedown", (e) => {
  cursor.active = true;
  cursor.x = e.offsetX;
  cursor.y = e.offsetY;

  currentLine = new MarkerLine();
  lines.push(currentLine);
  redoLines.length = 0;
});

canvas.addEventListener("mousemove", (e) => {
  if (cursor.active) {
    cursor.x = e.offsetX;
    cursor.y = e.offsetY;

    currentLine.drag(cursor.x, cursor.y);

    canvas.dispatchEvent(redrawEvent);
  }
});

canvas.addEventListener("mouseup", () => {
  cursor.active = false;
});

function redraw() {
  if (ctx) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (const line of lines) {
      line.display(ctx);
    }
  }
}
