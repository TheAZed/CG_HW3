const fshader_src =
    'precision mediump float;\n\
    uniform vec4 u_FragColor;\n\
    void main() {\n\
        gl_FragColor = u_FragColor;\n\
    }';

const vshader_src =
    'attribute vec4 a_Position;\n\
    attribute float a_PointSize;\n\
    uniform vec4 u_Translation;\
    void main() {\n\
      gl_Position = a_Position + u_Translation;\n\
      //gl_PointSize = a_PointSize;\n\
    }';


var gl = null;
var end = 0;

let vertexBuffer;
let vertices;


let drawDelay = 10;
let splinePointArrays;

async function viewString(letters, fontSize, canvasWidth, canvasHeight) {
    end = 0;
    let lastPointX = 1;
    let lastPointY = 0;
    //coefficientX = size / 1000;
    let outArray = [];
    let finalArray = [];
    splinePointArrays = [];
    let offsets = [0];
    let starts = [0];
    //spline calling
    let letterPointCount = 0;
    for (i = 0; i < letters.length; i++) {
        let currentLetter = letters[i];
        let letterWidth = currentLetter.width;
        let letterHeight = currentLetter.height;
        // let differenceX = 0;
        // let differenceY = 0;
        letterPointCount = finalArray.length;
        moveLetter(currentLetter, lastPointX, lastPointY, canvasWidth, canvasHeight, fontSize);
        // if (currentLetter.backwardLink) {
        //     differenceX = lastPointX - currentLetter.backwardLink.x;
        //     differenceY = lastPointY - currentLetter.backwardLink.y;
        // }
        if (currentLetter.splines && currentLetter.splines.length > 0) {
            for (j = 0; j < currentLetter.splines.length; j++) {
                if (currentLetter.splines[j].points && currentLetter.splines[j].points.length > 0) {
                    for (k = 0; k < currentLetter.splines[j].points.length; k++) {
                        let tempArray = [currentLetter.splines[j].points[k].x, currentLetter.splines[j].points[k].y];
                        // console.log(currentLetter.splines[j].points[k].x, currentLetter.splines[j].points[k].y);
                        outArray = outArray.concat(tempArray);
                    }
                }
                let anotherTempArray = [];
                bezier(outArray, 100, anotherTempArray);
                splinePointArrays.push(anotherTempArray);
                // drawWithAnimation(anotherTempArray);
                // await (sleep(drawDelay * 100));
                finalArray = finalArray.concat(anotherTempArray);
                outArray = [];
            }
        }
        if (currentLetter.forwardLink) {
            lastPointX = currentLetter.forwardLink.x;
            lastPointY = currentLetter.forwardLink.y;
        } else {
            if(currentLetter.backwardLink)
                lastPointX = lastPointX - fontSize * (letterWidth - (letterWidth - currentLetter.backwardLink.x * letterWidth) / 2) / canvasWidth;
            else
                lastPointX = lastPointX - fontSize * letterWidth / canvasWidth;
            lastPointY = 0;
        }
        offsets = offsets.concat([(finalArray.length - letterPointCount) * drawDelay]);
        starts = starts.concat([finalArray.length - letterPointCount]);
    }
    // console.log(finalArray);
    console.log(finalArray.length);

    vertices = new Float32Array(finalArray);
    vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
    const a_Position = gl.getAttribLocation(gl.program, 'a_Position');
    if (a_Position < 0) {
        alert("Failed to get a_Position");
        return;
    }
    const a_PointSize = gl.getAttribLocation(gl.program, 'a_PointSize');
    const u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
    const u_Translation = gl.getUniformLocation(gl.program, 'u_Translation');


    gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(a_Position);

    // gl.vertexAttrib1f(a_PointSize, 10);
    gl.uniform4f(u_FragColor, 0, 0, 0, 1);

    gl.uniform4f(u_Translation, 0, 0, 0, 0);


    for(let i = 0; i < finalArray.length / 2  - splinePointArrays.length; i++){
        setTimeout(tick, i * drawDelay);
    }
}

// const vertices = new Float32Array([
function tick() {
//     0, 0.5, -0.5, -0.5, 0.5, -0.5, 0.3, 0.4, 0.1, 0.3, -0.1, 0.4, -0.3, 0.1
    gl.clear(gl.COLOR_BUFFER_BIT);
    end = end + 1;
    let temp = end;
    for(let i = 0; i < splinePointArrays.length; i++){
        if(temp <= 0)
            break;

        if(temp > splinePointArrays[i].length / 2)
            gl.drawArrays(gl.LINE_STRIP, end - temp, splinePointArrays[i].length / 2);
        else
            gl.drawArrays(gl.LINE_STRIP, end - temp, temp);

        temp -= splinePointArrays[i].length / 2;
    }

    // gl.drawArrays(gl.LINE_STRIP, end - 1, 2);
}

