const express = require("express");
const axios = require("axios");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI);

// Define Weather Schema
const weatherSchema = new mongoose.Schema({
  city: String,
  date: Date,
  avgTemp: Number,
  maxTemp: Number,
  minTemp: Number,
  dominantCondition: String,
  feelsLike: Number,
});

const Weather = mongoose.model("Weather", weatherSchema);

// OpenWeatherMap API configuration
const API_KEY = process.env.OPENWEATHERMAP_API_KEY;

const cities = [
  "Delhi",
  "Mumbai",
  "Chennai",
  "Bangalore",
  "Kolkata",
  "Hyderabad",
];

// In-memory cache for weather data
let weatherDataCache = [];

// Function to fetch weather data
async function fetchWeatherData(city) {
  try {
    const response = await axios.get(
      `http://api.openweathermap.org/data/2.5/weather?q=${city},in&appid=${API_KEY}`
    );
    return response.data;
  } catch (error) {
    console.error(`Error fetching weather data for ${city}:`, error);
    return null;
  }
}

// Function to convert Kelvin to Celsius
function kelvinToCelsius(kelvin) {
  return kelvin - 273.15;
}

// Function to process weather data
async function processWeatherData() {
  const updatedWeatherData = [];
  for (const city of cities) {
    const data = await fetchWeatherData(city);
    if (data) {
      const temp = kelvinToCelsius(data.main.temp);
      const feelsLike = kelvinToCelsius(data.main.feels_like);
      const condition = data.weather[0].main;

      // Prepare data for cache
      updatedWeatherData.push({
        city,
        date: new Date(),
        avgTemp: temp,
        maxTemp: temp,
        minTemp: temp,
        dominantCondition: condition,
        feelsLike: feelsLike,
      });

      // Check for alerts (example: temperature exceeds 35°C)
      if (temp > 35) {
        console.log(`ALERT: Temperature in ${city} exceeds 35°C!`);
      }
    }
  }

  // Update the in-memory cache
  weatherDataCache = updatedWeatherData;
}

// Function to save daily report to MongoDB
async function saveDailyReport() {
  const today = new Date().setHours(0, 0, 0, 0); // Set time to midnight

  for (const city of cities) {
    const cityWeather = weatherDataCache.find((data) => data.city === city);

    if (cityWeather) {
      let dailySummary = await Weather.findOne({ city, date: today });

      if (!dailySummary) {
        dailySummary = new Weather({
          city,
          date: today,
          avgTemp: cityWeather.avgTemp,
          maxTemp: cityWeather.maxTemp,
          minTemp: cityWeather.minTemp,
          dominantCondition: cityWeather.dominantCondition,
          feelsLike: cityWeather.feelsLike,
        });
      } else {
        dailySummary.avgTemp = (dailySummary.avgTemp + cityWeather.avgTemp) / 2;
        dailySummary.maxTemp = Math.max(
          dailySummary.maxTemp,
          cityWeather.maxTemp
        );
        dailySummary.minTemp = Math.min(
          dailySummary.minTemp,
          cityWeather.minTemp
        );
        dailySummary.dominantCondition = cityWeather.dominantCondition;
        dailySummary.feelsLike =
          (dailySummary.feelsLike + cityWeather.feelsLike) / 2; // Update average feels_like
      }

      await dailySummary.save();
    }
  }
}

// Schedule to save daily report at midnight
const saveReportAtMidnight = () => {
  const now = new Date();
  const midnight = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() + 1,
    0,
    0,
    0
  );
  const timeUntilMidnight = midnight - now;

  setTimeout(async () => {
    await saveDailyReport(); // Save the daily report
    saveReportAtMidnight(); // Reschedule for the next day
  }, timeUntilMidnight);
};

// Start the schedule to save daily reports
saveReportAtMidnight();

// Schedule weather data processing (every 5 minutes)
setInterval(processWeatherData, 5 * 60 * 1000);

// Initial fetch to populate cache
processWeatherData();

// API endpoint to get current weather data
app.get("/api/weather", (req, res) => {
  res.json(weatherDataCache);
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
