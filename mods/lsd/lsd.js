/* Copyright (c) 2021 Skagenmacka */

var Mod = () => {
    return {
        draw() {
            /* Draw is being called once before each draw call */
            contrast('110%');
            let hue = Date.now() / 10;
            hueRotate((hue % 360) + 'deg');
        }
    };
}