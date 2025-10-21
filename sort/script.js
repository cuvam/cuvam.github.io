let canvas = document.getElementById("canvas")
let algorithmSelect = document.getElementById("algorithmSelect")
let playSort = document.getElementById("startSort")
let canvasLabel = document.getElementById("canvasLabel")
let delayInput = document.getElementById("delayInput")
let arraySizeInput = document.getElementById("arraySizeInput")

let ctx = canvas.getContext("2d")
ctx.imageSmoothingEnabled = false

let WIDTH = 64*10
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

let DELAY_MS = 50

delayInput.addEventListener("input", function() {
    let value = parseInt(delayInput.value)
    if (value >= 1) {
        DELAY_MS = value
    } else {
        delayInput.value = 1
        DELAY_MS = 1
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
    if (value >= 2 && value <= 500) {
        reinitializeArray(value)
    } else if (value < 2) {
        arraySizeInput.value = 2
        reinitializeArray(2)
    } else if (value > 500) {
        arraySizeInput.value = 500
        reinitializeArray(500)
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
    drawArrayBars()
    await sleep(DELAY_MS)
}

async function shuffleArray() {
    canvasLabel.style.visibility = "visible"
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
}

async function insertionSort() {
    for (let i = 1; i < arrSize; i++) {
        let j = i
        while (j > 0 && arr[j-1] > arr[j]) {
            await swap(j-1, j)
            j--
        }
    }
}

async function quickSort(left = 0, right = arrSize - 1) {
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

    await quickSort(left, pivotIndex - 1)
    await quickSort(pivotIndex + 1, right)
}

async function mergeSort(left = 0, right = arrSize - 1) {
    if (left >= right) return

    let mid = Math.floor((left + right) / 2)

    // Sort left and right halves
    await mergeSort(left, mid)
    await mergeSort(mid + 1, right)

    // Merge the sorted halves
    await merge(left, mid, right)
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
    if (!isShuffled) {
        await shuffleArray()
    }
    let chosen = algorithmSelect.value
    let chosenFunc = algorithms.get(chosen)
    if (chosenFunc) {
        await chosenFunc()
        isShuffled = false
    } else {
        console.error(`Did not recognize algorithm ${chosen}`)
    }
    playSort.disabled = false
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