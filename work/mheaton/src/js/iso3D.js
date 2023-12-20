// Import modules
import * as THREE from 'three';
import { MapControls } from 'three/addons/controls/MapControls.js';
import * as BufferGeometryUtils from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import proj4 from 'proj4';
import hull from 'convex-hull';
import Delaunator from 'delaunator';
import Graph from 'graphology';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';


let visualizationReady = false;

export function iso3D() {

// Define global geographic layer groups
let fmTransmitterPoints = new THREE.Group();
let fmMSTLines = new THREE.Group();
let cellTransmitterPoints = new THREE.Group();
let cellMSTLines = new THREE.Group();
let contourLines = new THREE.Group();
let propagationPolygons = new THREE.Group();
let cellServiceMesh = new THREE.Group();
let analysisArea = new THREE.Group();
cellServiceMesh.visible = false; // Set the mesh to be invisible initially

// Define color scheme variables
const colorScheme = {
  graticuleColor: "#2f2f2f0b", // Bright green
  ambientLightColor: "#404040", // Dark gray
  directionalLightColor: "#ffffff", // White
  backgroundColor: "#000000", // Black
  polygonColor: "#FF1493", // magenta
  pyramidColorFM: "#FF5F1F", // Yellow
  pyramidColorCellular: "#FFFF00", // neon orange
  // lowestElevationColor: "#0000ff", // Blue
  // middleElevationColor: "#00ff00", // Green
  // highestElevationColor: "#ff0000", // Red
  mstFmColor: "#FF5F1F", // yellow
  mstCellColor: "#FFFF00", // neon orange
  boundingBoxColor: "#303030",
  contoursLabelColor: "#00ff00",
  cellColor: "#FF1493" // magenta
};

// Alternate color scheme
// const colorScheme = {
//   graticuleColor: "#6F70A7",
//   ambientLightColor: "#4e4c4c",
//   directionalLightColor: "#ddddff",
//   backgroundColor: "#021424",
//   polygonColor: "#14743c",
//   pyramidColorFM: "#FC5553",
//   pyramidColorCellular: "#53FC86",
//   lowestElevationColor: "#0f2df2",
//   middleElevationColor: "#B260FC",
//   highestElevationColor: "#ad99f9",
// };


// Define the custom projection with its PROJ string
const statePlaneProjString = "+proj=longlat +lat_0=40 +lon_0=-76.58333333333333 +k=0.9999375 +x_0=249999.9998983998 +y_0=0 +ellps=GRS80 +datum=NAD83 +to_meter=0.3048006096012192 +no_defs";
proj4.defs("EPSG:2261", statePlaneProjString);

// Use this function to convert lon/lat to State Plane coordinates
function toStatePlane(lon, lat) {
  if (!Number.isFinite(lon) || !Number.isFinite(lat)) {
    throw new Error(`Invalid coordinates: longitude (${lon}), latitude (${lat})`);
  }
  return proj4("EPSG:2261").forward([lon, lat]);
}

// Function to calculate distance between two points in State Plane coordinates
function distanceBetweenPoints(point1, point2) {
  const dx = point1.x - point2.x;
  const dy = point1.y - point2.y;
  return Math.sqrt(dx * dx + dy * dy);
}


//////////////////////////////////////
// loading screen! //////////////////

// Three.js - Initialize the Scene
let scene, camera, renderer, controls;
let infoVisible = false;
let isCameraLocked = false;
let globalBoundingBox
let raycaster = new THREE.Raycaster();
let mouse = new THREE.Vector2();
let polygons = [];
let isCameraRotating = true; // Flag to track camera rotation
const rotationSpeed = 0.001; // Define the speed of rotation
let sliderValue = 8;  //  default value
const sliderLength = 10;  // Assuming 10 is the maximum value of the slider


// Create a material for the ray line
const rayMaterial = new THREE.LineBasicMaterial({ color: 0xff0000 }); // Red color for visibility
// Create a geometry for the ray line
const rayGeometry = new THREE.BufferGeometry();
const rayLine = new THREE.Line(rayGeometry, rayMaterial);

let cellWireframe = false;


function initThreeJS() {
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.up.set(0, 0, 1); // Set Z as up-direction 

  // Create the renderer first
  renderer = new THREE.WebGLRenderer({ antialias: false });

  var lowResScale = 1.0; // Adjust this for more or less resolution (lower value = lower resolution)
  var lowResWidth = window.innerWidth * lowResScale;
  var lowResHeight = window.innerHeight * lowResScale;

  renderer.setSize(lowResWidth, lowResHeight, false);
  renderer.setPixelRatio(window.devicePixelRatio * lowResScale);

  document.getElementById('three-container').appendChild(renderer.domElement);


  // Set initial positions - We'll update these later
  rayGeometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(6), 3));

  // Create the line and add it to the scene
  scene.add(rayLine);
  rayLine.scale.set(1, 1, 1); // Make sure the scale is appropriate
  rayLine.material.linewidth = 2; // Increase the line width for visibility

  // Initialize MapControls
  controls = new MapControls(camera, renderer.domElement);

  // Set up the control parameters as needed for a mapping interface
  controls.screenSpacePanning = false;
  controls.enableRotate = false; // typically map interfaces don't use rotation
  controls.enableDamping = true; // an optional setting to give a smoother control feeling
  controls.dampingFactor = 0.05; // amount of damping (drag)

  // Set the minimum and maximum polar angles (in radians) to prevent the camera from going over the vertical
  controls.minPolarAngle = 0; // 0 radians (0 degrees) - directly above the target
  controls.maxPolarAngle = (Math.PI / 2) - 0.05; // π/2 radians (90 degrees) - on the horizon
  // Set the maximum distance the camera can dolly out
  controls.maxDistance = 5.5; // max camera zoom
  controls.minDistance = 0.5; // min camera zoom

  const audioListener = new THREE.AudioListener();
  camera.add(audioListener);

  const distanceToTarget = camera.position.distanceTo(controls.target);

  
  let ambientLight = new THREE.AmbientLight(colorScheme.ambientLightColor);
  scene.add(ambientLight);
  let directionalLight = new THREE.DirectionalLight(colorScheme.directionalLightColor, 0.5);
  directionalLight.position.set(0, 1, 0);
  scene.add(directionalLight);

  const fogNear = 4.5; // The starting distance of the fog (where it begins to appear)
  const fogFar = 9; // The ending distance of the fog (where it becomes fully opaque)
  
  // Adding fog to the scene
  scene.fog = new THREE.Fog(colorScheme.backgroundColor, fogNear, fogFar);
  
  // Adjust the camera's far plane
  camera.far = fogFar;
  camera.updateProjectionMatrix();

  // ASCII Slider initialization inside initThreeJS
  const resolutionSlider = document.getElementById('resolution-slider');
  updateSliderDisplay(sliderValue, resolutionSlider);

  renderer.setClearColor(colorScheme.backgroundColor);
  window.addEventListener('resize', onWindowResize, false);
  addLayerVisibilityControls();
  adjustCameraZoom();
}

function updateResolutionDisplay() {
  var newWidth = Math.round(window.innerWidth * (sliderValue / sliderLength));
  var newHeight = Math.round(window.innerHeight * (sliderValue / sliderLength));
  document.getElementById('resolution-display').textContent = `resolution: ${newWidth * 10} x ${newHeight * 10}px`;
}

// Set up the slider event listener
document.getElementById('resolution-slider').addEventListener('input', function(event) {
  // Read the new value from the slider and convert it
  sliderValue = 0.2 + (parseFloat(event.target.value) / sliderLength) * 0.8;

  // Update the resolution and the display
  onWindowResize(); // Update the resolution
  updateResolutionDisplay(); // Update the display
});


document.addEventListener('updateResolutionSlider', function(event) {
  const newSliderValue = event.detail.sliderValue;
  // Convert the slider value to the scale needed for your Three.js visualization
  sliderValue = 0.2 + (parseFloat(newSliderValue) / sliderLength) * 0.8;

  // Then update your Three.js visualization accordingly
  onWindowResize(); // Call the function that updates the resolution
  updateResolutionDisplay(); // Update the resolution display
});


///////////////////////////////////////////////////// 
// DOM MODS AND EVENT LISTENERS ////////////////////

// Function to update slider display
function updateSliderDisplay(value, resolutionSlider) {
let sliderDisplay = '[';
for (let i = 0; i < sliderLength; i++) {
    sliderDisplay += i < value ? '#' : '-';
}
sliderDisplay += ']';
resolutionSlider.textContent = sliderDisplay;
}

