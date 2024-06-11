
//logistics
window.onload = (event) => {
    context.translate(w/2, h/2);
    context.scale(w/2, -h/2);
    context.save();
    reset();
    startStop();
}

function reset() {
    if (running) startStop();
    x = Number(xInitInput.value);
    y = Number(yInitInput.value);
    z = Number(zInitInput.value);
    xBounds = [-1, 1];
    yBounds = [-1, 1];
    zBounds = [-1, 1];
    tail = [[x,y,z]];
    origin = [Number(xOrigin.value), Number(yOrigin.value), Number(zOrigin.value)];
    t = 0;
    update();
    context.clearRect(-2*scale,-2*scale, 4*scale, 4*scale);
    drawAxes();
}

function update() {
    speed = Number(speedInput.value);
    dt = Number(dtInput.value);
    lineWidth = Number(lineWidthInput.value);
    tMax = Number(tMaxInput.value);
    xDot = Function("x", "y", "z", "return " + xDotInput.value + ";");
    yDot = Function("x", "y", "z", "return " + yDotInput.value + ";");
    zDot = Function("x", "y", "z", "return " + zDotInput.value + ";");
    if (running) {
        x += xDot(x, y, z)*dt;
        y += yDot(x, y, z)*dt;
        z += zDot(x, y, z)*dt;
        tail.push([x,y,z]);
        if (tail.length > tMax) tail.shift();
        t += dt;
    }
    xBounds = [Math.min(xBounds[0], x-xOrigin.value), Math.max(xBounds[1], x-xOrigin.value)];
    yBounds = [Math.min(yBounds[0], y-yOrigin.value), Math.max(yBounds[1], y-yOrigin.value)];
    zBounds = [Math.min(zBounds[0], z-zOrigin.value), Math.max(zBounds[1], z-zOrigin.value)];
    axBounds = [Math.min(xBounds[0], yBounds[0], zBounds[0]),
             Math.max(xBounds[1], yBounds[1], zBounds[1])]
    scale = (axBounds[1] - axBounds[0]);

    context.restore();
    context.save();
    context.scale(1.5/scale, 1.5/scale);

    updateCamMat();
}

function updateCamMat() {
    if (autoSwitch.checked) { camAngle = (t/dt/speed)*(pi/180); }
    else { camAngle = angleSlider.value*pi/180; }
    camHeight = heightSlider.value;

    target = [Number(xOrigin.value)+(xBounds[0]+xBounds[1])/2, Number(yOrigin.value)+(yBounds[0]+yBounds[1])/2, Number(zOrigin.value)+(zBounds[0]+zBounds[1])/2];
    camMat = mat4.create();
    let eye = [cos(camAngle)+target[0], camHeight*scale+target[1], sin(camAngle)+target[2]];
    let up = [0, 1, 0];
    mat4.lookAt(camMat, eye, target, up); 

}

//drawing
function draw() {
    context.clearRect(-2*scale,-2*scale, 4*scale, 4*scale);
    for (let i = 0; i < speed; i++) update();
    drawAxes();
    drawTail();
    context.beginPath();
    arc([x,y,z], 0.75*scale**(-8/scale), 0, 2*pi);
    context.fillStyle = getCol(255-red.value, 255-green.value, 255-blue.value);
    context.fill();
    context.closePath();
    if (running) window.requestAnimationFrame(draw);
}

function drawTail() {
    context.beginPath();
    moveTo(tail[0]);
    for (let i = 1; i < tail.length; i++) {
        lineTo(tail[i]);
    }
    context.lineWidth = lineWidth/((w/2)/scale)
    context.strokeStyle = getCol(red.value, green.value, blue.value);
    context.stroke();
    context.closePath();
}

