import "./style.css";

document.body.innerHTML = `
  <h1>Draw a thing (now with stickers!)</h1>
`;

const canvas = document.createElement("canvas");
canvas.width = 256;
canvas.height = 256;
document.body.append(canvas);