// Resize function
function onWindowResize() {
  // Get the dimensions of the container
  const container = document.getElementById('three-container');
  const width = container.offsetWidth;
  const height = container.offsetHeight;

  // Update camera aspect ratio and renderer size
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height);

  // Ensure the sliderValue is up-to-date
  sliderValue = 0.2 + (parseFloat(document.getElementById('resolution-slider').value) / sliderLength) * 0.8;

  // Calculate new dimensions based on the slider value
  var newWidth = Math.max(1, window.innerWidth * sliderValue);
  var newHeight = Math.max(1, window.innerHeight * sliderValue);

  if (renderer && camera) {
      renderer.setSize(newWidth, newHeight, false);
      renderer.setPixelRatio(window.devicePixelRatio * sliderValue);

      // Update camera aspect ratio and projection matrix
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
  }

  // Update the resolution display
  updateResolutionDisplay();

  // Continue with your existing resize adjustments
  adjustCameraZoom();
}

let cursorHidden = false;


// hide cursor for screen recordings etc
document.addEventListener('keydown', function(event) {
    if (event.key === 'h' || event.key === 'H') {
        const mainContainer = document.getElementById('three-container');

        if (cursorHidden) {
            // Switch to 15% transparent cursor
            mainContainer.classList.remove('cursor-transparent');
            mainContainer.classList.add('cursor-default');
        } else {
            // Make cursor fully transparent
            mainContainer.classList.remove('cursor-default');
            mainContainer.classList.add('cursor-transparent');
        }

        cursorHidden = !cursorHidden;
    }
});


function adjustCameraZoom() {
  if (camera) {
    // Example of dynamic FOV scaling:
    // - If the window width is 600px or less, use a FOV of 90
    // - If the window width is 1200px or more, use a FOV of 60
    // - Scale linearly between those values for window widths in between
    const minWidth = 600;
    const maxWidth = 1200;
    const minFov = 90;
    const maxFov = 60;

    // Map the window width to the FOV range
    const scale = (window.innerWidth - minWidth) / (maxWidth - minWidth);
    const fov = minFov + (maxFov - minFov) * Math.max(0, Math.min(1, scale));

    camera.fov = fov;
    camera.updateProjectionMatrix();
  }
}

// Initial call to set up the zoom level
adjustCameraZoom();



// check if mouseover is intersecting polygons
function checkIntersection() {
  raycaster.setFromCamera(mouse, camera);
  
  // Update the ray line geometry
  const rayDirection = new THREE.Vector3();
  raycaster.ray.direction.normalize();

  const startPoint = raycaster.ray.origin.clone();
  const endPoint = startPoint.clone().add(rayDirection.clone().multiplyScalar(1000)); // Adjust length as needed

  const positions = rayLine.geometry.attributes.position.array;
  positions[0] = startPoint.x;
  positions[1] = startPoint.y;
  positions[2] = startPoint.z;
  positions[3] = endPoint.x;
  positions[4] = endPoint.y;
  positions[5] = endPoint.z;
  rayLine.geometry.attributes.position.needsUpdate = true;


  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(polygons, true); // Only check polygons

  // console.log("Intersected Objects:", intersects.length); // Log the number of intersections

  if (intersects.length > 0) {
    let intersected = intersects[0].object;
    if (intersected.name.startsWith('polygon-')) {
      intersected.material.opacity = 1.0; // Full opacity when hovered
    }
  } else if (intersectedObject) {
    intersectedObject.material.opacity = 0.2; // Lower opacity when not hovered
    intersectedObject = null;
  }
}



// Function to animate your scene
function animate() {
    requestAnimationFrame(animate);
    // checkIntersection(); // Check for mouse-polygon intersection
    controls.update();
    // Rotate the camera if isCameraRotating is true
    // Check if camera and controls are initialized
    if (camera && controls) {
      if (isCameraRotating) {
          // Calculate the distance to the target
          const distanceToTarget = camera.position.distanceTo(controls.target);
          const angle = rotationSpeed; // Define the angle for rotation

          // Calculate the new position
          const relativePosition = new THREE.Vector3().subVectors(camera.position, controls.target);
          const axis = new THREE.Vector3(0, 0, 1); // Z-axis for rotation
          const quaternion = new THREE.Quaternion().setFromAxisAngle(axis, angle);
          relativePosition.applyQuaternion(quaternion);

          // Apply the new position while maintaining the distance
          camera.position.copy(controls.target).add(relativePosition.setLength(distanceToTarget));

          // Ensure the camera keeps looking at the target
          camera.lookAt(controls.target);
      }
  }
  // Log camera distance from xyz
  // logCameraDistance();

  adjustMeshVisibilityBasedOnCameraDistance();
  renderer.render(scene, camera);

}

// Function to initialize the scene and other components
async function initialize() {
  initThreeJS(); // Initialize Three.js


  // Hide unnecessary elements on page load
  document.getElementById('start-button').style.display = 'none';
  document.getElementById('info-container').style.display = 'none';
  // document.getElementById('info-button').style.display = 'none';

  // Show the progress bar
  // document.getElementById('progress-bar').style.display = 'block';

  // Initialize sliderValue
  sliderValue = 0.2 + (parseFloat(document.getElementById('resolution-slider').value) / sliderLength) * 0.8;

  onWindowResize(); // Update the resolution
  updateResolutionDisplay(); // Update the display

  // Load GeoJSON data and then enable interaction
  loadGeoJSONData(() => {
    postLoadOperations(); // Setup the scene after critical datasets are loaded
    enableInteraction(); // Directly enable interaction without waiting for a button click
    // document.getElementById('progress-bar').style.display = 'none'; // Hide the progress bar
  });
}


function enableInteraction() {
  const threeContainer = document.getElementById('three-container');
  const infoButton = document.getElementById('info-button');

  // Render the scene once before making it visible
  renderer.render(scene, camera);

  // Use requestAnimationFrame to ensure the rendering is done
  requestAnimationFrame(() => {
    // Reveal the container and info button simultaneously
    threeContainer.style.visibility = 'visible';
    threeContainer.style.opacity = '1';
    threeContainer.style.pointerEvents = 'auto';

    infoButton.style.pointerEvents = 'auto';

    // Start the animation loop
    animate();
    lockCameraTopDown(false); // Ensure this is called after controls are initialized
    document.addEventListener('keydown', onDocumentKeyDown, false); // Attach the keydown event handler
  
  });
  
visualizationReady = true;

}


document.addEventListener('DOMContentLoaded', (event) => {

  const infoButton = document.getElementById('info-button');
  initialize();

});


/////////////////////////////////////
///////// MAP LEGEND ///////////////


// Function to hide the information container and show the info button
function hideInfoBox() {
  const infoContainer = document.getElementById('info-container');
  const infoButton = document.getElementById('info-button');

  infoContainer.style.opacity = '0'; // Start the fade out
  infoContainer.style.pointerEvents = 'none'; // Make it non-interactive immediately
  infoVisible = false;

  // Begin fade-in effect for the info-button
  infoButton.style.opacity = 0;
  infoButton.style.transition = 'opacity 10ms ease-in-out';
  infoButton.style.display = 'block';

  setTimeout(() => {
    infoButton.style.opacity = 1;
  }, 90); // Slight delay to ensure the transition effect is applied
}

// Add an event listener to the hide legend element
document.getElementById('hide-legend').addEventListener('click', hideInfoBox);


// Function to show the information container and hide the info button
function showInfoBox() {
  const infoContainer = document.getElementById('info-container');
  const infoButton = document.getElementById('info-button');
  infoContainer.style.opacity = '1'; // Start the fade in
  infoContainer.style.visibility = 'visible'; // Make it visible immediately
  infoContainer.style.pointerEvents = 'auto'; // Make it interactive again
  infoButton.style.display = 'none'; // Hide the info button
  infoContainer.style.display = 'block';
  infoVisible = true;
  infoContainer.classList.remove("hidden");
}

// Add the transitionend event listener
document.getElementById('info-container').addEventListener('transitionend', function(event) {
  if (event.propertyName === 'opacity' && getComputedStyle(this).opacity == 0) {
    this.style.visibility = 'hidden'; // Hide the container after transition
  }
});

