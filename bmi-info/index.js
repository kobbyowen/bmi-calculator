const parent = document.getElementById("bmi-main-content");
const mainContainer = document.getElementById("bmi-content-container");
const childrenElements = mainContainer.children;
const dots = document.createElement("div");

const arrayElements = Array.from(childrenElements);
arrayElements.forEach((element) => {
  const dot = document.createElement("div");
  dot.textContent = "T";
  dots.appendChild(dot);
});

parent.appendChild(dots);
