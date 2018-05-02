let currentWord;
let selectedSplineIndex;
let selectedPointIndex;
let splineList;
let pointList;
let splineNum;
let pointNum;
let splineType; //1 for bezier and 2 for b-spline

function main() {
    splineType = 1;
    splineList = document.getElementById("spline-list");
    pointList = document.getElementById("point-list");
    splineNum = 0;
    pointNum = 0;
}

function createNew() {
    if (splineType === 1)
        currentWord = new Letter(document.getElementById("letter-name").value, "Bezier");
    else
        currentWord = new Letter(document.getElementById("letter-name").value, "B-Spline");
    document.getElementById("save-cancel").removeAttribute("hidden");
    document.getElementById("create-div").removeAttribute("hidden");
    selectedSplineIndex = -1;
    selectedPointIndex = -1;
    reloadSplines();
    // reloadPoints();
}

function loadWord() {
    const input = document.getElementById("edit-letter");
    if (input.files.length !== 0) {
        document.getElementById("save-cancel").removeAttribute("hidden");
        document.getElementById("create-div").removeAttribute("hidden");
        const fr = new FileReader();
        fr.onload = function (ev) {
            currentWord = JSON.parse(ev.target.result);
            if (!currentWord)
                console.log("Not a valid JSON file!");
            console.log(currentWord);
            document.getElementById("letter-name").value = currentWord.name;
            let beType = document.getElementById("bezier-type");
            let bType = document.getElementById("b-spline-type");
            // beType.removeAttribute("checked");
            // bType.removeAttribute("checked");
            if(currentWord.type === "Bezier") {
                beType.checked = true;
                console.log("setting type to bezier");
            }
            else
                bType.checked = true;
            reloadSplines();
            reloadPoints();
        };
        fr.readAsText(input.files[0]);
    }
    // reloadPoints();
}

function saveLetter() {
    const name = document.getElementById("letter-name");
    currentWord.name = name.value;
    if (!name.value) {
        alert("A name is needed for the letter");
        return;
    }
    const pom = document.createElement('a');
    pom.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(JSON.stringify(currentWord)));
    pom.setAttribute('download', name.value + '.let');

    if (document.createEvent) {
        const event = document.createEvent('MouseEvents');
        event.initEvent('click', true, true);
        pom.dispatchEvent(event);
    }
    else {
        pom.click();
    }
}

function changeToBezier() {
    splineType = 1;
    cancelProcess();
}

function changeToB() {
    splineType = 2;
    cancelProcess();
}

function cancelProcess() {
    splineNum = 0;
    pointNum = 0;
    if (splineType === 1)
        currentWord = new Letter("Bezier");
    else
        currentWord = new Letter("B-Spline");
    while (splineList.options.length > 0)
        splineList.remove(0);
    while (pointList.options.length > 0)
        pointList.remove(0);
    document.getElementById("save-cancel").setAttribute("hidden", "hidden");
    document.getElementById("create-div").setAttribute("hidden", "hidden");
    selectedSplineIndex = -1;
    selectedPointIndex = -1;
}

function addSpline() {
    selectedSplineIndex = currentWord.splines.length;
    currentWord.splines[splineList.options.length] = new Spline();
    if (splineType === 1) {
        currentWord.splines[splineList.options.length].points[0] = new Point2D(0, 0);
    }
    splineList.options[splineList.options.length] = new Option("spline no." + splineNum, "spl" + splineNum, false, true);
    splineNum++;
    reloadPoints();
}

function removeSpline() {
    if (splineList.options.length > 0) {
        splineList.remove(selectedSplineIndex);
        currentWord.splines.splice(selectedSplineIndex, 1);
        selectedSplineIndex = 0;
        reloadPoints();
    }
}

function selectSpline() {
    selectedSplineIndex = splineList.selectedIndex;
    reloadPoints();
}

function addPoint() {
    const sp = currentWord.splines[selectedSplineIndex];
    let num = 1;
    if (splineType === 1)
        num = 3;
    for (i = 0; i < num; i++) {
        pointList.options[sp.points.length] = new Option("point no." + pointNum, "pn" + pointNum, false, true);
        sp.points[sp.points.length] = new Point2D(0, 0);
        pointNum++;
    }

}

function removePoint() {
    const sp = currentWord.splines[selectedSplineIndex];
    if (splineType === 1) {
        let index = Math.floor(selectedPointIndex / 3) * 3 + 1;
        sp.points.splice(index, 3);
        for (let i = 0; i < 3; i++)
            pointList.remove(index);
    } else {
        sp.points.splice(selectedPointIndex, 1);
        pointList.remove(selectedPointIndex);
    }

}

function selectPoint() {
    selectedPointIndex = pointList.selectedIndex;
}

function reloadSplines() {
    splineNum = 0;
    while (splineList.options.length > 0)
        splineList.remove(0);
    for (let i = 0; i < currentWord.splines.length; i++) {
        splineList.options[splineList.options.length] = new Option("spline no." + splineNum, "spl" + splineNum, false, true);
        splineNum++;
    }
    selectedSplineIndex = splineNum - 1;
}

function reloadPoints() {
    pointNum = 0;
    while (pointList.options.length > 0)
        pointList.remove(0);
    for (let i = 0; i < currentWord.splines[selectedSplineIndex].points.length; i++) {
        pointList.options[pointList.options.length] = new Option("point no." + pointNum, "pn" + pointNum, false, true);
        pointNum++;
    }
    selectedPointIndex = pointNum - 1;
}

class Letter {
    constructor(name, type) {
        this.name = name;
        this.type = type;
        this.splines = [];
    }
}

class Spline {
    constructor() {
        this.points = [];
    }
}

class Point2D {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}