// Set up event listeners for mousedown and keypress events to hide the info box
// Existing event listeners
document.addEventListener('mousedown', (event) => {
  // Get the info-container element
  const infoContainer = document.getElementById('info-container');

  // Check if the click is outside the info-container
  if (!infoContainer.contains(event.target) && event.target.id !== 'info-button') {
    hideInfoBox();
  }
});

document.addEventListener('keypress', hideInfoBox);


// Event listener for the info button to unhide the info box
document.getElementById('info-button').addEventListener('click', function () {
    showInfoBox();
});

// Function to toggle the wireframe mode of the cellServiceMesh
function toggleCellWireframe() {
  cellWireframe = !cellWireframe;

  cellServiceMesh.children.forEach(mesh => {
    if (mesh.material) {
      mesh.material.wireframe = cellWireframe;
      mesh.material.needsUpdate = true;
    }
  });
}


function logCameraDistance() {
  if (camera && controls && controls.target) {
    const distance = camera.position.distanceTo(controls.target);
    console.log("Camera distance to target:", distance);
  } else {
    console.log("Camera or controls not defined.");
  }
}



// Function to add checkboxes for layer visibility control
function addLayerVisibilityControls() {
  const legendControls = document.getElementById('legend-controls'); // Targeting the new div
  const layers = [
    { name: 'fm transmitter points', color: colorScheme.pyramidColorFM },
    { name: 'fm minimum spanning tree lines', color: colorScheme.mstFmColor },
    { name: 'cell transmitter points', color: colorScheme.pyramidColorCellular },
    { name: 'cell MST lines', color: colorScheme.mstCellColor },
    { name: 'contour lines', color: colorScheme.contoursLabelColor },
    // { name: 'fm propagation curves', color: colorScheme.polygonColor },
    { name: 'cell dead zones', color: colorScheme.cellColor },
    { name: 'analysis area', color: "#888888" }

  ];

  layers.forEach(layer => {
    const container = document.createElement('div');
    container.className = 'custom-checkbox-container';

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.id = layer.name;
    checkbox.className = 'hidden-checkbox';
    checkbox.checked = true;

    const label = document.createElement('label');
    label.htmlFor = layer.name;
    label.className = 'custom-checkbox-label';

    const customCheckbox = document.createElement('span');
    customCheckbox.className = 'custom-checkbox';

    const labelText = document.createElement('span');
    labelText.textContent = layer.name;
    labelText.style.color = layer.color; // Set the text color

    label.appendChild(customCheckbox);
    label.appendChild(labelText);

    container.appendChild(checkbox);
    container.appendChild(label);
    legendControls.appendChild(container);

    // Add event listener to toggle layer visibility
    checkbox.addEventListener('change', function() {
      // console.log(`Toggling visibility for ${layer.name}`);
      toggleLayerVisibility(layer.name, this.checked);
    });

    // Adjust initial checkbox state for a few
    if (layer.name === 'a' || layer.name === 'b' || layer.name === 'c') {
      checkbox.checked = false; // Set checkbox to unchecked for this layer
    }    

  });
}



// You can then map these to the names used in the checkboxes
const layerObjects = {
  'fm transmitter points': fmTransmitterPoints,
  'fm minimum spanning tree lines': fmMSTLines,
  'cell transmitter points': cellTransmitterPoints,
  'cell MST lines': cellMSTLines,
  'contour lines': contourLines,
  // 'fm propagation curves': propagationPolygons,
  'cell dead zones': cellServiceMesh,
  'analysis area': analysisArea

};

function toggleCellServiceMeshVisibility(isVisible) {
  cellServiceMesh.visible = isVisible;
  cellServiceMesh.children.forEach(group => {
      group.children.forEach(mesh => {
          mesh.visible = isVisible;
      });
  });
}

// Function to toggle layer visibility
function toggleLayerVisibility(layerName, isVisible) {
  if (layerObjects[layerName]) {
    layerObjects[layerName].visible = isVisible;

    // Special handling for cellServiceMesh
    if (layerName === 'cell dead zones') {
      cellServiceMesh.children.forEach(group => {
        group.visible = isVisible; // Set visibility for each group
        group.children.forEach(mesh => {
          mesh.visible = isVisible; // Set visibility for each mesh within the group
        });
      });
    }

    // Update the checkbox state
    const checkbox = document.getElementById(layerName);
    if (checkbox) {
      checkbox.checked = isVisible;
    }
  } else {
    console.warn(`Layer "${layerName}" not found in the scene.`);
  }

  renderer.render(scene, camera);
}

///////////////////////////////////////////////////////
// AUDIO LISTENERS ///////////////////////////////////

// Declare the audioListener at the top level so it's accessible everywhere
let audioListener;

// Add a user gesture event listener to resume the audio context
document.addEventListener('click', function initAudio() {
  // Check if audioListener is already initialized to avoid multiple initializations
  if (!audioListener) {
    audioListener = new THREE.AudioListener();
    camera.add(audioListener);
    // Resume the audio context if it's not in the running state
    if (audioListener.context.state === 'suspended') {
      audioListener.context.resume();
    }
  }
  // Remove the event listener after the initial interaction
  document.removeEventListener('click', initAudio);
});

///////////////////////////////////////////////////
// MOUSEOVER TRANSITIONS /////////////////////////

// add mouseover polygon opacity shifts &
// reduce mouseover event listener transactions
let debounceTimer;
const debounceInterval = 100; // milliseconds

let intersectedObject = null;

function onMouseMove(event) {
  // Update the mouse position
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  // console.log("Mouse moved:", mouse.x, mouse.y); // Log mouse position

  // Perform raycasting less frequently
  if (!intersectedObject) {
    checkIntersection();
  }
}

window.addEventListener('mousemove', onMouseMove, false);

///////////////////////////////////////////////////// 
// CAMERA SETTINGS AND CONTROLS ////////////////////

// Define pan speed
const panSpeed = .05;

// Function to handle keyboard events for panning
function onDocumentKeyDown(event) {
  // Handle layer visibility toggling
  switch (event.key) {
      case '1':
          toggleLayerVisibility('fm transmitter points', !layerObjects['fm transmitter points'].visible);
          break;
      case '2':
          toggleLayerVisibility('fm minimum spanning tree lines', !layerObjects['fm minimum spanning tree lines'].visible);
          break;
      case '3':
          toggleLayerVisibility('cell transmitter points', !layerObjects['cell transmitter points'].visible);
          break;
      case '4':
          toggleLayerVisibility('cell MST lines', !layerObjects['cell MST lines'].visible);
          break;
      case '5':
          toggleLayerVisibility('contour lines', !layerObjects['contour lines'].visible);
          break;
      case '6':
          toggleLayerVisibility('fm propagation curves', !layerObjects['fm propagation curves'].visible);
          break;
      case '7':
        // Toggle visibility directly
        cellServiceMesh.visible = !cellServiceMesh.visible;
        cellServiceMesh.children.forEach(group => {
            group.visible = cellServiceMesh.visible; // Apply the same visibility to each group
            group.children.forEach(mesh => mesh.visible = cellServiceMesh.visible); // Apply to each mesh
        });

        // console.log(`Cell Service Mesh visibility: ${cellServiceMesh.visible}`);

        // Optionally, update the checkbox state to reflect this change
        const checkbox = document.getElementById('cell dead zones');
        if (checkbox) checkbox.checked = cellServiceMesh.visible;

        break;
        case '8':
          toggleLayerVisibility('analysis area', !layerObjects['analysis area'].visible);
          break;

                        
      // Add other cases for different layers as needed
  }



  // Handle camera movement and rotation
  const rotationSpeed = 0.0002; // Speed of rotation
  const vector = new THREE.Vector3();
  const axis = new THREE.Vector3(1, 0, 0); // X axis for world space rotation

  switch (event.key) {
      case 'q': // Change this key as needed
      toggleCellWireframe();
      break;
      case 'w':
          camera.position.y += panSpeed;
          controls.target.y += panSpeed;
          break;
      case 's':
          camera.position.y -= panSpeed;
          controls.target.y -= panSpeed;
          break;
      case 'a':
          camera.position.x -= panSpeed;
          controls.target.x -= panSpeed;
          break;
      case 'd':
          camera.position.x += panSpeed;
          controls.target.x += panSpeed;
          break;
      case 'g': // Rotate counter-clockwise
      case 't': // Rotate clockwise
          const angle = (event.key === 'g' ? 1 : -1) * rotationSpeed;
          vector.copy(camera.position).sub(controls.target);
          const currentPolarAngle = vector.angleTo(new THREE.Vector3(0, 0, 1));
          const newPolarAngle = currentPolarAngle + angle;

          if (newPolarAngle >= 0 && newPolarAngle <= Math.PI / 2) {
              const quaternion = new THREE.Quaternion().setFromAxisAngle(axis, angle);
              vector.applyQuaternion(quaternion);
              camera.position.copy(controls.target).add(vector);
              camera.lookAt(controls.target);
          }
          break;
          
  }

  if (event.key === 'y' || event.key === 'Y') {
    isCameraRotating = !isCameraRotating; // Toggle rotation
    event.preventDefault();
    return; // Exit to avoid interfering with other keys
}



  controls.update();
  // event.preventDefault(); // Optionally prevent default action for all key presses
}

