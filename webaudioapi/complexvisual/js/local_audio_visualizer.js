window.onload = function() {
  var element = document.getElementById('container')
  dropAndLoad(element, init, "ArrayBuffer")
}


function dropAndLoad(dropElement, callback, readFormat) {
  var readFormat = readFormat || "DataUrl"

  dropElement.addEventListener('dragover', function(e) {
    e.stopPropagation()
    e.preventDefault()
    e.dataTransfer.dropEffect = 'copy'
  }, false)

  dropElement.addEventListener('drop', function(e) {
    e.stopPropagation()
    e.preventDefault()
    loadFile(e.dataTransfer.files[0])
  }, false) 

  function loadFile(files) {
    var file = files
    var reader = new FileReader()
    reader.onload = function(e) {
      callback(e.target.result)
    }
    reader['readAs'+readFormat](file)
  }
}

// Once the file is loaded, we start getting our hands dirty.
function init(arrayBuffer) {
  document.getElementById('instructions').innerHTML = 'Loading ...'

  window.audioCtx = new webkitAudioContext()
  window.analyser = audioCtx.createAnalyser()

  if (window.source) {
    source.noteOff(0)
  }

  audioCtx.decodeAudioData(arrayBuffer, function(buffer) {
    window.source = audioCtx.createBufferSource()   
    source.buffer = buffer
    
    source.connect(analyser)
    analyser.connect(audioCtx.destination)
    source.noteOn(0)
    
    var viz = new simpleViz()
    // Finally, initialize the visualizer.
    new visualizer(viz['update'], analyser)
    document.getElementById('instructions').innerHTML = ''
  })
}

// Is passed an `analyser` (audioContext analyser).
function visualizer(visualization, analyser) {
  var self = this
  this.visualization = visualization  
  var last = Date.now()
  var loop = function() {
    var dt = Date.now() - last
    // we get the current byteFreq data from our analyser
    var byteFreq = new Uint8Array(analyser.frequencyBinCount)
    analyser.getByteFrequencyData(byteFreq)
    last = Date.now()
    // We might want to use a delta time (`dt`) too for our visualization.
    self.visualization(byteFreq, dt)
    webkitRequestAnimationFrame(loop)
  }
  webkitRequestAnimationFrame(loop)
}

function simpleViz(canvas) {
  var self = this
  this.canvas = document.getElementById('canvas')
  this.ctx = this.canvas.getContext("2d")
  this.copyCtx = document.getElementById('canvas-copy').getContext("2d")
  this.ctx.fillStyle = '#fff' 
  this.barWidth = 10
  this.barGap = 4
  this.bars = Math.floor(this.canvas.width / (this.barWidth + this.barGap))

  this.update = function(byteFreq) {
    self.ctx.clearRect(0, 0, self.canvas.width, self.canvas.height)
    var step = Math.floor(byteFreq.length / self.bars)
    for (var i = 0; i < self.bars; i ++) {
      // Draw each bar
      var barHeight = byteFreq[i*step]
      self.ctx.fillRect(
        i * (self.barWidth + self.barGap), 
        self.canvas.height - barHeight, 
        self.barWidth, 
        barHeight)
      self.copyCtx.clearRect(0, 0, self.canvas.width, self.canvas.height)
      self.copyCtx.drawImage(self.canvas, 0, 0)
    }
  }
}


