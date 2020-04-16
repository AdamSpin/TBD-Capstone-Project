let mic, fft, micLevel, octBands;
let octDiv = 12;
let bins = 512;
let smoothing = 0.3;
let threshold = 10000;
let bg = 240;
let lowEnergyMax = 1800;  //30 minutes
let midEnergyMax = 300;   //5 minutes
let hiEnergyMax = 60;     //1 minute
let minEnergy = 20;   // ignore quiet sounds
let lowEnergyCapDB = 40;
let midEnergyCapDB = 60;
let analysis = [];
let logAnalysis = []

mic = new p5.AudioIn();
fft = new p5.FFT(smoothing,bins);
fft.setInput(mic);
octBands = fft.getOctaveBands(octDiv);

function start(){
  mic.start();
}

function stop(){
  mic.stop();
}

let gsketch = s => {
  let barWidth;
  // let cAmp = Array(bins).fill(0);

  s.setup = () => {
    let canvas = s.createCanvas(300, 300);
    // s.resizeCanvas(canvas.parent().clientWidth, canvas.parent().clientHeight); 
    s.noStroke();
  }

  s.draw = () => {
    s.background(bg);
    analysis = fft.analyze(bins, "dB");
    logAnalysis = fft.logAverages(octBands).map(x => x + 140);
    barWidth = s.width/logAnalysis.length;
    // cAmp = logFrqzy.map((x, i) => cAmp[i] + x * (s.deltaTime/1000));
    for (i = 0; i < logAnalysis.length; i++) {
      s.fill(
        s.map(logAnalysis[i], 0, 140, 0, 512), 
        s.map(logAnalysis[i], 0, 140, 512, 0),
        0);
      s.rect(i*barWidth, s.height, barWidth, s.map(logAnalysis[i], 0, 140, 0, -s.height));
    }
    // axix labels
    s.fill(0);
    s.textAlign(s.LEFT);
    s.text("140dB", 0, 10);
    s.text("70dB", 0, s.height/2);
    s.text("0", 0, s.height);
    s.textAlign(s.CENTER);
    s.text(s.floor(octBands[s.floor(octBands.length/2)].ctr) + "Hz", s.width/2, s.height);
    s.textAlign(s.RIGHT);
    s.text(s.floor(octBands[octBands.length -1].hi) + "Hz", s.width, s.height);
  }
}

let sketchPrototype = function(p) {
  // "public" variables 
  p.bandRange = {start: 0, end: octBands.length};
  p.energyRange = {min: 0, max: 140};
  p.maxTime = 35;

  let curTime = 0;
  let curAngle = 271;

  p.setup = function() {
    let canvas = p.createCanvas(300, 300);
    // p.resizeCanvas(canvas.parent().clientWidth, canvas.parent().clientHeight); 
    p.angleMode(p.DEGREES);
  }

  p.draw = function() {
    let avgEnergy = 0;
    p.background(bg);

    // calculate average energy
    for(i = p.bandRange.start; i < p.bandRange.end; i++){
      avgEnergy += logAnalysis[i];
    }
    avgEnergy = avgEnergy / (p.bandRange.end - p.bandRange.start);

    // increment tiemer and update arc angle
    if(avgEnergy >= p.energyRange.min && avgEnergy < p.energyRange.max){
      curTime += p.deltaTime / 1000;
      curAngle = p.map(curTime, 0, p.maxTime, 270, 630);
    }

  // draw chart
    p.strokeWeight(25);
    p.strokeCap(p.SQUARE);
    p.noFill();
    p.stroke(200);
    p.circle(p.width / 2, p.height /2, 200);
    // color
    p.stroke(
      p.map(curTime, 0, p.maxTime, 0, 512),     // red
      p.map(curTime, 0, p.maxTime, 512, 0),     // green
      0);
    p.arc(p.width / 2, p.height / 2, 200, 200, 270, p.constrain(curAngle, 270, 630));

    // outside arc
    if(curTime >= p.maxTime){
      p.stroke(200);
      p.circle(p.width / 2, p.height /2, 250);
      p.stroke(p.map(curTime, p.maxTime, p.maxTime * 2, 250, 0), 0, 0);
      p.arc(p.width / 2, p.height / 2, 250, 250, 270, curAngle);
    }

  // draw text
    // percent
    p.noStroke();
    p.textSize(50);
    p.fill(0);
    p.textAlign(p.CENTER, p.CENTER);
    p.text(p.floor(curTime/p.maxTime * 100) + "%", p.width / 2, p.height / 2);
    // time
    p.textSize(20);
    p.text(p.floor(curTime) + "s", p.width/2, p.height/3 * 2);
    // energy range
    p.textSize(15);
    p.textAlign(p.LEFT);
    p.text(p.energyRange.min + "dB" + " - " + p.energyRange.max + "dB", 10, 10);
    // frequency range
    let lowFrequency = p.floor(octBands[p.bandRange.start].lo);
    let hiFrequency = p.floor(octBands[p.bandRange.end].hi);
    p.textAlign(p.RIGHT);
    p.text(lowFrequency + "Hz - " + hiFrequency + "Hz", p.width - 10, 10);
  }
}

