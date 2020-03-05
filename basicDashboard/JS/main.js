let mic;
fft;
let button;
let midMax = 100000;
let w;
let counter = 180;
// let amplitude;

function setup() {
  createCanvas(600, 600);
  angleMode(DEGREES);
  colorMode(HSB);
  w = width / 64;
  mic = new p5.AudioIn(0.5, 64);
  mic.start();

  fft = new p5.FFT();
  fft.setInput(mic);
}
function draw() {
  // background(220);
  background(0);
  let spectrum = fft.analyze();
  let bassenergy = fft.getEnergy('bass');
  let midenergy = fft.getEnergy('mid');
  let highenergy = fft.getEnergy('treble');

  let maxMid = midenergy * (180 / midMax);

  micLevel = mic.getLevel();

  for (let i = 0; i < spectrum.length; i++) {
    let amp = spectrum[i];
    let y = map(amp, 0, 256, height, 0);
    fill(i, 255, 255);
    rect(i * w, y, w - 2, height - y);
  }
  counter += maxMid;

  fill(255);
  arc(50, 50, 80, 80, 180, counter, PIE);

  if (counter >= 360) {
    console.log('FULL');
    counter = 180;
  }
}
