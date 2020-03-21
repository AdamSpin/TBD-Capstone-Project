let mic, fft, micLevel, octBands;
let octDiv = 12;
let bins = 1024;
let smoothing = 0.8;
let threshold = 10000;
let bg = 255;
let w;

mic = new p5.AudioIn();
mic.start();
fft = new p5.FFT(smoothing,bins);
fft.setInput(mic);
octBands = fft.getOctaveBands(octDiv);

let gsketch = s => {
  let logFrqzy, barWidth;
  let cAmp = Array(bins).fill(0);

  s.setup = () => {
    s.createCanvas(s.windowWidth, s.windowHeight/2);
    s.background(bg);
    s.stroke(bg);
  }

  s.draw = () => {
    fft.analyze();
    logFrqzy = fft.logAverages(octBands);
    barWidth = s.width/logFrqzy.length;
    cAmp = logFrqzy.map((x, i) => cAmp[i] + x * (s.deltaTime/1000));
    for (i = 0; i < logFrqzy.length; i++) {
      s.fill(s.color(s.constrain(logFrqzy[i]*2, 0, 255), 255 - (s.constrain(logFrqzy[i] - 128, 0,127)*2), 0));
      s.rect(i*barWidth, s.height, barWidth, -(cAmp[i] / threshold * s.height));
    }
  }
}

let eqSketch = function(e) {
  e.setup = function() {
    e.createCanvas(600, 600);
    e.angleMode(e.DEGREES);
    e.colorMode(e.HSB);
    w = e.width / 128;
  };

  e.draw = function() {
    e.background(0, 0, 79);
    let spectrum = fft.analyze();

    micLevel = mic.getLevel();
    e.noStroke();
    for (let i = 0; i < spectrum.length; i++) {
      e.amp = spectrum[i];
      e.y = e.map(e.amp, 0, 256, e.height, 0);
      e.fill(i, 255, 255);
      e.rect(i * w, e.y, w - 2, e.height - e.y);
    }
  };
};

//Low frequencies of 0-379
let lowSketch = function(l) {
  l.counter = 181;
  l.lowMax = 100000;
  l.setup = function() {
    l.createCanvas(300, 300);
    l.angleMode(l.DEGREES);
  };
  l.draw = function() {
    l.background(190);
    l.textSize(16);
    l.text('Low Frequencies', l.width / 2, 20);
    let lowenergy = fft.getEnergy(1, 379);
    let maxLow = lowenergy * (180 / l.lowMax);

    l.counter += maxLow;

    l.fill(255, 0, 0);
    l.arc(l.width / 2, l.height / 2, 200, 200, 180, l.counter, l.PIE);

    if (l.counter >= 360) {
      console.log('LOW FULL');
      l.counter = 181;
    }
  };
};

//Mid frequencies of 380-1000
let midSketch = function(m) {
  m.counter = 181;
  m.midMax = 100000;
  m.setup = function() {
    m.createCanvas(300, 300);
    m.angleMode(m.DEGREES);
  };
  m.draw = function() {
    m.background(190);
    m.textSize(16);
    m.text('Mid Frequencies', m.width / 2, 20);
    let midenergy = fft.getEnergy(380, 1000);
    let maxMid = midenergy * (180 / m.midMax);

    m.counter += maxMid;

    m.fill(0, 255, 0);
    m.arc(m.width / 2, m.height / 2, 200, 200, 180, m.counter, m.PIE);

    if (m.counter >= 360) {
      console.log('MID FULL');
      m.counter = 181;
    }
  };
};

//High frequencies of 1000-10000
let highSketch = function(h) {
  h.counter = 181;
  h.highMax = 100000;
  h.setup = function() {
    h.createCanvas(300, 300);
    h.angleMode(h.DEGREES);
  };
  h.draw = function() {
    h.background(190);
    h.textSize(16);
    h.text('High Frequencies', h.width / 2, 20);
    let highenergy = fft.getEnergy(1000, 10000);
    let maxHigh = highenergy * (180 / h.highMax);

    h.counter += maxHigh;

    h.fill(0, 0, 255);
    h.arc(h.width / 2, h.height / 2, 200, 200, 180, h.counter, h.PIE);

    if (h.counter >= 360) {
      console.log('HIGH FULL');
      h.counter = 181;
    }
  };
};

new p5(gsketch);
let bass = new p5(lowSketch);
let mid = new p5(midSketch);
let high = new p5(highSketch);
