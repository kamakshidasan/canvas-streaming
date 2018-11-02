let canvas = document.createElement('canvas');
document.body.appendChild(canvas);

let data = {
    bathymetry: 'assets/bathymetry.png',
    bathymetryMetadata: {
        zmin: -6709,
        zmax: 10684
    },
    earthquake: [{
        depth: 22900,
        strike: 17,
        dip: 13.0,
        rake: 108.0,
        U3: 0.0,
        cn: -36.122,
        ce: -72.898,
        Mw: 9,
        reference: 'center'
    }],
    coordinates: 'spherical',
    waveWidth: parseInt(2159*0.5),
    waveHeight: parseInt(960*0.5),
    xmin: -179.991,
    xmax: 179.675,
    ymin: -71.991,
    ymax: 79.8411,
    isPeriodic: true,
    canvas:canvas,
};

let output = {
    displayWidth: parseInt(2159*0.5),
    displayHeight: parseInt(960*0.5),
    stopTime: 60 * 60 * 90,
    displayOption: 'heights',
};

let niterations = 0;

let lifeCycle = {
    dataWasLoaded: (model) => {
        //document.body.appendChild(model.canvas);
        console.log("data got loaded!");
    },
    modelStepDidFinish: (model, controller) => {
        if (model.discretization.stepNumber % 1000 == 0) {
            console.log(model.currentTime/60/60, controller.stopTime/60/60);
        }
        niterations = niterations + 1;
        if (niterations % 100 == 0) {
            niterations = 0;
            return false;
        }
        else {
            return true;
        }
    }
};

setTimeout(function(){
    let thismodel = new NAMI.app(data, output, lifeCycle);
}, 2000);
