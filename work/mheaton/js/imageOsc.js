let context;
let oscillator;
let minBrightness;
let maxBrightness;

function calculateBrightnessRange(img) {
  minBrightness = 255;
  maxBrightness = 0;

  img.loadPixels();
  for (let i = 0; i < img.pixels.length; i += 4) {
    let r = img.pixels[i];
    let g = img.pixels[i + 1];
    let b = img.pixels[i + 2];
    let brightnessValue = (r + g + b) / 3; // Simple average for brightness

    if (brightnessValue < minBrightness) {
      minBrightness = brightnessValue;
    }
    if (brightnessValue > maxBrightness) {
      maxBrightness = brightnessValue;
    }
  }

  console.log("Min Brightness:", minBrightness);
  console.log("Max Brightness:", maxBrightness);

}

function setup() {
  let imgWidth = 720; // Replace with your image's width
  let imgHeight = 600; // Replace with your image's height

  let cnv = createCanvas(imgWidth, imgHeight);
  cnv.parent('myCanvas'); // Attach the canvas to the specific div with id 'myCanvas'
  cnv.elt.willReadFrequently = true;

  loadImage('js/propagation_Raster.png', img => {
    image(img, 0, 0, width, height);
  });

  noLoop();
}

let gainNode;

function startAudio() {
  context = new AudioContext();
  oscillator = context.createOscillator();
  gainNode = context.createGain(); // Create the gain node

  oscillator.type = 'triangle';
  oscillator.connect(gainNode); // Connect the oscillator to the gain node
  gainNode.connect(context.destination); // Connect the gain node to the speakers

  oscillator.start();
  loop(); // Starts the draw loop
}

const F_PENTATONIC_MINOR = [ // Frequencies for a few octaves
  87.31,  // F2
  103.83, // Ab2
  116.54, // Bb2
  130.81, // C3
  155.56, // Eb3
  174.61, // F3
  207.65, // Ab3
  233.08, // Bb3
  261.63, // C4
  311.13, // Eb4
];

const WHOLE_TONE_SCALE = [
  130.81, // C3
  146.83, // D3
  164.81, // E3
  185.00, // F#3
  207.65, // G#3
  233.08, // A#3
];

let prevColor = null;
const COLOR_CHANGE_THRESHOLD = 100; // Adjust this value as needed

function setColorBasedFrequency(col) {
  let numBins = WHOLE_TONE_SCALE.length;
  let binSize = (maxBrightness - minBrightness + 1) / numBins; // +1 to ensure the max value is included
  let binIndex = floor((brightness(col) - minBrightness) / binSize);
  binIndex = constrain(binIndex, 0, numBins - 1); // Ensure the index is within bounds

  console.log("Brightness:", brightness(col), "Bin Index:", binIndex); // Log for debugging

  let freq = WHOLE_TONE_SCALE[binIndex];
  oscillator.frequency.setValueAtTime(freq, context.currentTime);

  // Check for significant color change
  if (!prevColor || dist(red(prevColor), green(prevColor), blue(prevColor), red(col), green(col), blue(col)) > COLOR_CHANGE_THRESHOLD) {
    // Apply the 2ms attack envelope only if there's a significant color change
    gainNode.gain.cancelScheduledValues(context.currentTime);
    gainNode.gain.setValueAtTime(gainNode.gain.value, context.currentTime); // Start from the current gain value
    gainNode.gain.linearRampToValueAtTime(0, context.currentTime + 0.01); // Quickly fade out
    gainNode.gain.linearRampToValueAtTime(1, context.currentTime + 0.03); // Then fade in over 2ms
    prevColor = col; // Update the previous color only when a significant change is detected
  }
}

function draw() {
  if (oscillator) { // Check if oscillator is defined
    let col = get(mouseX, mouseY);
    setColorBasedFrequency(col);
    console.log(col)
  }
}

function windowResized() {
  let container = select('.window-body');
  let w = container.width;
  let h = container.height;

  resizeCanvas(w, h);
}

document.getElementById('startButton').addEventListener('click', function() {
  startAudio();
  this.style.display = 'none'; // hides the button after it's clicked
});
