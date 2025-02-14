let boxes = []
let selectedbox = undefined

for (let i = 1; i < 5; i++)
    addbox(i)

function addbox(lvl=1) {
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