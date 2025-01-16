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

function findCoordinatesOnCircle(centerX, centerY, radius, angle) {
  const x = centerX + radius * Math.cos((Math.PI * 2 * angle) / 360);
  const y = centerY + radius * Math.sin((Math.PI * 2 * angle) / 360);
  return { x, y };
}

function getArrowCoordinates(
  startAngle,
  endAngle,
  centerX,
  centerY,
  radius,
  bmiClassification
) {
  let angle = 0;
  if (bmiClassification === "normal") {
    return {
      ...findCoordinatesOnCircle(centerX, centerY, radius, startAngle + 10),
      firstAngle: 120,
      firstShaftLength: 30,
      secondAngleOffset: 60,
      secondShaftLength: 100,
      text: "normal weight",
    };
  }
  if (bmiClassification === "underweight") {
    return {
      ...findCoordinatesOnCircle(centerX, centerY, radius, startAngle - 50),
      firstAngle: 50,
      firstShaftLength: 30,
      secondAngleOffset: 310,
      secondShaftLength: 100,
      text: "underweight",
    };
  }
  if (bmiClassification === "overweight") {
    angle = endAngle - 10;
  }
  if (bmiClassification === "obese") {
    return {
      ...findCoordinatesOnCircle(centerX, centerY, radius, startAngle - 80),
      firstAngle: 300,
      firstShaftLength: 30,
      secondAngleOffset: 30,
      secondShaftLength: 100,
      text: "obese",
    };
  }

  return {};
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

  // if (hasEmptyFields) return;

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
  const arcWidth = 30;
  const radius = 0.5 * canvas.width - arcWidth;
  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;
  const context = canvas.getContext("2d");

  const offsetAngle = -90;
  const segments = [
    {
      startAngle: -69,
      endAngle: 20,
      color: "#8292f1",
      label: "underweight",
    },
    {
      startAngle: 21,
      endAngle: 90,
      color: "#45a09f",
      label: "normal",
    },

    {
      startAngle: 91,
      endAngle: 200,
      color: "#f0a710",
      label: "overweight",
    },
    {
      startAngle: 201,
      endAngle: 290,
      color: "#ea6170",
      label: "obese",
    },
  ];

  context.clearRect(0, 0, canvas.width, canvas.height);

  drawArcSegments(
    context,
    segments,
    centerX,
    centerY,
    radius,
    arcWidth,
    offsetAngle
  );

  drawBMIText(context, bmiValue, centerX, centerY);

  const bmiClassification = "obese";

  const { startAngle, endAngle } =
    segments.find((segment) => segment.label === bmiClassification) || {};
  const arrowCoordinates = getArrowCoordinates(
    startAngle,
    endAngle,
    centerX,
    centerY,
    radius,
    bmiClassification
  );

  console.log({ bmiClassification, arrowCoordinates, startAngle, endAngle });

  drawArrow(
    context,
    arrowCoordinates.x,
    arrowCoordinates.y,
    arrowCoordinates.firstAngle,
    arrowCoordinates.firstShaftLength,
    arrowCoordinates.secondAngleOffset,
    arrowCoordinates.secondShaftLength,
    10,
    arrowCoordinates.text
  );
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
  context.lineWidth = arcWidth;

  segments.forEach((segment) => {
    const startAngle = (segment.startAngle + offset) * (Math.PI / 180);
    const endAngle = (segment.endAngle + offset) * (Math.PI / 180);

    context.beginPath();
    context.arc(centerX, centerY, radius, startAngle, endAngle);
    context.strokeStyle = segment.color;
    context.stroke();
  });
}

function drawBMIText(context, bmiValue, centerX, centerY) {
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.fillStyle = "black";
  context.font = "30px Host Grotesk";
  context.fillText(`BMI = ${bmiValue}`, centerX, centerY);
}

function drawArrow(
  ctx,
  x,
  y,
  firstAngle,
  firstShaftLength,
  secondAngleOffset,
  secondShaftLength,
  arrowheadSize,
  text
) {
  // Convert angles to radians
  const firstAngleRadians = (firstAngle * Math.PI) / 180;
  const secondAngleRadians =
    firstAngleRadians + (secondAngleOffset * Math.PI) / 180;

  // Calculate the end of the first shaft
  const firstShaftEndX = x - firstShaftLength * Math.cos(firstAngleRadians);
  const firstShaftEndY = y - firstShaftLength * Math.sin(firstAngleRadians);

  // Calculate the end of the second shaft
  const secondShaftEndX =
    firstShaftEndX - secondShaftLength * Math.cos(secondAngleRadians);
  const secondShaftEndY =
    firstShaftEndY - secondShaftLength * Math.sin(secondAngleRadians);

  // Draw the first shaft
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(firstShaftEndX, firstShaftEndY);
  ctx.lineWidth = 2;
  ctx.strokeStyle = "black";
  ctx.stroke();

  // Draw the second shaft
  ctx.beginPath();
  ctx.moveTo(firstShaftEndX, firstShaftEndY);
  ctx.lineTo(secondShaftEndX, secondShaftEndY);
  ctx.stroke();

  // Draw the arrowhead at the start of the first shaft
  const leftX = x - arrowheadSize * Math.cos(firstAngleRadians - Math.PI / 6);
  const leftY = y - arrowheadSize * Math.sin(firstAngleRadians - Math.PI / 6);

  const rightX = x - arrowheadSize * Math.cos(firstAngleRadians + Math.PI / 6);
  const rightY = y - arrowheadSize * Math.sin(firstAngleRadians + Math.PI / 6);

  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(leftX, leftY);
  ctx.lineTo(rightX, rightY);
  ctx.closePath();
  ctx.fillStyle = "black";
  ctx.fill();

  // Write text on top of the second shaft
  const midX = (firstShaftEndX + secondShaftEndX) / 2;
  const midY = (firstShaftEndY + secondShaftEndY) / 2;

  ctx.save(); // Save the current context
  ctx.translate(midX, midY); // Move to the midpoint of the second shaft

  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = "black";
  ctx.font = "12px Host Grotesk";
  ctx.fillText(text, 0, -10); // Draw the text slightly above the shaft
  ctx.restore(); // Restore the original context
}

function categorizeBMI(bmi) {
  if (bmi < 18.5) {
    return "underweight";
  } else if (bmi >= 18.5 && bmi <= 24.9) {
    return "normal";
  } else if (bmi >= 25 && bmi <= 29.9) {
    return "overweight";
  } else {
    return "obese";
  }
}
