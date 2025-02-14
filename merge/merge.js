let boxes = []
let selectedbox = undefined
let midmerge = false
let automerging = false
let nomergesavailable = true // so the automerge doesn't constantly attempt to merge even if it won't succeed 

const automergedelay = 500 // ms

for (let i = 1; i < 5; i++) {
    for (let j = 0; j < 3; j++) {
        addbox(i)
    }
}

function addbox(lvl=1) {
    if (boxes.length >= 32) { // cap on # of boxes
        return
    }
    nomergesavailable = false // adding another box could introduce an opportunity to merge

    // Create box
    let newboxdiv = document.createElement("div")
    let newbox = {
        "level": lvl, 
        "element": newboxdiv
    }
    newboxdiv.setAttribute("class", "flexitem")
    newboxdiv.style.backgroundColor = `rgb(255, 255, ${(255 - ((newbox.level-1)*10))})`
    newboxdiv.addEventListener("click", (e) => mergebox(newbox))
    boxes.push(newbox)
    
    // Add text
    let nbtext = document.createTextNode(`${newbox.level}`)
    let nbpelem = document.createElement("p")
    nbpelem.appendChild(nbtext)
    newboxdiv.appendChild(nbpelem)
    
    // Put box in main flexbox container
    let container = document.getElementsByClassName("flexcontainer")[0]
    container.appendChild(newboxdiv)
}

function mergebox(box) {
    if (selectedbox === undefined) {
        selectedbox = box
        box.element.setAttribute("class", "flexitem selected")
    } else {
        if (selectedbox.level === box.level && selectedbox != box) {
            box.level += 1
            box.element.querySelector("p").innerText = box.level
            box.element.style.backgroundColor = `rgb(255, 255, ${(255 - (box.level*10))})`
            boxes.splice(boxes.indexOf(selectedbox), 1)
            selectedbox.element.remove()
            selectedbox = undefined
        } else {
            console.log("select two different boxes of same level")
            selectedbox.element.setAttribute("class", "flexitem")
            box.element.setAttribute("class", "flexitem")
            selectedbox = undefined
        }
    }
}

function sortboxes() {

}

function attemptmerge() {
    if (midmerge) {
        //console.log("WAIT bruh!!")
        return 
    }
    midmerge = true
    for (let i = 0; i < boxes.length-2; i++) {
        let tb = boxes[i]
        for (let j = i+1; j < boxes.length-1; j++) {
            let nb = boxes[j]
            if (tb.level === nb.level) {
                tb.element.setAttribute("class", "flexitem selected")
                nb.element.setAttribute("class", "flexitem selected")
                selectedbox = tb
                setTimeout(() => {
                    mergebox(nb)
                    nb.element.setAttribute("class", "flexitem")
                    midmerge = false
                }, automergedelay)
                return 
            }
        }        
    }
    console.log("no more merges available")
    nomergesavailable = true
    midmerge = false
    return 
}

function automergeloop() {
    if (automerging) {
        if (!nomergesavailable) {
            attemptmerge()
        }
        setTimeout(automergeloop, automergedelay)
    }
}

function toggleautomerging() {
    if (automerging) {
        automerging = false
        document.getElementById("attemptmergebtn").disabled = false
        document.getElementById("toggleautomergebtn").innerText = "enable automerge"
    } else {
        automerging = true
        document.getElementById("attemptmergebtn").disabled = true
        document.getElementById("toggleautomergebtn").innerText = "disable automerge"
        automergeloop()
    }
}