document.addEventListener('keydown', onDocumentKeyDown, false);


// Function to adjust the mesh visibility based on the camera distance aka SCALE DEPENDENCY!
function adjustMeshVisibilityBasedOnCameraDistance() {
  if (camera && controls && controls.target) {
    const distanceToTarget = camera.position.distanceTo(controls.target);
    const threshold = 5;

    cellServiceMesh.visible = distanceToTarget <= threshold;
  } else {
    console.log("Camera or controls not defined.");
  }
}

// Define pan speed
const minPanSpeed = 0.05; // Minimum panning speed (when zoomed out)
const maxPanSpeed = 0.2;  // Maximum panning speed (when zoomed in)

// Function to handle panning with dynamic speed
function panCamera(dx, dy) {
  // Calculate dynamic pan speed based on camera's distance from the target
  const distance = camera.position.distanceTo(controls.target);
  const panSpeed = THREE.MathUtils.lerp(maxPanSpeed, minPanSpeed, distance / controls.maxDistance);

  // Apply the calculated pan speed
  const deltaX = dx * panSpeed;
  const deltaY = dy * panSpeed;

  camera.position.x += deltaX;
  camera.position.y += deltaY;
  controls.target.x += deltaX;
  controls.target.y += deltaY;

  controls.update();
}

function getBoundingBoxOfGeoJSON(geojson) {
  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;

  // Function to process each coordinate pair
  const processCoordinates = (coords) => {
    coords.forEach(coord => {
      // If it's a MultiLineString, coord will be an array of coordinate pairs
      if (Array.isArray(coord[0])) {
        processCoordinates(coord); // Recursive call for arrays of coordinates
      } else {
        // Assuming coord is [longitude, latitude]
        const [lon, lat] = coord;

        // Transform the coordinates
        const [x, y] = toStatePlane(lon, lat);

        // Update the min and max values
        minX = Math.min(minX, x);
        maxX = Math.max(maxX, x);
        minY = Math.min(minY, y);
        maxY = Math.max(maxY, y);
      }
    });
  };

  // Iterate over each feature
  geojson.features.forEach(feature => {
    processCoordinates(feature.geometry.coordinates);
  });

  // Return bounding box with min and max as THREE.Vector3 objects
  return {
    min: new THREE.Vector3(minX - 2, minY - 2, -Infinity),
    max: new THREE.Vector3(maxX + 2, maxY + 2, Infinity)
  };
}


function constrainCamera(controls, boundingBox) {
  controls.addEventListener('change', () => {
      // Recalculate the distance to the target
      const distance = camera.position.distanceTo(controls.target);

      // Apply bounding box constraints
      camera.position.clamp(boundingBox.min, boundingBox.max);
      controls.target.clamp(boundingBox.min, boundingBox.max);

      // Reapply the distance to maintain zoom level
      const direction = new THREE.Vector3().subVectors(camera.position, controls.target).normalize();
      camera.position.copy(controls.target).add(direction.multiplyScalar(distance));
  });
}


// Function to get the center of the bounding box
// This function is correct but make sure it's called after the lines are added to the scene
function getCenterOfBoundingBox(boundingBox) {
  return new THREE.Vector3(
    (boundingBox.min.x + boundingBox.max.x) / 2,
    (boundingBox.min.y + boundingBox.max.y) / 2,
    0 // Assuming Z is not important for centering in this case
  );
}

// Ensure that you get the size correctly
function getSizeOfBoundingBox(boundingBox) {
  return new THREE.Vector3(
    boundingBox.max.x - boundingBox.min.x,
    boundingBox.max.y - boundingBox.min.y,
    boundingBox.max.z - boundingBox.min.z
  );
}

// Adjust the camera to view the entire extent of the GeoJSON features
// function adjustCameraToBoundingBox(camera, controls, boundingBox) {
//   const center = getCenterOfBoundingBox(boundingBox);
//   const size = getSizeOfBoundingBox(boundingBox);
//   const maxDim = Math.max(size.x, size.y);
//   const fov = camera.fov * (Math.PI / 180);
//   let cameraZ = Math.abs(maxDim / 2 / Math.tan(fov / 2)); // Adjust the 2 to frame the scene

//   cameraZ *= 1.1; // Slight adjustment to ensure the features are fully visible
//   camera.position.set(center.x, center.y, cameraZ);
//   controls.target.set(center.x, center.y, 0);
//   controls.update();
// }

// Function to lock the camera to a top-down view
// Function to calculate the camera Z position to view the entire bounding box
function calculateCameraZToFitBoundingBox(boundingBox) {
  const center = getCenterOfBoundingBox(boundingBox);
  const size = getSizeOfBoundingBox(boundingBox);
  const maxDim = Math.max(size.x, size.y);
  const fov = camera.fov * (Math.PI / 100);
  
  // Calculate the Z position where the entire bounding box is in view
  let cameraZ = Math.abs(maxDim / 2 / Math.tan(fov / 2));
  cameraZ *= 1.1; // Scale factor to ensure everything is within view, adjust as needed
  return cameraZ;
}

function lockCameraTopDown(isLocked) {
  isCameraLocked = isLocked;
  if (!controls || !camera) return; // Ensure controls and camera are initialized

  if (isLocked) {
    if (!globalBoundingBox) {
      console.error('globalBoundingBox is not set');
      return;
    }
    const center = getCenterOfBoundingBox(globalBoundingBox);
    const cameraZ = calculateCameraZToFitBoundingBox(globalBoundingBox);

    // Position the camera at the center of the bounding box at the appropriate Z height
    camera.position.set(center.x, center.y, cameraZ);

    // Point the camera straight down by looking at the center of the bounding box
    camera.lookAt(center.x, center.y, 0);

    // Calculate north direction in the State Plane coordinate system
    // Adjust this vector if your north direction is different
    const northDirection = new THREE.Vector3(0, 1, 0);

    // Rotate the camera to face north by setting the up vector
    camera.up.copy(northDirection);
    camera.up.set(0, 1, 0); 
    camera.lookAt(center); // Look at the center again to apply the up vector

    // With MapControls, the camera.up is typically (0, 1, 0) and should not need changing
    controls.enablePan = true; // Enable panning
    controls.enableRotate = false; // Disable rotation
    controls.update();
  } else {
    // Restore interactive rotation if desired when not locked
    camera.up.set(0, 0, 1); 
    controls.enableRotate = true;
    controls.update();
  }
}



// Call this function initially to set up the default state
lockCameraTopDown(false);


// // Update the checkbox event listener to pass the boundingBox
// // In your event listeners
// document.getElementById('camera-lock').addEventListener('change', (event) => {
//   lockCameraTopDown(event.target.checked);
// });


// // Add this event listener to stop the propagation of the click event
// document.getElementById('camera-lock').addEventListener('click', (event) => {
//   event.stopPropagation(); // This will prevent the click from reaching the document level
// });

///////////////////////////////////////////////////// 
// GEOGRAPHIC DATA VIS /////////////////////////////

// Define a scaling factor for the Z values (elevation)
const zScale = 0.00035; // Change this value to scale the elevation up or down

