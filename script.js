// Teachable Machine model URL
const URL = "https://teachablemachine.withgoogle.com/models/hxSWFPvbQ/";

let model, webcam, labelContainer, maxPredictions;
let facingMode = "user"; // or "environment"

function scrollToTop() {
  window.scroll({ top: 0, left: 0, behavior: "smooth" });
}

function initHamburgerMenu() {
  /* initialise Hamburger-Menu */
  const hamburger = document.querySelector(".main__nav-ham");
  const navMenu = document.querySelector(".main__nav-list");
  const title = document.querySelector(".main__nav-title");

  hamburger.addEventListener("click", mobileMenu);

  function mobileMenu() {
    hamburger.classList.toggle("active");
    navMenu.classList.toggle("active");
  }

  function closeMenu() {
    hamburger.classList.remove("active");
    navMenu.classList.remove("active");
  }
}

initHamburgerMenu();

document.getElementById("startButton").addEventListener("click", () => {
  init();
});

document.getElementById("flipButton").addEventListener("click", async () => {
  // Flip the camera mode
  facingMode = facingMode === "user" ? "environment" : "user";
  await stopWebcam();
  await init();
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
  const flip = facingMode === "user"; // Flip only for front camera
  webcam = new tmImage.Webcam(300, 230, flip);

  try {
    await webcam.setup({ facingMode });

    // iOS Safari-specific: required attributes
    webcam.webcam.setAttribute("playsinline", true);
    webcam.webcam.setAttribute("autoplay", true);
    webcam.webcam.setAttribute("muted", true); // sometimes helps

    // Attach canvas before playing
    const container = document.getElementById("webcam-container");
    container.innerHTML = "";
    container.appendChild(webcam.canvas);

    await webcam.play();

    document.getElementById("startButton").style.display = "none";
    document.getElementById("flipButton").style.display = "inline-block";

    window.requestAnimationFrame(loop);
  } catch (err) {
    console.error("Error accessing the camera:", err);
    alert("Could not access the camera. Please check camera permissions and try refreshing.");
  }
}

// Stop webcam before switching cameras
async function stopWebcam() {
  if (webcam && webcam.webcam && webcam.webcam.srcObject) {
    webcam.pause();
    const tracks = webcam.webcam.srcObject.getTracks();
    tracks.forEach(track => track.stop());
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

  for (let i = 0; i < maxPredictions; i++) {
    const classPrediction =
      prediction[i].className + ": " + prediction[i].probability.toFixed(2);
    labelContainer.childNodes[i].innerHTML = classPrediction;

    if (prediction[i].probability > highestPrediction.probability) {
      highestPrediction = prediction[i];
    }
  }

  document.getElementById("overlayText").innerText = highestPrediction.className;
}
