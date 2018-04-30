
var currentWord;
var selectedSplineIndex;
var selectedPointIndex;
var splineList;
var pointList;

function main() {
    splineList = document.getElementById("spline-list");
    pointList = document.getElementById("point-list");
}

function createNew() {
    currentWord = [];
    document.getElementById("save-cancel").removeAttribute("hidden");
    document.getElementById("create-div").removeAttribute("hidden");
    selectedSplineIndex = -1;
    selectedPointIndex = -1;
}

function loadWord() {
    var input = document.getElementById("edit-letter");
    if(input.files.length !== 0){
        var fr = new FileReader();
        fr.onload = function (ev) {
            currentWord = JSON.parse(ev.target.result);
            if(!currentWord)
                console.log("Not a valid JSON file!");
        };
        fr.readAsText(input.files[0]);
    }
}

function saveLetter() {
    var name = document.getElementById("letter-name");
    if(!name.value){
        alert("A name is needed for the letter");
        return;
    }
    var pom = document.createElement('a');
    pom.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(JSON.stringify(currentWord)));
    pom.setAttribute('download', name.value);

    if (document.createEvent) {
        var event = document.createEvent('MouseEvents');
        event.initEvent('click', true, true);
        pom.dispatchEvent(event);
    }
    else {
        pom.click();
    }
}

function cancelProcess() {
    currentWord = [];
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
    selectedSplineIndex = currentWord.length;
    currentWord[splineList.options.length] = [];
    splineList.options[splineList.options.length] = new Option("spline no." + selectedSplineIndex, "spl"+selectedSplineIndex, false, true);
}

function removeSpline() {
    if(splineList.options.length > 0) {
        splineList.remove(selectedSplineIndex);
        currentWord.splice(selectedSplineIndex, selectedSplineIndex + 1);
    }
}

function selectSpline() {
    selectedSplineIndex = splineList.selectedIndex;
}

function addPoint() {

}

function removePoint() {

}

function selectPoint() {

}

class Point2D{
    constructor(x, y){
        this.x = x;
        this.y = y;
    };

}