// Function to get color based on elevation
function getColorForElevation(elevation, minElevation, maxElevation) {
  const gradient = [
    { stop: 0.0, color: new THREE.Color("#0000ff") }, // Blue at the lowest
    { stop: 0.2, color: new THREE.Color("#007fff") }, // Lighter blue
    { stop: 0.4, color: new THREE.Color("#00ff95") }, // Cyan-ish blue
    { stop: 0.5, color: new THREE.Color("#00ff00") }, // Green at the middle
    { stop: 0.6, color: new THREE.Color("#bfff00") }, // Yellow-green
    { stop: 0.8, color: new THREE.Color("#ffbf00") }, // Orange
    { stop: 1.0, color: new THREE.Color("#ff0000") }  // Red at the highest
  ];

  const t = (elevation - minElevation) / (maxElevation - minElevation);

  let lowerStop = gradient[0], upperStop = gradient[gradient.length - 1];
  for (let i = 0; i < gradient.length - 1; i++) {
    if (t >= gradient[i].stop && t <= gradient[i + 1].stop) {
      lowerStop = gradient[i];
      upperStop = gradient[i + 1];
      break;
    }
  }

  const color = lowerStop.color.clone().lerp(upperStop.color, (t - lowerStop.stop) / (upperStop.stop - lowerStop.stop));
  return color;
}


// Define a variable to store the minimum elevation
// This should be determined from the addContourLines function
let globalMinElevation = Infinity;

// Updated addContourLines function to update globalMinElevation
function addContourLines(geojson) {
  return new Promise((resolve, reject) => {
    if (!geojson || !geojson.features) {
      reject('Invalid GeoJSON data');
      return;
    }

    // Determine min and max elevation from the geojson
    const elevations = geojson.features.map(f => f.properties.contour);
    const minElevation = Math.min(...elevations);
    globalMinElevation = Math.min(globalMinElevation, minElevation); // Update the global minimum elevation
    const maxElevation = Math.max(...elevations);

    geojson.features.forEach((feature, index) => {
      const contour = feature.properties.contour; // Elevation value
      const coordinates = feature.geometry.coordinates; // Array of [lon, lat] pairs

      const color = getColorForElevation(contour, minElevation, maxElevation);
      let material = new THREE.LineBasicMaterial({ color: color });

      // Function to process a single line
      const processLine = (lineCoords, contourValue) => {
        let vertices = [];
        lineCoords.forEach((pair) => {
          if (!Array.isArray(pair) || pair.length !== 2 || pair.some(c => isNaN(c))) {
            console.error(`Feature ${index} has invalid coordinates`, pair);
            return;
          }
          const [lon, lat] = pair;
          try {
            const [x, y] = toStatePlane(lon, lat);
            const z = contourValue * zScale; // Scale the elevation for visibility
            vertices.push(x, y, z);
          } catch (error) {
            console.error(`Feature ${index} error in toStatePlane:`, error.message);
          }
        });

        if (vertices.length > 0) {
          const geometry = new THREE.BufferGeometry();
          geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
          const line = new THREE.Line(geometry, material);
          contourLines.add(line);
        }
      };

      // Check geometry type and process accordingly
      if (feature.geometry.type === 'LineString') {
        processLine(coordinates, contour);
      } else if (feature.geometry.type === 'MultiLineString') {
        coordinates.forEach(lineCoords => {
          processLine(lineCoords, contour);
        });
      } else {
        console.error(`Unsupported geometry type: ${feature.geometry.type}`);
      }
    });

    try {
      scene.add(contourLines); // Add the group to the scene
      resolve(); // Resolve the promise when done
    } catch (error) {
      reject(`Error in addContourLines: ${error.message}`);
    }
  });
}

function addCellServiceMesh(geojson, stride = 3) {
  return new Promise((resolve, reject) => {
    try {
      // Reset/clear the group to avoid adding duplicate meshes
      cellServiceMesh.clear();

      // Downsample and group points by 'group_ID'
      const groups = {};
      for (let i = 0; i < geojson.features.length; i += stride) {
        const feature = geojson.features[i];
        const groupId = feature.properties.Group_ID;
        const [lon, lat] = feature.geometry.coordinates;
        const [x, y] = toStatePlane(lon, lat); // Project to State Plane
        const z = feature.properties.Z * zScale; // Apply Z scaling

        if (!groups[groupId]) {
          groups[groupId] = [];
        }
        groups[groupId].push(new THREE.Vector3(x, y, z));
      }

      // Process each group separately and create meshes
      Object.keys(groups).forEach(groupId => {
        const pointsForDelaunay = groups[groupId];

        var delaunay = Delaunator.from(pointsForDelaunay.map(p => [p.x, p.y]));
        var meshIndex = [];
        const thresholdDistance = 0.125; // Set your distance threshold here

        for (let i = 0; i < delaunay.triangles.length; i += 3) {
          const p1 = pointsForDelaunay[delaunay.triangles[i]];
          const p2 = pointsForDelaunay[delaunay.triangles[i + 1]];
          const p3 = pointsForDelaunay[delaunay.triangles[i + 2]];

          // Check distances between each pair of points in a triangle
          if (distanceBetweenPoints(p1, p2) <= thresholdDistance &&
              distanceBetweenPoints(p2, p3) <= thresholdDistance &&
              distanceBetweenPoints(p3, p1) <= thresholdDistance) {
            meshIndex.push(delaunay.triangles[i], delaunay.triangles[i + 1], delaunay.triangles[i + 2]);
          }
        }

        var geom = new THREE.BufferGeometry().setFromPoints(pointsForDelaunay);
        geom.setIndex(meshIndex);
        geom.computeVertexNormals();

        // Solid fill material (black fill)
        const fillMaterial = new THREE.MeshBasicMaterial({
          color: 0x000000, // Black color for the fill
          transparent: false,
          // opacity: 0.75, // Adjust opacity as needed
          // alphaHash: true,
          side: THREE.DoubleSide // 
        });

        // Wireframe material
        const wireframeMaterial = new THREE.MeshBasicMaterial({
          color: colorScheme.cellColor, // Use your existing color scheme
          transparent: true,
          opacity: 0.6,
          wireframe: true,
          side: THREE.FrontSide
        });
        
        // Create mesh with the fill material
        var fillMesh = new THREE.Mesh(geom, fillMaterial);
        fillMesh.name = 'fillMesh-' + groupId;

        // Create mesh with the wireframe material
        var wireframeMesh = new THREE.Mesh(geom, wireframeMaterial);
        wireframeMesh.name = 'wireframeMesh-' + groupId;

        // Group to hold both meshes
        var group = new THREE.Group();
        // group.add(fillMesh);
        group.add(wireframeMesh);

        // Add the group to the cellServiceMesh group
        cellServiceMesh.add(group);
      });

      // Add the cellServiceMesh group to the scene
      scene.add(cellServiceMesh);

      // Set the initial visibility of the cell service mesh layer to false
      cellServiceMesh.visible = false;

      resolve(cellServiceMesh); // Optionally return the group for further manipulation
    } catch (error) {
      reject(`Error in addCellServiceMesh: ${error.message}`);
    }
  });
}


function addPolygons(geojson, stride = 10) {
  return new Promise((resolve, reject) => {
    try {

  for (let i = 0; i < geojson.features.length; i += stride) {
    const feature = geojson.features[i];

    // Create a new material for each polygon
    const material = new THREE.MeshBasicMaterial({
      color: colorScheme.polygonColor,
      transparent: true,
      wireframe: true,
      dithering: true,
      opacity: 0.8, // Start with lower opacity
      side: THREE.FrontSide
    });

    try {
      const shapeCoords = feature.geometry.coordinates[0]; // Assuming no holes in the polygon for simplicity
      const vertices = [];
      let centroid = new THREE.Vector3(0, 0, 0);

      // Convert coordinates to vertices and calculate centroid
      shapeCoords.forEach(coord => {
        const [x, y] = toStatePlane(coord[0], coord[1]);
        const z = globalMinElevation * zScale; // Set Z to the lowest contour elevation
        vertices.push(new THREE.Vector3(x, y, z));
        centroid.add(new THREE.Vector3(x, y, z));
      });

      centroid.divideScalar(shapeCoords.length); // Average to find centroid
      vertices.unshift(centroid); // Add centroid as the first vertex

      const shapeGeometry = new THREE.BufferGeometry();
      const positions = [];

      // The centroid is the first vertex, and it's connected to every other vertex
      for (let j = 1; j <= shapeCoords.length; j++) {
        // Add centroid
        positions.push(centroid.x, centroid.y, centroid.z);

        // Add current vertex
        positions.push(vertices[j % shapeCoords.length].x, vertices[j % shapeCoords.length].y, vertices[j % shapeCoords.length].z);

        // Add next vertex
        positions.push(vertices[(j + 1) % shapeCoords.length].x, vertices[(j + 1) % shapeCoords.length].y, vertices[(j + 1) % shapeCoords.length].z);
      }

      shapeGeometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
      shapeGeometry.computeVertexNormals();

      const mesh = new THREE.Mesh(shapeGeometry, material);
      mesh.name = 'polygon-' + i;
      scene.add(mesh);
      propagationPolygons.add(mesh);
    } catch (error) {
      // console.error(`Error processing feature at index ${i}:`, error);
    }
  }
      // Add the propagationPolygons group to the scene
      scene.add(propagationPolygons);

      // Set the initial visibility of the fm propagation curves layer to false
      propagationPolygons.visible = false;

      resolve(); // Resolve the promise when done
    } catch (error) {
      reject(`Error in addPolygons: ${error.message}`);
    }
  });
}


