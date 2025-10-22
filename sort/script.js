let canvas = document.getElementById("canvas")
let algorithmSelect = document.getElementById("algorithmSelect")
let playSort = document.getElementById("startSort")
let canvasLabel = document.getElementById("canvasLabel")
let delayInput = document.getElementById("delayInput")
let arraySizeInput = document.getElementById("arraySizeInput")
let canvasWidthInput = document.getElementById("canvasWidthInput")

let ctx = canvas.getContext("2d")
ctx.imageSmoothingEnabled = false

let WIDTH = 1024
let HEIGHT = 500
let isShuffled = false

canvas.width = WIDTH
canvas.height = HEIGHT
canvas.style.width = WIDTH
canvas.style.height = HEIGHT

let arrSize = 64
let arr = Array(arrSize)
for (let i = 0; i < arrSize; i++) {
    arr[i] = i+1
}

let DELAY_MS = 10
let lastSwapTime = 0
let swapCount = 0

function getRenderBatchSize() {
    // For delays >= 10ms, render every swap (most computers can handle this delay fine)
    if (DELAY_MS >= 10) return 1

    // Target ~60 FPS (16.67ms per frame)
    const TARGET_FRAME_TIME = 16.67
    const batchSize = Math.max(1, Math.floor(TARGET_FRAME_TIME / DELAY_MS))

    return Math.min(batchSize, 50)
} 

delayInput.addEventListener("input", function() {
    let value = parseInt(delayInput.value)
    if (value >= 1) {
        DELAY_MS = value
    } else {
        delayInput.value = 1
        DELAY_MS = 1
    }
})

canvasWidthInput.addEventListener("input", function() {
    let value = parseInt(canvasWidthInput.value)
    if (value >= 200 && value <= 2000) {
        WIDTH = value
        canvas.width = WIDTH
        canvas.style.width = WIDTH
        drawArrayBars()
        arraySizeInput.max = WIDTH
        if (arrSize > WIDTH) {
            arraySizeInput.value = WIDTH
            reinitializeArray(WIDTH)
        }
    } else if (value < 200) {
        canvasWidthInput.value = 200
        WIDTH = 200
        canvas.width = WIDTH
        canvas.style.width = WIDTH
        drawArrayBars()
        arraySizeInput.max = WIDTH
        if (arrSize > WIDTH) {
            arraySizeInput.value = WIDTH
            reinitializeArray(WIDTH)
        }
    } else if (value > 2000) {
        canvasWidthInput.value = 2000
        WIDTH = 2000
        canvas.width = WIDTH
        canvas.style.width = WIDTH
        drawArrayBars()
        arraySizeInput.max = WIDTH
        if (arrSize > WIDTH) {
            arraySizeInput.value = WIDTH
            reinitializeArray(WIDTH)
        }
    }
})

function reinitializeArray(newSize) {
    arrSize = newSize
    arr = Array(arrSize)
    for (let i = 0; i < arrSize; i++) {
        arr[i] = i + 1
    }
    isShuffled = false
    drawArrayBars()
}

arraySizeInput.addEventListener("input", function() {
    let value = parseInt(arraySizeInput.value)
    if (value >= 2 && value <= WIDTH) {
        reinitializeArray(value)
    } else if (value < 2) {
        arraySizeInput.value = 2
        reinitializeArray(2)
    } else if (value > WIDTH) {
        arraySizeInput.value = WIDTH
        reinitializeArray(WIDTH)
    }
})

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
}

function drawArrayBars() {
    let barWidth = canvas.offsetWidth/arrSize
    let heightUnit = canvas.offsetHeight/arrSize
    ctx.fillStyle = "white"
    ctx.fillRect(0, 0, canvas.offsetWidth, canvas.offsetHeight)
    ctx.fillStyle = "black"
    for (let i = 0; i < arrSize; i++) {
        let height = heightUnit*arr[i]
        ctx.fillRect(barWidth*i, canvas.offsetHeight-height, barWidth, height)
    }
}

async function swap(idxA, idxB) {
    let t = arr[idxA]
    arr[idxA] = arr[idxB]
    arr[idxB] = t
    swapCount++

    const batchSize = getRenderBatchSize()

    if (batchSize === 1) {
        // Render and delay on every swap
        drawArrayBars()
        await sleep(DELAY_MS)
    } else {
        // Use batch rendering for very fast delays
        if (swapCount === 1) {
            lastSwapTime = performance.now()
            drawArrayBars()
            return
        }

        if (swapCount % batchSize === 0) {
            drawArrayBars()

            let expectedTime = swapCount * DELAY_MS
            let actualTime = performance.now() - lastSwapTime

            if (actualTime < expectedTime) {
                await sleep(expectedTime - actualTime)
            }
        }
    }
}

