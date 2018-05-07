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
var startPoint = 0;
var ends = [3, 5, 7];


const drawDelay = 2;

function viewString(letters, fontSize, canvasWidth, canvasHeight) {
    init();
    let lastPointX = 1;
    let lastPointY = 0;
    //coefficientX = size / 1000;
    let offset = 0;
    let outArray = [];
    let offsets = [];
    let starts = [0];
    ends = [];
    for (i = 0; i < letters.length; i++) {
        //spline calling
        let currentLetter = letters[i];
        let letterWidth = currentLetter.width;
        let letterHeight = currentLetter.height;
        let differenceX = 0;
        let differenceY = 0;
        scaleLetter(currentLetter, fontSize * letterWidth / canvasWidth, fontSize * letterHeight / canvasHeight);
        if (currentLetter.backwardLink) {
            differenceX = lastPointX - currentLetter.backwardLink.x;
            differenceY = lastPointY - currentLetter.backwardLink.y;
        }
        if (currentLetter.splines && currentLetter.splines.length > 0) {
            for (j = 0; j < currentLetter.splines.length; j++) {
                if (currentLetter.splines[j].points && currentLetter.splines[j].points.length > 0) {
                    for (k = 0; k < currentLetter.splines[j].points.length; k++) {
                        tempArray = [currentLetter.splines[j].points[k].x + differenceX, currentLetter.splines[j].points[k].y + differenceY];
                        outArray = outArray.concat(tempArray);
                    }
                }
            }
        }
        if (currentLetter.forwardLink) {
            lastPointX = currentLetter.forwardLink.x + differenceX;
            lastPointY = currentLetter.forwardLink.y + differenceY;
        } else {
            lastPointX = lastPointX - fontSize * letterWidth / canvasWidth;
            lastPointY = 0;
        }
        offsets = offsets.concat([outArray.length * drawDelay]);
        starts = starts.concat([outArray.length]);
        ends = ends.concat([outArray.length])
    }
    console.log(outArray);

    let vertices = new Float32Array(outArray);
    const vertexBuffer = gl.createBuffer();
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

    gl.clearColor(0.1, 0.1, 0.1, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);
    for (i = 0; i < letters.length; i++) {
        drawOneWordFromOutside(outArray, offsets[i]);
        //offset += 20 * outArray.length/2; // time = 20
    }

}

function scaleLetter(letter, xScale, yScale) {
    if (letter.splines) {
        for (let i = 0; i < letter.splines.length; i++) {
            let spline = letter.splines[i];
            if (spline.points) {
                for (let j = 0; j < spline.points.length; j++) {
                    let point = spline.points[j];
                    point.x *= xScale;
                    point.y *= yScale;
                }
            }
        }
    }
    if (letter.backwardLink) {
        letter.backwardLink.x *= xScale;
        letter.backwardLink.y *= yScale;
    }
    if (letter.forwardLink) {
        letter.forwardLink.x *= xScale;
        letter.forwardLink.y *= yScale;
    }

}

// const vertices = new Float32Array([
//     0, 0.5, -0.5, -0.5, 0.5, -0.5, 0.3, 0.4, 0.1, 0.3, -0.1, 0.4, -0.3, 0.1
// ]);
let isEnd = 0;

function setIsEnd() {
    isEnd = 1;
}

function tick() {
    //gl.clear(gl.COLOR_BUFFER_BIT);
    end = end + 1;
    gl.drawArrays(gl.LINE_STRIP, end - 1, 2);
    if (isEnd === 1) {
        end++;
        //gl.bindBuffer(gl.ARRAY_BUFFER, null);
        //gl.deleteBuffer(vertexBuffer);
        isEnd = 0;
    }
}

// function drawWords(){
// 		first = 0;
// 		for (i = 0 ; i < ends.length - 1; i++){
// 			gl.drawArrays(gl.LINE_STRIP, first, ends[i]);
// 			first = ends[i]
// 		}
// }
function drawOneWordFromOutside(points, offset) {

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
            alphabet[alphabetIndex].backLetterJSON = JSON.parse(ev.target.result);
            loadPossibleMiddleLetter();
        };
        fr2.readAsText(files[getFileIndex(alphabet[alphabetIndex].backLetterLink)]);
    }else
        loadPossibleMiddleLetter();
}

function loadPossibleMiddleLetter() {
    if (alphabet[alphabetIndex].middleLetterLink) {
        const fr3 = new FileReader();
        fr3.onload = function (ev) {
            alphabet[alphabetIndex].middleLetterJSON = JSON.parse(ev.target.result);
            loadPossibleFrontLetter();
        };
        fr3.readAsText(files[getFileIndex(alphabet[alphabetIndex].middleLetterLink)]);
    }else
        loadPossibleFrontLetter();
}

function loadPossibleFrontLetter() {
    if (alphabet[alphabetIndex].frontLetterLink) {
        const fr4 = new FileReader();
        fr4.onload = function (ev) {
            alphabet[alphabetIndex].frontLetterJSON = JSON.parse(ev.target.result);
            loadNormalLetter();
        };
        fr4.readAsText(files[getFileIndex(alphabet[alphabetIndex].frontLetterLink)]);
    }else
        loadNormalLetter();
}

function loadNormalLetter() {
    alphabetIndex++;
    if(alphabetIndex >= alphabet.length)
        return;
    const fr1 = new FileReader();
    fr1.onload = function (ev) {
        alphabet[alphabetIndex].normalLetterJSON = JSON.parse(ev.target.result);
        loadPossibleBackLetter();
    };
    fr1.readAsText(files[getFileIndex(alphabet[alphabetIndex].normalLetterLink)]);
}

function getFileIndex(files, name) {
    for (let i = 0; i < files.length; i++) {
        console.log(files[i].name);
        if (files[i].name === name) {
            return i;
        }
    }
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
    console.log(alphabetLetters);
    for (let i = 0; i < alphabetLetters.length; i++) {
        if (i === 0 || !alphabetLetters[i - 1].forwardLink || !alphabetLetters[i].backwardLink) {
            console.log("Not backward");
            if (i === alphabetLetters.length - 1 || !alphabetLetters[i + 1].backwardLink || !alphabetLetters[i].forwardLink) {
                console.log("Not Forward");
                letters.push(alphabetLetters[i].normalLetterJSON);
            } else {
                letters.push(alphabetLetters[i].frontLetterJSON);
            }
        } else {
            console.log("backward");
            if (i === alphabetLetters.length - 1 || !alphabetLetters[i + 1].backwardLink || !alphabetLetters[i].forwardLink) {
                letters.push(alphabetLetters[i].middleLetterJSON);
            } else {
                letters.push(alphabetLetters[i].backLetterJSON);
            }
        }
    }
    console.log(letters);
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
    normalLetterLink: "Vav-Joda.let",
    normalLetterJSON: "",
    backLetterLink: "Vav-Chasban-Enteha.let",
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
