// Required dependencies
const express = require('express');
const cors = require('cors'); // Allows frontend-backend communication
const calculateRisk = require('./riskCalculator'); // Import the risk calculation module
const path = require('path');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;


app.use(cors());
app.use(express.json()); // Parses json request bodies
// Test route to verify server is running
app.use(express.static(path.join(__dirname, 'public')));


// Main endpoint: POST /api/risk
// - This endpoint receives user data (age, height, weight, BP, family history)
// - Then returns the calculated risk as JSON to the client
  app.post("/api/calculate-risk", (req,res) => {
  try {
    // Extract data from request body, with fallback to empty object if undefined
    const b = req.body || {};

    // - Converts all numeric inputs from strings to numbers
    // - Converts familyHistory to an array (if user sent a comma-separated string)
    const payload = {
      age: Number(b.age),
      heightFt: Number(b.heightFt),
      heightIn: Number(b.heightIn),
      weight: Number(b.weight),
      systolic: Number(b.systolic),
      diastolic: Number(b.diastolic),

      familyHistory: Array.isArray(b.familyHistory)
        ? b.familyHistory
        : String(b.familyHistory || "")
            .split(",")              // split comma-separated string
            .map(s => s.trim())      // remove spaces
            .filter(Boolean)         // remove empty strings
    };

    // Run the main risk calculation logic using the imported function
    const result = calculateRisk(payload);

    // If validation errors exist, return 400 Bad Request with an error message
    if (result?.error) return res.status(400).json({ error: result.error });

    // Otherwise, return the calculated risk result to the client (200 OK)
    return res.json(result);
  } catch (e) {
    // If any unexpected error happens (e.g., runtime issue), log it and send a 500 response
    console.error(e);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// Listens for incoming requests on the defined PORT.
app.listen(PORT, () => {
  console.log(`Risk API listening on port ${PORT}`);
});