async function drawWithAnimation(vertexArray) {
    let index = 0;
    vertices = new Float32Array(vertexArray);
    vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
    const a_Position = gl.getAttribLocation(gl.program, 'a_Position');
    if (a_Position < 0) {
        alert("Failed to get a_Position");
        return;
    }
    const a_PointSize = gl.getAttribLocation(gl.program, 'a_PointSize');
    const u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
    const u_Translation = gl.getUniformLocation(gl.program, 'u_Translation');


    gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(a_Position);

    // gl.vertexAttrib1f(a_PointSize, 10);
    gl.uniform4f(u_FragColor, 1, 1, 1, 1);

    gl.uniform4f(u_Translation, 0, 0, 0, 0);
    for(; index < vertexArray.length / 2 - 1; index++){
        gl.drawArrays(gl.LINE_STRIP, index, 2);
        await sleep(drawDelay);
    }

}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function moveLetter(letter, lastPointX, lastPointY, canvasWidth, canvasHeight, fontSize) {
    let xDiff, yDiff;
    let lastX = canvasWidth * lastPointX, lastY = canvasHeight * lastPointY;
    if (letter.backwardLink) {
        xDiff = lastX - letter.backwardLink.x * fontSize * letter.width;
        yDiff = lastY - letter.backwardLink.y * fontSize * letter.height;
        letter.backwardLink.x = lastPointX;
        letter.backwardLink.y = lastPointY;
    }else {
        xDiff = lastX - (1) * fontSize * letter.width;
        yDiff = 0;
    }
    if (letter.forwardLink) {
        letter.forwardLink.x = (letter.forwardLink.x * fontSize * letter.width + xDiff) / canvasWidth;
        letter.forwardLink.y = (letter.forwardLink.y * fontSize * letter.height + yDiff) / canvasHeight;
    }
    if (letter.splines) {
        for (let i = 0; i < letter.splines.length; i++) {
            let spline = letter.splines[i];
            if (spline.points) {
                for (let j = 0; j < spline.points.length; j++) {
                    let point = spline.points[j];
                    point.x = (point.x * fontSize * letter.width + xDiff) / canvasWidth;
                    point.y = (point.y * fontSize * letter.height + yDiff) / canvasHeight;
                }
            }
        }
    }

}

// ]);
let isEnd = 0;

function setIsEnd() {
    isEnd = 1;
}

function drawOneWordFromOutside(points, offset) {
    // console.log(offset);
    //gl.drawArrays(gl.LINE_STRIP, 0, points.length/2);
    //end = start + 1;
    let i = 1;
    for (; i <= points.length / 2 - 1; i++)
        setTimeout(tick, offset + drawDelay * i);
    setTimeout(setIsEnd, offset + drawDelay * (points.length / 2 - 1) - drawDelay / 2);

}

// function clearBuffer(){
// }

// function drawOneWord(){
// 	gl.drawArrays(gl.LINE_STRIP, 0, vertices.length/2);
// }

function init() {
    const canvas = document.getElementById("webgl");
    gl = getWebGLContext(canvas, true);
    if (!gl) {
        alert("Failed at getWebGLContext");
        return;
    }

    if (!initShaders(gl, vshader_src, fshader_src)) {
        alert("Failed at initShaders");
        return;
    }

    gl.clearColor(0.9, 0.9, 0.9, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);
}


function main() {
    document.getElementById("font-size").value = 1;
    init();
    loadNormalLetter();
}

const files = document.getElementById("font-files").files;

let alphabetIndex = -1;

function loadPossibleBackLetter() {
    if (alphabet[alphabetIndex].backLetterLink) {
        const fr2 = new FileReader();
        fr2.onload = function (ev) {
            alphabet[alphabetIndex].backLetterJSON = ev.target.result;
            loadPossibleMiddleLetter();
        };
        let file = files[getFileIndex(alphabet[alphabetIndex].backLetterLink)];
        fr2.readAsText(file);
    }else
        loadPossibleMiddleLetter();
}

function loadPossibleMiddleLetter() {
    if (alphabet[alphabetIndex].middleLetterLink) {
        const fr3 = new FileReader();
        fr3.onload = function (ev) {
            alphabet[alphabetIndex].middleLetterJSON = ev.target.result;
            loadPossibleFrontLetter();
        };
        let file = files[getFileIndex(alphabet[alphabetIndex].middleLetterLink)];
        fr3.readAsText(file);
    }else
        loadPossibleFrontLetter();
}

function loadPossibleFrontLetter() {
    if (alphabet[alphabetIndex].frontLetterLink) {
        const fr4 = new FileReader();
        fr4.onload = function (ev) {
            alphabet[alphabetIndex].frontLetterJSON = ev.target.result;
            loadNormalLetter();
        };
        let file = files[getFileIndex(alphabet[alphabetIndex].frontLetterLink)];
        fr4.readAsText(file);
    }else
        loadNormalLetter();
}

function loadNormalLetter() {
    alphabetIndex++;
    if(alphabetIndex >= alphabet.length)
        return;
    const fr1 = new FileReader();
    fr1.onload = function (ev) {
        alphabet[alphabetIndex].normalLetterJSON = ev.target.result;
        loadPossibleBackLetter();
    };
    let file = files[getFileIndex(alphabet[alphabetIndex].normalLetterLink)];
    // console.log(file);
    fr1.readAsText(file);
}

