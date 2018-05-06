// MultiAttributeSize_Interleaved.js (c) 2012 matsuda
// Vertex shader program
var VSHADER_SOURCE =
  'attribute vec4 a_Position;\n' +
  'attribute float a_PointSize;\n' +
  'attribute vec4 a_color;\n'+
  'varying vec4 v_color;\n' +
  'void main() {\n' +
  '  gl_Position = a_Position;\n' +
  '  gl_PointSize = a_PointSize;\n' +
  '  v_color = a_color;\n'+
  '}\n';

// Fragment shader program
var FSHADER_SOURCE = 
  'precision mediump float;\n' +
  'varying vec4 v_color;\n' +
  'void main() {\n' +
  '  gl_FragColor = v_color;\n' +
  '}\n';


function main(controlPoints,nBezPoints,ColorR,ColorG,ColorB,Size) {
  // Retrieve <canvas> element
  var canvas = document.getElementById('webgl');
  var  Color = new Float32Array([ColorR,ColorG,ColorB]);

  // Get the rendering context for WebGL
  var gl = getWebGLContext(canvas);
  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }

  // Initialize shaders
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log('Failed to intialize shaders.');
    return;
  }

  var bezierPoints = new Float32Array(nBezPoints);
  //var controlPoints = new Float32Array(2*4);

  bezier(controlPoints,bezierPoints.length/6,bezierPoints,Size,Color);
  // Set vertex coordinates and point sizes
  var n = initVertexBuffers(gl, bezierPoints);
  if (n < 0) {
    console.log('Failed to set the vertex information');
    return;
  }

  // Specify the color for clearing <canvas>
  gl.clearColor(1.0, 1.0, 1.0, 1.0);

  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT);

  // Draw three points
  gl.drawArrays(gl.POINTS, 0, n);
}

function computeBez(u, ctrlPoints, C, bezPoint,Size,Color){
  var n = ctrlPoints.length/2-1;

  for (var i = 0; i < ctrlPoints.length/2; i++) {
    var bezCoef = C[i]*Math.pow(u,i)*Math.pow(1-u,n-i);
    bezPoint[0] += ctrlPoints[2*i]*bezCoef;
    bezPoint[1] += ctrlPoints[2*i+1]*bezCoef;  
    bezPoint[2] = Size;
    bezPoint[3] = Color[0];
    bezPoint[4] = Color[1];
    bezPoint[5] = Color[2];
    // bezPoint[6] = 1.0;


  }
}

function binomialCoefs(n, C){
  for (var i = 0; i <= n; i++) {
    C[i] = 1;
    for (var j = n; j >= i+1; j--) {
        C[i] *=j; 
    }
    for (var j = n-i; j >= 2; j--) {
        C[i] /= j;
    }
  }
}


function bezier(controlPoints, nBezierPoints, bezierPoints,Size,Color){
    var u;
    var C = new Float32Array(controlPoints.length/2);
    binomialCoefs(controlPoints.length/2-1,C);
    // for (var i = 0; i < C.length; i++) {
    //   console.log(C[i]);
    // }    
    //console.log(i);


    for (var i = 0; i <= nBezierPoints; i++) {
      u = (i*1.0)/nBezierPoints;
      var bezPoint = new Float32Array(6);
      computeBez(u,controlPoints,C,bezPoint,Size,Color);
      for (var k = 0; k < 6; k++) {
        bezierPoints[6*i+k] = bezPoint[k];
      }


    }

      //console.log(bezierPoints);
}

function initVertexBuffers(gl, drawingPoints) {
  console.log("initVertexBuffers");
  console.log(drawingPoints[13]);
  var n = drawingPoints.length/6; // The number of vertices

  // Create a buffer object
  var vertexSizeBuffer = gl.createBuffer();  
  if (!vertexSizeBuffer) {
    console.log('Failed to create the buffer object');
    return -1;
  }

  // Bind the buffer object to target
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexSizeBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, drawingPoints, gl.STATIC_DRAW);

  var FSIZE = drawingPoints.BYTES_PER_ELEMENT;
  //Get the storage location of a_Position, assign and enable buffer
  var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  if (a_Position < 0) {
    console.log('Failed to get the storage location of a_Position');
    return -1;
  }
  gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, FSIZE * 6, 0);
  gl.enableVertexAttribArray(a_Position);  // Enable the assignment of the buffer object

  // Get the storage location of a_PointSize
  var a_PointSize = gl.getAttribLocation(gl.program, 'a_PointSize');
  if(a_PointSize < 0) {
    console.log('Failed to get the storage location of a_PointSize');
    return -1;
  }
  gl.vertexAttribPointer(a_PointSize, 1, gl.FLOAT, false, FSIZE * 6, FSIZE * 2);
  gl.enableVertexAttribArray(a_PointSize);  // Enable buffer allocation


  var a_Color = gl.getAttribLocation(gl.program, 'a_color');
  if(a_Color < 0) {
    console.log('Failed to get the storage location of a_color');
    return -1;
  }
  gl.vertexAttribPointer(a_Color, 3, gl.FLOAT, false, FSIZE * 6, FSIZE * 3);
  gl.enableVertexAttribArray(a_Color);  // Enable the assignment of the buffer object


  // Unbind the buffer object
  gl.bindBuffer(gl.ARRAY_BUFFER, null);

  return n;
}
