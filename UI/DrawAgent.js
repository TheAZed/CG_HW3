// let pointsData = [];
// let selectedPoint = [];
// let splinesData = [];
// let selectedSpline = [];
let gl;
let pointVertexShader = 'attribute vec4 a_Position;\n' +
    'attribute float a_PointSize;\n' +
    'uniform vec4 u_Translation;\n' +
    'void main() {\n' +
    '    gl_Position = a_Position + u_Translation;\n' +
    '    gl_PointSize = a_PointSize;\n' +
    '}';
let pointFragmentShader = 'precision mediump float;\n' +
    'uniform vec4 u_FragColor;\n' +
    'void main() {\n' +
    '    gl_FragColor = u_FragColor;\n' +
    '}';
let splineVertexShader = 'attribute vec4 a_Position;\n' +
    'attribute float a_PointSize;\n' +
    'attribute vec4 a_color;\n'+
    'varying vec4 v_color;\n' +
    'void main() {\n' +
    '  gl_Position = a_Position;\n' +
    '  gl_PointSize = a_PointSize;\n' +
    '  v_color = a_color;\n'+
    '}\n';
let splineFragmentShader = 'precision mediump float;\n' +
'varying vec4 v_color;\n' +
'void main() {\n' +
'  gl_FragColor = v_color;\n' +
'}\n';

function loadShaders(type) {
    if (type === 1) { // 1 for point and 2 for spline
        if (!initShaders(gl, pointVertexShader, pointFragmentShader))
            alert("Failed to load point shaders");
    } else {
        if (!initShaders(gl, splineVertexShader, splineFragmentShader))
            alert("Failed to load spline shaders");
    }
}

function init() {
    const canvas = document.getElementById("webgl");
    console.log(canvas.height + ", " + canvas.width);
    gl = getWebGLContext(canvas, true);
    gl.viewport(0, 0, canvas.width, canvas.height);
    if (!gl) {
        alert("Failed at getWebGLContext");
    }
    clearCanvas();
}

function drawPoints(points, special) {
    if (points.length <= 0)
        return;
    let floatArr = [];
    for (const point of points) {
        floatArr.push(point.x, point.y);
    }
    let vertices = new Float32Array(floatArr);
    let a_Position = gl.getAttribLocation(gl.program, 'a_Position');
    if (a_Position < 0) {
        alert("Failed to get a_Position");
        return;
    }
    let a_PointSize = gl.getAttribLocation(gl.program, 'a_PointSize');
    let u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
    let u_Translation = gl.getUniformLocation(gl.program, 'u_Translation');

    let vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(a_Position);
    if (special) {
        gl.vertexAttrib1f(a_PointSize, 7);
        gl.uniform4f(u_FragColor, 1, 0, 0, 1);
    } else {
        gl.vertexAttrib1f(a_PointSize, 5);
        gl.uniform4f(u_FragColor, 0, 0, 1, 1);
    }
    gl.uniform4f(u_Translation, 0, 0, 0, 0);

    gl.drawArrays(gl.POINTS, 0, points.length);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    gl.deleteBuffer(vertexBuffer);
}

function drawSplines(splines, special) {
    if(splines.length <= 0)
        return;
    for(const spline of splines) {
        let floatArr = [];
        let controlPoints = [];
        for (const point of spline.points) {
            controlPoints.push(point.x, point.y);
        }
        bezier(controlPoints, 100, floatArr);
        let vertices = new Float32Array(floatArr);
        let a_Position = gl.getAttribLocation(gl.program, 'a_Position');
        if (a_Position < 0) {
            alert("Failed to get a_Position");
            return;
        }
        let a_PointSize = gl.getAttribLocation(gl.program, 'a_PointSize');
        let u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
        let u_Translation = gl.getUniformLocation(gl.program, 'u_Translation');
        // console.log(floatArr);
        let vertexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

        gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(a_Position);
        if (special) {
            gl.vertexAttrib1f(a_PointSize, 7);
            gl.uniform4f(u_FragColor, 1, 0.5, 0, 1);
        } else {
            gl.vertexAttrib1f(a_PointSize, 5);
            gl.uniform4f(u_FragColor, 0, 0, 0, 1);
        }
        gl.uniform4f(u_Translation, 0, 0, 0, 0);

        gl.drawArrays(gl.LINE_STRIP, 0, floatArr.length/2);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
        gl.deleteBuffer(vertexBuffer);
    }
}

function clearCanvas() {
    gl.clearColor(0.8, 0.8, 0.8, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);
}

function redraw(currentWord, selectedSplineIndex, selectedPointIndex) {
    clearCanvas();
    if(!currentWord || !currentWord.splines[selectedSplineIndex] || !currentWord.splines[selectedSplineIndex].points[selectedPointIndex])
        return;
    let splines = currentWord.splines;
    let selectedSpline = [currentWord.splines[selectedSplineIndex]];
    // console.log(currentWord.splines);
    let points = currentWord.splines[selectedSplineIndex].points;
    let selectedPoint = [currentWord.splines[selectedSplineIndex].points[selectedPointIndex]];
    // todo after adding spline logic uncomment this part
    loadShaders(2); // first load spline shaders
    if(splines.length > 0)
        drawSplines(splines, false); // draw normal splines
    if(splines[selectedSplineIndex])
        drawSplines(selectedSpline, true); // draw the selected spline
    loadShaders(1); // now load point shaders
    if (points.length > 0)
        drawPoints(points, false); // draw normal points
    if (points[selectedPointIndex])
        drawPoints(selectedPoint, true); //draw special points
}