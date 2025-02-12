triehead = { "letter": undefined, "container": document.getElementById("triecontainer"), "word": undefined }
for (let c = 0; c < 24; c++) {
    triehead[String.fromCharCode(97 + c)] = undefined
}

const defaultwords = ["arcade", "arch", "architect", "architectural", "architecture", "archive", "archived", "archives", "arctic", "are", "area", "areas", "arena", "argentina", "argue", "argued", "argument", "arguments", "arise", "arising", "arizona", "arkansas", "arlington", "arm", "armed"]
defaultwords.forEach(element => {
    insertword(triehead, element)
});

function branch(parent, le) {
    if (parent[le] !== undefined) {
        return parent[le]
    } else {
        let nbc = document.createElement("div")
        let nb = { "letter": le, "container": nbc }
        for (let c = 0; c < 24; c++) {
            nb[String.fromCharCode(97 + c)] = undefined
        }
        parent[le] = nb
        let nbt = document.createElement("p")
        let text = document.createTextNode(le)
        nbt.appendChild(text)
        nbc.appendChild(nbt)
        for (let c = 0; c < 24; c++) {
            nb[String.fromCharCode(97 + c)] = undefined
        }
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

function insertword(head, word) {
    word = word.toLowerCase().split('').filter(char => /[a-zA-Z]/.test(char))
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
        l.container.appendChild(nbw)
    }
}

function addword() {
    let word = document.getElementById("trieinput").value
    insertword(triehead, word)
}