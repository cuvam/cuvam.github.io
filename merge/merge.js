let boxes = []
let selectedbox = undefined
let automerging = false
let automergecanaddboxes = false // whether automerge can add a box if it can't find any more merges
let nomergesavailable = true // so the automerge doesn't constantly attempt to merge even if it won't succeed 

const automergedelay = 250 // ms

addbox();addbox();addbox();

/* start automerge automatically */
// document.getElementById("automergeaddboxescb").setAttribute("checked", "")
// toggleautomergeaddboxes()
// toggleautomerging()
/* start automerge automatically */

function addbox(lvl=1) {
    if (boxes.length >= 64) { // cap on # of boxes
        return
    }
    nomergesavailable = false // adding another box could introduce an opportunity to merge

    // Create box
    let newboxdiv = document.createElement("div")
    let newbox = {
        "level": lvl, 
        "element": newboxdiv
    }
    newboxdiv.setAttribute("class", "flexitem new")
    setTimeout(() => { newboxdiv.setAttribute("class", "flexitem") }, automergedelay*0.25)
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
            box.element.setAttribute("class", "flexitem merged")
            box.element.querySelector("p").innerText = box.level
            box.element.style.backgroundColor = `rgb(255, 255, ${(255 - (box.level*10))})`
            boxes.splice(boxes.indexOf(selectedbox), 1)
            let tbr = selectedbox
            setTimeout(() => {
                box.element.setAttribute("class", "flexitem")
            }, automergedelay*0.5)
            tbr.element.remove()
            selectedbox = undefined
        } else {
            console.log("select two different boxes of same level")
            selectedbox.element.setAttribute("class", "flexitem")
            box.element.setAttribute("class", "flexitem")
            selectedbox = undefined
        }
    }
}

function attemptmerge() {
    for (let i = 0; i < boxes.length-1; i++) {
        let tb = boxes[i]
        for (let j = i+1; j < boxes.length; j++) {
            let nb = boxes[j]
            if (tb.level === nb.level) {
                nb.element.setAttribute("class", "flexitem selected")
                tb.element.setAttribute("class", "flexitem selected")
                selectedbox = nb
                mergebox(tb)
                selectedbox = undefined;
                return 
            }
        }        
    }
    if (automergecanaddboxes) {
        addbox()
    } else {
        console.log("no more merges available, check 'auto-add boxes' to allow automerge to add more boxes")
        nomergesavailable = true
    }
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
        document.getElementById("automergeaddboxescontainer").style.display = "none"
        document.getElementById("toggleautomergebtn").innerText = "enable automerge"
    } else {
        automerging = true
        document.getElementById("automergeaddboxescontainer").style.display = "inline"
        document.getElementById("toggleautomergebtn").innerText = "disable automerge"
        automergeloop()
    }
}

function toggleautomergeaddboxes() {
    automergecanaddboxes = document.getElementById("automergeaddboxescb").checked
    nomergesavailable = false
}