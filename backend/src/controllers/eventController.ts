import { Request, Response } from 'express';
import { Event, IEvent } from '../models/Event';
import mongoose from 'mongoose';
import { User } from '../models/User';

interface AuthRequest extends Request {
  user?: {
    id: string;
    name?: string;
  };
}

// Helper function to transform MongoDB document to response format
const transformEvent = (event: mongoose.Document<unknown, object, IEvent> & IEvent) => {
  const transformed = event.toObject();
  transformed.id = transformed._id.toString();
  delete transformed._id;
  delete transformed.__v;
  return transformed;
};

export const createEvent = async (req: AuthRequest, res: Response) => {
  try {
    const { title, description, date, time, location, categories, imageUrl, maxAttendees } = req.body;
    
    const event = await Event.create({
      title,
      description,
      date,
      time,
      location,
      categories,
      imageUrl,
      maxAttendees,
      organizer: {
        id: req.user?.id,
        name: req.user?.name || 'Anonymous'
      }
    });
    
    res.status(201).json(transformEvent(event));
  } catch {
    res.status(400).json({ message: 'Failed to create event' });
  }
};

export const getEvents = async (req: Request, res: Response) => {
  try {
    const events = await Event.find({});
    res.status(200).json(events.map(transformEvent));
  } catch {
    res.status(500).json({ message: 'Failed to fetch events' });
  }
};

export const getEventById = async (req: Request, res: Response) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    res.json(transformEvent(event));
  } catch {
    res.status(500).json({ message: 'Failed to fetch event' });
  }
};

export const updateEvent = async (req: AuthRequest, res: Response) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    if (event.organizer.id.toString() !== req.user?.id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }
    
    const updatedEvent = await Event.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    
    if (!updatedEvent) {
      return res.status(404).json({ message: 'Event not found after update' });
    }
    
    res.json(transformEvent(updatedEvent));
  } catch {
    res.status(400).json({ message: 'Failed to update event' });
  }
};

export const deleteEvent = async (req: AuthRequest, res: Response) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    if (event.organizer.id.toString() !== req.user?.id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }
    
    await Event.findByIdAndDelete(req.params.id);
    res.json({ message: 'Event deleted' });
  } catch {
    res.status(500).json({ message: 'Failed to delete event' });
  }
};

export const rsvpToEvent = async (req: AuthRequest, res: Response) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    if (!req.user?.id) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    // Check if user has already RSVPed
    const alreadyRsvped = event.rsvpAttendees.some(
      attendee => attendee.userId.toString() === req.user?.id
    );

    if (alreadyRsvped) {
      return res.status(400).json({ message: 'You have already RSVPed to this event' });
    }

    // Fetch the complete user data to get the real name
    const userData = await User.findById(req.user.id).select('name avatar');
    if (!userData) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Add user to rsvpAttendees
    event.rsvpAttendees.push({
      userId: new mongoose.Types.ObjectId(req.user.id),
      timestamp: new Date()
    });

    // Also update the legacy attendees array for backward compatibility
    const attendee = {
      id: new mongoose.Types.ObjectId(req.user.id),
      name: userData.name, // Use the real name from the database
      avatar: userData.avatar
    };
    
    event.attendees.push(attendee);

    await event.save();
    res.status(200).json({ 
      message: 'Successfully RSVPed to event',
      event: transformEvent(event)
    });
  } catch {
    res.status(400).json({ message: 'Failed to RSVP to event' });
  }
};

export const cancelRsvp = async (req: AuthRequest, res: Response) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    if (!req.user?.id) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    // Remove user from rsvpAttendees
    event.rsvpAttendees = event.rsvpAttendees.filter(
      attendee => attendee.userId.toString() !== req.user?.id
    );

    // Also update the legacy attendees array for backward compatibility
    event.attendees = event.attendees.filter(
      attendee => attendee.id.toString() !== req.user?.id
    );

    await event.save();
    res.status(200).json({ 
      message: 'Successfully canceled RSVP',
      event: transformEvent(event)
    });
  } catch {
    res.status(400).json({ message: 'Failed to cancel RSVP' });
  }
};

export const getUserRsvpedEvents = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.params.userId;
    
    // Ensure the user can only access their own RSVPed events
    if (req.user?.id !== userId) {
      return res.status(401).json({ message: 'Not authorized to view these RSVPs' });
    }
    
    const events = await Event.find({
      'rsvpAttendees.userId': new mongoose.Types.ObjectId(userId)
    });
    
    res.status(200).json(events.map(transformEvent));
  } catch {
    res.status(500).json({ message: 'Failed to fetch RSVPed events' });
  }
}; 