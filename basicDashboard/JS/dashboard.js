let mic, fft, micLevel, octBands;
let octDiv = 12;
let bins = 512;
let smoothing = 0.3;
let threshold = 10000;
let bg = 240;
let fr = 15;
let enabled = false;

//Max amount of time allocated to being at low, med, and high energy
let lowEnergyMax = 360;
let midEnergyMax = 180;
let hiEnergyMax = 90;

//Energy levels to denote decibel bands. These values are in decibels
let minEnergy = 20; // ignore quiet sounds
let lowEnergyCapDB = 40;
let midEnergyCapDB = 60;
let hiEnergyCapDB = 140;

let analysis = [];
let logAnalysis = [];

mic = new p5.AudioIn();
fft = new p5.FFT(smoothing, bins);
fft.setInput(mic);
octBands = fft.getOctaveBands(octDiv);

function start() {
  if(!enabled){
    eq.userStartAudio();
    mic.start(() => enabled = true);
  }
}
function stop() {
  mic.stop();
  window.location.href = './Results.html';
}
function pause() {
  mic.stop();
  enabled = false;
}

//Sketch for the equalizer at top of page
let gsketch = (s) => {
  let barWidth;
  let canvas;

  s.setup = () => {
    canvas = s.createCanvas(300, 300);
    s.resizeCanvas(s.windowWidth, s.windowHeight / 5);
    s.noStroke();
    s.frameRate(fr);
  };

  s.windowResized = () => {
    s.resizeCanvas(s.windowWidth, s.windowHeight / 5);
  };

  s.draw = () => {
    let scale = s.width / 300 < s.height / 300 ? s.width / 300 : s.height / 300;
    s.scale(scale);
    let width = (s.width * 1) / scale;
    let height = (s.height * 1) / scale;
    s.background(bg);
    analysis = fft.analyze(bins, 'dB');
    logAnalysis = fft.logAverages(octBands).map((x) => x + 140);
    barWidth = width / logAnalysis.length;
    for (i = 0; i < logAnalysis.length; i++) {
      s.fill(
        s.map(logAnalysis[i], 0, 140, 0, 512),
        s.map(logAnalysis[i], 0, 140, 512, 0),
        0
      );
      s.rect(
        i * barWidth,
        height,
        barWidth,
        s.map(logAnalysis[i], 0, 140, 0, -height)
      );
    }
    // axix labels
    s.fill(150);
    s.textSize(20);
    s.textAlign(s.LEFT, s.TOP);
    s.text('140dB', 0, 0);
    s.textAlign(s.LEFT);
    s.text('70dB', 0, height / 2);
    s.textAlign(s.LEFT, s.BOTTOM);
    s.text('0', 0, height);
    s.textAlign(s.CENTER);
    s.text(
      s.floor(octBands[s.floor(octBands.length / 3)].lo) + 'Hz',
      width / 3,
      height
    );
    s.text(
      s.floor(octBands[s.floor((octBands.length / 3) * 2)].lo) + 'Hz',
      (width / 3) * 2,
      height
    );
    s.textAlign(s.RIGHT);
    s.text(s.floor(octBands[octBands.length - 1].hi) + 'Hz', width, height);
  };
};

