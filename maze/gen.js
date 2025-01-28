const cv = document.getElementById("mazeCanvas");
const ctx = cv.getContext("2d");

// parameters
var mazecols = 10;
var mazerows = 10;
var cellsize = 30; // in pixels (not exactly accurate because of line stroke size)
var drawpath = false;

/* Some algo's have a "path" you can easily extract from the finished data structure (RB), 
   some do not (LERW), and would require me to apply a pathfinding algorithm after generation 
   to find a path. I may implement that in the future, but for now, we'll just keep track of
   whether an algo can easily produce a solution path and disable the button as needed */
var candrawpath = true 

var mcells; // cell array

genmaze()

function genmaze() {
    // Generate a new maze based on input parameters using selected algorithm
    mazecols = document.getElementById("mazeinputcols").value
    mazerows = document.getElementById("mazeinputrows").value
    cellsize = document.getElementById("mazeinputcellsize").value; 
    if (document.getElementById("mazeinputalgoRB").checked) {
        candrawpath = true
        genmazeRB()
    } else if (document.getElementById("mazeinputalgoLERW").checked) {
        candrawpath = false
        genmazeLERW()
    } else {
        candrawpath = true
        genmazeRB() // rb as default
    }
    if (candrawpath) {
        document.getElementById("mazeshowpath").removeAttribute("disabled")
    } else {
        document.getElementById("mazeshowpath").disabled = "disabled"
    }
    textoutput()
}

function genmazeRB() {
    // https://en.wikipedia.org/wiki/Maze_generation_algorithm#Randomized_depth-first_search
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

function genmazeLERW() {
    // https://en.wikipedia.org/wiki/Maze_generation_algorithm#Wilson%27s_algorithm
    // reinitialize cell array based on parameters
    mcells = Array();
    for (let i = 0; i < mazecols; i++) {
        let row = Array();
        for (let j = 0; j < mazerows; j++) {
            row.push({"bottom": true, "right": true, "in_maze": false});
        }
        mcells.push(row);
    }

    // pick 1 random cell to start the maze
    mcells[Math.floor(Math.random() * mazecols)][Math.floor(Math.random() * mazerows)].in_maze = true;

    while (true) { // actual condition is below
        /* The algorithm technically doesn't require the starting cell for each random walk to be randomized, 
           so for simplicity we will just iterate over mcells each new walk to find an unincorporated cell
           and only break the main loop if one is not found (meaning all cells have been added to the maze). */
        let pick;
        let UIfound = false
        for (let i = 0; i < mazecols && !UIfound; i++) {
            for (let j = 0; j < mazerows && !UIfound; j++) {
                if (mcells[i][j].in_maze == false) {
                    pick = [i, j]
                    UIfound = true
                }
            }
        }
        if (!UIfound) 
            break; // maze complete

        // begin loop-erased random walk
        let path = Array(pick)
        let connected = false
        while (!connected) {
            // pick a random direction
            let cur = path[path.length-1]
            let ns = Array()
            if (cur[0] < mazecols-1)
                ns.push([cur[0]+1, cur[1]])
            if (cur[0] > 0)
                ns.push([cur[0]-1, cur[1]])
            if (cur[1] < mazerows-1)
                ns.push([cur[0], cur[1]+1])
            if (cur[1] > 0)
                ns.push([cur[0], cur[1]-1])
            let rn = ns[Math.floor(Math.random() * ns.length)] // random neighbor
            let pind = findinpath(path, rn)
            if (pind > -1) {
                //console.log("Loop  detected") // Uncomment to see how inefficient my implementation is (hundreds of loop eliminations before the first random walk completes). I'm leaving it to remind myself to optimize it
                path = path.slice(0, pind+1)
            } else if (mcells[rn[0]][rn[1]].in_maze == true) {
                //console.log("Connected to maze")
                path.push(rn)
                connected = true
            } else {
                path.push(rn)
            }
        }
        //console.log("Completed walk size " + path.length)
        //console.log(path)
        // carve out walls to make path and mark them as incorporated
        for (let i = 0; i < path.length-1; i++) {
            let cur = path[i]
            mcells[cur[0]][cur[1]].in_maze = true
            let next = path[i+1]
            if (next[0] > cur[0]) {
                mcells[cur[0]][cur[1]].bottom = false
            } else if (next[0] < cur[0]) {
                mcells[next[0]][next[1]].bottom = false
            }  else if (next[1] > cur[1]) {
                mcells[cur[0]][cur[1]].right = false
            } else {
                mcells[next[0]][next[1]].right = false
            }
            //console.log(cur, next) tunneling from cur  to next
        }
        
    }

    drawmaze()

}

function findinpath(path, cell) {
    // turns out "Array.includes()" or indexOf or anything similar doesn't actually check if the data are the same
    // i guess each Array(2) counts as an object which is what it instead looks for :\
    for (let i = 0; i < path.length; i++) {
        if (path[i][0] == cell[0] && path[i][1] == cell[1])
            return i
    }
    return -1
}

function drawmaze() {
    // Draw maze as stored in mcells[][]

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
            if ((mcells[i][j].bottom == true || i == mazecols-1) && !(i == mazecols-1 && j == mazerows-1)) {
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

function togglepath() {
    if (drawpath == true) {
        drawpath = false;
        document.getElementById("mazeshowpath").innerText = "Show Path"
    } else {
        drawpath = true;
        document.getElementById("mazeshowpath").innerText = "Hide Path"
    }
    drawmaze()
}

function draw_path() {
    // Draw the path from target to start cell as stored in mcells[][]
    if (candrawpath) {
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
    } else {
        document.getElementById("mazestatspathlength").innerText = "";
    }
}

function textoutput() {
    // Allows the user to copy a string of text that encodes the walls of the maze
    let os = ""
    /* 
        May change this scheme but for now we will simply output the entire mcells array, where each cell
        gets output as a single number 0-3 where:
            0: no bottom wall or right wall
            1: bottom wall, no right wall
            2: right wall, no bottom wall
            3: bottom wall and right wall
    */
    for (let i = 0; i < mazecols; i++) {
        for (let j = 0; j < mazerows; j++) {
            let cell = mcells[i][j]
            let num = 0
            if (cell.right && i < mazecols-1)
                num += 1
            if (cell.bottom && j < mazerows-1)
                num += 2
            os = os + num
        }
        if (i < mazecols-1)
            os = os + '|'
    }
    document.getElementById("mazetextoutput").innerText = os
}