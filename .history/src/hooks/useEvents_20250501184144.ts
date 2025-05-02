import { create } from 'zustand';
import { formatDate } from '../lib/utils';

export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  imageUrl: string;
  organizer: {
    id: string;
    name: string;
    avatar?: string;
  };
  categories: string[];
  isPublic: boolean;
  maxAttendees: number;
  attendees: {
    id: string;
    name: string;
    avatar?: string;
  }[];
  createdAt: string;
}

interface EventsState {
  events: Event[];
  isLoading: boolean;
  error: string | null;
  fetchEvents: () => Promise<void>;
  getEvent: (id: string) => Event | undefined;
  createEvent: (event: Omit<Event, 'id' | 'createdAt'>) => Promise<Event>;
  updateEvent: (id: string, event: Partial<Event>) => Promise<Event | null>;
  deleteEvent: (id: string) => Promise<boolean>;
  rsvp: (eventId: string, userId: string, status: 'going' | 'interested' | 'not-going') => Promise<boolean>;
}

export const useEvents = create<EventsState>((set, get) => ({
  events: [],
  isLoading: false,
  error: null,
  
  fetchEvents: async () => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await fetch('/api/events');
      if (!response.ok) throw new Error('Failed to fetch events');
      const events = await response.json();
      set({ events, isLoading: false });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch events';
      set({ error: errorMessage, isLoading: false });
    }
  },
  
  getEvent: (id: string) => {
    return get().events.find(event => event.id === id);
  },
  
  createEvent: async (eventData) => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await fetch('/api/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(eventData),
      });
      
      if (!response.ok) throw new Error('Failed to create event');
      
      const newEvent = await response.json();
      set(state => ({ 
        events: [...state.events, newEvent],
        isLoading: false 
      }));
      
      return newEvent;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create event';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },
  
  updateEvent: async (id, eventData) => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await fetch(`/api/events/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(eventData),
      });
      
      if (!response.ok) throw new Error('Failed to update event');
      
      const updatedEvent = await response.json();
      
      set(state => {
        const updatedEvents = state.events.map(event => 
          event.id === id ? updatedEvent : event
        );
        return { events: updatedEvents, isLoading: false };
      });
      
      return updatedEvent;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update event';
      set({ error: errorMessage, isLoading: false });
      return null;
    }
  },
  
  deleteEvent: async (id) => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await fetch(`/api/events/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) throw new Error('Failed to delete event');
      
      set(state => ({
        events: state.events.filter(event => event.id !== id),
        isLoading: false
      }));
      
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete event';
      set({ error: errorMessage, isLoading: false });
      return false;
    }
  },
  
  rsvp: async (eventId, userId, status) => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await fetch(`/api/events/${eventId}/rsvp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, status }),
      });
      
      if (!response.ok) throw new Error('Failed to RSVP');
      
      set({ isLoading: false });
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to RSVP';
      set({ error: errorMessage, isLoading: false });
      return false;
    }
  },
}));