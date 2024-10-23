import React, { useState, useEffect } from "react";
import axios from "axios";
import "./App.css"; // Import the CSS file

function App() {
  const [weatherData, setWeatherData] = useState([]);
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await axios.get("http://localhost:5000/api/weather");
        console.log(result.data);

        setWeatherData(result.data);
        checkForAlerts(result.data); // Check for alerts whenever data is fetched
      } catch (error) {
        console.error("Error fetching weather data:", error);
      }
    };

    fetchData(); // Fetch data immediately on component mount
    const interval = setInterval(fetchData, 5 * 60 * 1000); // Refresh every 5 minutes
    return () => clearInterval(interval);
  }, []);

  const checkForAlerts = (data) => {
    const newAlerts = data
      .filter((item) => item.avgTemp > 35) // Example alert condition
      .map((item) => `ALERT: Temperature in ${item.city} exceeds 35°C!`);

    setAlerts(newAlerts);
  };

  return (
    <div className="App">
      <h1>Weather Monitoring Dashboard</h1>

      {/* Display alerts */}
      {alerts.length > 0 && (
        <div className="alerts">
          <h2>Alerts:</h2>
          <ul>
            {alerts.map((alert, index) => (
              <li key={index}>{alert}</li>
            ))}
          </ul>
        </div>
      )}

      <table className="table">
        <thead>
          <tr>
            <th className="table-header">City</th>
            <th className="table-header">Date</th>
            <th className="table-header">Avg Temp</th>
            <th className="table-header">Feels Like</th>{" "}
            {/* New column for feels_like */}
            <th className="table-header">Max Temp</th>
            <th className="table-header">Min Temp</th>
            <th className="table-header">Dominant Condition</th>
          </tr>
        </thead>
        <tbody>
          {weatherData.map((data, index) => (
            <tr key={index}>
              <td className="table-cell">{data.city}</td>
              <td className="table-cell">
                {new Date(data.date).toLocaleDateString()}
              </td>
              <td className="table-cell">{data.avgTemp.toFixed(2)}°C</td>
              <td className="table-cell">{data.feelsLike.toFixed(2)}°C</td>{" "}
              {/* Display feels_like */}
              <td className="table-cell">{data.maxTemp.toFixed(2)}°C</td>
              <td className="table-cell">{data.minTemp.toFixed(2)}°C</td>
              <td className="table-cell">{data.dominantCondition}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default App;
