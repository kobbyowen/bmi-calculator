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

const dotsArray = Array.from(dots.children);

dotsArray.forEach((dot, index2) => {
  dot.addEventListener("click", (e) => {
    dotsArray.forEach((dotElement) => dotElement.classList.remove("active"));
    dot.classList.add("active");
    arrayElements.forEach((element, idx) => {
      if (idx === index2) {
        element.classList.add("active-box");
        element.scrollIntoView();
      } else {
        element.classList.remove("active-box");
      }
    });
  });
});

mainContainer.parentNode.appendChild(dots);
