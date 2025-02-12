triehead = { "letter": undefined, "container": document.getElementById("triecontainer"), "word": undefined, "hidden": false }
for (let c = 0; c < 26; c++) {
    triehead[String.fromCharCode(97 + c)] = undefined
}

let words = loadFile("words.txt").split("\n")
words.forEach(element => {
    insertword(triehead, element)
})

function branch(parent, le) {
    if (parent[le] !== undefined) {
        return parent[le]
    } else {
        let nbc = document.createElement("span")
        nbc.setAttribute("class", "trienest")
        let nb = { "letter": le, "container": nbc }
        for (let c = 0; c < 26; c++) {
            nb[String.fromCharCode(97 + c)] = undefined
        }
        parent[le] = nb
        let nbt = document.createElement("p")
        nbt.addEventListener("click", (e) => toggle(nb))
        let text = document.createTextNode(le)
        nbt.appendChild(text)
        nbc.appendChild(nbt)
        let nextchild = undefined
        for (c = le.charCodeAt(0) - 96; c < 26; c++) {
            let tc = parent[String.fromCharCode(97 + c)]
            if (tc !== undefined && c < tc.letter.charCodeAt(0)) {
                nextchild = tc.container
            }
        }
        parent.container.insertBefore(nbc, nextchild) // insertBefore just appends the child if nextchild is undefined
        return nb
    }
}

function addword() {
    let word = document.getElementById("trieinput").value
    insertword(triehead, word)
}

function expand(branch) {
    for (let c = 0; c < 26; c++) {
        let cb = branch[String.fromCharCode(97 + c)]
        if (cb !== undefined) {
            cb.container.setAttribute("style", "display: block")
            expand(cb)
        }
    }
}

function collapse(branch) {
    for (let c = 0; c < 26; c++) {
        let cb = branch[String.fromCharCode(97 + c)]
        if (cb !== undefined) {
            cb.container.setAttribute("style", "display: none")
            collapse(cb)
        }
    }
}

function toggle(parent) {
    if (parent.hidden) {
        parent.hidden = false
        expand(parent)
    } else {
        parent.hidden = true
        collapse(parent)
    }
}

function loadFile(filePath) {
    var result = null;
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.open("GET", filePath, false);
    xmlhttp.send();
    if (xmlhttp.status==200) {
        result = xmlhttp.responseText;
    }
    return result;
}

function insertword(head, word) {
    word.toLowerCase().split(' ').forEach(word => {
        word = word.split('').filter(char => /[a-zA-Z]/.test(char))
        var l = head
        for (let i = 0; i < word.length; i++) {
            l = branch(l, word[i])
        }
        if (l.word === undefined) {
            l.word = word
            let nbw = document.createElement("p")
            nbw.setAttribute("class", "word")
            let text = document.createTextNode(word.join(""))
            nbw.appendChild(text)
            l.container.querySelector("p").appendChild(nbw)
        }
    });
}

function cleartrie() {
    erasechildren(triehead)
    triehead = { "letter": undefined, "container": document.getElementById("triecontainer"), "word": undefined, "hidden": false }
}

function erasechildren(trie) {
    for (let c = 0; c < 26; c++) {
        if (trie[String.fromCharCode(97 + c)] !== undefined) {
            erasechildren(trie[String.fromCharCode(97 + c)])
            trie[String.fromCharCode(97 + c)].container.remove()
        }
    }
}