import "/src/css/style.css";
import { iso3D } from "./iso3D.js";
import { terrain } from "./terrain.js";
import { wavetable } from "./wavetable.js";
import { isometricCube } from "./isometricCube.js";
import { sonicParameters } from "./parameters.js";

window.onload = () => {
  setTimeout(() => {
    terrain("terrainContainer1");
    wavetable("wavetableContainer1");
    wavetable("wavetableContainer2");
    isometricCube("isoCubeContainer1");
  }, 500);
};

// init external js
iso3D();
document.addEventListener("DOMContentLoaded", (event) => {
  setTimeout(() => {
    sonicParameters("sonicParametersContainer");
  }, 1000);
});

// now regular site js

let imageColumn = document.getElementById("imageColumn");
let textColumn = document.getElementById("textColumn");
let isScrolling = false;

document
  .getElementById("fullscreenButton")
  .addEventListener("click", function () {
    const button = this;
    const textContentDiv = document.getElementById("text-content");
    const threeContainer = document.getElementById("app");
    const resolutionSlider = document.getElementById("resolution-slider");

    if (button.textContent === "show text") {
      textContentDiv.classList.remove("hidden");
      button.textContent = "fullscreen map";
      threeContainer.classList.add("background");
      resolutionSlider.value = "2";
      resolutionSlider.dispatchEvent(new Event("input"));
    } else {
      textContentDiv.classList.add("hidden");
      button.textContent = "show text";
      threeContainer.classList.remove("background"); // Remove 'background' class from 'app'

      // Remove all cursor trails
      removeAllCursorTrails();

      resolutionSlider.value = "6";
      resolutionSlider.dispatchEvent(new Event("input"));
    }
  });

////////////////////////////////////////////////////////// cursors

document.addEventListener("mousemove", function (e) {
  // Function to check if the element or its parent has the specified class
  function hasClass(element, className) {
    while (element) {
      if (element.classList && element.classList.contains(className)) {
        return true;
      }
      element = element.parentElement;
    }
    return false;
  }

  // Get the element under the cursor
  let elementUnderCursor = document.elementFromPoint(e.clientX, e.clientY);

  // Check for the 'crosshair' class, and if found, do nothing (no trail)
  if (hasClass(elementUnderCursor, "crosshair")) {
    return; // Exit the function, no trail is created
  }

  let trail = document.createElement("div");
  trail.className = "cursor-trail";

  // Check for the 'text' class
  if (hasClass(elementUnderCursor, "text")) {
    return; // Exit the function, no trail is created
  } else if (hasClass(elementUnderCursor, "pointer")) {
    trail.classList.add("pointer-cursor-trail"); // Add specific trail class for pointer
  } else {
    trail.classList.add("default-cursor-trail"); // Default trail class for others
  }

  // Adjust positioning based on cursor size
  trail.style.left = e.pageX + 1 + "px"; // Adjust for half the width of the cursor
  trail.style.top = e.pageY - 2 + "px"; // Adjust for half the height of the cursor

  document.body.appendChild(trail);

  setTimeout(() => {
    trail.remove();
  }, 30000); // Remove trail element after N ms
});

// Function to remove all cursor trails
function removeAllCursorTrails() {
  const trails = document.querySelectorAll(".cursor-trail");
  trails.forEach((trail) => trail.remove());
}

/////////////////////////////////////////////////////////// animate text containers
function animatefigDivs() {
  const figDivs = document.querySelectorAll(".figure");

  figDivs.forEach((div) => {
    // Calculate the maximum displacement
    const maxDisplacement = 0.1 * div.offsetWidth;

    // Random initial velocity
    let vx = (Math.random() - 0.5) * 0.5;
    let vy = (Math.random() - 0.5) * 0.3;

    moveDiv(div, vx, vy, maxDisplacement);
  });
}

function moveDiv(div, vx, vy, maxDisplacement) {
  let dx = 0;
  let dy = 0;

  function frame() {
    // Update displacement
    dx += vx;
    dy += vy;

    // Get div dimensions and position
    const rect = div.getBoundingClientRect();
    const bodyWidth = document.body.clientWidth;
    const bodyHeight = document.body.clientHeight;

    // Calculate 0.5% margin for both width and height
    const marginWidth = 0.005 * bodyWidth;
    const marginHeight = 0.005 * bodyHeight;

    // Check boundaries with margins and reverse direction if necessary
    if (
      rect.left + dx < marginWidth ||
      rect.right + dx > bodyWidth - marginWidth
    ) {
      vx = -vx;
    }
    if (
      rect.top + dy < marginHeight ||
      rect.bottom + dy > bodyHeight - marginHeight
    ) {
      vy = -vy;
    }

    // Apply the new position
    div.style.transform = `translate(${dx}px, ${dy}px)`;

    requestAnimationFrame(frame);
  }

  requestAnimationFrame(frame);
}

