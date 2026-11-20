import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { fileURLToPath } from 'node:url';
import Sensor from './models/sensor.js';

dotenv.config({ path: fileURLToPath(new URL('.env', import.meta.url)) });

const seedData = async () => {
  const mongoUri = process.env.MONGO_URI?.trim();
  if (!mongoUri || !/^mongodb(?:\+srv)?:\/\//i.test(mongoUri)) {
    throw new Error(
      'MONGO_URI must start with "mongodb://" or "mongodb+srv://". Check backend/.env and any MONGO_URI environment variable.',
    );
  }

  try {
    await mongoose.connect(mongoUri);

    const { deletedCount } = await Sensor.deleteMany({});
    console.log(
      `Deleted ${deletedCount} sensor records from ${mongoose.connection.name}.${Sensor.collection.collectionName}`,
    );

    const insertedSensors = await Sensor.insertMany([
      { name: 'Motor 01', temperature: 28.5, vibration: 2.95 },
      { name: 'Motor 01', temperature: 29.4, vibration: 4.67 },
      { name: 'Motor 01', temperature: 27.9, vibration: 3.18 },
      { name: 'Motor 01', temperature: 29.1, vibration: 4.19 },
    ]);
    const recordCount = await Sensor.countDocuments();
    console.log(
      `Inserted ${insertedSensors.length} seed records; ${mongoose.connection.name}.${Sensor.collection.collectionName} now contains ${recordCount} sensor records`,
    );
  } finally {
    await mongoose.disconnect();
  }
};

seedData().catch((error) => {
  console.error('Error seeding sensor data:', error);
  process.exitCode = 1;
});
