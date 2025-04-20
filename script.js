// Teachable Machine model URL
const URL = "https://teachablemachine.withgoogle.com/models/hxSWFPvbQ/";

let model, webcam, labelContainer, maxPredictions;

// Handle click to start camera and model
document.getElementById("startButton").addEventListener("click", () => {
  init();
});

async function init() {
  const modelURL = URL + "model.json";
  const metadataURL = URL + "metadata.json";

  try {
    // Load the model and metadata
    model = await tmImage.load(modelURL, metadataURL);
    maxPredictions = model.getTotalClasses();

    // Setup the webcam
    const flip = true; // Flip horizontally for front camera
    webcam = new tmImage.Webcam(300, 200, flip);

    // Try to access the camera with basic constraints
    await webcam.setup({ facingMode: "user" }); // <-- Important for iOS
    await webcam.play();

    // Hide the start button once camera starts
    document.getElementById("startButton").style.display = "none";

    // Add webcam canvas to page
    document.getElementById("webcam-container").appendChild(webcam.canvas);

    // Prepare label container
    labelContainer = document.getElementById("label-container");
    for (let i = 0; i < maxPredictions; i++) {
      labelContainer.appendChild(document.createElement("div"));
    }

    // Start looping prediction
    window.requestAnimationFrame(loop);
  } catch (err) {
    console.error("Error accessing the camera:", err);
    alert("Unable to access the camera. Please check permissions and ensure you're using HTTPS.");
  }
}

// Loop through webcam frames and predict
async function loop() {
  webcam.update();
  await predict();
  window.requestAnimationFrame(loop);
}

// Run prediction and update labels
async function predict() {
  const prediction = await model.predict(webcam.canvas);
  let highestPrediction = { className: "Loading...", probability: 0 };

  for (let i = 0; i < maxPredictions; i++) {
    const classPrediction =
      prediction[i].className + ": " + prediction[i].probability.toFixed(2);
    labelContainer.childNodes[i].innerHTML = classPrediction;

    if (prediction[i].probability > highestPrediction.probability) {
      highestPrediction = prediction[i];
    }
  }

  // Show highest prediction
  document.getElementById("overlayText").innerText = highestPrediction.className;
}
