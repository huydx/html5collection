var context, soundSource, soundBuffer, url = 'testtone1.mp3';

function init() {
  if (typeof AudioContext !== "undefined") {
      context = new AudioContext();
  } else if (typeof webkitAudioContext !== "undefined") {
    context = new webkitAudioContext();
  } else {
    throw new Error('AudioContext not supported. :(');
  }
}

window.startSound = function() {
  // Note: this loads asynchronously
  var request = new XMLHttpRequest();
  request.open("GET", url, true);
  request.responseType = "arraybuffer";
  request.onload = function() {
    var audioData = request.response;
    audioGraph(audioData);
  };
  request.send();
}
// Finally: tell the source when to start

function playSound() {
// play the source now
  soundSource.noteOn(context.currentTime);
}

function offSound() {
  soundSource.noteOff(context.currentTime);
}
function stopSound() {
// stop the source now
  soundSource.noteOff(context.currentTime);
}

// Events for the play/stop bottons
// This is the code we are interested in
function audioGraph(audioData) {
  var convolver;

  soundSource = context.createBufferSource();
  soundBuffer = context.createBuffer(audioData, true);
  soundSource.buffer = soundBuffer;
  // Again, the context handles the difficult bits
  convolver = context.createConvolver();
  // Wiring
  soundSource.connect(convolver);
  convolver.connect(context.destination);
  // Loading the 'Sound Snapshot' to apply to our audio
  setReverbImpulseResponse('echo.mp3', convolver, function() {playSound()});
}

function setReverbImpulseResponse(url, convolver, callback) {
  // As with the main sound source, 
  // the Impulse Response loads asynchronously
  var request = new XMLHttpRequest();
  request.open("GET", url, true);
  request.responseType = "arraybuffer";
  request.onload = function () {
    convolver.buffer = context.createBuffer(request.response, false);
    callback();
  }
  request.send();
}
init();
// Impulse Response from Fokke van Saane 
// http://fokkie.home.xs4all.nl/IR.htm

CanvasRenderingContext2D.prototype.line = function(x1, y1, x2, y2) {
  this.lineCap = 'round';
  this.beginPath();
  this.moveTo(x1, y1);
  this.lineTo(x2, y2);
  this.closePath();
  this.stroke();
}

CanvasRenderingContext2D.prototype.circle = function(x, y, r, fill_opt) {
  this.beginPath();
  this.arc(x, y, r, 0, Math.PI * 2, true);
  this.closePath();
  if (fill_opt) {
    this.fillStyle = 'rgba(0,0,0,1)';
    this.fill();
    this.stroke();
  } else {
    this.stroke();
  }
}

CanvasRenderingContext2D.prototype.rectangle = function(x, y, w, h, fill_opt) {
  this.beginPath();
  this.rect(x, y, w, h);
  this.closePath();
  if (fill_opt) {
    this.fillStyle = 'rgba(0,0,0,1)';
    this.fill();
  } else {
    this.stroke();
  }
}

CanvasRenderingContext2D.prototype.triangle = function(p1, p2, p3, fill_opt) {
  // Stroked triangle.
  this.beginPath();
  this.moveTo(p1.x, p1.y);
  this.lineTo(p2.x, p2.y);
  this.lineTo(p3.x, p3.y);
  this.closePath();
  if (fill_opt) {
    this.fillStyle = 'rgba(0,0,0,1)';
    this.fill();
  } else {
    this.stroke();
  }
}

CanvasRenderingContext2D.prototype.clear = function() {
  this.clearRect(0, 0, this.canvas.clientWidth, this.canvas.clientHeight);
} 

var canvas = document.getElementById('playbutton');
var ctx = canvas.getContext('2d');
ctx.lineWidth = 4;

var R = canvas.width / 2;

var STROKE_AND_FILL = false;

canvas.addEventListener('mouseover', function(e) {
  if (this.classList.contains('playing')) {
    drawPauseButton(STROKE_AND_FILL);
  } else {
    drawPlayButton(STROKE_AND_FILL);
  }
  ctx.save();
  ctx.lineWidth += 3;
  ctx.circle(R, R, R - ctx.lineWidth + 1);
  ctx.restore();
}, true);

canvas.addEventListener('mouseout', function(e) {
  if (this.classList.contains('playing')) {
  drawPauseButton(STROKE_AND_FILL);
  } else {
  drawPlayButton(STROKE_AND_FILL);
  }
}, true);

canvas.addEventListener('click', function(e) {
  this.classList.toggle('playing');
  if (this.classList.contains('playing')) {
    drawPauseButton(STROKE_AND_FILL);
    window.startSound();
  } else {
    drawPlayButton(STROKE_AND_FILL);
    offSound( );
  }
}, true);

function drawPlayButton(opt_fill) {
  ctx.clear();
  ctx.circle(R, R, R - ctx.lineWidth + 1, opt_fill);
  ctx.triangle({x: R*0.8, y: R*0.56}, {x: R*1.45, y: R}, {x: R*0.8, y: R*1.45}, true);
}

function drawPauseButton(opt_fill) {
  ctx.clear();
  ctx.circle(R, R, R - ctx.lineWidth + 1, opt_fill);
  ctx.save();
  ctx.lineWidth += 4;
  ctx.line(R*0.8, R/2, R*0.8, R*1.5);
  ctx.line(R+(R/5), R/2, R+(R/5), R*1.5);
  ctx.restore();
}
  
drawPlayButton(STROKE_AND_FILL);
window.playButton = canvas;


