const fg = document.getElementById("foreground")
const bg = document.getElementById("background")

const params = {
    "line_thickness": { 
        "value": 1, 
        "ielement": document.getElementById("line_thickness"),
        "delement": document.getElementById("line_thickness_setting"),
        "updatefunction": (self) => {
            self.value = self.ielement.value
            self.delement.innerText = self.value
            updateFG()
            updateBG()
        } },
    "gap_thickness": { 
        "value": 1, 
        "ielement": document.getElementById("gap_thickness"),
        "delement": document.getElementById("gap_thickness_setting"),
        "updatefunction": (self) => {
            self.value = self.ielement.value
            self.delement.innerText = self.value
            updateFG()
            updateBG()
        } 
    },
    "bg_tilt": {
        "value": 5,
        "ielement": document.getElementById("bg_tilt"),
        "delement": document.getElementById("bg_tilt_setting"),
        "updatefunction": (self) => {
            self.value = self.ielement.value
            self.delement.innerText = self.value
            updateBG()
        }
    },
    "slide_duration": {
        "value": 10, 
        "ielement": document.getElementById("slide_duration"),
        "delement": document.getElementById("slide_duration_setting"),
        "updatefunction": (self) => {
            self.value = self.ielement.value
            self.delement.innerText = self.value
        }
    }
}

updateparams("line_thickness")
updateparams("gap_thickness")
updateparams("bg_tilt")
updateparams("slide_duration")

function updateFG() {
    let lt_px = params.line_thickness.ielement.value
    let gt_px = params.gap_thickness.ielement.value
    fg.style.backgroundImage = `repeating-linear-gradient(90deg, transparent, transparent ${gt_px}px, white ${gt_px}px, white ${parseInt(gt_px) + parseInt(lt_px)}px )`
}

function updateBG() {
    let lt_px = params.line_thickness.ielement.value
    let gt_px = params.gap_thickness.ielement.value
    let tilt = params.bg_tilt.ielement.value
    bg.style.backgroundImage = `repeating-linear-gradient(${90-tilt}deg, transparent, transparent ${gt_px}px, white ${gt_px}px, white ${parseInt(gt_px) + parseInt(lt_px)}px )`
}

function updateparams(paramname) {
    let param = params[paramname]
    if (param === undefined) {
        console.log("bruh? " + paramname)
        return
    }
    param.updatefunction(param)
}

let playing = false
let animationTimer = undefined
function playanimation() {
    if (!playing) {
        playing = true
        document.getElementById("playbutton").innerText = "Stop"
        let dur = params.slide_duration.value
        bg.style.animation = `${dur}s 1 linear slide`
        animationTimer = setTimeout(() => {
            playing = false
            bg.style.animation = ``
            document.getElementById("playbutton").removeAttribute("disabled")
            document.getElementById("playbutton").innerText = "Play"
        }, dur*1000)
    } else {
        clearTimeout(animationTimer)
        document.getElementById("playbutton").innerText = "Play"
        playing = false
        bg.style.animation = ``
    }
}

let mousemove = false
function enablemousemove() {
    if (mousemove) {
        mousemove = false
        document.getElementById("playbutton").removeAttribute("disabled")
        bg.style.transform = "translate(-100%, 0)"
    } else {
        document.getElementById("playbutton").setAttribute("disabled", "d")
        mousemove = true
    }
}

document.body.addEventListener("mousemove", (event) => {
    if (mousemove) {
        let x = event.clientX;
        let mappedx = ((x / window.innerWidth)*200) - 100
        bg.style.transform = `translate(${mappedx}%, 0)`
    }
})