function computeCubicBSpline(u, ctrlPoints, bSplinePoints){
    var n = ctrlPoints.length/2-1;
    var Mbsp = math.matrix([[-1,3,-3,1],[3,-6,3,0],[-3,0,3,0],[1,4,1,0]]);
    Mbsp = math.multiply(Mbsp, 1.0/6.0);
    var ctrlXs  = math.matrix([[ctrlPoints[0]],[ctrlPoints[2]],[ctrlPoints[4]],[ctrlPoints[6]]]);
    var ctrlYs  = math.matrix([[ctrlPoints[1]],[ctrlPoints[3]],[ctrlPoints[5]],[ctrlPoints[7]]]);
    var Us  = math.matrix([[Math.pow(u,3),Math.pow(u,2),Math.pow(u,1),Math.pow(u,0)]]);
    var temp1 = math.multiply(Us,Mbsp);
    var bSplineX = math.multiply(temp1,ctrlXs);
    var bSplineY = math.multiply(temp1,ctrlYs);


    bSplinePoints[0] = bSplineX.subset(math.index(0,0));
    bSplinePoints[1] = bSplineY.subset(math.index(0,0));
    // bSplinePoints[2] = Size;
    // bSplinePoints[3] = Colorr[0];
    // bSplinePoints[4] = Colorr[1];
    // bSplinePoints[5] = Colorr[2];
}


function Bspline(controlPoints, nBsplPoints, bSplinePoints){
    var fourControlPoints = new Float32Array(8);
    var u;

    for (var i = 0; i < controlPoints.length/2-3; i++) {
        for (var j = 0; j < 4; j++) {

            fourControlPoints[2*j] = controlPoints[2*(i+j)];
            fourControlPoints[2*j+1] = controlPoints[2*(i+j)+1];
        }
        console.log(fourControlPoints)

        for (var m= 0; m <= nBsplPoints; m++) {
            u = (m*1.0)/nBsplPoints;
            var bezPoint = new Float32Array(2);
            computeCubicBSpline(u,fourControlPoints,bezPoint);

            for (var k = 0; k < 2; k++) {
                bSplinePoints[2*nBsplPoints*i+2*m+k] = bezPoint[k];
            }
        }
    }
}
