import p5 from "p5";
import createHull from "convex-hull";

export function isometricCube(containerId) {
  new p5((p) => {
    let containerDiv = document.getElementById(containerId);
    let w, h; // width and height of the canvas

    let cyanColor, magentaColor, yellowColor;

    let cyanPoints = [];
    let magentaPoints = [];
    let yellowPoints = [];

    // custom orbit controls init
    let targetAngleX = 0;
    let targetAngleY = 0;
    let targetZoom = 0;
    let angleX = 0;
    let angleY = 0;
    let zoom = 0;
    let minZoom = -500; // Maximum zoom out distance
    let maxZoom = 0; // Maximum zoom in distance

    // auto animation params
    let rotationDirectionX = 0.007; // Initial rotation direction for X
    let rotationDirectionY = 0.007; // rotation direction for Y
    let zoomIncrement = 0.1; // Adjust this for the speed of zooming
    let maxZoomIn = zoom - 20; // 20% zoom in
    let maxZoomOut = zoom + 20; // 20% zoom out

    // Cube and grid parameters
    const cubeSize = 250;
    const gridSize = 8; // Number of grid divisions
    const pointCloudDensity = 20; // Number of points in each cloud

    p.setup = () => {
      let rect = containerDiv.getBoundingClientRect();
      w = rect.width;
      h = rect.height;
      p.frameRate(12);

      // Create canvas
      p.createCanvas(w, h, p.WEBGL).parent(containerId);

      // Assign custom colors
      cyanColor = p.color(120, 120, 120, 255); // Cyan
      magentaColor = p.color(255, 255, 255, 255); // Magenta
      yellowColor = p.color(200, 200, 200, 255); // Yellow

      // Add a mouse wheel event listener
      p.canvas.addEventListener("wheel", (event) => {
        // Calculate the central region of the canvas
        let centerX = w / 2;
        let centerY = h / 2;
        let regionSize = Math.min(w, h) / 4; // 25% of the smaller dimension

        // Check if the mouse is within the central 25% of the canvas
        if (
          p.mouseX > centerX - regionSize / 2 &&
          p.mouseX < centerX + regionSize / 2 &&
          p.mouseY > centerY - regionSize / 2 &&
          p.mouseY < centerY + regionSize / 2
        ) {
          // Adjust target zoom based on wheel delta
          targetZoom += event.deltaY * -0.3;

          // Constrain target zoom to set limits
          targetZoom = p.constrain(targetZoom, minZoom, maxZoom);

          event.preventDefault(); // Prevent default scroll behavior
        }
      });

      p.canvas.addEventListener("mousemove", (event) => {
        if (p.mouseIsPressed && p.mouseButton === p.LEFT) {
          // Adjust target rotation based on mouse movement
          targetAngleY += event.movementX * 0.0035;
          targetAngleX += event.movementY * -0.0035;
        }
      });
    };

    p.draw = () => {
      p.clear();

      // Gradually interpolate towards target rotation
      angleX += (targetAngleX - angleX) * 0.1;
      angleY += (targetAngleY - angleY) * 0.1;
      zoom += (targetZoom - zoom) * 0.1;

      // Gradually interpolate towards target zoom
      zoom += (targetZoom - zoom) * 0.1;

      // Ping-pong zoom
      targetZoom += zoomIncrement;
      if (targetZoom > maxZoomOut || targetZoom < maxZoomIn) {
        zoomIncrement *= -1; // Reverse direction
      }

      // Apply rotation and zoom
      p.rotateX(angleX);
      p.rotateY(angleY);
      p.translate(0, 0, zoom);

      // Update target angles based on rotation direction
      targetAngleX += rotationDirectionX;
      targetAngleY += rotationDirectionY;

      // Check if limits are reached and reverse the direction if so
      if (targetAngleX > 0.75 || targetAngleX < -0.75) {
        rotationDirectionX *= -1; // Reverse direction
      }
      if (targetAngleY > 1.25 || targetAngleY < -1.25) {
        rotationDirectionY *= -1; // Reverse direction
      }

      // Set up isometric view
      p.rotateX(-p.QUARTER_PI);
      p.rotateY(p.QUARTER_PI);

      // Draw the cube with grids
      drawOpenCube(cubeSize, gridSize);

      // Draw point clouds in different colors
      drawPointCloud(0, 0, 0, pointCloudDensity, cyanColor);
      drawPointCloud(
        cubeSize / 4,
        cubeSize / 4,
        cubeSize / 4,
        pointCloudDensity,
        magentaColor
      );
      drawPointCloud(
        -cubeSize / 4,
        -cubeSize / 4,
        -cubeSize / 4,
        pointCloudDensity,
        yellowColor
      );
    };

    function calculateConvexHull(points) {
      let formattedPoints = points.map((p) => [p.x, p.y, p.z]);
      let hullIndices = createHull(formattedPoints);

      // Flatten the hull indices array and remove duplicates
      let flattenedIndices = [...new Set(hullIndices.flat())];

      let hullPoints = flattenedIndices.map((index) => points[index]);
      return hullPoints;
    }

    // Function to draw an open-faced cube with grids
    function drawOpenCube(size, grid) {
      p.push();
      p.stroke(255, 255, 255, 150);
      p.noFill();
      let hSize = size / 2;

      // Coordinates for the cube vertices
      let vertices = [
        [-hSize, -hSize, -hSize], // 0: left-bottom-back
        [hSize, -hSize, -hSize], // 1: right-bottom-back
        [hSize, -hSize, hSize], // 2: right-bottom-front
        [-hSize, -hSize, hSize], // 3: left-bottom-front
        [-hSize, hSize, -hSize], // 4: left-top-back
        [hSize, hSize, -hSize], // 5: right-top-back
        [hSize, hSize, hSize], // 6: right-top-front
        [-hSize, hSize, hSize], // 7: left-top-front
      ];

      // Draw each face of the cube, except for the front face
      drawFaceWithGrid(vertices, [0, 1, 5, 4], grid); // Bottom face
      // drawFaceWithGrid(vertices, [0, 3, 7, 4], grid); // Left face
      drawFaceWithGrid(vertices, [1, 2, 6, 5], grid); // Right face
      // drawFaceWithGrid(vertices, [3, 2, 6, 7], grid); // Top face
      // drawFaceWithGrid(vertices, [0, 1, 2, 3], grid); // Back face
      drawFaceWithGrid(vertices, [4, 5, 6, 7], grid); // Front face
      p.pop();
    }

    // Function to draw a face of the cube with grid
    function drawFaceWithGrid(vertices, indices, grid) {
      let [v0, v1, v2, v3] = indices.map((i) => vertices[i]);
      drawFace(v0, v1, v2, v3);

      // Grid lines parallel to v0-v1 and v1-v2
      for (let i = 1; i < grid; i++) {
        let frac = i / grid;
        // Lines parallel to v0-v1
        drawLine(
          p.createVector(...v0).lerp(p.createVector(...v1), frac),
          p.createVector(...v3).lerp(p.createVector(...v2), frac)
        );
        // Lines parallel to v1-v2
        drawLine(
          p.createVector(...v1).lerp(p.createVector(...v2), frac),
          p.createVector(...v0).lerp(p.createVector(...v3), frac)
        );
      }
    }

    // Function to draw a face of the cube
    function drawFace(v0, v1, v2, v3) {
      p.beginShape();
      p.vertex(...v0);
      p.vertex(...v1);
      p.vertex(...v2);
      p.vertex(...v3);
      p.endShape(p.CLOSE);
    }

    // Function to draw a line between two p5.Vector points
    function drawLine(v1, v2) {
      p.line(v1.x, v1.y, v1.z, v2.x, v2.y, v2.z);
    }

    // Function to draw a point cloud and its convex hull
    function drawPointCloud(x, y, z, density, pointColor) {
      p.push();
      p.translate(x, y, z);
      p.stroke(pointColor);
      let pointsArray;
      let hullPoints;

      if (pointColor === cyanColor) {
        pointsArray = cyanPoints;
        hullPoints = calculateConvexHull(cyanPoints);
      } else if (pointColor === magentaColor) {
        pointsArray = magentaPoints;
        hullPoints = calculateConvexHull(magentaPoints);
      } else if (pointColor === yellowColor) {
        pointsArray = yellowPoints;
        hullPoints = calculateConvexHull(yellowPoints);
      }

      p.strokeWeight(1);
      pointsArray.length = 0; // Clear the array for new frame

      for (let i = 0; i < density; i++) {
        // Check if the points array needs initialization
        if (pointsArray.length < density) {
          let px, py, pz;
          if (pointColor === cyanColor) {
            // Initialize cyan points closer to the bottom face
            px = p.random(-cubeSize / 4, cubeSize / 4);
            py = p.random(-cubeSize / 2, -cubeSize / 4); // Closer to bottom
            pz = p.random(-cubeSize / 4, cubeSize / 4);
          } else if (pointColor === magentaColor) {
            // Initialize magenta points closer to the right face
            px = p.random(cubeSize / 5, cubeSize / 3);
            py = p.random(-cubeSize / 4, cubeSize / 5);
            pz = p.random(-cubeSize / 2.5, cubeSize / 5);
          } else if (pointColor === yellowColor) {
            // Initialize yellow points closer to the front face
            px = p.random(-cubeSize / 3, cubeSize / 4);
            py = p.random(-cubeSize / 4, cubeSize / 2);
            pz = p.random(cubeSize / 4, cubeSize / 3); // Closer to front
          }
          pointsArray.push(new p.createVector(px, py, pz));
        } else {
          // Update points with small random offset
          pointsArray[i].x += p.random(-1, 1); // Adjust these values to control movement
          pointsArray[i].y += p.random(-1, 1);
          pointsArray[i].z += p.random(-1, 1);
        }
        p.point(pointsArray[i].x, pointsArray[i].y, pointsArray[i].z);
      }

      // Draw the convex hull
      drawHull(hullPoints, pointColor);
      p.pop();
    }

    // Function to draw the convex hull
    function drawHull(hullPoints, hullColor) {
      p.stroke(hullColor);
      p.noFill();
      p.beginShape();
      for (let pt of hullPoints) {
        p.vertex(pt.x, pt.y, pt.z);
      }
      p.endShape(p.CLOSE);
    }

    p.windowResized = () => {
      let computedStyle = getComputedStyle(containerDiv);
      let width = parseInt(computedStyle.width, 10);
      let height = parseInt(computedStyle.height, 10);
      p.resizeCanvas(width, height);
    };
  });
}
