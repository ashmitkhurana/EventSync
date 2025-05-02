import mongoose from 'mongoose';
import { Event } from '../models/Event';
import dotenv from 'dotenv';

dotenv.config();

async function cleanupEvents() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/eventsync');
    console.log('Connected to MongoDB');

    // Delete all mock events
    // Mock events typically have these characteristics:
    // 1. They might have specific titles or descriptions indicating they're mock data
    // 2. They might be created by system users or have specific patterns
    const result = await Event.deleteMany({
      $or: [
        { title: { $regex: /mock|sample|test|demo/i } },
        { description: { $regex: /mock|sample|test|demo/i } },
        { isMock: true }, // If you have this field
        { createdBy: { $exists: false } }, // Events without a creator
        { organizer: { $regex: /system|admin|mock/i } }
      ]
    });

    console.log(`Deleted ${result.deletedCount} mock events`);

    // Log remaining events for verification
    const remainingEvents = await Event.find({});
    console.log(`Remaining events: ${remainingEvents.length}`);
    console.log('Remaining events details:');
    remainingEvents.forEach(event => {
      console.log(`- ${event.title} (Created by: ${event.organizer})`);
    });

  } catch (error) {
    console.error('Error during cleanup:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the cleanup
cleanupEvents().catch(console.error); 