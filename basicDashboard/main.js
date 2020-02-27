let mic;
let color;
let peakDetect;
let fft;

function setup() {
  createCanvas(600, 600);
  mic = new p5.AudioIn();
  mic.start();
  fft = new p5.FFT();
  fft.setInput(mic);
  //peakDetect = new p5.PeakDetect(430, 450, 0.35, 20);
}
function draw() {
  background(190);
  let spectrum = fft.analyze();

  micLevel = mic.getLevel();

  ellipse(width / 2, height / 2, micLevel * 400, micLevel * 400);
  //   beginShape();
  //   for (i = 0; i < spectrum.length; i++) {
  //     vertex(i, map(spectrum[i], 0, 255, height, 0));
  //   }
  //   endShape();
}