function getFileIndex(name) {
    for (let i = 0; i < files.length; i++) {
        if (files[i].name === name) {
            // console.log(files[i] , name, i);
            return i;
        }
    }
    console.log("failed to find: " , name);
    return -1;
}

function findInAlphabet(code) {
    // console.log(alphabet);
    for (let i = 0; i < alphabet.length; i++) {
        if (alphabet[i].code === code)
            return alphabet[i];
    }
    return null;
}

function parseString() {
    let string = document.getElementById("input-str").value;
    let alphabetLetters = [];
    let letters = [];
    for (let i = 0; i < string.length; i++) {
        if (findInAlphabet(string.charCodeAt(i)) === null) {
            // console.log(string.charCodeAt(i) , string.charCodeAt(i) === daal.code);
            alert("Character: " + string.charAt(i) + " is not supported!");
            return;
        }
        alphabetLetters.push(findInAlphabet(string.charCodeAt(i)));
    }//todo make sure it works fine
    // console.log(alphabetLetters);
    for (let i = 0; i < alphabetLetters.length; i++) {
        if (i === 0 || !alphabetLetters[i - 1].forwardLink || !alphabetLetters[i].backwardLink) {
            // console.log("Not backward");
            if (i === alphabetLetters.length - 1 || !alphabetLetters[i + 1].backwardLink || !alphabetLetters[i].forwardLink) {
                // console.log("Not Forward");
                letters.push(JSON.parse(alphabetLetters[i].normalLetterJSON));
            } else {
                letters.push(JSON.parse(alphabetLetters[i].frontLetterJSON));
            }
        } else {
            // console.log("backward");
            if (i === alphabetLetters.length - 1 || !alphabetLetters[i + 1].backwardLink || !alphabetLetters[i].forwardLink) {
                letters.push(JSON.parse(alphabetLetters[i].backLetterJSON));
            } else {
                console.log(alphabetLetters[i].middleLetterJSON);
                letters.push(JSON.parse(alphabetLetters[i].middleLetterJSON));
            }
        }
    }
    // console.log(letters);
    let canvas = document.getElementById("webgl");
    let fontSize = document.getElementById("font-size").value;
    viewString(letters, fontSize, canvas.width, canvas.height);
}


//todo fill the links
const daal = {
    code: 1583,
    backwardLink: true,
    forwardLink: false,
    normalLetterLink: "Daal-Joda.let", //link to isolated form of letter
    normalLetterJSON: "",
    backLetterLink: "Daal-Chasban-Enteha.let",//link to back form of letter
    backLetterJSON: ""
};

const vaav = {
    code: 1608,
    backwardLink: true,
    forwardLink: false,
    normalLetterLink: "Vav-Chasban-Enteha.let",
    normalLetterJSON: "",
    backLetterLink: "Vav-Joda.let",
    backLetterJSON: ""
};

const space = {
    code: 32,
    backwardLink: false,
    forwardLink: false,
    normalLetterLink: "Space.let",
    normalLetterJSON: ""
};

const kaaf = {
    code: 1705,
    backwardLink: true,
    forwardLink: true,
    normalLetterLink: "Kaaf-Joda.let",
    normalLetterJSON: "",
    backLetterLink: "Kaaf-Chasban-Enteha.let",
    backLetterJSON: "",
    middleLetterLink: "Kaaf-Chasban-Vasat.let",//link to middle form of letter
    middleLetterJSON: "",
    frontLetterLink: "Kaaf-Chasban-Aval.let", //link to front form of letter
    frontLetterJSON: ""
};

const laam = {
    code: 1604,
    backwardLink: true,
    forwardLink: true,
    normalLetterLink: "L-Joda.let",
    normalLetterJSON: "",
    backLetterLink: "L-Chasban-Enteha.let",
    backLetterJSON: "",
    middleLetterLink: "L-Chasban-Vasat.let",
    middleLetterJSON: "",
    frontLetterLink: "L-Chasban-Aval.let",
    frontLetterJSON: ""
};

const mim = {
    code: 1605,
    backwardLink: true,
    forwardLink: true,
    normalLetterLink: "mim-Joda.let",
    normalLetterJSON: "",
    backLetterLink: "mim-Chasban-Enteha.let",
    backLetterJSON: "",
    middleLetterLink: "mim-Chasban-Vasat.let",
    middleLetterJSON: "",
    frontLetterLink: "mim-Chasban-Aval.let",
    frontLetterJSON: ""
};

const heh = {
    code: 1607,
    backwardLink: true,
    forwardLink: true,
    normalLetterLink: "H-Joda.let",
    normalLetterJSON: "",
    backLetterLink: "H-Chasban-Enteha.let",
    backLetterJSON: "",
    middleLetterLink: "H-Chasban-Vasat.let",
    middleLetterJSON: "",
    frontLetterLink: "H-Aval.let",
    frontLetterJSON: ""
};

const alphabet = [daal, vaav, space, kaaf, laam, mim, heh];
