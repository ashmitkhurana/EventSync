import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { Event } from '../models/Event';
import { User } from '../models/User';

// Create event (auth, organizer-only)
export const createEvent = async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }

    const { title, description, category, date, time, location } = req.body;

    const event = new Event({
      title,
      description,
      category,
      date,
      time,
      location,
      organizer: req.user!.id,
      attendees: [], // Initialize empty attendees array
    });

    await event.save();

    res.status(201).json({
      success: true,
      event,
    });
  } catch (error) {
    console.error('Create event error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating event',
    });
  }
};

// Fetch all events (public)
export const getAllEvents = async (req: Request, res: Response) => {
  try {
    const { category, date } = req.query;
    const query: any = {};

    // Apply filters if provided
    if (category) {
      query.category = category;
    }
    if (date) {
      // Assuming date is in YYYY-MM-DD format
      const searchDate = new Date(date as string);
      query.date = {
        $gte: searchDate,
        $lt: new Date(searchDate.getTime() + 24 * 60 * 60 * 1000),
      };
    }

    const events = await Event.find(query)
      .populate('organizer', 'name email')
      .sort({ date: 1 });

    res.json({
      success: true,
      events,
    });
  } catch (error) {
    console.error('Get events error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching events',
    });
  }
};

// Fetch one event by ID (public)
export const getEventById = async (req: Request, res: Response) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('organizer', 'name email')
      .populate('attendees', 'name email');

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found',
      });
    }

    res.json({
      success: true,
      event,
    });
  } catch (error) {
    console.error('Get event error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching event',
    });
  }
};

// Update event (auth, only event organizer)
export const updateEvent = async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }

    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found',
      });
    }

    // Check if the current user is the organizer
    if (event.organizer.toString() !== req.user!.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this event',
      });
    }

    const { title, description, category, date, time, location } = req.body;
    
    event.title = title || event.title;
    event.description = description || event.description;
    event.category = category || event.category;
    event.date = date || event.date;
    event.time = time || event.time;
    event.location = location || event.location;

    await event.save();

    res.json({
      success: true,
      event,
    });
  } catch (error) {
    console.error('Update event error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating event',
    });
  }
};

// Delete event (auth, only event organizer)
export const deleteEvent = async (req: Request, res: Response) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found',
      });
    }

    // Check if the current user is the organizer
    if (event.organizer.toString() !== req.user!.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this event',
      });
    }

    await event.deleteOne();

    res.json({
      success: true,
      message: 'Event deleted successfully',
    });
  } catch (error) {
    console.error('Delete event error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting event',
    });
  }
};

// RSVP to event (auth)
export const rsvpToEvent = async (req: Request, res: Response) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found',
      });
    }

    // Check if user is already RSVP'd
    if (event.attendees.includes(req.user!.id as any)) {
      return res.status(400).json({
        success: false,
        message: 'Already RSVP\'d to this event',
      });
    }

    event.attendees.push(req.user!.id);
    await event.save();

    res.json({
      success: true,
      message: 'Successfully RSVP\'d to event',
    });
  } catch (error) {
    console.error('RSVP error:', error);
    res.status(500).json({
      success: false,
      message: 'Error RSVP\'ing to event',
    });
  }
};

// Get organizer dashboard
export const getOrganizerDashboard = async (req: Request, res: Response) => {
  try {
    // Get all events by this organizer
    const events = await Event.find({ organizer: req.user!.id })
      .sort({ date: 1 });

    const now = new Date();
    const upcomingEvents = events.filter(event => event.date >= now);

    // Find most popular event (event with most attendees)
    let mostPopularEvent = events.reduce((prev, current) => 
      (prev.attendees.length > current.attendees.length) ? prev : current
    );

    res.json({
      success: true,
      dashboard: {
        totalEvents: events.length,
        upcomingEvents: upcomingEvents.map(event => ({
          title: event.title,
          date: event.date,
          attendeeCount: event.attendees.length,
        })),
        mostPopularEvent: mostPopularEvent ? {
          title: mostPopularEvent.title,
          attendeeCount: mostPopularEvent.attendees.length,
        } : null,
        events: events.map(event => ({
          title: event.title,
          attendeeCount: event.attendees.length,
          date: event.date,
        })),
      },
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching dashboard data',
    });
  }
};

// Get my events (events user has RSVP'd to)
export const getMyEvents = async (req: Request, res: Response) => {
  try {
    const events = await Event.find({ attendees: req.user!.id })
      .populate('organizer', 'name email')
      .sort({ date: 1 });

    res.json({
      success: true,
      events,
    });
  } catch (error) {
    console.error('Get my events error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching your events',
    });
  }
}; 