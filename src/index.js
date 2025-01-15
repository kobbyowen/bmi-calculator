const maleButton = document.getElementById("male");
const femaleButton = document.getElementById("female");
const calculateButton = document.getElementsByTagName("button")[2];
const height = document.getElementById("height");
const weight = document.getElementById("weight");
const age = document.getElementById("age");
const heightUnit = document.getElementById("height-unit");
const weightUnit = document.getElementById("weight-unit");

maleButton.addEventListener("click", (e) => {
  e.target.classList.add("active-gender");
  femaleButton.classList.remove("active-gender");
});

femaleButton.addEventListener("click", (e) => {
  e.target.classList.add("active-gender");
  maleButton.classList.remove("active-gender");
});

calculateButton.addEventListener("click", (e) => {
  e.preventDefault();
  const heightValue = height.value;
  const weightValue = weight.value;
  const ageValue = age.value;
  const heightUnitValue = heightUnit.value;
  const weightUnitValue = weightUnit.value;

  if (ageValue === "") {
    age.classList.add("bmi-input-error");
  }
  if (heightValue === "") {
    height.classList.add("bmi-input-error");
  }
  if (weightValue === "") {
    weight.classList.add("bmi-input-error");
  }

  const formData = {
    age: ageValue,
    height: `${heightValue}${heightUnitValue}`,
    weight: `${weightValue}${weightUnitValue}`,
  };
  console.log(formData);
});
