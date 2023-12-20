// Define an audio listener and add it to the camera
const audioListener = new THREE.AudioListener();
camera.add(audioListener);

// Define an audio loader
const audioLoader = new THREE.AudioLoader();

// Load an audio file
audioLoader.load('path_to_your_audio_file.mp3', function(buffer) {
  // This function is called once the audio file is loaded

  function addCellTowerPts(geojson) {
    // ... (existing code to create the pyramids)

    // Iterate over the geojson features to create positional audio for each point
    geojson.features.forEach(feature => {
      if (feature.geometry.type === 'Point') {
        // ... (existing code to project point and create the pyramid mesh)

        // Create a THREE.PositionalAudio object and set it up
        const sound = new THREE.PositionalAudio(audioListener);
        sound.setBuffer(buffer);
        sound.setRefDistance(1);
        sound.setLoop(true);
        sound.setVolume(0.5);
        pyramid.add(sound); // Attach the sound to the pyramid mesh
        sound.play(); // Start playing the sound
      }
    });
  }

  // Call the addCellTowerPts function or any other function that needs to create positional audio
  // e.g., addCellTowerPts(yourGeoJSONData);
});
