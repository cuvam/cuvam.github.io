const cv = document.getElementById("mazeCanvas");
const ctx = cv.getContext("2d");

// parameters
var mazecols = 10;
var mazerows = 10;
var cellsize = 30; // in pixels

drawmaze()

function drawmaze() {

    
    mazecols = document.getElementById("mazeinputcols").value;
    mazerows = document.getElementById("mazeinputrows").value;
    
    cv.width = mazecols*cellsize;
    cv.height = mazerows*cellsize
    
    // initialize cell array
    let mcells = Array();
    for (let i = 0; i < mazecols; i++) {
        let row = Array();
        for (let j = 0; j < mazerows; j++) {
            row.push({"bottom": true, "right": true, "prev": null, "visited": false});
        }
        mcells.push(row);
    }
    
    // backtracking method
    let start = [0, 0];
    let cur = start;
    let backToStartNoMoreNeighbors = false
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
        
    ctx.lineWidth = 2;
    ctx.beginPath();
    // draw maze walls
    for (let i = 0; i < mazecols; i++) {
        for (let j = 0; j < mazerows; j++) {
            ctx.moveTo((i+1)*cellsize, j*cellsize);
            // bottom wall
            if (mcells[i][j].bottom == true || i == mazecols-1) {
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
        if (i == 0) {
            ctx.lineTo(i*cellsize, j*cellsize);
        } else {
            ctx.moveTo(i*cellsize, j*cellsize);
        }
        if (j == 0) {
            ctx.lineTo((i+1)*cellsize, j*cellsize);
        } else {
            ctx.moveTo((i+1)*cellsize, j*cellsize);
        }
    }
    ctx.stroke();
}

    // center the maze onscreen
    document.getElementById("mazeCanvas").style.position = "relative";
    document.getElementById("mazeCanvas").style.left = "50%";
    document.getElementById("mazeCanvas").style.right = "50%";
    document.getElementById("mazeCanvas").style.transform = "translate(-50%, 0)"

}