//Prototype used for the 3x3 grid of dial graphs
let sketchPrototype = function (p) {
  // "public" variables
  p.bandRange = { start: 0, end: octBands.length };
  p.energyRange = { min: 0, max: 140 };
  p.maxTime = 35;
  p.graph = '';
  p.graphDescription = '';
  p.curTime = 0;
  let curAngle = 271;
  let canvas;

  p.setup = function () {
    canvas = p.createCanvas(300, 300);
    p.resizeCanvas(p.windowWidth / 3 - 5, p.windowHeight / 4);
    p.angleMode(p.DEGREES);
    p.frameRate(fr);
    document.getElementById('alert').style.visibility = 'hidden';
    p.scAlert = 0;

    switch (p.maxTime) {
      case lowEnergyMax:
        if (p.bandRange.start === 0) {
          p.graph = 'lowLow';
          p.graphDescription = 'Low Frequencies at High Energy';
        }
        if (p.bandRange.start === lBandCap) {
          p.graph = 'midLow';
          p.graphDescription = 'Low Frequencies at Mid Energy';
        }
        if (p.energyRange.max === mBandCap) {
          p.graph = 'hiLow';
          p.graphDescription = 'Low Frequencies at Low Energy';
        }
        break;
      case midEnergyMax:
        if (p.bandRange.start === 0) {
          p.graph = 'lowMid';
          p.graphDescription = 'Mid Frequencies at Low Energy';
        }
        if (p.bandRange.start === lBandCap) {
          p.graph = 'midMid';
          p.graphDescription = 'Mid Frequencies at Mid Energy';
        }
        if (p.bandRange.start === mBandCap) {
          p.graph = 'hiMid';
          p.graphDescription = 'Mid Frequencies at High Energy';
        }
        break;
      case hiEnergyMax:
        if (p.bandRange.start === 0) {
          p.graph = 'lowHi';
          p.graphDescription = 'High Frequencies at Low Energy';
        }
        if (p.bandRange.start === lBandCap) {
          p.graphDescription = 'High Frequencies at Mid Energy';
          p.graph = 'midHi';
        }
        if (p.bandRange.start === mBandCap) {
          p.graph = 'hiHi';
          p.graphDescription = 'High Frequencies at High Energy';
        }
        break;
    }
    update();
  };

  p.windowResized = function () {
    p.resizeCanvas(p.windowWidth / 3 - 5, p.windowHeight / 4);
    update();
  };

  p.draw = function () {
    let avgEnergy = 0;

    // calculate average energy
    for (i = p.bandRange.start; i < p.bandRange.end; i++) {
      avgEnergy += logAnalysis[i];
    }
    avgEnergy = avgEnergy / (p.bandRange.end - p.bandRange.start);

    // increment tiemer and update arc angle
    if (avgEnergy >= p.energyRange.min && avgEnergy < p.energyRange.max) {
      p.curTime += p.deltaTime / 1000;
      curAngle = p.map(p.curTime, 0, p.maxTime, 270, 630);
      update();
    }
  };

  function update() {
    let scale = p.width / 300 < p.height / 300 ? p.width / 300 : p.height / 300;
    p.scale(scale);
    let width = (p.width * 1) / scale;
    let height = (p.height * 1) / scale;
    let iteration = 0;
    p.background(bg);
    // draw chart
    p.strokeWeight(25);
    p.strokeCap(p.SQUARE);
    p.noFill();
    p.stroke(200);
    p.circle(width / 2, height / 2, 200);
    // color
    p.stroke(
      p.map(p.curTime, 0, p.maxTime, 0, 512), // red
      p.map(p.curTime, 0, p.maxTime, 512, 0), // green
      0
    );
    p.noFill();
    p.arc(
      width / 2,
      height / 2,
      200,
      200,
      270,
      p.constrain(curAngle, 270, 630)
    );

    // outside arc
    if (p.curTime >= p.maxTime) {
      console.log(p.graph + 'HIT');
      if (p.scAlert === 0) {
        let text = document.createTextNode('ALERT\n' + p.graphDescription);
        let alDiv = document.getElementById('alert');
        alDiv.appendChild(text);
        alDiv.style.visibility = 'visible';
        setTimeout(function () {
          alDiv.style.visibility = 'hidden';
          alDiv.textContent = '';
        }, 2000);
      }
      p.scAlert++;
      p.stroke(200);
      p.circle(width / 2, height / 2, 250);
      p.stroke(p.map(p.curTime, p.maxTime, p.maxTime * 2, 250, 0), 0, 0);
      p.arc(
        width / 2,
        height / 2,
        250,
        250,
        270,
        p.constrain(curAngle, 630, 990)
      );
    }

    // draw text
    // percent
    p.noStroke();
    p.textSize(50);
    p.fill(0);
    p.textAlign(p.CENTER, p.CENTER);
    p.text(p.floor((p.curTime / p.maxTime) * 100) + '%', width / 2, height / 2);
    // time
    p.textSize(20);
    p.text(formatTime(p.curTime), width / 2, (height / 3) * 2);
    // energy range
    p.fill(150);
    p.textSize(15);
    p.textAlign(p.LEFT);
    p.text(p.energyRange.min + 'dB' + ' - ' + p.energyRange.max + 'dB', 10, 10);
    // frequency range
    let lowFrequency = p.floor(octBands[p.bandRange.start].lo);
    let hiFrequency = p.floor(octBands[p.bandRange.end].hi);
    p.textAlign(p.RIGHT);
    p.text(lowFrequency + 'Hz - ' + hiFrequency + 'Hz', width - 10, 10);
  }
};

