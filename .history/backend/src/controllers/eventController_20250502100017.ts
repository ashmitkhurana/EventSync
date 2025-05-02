import { Request, Response } from 'express';
import { Event, IEvent } from '../models/Event';
import mongoose from 'mongoose';

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
    const { status } = req.body;
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    if (!req.user?.id) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const attendee = {
      id: new mongoose.Types.ObjectId(req.user.id),
      name: req.user.name || 'Anonymous'
    };

    if (status === 'going') {
      event.attendees.push(attendee);
    } else {
      event.attendees = event.attendees.filter(a => a.id.toString() !== req.user?.id);
    }

    await event.save();
    res.json(transformEvent(event));
  } catch {
    res.status(400).json({ message: 'Failed to update RSVP' });
  }
}; 