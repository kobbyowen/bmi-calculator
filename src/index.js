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
const bmiPrime = document.getElementById("bmi-prime");
const ponderalIndex = document.getElementById("ponderal-index");
const healthyWeightForHeight = document.getElementById(
  "healthy-weight-for-height"
);

maleButton.addEventListener("click", (e) => {
  e.target.classList.add("active-gender");
  femaleButton.classList.remove("active-gender");
});

femaleButton.addEventListener("click", (e) => {
  e.target.classList.add("active-gender");
  maleButton.classList.remove("active-gender");
});

document.addEventListener("readystatechange", () => {
  drawBMICanvas(canvas, 30.5);
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

function getArrowCoordinates(angle, centerX, centerY, radius) {
  const modifiedAngle = angle + 90;

  if (modifiedAngle >= 0 && modifiedAngle <= 180) {
    return {
      ...findCoordinatesOnCircle(centerX, centerY, radius, angle),
      firstAngle: 180,
      firstShaftLength: 0,
      secondAngleOffset: 0,
      secondShaftLength: 300,
      text: "normal weight",
    };
  }

  if (modifiedAngle >= 181 && modifiedAngle <= 360) {
    return {
      ...findCoordinatesOnCircle(centerX, centerY, radius, angle),
      firstAngle: 0,
      firstShaftLength: 0,
      secondAngleOffset: 0,
      secondShaftLength: 300,
      text: "normal weight",
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

  const bmi = parseFloat((weight / height ** 2).toFixed(2));
  const bmiPrime = parseFloat((bmi / 25).toFixed(2));
  const ponderalIndex = parseFloat((weight / height ** 3).toFixed(2));
  const minimumHealthyWeight = parseFloat((18.5 * height ** 2).toFixed(2));
  const maximumHealthyWeight = parseFloat((25 * height ** 2).toFixed(2));

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

  bmiPrime.textContent = bmiValues.bmiPrime;
  ponderalIndex.textContent = `${bmiValues.ponderalIndex}kg/m²`;
  healthyWeightForHeight.textContent = `${bmiValues.minimumHealthyWeight}kg - ${bmiValues.maximumHealthyWeight}kg`;
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
  canvas.width = canvas.offsetWidth;
  canvas.height = canvas.offsetHeight + 20;

  const arcWidth = 30;
  const radius = Math.min(0.5 * canvas.width - arcWidth, 120);
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

  if (typeof bmiValue !== "number") return;

  const bmiClassification = categorizeBMI(bmiValue);

  const { startAngle, endAngle } = segments.find(
    (segment) => segment.label === bmiClassification
  );
  const exactAngleForBMI =
    getExactAngleForBMI(bmiValue, startAngle, endAngle) - 90;
  const arrowCoordinates = getArrowCoordinates(
    exactAngleForBMI,
    centerX,
    centerY,
    radius,
    bmiClassification
  );

  drawArrow(
    context,
    arrowCoordinates.x,
    arrowCoordinates.y,
    arrowCoordinates.firstAngle,
    arrowCoordinates.firstShaftLength,
    arrowCoordinates.secondAngleOffset,
    arrowCoordinates.secondShaftLength,
    10,
    categorizeBMI(bmiValue)
  );
}

function getExactAngleForBMI(bmiValue, startAngle, endAngle) {
  const bmiCategories = {
    underweight: { min: 0, max: 18.4 },
    normal: { min: 18.5, max: 24.9 },
    overweight: { min: 25, max: 29.9 },
    obese: { min: 30, max: 40 },
  };

  let category;
  for (const [key, range] of Object.entries(bmiCategories)) {
    if (bmiValue >= range.min && bmiValue <= range.max) {
      category = range;
      break;
    }
  }

  // Handle BMI value outside defined ranges
  if (!category) {
    console.warn(
      "BMI value is outside defined ranges. Returning closest angle."
    );
    return bmiValue < bmiCategories.underweight.min ? startAngle : endAngle;
  }

  // Calculate proportion and interpolate angle
  const proportion = (bmiValue - category.min) / (category.max - category.min);
  const exactAngle = startAngle + proportion * (endAngle - startAngle);

  return exactAngle;
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

  ctx.textAlign = "right";
  ctx.textBaseline = "middle";
  ctx.fillStyle = "black";
  ctx.font = "16px Host Grotesk";
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
