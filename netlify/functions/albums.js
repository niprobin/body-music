const fetch = require("node-fetch");

let cachedData = null;
let cacheTimestamp = null;
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 1 day in milliseconds
const SHEET_URL = "https://script.google.com/macros/s/AKfycbxxDIYpN5J0mxDpaTDoGe3WtzO0FGc6Z8hmULZl4BK2z8XfvQaOSf4fAFw30Zpz9wCP/exec"; // Your Google Sheet Web App URL

exports.handler = async () => {
  const now = Date.now();

  // Check if cached data exists and is still valid
  if (cachedData && cacheTimestamp && now - cacheTimestamp < CACHE_DURATION) {
    console.log("Serving cached data");
    return {
      statusCode: 200,
      body: JSON.stringify(cachedData),
    };
  }

  // Fetch new data from Google Sheets
  try {
    console.log("Fetching new data from Google Sheets");
    const response = await fetch(SHEET_URL);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();

    // Update cache
    cachedData = data;
    cacheTimestamp = now;

    return {
      statusCode: 200,
      body: JSON.stringify(data),
    };
  } catch (error) {
    console.error("Error fetching data:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to fetch data" }),
    };
  }
};
