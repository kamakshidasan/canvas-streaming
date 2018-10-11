const child_process = require('child_process');
const express = require('express');
const WebSocketServer = require('ws').Server;
const http = require('http');

const app = express();
const server = http.createServer(app).listen(3000, () => {
  console.log('Listening...');
});

const wss = new WebSocketServer({
  server: server
});

app.use((req, res, next) => {
  console.log('HTTP Request: ' + req.method + ' ' + req.originalUrl);
  return next();
});

app.use(express.static(__dirname + '/www'));

wss.on('connection', (ws) => {

  //const rtmpUrl = decodeURIComponent(match[1]);
  const rtmpUrl = __dirname + '/www/' + 'test.webm'


  console.log('Target RTMP URL:', rtmpUrl);

  // Launch FFmpeg to handle all appropriate transcoding, muxing, and RTMP
  const ffmpeg = child_process.spawn('ffmpeg', [
    '-y',

    '-i', '-',

    '-f', 'webm',

    '-dash', '1',

    '-cluster_size_limit', '2M',

    '-cluster_time_limit', '5100',

    '-content_type', 'video/webm',

    '-keyint_min', '90',

    '-tile-columns', '4',

    '-frame-parallel', '1',

    '-vcodec', 'libvpx-vp9',

    '-acodec', 'libvorbis',

    rtmpUrl
  ]);

  // If FFmpeg stops for any reason, close the WebSocket connection.
  ffmpeg.on('close', (code, signal) => {
    console.log('FFmpeg child process closed, code ' + code + ', signal ' + signal);
    ws.terminate();
  });

  // Handle STDIN pipe errors by logging to the console.
  // These errors most commonly occur when FFmpeg closes and there is still
  // data to write.  If left unhandled, the server will crash.
  ffmpeg.stdin.on('error', (e) => {
    console.log('FFmpeg STDIN Error', e);
  });

  // FFmpeg outputs all of its messages to STDERR.  Let's log them to the console.
  ffmpeg.stderr.on('data', (data) => {
    console.log('FFmpeg STDERR:', data.toString());
  });

  // When data comes in from the WebSocket, write it to FFmpeg's STDIN.
  ws.on('message', (msg) => {
    console.log('DATA', msg);
    ffmpeg.stdin.write(msg);
  });

  // If the client disconnects, stop FFmpeg.
  ws.on('close', (e) => {
    ffmpeg.kill('SIGINT');
  });

});
