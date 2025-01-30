//// @ts-check
const cv = document.getElementById("displaylist")
const ctx = cv.getContext("2d")

cv.width = 500
cv.height = 350

var list
var swaps
var cswap

var listsize = 10
var delay = 500

init(listsize)

function bsort() {
    let rs = Array()
    for (let i = 0; i < listsize-1; i++)
        rs.push([i, i+1])
    return rs
}

function init() {
    swaps = bsort()
    cswap = 0
    list = Array()
    for (let i = 1; i <= listsize; i++)
        list.push(i)
    // shuffle
    /* for (let i = listsize-1; i > 0; i++) {
        let pind = Math.floor(Math.random()*(listsize-i-1))

    } */
    console.log(swaps.length)
    window.requestAnimationFrame(draw)
}

function draw() {
    // perform swap
    let t = list[swaps[cswap][0]]
    list[swaps[cswap][0]] = list[swaps[cswap][1]]
    list[swaps[cswap][1]] = t

    ctx.clearRect(0, 0, cv.width, cv.height)
    // draw updated display
    ctx.fillStyle = "black"
    ctx.fillRect(0,0,cv.width,cv.height)
    let barwidth = cv.width / list.length
    let pixelmp = cv.height / listsize
    ctx.fillStyle = "white"
    ctx.strokeStyle = "black"
    for (let i = 0; i < list.length; i++)
        ctx.rect(barwidth*i, cv.height - (pixelmp*list[i]), barwidth, pixelmp*list[i])
    ctx.fill()
    ctx.stroke()
    // move to next
    cswap += 1
    if (cswap < swaps.length)
        window.setTimeout(draw, delay)
}