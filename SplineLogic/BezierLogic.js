function binomialCoefs(n, C) {
    for (var i = 0; i <= n; i++) {
        C[i] = 1;
        for (var j = n; j >= i + 1; j--) {
            C[i] *= j;
        }
        for (var j = n - i; j >= 2; j--) {
            C[i] /= j;
        }
    }
}


function bezier(controlPoints, PointsPerPart, bezierPoints) {
    var u;
    let partCount = Math.floor(controlPoints.length / 6);
    var C = new Float32Array(4);
    binomialCoefs(3, C);
    // for (var i = 0; i < C.length; i++) {
    //   console.log(C[i]);
    // }
    // console.log(i);

    for (let k = 0; k < partCount; k++) {
        for (var i = 0; i <= PointsPerPart; i++) {
            u = (i * 1.0) / PointsPerPart;
            var bezPoint = new Float32Array(2);
            computeBez(u, controlPoints, C, bezPoint, 3 * k, 3 * k + 4);
            bezierPoints[2 * i + PointsPerPart * 2 * k] = bezPoint[0];
            bezierPoints[2 * i + 1 + PointsPerPart * 2 * k] = bezPoint[1];
            // console.log(bezierPoints[2 * i + PointsPerPart * 6 * k] + "," + bezierPoints[2 * i  + 1 + PointsPerPart * 6 * k]);
        }
        // console.log(bezierPoints[bezierPoints.length / 2]);
    }
}


function computeBez(u, ctrlPoints, C, bezPoint, start, end) {
    var n = end - start - 1;
    for (var i = 0; i < end - start; i++) {
        var bezCoef = C[i] * Math.pow(u, i) * Math.pow(1 - u, n - i);
        bezPoint[0] += ctrlPoints[2 * (i + start)] * bezCoef;
        bezPoint[1] += ctrlPoints[2 * (i + start) + 1] * bezCoef;
    }
}