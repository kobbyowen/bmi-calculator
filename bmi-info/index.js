const mainContainer = document.getElementById("bmi-content-container-wrapper");
const childrenElements = mainContainer.children;
const dots = document.createElement("div");
dots.classList.add("bmi-dots-carousel");

const arrayElements = Array.from(childrenElements);
arrayElements.forEach((element, index) => {
  const dot = document.createElement("div");
  if (index === 0) {
    dot.classList.add("active");
  }
  dot.classList.add("bmi-carousel-dot");
  dots.appendChild(dot);
});

mainContainer.parentNode.appendChild(dots);