function addFMTowerPts(geojson) {
  return new Promise((resolve, reject) => {
    try {
      // Define the base size and height for the pyramids
      const baseSize = 0.003; // Size of one side of the pyramid's base
      const pyramidHeight = .015; // Height of the pyramid from the base to the tip

      // Material for the wireframe pyramids
      let pyramidMaterialFM = new THREE.MeshBasicMaterial({
        color: colorScheme.pyramidColorFM,
        wireframe: true,
        transparent: true,
        opacity: 0.5
      });

      const points = []; // Array to store points for the convex hull

      // Parse the POINT data from the GeoJSON
      geojson.features.forEach(feature => {
        if (feature.geometry.type === 'Point') {
          const [lon, lat] = feature.geometry.coordinates;
          const elevation = feature.properties.Z;

          try {
            // Convert the lon/lat to State Plane coordinates
            const [x, y] = toStatePlane(lon, lat);
            const z = elevation * zScale; // Apply the scaling factor to the elevation

            // Check for valid coordinates before proceeding
            if (x === null || y === null || isNaN(z)) {
              console.error('Invalid point coordinates:', x, y, z);
              return; // Skip this iteration
            }

            // Create a cone geometry for the pyramid
            const pyramidGeometry = new THREE.ConeGeometry(baseSize, pyramidHeight, 5);
            pyramidGeometry.rotateX(Math.PI / 2); // Rotate the pyramid to point up along the Z-axis

            const pyramid = new THREE.Mesh(pyramidGeometry, pyramidMaterialFM);
            pyramid.position.set(x, y, z);
            fmTransmitterPoints.add(pyramid);
    
        // Check for coincident points and get a z-offset
        const label = `fm`;
        const zOffset = getCoincidentPointOffset(lon, lat, 8, 0.00001);
        // const zOffset = getCoincidentPointOffset(lon, lat, label, 4, 0.0001);


        // Ensure Callsign or another property is correctly referenced
        // const label = feature.properties.Callsign || `Tower ${index}`;

        const textSprite = makeTextSprite(` ${label} `, {
        
          fontsize: 24,
          strokeColor: "rgba(255, 255, 255, 0.9)",
          strokeWidth: 1,

          // borderColor: { r: 255, g: 0, b: 0, a: 1.0 },
          // backgroundColor: { r: 255, g: 100, b: 100, a: 0.8 }
        });
    
        // Position the sprite above the pyramid
        const pyramidHeightScaled = pyramidHeight * zScale;

        // Position the sprite above the pyramid, applying the offset for coincident points
        textSprite.position.set(x, y, z + pyramidHeightScaled + zOffset + 0.009);
        textSprite.scale.set(0.05, 0.025, 1.0);
    

        fmTransmitterPoints.add(textSprite);
        // console.log(`creating label for ${label}`);

      // Add the position to the points array for convex hull calculation
        points.push(new THREE.Vector3(x, y, z));

          } catch (error) {
            console.error(`Error projecting point: ${error.message}`);
          }
        } else {
          console.error(`Unsupported geometry type for points: ${feature.geometry.type}`);
        }
      });

      // Add the FM points to the scene
      scene.add(fmTransmitterPoints);
      fmTransmitterPoints.visible = true;


      // Create and add the convex hull to the scene
      if (points.length > 0) {
        // Additional checks and functionality as needed...

        // Construct the MST
        const fmMstEdges = primsAlgorithm(points);

        // Draw the MST
        drawMSTEdges(fmMstEdges, '#FFFFFF', colorScheme.mstFmColor, 0.00025, 0.00075, fmMSTLines);
      }

      // Add the MST lines to the scene
      scene.add(fmMSTLines);
      fmMSTLines.visible = true;
      resolve(); // Resolve the promise when done
    } catch (error) {
      console.error('Error in addFMTowerPts:', error);
      reject(`Error in addFMTowerPts: ${error.message}`);
    }
  });
}

// Function to add wireframe pyramids and text labels for POINT data from GeoJSON
function addCellTowerPts(geojson, audioListener, buffer) {
  return new Promise((resolve, reject) => {
    try {

  // Define the base size and height for the pyramids
  const baseSize = 0.003; // This would be the size of one side of the pyramid's base
  const pyramidHeight = .015; // This would be the height of the pyramid from the base to the tip

  // Material for the wireframe pyramids
  let pyramidMaterialCellular = new THREE.MeshBasicMaterial({
    color: colorScheme.pyramidColorCellular,
    wireframe: true,
    transparent: true,
    opacity: 0.4
  });

  const points = []; // Array to store points for the convex hull

// Parse the POINT data from the GeoJSON
geojson.features.forEach((feature, index) => {
  if (feature.geometry.type === 'Point') {
    // Directly use the coordinates array
    const [lon, lat] = feature.geometry.coordinates;
    const elevation = feature.properties.Z;

      try {
        // Convert the lon/lat to State Plane coordinates
        const [x, y] = toStatePlane(lon, lat);
        const z = elevation * zScale; // Apply the scaling factor to the elevation

        // Create a cone geometry for the pyramid with the defined base size and height
        const pyramidGeometry = new THREE.ConeGeometry(baseSize, pyramidHeight, 4);
        pyramidGeometry.rotateX(Math.PI / 2); // Rotate the pyramid to point up along the Z-axis

        const pyramid = new THREE.Mesh(pyramidGeometry, pyramidMaterialCellular);
        pyramid.position.set(x, y, z);
  
        // Add the pyramid to the cellTransmitterPoints group
        cellTransmitterPoints.add(pyramid);
  
        // // Positional audio
        // const sound = new THREE.PositionalAudio(audioListener);
        // sound.setBuffer(buffer);
        // sound.setRefDistance(1);
        // sound.setLoop(true);
        // sound.setVolume(0.5);
        // pyramid.add(sound); // Attach the sound to the pyramid mesh
        // sound.play(); // Start playing the sound

        // Check for coincident points and get a z-offset
        const label = `cell`;
        const zOffset = getCoincidentPointOffset(lon, lat, 8, 0.00001);
        // const zOffset = getCoincidentPointOffset(lon, lat, label, 4, 0.0001);


        // Ensure Callsign or another property is correctly referenced
        // const label = feature.properties.Callsign || `Tower ${index}`;

        const textSprite = makeTextSprite(` ${label} `, {
        
          fontsize: 24,
          strokeColor: "rgba(255, 255, 255, 0.9)",
          strokeWidth: 1,

          // borderColor: { r: 255, g: 0, b: 0, a: 1.0 },
          // backgroundColor: { r: 255, g: 100, b: 100, a: 0.8 }
        });
    
        // Position the sprite above the pyramid
        const pyramidHeightScaled = pyramidHeight * zScale;

        // Position the sprite above the pyramid, applying the offset for coincident points
        textSprite.position.set(x, y, z + pyramidHeightScaled + zOffset + 0.009);
        textSprite.scale.set(0.05, 0.025, 1.0);
    

        cellTransmitterPoints.add(textSprite); // Add the label to the cellTransmitterPoints group
        // console.log(`creating label for ${label}`);

        // Add the position to the points array for convex hull calculation
        points.push(new THREE.Vector3(x, y, z));

      } catch (error) {
        console.error(`Error projecting point:`, error.message);
      }
    } else {
      console.error(`Unsupported geometry type for points: ${feature.geometry.type}`);
    }
  });


  // Create and add the convex hull to the scene
  if (points.length > 0) {
    // createConvexHullLines(points);
    // console.log("creating convex hull with " + points)

    const cellMstEdges = primsAlgorithm(points);
    drawMSTEdges(cellMstEdges, '#FFFFFF', colorScheme.mstCellColor, 0.00025, 0.00075, cellMSTLines);
  }
  // add groups to scene
  scene.add(cellTransmitterPoints);
  scene.add(cellMSTLines);
  resolve(); // Resolve the promise when done
} catch (error) {
  reject(`Error in addCellTowerPts: ${error.message}`);
}
});
}


