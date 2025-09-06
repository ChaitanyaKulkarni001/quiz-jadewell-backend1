// const sqlite3 = require("sqlite3").verbose();
// const db = new sqlite3.Database("./tcm.db");
// db.run(
//   `INSERT INTO herbal_formulas (user_id, formula_name, description, ingredients_json, created_at) VALUES (?, ?, ?, ?, ?)`,
//   [1, "Liver Qi Harmonizer", "Supports healthy liver function and reduces stress.", f1Ingredients, now]
// );

// db.run(
//   `INSERT INTO herbal_formulas (user_id, formula_name, description, ingredients_json, created_at) VALUES (?, ?, ?, ?, ?)`,
//   [2, "Qi Tonic Formula", "Enhances energy levels and immune resilience.", f2Ingredients, now]
// );
// test.js
// import fetch from "node-fetch"; // if using Node <18, otherwise native fetch works

const USER_ID = 1; // change to the user ID you want to test
const API_URL = `http://localhost:5000/api/formulas/user/${USER_ID}`;

async function getFormulas() {
  try {
    const response = await fetch(API_URL);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

    const data = await response.json();
    console.log("All formulas for user:", USER_ID);
    console.log(JSON.stringify(data, null, 2));
  } catch (err) {
    console.error("Error fetching formulas:", err);
  }
}

getFormulas();
