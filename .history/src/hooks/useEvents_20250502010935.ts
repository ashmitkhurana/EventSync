import { create } from 'zustand';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api';

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

// Configure axios
axios.defaults.withCredentials = true;

export const useEvents = create<EventsState>((set, get) => ({
  events: [],
  isLoading: false,
  error: null,
  
  fetchEvents: async () => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await axios.get(`${API_BASE_URL}/events`);
      set({ events: response.data, isLoading: false });
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
      const response = await axios.post(`${API_BASE_URL}/events`, eventData);
      const newEvent = response.data;
      
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
      const response = await axios.put(`${API_BASE_URL}/events/${id}`, eventData);
      const updatedEvent = response.data;
      
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
      await axios.delete(`${API_BASE_URL}/events/${id}`);
      
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
      await axios.post(`${API_BASE_URL}/events/${eventId}/rsvp`, { userId, status });
      set({ isLoading: false });
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to RSVP';
      set({ error: errorMessage, isLoading: false });
      return false;
    }
  },
}));