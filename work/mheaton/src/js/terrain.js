import p5 from 'p5';

export function terrain(containerId) {

  new p5((p) => {
    let cols, rows;
    let scl; // Scale of each cell in the grid
    let w, h; // Width and height of the terrain
    let margin; // margin percentage
    let terrain = [];
    let noiseOffsetX = 180;
    let noiseOffsetY = 90;
    let noiseChangeSpeed = 0.003; // Speed at which the terrain changes
    let thresh = p.random(20, 25);
    let useCA = false; // false for Perlin noise, true for CA
    // Initialize with random rotations
    let xRotation = p.random(0.75, 1.25); // Random rotation around the X-axis
    let zRotation = p.random(-47, -46); // Random rotation around the Z-axis
    let rotateXAxis = true;
    let rotateZAxis = true; // to control rotation
    let divRect;
    let isDragging = false;
  
  
    function generateTerrain() {
      scl = 40;
      margin = 0.25; // N% margin
      w = p.windowWidth * (1 - 2 * margin); // Adjust for margin
      h = p.windowHeight * (1 - 2 * margin); // Adjust for margin
      cols = Math.floor(w / scl);
      rows = Math.floor(h / scl);
      terrain = [];
    
      for (let x = 0; x < cols; x++) {
        terrain[x] = [];
        for (let y = 0; y < rows; y++) {
          let elevation = p.map(p.noise(x * 0.1 + noiseOffsetX, y * 0.1 + noiseOffsetY), 0, 1, -100, 100);
    
          // Calculate the distortion factor based on distance to the mouse cursor
          let distance = p.dist(p.mouseX - w / 2, p.mouseY - h / 2, x * scl - w / 2, y * scl - h / 2);
          let distortionFactor = p.map(distance, 0, -30, 0.02, 0); // Adjust as needed - first pair is mouse distance, second is gravity
    
          terrain[x][y] = elevation + distortionFactor; // Apply distortion
        }
      }
            
      // Apply CA rules only if useCA is true
      if (useCA) {
        for (let x = 1; x < cols - 1; x++) {
          for (let y = 1; y < rows - 1; y++) {
            terrain[x][y] += applyCARules(x, y);
          }
        }
      }
    }
    

    let previousMouseX, previousMouseY;

    // Get the bounding rectangle of the container div
    let containerDiv = document.getElementById(containerId);
    divRect = containerDiv.getBoundingClientRect();

    let parentDiv = document.getElementById(containerId);
    let canvasDiv;

    // Update the mouseIsOverDiv function
    function mouseIsOverDiv() {
      let parentRect = parentDiv.getBoundingClientRect();
      let mouseXRelativeToParent = p.mouseX + parentRect.left;
      let mouseYRelativeToParent = p.mouseY + parentRect.top;

      return (
        mouseXRelativeToParent >= parentRect.left && mouseXRelativeToParent <= parentRect.right &&
        mouseYRelativeToParent >= parentRect.top && mouseYRelativeToParent <= parentRect.bottom
      );
    }

    // Attach the event listeners to the parent div
    parentDiv.addEventListener('mousedown', (event) => {
      // Calculate mouse position relative to the canvas
      let rect = canvasDiv.getBoundingClientRect();
      let mouseX = event.clientX - rect.left;
      let mouseY = event.clientY - rect.top;

      if (mouseIsOverDiv()) {
        isDragging = true;
        previousMouseX = mouseX;
        previousMouseY = mouseY;
      }
    });

    parentDiv.addEventListener('mousemove', (event) => {
      if (isDragging) {
        // Calculate mouse position relative to the canvas
        let rect = canvasDiv.getBoundingClientRect();
        let mouseX = event.clientX - rect.left;
        let mouseY = event.clientY - rect.top;

        let dx = mouseX - previousMouseX;
        let dy = mouseY - previousMouseY;

        xRotation += dy * 0.002;
        zRotation += dx * 0.002;

        previousMouseX = mouseX;
        previousMouseY = mouseY;
      }
    });

    parentDiv.addEventListener('mouseup', () => {
      isDragging = false;
    });


    
    p.keyPressed = () => {
      if (p.key === 'c') {
        useCA = !useCA;
        console.log(useCA)
        generateTerrain(); // Regenerate terrain with the new method
      }
      if (p.key === 'r' || p.key === 'R') {
        rotateXAxis = !rotateXAxis; // Toggle X-axis rotation
      }  
      if (p.key === 't' || p.key === 'T') {
        rotateZAxis = !rotateZAxis; // Toggle X-axis rotation
      }  
      if (p.keyCode === p.UP_ARROW) {
        xRotation -= 0.002; // Rotate up
      } else if (p.keyCode === p.DOWN_ARROW) {
        xRotation += 0.002; // Rotate down
      }
      if (p.keyCode === p.LEFT_ARROW) {
        zRotation -= 0.002; // Rotate up
      } else if (p.keyCode === p.RIGHT_ARROW) {
        zRotation += 0.002; // Rotate down
      }
  
      
    };
  
  
    function applyCARules(x, y) {
      let count = 0;
      let CARthreshold = 50; // Define a threshold for elevation
      let elevDelta = 10; // Define the elevation change value
    
      // Check neighbors within the grid
      for (let i = -1; i <= 1; i++) {
        for (let j = -1; j <= 1; j++) {
          let nx = x + i;
          let ny = y + j;
    
          // Skip the current cell and check bounds
          if ((i !== 0 || j !== 0) && nx >= 0 && nx < cols && ny >= 0 && ny < rows) {
            if (terrain[nx][ny] > CARthreshold) {
              count++;
            }
          }
        }
      }
    
      // Apply a simple rule based on the count
      if (count > 4) return elevDelta;
      else if (count < 2) return -elevDelta;
      return 0; // No change
    }  
  
    p.setup = () => {
      p.frameRate(12);
      let containerDiv = document.getElementById(containerId);
      if (containerDiv) {
        let rect = containerDiv.getBoundingClientRect();
        w = 400;
        h = 200;
      } else {
        console.warn(`Div with id ${containerId} not found. Using fallback size.`);
        w = window.innerWidth;
        h = window.innerHeight;
      }
    
      let canvas = p.createCanvas(w, h, p.WEBGL);
      canvas.parent(containerId);
    
      canvasDiv = p.canvas.parentElement; // Initialize canvasDiv here
    
      generateTerrain();
      p.colorMode(p.HSB);
      // Set up orthographic projection
      p.ortho(-p.width / 2, p.width / 2, -p.height / 2, p.height / 2, 0.1, 1000);
      p.redraw(); // Force an immediate redraw after setup
    };
    
  
    p.draw = () => {
      p.clear();  // This makes the background transparent
      p.rotateX(xRotation);
      if (rotateXAxis) {
        xRotation += 0.0002; // Increment rotation
      }
      p.rotateZ(zRotation);
      if (rotateZAxis) {
        zRotation += 0.0002; // Increment rotation
      }
      
      // Update terrain with new noise offsets
      generateTerrain();
      noiseOffsetX += noiseChangeSpeed;
      noiseOffsetY += noiseChangeSpeed;
    
      // Centering the terrain on the canvas
      p.translate(-w / 2, -h / 2);
    
      // Choose one of the methods by uncommenting it:
    
      // option 1. Draw the terrain using TRIANGLE_STRIP
      drawTerrainGrid();
    
      // option 2. Draw the terrain using a grid of lines
      // drawTerrainGrid();
    
      // option 3. Draw the terrain using contour lines
      // drawTerrainContours();
    
      // option 4. Draw the grid with fill raster cells
        // drawTerrainGridFill();
    
      p.resizeCanvas(p.windowWidth, p.windowHeight);
    };
      
    function drawTerrainGrid() {
      for (let y = 0; y < rows - 1; y++) {
        p.beginShape(p.QUAD_STRIP);
        for (let x = 0; x < cols; x++) {
          let elevation = terrain[x][y];
          let greyValue = p.map(elevation, -50, 50, 40, 100);
          p.stroke(greyValue); // Set the stroke to a shade of grey
          p.strokeWeight(3);
          // p.stroke(p.map(elevation, 45, 90, 270, 360), 60, 65);
          p.noFill();
          p.vertex(x * scl, y * scl, elevation);
          p.vertex(x * scl, (y + 1) * scl, terrain[x][y + 1]);
        }
        p.endShape();
      }
    }
  
    function drawTerrainGridFill() {
      for (let y = 0; y < rows - 1; y++) {
        p.beginShape(p.QUAD_STRIP);
        for (let x = 0; x < cols; x++) {
          let elevation = terrain[x][y];
          p.stroke(p.map(elevation, 45, 90, 270, 360), 90, -45);
          p.fill(p.map(elevation, 45, 90, 270, 360), 60, 45);
          p.vertex(x * scl, y * scl, elevation);
          p.vertex(x * scl, (y + 1) * scl, terrain[x][y + 1]);
        }
        p.endShape();
      }
    }
  
    function drawTerrainGridFlat() {
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          let elevation = terrain[x][y];
          // Set the stroke color based on elevation
          p.stroke(p.map(elevation, -100, 100, 0, 360), 100, 100);
          p.strokeWeight(1); // Adjust stroke weight as needed
          // Set the fill to transparent or a solid color
          p.fill(0, 0, 0, 0); // Transparent fill
          // p.fill(255); // Alternatively, a solid fill like white
          p.rect(x * scl, y * scl, scl, scl); // Rectangle representing elevation
        }
      }
    }
    
    function drawTerrainContours() {
      let thresh = 15; // Contour interval
    
      for (let i = 0; i < cols - 1; i++) {
        for (let j = 0; j < rows - 1; j++) {
          // Calculate state of the cell
          let a = (terrain[i][j] >= thresh) ? 1 : 0;
          let b = (terrain[i + 1][j] >= thresh) ? 1 : 0;
          let c = (terrain[i + 1][j + 1] >= thresh) ? 1 : 0;
          let d = (terrain[i][j + 1] >= thresh) ? 1 : 0;
          let state = a * 8 + b * 4 + c * 2 + d * 1;
    
          // Calculate interpolation points
          let points = calculateIntersections(i, j, a, b, c, d);
    
          // Draw lines based on the state
          p.stroke(255);
          p.strokeWeight(2);
          drawStateLines(state, points);
        }
      }
    }
    
    function calculateIntersections(i, j) {
      let points = {
        a: p.createVector(),
        b: p.createVector(),
        c: p.createVector(),
        d: p.createVector()
      };
    
      // Interpolate along edges to find intersection points
      let t; // interpolation factor
    
      // Top edge (between a and b)
      t = (thresh - terrain[i][j]) / (terrain[i + 1][j] - terrain[i][j]);
      points.a.x = p.lerp(i * scl, (i + 1) * scl, t);
      points.a.y = j * scl;
    
      // Right edge (between b and c)
      t = (thresh - terrain[i + 1][j]) / (terrain[i + 1][j + 1] - terrain[i + 1][j]);
      points.b.x = (i + 1) * scl;
      points.b.y = p.lerp(j * scl, (j + 1) * scl, t);
    
      // Bottom edge (between c and d)
      t = (thresh - terrain[i + 1][j + 1]) / (terrain[i][j + 1] - terrain[i + 1][j + 1]);
      points.c.x = p.lerp(i * scl, (i + 1) * scl, t);
      points.c.y = (j + 1) * scl;
    
      // Left edge (between a and d)
      t = (thresh - terrain[i][j + 1]) / (terrain[i][j] - terrain[i][j + 1]);
      points.d.x = i * scl;
      points.d.y = p.lerp(j * scl, (j + 1) * scl, t);
    
      return points;
    }
    
      
    function drawStateLines(state, points) {
      // Draw curves based on the state of the cell
      switch (state) {
        case 1:
          drawCurve(points.c, points.d);
          break;
        case 2:
          drawCurve(points.b, points.c);
          break;
        case 3:
          drawCurve(points.b, points.d);
          break;
        case 4:
          drawCurve(points.a, points.b);
          break;
        case 5:
          drawCurve(points.a, points.d);
          drawCurve(points.b, points.c);
          break;
        case 6:
          drawCurve(points.a, points.c);
          break;
        case 7:
          drawCurve(points.a, points.d);
          break;
        case 8:
          drawCurve(points.a, points.d);
          break;
        case 9:
          drawCurve(points.a, points.c);
          break;
        case 10:
          drawCurve(points.a, points.b);
          drawCurve(points.c, points.d);
          break;
        case 11:
          drawCurve(points.a, points.b);
          break;
        case 12:
          drawCurve(points.b, points.d);
          break;
        case 13:
          drawCurve(points.b, points.c);
          break;
        case 14:
          drawCurve(points.c, points.d);
          break;
        // Cases where no lines are drawn
        case 0:
        case 15:
          break;
      }
    }
    
    function drawCurve(startPoint, endPoint) {
      p.beginShape();
      p.curveVertex(startPoint.x, startPoint.y); // Start control point
      p.curveVertex(startPoint.x, startPoint.y); // Start point
      p.curveVertex(endPoint.x, endPoint.y);     // End point
      p.curveVertex(endPoint.x, endPoint.y);     // End control point
      p.endShape();
    }
    
    p.windowResized = () => {
      p.resizeCanvas(p.windowWidth, p.windowHeight);
      generateTerrain();
    };
  });
};