// Function to load and position the raster image
// function loadAndPositionRaster() {
//   const textureLoader = new THREE.TextureLoader();

//   // Define the corner coordinates of your raster image in lon/lat
//   const topLeftLonLat = [-76.6, 40.8]; // Replace with actual coordinates
//   const bottomRightLonLat = [-76.4, 40.6]; // Replace with actual coordinates

//   // Convert corner coordinates to State Plane coordinates
//   const topLeftSP = toStatePlane(...topLeftLonLat);
//   const bottomRightSP = toStatePlane(...bottomRightLonLat);

//   // Calculate the size and position based on converted coordinates
//   const width = Math.abs(topLeftSP[0] - bottomRightSP[0]);
//   const height = Math.abs(topLeftSP[1] - bottomRightSP[1]);
//   const positionX = (topLeftSP[0] + bottomRightSP[0]) / 2;
//   const positionY = (topLeftSP[1] + bottomRightSP[1]) / 2;

//   textureLoader.load('/Merged_Viewshed_NYS_Resample.jpg', function(texture) {
//     const geometry = new THREE.PlaneGeometry(width, height);
//     const material = new THREE.MeshBasicMaterial({ map: texture });
//     const rasterMesh = new THREE.Mesh(geometry, material);

//     // Set position based on converted State Plane coordinates
//     rasterMesh.position.set(positionX, positionY, 0);

//     scene.add(rasterMesh);
//   });
// }


function addGraticule(scene, boundingBox, gridSize, crossSize, scaleFactor = 2) {
  const material = new THREE.LineBasicMaterial({
    color: colorScheme.graticuleColor, 
    opacity: 0.2, 
    transparent: true 
  });
  const gridGroup = new THREE.Group();

  // Calculate center of bounding box
  const centerX = (boundingBox.min.x + boundingBox.max.x) / 2;
  const centerY = (boundingBox.min.y + boundingBox.max.y) / 2;

  // Calculate scaled bounding box
  const scaledMinX = centerX + (boundingBox.min.x - centerX) * scaleFactor;
  const scaledMaxX = centerX + (boundingBox.max.x - centerX) * scaleFactor;
  const scaledMinY = centerY + (boundingBox.min.y - centerY) * scaleFactor;
  const scaledMaxY = centerY + (boundingBox.max.y - centerY) * scaleFactor;

  // Loop over the scaled grid and create the plus signs
  for (let x = scaledMinX; x <= scaledMaxX; x += gridSize) {
      for (let y = scaledMinY; y <= scaledMaxY; y += gridSize) {
          // Horizontal line of the plus sign
          const horizontalVertices = [
              new THREE.Vector3(x - crossSize, y, 0),
              new THREE.Vector3(x + crossSize, y, 0)
          ];
          const horizontalGeometry = new THREE.BufferGeometry().setFromPoints(horizontalVertices);
          const horizontalLine = new THREE.Line(horizontalGeometry, material);
          gridGroup.add(horizontalLine);

          // Vertical line of the plus sign
          const verticalVertices = [
              new THREE.Vector3(x, y - crossSize, 0),
              new THREE.Vector3(x, y + crossSize, 0)
          ];
          const verticalGeometry = new THREE.BufferGeometry().setFromPoints(verticalVertices);
          const verticalLine = new THREE.Line(verticalGeometry, material);
          gridGroup.add(verticalLine);
      }
  }

  scene.add(gridGroup);
}

// Function to create a convex hull geometry from a set of points
function createConvexHullLines(points) {
  // Map points to the format expected by the convex hull library
  const formattedPoints = points.map(p => [p.x, p.y]);

  // Compute the convex hull indices
  const hullIndices = hull(formattedPoints);

  // Extract vertices from the hull indices
  const hullVertices = hullIndices.map(([i]) => points[i]);

  // Create line segments for each pair of successive vertices
  hullVertices.forEach((v, i) => {
    const nextV = hullVertices[(i + 1) % hullVertices.length]; // Wrap around to the first vertex

    // Create a buffer geometry for the line segment
    const geometry = new THREE.BufferGeometry().setFromPoints([v, nextV]);

    // Create the line and add it to the scene
    const material = new THREE.LineBasicMaterial({ color: 0xff0000 }); // Red color for the hull
    const line = new THREE.Line(geometry, material);
    scene.add(line);
  });
}

function primsAlgorithm(points) {
  const numPoints = points.length;
  const edges = new Array(numPoints);
  const visited = new Array(numPoints).fill(false);
  const minEdge = new Array(numPoints).fill(Infinity);

  // Arbitrary starting point
  minEdge[0] = 0;
  const parent = new Array(numPoints).fill(-1);

  for (let i = 0; i < numPoints - 1; i++) {
    let u = -1;

    for (let j = 0; j < numPoints; j++) {
      if (!visited[j] && (u === -1 || minEdge[j] < minEdge[u])) {
        u = j;
      }
    }

    visited[u] = true;

    for (let v = 0; v < numPoints; v++) {
      const dist = points[u].distanceTo(points[v]);

      if (!visited[v] && dist < minEdge[v]) {
        parent[v] = u;
        minEdge[v] = dist;
      }
    }
  }

  for (let i = 1; i < numPoints; i++) {
    edges[i - 1] = { from: points[parent[i]], to: points[i] };
  }

  return edges;
}

// Function to create and add MST lines with glow effect
function drawMSTEdges(mstEdges, coreColor, glowColor, coreRadius, glowRadius, targetGroup) {
  mstEdges.forEach(edge => {
    // Create a path for the edge
    const path = new THREE.CurvePath();
    path.add(new THREE.LineCurve3(edge.from, edge.to));

    // Core tube
    const coreGeometry = new THREE.TubeGeometry(path, 1, coreRadius, 8, false);
    const coreMaterial = new THREE.MeshBasicMaterial({ color: coreColor });
    const coreTube = new THREE.Mesh(coreGeometry, coreMaterial);
    targetGroup.add(coreTube);

    // Glow tube
    const glowGeometry = new THREE.TubeGeometry(path, 1, glowRadius, 8, false);
    const glowMaterial = new THREE.MeshBasicMaterial({ 
      color: glowColor, 
      transparent: true, 
      opacity: 0.5 
    });
    const glowTube = new THREE.Mesh(glowGeometry, glowMaterial);
    targetGroup.add(glowTube);
  });
}

// Function to visualize bounding box from GeoJSON
function visualizeBoundingBoxGeoJSON(geojson) {
  return new Promise((resolve, reject) => {
    try {
      const material = new THREE.LineBasicMaterial({ color: colorScheme.boundingBoxColor }); // bounding box color

      geojson.features.forEach(feature => {
        // Handle MultiLineString
        if (feature.geometry.type === "MultiLineString") {
          feature.geometry.coordinates.forEach(lineString => {
            const geometry = new THREE.BufferGeometry();
            const vertices = [];
            
            lineString.forEach(coord => {
              const [lon, lat] = coord;
              const [x, y] = toStatePlane(lon, lat);
              const z = zScale * 20;
              vertices.push(new THREE.Vector3(x, y, z));
            });

            geometry.setFromPoints(vertices);
            const line = new THREE.Line(geometry, material);
            scene.add(line);
            analysisArea.add(line);
          });
        }
        // Handle MultiPolygon
        else if (feature.geometry.type === "MultiPolygon") {
          feature.geometry.coordinates.forEach(polygon => {
            polygon.forEach(linearRing => {
              const geometry = new THREE.BufferGeometry();
              const vertices = [];

              linearRing.forEach(coord => {
                const [lon, lat] = coord;
                const [x, y] = toStatePlane(lon, lat);
                const z = zScale * 20;
                vertices.push(new THREE.Vector3(x, y, z));
              });

              // Close the loop for each linear ring
              if (linearRing.length > 2) {
                const [lon, lat] = linearRing[0];
                const [x, y] = toStatePlane(lon, lat);
                const z = zScale * 20;
                vertices.push(new THREE.Vector3(x, y, z));
              }

              geometry.setFromPoints(vertices);
              const line = new THREE.Line(geometry, material);
              scene.add(line);
              analysisArea.add(line);
            });
          });
        }
        // Add handling for other geometry types if necessary
      });

      scene.add(analysisArea);

      resolve(); // Resolve the promise when done
    } catch (error) {
      reject(`Error in visualizeBoundingBoxGeoJSON: ${error.message}`);
    }
  });
}



