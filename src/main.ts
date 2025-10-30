import "./style.css";

//classes
class MarkerLine {
  private points: Array<Cursor> = [];
  public width: number = 1;
  public drag(x: number, y: number) {
    this.points.push({ x: x, y: y, active: true });
  }
  public display(ctx: CanvasRenderingContext2D) {
    if (this.points.length > 0) {
      ctx.beginPath();
      ctx.lineWidth = this.width;
      const { x, y } = this.points[0];
      ctx.moveTo(x, y);
      for (const { x, y } of this.points) {
        ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
  }
}

class DisplayText {
  private x: number = 0;
  private y: number = 0;
  public text = "";
  public width: number = 1;
  public drag(x: number, y: number) {
    this.x = x;
    this.y = y;
  }
  public display(ctx: CanvasRenderingContext2D) {
    ctx.font = "30px monospace";
    ctx.fillText(this.text, this.x, this.y);
  }
}

class ToolDisplay {
  public type: string;
  public text: string = "hello world!";
  public width: number = 1;
  public onCanvas: boolean = false;
  private x: number = 1;
  private y: number = 1;

  public constructor(type: string) {
    this.type = type;
  }
  public move(x: number, y: number) {
    this.x = x;
    this.y = y;
  }
  public display(ctx: CanvasRenderingContext2D) {
    if (this.onCanvas) {
      switch (this.type) {
        case "line":
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.arc(this.x, this.y, this.width / 2, 0, Math.PI * 2);
          ctx.stroke();
          ctx.fillStyle = "black";
          ctx.fill();
          ctx.closePath();
          break;
        case "text":
          ctx.font = "30px monospace";
          ctx.fillText(this.text, this.x, this.y);
          break;
        default:
          break;
      }
    }
  }
}

interface StickerButton {
  buttonElement: HTMLButtonElement;
  text: string;
}

//so the compiler doesnt complain that they are not set but will be replaced later
const tempButton = document.createElement("button");
const stickerButtons: StickerButton[] = [
  {
    buttonElement: tempButton,
    text: "🦝",
  },
  {
    buttonElement: tempButton,
    text: "🦉",
  },
  {
    buttonElement: tempButton,
    text: "🌲",
  },
  {
    buttonElement: tempButton,
    text: "custom",
  },
];

document.body.innerHTML = `
  <h1>Draw a thing (now with stickers!)</h1>
`;

const redrawEvent = new Event("drawing-changed");
const toolMoveEvent = new Event("tool-moved");

const canvas = document.createElement("canvas");
canvas.width = 256;
canvas.height = 256;
document.body.append(canvas);
const ctx = canvas.getContext("2d");
canvas.addEventListener("drawing-changed", redraw);
canvas.addEventListener("tool-moved", redraw);

// buttons

const div = document.createElement("div");
document.body.appendChild(div);

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

//linediv
const lineDiv = document.createElement("div");
document.body.appendChild(lineDiv);

// thick button
const thickButton = document.createElement("button");
thickButton.innerHTML = "thick line";
document.body.appendChild(thickButton);

//thin button
const thinButton = document.createElement("button");
thinButton.innerHTML = "thin line";
document.body.appendChild(thinButton);

//emoji div
const emojiDiv = document.createElement("div");
document.body.appendChild(emojiDiv);

//create stickers
for (const button of stickerButtons) {
  //connect element and add the button to the page
  button.buttonElement = document.createElement("button");
  document.body.appendChild(button.buttonElement);
  button.buttonElement.innerHTML = button.text;

  //add event listener
  button.buttonElement.addEventListener("click", () => {
    currentWidth = 1;
    toolDisplay.type = "text";
    toolDisplay.text = button.buttonElement.textContent;
  });
}

//set up custom button
stickerButtons[stickerButtons.length - 1].buttonElement.addEventListener(
  "click",
  () => {
    const text = prompt("Custom sticker text", "🐉");
    if (text) {
      currentWidth = 1;
      toolDisplay.type = "text";
      toolDisplay.text = text;
    }
  },
);

//line variables
const lines: Array<MarkerLine | DisplayText> = [];
const redoLines: Array<MarkerLine | DisplayText> = [];

let currentLine: MarkerLine | DisplayText = new MarkerLine();
let currentWidth: number = 1;

const cursor: Cursor = { active: false, x: 0, y: 0 };
const toolDisplay: ToolDisplay = new ToolDisplay("line");

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

thickButton.addEventListener("click", () => {
  currentWidth = 5;
  toolDisplay.type = "line";
  toolDisplay.width = 5;
});
thinButton.addEventListener("click", () => {
  currentWidth = 1;
  toolDisplay.type = "line";
  toolDisplay.width = 1;
});

// Draw
canvas.addEventListener("mousedown", (e) => {
  cursor.active = true;
  cursor.x = e.offsetX;
  cursor.y = e.offsetY;

  if (toolDisplay.type === "text") {
    currentLine = new DisplayText();
    currentLine.text = toolDisplay.text;
  } else {
    currentLine = new MarkerLine();
    currentLine.width = currentWidth;
  }
  currentLine.drag(cursor.x, cursor.y);
  lines.push(currentLine);
  redoLines.length = 0;
});

canvas.addEventListener("mousemove", (e) => {
  toolDisplay.onCanvas = true;
  document.body.style.cursor = "none";
  if (cursor.active) {
    cursor.x = e.offsetX;
    cursor.y = e.offsetY;
    currentLine.drag(cursor.x, cursor.y);
  }
  toolDisplay.move(e.offsetX, e.offsetY);
  canvas.dispatchEvent(toolMoveEvent);
});

canvas.addEventListener("mouseup", () => {
  cursor.active = false;
});

canvas.addEventListener("mouseout", () => {
  document.body.style.cursor = "auto";
  toolDisplay.onCanvas = false;
  canvas.dispatchEvent(redrawEvent);
});

function redraw() {
  if (ctx) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (const line of lines) {
      line.display(ctx);
    }
    toolDisplay.display(ctx);
  }
}
