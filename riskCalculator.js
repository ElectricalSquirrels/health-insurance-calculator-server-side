// server/riskCalculator.js

// Convert height in feet and inches to meters (for height calculation)
function toMeters(feet, inches) {
  const totalInches = (feet * 12) + inches;
  return totalInches * 0.0254;
}

// Calculate BMI given weight in pounds and height in meters
function calculateBMI(weightLbs, heightMeters) {
  const weightKg = weightLbs * 0.453592;
  return weightKg / (heightMeters * heightMeters);
}

// Calculate BMI category and points
function categorizeBMI(bmi) {
  if (bmi < 25) return { category: "normal", points: 0 };
  if (bmi < 30) return { category: "overweight", points: 30 };
  return { category: "obese", points: 75 };
}

// Calculate blood pressure category and points
function categorizeBloodPressure(systolic, diastolic) {
  if (systolic < 120 && diastolic < 80) return { category: "normal", points: 0 };
  if (systolic < 130 && diastolic < 80) return { category: "elevated", points: 15 };
  if (systolic < 140 && diastolic < 90) return { category: "stage 1", points: 30 };
  if (systolic < 180 && diastolic < 120) return { category: "stage 2", points: 75 };
  return { category: "crisis", points: 100 };
}

// Calculate age category points
function categorizeAge(age) {
  if (age < 30) return 0;
  if (age < 45) return 10;
  if (age < 60) return 20;
  return 30;
}

// Calculate family history points
function calculateFamilyHistoryPoints(familyHistory) {
  const conditions = ["diabetes", "cancer", "alzheimers"];
  return familyHistory.reduce((sum, c) => {
    if (conditions.includes(c.toLowerCase())) sum += 10;
    return sum;
  }, 0);
}

// Validate user input values for age, height, weight, and blood pressure
function validateInput(age, feet, inches, weight, systolic, diastolic) {
  const errors = [];
  if (age <= 0 || age > 120) errors.push("Age must be between 1 and 120.");
  if (feet < 2 || feet > 8) errors.push("Height must be between 2 and 8 feet.");
  if (inches < 0 || inches > 11) errors.push("Inches must be between 0 and 11.");
  if (weight < 50 || weight > 700) errors.push("Weight must be between 50 and 700 lbs.");
  if (systolic < 70 || systolic > 250) errors.push("Systolic pressure must be between 70 and 250.");
  if (diastolic < 40 || diastolic > 150) errors.push("Diastolic pressure must be between 40 and 150.");
  return errors;
}

// Validate and calculate risk based on user input
function calculateRisk(user) {
  const { age, heightFt, heightIn, weight, systolic, diastolic, familyHistory } = user;
  const validationErrors = validateInput(age, heightFt, heightIn, weight, systolic, diastolic);
  if (validationErrors.length > 0) {
    return { error: validationErrors.join(" ") };
  }

  // Perform total calculations
  const heightM = toMeters(heightFt, heightIn);
  const bmi = calculateBMI(weight, heightM);
  const bmiInfo = categorizeBMI(bmi);
  const bpInfo = categorizeBloodPressure(systolic, diastolic);
  const agePoints = categorizeAge(age);
  const familyPoints = calculateFamilyHistoryPoints(familyHistory);

  const totalScore = agePoints + bmiInfo.points + bpInfo.points + familyPoints;

  // Determine total risk category
  let riskCategory;
  if (totalScore <= 20) riskCategory = "low risk";
  else if (totalScore <= 50) riskCategory = "moderate risk";
  else if (totalScore <= 75) riskCategory = "high risk";
  else riskCategory = "uninsurable";

  // Return detailed results
  return {
    bmi: bmi.toFixed(1),
    bmiCategory: bmiInfo.category,
    bloodPressureCategory: bpInfo.category,
    totalScore,
    riskCategory
  };
}

module.exports = calculateRisk;