// Start the animation
// animatefigDivs();

// add fullscreen button after intro
document.addEventListener("DOMContentLoaded", function () {
  const introDiv = document.getElementById("intro");
  const fullscreenButton = document.getElementById("fullscreenButton");

  window.addEventListener("scroll", function () {
    const introDivHeight = introDiv.offsetHeight;
    const introDivTop = introDiv.offsetTop;
    const scrollPosition = window.pageYOffset;

    // Calculate scroll progress through the intro div
    let scrollProgress = (scrollPosition - introDivTop) / introDivHeight;

    // Clamp values between 0 and 1
    scrollProgress = Math.min(Math.max(scrollProgress, 0), 1);

    // Apply the scroll progress to the button's opacity
    fullscreenButton.style.opacity = scrollProgress;
    fullscreenButton.style.visibility =
      scrollProgress > 0 ? "visible" : "hidden";
  });
});

// rotate header characters a lil - scale h1 most intense
function animateHeaderRotations() {
  const headerElements = document.querySelectorAll("h1, h2");

  headerElements.forEach((header) => {
    let newContent = "";
    const text = header.textContent;
    const headerLevel = parseInt(header.tagName.substring(1)); // Extract the header level (1 for H1, 2 for H2, etc.)

    // Scale factors based on header level (higher for H1 and lower for H6)
    const maxRotation = (4 - headerLevel) * 4; // Decreasing max rotation from H1 to H6
    const maxTranslateY = (7 - headerLevel) * 2; // Decreasing max translation from H1 to H6

    for (let char of text) {
      if (char !== " ") {
        const initialRotation = Math.random() * maxRotation - maxRotation / 2;
        const translateY = Math.random() * maxTranslateY - maxTranslateY / 2;
        const animationDuration = Math.random() * 40 + 10; // Random duration
        const animationDelay = Math.random() * 5; // Random delay

        newContent += `<span class="rotate-animate" style="display: inline-block; transform: rotate(${initialRotation}deg) translateY(${translateY}px); animation-duration: ${animationDuration}s; animation-delay: ${animationDelay}s;">${char}</span>`;
      } else {
        newContent += char;
      }
    }

    header.innerHTML = newContent;
  });
}

// Call the function
document.addEventListener("DOMContentLoaded", animateHeaderRotations);

// Gallery chyron
document.addEventListener("DOMContentLoaded", function () {
  const galleryContainer = document.getElementById("gallery-container");
  let imageFilenames = [];
  for (let i = 1; i <= 25; i++) {
    imageFilenames.push(`camp${i}.png`);
  }

  // Shuffle the image filenames
  imageFilenames = shuffleArray(imageFilenames);

  // Function to create an image div
  function createImageDiv(filename) {
    const div = document.createElement("div");
    div.classList.add("image");
    div.style.backgroundImage = `url('../../../public/image/photo/${filename}')`;
    return div;
  }

  // Populate the gallery with shuffled images
  imageFilenames.forEach((filename) => {
    const imageDiv = createImageDiv(filename);
    galleryContainer.appendChild(imageDiv);
  });

  // Additional buffer images for seamless looping
  imageFilenames.forEach((filename) => {
    const imageDiv = createImageDiv(filename);
    galleryContainer.appendChild(imageDiv);
  });

  let images = Array.from(galleryContainer.querySelectorAll(".image"));
  let totalWidth = 0; // Total width of all images
  const marginPercent = 5; // Margin percentage
  let lastTime = 0;
  const speed = 0.05; // Pixels per millisecond
  const vwToPixels = window.innerWidth / 100; // Calculate the value of 1vw in pixels

  const imageWidth = 21 * vwToPixels; // Width of each image in vw
  const marginRight = 4 * vwToPixels; // Right margin in vw

  // Position images and calculate total width
  images.forEach((image) => {
    totalWidth += imageWidth + marginRight; // Add width and margin for each image
    image.style.left = `${totalWidth}vw`; // Position in vw
  });

  function scrollImages(timestamp) {
    if (!lastTime) lastTime = timestamp;
    const deltaTime = timestamp - lastTime;

    images.forEach((image) => {
      let currentLeft = parseFloat(image.style.left);
      currentLeft -= speed * deltaTime; // Move based on time, not frames

      if (currentLeft <= -image.offsetWidth) {
        currentLeft += totalWidth;
      }
      image.style.left = `${Math.round(currentLeft)}px`;
    });

    lastTime = timestamp;
    requestAnimationFrame(scrollImages);
  }

  requestAnimationFrame(scrollImages);

  // Shuffle array function
  function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }
});

// intro popup

document.addEventListener("DOMContentLoaded", function() {
  var asterisk = document.getElementById("asterisk");
  var popup = document.getElementById("popup");
  var close = document.getElementsByClassName("close")[0];

  if (asterisk && popup && close) {
    asterisk.addEventListener("click", function() {
      popup.style.display = "block";
    });

    close.addEventListener("click", function() {
      popup.style.display = "none";
    });

    window.addEventListener("click", function(event) {
      if (event.target === popup) {
        popup.style.display = "none";
      }
    });
  }
});

