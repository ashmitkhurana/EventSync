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

// Mock event data
const MOCK_EVENTS: Event[] = [
  {
    id: '1',
    title: 'Tech Conference 2025',
    description: 'The biggest tech event of the year with speakers from leading companies discussing future technologies, innovation, and industry trends.',
    date: '2025-06-15',
    time: '09:00',
    location: 'San Francisco Convention Center',
    imageUrl: 'https://images.pexels.com/photos/2774556/pexels-photo-2774556.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    organizer: {
      id: '1',
      name: 'TechOrg Inc.',
      avatar: 'https://images.pexels.com/photos/3184405/pexels-photo-3184405.jpeg?auto=compress&cs=tinysrgb&w=300',
    },
    categories: ['Technology', 'Conference', 'Networking'],
    isPublic: true,
    maxAttendees: 1000,
    attendees: [],
    createdAt: '2024-01-10T14:30:00Z',
  },
  {
    id: '2',
    title: 'Design Workshop',
    description: 'Learn UI/UX design principles from industry experts in this hands-on workshop.',
    date: '2025-05-20',
    time: '13:00',
    location: 'Creative Studio, New York',
    imageUrl: 'https://images.pexels.com/photos/7149165/pexels-photo-7149165.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    organizer: {
      id: '2',
      name: 'Design Guild',
      avatar: 'https://images.pexels.com/photos/3184571/pexels-photo-3184571.jpeg?auto=compress&cs=tinysrgb&w=300',
    },
    categories: ['Design', 'Workshop', 'Creative'],
    isPublic: true,
    maxAttendees: 50,
    attendees: [],
    createdAt: '2024-02-05T10:15:00Z',
  },
  {
    id: '3',
    title: 'Music Festival',
    description: 'Three days of amazing performances from top artists across multiple genres.',
    date: '2025-07-10',
    time: '16:00',
    location: 'Central Park, New York',
    imageUrl: 'https://images.pexels.com/photos/1190297/pexels-photo-1190297.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    organizer: {
      id: '3',
      name: 'Music Matters',
      avatar: 'https://images.pexels.com/photos/2379005/pexels-photo-2379005.jpeg?auto=compress&cs=tinysrgb&w=300',
    },
    categories: ['Music', 'Festival', 'Entertainment'],
    isPublic: true,
    maxAttendees: 5000,
    attendees: [],
    createdAt: '2024-01-15T09:45:00Z',
  },
  {
    id: '4',
    title: 'Startup Pitch Night',
    description: 'Early-stage startups present their ideas to investors and receive feedback.',
    date: '2025-05-05',
    time: '18:30',
    location: 'Innovation Hub, Austin',
    imageUrl: 'https://images.pexels.com/photos/7688460/pexels-photo-7688460.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    organizer: {
      id: '4',
      name: 'Founder Network',
      avatar: 'https://images.pexels.com/photos/2381069/pexels-photo-2381069.jpeg?auto=compress&cs=tinysrgb&w=300',
    },
    categories: ['Business', 'Startup', 'Networking'],
    isPublic: true,
    maxAttendees: 200,
    attendees: [],
    createdAt: '2024-02-20T16:20:00Z',
  },
  {
    id: '5',
    title: 'Wellness Retreat',
    description: 'A weekend of yoga, meditation, and wellness activities to rejuvenate your mind and body.',
    date: '2025-06-01',
    time: '08:00',
    location: 'Mountain View Resort, Colorado',
    imageUrl: 'https://images.pexels.com/photos/3822622/pexels-photo-3822622.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    organizer: {
      id: '5',
      name: 'Mindful Living',
      avatar: 'https://images.pexels.com/photos/3760263/pexels-photo-3760263.jpeg?auto=compress&cs=tinysrgb&w=300',
    },
    categories: ['Wellness', 'Health', 'Lifestyle'],
    isPublic: true,
    maxAttendees: 75,
    attendees: [],
    createdAt: '2024-03-01T11:30:00Z',
  },
  {
    id: '6',
    title: 'Cooking Masterclass',
    description: 'Learn to prepare exquisite dishes from a renowned chef in this interactive cooking class.',
    date: '2025-05-25',
    time: '14:00',
    location: 'Culinary Institute, Chicago',
    imageUrl: 'https://images.pexels.com/photos/4252137/pexels-photo-4252137.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    organizer: {
      id: '6',
      name: 'Gourmet Guild',
      avatar: 'https://images.pexels.com/photos/3814446/pexels-photo-3814446.jpeg?auto=compress&cs=tinysrgb&w=300',
    },
    categories: ['Food', 'Cooking', 'Education'],
    isPublic: true,
    maxAttendees: 30,
    attendees: [],
    createdAt: '2024-02-25T13:45:00Z',
  },
];

export const useEvents = create<EventsState>((set, get) => ({
  events: [],
  isLoading: false,
  error: null,
  
  fetchEvents: async () => {
    set({ isLoading: true, error: null });
    
    try {
      // Simulating API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      set({ events: MOCK_EVENTS, isLoading: false });
    } catch (error) {
      set({ error: 'Failed to fetch events', isLoading: false });
    }
  },
  
  getEvent: (id: string) => {
    return get().events.find(event => event.id === id);
  },
  
  createEvent: async (eventData) => {
    set({ isLoading: true, error: null });
    
    try {
      // Simulating API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newEvent: Event = {
        ...eventData,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
      };
      
      set(state => ({ 
        events: [...state.events, newEvent],
        isLoading: false 
      }));
      
      return newEvent;
    } catch (error) {
      set({ error: 'Failed to create event', isLoading: false });
      throw error;
    }
  },
  
  updateEvent: async (id, eventData) => {
    set({ isLoading: true, error: null });
    
    try {
      // Simulating API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      let updatedEvent: Event | null = null;
      
      set(state => {
        const updatedEvents = state.events.map(event => {
          if (event.id === id) {
            updatedEvent = { ...event, ...eventData };
            return updatedEvent;
          }
          return event;
        });
        
        return { events: updatedEvents, isLoading: false };
      });
      
      return updatedEvent;
    } catch (error) {
      set({ error: 'Failed to update event', isLoading: false });
      return null;
    }
  },
  
  deleteEvent: async (id) => {
    set({ isLoading: true, error: null });
    
    try {
      // Simulating API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      set(state => ({
        events: state.events.filter(event => event.id !== id),
        isLoading: false
      }));
      
      return true;
    } catch (error) {
      set({ error: 'Failed to delete event', isLoading: false });
      return false;
    }
  },
  
  rsvp: async (eventId, userId, status) => {
    set({ isLoading: true, error: null });
    
    try {
      // Simulating API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In a real app, this would call a backend API
      // For now, we'll just simulate a successful RSVP
      set({ isLoading: false });
      return true;
    } catch (error) {
      set({ error: 'Failed to RSVP', isLoading: false });
      return false;
    }
  },
}));