let divs = document.querySelectorAll("div.graph");

let lBandCap = Math.trunc(octBands.length/3);
let mBandCap = Math.trunc(octBands.length/3 * 2);
let hBandCap = octBands.length;

let eq = new p5(gsketch, document.querySelector("div.eq"));
let lowLow = new p5(sketchPrototype, divs[0]);
lowLow.bandRange = {start: 0, end: lBandCap - 1};
lowLow.energyRange = {min: minEnergy, max: lowEnergyCapDB};
lowLow.maxTime = lowEnergyMax;

let lowMid = new p5(sketchPrototype, divs[1]);
lowMid.bandRange = {start: 0, end: lBandCap - 1};
lowMid.energyRange = {min: lowEnergyCapDB, max: midEnergyCapDB};
lowMid.maxTime = midEnergyMax;

let lowHi = new p5(sketchPrototype, divs[2]);
lowHi.bandRange = {start: 0, end: lBandCap - 1};
lowHi.energyRange = {min: midEnergyCapDB, max: 140}
lowHi.maxTime = hiEnergyMax;

let midLow = new p5(sketchPrototype, divs[3]);
midLow.bandRange = {start: lBandCap, end: mBandCap - 1};
midLow.energyRange = {min: minEnergy, max: lowEnergyCapDB};
midLow.maxTime = lowEnergyMax;

let midMid = new p5(sketchPrototype, divs[4]);
midMid.bandRange = {start: lBandCap, end: mBandCap - 1};
midMid.energyRange = {min: lowEnergyCapDB, max: midEnergyCapDB};
midMid.maxTime = midEnergyMax;

let midHi = new p5(sketchPrototype, divs[5]);
midHi.bandRange = {start: lBandCap, end: mBandCap - 1};
midHi.energyRange = {min: midEnergyCapDB, max: 140};
midHi.maxTime = hiEnergyMax;

let hiLow = new p5(sketchPrototype, divs[6]);
hiLow.bandRange = {start: mBandCap, end: hBandCap - 1};
hiLow.energyRange = {min: minEnergy, max: lowEnergyCapDB};
hiLow.maxTime = lowEnergyMax;

let hiMid = new p5(sketchPrototype, divs[7]);
hiMid.bandRange = {start: mBandCap, end: hBandCap - 1};
hiMid.energyRange = {min: lowEnergyCapDB, max: midEnergyCapDB};
hiMid.maxTime = midEnergyMax;

let hiHi = new p5(sketchPrototype, divs[8]);
hiHi.bandRange = {start: mBandCap, end: hBandCap - 1};
hiHi.energyRange = {min: midEnergyCapDB, max: 140};
hiHi.maxTime = hiEnergyMax;

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

/*----------FUNCTION DEINITION RULES-----------
  Function names are the frequency range, then
  the energy range. For example lowMidSketch
  would be the graph for low frequency, medium
  energy.                                      */

//Formula for Max values is (numSeconds * 60).
//For example, llMax = 108000
//This is 1800 seconds, or 30 minutes

let lowLowSketch = function(ll){
  ll.counter = 181;
  ll.llMax = lowEnergyMax;
  ll.setup = function(){
    ll.createCanvas(300,300);
    ll.angleMode(ll.DEGREES);
  };
  ll.draw = function(){
    ll.background(190);
    ll.textSize(16);
    ll.text("Low Freq, Low Energy", ll.width / 2, 20);
    //Get energies of 32 frequency bands in decibels
    let llAnalysis = fft.analyze(32, "dB");
    //Average energy over entire low freq band
    let curCount = 0;
    var i;
    for(i=1; i < 11; i++){
      curCount += llAnalysis[i];
    }
    curCount = (curCount / 10);
    //If average energy is "low", increase counter
    if(curCount < lowEnergyCapDB){
      ll.counter += (180 / ll.llMax);
    }

    ll.fill(255, 0, 0);
    ll.arc(ll.width / 2, ll.height / 2, 200, 200, 180, ll.counter, ll.PIE);

    if(ll.counter >= 360){
      ll.counter = 181;
    }
  };
};

