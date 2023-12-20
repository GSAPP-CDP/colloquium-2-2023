import p5 from 'p5';

export function wavetable(containerId) {
  new p5((p) => {
    let cols, rows;
    let scl = 10; // scale of each cell
    let w; // width of the wave field
    let h; // height of the wave field
    let margin = 0; // margin around the wave field
    let yoff = 0.0; // offset for y-axis noise
    let containerDiv = document.getElementById(containerId);
    let buffer; // Create a graphics buffer
    let startY

    // noise control
    let noiseIntensityX = 30; // Adjust this for X noise intensity
    let noiseIntensityY = 200; // Adjust this for Y noise intensity
    let xoffIncrement = 0.00006; // Higher = faster horizontal change
    let yoffIncrement = 0.00009;  // vertical change

    // surplus wave
    let propagationWaveIndex = 0; // Index for the wave


    p.setup = () => {
      p.frameRate(10);
      let rect = containerDiv.getBoundingClientRect();
      w = rect.width - (margin * 2); 
      h = rect.height - (margin * 2);

      p.createCanvas(rect.width, rect.height).parent(containerId);
      p.clear();

      cols = (w - margin * 2) / scl;

      // Determine the safe vertical range for each wave
      let safeWaveHeight = noiseIntensityY * 1.5; // X the maximum height a wave can reach
      rows = Math.floor((h - safeWaveHeight) / scl); // Number of rows that fit within the canvas

      buffer = p.createGraphics(w, h);
      
      // Calculate the number of rows that can fit within the reduced safe height
      rows = Math.floor((h - safeWaveHeight) / scl);

      // Adjust startY to account for the new number of rows
      let startY = (h - rows * scl) / 2; // Adjusted starting Y position for the first wave

      buffer = p.createGraphics(w, h); // Initialize the buffer
      buffer.clear();  // Initialize the buffer with a transparent background
    };

    p.draw = () => {
      buffer.strokeWeight(2);
      let startY = (h - rows * scl) / 2;

      let overflow = 30; // Amount by which the drawing overflows on each side
    
      for (let y = startY; y <= startY + rows * scl; y += scl) {
        buffer.noFill();
        buffer.beginShape();
        let xoff = 0.0;
    
        for (let x = -overflow; x <= w + overflow; x += scl) {
          // Calculate alpha value based on y position
          let alphaY = p.map(y, startY, startY + rows * scl, 20, 222); // Lower alpha at top, higher at bottom
    
        
          let midX = w / 2;
          let distanceFromMidX = Math.abs(x - midX);
          let alphaX = p.map(distanceFromMidX, 0, midX, 255, 179);

          let alpha = Math.min(alphaX, alphaY);
          buffer.stroke(255, 255, 255, alpha); // Apply calculated alpha value

          let distance = p.dist(p.mouseX - margin, p.mouseY - margin, x, y);
          let distortionFactorX = p.map(distance, 0, 200, 0.02, 0);
          let distortionFactorY = p.map(distance, 0, 200, -5, 0);

          let noiseValue = p.noise(x * xoff, yoff);
          let noiseScaleX = p.map(noiseValue, 0, 1, -noiseIntensityX, noiseIntensityX) + distortionFactorX;
          let noiseScaleY = p.map(noiseValue, 0, 1, -noiseIntensityY, noiseIntensityY) + distortionFactorY;

          buffer.curveVertex(x + margin + noiseScaleX, y + noiseScaleY);
          xoff += xoffIncrement;
        }
        yoff += yoffIncrement;
        buffer.endShape();
      }

      // Draw the propagating wave
      let propagationY = startY + propagationWaveIndex * scl; // Calculate the y position of the propagation wave
      buffer.stroke(20, 20, 20); // Set color
      drawPropWave(propagationY);

      propagationWaveIndex++;
      if (propagationWaveIndex >= rows) {
        propagationWaveIndex = 0; // Reset the index to start from the bottom again
      }

      p.clear();
      // p.tint(55, 55, 255, 215);
      p.image(buffer, 0, 0);
      buffer.fill(0, 0, 0, 50);
      buffer.noStroke();
      buffer.rect(0, 0, w, h);
      buffer.clear();
    };

    // Function to draw a single wave
    function drawPropWave(yPos) {
      // buffer.strokeWeight(1);
      buffer.noFill();
      buffer.beginShape();
      let xoff = 0.0;

      for (let x = -30; x <= w + 30; x += scl) {
          // Calculate alpha value based on y position
          let alphaY = p.map(yPos, startY, startY + rows * scl, 0, 255); // Lower alpha at top, higher at bottom

          let midX = w / 2;
          let distanceFromMidX = Math.abs(x - midX);
          let alphaX = p.map(distanceFromMidX, 0, midX, 255, 179);

          let alpha = Math.min(alphaX, alphaY);
          buffer.stroke(255, 0, 255, alpha); // Apply calculated alpha value

          // Use existing noise and distortion logic
          let noiseValue = p.noise(x * xoff, yoff);
          let noiseScaleX = p.map(noiseValue, 0, 1, -noiseIntensityX, noiseIntensityX);
          let noiseScaleY = p.map(noiseValue, 0, 1, -noiseIntensityY, noiseIntensityY);

          buffer.curveVertex(x + noiseScaleX, yPos + noiseScaleY);
          xoff += xoffIncrement;
      }

      buffer.endShape();
}


    p.windowResized = () => {
      if (containerDiv) {
        let computedStyle = getComputedStyle(containerDiv);
        let width = parseInt(computedStyle.width, 10);
        let height = parseInt(computedStyle.height, 10);
        p.resizeCanvas(width, height);
      } else {
        p.resizeCanvas(p.windowWidth, p.windowHeight);
      }
    };
  });
};
