// Teachable Machine model URL
const URL = "https://teachablemachine.withgoogle.com/models/hxSWFPvbQ/";

let model, webcam, labelContainer, maxPredictions;
let facingMode = "user"; // "user" = front camera, "environment" = back camera
let isFrontCamera = true;

document.getElementById("startButton").addEventListener("click", () => {
  init();
});

document.getElementById("flipButton").addEventListener("click", async () => {
  // Flip the camera
  isFrontCamera = !isFrontCamera;

  // Stop the current webcam stream
  await webcam.stop();

  // Reinitialize the webcam with the new facing mode
  await webcam.setup({ facingMode: isFrontCamera ? "user" : "environment" });
  await webcam.play();

  // Update the webcam canvas
  document.getElementById("webcam-container").appendChild(webcam.canvas);
});

// Load the image model and setup the webcam
async function init() {
  const modelURL = URL + "model.json";
  const metadataURL = URL + "metadata.json";

  // Load the model if not already loaded
  if (!model) {
    model = await tmImage.load(modelURL, metadataURL);
    maxPredictions = model.getTotalClasses();

    // Prepare the label container
    labelContainer = document.getElementById("label-container");
    for (let i = 0; i < maxPredictions; i++) {
      labelContainer.appendChild(document.createElement("div"));
    }
  }

  // Setup the webcam
  const flip = true; // Flip horizontally for front camera
  webcam = new tmImage.Webcam(null, null, flip); // Remove hardcoded width and height
  await webcam.setup({ facingMode: "user" }); // Start with the front camera
  await webcam.play();

  // Hide start button, show flip button
  document.getElementById("startButton").style.display = "none";
  document.getElementById("flipButton").style.display = "block";

  // Add webcam canvas to page
  const webcamContainer = document.getElementById("webcam-container");
  webcamContainer.innerHTML = ""; // Clear previous canvas if any
  webcamContainer.appendChild(webcam.canvas);

  // Append the flip button to the webcam container
  webcamContainer.appendChild(document.getElementById("flipButton"));

  window.requestAnimationFrame(loop);
}

// Stop webcam before switching cameras
async function stopWebcam() {
  if (webcam && webcam.stream) {
    webcam.stop();
  }
}

// Continuously update the webcam and make predictions
async function loop() {
  webcam.update(); // Update the webcam frame
  await predict();
  window.requestAnimationFrame(loop);
}

// Run the webcam image through the image model
async function predict() {
  const prediction = await model.predict(webcam.canvas);
  let highestPrediction = { className: "Loading...", probability: 0 };

  // Update the label container and find the highest prediction
  for (let i = 0; i < maxPredictions; i++) {
    const classPrediction =
      prediction[i].className + ": " + prediction[i].probability.toFixed(2);
    labelContainer.childNodes[i].innerHTML = classPrediction;

    if (prediction[i].probability > highestPrediction.probability) {
      highestPrediction = prediction[i];
    }
  }

  // Update the overlay text with the highest prediction
  document.getElementById("overlayText").innerText = highestPrediction.className;
}