// ticker

class Ticker {
  constructor(containerId, text, speed = 0.1) {
    this.container = document.getElementById(containerId);
    this.text = text;
    this.speed = speed; // Pixels per millisecond
    this.lastTime = 0;
    this.totalWidth = 0;

    this.init();
  }

  // Function to create a text div
  createTextDiv() {
    const div = document.createElement("div");
    div.classList.add("ticker-text");
    div.textContent = this.text;
    return div;
  }

  // Initialize the ticker
  init() {
    const vwToPixels = window.innerWidth / 100;
    const tempTextDiv = this.createTextDiv(); // Temporary div to calculate width
    this.container.appendChild(tempTextDiv);
    const textWidth = tempTextDiv.offsetWidth; // Width of the text block
    this.container.removeChild(tempTextDiv); // Remove temporary div

    const totalContainerWidth = window.innerWidth;
    const numberOfBlocks = Math.ceil(totalContainerWidth / (textWidth + vwToPixels));

    // Populate the container with the required number of text blocks
    for (let i = 0; i < numberOfBlocks * 2; i++) { // Duplicate for seamless looping
      const textDiv = this.createTextDiv();
      this.container.appendChild(textDiv);
    }

    this.textElements = Array.from(this.container.querySelectorAll(".ticker-text"));
    this.positionTextElements();
    requestAnimationFrame(this.scrollText.bind(this));
  }

  // Position text elements
  positionTextElements() {
    const vwToPixels = window.innerWidth / 100;
    let accumulatedWidth = 0;
    this.textElements.forEach((text, index) => {
      text.style.left = `${accumulatedWidth}px`;
      accumulatedWidth += text.offsetWidth + vwToPixels;
    });
  }

  // Scroll the text
  scrollText(timestamp) {
    if (!this.lastTime) this.lastTime = timestamp;
    const deltaTime = timestamp - this.lastTime;

    this.textElements.forEach((text) => {
      let currentLeft = parseFloat(text.style.left);
      currentLeft -= this.speed * deltaTime; // Move based on time

      if (currentLeft <= -text.offsetWidth) {
        currentLeft += this.textElements.length * (text.offsetWidth + (window.innerWidth / 100));
      }
      text.style.left = `${Math.round(currentLeft)}px`;
    });

    this.lastTime = timestamp;
    requestAnimationFrame(this.scrollText.bind(this));
  }
}

document.addEventListener("DOMContentLoaded", () => {

    const textArray1 = ["methodology"];
    const ticker1 = new Ticker("tickerContainer1", textArray1);
  
    const textArray2 = ["sonification"];
    const ticker2 = new Ticker("tickerContainer2", textArray2);

  });

  // cycle image gallery

  function cycleImagesWithCaptions(containerId, imageInfo, interval = 2000) {
    const container = document.getElementById(containerId);
    if (!container) {
      console.error("Container not found:", containerId);
      return;
    }
    const img = container.getElementsByTagName('img')[0];
    const caption = container.getElementsByTagName('figcaption')[0];
  
    if (!img || !caption) {
      console.error("Image or caption element not found in container", containerId);
      return;
    }
  
    let currentIndex = 0;
  
    function changeImageAndCaption() {
      img.src = imageInfo[currentIndex].src;
      caption.textContent = imageInfo[currentIndex].caption;
      currentIndex = (currentIndex + 1) % imageInfo.length; // Loop back to the start
    }
  
    changeImageAndCaption(); // Set the first image and caption immediately
    setInterval(changeImageAndCaption, interval); // Change the image and caption every 5 seconds
  }
  
  // Image information
  const imageInfo = [
      {
      src: '../../../public/image/photo/davis_healy_rivalta_2019.png',
      caption: 'Davis, Healy, & Rivalta 2019'
      },
      {
        src: '../../../public/image/photo/furuno_rado.png',


        caption: 'Linear Frequency Modulated Pulse Waveform Radar Novikov & Osipov 2019'
      },
      {
        src: '../../../public/image/photo/fairbairn_1949.png',
        caption: 'Fairbairn, 1949'
      },
      {
        src: '../../../public/image/photo/fairbairn_1949-2.png',
        caption: 'Fairbairn, 1949'
      },
      {
        src: '../../../public/image/photo/fairbairn_1949-3.png',
        caption: 'Fairbairn, 1949'
      },
      {
        src: '../../../public/image/photo/fairbairn_1949-4.png',
        caption: 'Fairbairn, 1949'
      },
    ];

    // Calling the function
    document.addEventListener("DOMContentLoaded", () => {
      cycleImagesWithCaptions("image-container", imageInfo);
    });
    