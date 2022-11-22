// Lock screen orientation
screen.orientation.lock("portrait");

const canvas = document.getElementById("canvas");
const context = canvas.getContext("2d");

const canvasBuffer = document.getElementById("canvasBuffer");
const canvasBufferContext = canvasBuffer.getContext("2d");

let isDrawing = false;
let x = 0;
let y = 0;
var offsetX;
var offsetY;

const selectFilter = document.getElementById("s-filter");
const selectShape = document.getElementById("s-shape");

function changeFilter() {
  console.log("inside changeFilter");
  const option = selectFilter.value;

  switch (option) {
    case "sepia":
      filterCanvas("sepia(1)");
      break;
    case "blur":
      filterCanvas("blur(4px)");
      break;
    case "contrast":
      filterCanvas("contrast(0.2)");
      break;
    case "invert":
      filterCanvas("invert(1)");
      break;
    default:
      context.filter = "none";
  }
}
function filterCanvas(filter) {
  let data = canvas.toDataURL();
  clearArea();
  const img = new Image();
  img.onload = drawImage;
  img.src = data;
  const patt = context.createPattern(img, "no-repeat");
  context.fillStyle = patt;
  context.filter = filter;
  context.beginPath();
  context.closePath();
  context.fill();

  function drawImage() {
    context.drawImage(this, 0, 0);
  }
}

selectFilter.addEventListener("change", changeFilter);

function resizeCanvas() {
  const windowWidth = window.innerWidth;
  const windowHeight = window.innerHeight;

  canvas.setAttribute("height", windowHeight * 0.5);
  canvas.setAttribute("width", windowWidth * 0.95);

  canvasBuffer.setAttribute("height", windowHeight * 0.5);
  canvasBuffer.setAttribute("width", windowWidth * 0.95);
}

addEventListener("resize", resizeCanvas);

// Ran after DOM loads:
function startup() {
  resizeCanvas();

  // EVENT LISTENERS FOR TOUCH
  canvas.addEventListener("touchstart", handleStart);
  canvas.addEventListener("touchend", handleEnd);
  canvas.addEventListener("touchcancel", handleCancel);
  canvas.addEventListener("touchmove", handleMove);

  // EVENT LISTENERS FOR MOUSE
  canvas.addEventListener("mousedown", (e) => {
    x = e.offsetX;
    y = e.offsetY;
    isDrawing = true;
    console.log("mousedown");
    canvasBufferContext.drawImage(canvas, 0, 0);
  });
  canvas.addEventListener("mousemove", (e) => {
    if (isDrawing) {
      const option = selectShape.value;
      switch (option) {
        case "sketch":
          drawLine(context, x, y, e.offsetX, e.offsetY);
          x = e.offsetX;
          y = e.offsetY;
          break;

        case "line":
          clearArea();
          context.drawImage(canvasBuffer, 0, 0);
          drawLine(context, x, y, e.offsetX, e.offsetY);
          break;

        case "rectangle":
          clearArea();
          context.drawImage(canvasBuffer, 0, 0);
          drawRectangle(context, x, y, e.offsetX, e.offsetY);
          break;

        case "circle":
          clearArea();
          context.drawImage(canvasBuffer, 0, 0);
          drawCircle(context, x, y, e.offsetX, e.offsetY);
          break;

        case "brush":
          drawSzprej(context, x, y, e.offsetX, e.offsetY);
          x = e.offsetX;
          y = e.offsetY;
          break;
      }
    }
  });
  canvas.addEventListener("mouseup", (e) => {
    if (isDrawing) {
      const option = selectShape.value;
      switch (option) {
        case "sketch":
          drawLine(context, x, y, e.offsetX, e.offsetY);
          break;
        case "line":
          drawLine(context, x, y, e.offsetX, e.offsetY);
          break;
        case "rectangle":
          drawRectangle(context, x, y, e.offsetX, e.offsetY);
          break;
        case "circle":
          drawCircle(context, x, y, e.offsetX, e.offsetY);
          break;
        case "brush":
          drawSzprej(context, x, y, e.offsetX, e.offsetY);
          break;
      }
      x = 0;
      y = 0;
      isDrawing = false;
      canvasBufferContext.drawImage(canvas, 0, 0);
    }
  });
}

document.addEventListener("DOMContentLoaded", startup);

const ongoingTouches = [];

// FUNCTIONS FOR HANDLING TOUCH
function handleStart(evt) {
  evt.preventDefault();
  const touches = evt.changedTouches;
  offsetX = canvas.getBoundingClientRect().left;
  offsetY = canvas.getBoundingClientRect().top;

  console.log("touchStart");

  for (let i = 0; i < 1; i++) {
    ongoingTouches.push(copyTouch(touches[i]));

    const idx = ongoingTouchIndexById(touches[i].identifier);
    if (idx >= 0) {
      x = touches[i].clientX - offsetX;
      y = touches[i].clientY - offsetY;
    }

    canvasBufferContext.drawImage(canvas, 0, 0);
  }
}

