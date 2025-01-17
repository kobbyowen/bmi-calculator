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
const canvas = document.getElementById("canvas");

maleButton.addEventListener("click", (e) => {
  e.target.classList.add("active-gender");
  femaleButton.classList.remove("active-gender");
});

femaleButton.addEventListener("click", (e) => {
  e.target.classList.add("active-gender");
  maleButton.classList.remove("active-gender");
});

document.addEventListener("readystatechange", () => {
  drawBMICanvas(canvas, "N/A");
});

function getGenderValue() {
  if (femaleButton.classList.contains("active-gender")) {
    return "female";
  }
  if (maleButton.classList.contains("active-gender")) {
    return "male";
  }
  return "";
}

function getBmiValues(data) {
  let height = data.height;
  if (data.heightUnit === "cm") {
    height = data.height / 100;
  } else if (data.heightUnit === "in") {
    height = data.height * 0.0254;
  }

  const weight = data.weightUnit === "Ib" ? data.weight / 2.20462 : data.weight;

  const bmi = (weight / height ** 2).toFixed(2);
  const bmiPrime = (bmi / 25).toFixed(2);
  const ponderalIndex = (weight / height ** 3).toFixed(2);
  const minimumHealthyWeight = (18.5 * height ** 2).toFixed(2);
  const maximumHealthyWeight = (25 * height ** 2).toFixed(2);

  return {
    bmi,
    bmiPrime,
    ponderalIndex,
    minimumHealthyWeight,
    maximumHealthyWeight,
  };
}

function presentBMIInfo(formData) {
  const canvas = document.getElementById("canvas");
  const bmiValues = getBmiValues(formData);

  drawBMICanvas(canvas, bmiValues.bmi, formData);
}

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

  presentBMIInfo(formData);
});

function drawBMICanvas(canvas, bmiValue) {
  const arcWidth = 35;
  const radius = 0.5 * canvas.width - arcWidth;
  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;
  const context = canvas.getContext("2d");

  const segments = [
    {
      value: 30,
      color: "#45a09f",
    },
    {
      value: 55,
      color: "#f0a710",
    },
    {
      value: 35,
      color: "#ea6170",
    },
    {
      value: 40,
      color: "#8292f1",
    },
  ];

  const PI = Math.PI;
  const offset = -PI / 2.5;

  context.clearRect(0, 0, canvas.width, canvas.height);

  drawArcSegments(
    context,
    segments,
    centerX,
    centerY,
    radius,
    arcWidth,
    offset
  );

  drawBMIText(context, bmiValue, centerX, centerY);
}

function drawArcSegments(
  context,
  segments,
  centerX,
  centerY,
  radius,
  arcWidth,
  offset
) {
  const totalValue = segments.reduce(
    (total, segment) => total + segment.value,
    0
  );
  let accumulatedValue = 0;

  context.lineWidth = arcWidth;

  segments.forEach((segment) => {
    const startAngle = offset + (accumulatedValue / totalValue) * Math.PI * 2;
    const endAngle =
      offset + ((accumulatedValue + segment.value) / totalValue) * Math.PI * 2;

    context.beginPath();
    context.arc(centerX, centerY, radius, startAngle, endAngle);
    context.strokeStyle = segment.color;
    context.stroke();

    accumulatedValue += segment.value;
  });
}

function drawBMIText(context, bmiValue, centerX, centerY) {
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.fillStyle = "black";
  context.font = "30px Host Grotesk";
  context.fillText(`BMI = ${bmiValue}`, centerX, centerY);
}
