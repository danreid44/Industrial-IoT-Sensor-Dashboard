import axios from 'axios'; // Importing axios for HTTP requests
import dotenv from 'dotenv';
dotenv.config(); // Load environment variables from .env file


const API_URL = process.env.API_URL // API endpoint

// Function to generate vibration & temperature data
function generateFakeReading() {
  const temperature = (Math.random() * (35- 22) + 22).toFixed(1);  // Between 22.0 and 35.0 °C
  const vibration = (Math.random() * (6.00 - 2.00) + 2.00).toFixed(2); // Between 2.00 and 6.00 mm/s
  const name = 'Motor 01';  // Name of Motor
  return {
    name,
    temperature: parseFloat(temperature),
    vibration: parseFloat(vibration),
    timestamp: new Date().toISOString() // Current timestamp in ISO format
  };
}

// Send data from function to API
async function sendReading() {
  const reading = generateFakeReading();
  try {
    await axios.post(API_URL, reading); // Send POST request to API
    console.log(`Sent: ${reading.name}, Temp = ${reading.temperature}°C, Vibration = ${reading.vibration} mm/s`);
  } catch (err) {
    console.error('Error sending data', err.message); // Log error message
  }
}

// Run every 5 Seconds or based on your requirement
setInterval(sendReading, 5000);
