import mongoose from 'mongoose';
import { Event } from '../models/Event';
import dotenv from 'dotenv';

dotenv.config();

async function deleteAllEvents() {
  try {
    // Connect to MongoDB
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/eventsync');
    console.log('Connected to MongoDB');

    // Delete all events
    const result = await Event.deleteMany({});
    console.log(`Successfully deleted ${result.deletedCount} events`);

  } catch (error) {
    console.error('Error deleting events:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the function
deleteAllEvents(); 