function handleMove(evt) {
  evt.preventDefault();
  const touches = evt.changedTouches;
  for (let i = 0; i < 1; i++) {
    const idx = ongoingTouchIndexById(touches[i].identifier);
    if (idx >= 0) {
      console.log("touchmove");

      let x2 = touches[i].clientX - offsetX;
      let y2 = touches[i].clientY - offsetY;

      const option = selectShape.value;
      switch (option) {
        case "sketch":
          x = ongoingTouches[idx].clientX - offsetX;
          y = ongoingTouches[idx].clientY - offsetY;
          drawLine(context, x, y, x2, y2);

          break;

        case "line":
          clearArea();
          context.drawImage(canvasBuffer, 0, 0);
          drawLine(context, x, y, x2, y2);
          break;

        case "rectangle":
          clearArea();
          context.drawImage(canvasBuffer, 0, 0);
          drawRectangle(context, x, y, x2, y2);
          break;

        case "circle":
          clearArea();
          context.drawImage(canvasBuffer, 0, 0);
          drawCircle(context, x, y, x2, y2);
          break;

        case "brush":
          x = ongoingTouches[idx].clientX - offsetX;
          y = ongoingTouches[idx].clientY - offsetY;
          drawSzprej(context, x, y, x2, y2);
          break;
      }
      ongoingTouches.splice(idx, 1, copyTouch(touches[i])); // swap in the new touch record
    }
  }
}

function handleEnd(evt) {
  evt.preventDefault();
  const touches = evt.changedTouches;
  for (let i = 0; i < 1; i++) {
    let idx = ongoingTouchIndexById(touches[i].identifier);
    if (idx >= 0) {
      let x2 = touches[i].clientX - offsetX;
      let y2 = touches[i].clientY - offsetY;

      const option = selectShape.value;
      switch (option) {
        case "sketch":
          drawLine(context, x, y, x2, y2);
          break;
        case "line":
          drawLine(context, x, y, x2, y2);
          break;
        case "rectangle":
          drawRectangle(context, x, y, x2, y2);
          break;
        case "circle":
          drawCircle(context, x, y, x2, y2);
          break;
        case "brush":
          drawSzprej(context, x, y, x2, y2);
          break;
      }
      x = 0;
      y = 0;
      canvasBufferContext.drawImage(canvas, 0, 0);
      ongoingTouches.splice(idx, 1); // remove it; we're done
    }
  }
}

function handleCancel(evt) {
  evt.preventDefault();
  const touches = evt.changedTouches;
  for (let i = 0; i < touches.length; i++) {
    let idx = ongoingTouchIndexById(touches[i].identifier);
    ongoingTouches.splice(idx, 1); // remove it; we're done
  }
}

function copyTouch({ identifier, clientX, clientY }) {
  return { identifier, clientX, clientY };
}

function ongoingTouchIndexById(idToFind) {
  for (let i = 0; i < ongoingTouches.length; i++) {
    const id = ongoingTouches[i].identifier;
    if (id === idToFind) {
      return i;
    }
  }
  return -1; // not found
}

// Ran after releasing mouse
function drawLine(context, x1, y1, x2, y2) {
  context.beginPath();
  context.strokeStyle = document.getElementById("s-color").value;
  context.lineWidth = document.getElementById("s-line-width").value;
  context.lineJoin = "round";
  context.moveTo(x1, y1);
  context.lineTo(x2, y2);
  context.closePath();
  context.stroke();
}

function drawRectangle(context, x1, y1, x2, y2) {
  context.beginPath();
  context.strokeStyle = document.getElementById("s-color").value;
  context.lineWidth = document.getElementById("s-line-width").value;
  context.lineJoin = "round";
  context.rect(x1, y1, x2 - x1, y2 - y1);
  context.stroke();
}

function drawCircle(context, x1, y1, x2, y2) {
  context.beginPath();
  context.strokeStyle = document.getElementById("s-color").value;
  context.lineWidth = document.getElementById("s-line-width").value;
  context.lineJoin = "round";
  let r = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
  context.arc(x1, y1, r, 0, 2 * Math.PI);
  context.stroke();
}

function drawSzprej(context, x1, y1, x2, y2) {
  context.beginPath();
  context.strokeStyle = document.getElementById("s-color").value;
  let r = document.getElementById("s-line-width").value;
  context.arc(
    x1 + Math.cos(Math.random() * Math.PI * 2) * r * Math.random(),
    y1 + Math.sin(Math.random() * Math.PI * 2) * r * Math.random(),
    1,
    0,
    Math.PI * 2,
    false
  );
  // context.fill();
  context.stroke();
  context.closePath();
}

function clearArea() {
  context.setTransform(1, 0, 0, 1, 0, 0);
  context.clearRect(0, 0, context.canvas.width, context.canvas.height);
}

function clearAreaBuffer() {
  canvasBufferContext.setTransform(1, 0, 0, 1, 0, 0);
  canvasBufferContext.clearRect(
    0,
    0,
    canvasBufferContext.canvas.width,
    canvasBufferContext.canvas.height
  );
}
