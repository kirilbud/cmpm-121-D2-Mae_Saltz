import "./style.css";

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

// clear button
const undoButton = document.createElement("button");
undoButton.innerHTML = "undo";
document.body.appendChild(undoButton);

//line variables
const lines: Array<Array<Cursor>> = [];
//const redoLines = [];

let currentLine: Array<Cursor> = [];

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
  }
});

// Draw
canvas.addEventListener("mousedown", (e) => {
  cursor.active = true;
  cursor.x = e.offsetX;
  cursor.y = e.offsetY;

  currentLine = [];
  lines.push(currentLine);
});

canvas.addEventListener("mousemove", (e) => {
  if (cursor.active) {
    cursor.x = e.offsetX;
    cursor.y = e.offsetY;

    currentLine.push({ x: cursor.x, y: cursor.y, active: true });

    canvas.dispatchEvent(redrawEvent);
  }
});

canvas.addEventListener("mouseup", () => {
  cursor.active = false;
});

function redraw() {
  //console.log(lines);
  if (ctx) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (const line of lines) {
      if (line.length > 1) {
        ctx.beginPath();
        const { x, y } = line[0];
        ctx.moveTo(x, y);
        for (const { x, y } of line) {
          ctx.lineTo(x, y);
          //console.log(x);
        }
        ctx.stroke();
      }
    }
  }
}
