const canvas = document.getElementById("canvas")
const ctx = canvas.getContext("2d");
const ruleInput = document.getElementById("ruleInput")
const arenaWidthInput = document.getElementById("arenaWidthInput")
const arenaHeightInput = document.getElementById("arenaHeightInput")
const cellSizeInput = document.getElementById("cellSizeInput")
const startStateInput = document.getElementById("startStateInput")
const registerStartStateInput = document.getElementById("registerStartStateInput")

let WIDTH =  arenaWidthInput.value;
let HEIGHT = arenaHeightInput.value;
let cellSize = cellSizeInput.value;

function updateParameters() {
    WIDTH =  arenaWidthInput.value;
    HEIGHT = arenaHeightInput.value;
    cellSize = cellSizeInput.value;
    
    canvas.setAttribute("width", WIDTH*cellSize)
    canvas.setAttribute("height", HEIGHT*cellSize)
    startStateInput.setAttribute("max", WIDTH-1)

    drawEMCA(getEMCA(ruleInput.value))
}

let space = false;
let fill  = true;

let start = Array(WIDTH);
for (let i = 0; i < WIDTH; i++) {
    start[i] = space;
}
start[Math.floor(WIDTH/2)] = fill;

function drawEMCA(rows) {
    ctx.fillStyle = "white"
    ctx.fillRect(0, 0, canvas.offsetWidth, canvas.offsetHeight)
    for (let cy = 0; cy < HEIGHT; cy++) {
        for (let i = 0; i < WIDTH; i++) {
            if (rows[cy][i]) {
                ctx.fillStyle = "black";
            } else {
                ctx.fillStyle = "white";
            }
            ctx.fillRect(i*cellSize, cy*cellSize, cellSize, cellSize);
        }
    }
}

function getEMCA(rule = 30) {
    let rows = Array(HEIGHT)
    let row = Array(WIDTH)
    for (let i = 0; i < WIDTH; i++)  {
        row[i] = start[i];
    }
    rows[0] = start
    for (let cy = 1; cy < HEIGHT; cy++) {
        let nextbits = Array(WIDTH);
        for (let i = 0; i < WIDTH; i++) {
            let r = 0;
            for (let j = -1; j <= 1; j++) {
                if (i+j >= 0 && i+j < WIDTH && row[i+j] == fill) {
                    r += 1 << (1-j);
                }
            }
            nextbits[i] = (rule >> r & 1) ? fill : space;
        }
        for (let i = 0; i < WIDTH; i++) {
            row[i] = nextbits[i];
        }
        rows[cy] = nextbits
    }
    return rows
}

updateParameters()
ruleInput.onchange = updateParameters
arenaWidthInput.onchange = updateParameters
arenaHeightInput.onchange = updateParameters
cellSizeInput.onchange = updateParameters

registerStartStateInput.onclick = function() {
    let ct = startStateInput.value
    ct = Math.max(Math.min(WIDTH-1, ct), 0)
    start[ct] = !start[ct]
    updateParameters()
}