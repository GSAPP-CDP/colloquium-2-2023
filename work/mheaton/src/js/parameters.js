import p5 from 'p5';

export function sonicParameters(containerId) {
    let wordsA = ["pitch", "brightness", "stereo panning", "tempo", "timbre", "sustain", "articulation", "overtones", "instrumentation", "octave"];
    let wordsB = ["location", "distance", "orientation", "force", "duration", "size", "amplitude", "length", "mass", "color"];
    let connections = [];

    new p5((p) => {
        let containerDiv;
        let canvas; // Declare canvas here

        p.setup = () => {
            containerDiv = document.getElementById(containerId);
            resizeCanvasToFitContainer();
            
            // Get the computed style of the container
            const computedStyle = getComputedStyle(containerDiv);

            // Calculate the available width and height inside the container
            const containerWidth = containerDiv.offsetWidth

            const containerHeight = containerDiv.offsetHeight

            // Create the canvas with the calculated dimensions
            let canvas = p.createCanvas(containerWidth, containerHeight);
            canvas.parent(containerId);

            p.textAlign(p.CENTER, p.CENTER);
            p.textFont('sans-serif'); 
            // p.textSize(36); // Set the text size
            p.noStroke(); // No outline for the text
            p.fill(200); 
            updateConnections();
            
        };

        p.windowResized = () => {
            resizeCanvasToFitContainer();
        };

        function resizeCanvasToFitContainer() {
            // Compute the style to get accurate dimensions
            const computedStyle = getComputedStyle(containerDiv);
            const containerWidth = containerDiv.offsetWidth - parseFloat(computedStyle.paddingLeft) - parseFloat(computedStyle.paddingRight);
            const containerHeight = containerDiv.offsetHeight - parseFloat(computedStyle.paddingTop) - parseFloat(computedStyle.paddingBottom);

            // Adjust canvas size
            p.resizeCanvas(containerWidth, containerHeight);
        }
    
        
    
            p.draw = () => {
                p.clear();
                drawWords();
                drawLines();
            };
    
            function drawWords() {
                for (let i = 0; i < wordsA.length; i++) {
                    p.text(wordsA[i], p.width * 0.2, i * 50 + 25);
                    p.text(wordsB[i], p.width * 0.8, i * 50 + 25);
                }
            }
    
            function drawLines() {
                p.stroke(200);
                for (const conn of connections) {
                    p.line(conn.x1, conn.y1, conn.x2, conn.y2);
                }
            }
    
            function updateConnections() {
                connections = [];
                let shuffledB = p.shuffle(wordsB.slice());
                for (let i = 0; i < wordsA.length; i++) {
                    // Calculate the start and end points, cropping 2% from each end
                    let startX = p.width * 0.2 + (p.width * 0.05); // Start 2% inward from the left edge of column A
                    let endX = p.width * 0.8 - (p.width * 0.05); // End 2% inward from the right edge of column B
                    let startY = i * 50 + 25;
                    let endY = shuffledB.indexOf(wordsB[i]) * 50 + 25;
            
                    connections.push({
                        x1: startX,
                        y1: startY,
                        x2: endX,
                        y2: endY
                    });
                }
            }
                
            // Update connections every n seconds
            setInterval(updateConnections, 1000);
        }, containerId);
    }
    