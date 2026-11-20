import { useEffect, useState } from "react";
import axios from "axios";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

// Define the props for the Dashboard component
interface DashboardProps {
  motorName: string;
}

// Define the structure of a reading
interface Reading {
  _id: string;
  name: string;
  temperature: number;
  vibration: number;
  timestamp: string;
}

// Get the API URL from environment variables
const API_URL = import.meta.env.VITE_API_URL;

// Define the dashboard component that takes motorName as a prop
const Dashboard = ({ motorName }: DashboardProps) => {
  const [readings, setReadings] = useState<Reading[]>([]); // State to hold the sensor readings
  const [loading, setLoading] = useState(true); // State to indicate if the first load is in progress
  const [error, setError] = useState(""); // State to hold any error messages

  // useEffect hook to fetch sensor readings when the component mounts
  useEffect(() => {
    const controller = new AbortController(); // Create an AbortController to cancel the request if needed

    // Function to fetch sensor readings from the API
    const fetchReadings = async () => {
      try {
        const response = await axios.get<Reading[]>(`${API_URL}/sensors`, {
          signal: controller.signal,
        }); // Make a GET request to the API to fetch sensor readings
        setReadings(response.data); // Update the readings state with the fetched data
        setError(""); // Clear a previous error after a successful poll
      } catch (fetchError: unknown) {
        if (!controller.signal.aborted) {
          console.error("Failed to fetch sensor data:", fetchError); // Log the error to the console if the request was not aborted
          setError("Failed to fetch sensor data");
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false); // Polling updates never call setLoading(true), so only the first load shows this state
        }
      }
    };

    void fetchReadings();
    const intervalId = window.setInterval(() => {
      void fetchReadings();
    }, 5000);

    return () => {
      window.clearInterval(intervalId);
      controller.abort();
    };
  }, []);

  if (loading) {
    return <p className="text-center">Loading sensor data...</p>;
  }

  const latestReading = readings[0];
  const chartReadings = [...readings].reverse();

  return (
    <section className="w-full rounded-2xl bg-gray-900 p-6 text-gray-100 shadow-lg">
      <h2 className="mb-4 text-xl font-semibold">{motorName} Readings</h2>

      {error && (
        <p className="mb-4 text-center text-red-500">{error}</p>
      )}

      {latestReading && (
        <div className="mb-6 rounded-xl border border-gray-700 bg-gray-800 p-6">
          <p className="text-sm uppercase text-gray-400">Latest Reading</p>
          <p className="mt-2 text-3xl font-bold">
            {latestReading.temperature.toFixed(2)}°C
          </p>
          <p className="mt-1 text-lg text-gray-200">
            Vibration: {latestReading.vibration.toFixed(2)} mm/s
          </p>
          <p className="mt-2 text-sm text-gray-400">
            {latestReading.name} ·{" "}
            {new Date(latestReading.timestamp).toLocaleString()}
          </p>
        </div>
      )}

      <div className="mb-6 rounded-2xl bg-gray-900 p-6 shadow-lg">
        <h2 className="mb-4 text-xl font-semibold">Temperature Over Time</h2>
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={chartReadings}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="timestamp"
              tickFormatter={(time) => new Date(time).toLocaleTimeString()}
              stroke="#f3f4f6"
              tick={{ fill: "#f3f4f6" }}
            />
            <YAxis
              stroke="#f3f4f6"
              tick={{ fill: "#f3f4f6" }}
            />
            <Tooltip
              labelFormatter={(label) =>
                new Date(String(label)).toLocaleString()
              }
              contentStyle={{
                background: "#1a1a1a",
                border: "1px solid #333",
                borderRadius: "8px",
              }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="temperature"
              stroke="#4f46e5"
              strokeWidth={2}
              name="Temperature (°C)"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="mb-6 rounded-2xl bg-gray-900 p-6 shadow-lg">
        <h2 className="mb-4 text-xl font-semibold">Vibration Over Time</h2>
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={chartReadings}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="timestamp"
              tickFormatter={(time) => new Date(time).toLocaleTimeString()}
              stroke="#f3f4f6"
              tick={{ fill: "#f3f4f6" }}
            />
            <YAxis
              stroke="#f3f4f6"
              tick={{ fill: "#f3f4f6" }}
            />
            <Tooltip
              labelFormatter={(label) =>
                new Date(String(label)).toLocaleString()
              }
              contentStyle={{
                background: "#1a1a1a",
                border: "1px solid #333",
                borderRadius: "8px",
              }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="vibration"
              stroke="#059669"
              strokeWidth={2}
              name="Vibration (mm/s)"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-100">
          <thead>
            <tr className="text-left text-sm uppercase">
              <th className="p-3">Sensor Name</th>
              <th className="p-3">Temperature (°C)</th>
              <th className="p-3">Vibration (mm/s)</th>
              <th className="p-3">Timestamp</th>
            </tr>
          </thead>
          <tbody>
            {readings.map((reading) => (
              <tr key={reading._id} className="border-t hover:bg-gray-800">
                <td className="p-3">{reading.name}</td>
                <td className="p-3">{reading.temperature.toFixed(2)}</td>
                <td className="p-3">{reading.vibration.toFixed(2)}</td>
                <td className="p-3">
                  {new Date(reading.timestamp).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default Dashboard;
