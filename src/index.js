const maleButton = document.getElementById("male");
const femaleButton = document.getElementById("female");
const calculateButton = document.querySelector(
  "form.bmi-form button[type='submit']"
);
const height = document.getElementById("height");
const weight = document.getElementById("weight");
const age = document.getElementById("age");
const heightUnit = document.getElementById("height-unit");
const weightUnit = document.getElementById("weight-unit");
let bmiValues = {};
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const values = [30, 55, 35, 40];
const colors = ["#45a09f", "#f0a710", "#ea6170", "#8292f1"];

const labels = ["Voluntary", "Robot", "Mandatory"];

function getGenderValue() {
  if (femaleButton.classList.contains("active-gender")) {
    return "female";
  }
  if (maleButton.classList.contains("active-gender")) {
    return "male";
  }
  return "";
}

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
  const gender = getGenderValue();
  const heightValue = height.value;
  const weightValue = weight.value;
  const ageValue = age.value;
  const heightUnitValue = heightUnit.value;
  const weightUnitValue = weightUnit.value;

  const requiredElements = [age, height, weight];

  requiredElements.forEach((element) =>
    element.value === ""
      ? element.classList.add("bmi-input-error")
      : element.classList.remove("bmi-input-error")
  );
  const hasEmptyFields = requiredElements.some(
    (element) => element.value === ""
  );

  if (hasEmptyFields) return;

  const formData = {
    gender,
    age: parseInt(ageValue),
    height: parseFloat(heightValue),
    heightUnit: heightUnitValue,
    weight: parseFloat(weightValue),
    weightUnit: weightUnitValue,
  };
  console.log(formData);

  const accessBmiValues = getBmiValues(formData);

  dmbChart(400, 230, 165, 50, values, colors, labels, 0, accessBmiValues);
});

function getBmiValues(data) {
  let height = 0;
  if (data.heightUnit === "cm") {
    height = data.height / 100;
  } else {
    height = data.height;
  }
  let weight = 0;
  if (data.weightUnit === "Ib") {
    weight = data.weight / 2.20462;
  } else {
    weight = data.weight;
  }

  const bmi = (weight / height ** 2).toFixed(2);
  const bmiPrime = (bmi / 25).toFixed(2);
  const pondoralIndex = (weight / height ** 3).toFixed(2);

  return {
    bmi,
    bmiPrime,
    pondoralIndex,
  };
}

dmbChart(400, 230, 165, 50, values, colors, labels, 0, { bmi: "N/A" });

function dmbChart(
  cx,
  cy,
  radius,
  arcwidth,
  values,
  colors,
  labels,
  selectedValue,
  accessBmiValues
) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  let tot = 0;
  let accum = 0;
  const PI = Math.PI;
  const PI2 = PI * 2;
  const offset = -PI / 2.5;
  ctx.lineWidth = arcwidth;
  for (let i = 0; i < values.length; i++) {
    tot += values[i];
  }
  for (let i = 0; i < values.length; i++) {
    ctx.beginPath();
    ctx.arc(
      cx,
      cy,
      radius,
      offset + PI2 * (accum / tot),
      offset + PI2 * ((accum + values[i]) / tot)
    );
    ctx.strokeStyle = colors[i];
    ctx.stroke();
    accum += values[i];
  }
  const innerRadius = 0;
  ctx.beginPath();
  ctx.arc(cx, cy, innerRadius, 0, PI2);
  ctx.fillStyle = "white";
  ctx.fill();
  ctx.textAlign = "center";
  ctx.textBaseline = "bottom";
  ctx.fillStyle = "black";

  ctx.font = 35 + "px verdana";
  if (accessBmiValues.bmi === "N/A") {
    ctx.fillText(`BMI= ${"N/A"}`, cx, cy - innerRadius * 0.25);
  } else {
    ctx.fillText(`BMI= ${accessBmiValues.bmi}`, cx, cy - innerRadius * 0.25);
  }
}
