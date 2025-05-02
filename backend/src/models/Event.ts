import mongoose, { Document, Schema } from 'mongoose';

// Interface for the Event document
export interface IEvent extends Document {
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  imageUrl: string;
  organizer: {
    id: mongoose.Types.ObjectId;
    name: string;
    avatar?: string;
  };
  categories: string[];
  isPublic: boolean;
  maxAttendees: number;
  attendees: {
    id: mongoose.Types.ObjectId;
    name: string;
    avatar?: string;
  }[];
  rsvpAttendees: {
    userId: mongoose.Types.ObjectId;
    timestamp: Date;
  }[];
  createdAt: Date;
}

const EventSchema = new Schema<IEvent>({
  title: {
    type: String,
    required: [true, 'Event title is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Event description is required'],
    trim: true
  },
  date: {
    type: String,
    required: [true, 'Event date is required']
  },
  time: {
    type: String,
    required: [true, 'Event time is required']
  },
  location: {
    type: String,
    required: [true, 'Event location is required'],
    trim: true
  },
  imageUrl: {
    type: String,
    required: [true, 'Event image URL is required']
  },
  organizer: {
    id: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    name: {
      type: String,
      required: true
    },
    avatar: String
  },
  categories: [{
    type: String,
    required: true
  }],
  isPublic: {
    type: Boolean,
    default: true
  },
  maxAttendees: {
    type: Number,
    required: [true, 'Maximum attendees is required'],
    min: [1, 'Maximum attendees must be at least 1']
  },
  attendees: [{
    id: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    name: {
      type: String,
      required: true
    },
    avatar: String
  }],
  rsvpAttendees: [{
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Add indexes for better query performance
EventSchema.index({ title: 'text', description: 'text' });
EventSchema.index({ date: 1 });
EventSchema.index({ categories: 1 });
EventSchema.index({ 'organizer.id': 1 });
EventSchema.index({ 'rsvpAttendees.userId': 1 });

export const Event = mongoose.model<IEvent>('Event', EventSchema); 