async function shuffleArray() {
    canvasLabel.style.visibility = "visible"
    swapCount = 0
    for (let i = arrSize-1; i > 0; i--) {
        let ch = Math.floor(Math.random()*i)
        await swap(i, ch)
    }
    canvasLabel.style.visibility = "hidden"
    isShuffled = true
}

async function bubbleSort() {
    for (let i = 0; i < arrSize - 1; i++) {
        for (let j = 0; j < arrSize - i - 1; j++) {
            if (arr[j] > arr[j + 1]) {
                await swap(j, j + 1)
            }
        }
    }
    drawArrayBars()
}

async function insertionSort() {
    for (let i = 1; i < arrSize; i++) {
        let j = i
        while (j > 0 && arr[j-1] > arr[j]) {
            await swap(j-1, j)
            j--
        }
    }
    drawArrayBars()
}

async function quickSort(left = 0, right = arrSize - 1, isTopLevel = true) {
    if (left >= right) return

    let pivot = arr[right]
    let i = left - 1

    for (let j = left; j < right; j++) {
        if (arr[j] < pivot) {
            i++
            if (i !== j) {
                await swap(i, j)
            }
        }
    }

    await swap(i + 1, right)
    let pivotIndex = i + 1

    await quickSort(left, pivotIndex - 1, false)
    await quickSort(pivotIndex + 1, right, false)

    if (isTopLevel) drawArrayBars()
}

async function mergeSort(left = 0, right = arrSize - 1, isTopLevel = true) {
    if (left >= right) return

    let mid = Math.floor((left + right) / 2)

    await mergeSort(left, mid, false)
    await mergeSort(mid + 1, right, false)

    await merge(left, mid, right)

    if (isTopLevel) drawArrayBars()
}

async function merge(left, mid, right) {
    let temp = []
    for (let i = left; i <= right; i++) {
        temp.push(arr[i])
    }

    let i = 0
    let j = mid - left + 1
    let k = left

    while (i <= mid - left && j <= right - left) {
        if (temp[i] <= temp[j]) {
            if (arr[k] !== temp[i]) {
                for (let pos = k; pos <= right; pos++) {
                    if (arr[pos] === temp[i]) {
                        await swap(k, pos)
                        break
                    }
                }
            }
            i++
        } else {
            if (arr[k] !== temp[j]) {
                for (let pos = k; pos <= right; pos++) {
                    if (arr[pos] === temp[j]) {
                        await swap(k, pos)
                        break
                    }
                }
            }
            j++
        }
        k++
    }

    while (i <= mid - left) {
        if (arr[k] !== temp[i]) {
            for (let pos = k; pos <= right; pos++) {
                if (arr[pos] === temp[i]) {
                    await swap(k, pos)
                    break
                }
            }
        }
        i++
        k++
    }

    while (j <= right - left) {
        if (arr[k] !== temp[j]) {
            for (let pos = k; pos <= right; pos++) {
                if (arr[pos] === temp[j]) {
                    await swap(k, pos)
                    break
                }
            }
        }
        j++
        k++
    }
}

async function heapSort() {
    for (let i = Math.floor(arrSize / 2) - 1; i >= 0; i--) {
        await sift_down(arrSize, i)
    }

    for (let i = arrSize - 1; i > 0; i--) {
        await swap(0, i)
        await sift_down(i, 0)
    }
    drawArrayBars()
}

async function sift_down(n, i) {
    while (true) {
        let largest = i
        let left = 2 * i + 1
        let right = 2 * i + 2

        if (left < n && arr[left] > arr[largest]) {
            largest = left
        }

        if (right < n && arr[right] > arr[largest]) {
            largest = right
        }

        if (largest === i) {
            break
        }

        await swap(i, largest)
        i = largest
    }
}

const algorithms = new Map()
algorithms.set("bubble_sort", bubbleSort)
algorithms.set("insertion_sort", insertionSort)
algorithms.set("quick_sort", quickSort)
algorithms.set("merge_sort", mergeSort)
algorithms.set("heap_sort", heapSort)

async function shufflethensort() {
    playSort.disabled = true
    delayInput.disabled = true
    arraySizeInput.disabled = true
    canvasWidthInput.disabled = true
    if (!isShuffled) {
        await shuffleArray()
    }
    swapCount = 0
    let chosen = algorithmSelect.value
    let chosenFunc = algorithms.get(chosen)
    if (chosenFunc) {
        await chosenFunc()
        isShuffled = false
    } else {
        console.error(`Did not recognize algorithm ${chosen}`)
    }
    playSort.disabled = false
    delayInput.disabled = false
    arraySizeInput.disabled = false
    canvasWidthInput.disabled = false
}

playSort.addEventListener("click", function() {
    shufflethensort()
})

async function initial() {
    playSort.disabled = true
    await shuffleArray()
    playSort.disabled = false
}

initial()