function drawAxes() {
    let n = Math.floor(Math.max(Math.abs(axBounds[0]), axBounds[1]));
    //grid lines
    if (gridSwitch.checked) {
        context.lineWidth = 1/((w/2)/(scale**(1/2)));
        context.beginPath();
        for (let i = -n; i <= n; i++) {
            moveTo([-n+origin[0], i+origin[1], origin[2]]);
            lineTo([n+origin[0], i+origin[1], origin[2]]);
            moveTo([-n+origin[0], origin[1], i+origin[2]]);
            lineTo([n+origin[0], origin[1], i+origin[2]]);

            moveTo([i+origin[0], -n+origin[1], origin[2]]);
            lineTo([i+origin[0], n+origin[1], origin[2]]);
            moveTo([origin[0], -n+origin[1], i+origin[2]]);
            lineTo([origin[0], n+origin[1], i+origin[2]]);

            moveTo([i+origin[0], origin[1], -n+origin[2]]);
            lineTo([i+origin[0], origin[1], n+origin[2]]);
            moveTo([origin[0], i+origin[1], -n+origin[2]]);
            lineTo([origin[0], i+origin[1], n+origin[2]]);
        }
        context.strokeStyle = "gray";
        context.stroke();
        context.closePath();
    }
    
    //axes
    if (axSwitch.checked) {
        context.lineWidth = 1/((w/2)/scale);
        context.beginPath();
        moveTo([-n+origin[0], origin[1], origin[2]]);
        lineTo([n+origin[0], origin[1], origin[2]]);
        moveTo([origin[0], -n+origin[1], origin[2]]);
        lineTo([origin[0], n+origin[1], origin[2]]);
        moveTo([origin[0], origin[1], -n+origin[2]]);
        lineTo([origin[0], origin[1], n+origin[2]]);
        context.strokeStyle = "black";
        context.stroke();
        context.stroke();
        context.closePath();
    }
}

//color
function getCol(r, g, b) {
    return "rgb(" + r.toString() + " " + g.toString() + " " + b.toString() + ")";
}

//UI
function camInput() {
    if (!running) {
       context.clearRect(-2*scale,-2*scale, 4*scale, 4*scale);
       update();
       drawAxes();
       drawTail();
    }
}

function startStop() {
    if (running) startButton.value = "Start";
    else startButton.value = "Stop";
    running = !running;
    if (running) window.requestAnimationFrame(draw);
}

//variables
let running = false;
let xDot, yDot, zDot, x, y, z, t, dt, tMax,
    xBounds, yBounds, zBounds, axBounds, scale, tail,
    speed, lineWidth, origin,
    camMat, camHeight, camAngle, target;

//html canvas stuff
const canvas = document.getElementById("canvas");
const context = canvas.getContext("2d");
const w = canvas.width;
const h = canvas.height;

//function inputs
const xDotInput = document.getElementById("xDot");
    xDotInput.addEventListener("input", reset);
const yDotInput = document.getElementById("yDot");
    yDotInput.addEventListener("input", reset);
const zDotInput = document.getElementById("zDot");
    zDotInput.addEventListener("input", reset);

//initial point inputs
const xInitInput = document.getElementById("xInit");
    xInitInput.addEventListener("input", reset);
const yInitInput = document.getElementById("yInit");
    yInitInput.addEventListener("input", reset);
const zInitInput = document.getElementById("zInit");
    zInitInput.addEventListener("input", reset);

//button inputs
const resetButton = document.getElementById("resetButton");
    resetButton.addEventListener("click", reset);
const startButton = document.getElementById("startButton"); 
    startButton.addEventListener("click", startStop);

//parameter inputs
const speedInput = document.getElementById("speed");
const dtInput = document.getElementById("dt");
const tMaxInput = document.getElementById("tMax");

const lineWidthInput = document.getElementById("lineWidth");
const axSwitch = document.getElementById("axSwitch");
const gridSwitch = document.getElementById("gridSwitch");
const red = document.getElementById("red");
const green = document.getElementById("green");
const blue = document.getElementById("blue");

const xOrigin = document.getElementById("xOrigin");
    xOrigin.addEventListener("input", reset);
const yOrigin = document.getElementById("yOrigin");
    yOrigin.addEventListener("input", reset);
const zOrigin = document.getElementById("zOrigin");
    zOrigin.addEventListener("input", reset);

const angleSlider = document.getElementById("angleSlider");
    angleSlider.addEventListener("input", camInput);
const heightSlider = document.getElementById("heightSlider");
    heightSlider.addEventListener("input", camInput);
const autoSwitch = document.getElementById("autoSwitch");


function moveTo(loc) {
    let res = vec3.create();
    vec3.transformMat4(res,loc,camMat);
    context.moveTo(res[0],res[1]);
}
function lineTo(loc) {
    let res = vec3.create();
    vec3.transformMat4(res,loc,camMat);
    context.lineTo(res[0],res[1]);
}
function arc(loc, radius, startAngle, endAngle) {
    let res = vec3.create(loc);
    vec3.transformMat4(res,loc,camMat);
    context.arc(res[0],res[1], radius, startAngle, endAngle);
}
function sin(x) { return Math.sin(x % (2*pi)); }
function cos(x) { return Math.cos(x % (2*pi)); }
function tan(x) { return Math.tan(x % (2*pi)); }
const pi = Math.PI;
const e = Math.E;