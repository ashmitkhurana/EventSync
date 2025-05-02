import mongoose from 'mongoose';
import { Event } from '../models/Event';
import dotenv from 'dotenv';

dotenv.config();

async function cleanupEvents() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/eventsync');
    console.log('Connected to MongoDB');

    // Delete events older than 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const result = await Event.deleteMany({
      startTime: { $lt: thirtyDaysAgo }
    });

    console.log(`Deleted ${result.deletedCount} old events`);

    // Clean up any events with invalid data
    const cleanupResult = await Event.deleteMany({
      $or: [
        { title: { $exists: false } },
        { startTime: { $exists: false } },
        { endTime: { $exists: false } },
        { location: { $exists: false } },
        { description: { $exists: false } },
        { organizer: { $exists: false } }
      ]
    });

    console.log(`Deleted ${cleanupResult.deletedCount} invalid events`);

  } catch (error) {
    console.error('Error during cleanup:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the cleanup
cleanupEvents().catch(console.error); 