///////////////////////////////////////////////////// 
// AUDIO INIT //////////////////////////////////////


// // Define the audio loader and load the audio file
// const audioLoader = new THREE.AudioLoader();
let audioBuffer; // This will hold the loaded audio buffer

// // Then, inside the audio loader callback
// audioLoader.load('AKWF_0001.wav', function(buffer) {
//   // Store the loaded audio buffer for later use
//   audioBuffer = buffer;
//   // Once the audio is loaded, fetch the GeoJSON data
//   loadGeoJSONData();
// }, undefined, function(err) {
//   console.error('An error occurred while loading the audio file:', err);
// });


///////////////////////////////////////////////////// 
// CHECK FOR COINCIDENT POINTS IN GEOJSON //////////

const pointTracker = {};

// Helper function to generate a unique key for each point based on its coordinates and label content
function getPointKey(lon, lat, labelContent) {
  return `${lon.toFixed(4)}:${lat.toFixed(4)}:${labelContent}`;
}

// Function to check for coincident points and return an offset
function getCoincidentPointOffset(lon, lat, labelContent, precision = 4, tolerance = 0.0001) {
  const key = getPointKey(lon, lat, labelContent);
  if (!pointTracker[key]) {
    pointTracker[key] = { count: 1, labelContent }; // Initialize the tracker for this point
  } else {
    // Check if the label content is the same before incrementing the count
    if (pointTracker[key].labelContent === labelContent) {
      // If the label content is the same, do not apply an offset
      return 0;
    } else {
      pointTracker[key].count += 1; // Increment the counter if the point exists but with different content
    }
  }
  // Apply an offset only if the label contents are different
  return (pointTracker[key].count - 1) * tolerance; // The offset
}

///////////////////////////////////////////////////// 
// TEXT VISUALIZATION //////////////////////////////

function makeTextSprite(message, parameters) {
  if (parameters === undefined) parameters = {};
  
  var fontface = parameters.hasOwnProperty("fontface") ? 
    parameters["fontface"] : "Arial";
  
  var fontsize = parameters.hasOwnProperty("fontsize") ? 
    parameters["fontsize"] : 18;

  var strokeColor = parameters.hasOwnProperty("strokeColor") ? 
    parameters["strokeColor"] : "rgba(0, 0, 0, 0.8)";

  var canvas = document.createElement('canvas');
  var context = canvas.getContext('2d');

  // Scale the canvas size up to increase the resolution of the text
  var scale = window.devicePixelRatio; // Adjust to your needs
  canvas.width = 256 * scale;
  canvas.height = 128 * scale;
  context.scale(scale, scale);

  context.font = "Bold " + fontsize + "px " + fontface;
  
  // Set text fill style to transparent
  context.fillStyle = "rgba(255, 255, 255, 0.0)";

  // Set stroke style to the provided color or default black
  context.strokeStyle = strokeColor;
  context.lineWidth = parameters.hasOwnProperty("strokeWidth") ? 
    parameters["strokeWidth"] : 1; // Default to a width of N if not specified

  // Align text for centering
  context.textAlign = "center";
  context.textBaseline = "middle";

  // First stroke the text and then fill it to create the outline effect
  var x = canvas.width / (2 * scale);
  var y = canvas.height / (2 * scale);
  context.strokeText(message, x, y);
  context.fillText(message, x, y);

  var texture = new THREE.Texture(canvas);
  texture.needsUpdate = true;

  var spriteMaterial = new THREE.SpriteMaterial({
    map: texture,
    transparent: true,
    depthTest: false // Set to false to prevent the sprite from being occluded by other objects in the scene
  });
  
  var sprite = new THREE.Sprite(spriteMaterial);
  sprite.scale.set(0.5 * scale, 0.25 * scale, 1.0); // Scale the sprite to your preference
  
  return sprite;
}


///////////////////////////////////////////////////// 
// FETCH EXTERNAL DATA /////////////////////////////

// Fetching the contour lines GeoJSON and adding to the scene
async function loadGeoJSONData(onCriticalDataLoaded) {


  // console.log("loading...")
  const urls = [
    'data/stanford_contours_simplified1000m_20231124.geojson',
    'data/CellularTowers_FeaturesToJSON_HIFLD_AOI_20231204.geojson',
    // 'data/FM_contours_NYS_clip_20231101.geojson',
    'data/FmTowers_FeaturesToJSON_AOI_20231204.geojson',
    'data/study_area_admin0clip.geojson',
    'data/cellServiceCentroids_2000m_20231210.geojson'
  ];

  let criticalDatasetsLoaded = 0;
  const criticalDatasetsCount = 2; // Set this to the number of datasets critical for initial rendering

  urls.forEach(url => {
    fetch(url)
      .then(response => response.json())
      .then(data => {
        handleGeoJSONData(url, data);
        if (isCriticalDataset(url)) {
          criticalDatasetsLoaded++;
          if (criticalDatasetsLoaded === criticalDatasetsCount) {
            onCriticalDataLoaded(); 
          }
        }
      })
      .catch(error => {
        console.error(`Error loading ${url}:`, error);
      });
  });
}


function isCriticalDataset(url) {
  // Define logic to determine if a dataset is critical for initial rendering
  // todo: this breaks if the contours aren't required up front but they take longest to load
  return url.includes('stanford_contours') || url.includes('study');
}

let contourGeojsonData, cellTowerGeojsonData, fmContoursGeojsonData, fmTransmitterGeojsonData, boundingBoxGeojsonData, cellServiceGeojsonData

function handleGeoJSONData(url, data) {
  switch (url) {
    case 'data/stanford_contours_simplified1000m_20231124.geojson':
      contourGeojsonData = data;
      addContourLines(data);
      break;

    case 'data/CellularTowers_FeaturesToJSON_HIFLD_AOI_20231204.geojson':
      cellTowerGeojsonData = data;
      addCellTowerPts(data, audioListener, audioBuffer);
      break;

    // case 'data/FM_contours_NYS_clip_20231101.geojson':
    //   fmContoursGeojsonData = data;
    //   addPolygons(data);
    //   break;

    case 'data/FmTowers_FeaturesToJSON_AOI_20231204.geojson':
      fmTransmitterGeojsonData = data;
      addFMTowerPts(data);
      break;

    case 'data/study_area_admin0clip.geojson':
      boundingBoxGeojsonData = data;
      visualizeBoundingBoxGeoJSON(data);
      break;

    case 'data/NYS_cellTower_viewshed_20231130.jpg':
      viewshedJPG = data;
      loadAndPositionRaster(data);
      break;

    case 'data/cellServiceCentroids_2000m_20231210.geojson':
      cellServiceGeojsonData = data;
      addCellServiceMesh(data);
      break;
  
    default:
      console.warn('Unrecognized URL:', url);
      break;
  }
}

  function postLoadOperations() {
    const boundingBox = getBoundingBoxOfGeoJSON(contourGeojsonData);

    // Calculate center and size of bounding box
    const center = getCenterOfBoundingBox(boundingBox);
    const size = getSizeOfBoundingBox(boundingBox);
    const maxDim = Math.max(size.x, size.y);

    // Adjust camera Z to be closer
    const fov = camera.fov * (Math.PI / 100);
    let cameraZ = Math.abs(maxDim / 2 / Math.tan(fov / 2));
    cameraZ *= 0.15; // Decrease this factor to move the camera closer

    // Adjust tilt angle
    const tiltAngle = THREE.MathUtils.degToRad(40); // Example: 30 degree tilt
    const distance = cameraZ; // Use the calculated camera distance
    camera.position.set(
        center.x + distance * Math.sin(tiltAngle), // x position
        center.y,                                 // y position
        center.z + distance * Math.cos(tiltAngle)  // z position (height)
    );

    // Set controls target to the center of bounding box
    controls.target.set(center.x - 0.05, center.y - 0.02, 0);

    // Apply constraints to camera and update controls
    constrainCamera(controls, boundingBox);
    controls.update();

    // Reveal the start button after setting up the camera
    document.getElementById('start-container').style.display = 'block';
  }
}

// Export visualizationReady for access from main.js
export { visualizationReady };