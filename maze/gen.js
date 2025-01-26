const cv = document.getElementById("mazeCanvas");
const ctx = cv.getContext("2d");

// parameters
var mazecols = 10;
var mazerows = 10;
var cellsize = 30; // in pixels
var drawpath = false;
var paramsupdated = false;

var mcells; // cell array

genmaze()

// Generate a new maze based on input parameters 
function genmaze() {
    mazecols = Math.max(2, document.getElementById("mazeinputcols").value);
    mazerows = Math.max(2, document.getElementById("mazeinputrows").value);
    // reinitialize cell array based on parameters
    mcells = Array();
    for (let i = 0; i < mazecols; i++) {
        let row = Array();
        for (let j = 0; j < mazerows; j++) {
            row.push({"bottom": true, "right": true, "prev": null, "visited": false});
        }
        mcells.push(row);
    }
    // "recursive" backtracking method
    // pathing/state info is stored in the cells array itself so recursion isnt needed
    let start = [0, 0];
    let cur = start;
    let backToStartNoMoreNeighbors = false // prevents below loop exiting if it backtracks all the way to start, but still has a neighbor it can tunnel to from there
    do {
        mcells[cur[0]][cur[1]].visited = true
        let ns = Array() // unvisited neighbors
        if (cur[0] > 0 && mcells[cur[0]-1][cur[1]].visited == false)
            ns.push([cur[0]-1, cur[1]])
        
        if (cur[0] < mazecols-1 && mcells[cur[0]+1][cur[1]].visited == false) 
            ns.push([cur[0]+1, cur[1]])
        
        if (cur[1] > 0 && mcells[cur[0]][cur[1]-1].visited == false) 
            ns.push([cur[0], cur[1]-1])
        
        if (cur[1] < mazerows-1 && mcells[cur[0]][cur[1]+1].visited == false) 
            ns.push([cur[0], cur[1]+1])
        
        if (ns.length == 0) {
            // dead end, go back to previous
            cur = mcells[cur[0]][cur[1]].prev
            if (cur[0] == start[0] && cur[1] == start[1]) {
                backToStartNoMoreNeighbors = true;
            }
            //console.log("backtracking to " + cur)
        } else {
            // pick random neighbor to tunnel to
            let pick = ns[Math.floor(Math.random() * ns.length)]
            if (pick[0] > cur[0]) {
                mcells[cur[0]][cur[1]].bottom = false
            } else if (pick[0] < cur[0]) {
                mcells[pick[0]][pick[1]].bottom = false
            }  else if (pick[1] > cur[1]) {
                mcells[cur[0]][cur[1]].right = false
            } else {
                mcells[pick[0]][pick[1]].right = false
            } 
            mcells[pick[0]][pick[1]].prev = cur
            cur = pick
            //console.log("tunneling to " + pick)
        }
    } while (!(cur[0] == start[0] && cur[1] == start[1]) && !backToStartNoMoreNeighbors)

    drawmaze()
}

// Draw maze as stored in mcells[][]
function drawmaze() {

    drawpath = document.getElementById("mazeshowpath").checked;
    cv.width = mazecols*cellsize + 10
    cv.height = mazerows*cellsize + 10
        
    // white background
    ctx.rect(0,0,cv.width,cv.height)
    ctx.fillStyle = "white"
    ctx.fill()

    // maze walls
    ctx.lineWidth = 2;
    ctx.lineCap = "square";
    ctx.strokeStyle = "black"
    ctx.translate(5, 5);
    ctx.beginPath();
    for (let i = 0; i < mazecols; i++) {
        for (let j = 0; j < mazerows; j++) {
            ctx.moveTo((i+1)*cellsize, j*cellsize);
            // bottom wall
            if ((mcells[i][j].bottom == true || i == mazecols-1)) {
                if (i == mazecols-1 && j == mazerows-1) {
                    ctx.moveTo((i+1)*cellsize, (j+1)*cellsize); // i can't wrap my head around the logic right now to get the openings so ill just leave this here. forgive me
                }
                ctx.lineTo((i+1)*cellsize, (j+1)*cellsize);
            } else {
                ctx.moveTo((i+1)*cellsize, (j+1)*cellsize);
            }
            // right wall
            if (mcells[i][j].right == true || j == mazerows-1) {
                ctx.lineTo(i*cellsize, (j+1)*cellsize);
            } else {
                ctx.moveTo(i*cellsize, (j+1)*cellsize);
            }
            // border walls
            if (i == 0 && j > 0) {
                ctx.lineTo(i*cellsize,  j*cellsize);
            } else {
                ctx.moveTo(i*cellsize, j*cellsize);
            }
            if (j == 0) {
                ctx.lineTo((i+1)*cellsize, j*cellsize);
            } else {
                ctx.moveTo((i+1)*cellsize, j*cellsize);
            }
        }
    }
    
    ctx.stroke();
    
    draw_path()
    
}

// Draw the path from target to start cell as stored in mcells[][]
function draw_path() {
    // assuming the target is always the bottom right corner for now
    let c = [mazecols-1, mazerows-1];
    let plen = 0;
    if (drawpath) {
        ctx.beginPath()
        ctx.moveTo(cv.width, c[1]*cellsize + (cellsize/2))
        ctx.lineTo((c[0]*cellsize) + (cellsize/2), c[1]*cellsize + (cellsize/2))
    }
    do {
        plen++;
        c = mcells[c[0]][c[1]].prev
        if (drawpath) {
            ctx.lineTo((c[0]*cellsize) + (cellsize/2), c[1]*cellsize + (cellsize/2))
        }
    } while (!(c[0] == 0 && c[1] == 0))
    if (drawpath) {
        ctx.lineTo(0, c[1]*cellsize + (cellsize/2))
        ctx.strokeStyle = "red"
        ctx.stroke()
    }
    
    document.getElementById("mazestatspathlength").innerText = "Path length: " + plen;
}