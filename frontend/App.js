import React, { useState, useEffect } from "react";
import axios from "axios";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

function App() {
  const [weatherData, setWeatherData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const result = await axios.get("http://localhost:5000/api/weather");
      setWeatherData(result.data);
    };
    fetchData();
    const interval = setInterval(fetchData, 5 * 60 * 1000); // Refresh every 5 minutes
    return () => clearInterval(interval);
  }, []);

  const chartData = {
    labels: weatherData.map((data) => new Date(data.date).toLocaleDateString()),
    datasets: [
      {
        label: "Average Temperature",
        data: weatherData.map((data) => data.avgTemp),
        borderColor: "rgb(255, 99, 132)",
        backgroundColor: "rgba(255, 99, 132, 0.5)",
      },
      {
        label: "Maximum Temperature",
        data: weatherData.map((data) => data.maxTemp),
        borderColor: "rgb(53, 162, 235)",
        backgroundColor: "rgba(53, 162, 235, 0.5)",
      },
      {
        label: "Minimum Temperature",
        data: weatherData.map((data) => data.minTemp),
        borderColor: "rgb(75, 192, 192)",
        backgroundColor: "rgba(75, 192, 192, 0.5)",
      },
    ],
  };

  return (
    <div className="App">
      <h1>Weather Monitoring Dashboard</h1>
      <div style={{ width: "80%", margin: "auto" }}>
        <Line data={chartData} />
      </div>
      <table>
        <thead>
          <tr>
            <th>City</th>
            <th>Date</th>
            <th>Avg Temp</th>
            <th>Max Temp</th>
            <th>Min Temp</th>
            <th>Dominant Condition</th>
          </tr>
        </thead>
        <tbody>
          {weatherData.map((data, index) => (
            <tr key={index}>
              <td>{data.city}</td>
              <td>{new Date(data.date).toLocaleDateString()}</td>
              <td>{data.avgTemp.toFixed(2)}°C</td>
              <td>{data.maxTemp.toFixed(2)}°C</td>
              <td>{data.minTemp.toFixed(2)}°C</td>
              <td>{data.dominantCondition}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default App;
