let canvas = document.createElement('canvas');
document.body.appendChild(canvas);

let mediaRecorder;
let mediaStream;

const ws = new WebSocket(
  window.location.protocol.replace('http', 'ws') + '//' + // http: => ws:, https: -> wss:
  window.location.host + '/rtmp/' + 'whatever'
);

ws.addEventListener('open', (e) => {
  console.log('WebSocket Open', e);
});

ws.addEventListener('close', (e) => {
  console.log('WebSocket Close', e);
  mediaRecorder.stop();
});


let output = {
    displayWidth: 1080,
    displayHeight: 512,
    stopTime: 60 * 60 * 30,
};

let data = {
    bathymetry: 'bathymetry.png',
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

lifeCycle = {
    dataWasLoaded: (model) => {

      mediaStream = canvas.captureStream(60);
      var options = {mimeType: 'video/webm;codecs=h264', videoBitsPerSecond: 3000000};

      mediaRecorder = new MediaRecorder(mediaStream, options);

      mediaRecorder.addEventListener('dataavailable', (e) => {
        ws.send(e.data);
      });

      mediaRecorder.addEventListener('stop', ws.close.bind(ws));

      mediaRecorder.start(1000);

    }
}

setTimeout(function(){
    let thismodel = new NAMI.app(data, output, lifeCycle);
}, 2000);