function formatTime(seconds) {
  let date = new Date(0);
  date.setSeconds(seconds);
  return date.toISOString().substr(11, 8);
}

let divs = document.querySelectorAll('div.graph');

let lBandCap = Math.trunc(octBands.length / 3);
let mBandCap = Math.trunc((octBands.length / 3) * 2);
let hBandCap = octBands.length;

let eq = new p5(gsketch, document.querySelector('div.eq'));

//All definitions are in order of frequency range, then energy range
//e.g. lowHi is low frequency, high energy. midLow is medium frequency, low energy
let lowHi = new p5(sketchPrototype, divs[0]);
lowHi.bandRange = { start: 0, end: lBandCap - 1 };
lowHi.energyRange = { min: midEnergyCapDB, max: hiEnergyCapDB };
lowHi.maxTime = hiEnergyMax;

let midHi = new p5(sketchPrototype, divs[1]);
midHi.bandRange = { start: lBandCap, end: mBandCap - 1 };
midHi.energyRange = { min: midEnergyCapDB, max: hiEnergyCapDB };
midHi.maxTime = hiEnergyMax;

let hiHi = new p5(sketchPrototype, divs[2]);
hiHi.bandRange = { start: mBandCap, end: hBandCap - 1 };
hiHi.energyRange = { min: midEnergyCapDB, max: hiEnergyCapDB };
hiHi.maxTime = hiEnergyMax;

let lowMid = new p5(sketchPrototype, divs[3]);
lowMid.bandRange = { start: 0, end: lBandCap - 1 };
lowMid.energyRange = { min: lowEnergyCapDB, max: midEnergyCapDB };
lowMid.maxTime = midEnergyMax;

let midMid = new p5(sketchPrototype, divs[4]);
midMid.bandRange = { start: lBandCap, end: mBandCap - 1 };
midMid.energyRange = { min: lowEnergyCapDB, max: midEnergyCapDB };
midMid.maxTime = midEnergyMax;

let hiMid = new p5(sketchPrototype, divs[5]);
hiMid.bandRange = { start: mBandCap, end: hBandCap - 1 };
hiMid.energyRange = { min: lowEnergyCapDB, max: midEnergyCapDB };
hiMid.maxTime = midEnergyMax;

let lowLow = new p5(sketchPrototype, divs[6]);
lowLow.bandRange = { start: 0, end: lBandCap - 1 };
lowLow.energyRange = { min: minEnergy, max: lowEnergyCapDB };
lowLow.maxTime = lowEnergyMax;

let midLow = new p5(sketchPrototype, divs[7]);
midLow.bandRange = { start: lBandCap, end: mBandCap - 1 };
midLow.energyRange = { min: minEnergy, max: lowEnergyCapDB };
midLow.maxTime = lowEnergyMax;

let hiLow = new p5(sketchPrototype, divs[8]);
hiLow.bandRange = { start: mBandCap, end: hBandCap - 1 };
hiLow.energyRange = { min: minEnergy, max: lowEnergyCapDB };
hiLow.maxTime = lowEnergyMax;
