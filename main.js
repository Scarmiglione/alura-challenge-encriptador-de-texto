const selectElement = selector => {
    const element = document.querySelector(selector)
    if(element) return element;
    throw new Error(`Something went wrong, ${selector}`);
};

const selectElements = selector => {
    const elements = document.querySelectorAll(selector)
    if(elements) return elements;
    throw new Error(`Something went wrong, ${selector}`);
};

const inactive = selectElement("#inactive");
const active = selectElement("#active");
const notice = selectElement("#notice p");
const inputArea = selectElement("#textInput");
const outputArea = selectElement("#textOutput");
const copy = selectElement("#copy");

const dict = [["e", "enter"], ["i", "imes"], ["a", "ai"], ["o", "ober"], ["u", "ufat"]]

let invalidState = false;

function validation(str) {
    const text = str.match(/[^\s]*/g).filter(x => x != "");
    if(str === "" || (text.length == 0)) { setDefault(); invalidState = false; return false; }
    const invalid = str.match(/[^a-z|\s]*/g).filter(x => x != "");
    if(invalid.length == 0) return true;
    inactive.classList.remove("hidden"); active.classList.add("hidden");
    inputArea.classList.add("invalid"); notice.classList.add("invalid");
    invalidState = true;
    return false;
}

function revalidation() {
    setDefault(valid=false);
    if(!invalidState) return;
    const input = inputArea.value;
    if(!validation(input)) return;
    invalidState = false;
    inputArea.classList.remove("invalid"); notice.classList.remove("invalid");
    setTimeout(() => {
        notice.classList.remove("valid");
    }, 2000);
    notice.classList.add("valid");
}

function formatText() {
    if(!invalidState) return;
    const input = inputArea.value;
    let output = input.normalize("NFD").toLowerCase();
    const offenders = output.match(/[^a-z|\s]*/g).filter(x => x != "");
    for(let i in offenders) {
        output = output.replace(offenders[i], "");
    }
    inputArea.value = output;
    revalidation();
}

const setDefault = (valid=true) => {
    inactive.classList.remove("hidden");
    active.classList.add("hidden");
    if(valid) {
        inputArea.classList.remove("invalid");
        notice.classList.remove("invalid");
    }
}

function encrypt() {
    const input = inputArea.value;
    if(!validation(input)) return;
    inactive.classList.add("hidden"); 
    active.classList.remove("hidden");
    let output = input;
    for(let i in dict) {
        output = output.replaceAll(dict[i][0], dict[i][1]);
    }
    outputArea.innerHTML = output;
}

function decrypt() {
    const input = inputArea.value;
    if(!validation(input)) return;
    inactive.classList.add("hidden"); 
    active.classList.remove("hidden");
    let output = input;
    for(let i in dict) {
        output = output.replaceAll(dict[i][1], dict[i][0]);
    }
    outputArea.innerHTML = output;
}

function swapText() {
    if(active.classList.contains("hidden")) return;
    const input = inputArea.value;
    const output = outputArea.value;
    inputArea.value = output;
    outputArea.innerHTML = input;
}

function handleCopy() {
    navigator.permissions.query({name: "clipboard-write"}).then((result) => {
        if (result.state === "granted" || result.state === "prompt") {
            copyToClipboard();
        }
    });
}

function copyToClipboard() {
    const text = outputArea.innerHTML;
    navigator.clipboard.writeText(text).then(() => {
        copy.innerHTML = "¡Copiado!";
        setTimeout(() => {
            copy.innerHTML = "Copiar";
        }, 1000);
    }, (err) => (fallbackCopy(text)));
}

const fallbackCopy = (text) => {
    const element = document.createElement("textarea");
    element.value = text;
    document.body.appendChild(element)
    element.select();
    document.execCommand("copy");
    document.body.removeChild(element);
}