let lowMidSketch = function(lm){
  lm.counter = 181;
  lm.lmMax = midEnergyMax;
  lm.setup = function(){
    lm.createCanvas(300,300);
    lm.angleMode(lm.DEGREES);
  };
  lm.draw = function(){
    lm.background(190);
    lm.textSize(16);
    lm.text("Low Freq, Mid Energy", lm.width / 2, 20);
    //Get energies of 32 frequency bands in decibels
    let lmAnalysis = fft.analyze(32, "dB");
    //Average energy over entire low freq band
    let curCount = 0;
    var i;
    for(i=1; i < 11; i++){
      curCount += lmAnalysis[i];
    }
    curCount = (curCount / 10);
    //If average energy is "medium", increase counter
    if(curCount < midEnergyCapDB && curCount >= lowEnergyCapDB){
      lm.counter += (180 / lm.lmMax);
    }

    lm.fill(255, 0, 0);
    lm.arc(lm.width / 2, lm.height / 2, 200, 200, 180, lm.counter, lm.PIE);

    if(lm.counter >= 360){
      lm.counter = 181;
    }
  };
};

let lowHiSketch = function(lh){
  lh.counter = 181;
  lh.lhMax = hiEnergyMax;
  lh.setup = function(){
    lh.createCanvas(300,300);
    lh.angleMode(lh.DEGREES);
  };
  lh.draw = function(){
    lh.background(190);
    lh.textSize(16);
    lh.text("Low Freq, High Energy", lh.width / 2, 20);
    //Get energies of 32 frequency bands in decibels
    let lhAnalysis = fft.analyze(32, "dB");
    //Average energy over entire low freq band
    let curCount = 0;
    var i;
    for(i=1; i < 11; i++){
      curCount += lhAnalysis[i];
    }
    curCount = (curCount / 10);
    //If average energy is "high", increase counter
    if(curCount >= midEnergyCapDB){
      lh.counter += (180 / lh.lhMax);
    }

    lh.fill(255, 0, 0);
    lh.arc(lh.width / 2, lh.height / 2, 200, 200, 180, lh.counter, lh.PIE);

    if(lh.counter >= 360){
      lh.counter = 181;
    }
  };
};

let midLowSketch = function(ml){
  ml.counter = 181;
  ml.mlMax = lowEnergyMax;
  ml.setup = function(){
    ml.createCanvas(300,300);
    ml.angleMode(ml.DEGREES);
  };
  ml.draw = function(){
    ml.background(190);
    ml.textSize(16);
    ml.text("Mid Freq, Low Energy", ml.width / 2, 20);
    //Get energies of 32 frequency bands in decibels
    let mlAnalysis = fft.analyze(32, "dB");
    //Average energy over entire low freq band
    let curCount = 0;
    var i;
    for(i=11; i < 21; i++){
      curCount += mlAnalysis[i];
    }
    curCount = (curCount / 10);
    //If average energy is "low", increase counter
    if(curCount < lowEnergyCapDB){
      ml.counter += (180 / ml.mlMax);
    }

    ml.fill(255, 0, 0);
    ml.arc(ml.width / 2, ml.height / 2, 200, 200, 180, ml.counter, ml.PIE);

    if(ml.counter >= 360){
      ml.counter = 181;
    }
  };
};

let midMidSketch = function(mm){
  mm.counter = 181;
  mm.mmMax = midEnergyMax;
  mm.setup = function(){
    mm.createCanvas(300,300);
    mm.angleMode(mm.DEGREES);
  };
  mm.draw = function(){
    mm.background(190);
    mm.textSize(16);
    mm.text("Mid Freq, Mid Energy", mm.width / 2, 20);
    //Get energies of 32 frequency bands in decibels
    let mmAnalysis = fft.analyze(32, "dB");
    //Average energy over entire low freq band
    let curCount = 0;
    var i;
    for(i=11; i < 21; i++){
      curCount += mmAnalysis[i];
    }
    curCount = (curCount / 10);
    //If average energy is "low", increase counter
    if(curCount < midEnergyCapDB && curCount >= lowEnergyCapDB){
      mm.counter += (180 / mm.mmMax);
    }

    mm.fill(255, 0, 0);
    mm.arc(mm.width / 2, mm.height / 2, 200, 200, 180, mm.counter, mm.PIE);

    if(mm.counter >= 360){
      mm.counter = 181;
    }
  };
};

