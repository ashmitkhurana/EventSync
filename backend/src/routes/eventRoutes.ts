import express from 'express';
import { 
  createEvent, 
  getEvents, 
  getEventById, 
  updateEvent, 
  deleteEvent,
  rsvpToEvent,
  cancelRsvp,
  getUserRsvpedEvents
} from '../controllers/eventController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

// Public routes
router.get('/', getEvents);
router.get('/:id', getEventById);

// Protected routes (require authentication)
router.post('/', protect, createEvent);
router.put('/:id', protect, updateEvent);
router.delete('/:id', protect, deleteEvent);

// RSVP routes
router.post('/:id/rsvp', protect, rsvpToEvent);
router.delete('/:id/rsvp', protect, cancelRsvp);
router.get('/users/:userId/rsvped-events', protect, getUserRsvpedEvents);

export default router; 