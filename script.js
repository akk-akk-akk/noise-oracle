const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const dpr = window.devicePixelRatio || 1;
canvas.width = 1000 * dpr;
canvas.height = 1000 * dpr;
ctx.scale(dpr, dpr);
ctx.imageSmoothingEnabled = false;

const probSlider = document.getElementById("probSlider");
const probLabel = document.getElementById("probLabel");
const imageLabel = document.getElementById("imageLabel");
const textLabel = document.getElementById("textLabel");

const imageOptions = [1, 3, 5, 7];
const textOptions = ["a", "b", "c"];
const imgLabels = ["Jiaobei", "Coin", "B/W", "1/0"];
const textLabels = ["Divine", "Ambiguous", "Secular"];

let probabilityValue = 0.5;
let imageAbstractionLevel = 0;
let textAbstractionLevel = 0;
let pictureList = [];

function loadImages(baseIndex, callback) {
  let loaded = 0;
  pictureList = [new Image(), new Image()];
  for (let i = 0; i < 2; i++) {
    pictureList[i].src = `${baseIndex + i}.png`;
    pictureList[i].onload = () => {
      loaded++;
      if (loaded === 2) callback();
    };
  }
}

function drawImages() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  let count1 = 0;
  let count2 = 0;
  let messages = [
    ["The gods are laughing, try again.", "The gods are displeased...", "The gods agree."],
    ["Signs point to yes.", "My sources say no.", "Concentrate and try again."],
    ["Yes.", "No.", "Maybe."]
  ];

  for (let i = 0; i < 2; i++) {
    const r = Math.random();
    const chosen = r < probabilityValue ? 0 : 1;
    const image = pictureList[chosen];

    if (chosen === 0) count1++;
    else count2++;

    const w = 250;
    const h = (image.height / image.width) * w;
    const x = Math.random() * (canvas.width / dpr - w - 150) + 50;
    const y = Math.random() * (canvas.height / dpr - 400) + 150;

    ctx.drawImage(image, x, y, w, h);

    // Blue rectangle border
    ctx.strokeStyle = "blue";
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, w, h);

    // Blue background for r probability text
    ctx.fillStyle = "blue";
    ctx.fillRect(x - 1, y - 20, 125, 20); // Background for "r = ..."
    ctx.fillRect(x - 1, y + h, 200, 20); // Background for "Chosen: Image ..."

    // Text
    ctx.fillStyle = "white";
    ctx.font = "16px monospace";
    ctx.textAlign = "left"; // Align text to the left
    ctx.fillText("r = " + r.toFixed(2), x + 2, y - 5); // Add padding of 5px
    ctx.fillText("Image: " + imgLabels[imageAbstractionLevel], x + 5, y + h + 15); // Add padding of 5px
  }

  let msg;
  if (count1 === 2) msg = messages[textAbstractionLevel][0];
  else if (count2 === 2) msg = messages[textAbstractionLevel][1];
  else msg = messages[textAbstractionLevel][2];

  // Measure the width of the main text
  ctx.font = "28px myfont";
  const textWidth = ctx.measureText(msg).width + 50;
  const textHeight = 50; // Fixed height for the rectangle
  const textX = (canvas.width / (2 * dpr)) - (textWidth / 2); // Center the rectangle
  const textY = 60; // Position at the top

  // Blue rectangle border for the main text
  ctx.strokeStyle = "blue";
  ctx.lineWidth = 2;
  ctx.strokeRect(textX, textY - 2.5, textWidth, textHeight);

  // Draw the main text
  ctx.fillStyle = "black";
  ctx.textAlign = "center";
  ctx.fillText(msg, canvas.width / (2 * dpr), textY + 30);

  // Measure the width of the label text
  const labels = ["Divine", "Ambiguous", "Secular"];
  const labelText = "Language: " + labels[textAbstractionLevel];
  const labelWidth = ctx.measureText(labelText).width - 75; // Add padding for the rectangle
  const labelX = textX; // Align the label rectangle with the main text rectangle
  const labelY = textY + textHeight + 5;

  // Blue rectangle border for the label
  ctx.fillStyle = "blue";
  ctx.fillRect(labelX - 1, labelY - 7.5, labelWidth, 20);

  // Draw the label text
  ctx.fillStyle = "white";
  ctx.font = "16px monospace";
  ctx.textAlign = "left"; // Align text to the left
  ctx.fillText(labelText, labelX + 5, labelY + 7.5); // Add padding of 5px
}

probSlider.addEventListener("input", () => {
  probabilityValue = parseFloat(probSlider.value);
  probLabel.textContent = `1. Probability Threshold: ${Math.round(probabilityValue * 100)}%`;
  drawImages();
});

function createOptions(containerId, options, callback, labelUpdate, labels) {
  const container = document.getElementById(containerId);
  container.innerHTML = ""; // Clear existing options

  options.forEach((val, i) => {
    const wrapper = document.createElement("div");
    wrapper.style.textAlign = "center"; // Center the content

    const img = document.createElement("img");
    img.src = `${val}.png`;
    img.alt = labels[i]; // Add alt text for accessibility
    img.classList.add("option-button"); // Add a common class for styling

    img.addEventListener("click", () => {
      // Remove the red glow from all buttons
      const buttons = container.querySelectorAll(".option-button");
      buttons.forEach((button) => button.classList.remove("selected"));

      // Add the red glow to the clicked button
      img.classList.add("selected");

      // Update the abstraction level and redraw
      callback(i);
      labelUpdate(i);
      drawImages();
    });

    const label = document.createElement("span");
    label.textContent = labels[i]; // Use the provided label
    label.style.display = "block"; // Ensure it appears below the image
    label.style.marginTop = "5px"; // Add spacing above the label

    wrapper.appendChild(img);
    wrapper.appendChild(label); // Append the label below the image
    container.appendChild(wrapper);
  });
}

// Update calls to createOptions
createOptions("imageOptions", imageOptions, (i) => {
  imageAbstractionLevel = i;
  loadImages(1 + i * 2, drawImages);
}, (i) => {
  imageLabel.textContent = `2. Image Abstraction: ${imgLabels[i]}`;
}, imgLabels);

createOptions("textOptions", textOptions, (i) => {
  textAbstractionLevel = i;
}, (i) => {
  textLabel.textContent = `3. Text Abstraction: ${textLabels[i]}`;
}, textLabels);

loadImages(1, drawImages);

// Add an event listener to the canvas for the click event
canvas.addEventListener("click", () => {
  drawImages(); // Regenerate the images when the canvas is clicked
});




// POP UP BOX

// Show the pop-up when the page loads
window.addEventListener("load", () => {
  const popup = document.getElementById("popup");
  const popupClose = document.getElementById("popupClose");

  // Show the pop-up
  popup.classList.add("show");

  // Close the pop-up when the close button is clicked
  popupClose.addEventListener("click", () => {
    popup.classList.remove("show");
  });

  // Optional: Close the pop-up when clicking outside the content
  popup.addEventListener("click", (e) => {
    if (e.target === popup) {
      popup.classList.remove("show");
    }
  });
});