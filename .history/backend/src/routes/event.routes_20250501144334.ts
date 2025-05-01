import express from 'express';
import { body } from 'express-validator';
import { auth } from '../middleware/auth';
import { isOrganizer } from '../middleware/organizerAuth';
import {
  createEvent,
  getAllEvents,
  getEventById,
  updateEvent,
  deleteEvent,
  rsvpToEvent,
  getOrganizerDashboard,
  getMyEvents,
} from '../controllers/event.controller';

const router = express.Router();

// Validation middleware
const eventValidation = [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('category').trim().notEmpty().withMessage('Category is required'),
  body('date').isISO8601().toDate().withMessage('Valid date is required'),
  body('time').trim().notEmpty().withMessage('Time is required'),
  body('location').trim().notEmpty().withMessage('Location is required'),
];

// Public routes
router.get('/events', getAllEvents);
router.get('/events/:id', getEventById);

// Protected routes
router.post('/events', auth, isOrganizer, eventValidation, createEvent);
router.put('/events/:id', auth, isOrganizer, eventValidation, updateEvent);
router.delete('/events/:id', auth, isOrganizer, deleteEvent);
router.post('/events/:id/rsvp', auth, rsvpToEvent);
router.get('/organizer/dashboard', auth, isOrganizer, getOrganizerDashboard);
router.get('/my-events', auth, getMyEvents);

export default router; 