let midHiSketch = function(mh){
  mh.counter = 181;
  mh.mhMax = hiEnergyMax;
  mh.setup = function(){
    mh.createCanvas(300,300);
    mh.angleMode(mh.DEGREES);
  };
  mh.draw = function(){
    mh.background(190);
    mh.textSize(16);
    mh.text("Mid Freq, High Energy", mh.width / 2, 20);
    //Get energies of 32 frequency bands in decibels
    let mhAnalysis = fft.analyze(32, "dB");
    //Average energy over entire low freq band
    let curCount = 0;
    var i;
    for(i=11; i < 21; i++){
      curCount += mhAnalysis[i];
    }
    curCount = (curCount / 10);
    //If average energy is "low", increase counter
    if(curCount >= midEnergyCapDB){
      mh.counter += (180 / mh.mhMax);
    }

    mh.fill(255, 0, 0);
    mh.arc(mh.width / 2, mh.height / 2, 200, 200, 180, mh.counter, mh.PIE);

    if(mh.counter >= 360){
      mh.counter = 181;
    }
  };
};

let hiLowSketch = function(hl){
  hl.counter = 181;
  hl.hlMax = lowEnergyMax;
  hl.setup = function(){
    hl.createCanvas(300,300);
    hl.angleMode(hl.DEGREES);
  };
  hl.draw = function(){
    hl.background(190);
    hl.textSize(16);
    hl.text("High Freq, Low Energy", hl.width / 2, 20);
    //Get energies of 32 frequency bands in decibels
    let hlAnalysis = fft.analyze(32, "dB");
    //Average energy over entire low freq band
    let curCount = 0;
    var i;
    for(i=21; i < 31; i++){
      curCount += hlAnalysis[i];
    }
    curCount = (curCount / 10);
    //If average energy is "low", increase counter
    if(curCount < lowEnergyCapDB){
      hl.counter += (180 / hl.hlMax);
    }

    hl.fill(255, 0, 0);
    hl.arc(hl.width / 2, hl.height / 2, 200, 200, 180, hl.counter, hl.PIE);

    if(hl.counter >= 360){
      hl.counter = 181;
    }
  };
};

let hiMidSketch = function(hm){
  hm.counter = 181;
  hm.hmMax = midEnergyMax;
  hm.setup = function(){
    hm.createCanvas(300,300);
    hm.angleMode(hm.DEGREES);
  };
  hm.draw = function(){
    hm.background(190);
    hm.textSize(16);
    hm.text("High Freq, Mid Energy", hm.width / 2, 20);
    //Get energies of 32 frequency bands in decibels
    let hmAnalysis = fft.analyze(32, "dB");
    //Average energy over entire low freq band
    let curCount = 0;
    var i;
    for(i=21; i < 31; i++){
      curCount += hmAnalysis[i];
    }
    curCount = (curCount / 10);
    //If average energy is "low", increase counter
    if(curCount < midEnergyCapDB && curCount >= lowEnergyCapDB){
      hm.counter += (180 / hm.hmMax);
    }

    hm.fill(255, 0, 0);
    hm.arc(hm.width / 2, hm.height / 2, 200, 200, 180, hm.counter, hm.PIE);

    if(hm.counter >= 360){
      hm.counter = 181;
    }
  };
};

let hiHiSketch = function(hh){
  hh.counter = 181;
  hh.hhMax = hiEnergyMax;
  hh.setup = function(){
    hh.createCanvas(300,300);
    hh.angleMode(hh.DEGREES);
  };
  hh.draw = function(){
    hh.background(190);
    hh.textSize(16);
    hh.text("High Freq, High Energy", hh.width / 2, 20);
    //Get energies of 32 frequency bands in decibels
    let hhAnalysis = fft.analyze(32, "dB");
    //Average energy over entire low freq band
    let curCount = 0;
    var i;
    for(i=21; i < 31; i++){
      curCount += hhAnalysis[i];
    }
    curCount = (curCount / 10);
    //If average energy is "low", increase counter
    if(curCount >= midEnergyCapDB){
      hh.counter += (180 / hh.hhMax);
    }

    hh.fill(255, 0, 0);
    hh.arc(hh.width / 2, hh.height / 2, 200, 200, 180, hh.counter, hh.PIE);

    if(hh.counter >= 360){
      hh.counter = 181;
    }
  };
};

/*
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
*/
//new p5(gsketch);
// let lowLowTest = new p5(lowLowSketch);
// let lowMidTest = new p5(lowMidSketch);
// let lowHiTest = new p5(lowHiSketch);
// let midLowTest = new p5(midLowSketch);
// let midMidTest = new p5(midMidSketch);
// let midHiTest = new p5(midHiSketch);
// let hiLowTest = new p5(hiLowSketch);
// let hiMidTest = new p5(hiMidSketch);
// let hiHiTest = new p5(hiHiSketch);
/*
let bass = new p5(lowSketch);
let mid = new p5(midSketch);
let high = new p5(highSketch);
*/
