/** @format */

const cv = document.querySelector("canvas");
const ctx = cv.getContext("2d");

var gridsquaresize = 30;
var gridwidth = 31;
var gridheight = 21;

cv.width = gridwidth * gridsquaresize;
cv.height = gridheight * gridsquaresize;

let target = [gridheight - 1, gridwidth - 1];
var spath = Array();
var pathexists = true;

var grid = Array();
for (let y = 0; y < gridheight; y++) {
    let row = Array();
    for (let x = 0; x < gridwidth; x++) {
        row.push((x != 5 || y == 5) && (y != 9 || x == 15)); // true= cell is traversable
    }
    grid.push(row);
}

draw();

function path() {
    // flood fill / BFS
    // can be called separate from draw() to see if current grid configuration has a solution path (spath.length > 0)
    let visited = new Map();
    let fringe = Array({ x: 0, y: 0, dist: 0, prev: undefined });
    let found = false;
    let last;
    while (fringe.length > 0) {
        fringe.sort((a, b) => b.dist - a.dist); // honestly not horrible performance from this, ~28k total comparisons at most for 20x30 grid
        let top;
        do {
            top = fringe.pop();
        } while (fringe.length > 0 && visited[[top.y, top.x]] == true);
        if (top.y == target[0] && top.x == target[1]) {
            found = true;
            last = top;
            break;
        }
        visited[[top.y, top.x]] = true;
        if (top.x > 0 && visited[[top.y, top.x - 1]] != true && grid[top.y][top.x - 1] == true)
            fringe.push({
                x: top.x - 1,
                y: top.y,
                dist: top.dist + 1,
                prev: top,
            });
        if (top.x < gridwidth - 1 && visited[[top.y, top.x + 1]] != true && grid[top.y][top.x + 1] == true)
            fringe.push({
                x: top.x + 1,
                y: top.y,
                dist: top.dist + 1,
                prev: top,
            });
        if (top.y > 0 && visited[[top.y - 1, top.x]] != true && grid[top.y - 1][top.x] == true)
            fringe.push({
                x: top.x,
                y: top.y - 1,
                dist: top.dist + 1,
                prev: top,
            });
        if (top.y < gridheight - 1 && visited[[top.y + 1, top.x]] != true && grid[top.y + 1][top.x] == true)
            fringe.push({
                x: top.x,
                y: top.y + 1,
                dist: top.dist + 1,
                prev: top,
            });
    }
    if (found) {
        pathexists = true;
        spath = Array();
        do {
            spath.push(last);
            last = last.prev;
        } while (!(last.x == 0 && last.y == 0));
    } else {
        spath = Array();
        pathexists = false;
    }
}

function draw() {
    path();
    if (pathexists == true) {
        ctx.fillStyle = "white";
    } else {
        ctx.fillStyle = "#FFCCCC";
    }
    ctx.fillRect(0, 0, cv.width, cv.height);
    ctx.fillStyle = "black";
    for (let y = 0; y < gridheight; y++) {
        for (let x = 0; x < gridwidth; x++) {
            if (grid[y][x] == false) {
                ctx.fillRect(x * gridsquaresize, y * gridsquaresize, gridsquaresize, gridsquaresize);
            }
        }
    }
    ctx.fillStyle = "yellow";
    ctx.fillRect(target[1] * gridsquaresize, target[0] * gridsquaresize, gridsquaresize, gridsquaresize);
    ctx.fillStyle = "green";
    ctx.fillRect(0, 0, gridsquaresize, gridsquaresize);
    if (spath.length > 0) {
        ctx.strokeStyle = "red";
        ctx.lineWidth = 2;
        let start = spath[spath.length - 1];
        let hgss = gridsquaresize * 0.5;
        ctx.moveTo(start.x * gridsquaresize + hgss, start.y * gridsquaresize + hgss);
        ctx.beginPath();
        for (let i = 0; i < spath.length; i++) {
            ctx.lineTo(spath[i].x * gridsquaresize + hgss, spath[i].y * gridsquaresize + hgss);
        }
        ctx.lineTo(hgss, hgss);
        ctx.stroke();
    }
    if (spath.length > 0) {
        document.getElementById("pathlengthlabel").innerText = "Length: " + spath.length;
    } else {
        document.getElementById("pathlengthlabel").innerText = "Path obstructed";
    }
}

function cleargrid() {
    for (let y = 0; y < gridheight; y++) {
        for (let x = 0; x < gridwidth; x++) {
            grid[y][x] = true;
        }
    }
    draw();
}

function randomsquare() {
    let maxattempts = 150;
    let attempts = 0;
    for (let n = 0; n < 5 && attempts < maxattempts; n++) {
        let x, y;
        do {
            y = Math.floor(Math.random() * gridheight);
            x = Math.floor(Math.random() * gridwidth);
            attempts += 1;                  // keep randomly picking a square in the grid while:
        } while (attempts < maxattempts && (    // we haven't reached attempt limit, AND
            grid[y][x] === false ||                 // random pick is already a wall (non-traversable),
            (x === target[1] && y === target[0]) || // the target square,
            (x === 0 && y === 0)                    // or the starting square
        ));
        if (attempts < maxattempts) {
            grid[y][x] = false;
            path();
            if (spath.length === 0) {
                grid[y][x] = true; // don't block this square if it would make grid have no solution path
                n--; // also don't count this pick as part of the amount we want
            }
        }
    }
    if (attempts === maxattempts) {
        console.log("Max attempt limit " + maxattempts + " reached for randomsquare()");
    }
    draw();
}

function drawsquare(canvas, event) {
    let rect = canvas.getBoundingClientRect();
    let x = Math.floor((event.clientX - rect.left) / gridsquaresize);
    let y = Math.floor((event.clientY - rect.top) / gridsquaresize);
    if (!(x === target[1] && y === target[0]) && !(x === 0 && y === 0)) {
        grid[y][x] = !grid[y][x];
    }
    draw();
}

cv.addEventListener("mousedown", function (e) {
    drawsquare(cv, e);
});
