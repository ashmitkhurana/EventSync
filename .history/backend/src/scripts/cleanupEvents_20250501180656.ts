import mongoose from 'mongoose';
import { Event } from '../models/Event';
import dotenv from 'dotenv';

dotenv.config();

const MOCK_KEYWORDS = ['test', 'fake', 'mock', 'sample', 'demo'];
const LAUNCH_DATE = new Date('2024-01-01'); // Replace with your actual launch date
const YOUR_USER_ID = 'YOUR_USER_ID'; // Replace with your actual user ID

interface EventSummary {
  _id: string;
  title: string;
  description: string;
  date: Date;
  creatorId: string;
  rsvpCount: number;
  needsReview: boolean;
}

async function cleanupEvents() {
  try {
    await mongoose.connect(process.env.MONGODB_URI!);
    console.log('Connected to MongoDB');

    const stats = {
      totalScanned: 0,
      totalDeleted: 0,
      totalKept: 0,
      needsReview: 0
    };

    const deletionLog: { id: string; title: string }[] = [];
    const remainingEvents: EventSummary[] = [];

    // Find all events
    const events = await Event.find({});
    stats.totalScanned = events.length;

    for (const event of events) {
      const isMock = 
        MOCK_KEYWORDS.some(keyword => 
          event.title.toLowerCase().includes(keyword) || 
          event.description.toLowerCase().includes(keyword)
        ) ||
        event._id.toString().startsWith('tmp_') ||
        event._id.toString().startsWith('fake_') ||
        event.createdAt < LAUNCH_DATE;

      if (isMock) {
        // Delete mock event
        await Event.findByIdAndDelete(event._id);
        deletionLog.push({
          id: event._id.toString(),
          title: event.title
        });
        stats.totalDeleted++;
        continue;
      }

      // Validate actual event
      const isValid = 
        event.creatorId === YOUR_USER_ID &&
        event.attendees.length > 0 &&
        new Date(event.date) >= new Date();

      if (isValid) {
        remainingEvents.push({
          _id: event._id.toString(),
          title: event.title,
          description: event.description,
          date: event.date,
          creatorId: event.creatorId,
          rsvpCount: event.attendees.length,
          needsReview: false
        });
        stats.totalKept++;
      } else {
        remainingEvents.push({
          _id: event._id.toString(),
          title: event.title,
          description: event.description,
          date: event.date,
          creatorId: event.creatorId,
          rsvpCount: event.attendees.length,
          needsReview: true
        });
        stats.needsReview++;
      }
    }

    // Output results
    console.log('\n=== Deletion Log ===');
    deletionLog.forEach(log => {
      console.log(`Deleted: ${log.id} - ${log.title}`);
    });

    console.log('\n=== Remaining Events ===');
    remainingEvents.forEach(event => {
      console.log(`\nEvent: ${event.title}`);
      console.log(`ID: ${event._id}`);
      console.log(`Description: ${event.description}`);
      console.log(`Date: ${event.date}`);
      console.log(`Creator: ${event.creatorId}`);
      console.log(`RSVP Count: ${event.rsvpCount}`);
      if (event.needsReview) {
        console.log('⚠️ Needs Review');
      }
    });

    console.log('\n=== Summary ===');
    console.log(`Total Events Scanned: ${stats.totalScanned}`);
    console.log(`Total Deleted: ${stats.totalDeleted}`);
    console.log(`Total Kept: ${stats.totalKept}`);
    console.log(`Needs Review: ${stats.needsReview}`);

  } catch (error) {
    console.error('Error during cleanup:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the cleanup
cleanupEvents(); 