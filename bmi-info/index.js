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
  dot.addEventListener("click", (e) =>
    showSection(e, index, [...childrenElements])
  );
});

const dotsArray = Array.from(dots.children);

mainContainer.parentNode.appendChild(dots);

function showSection(e, index, sectionElements) {
  const dotElements = [...document.querySelectorAll(".bmi-carousel-dot")];
  sectionElements.forEach((el) => {
    el.classList.remove("bmi-hidden");
    el.classList.remove("bmi-active");
    el.classList.add("bmi-hidden");
  });
  dotElements.forEach((el) => el.classList.remove("active"));
  dotElements[index].classList.add("active");
  sectionElements[index].classList.remove("bmi-hidden");
  sectionElements[index].classList.add("bmi-active");
}
