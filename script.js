// Teachable Machine model URL
const URL = "https://teachablemachine.withgoogle.com/models/hxSWFPvbQ/";

let model, webcam, labelContainer, maxPredictions;

// Load the image model and setup the webcam
async function init() {
  const modelURL = URL + "model.json";
  const metadataURL = URL + "metadata.json";

  // Load the model and metadata
  model = await tmImage.load(modelURL, metadataURL);
  maxPredictions = model.getTotalClasses();

  // Setup the webcam
  const flip = true; // Flip the webcam horizontally
  webcam = new tmImage.Webcam(300, 200, flip); // width, height, flip
  await webcam.setup(); // Request access to the webcam
  await webcam.setup({ facingMode: "user" });
  await webcam.play();
  window.requestAnimationFrame(loop);

  // Append the webcam canvas to the DOM
  document.getElementById("webcam-container").appendChild(webcam.canvas);

  // Prepare the label container
  labelContainer = document.getElementById("label-container");
  for (let i = 0; i < maxPredictions; i++) {
    labelContainer.appendChild(document.createElement("div"));
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

// // Show the popup when the page loads
// window.onload = function () {
//   const popup = document.getElementById("popup");
//   const popupClose = document.getElementById("popupClose");

//   // Display the popup
//   popup.style.display = "block";

//   // Close the popup when the close button is clicked
//   popupClose.onclick = function () {
//     popup.style.display = "none";
//   };

//   // Close the popup when clicking outside the popup content
//   window.onclick = function (event) {
//     if (event.target === popup) {
//       popup.style.display = "none";
//     }
//   };
// };

// Start the application
init();