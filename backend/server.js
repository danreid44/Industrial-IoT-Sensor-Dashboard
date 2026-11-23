import dotenv from 'dotenv'; // Load environment variables from .env

import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import Sensor from './models/sensor.js';

dotenv.config();

const app = express(); // Create an Express application

const mongoURI = process.env.MONGO_URI;  // Get from .env file

// Middleware
app.use(express.json()); // Allows JSON requests
app.use(cors()); // Enables cross-origin requests

// Connect to MongoDB
mongoose.connect(mongoURI)
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.error('MongoDB Connection Error:', err));


// API Route to Get Sensor Data
app.get('/sensors', async (req, res) => {
  try {
    const rawLimit = req.query.limit; // Get limit from query parameters
    const finalLimit = rawLimit === undefined ? 50 : Number(rawLimit); // Default to 50 if not provided

    // Limit must be an integer between 1 and 500
    if (!Number.isInteger(finalLimit) || finalLimit < 1 || finalLimit > 500) {
      return res.status(400).json({
        error: 'Limit must be an integer between 1 and 500',
      });
    }

    // Optional exact sensor-name filter
    const name = req.query.name;
    if (name !== undefined && typeof name !== 'string') { // Name must be a string if provided
      return res.status(400).json({
        error: 'Name must be a string',
      });
    }

    // Fetch the most recent records matching the optional sensor name
    const sensors = await Sensor.find(name === undefined ? {} : { name })
      .sort({ timestamp: -1 }) // Sort by timestamp descending
      .limit(finalLimit); // Limit the number of records returned
    res.json(sensors);

  } catch (error) { // Catch any errors during the database query
    console.error('Error fetching sensor data:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


// API Route to Post Sensor Data
app.post('/sensors', async (req, res) => {
  const { name, temperature, vibration, timestamp } = req.body ?? {};
  const errors = [];

  if (!req.body || typeof req.body !== 'object' || Array.isArray(req.body)) {
    return res.status(400).json({ error: 'Request body must be an object' });
  }
  if (typeof name !== 'string' || name.trim().length === 0) {
    errors.push('Name must be a non-empty string');
  }
  if (typeof temperature !== 'number' || !Number.isFinite(temperature)) {
    errors.push('Temperature must be a finite number');
  }
  if (typeof vibration !== 'number' || !Number.isFinite(vibration)) {
    errors.push('Vibration must be a finite number');
  }
  if (timestamp !== undefined &&
      (typeof timestamp !== 'string' || Number.isNaN(Date.parse(timestamp)))) {
    errors.push('Timestamp must be a valid date string');
  }
  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }

  try {
    const newSensor = new Sensor(req.body);
    await newSensor.save();
    res.status(201).json(newSensor);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// API Route to Patch Sensor Data
app.patch('/sensors/:id', async (req, res) => {
  try {
    const updatedSensor = await Sensor.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedSensor) {
      return res.status(404).json({ error: 'Sensor not found' });
    }
    res.send(updatedSensor);
  } catch (error) {
    console.error('Error updating sensor data:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


// API Route to Delete Sensor Data
app.delete('/sensors/:id', async (req, res) => {
  try {
    const deletedSensor = await Sensor.findByIdAndDelete(req.params.id);
    if (!deletedSensor) {
      return res.status(404).json({ error: 'Sensor not found' });
    }
    res.send({ message: 'Sensor deleted' });
  } catch (error) {
    console.error('Error deleting sensor data:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Define Port and Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
