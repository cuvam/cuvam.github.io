const startexpanded = false
const DDitemCSS = document.styleSheets[0].cssRules[0].cssText.slice(10).replace("}", "") // outlandish things happening

let tree = newElem("0")
tree.HTMLelement.style = DDitemCSS
tree.HTMLelement.querySelector("p").addEventListener("click", (e) => toggle(tree))
tree.depth = 1
document.body.appendChild(tree.HTMLelement)


function expand(element) {
    element.expanded = true
    if (element.children.length === 0) {
        let r = Math.ceil(Math.random()*3)
        for (let i = 0; i < r; i++) {
            newChild(element, element.depth)
        }
    }
    element.children.forEach(child => {
        let ce = child.HTMLelement
        ce.setAttribute("style", DDitemCSS + "display: block")
    })
}

function collapse(element) {
    element.expanded = false
    element.children.forEach(child => {
        let ce = child.HTMLelement
        ce.setAttribute("style", "display:none;")
    })
}

function toggle(parent) {
    //console.log(parent)
    if (parent.expanded === true) {
        collapse(parent)
    } else {
        expand(parent)
    }
}

function newChild(parent, name) {
    let c = newElem(name)
    c.depth = parent.depth + 1
    c.HTMLelement.querySelector("p").addEventListener("click", (e) => toggle(c))
    parent.HTMLelement.insertBefore(c.HTMLelement, undefined)
    parent.children.push(c)
    return c
}

function newElem(name) {
    let newDiv = document.createElement("div");
    newDiv.setAttribute("class", "dditem")
    let nametxt = document.createElement("p")
    if (!startexpanded) {
        newDiv.style = "display:none;"
    }
    nametxt.innerText = name
    newDiv.appendChild(nametxt)
    let c = {
        "name": name,
        "children": [],
        "depth": 0,
        "expanded": (startexpanded === true), 
        "HTMLelement": newDiv
    }
    return c;
}