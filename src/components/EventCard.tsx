import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, MapPin, Users, BarChart } from 'lucide-react';
import { formatDate } from '../lib/utils';
import { Event } from '../hooks/useEvents';
import { useAuth } from '../hooks/useAuth';
import CategoryBadge from './CategoryBadge';

interface EventCardProps {
  event: Event;
  featured?: boolean;
  showAnalytics?: boolean;
}

const EventCard: React.FC<EventCardProps> = ({ event, featured = false, showAnalytics = false }) => {
  const { user } = useAuth();
  const isOrganizer = user && event.organizer.id === user.id;
  const isAttendee = user && event.attendees.some(a => a.id === user.id);
  const hasRsvped = user && event.rsvpAttendees && event.rsvpAttendees.some(a => a.userId === user.id);

  const cardVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    hover: { 
      y: -5, 
      boxShadow: '0 10px 30px -15px rgba(0, 0, 0, 0.2)',
      transition: { duration: 0.2 }
    }
  };

  return (
    <motion.div
      className={cn(
        'bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300',
        featured ? 'lg:col-span-2 lg:flex' : ''
      )}
      initial="initial"
      animate="animate"
      whileHover="hover"
      variants={cardVariants}
    >
      <div className={cn(
        'relative aspect-video overflow-hidden', 
        featured ? 'lg:w-1/2' : ''
      )}>
        <img 
          src={event.imageUrl} 
          alt={event.title} 
          className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
        />
        <div className="absolute top-0 right-0 left-0 p-3 bg-gradient-to-b from-black/50 to-transparent flex flex-wrap gap-1.5 justify-end">
          {event.categories.map(category => (
            <CategoryBadge key={category} category={category} size="sm" />
          ))}
        </div>
        {(isOrganizer || isAttendee || hasRsvped) && (
          <div className="absolute bottom-3 left-3 flex gap-2">
            {isOrganizer && (
              <span className="bg-primary-500 text-white text-xs px-2 py-1 rounded-full">
                Organizer
              </span>
            )}
            {(isAttendee || hasRsvped) && (
              <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                Attending
              </span>
            )}
          </div>
        )}
      </div>
      
      <div className={cn(
        'p-5',
        featured ? 'lg:w-1/2 lg:p-6 lg:flex lg:flex-col lg:justify-between' : ''
      )}>
        <div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            {event.title}
          </h3>
          
          <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">
            {event.description}
          </p>
          
          <div className="space-y-2 mb-4">
            <div className="flex items-center text-gray-500 dark:text-gray-400">
              <Calendar size={16} className="mr-2" />
              <span>{formatDate(event.date)}</span>
              <span className="mx-1">•</span>
              <span>{event.time}</span>
            </div>
            
            <div className="flex items-center text-gray-500 dark:text-gray-400">
              <MapPin size={16} className="mr-2" />
              <span>{event.location}</span>
            </div>
            
            <div className="flex items-center text-gray-500 dark:text-gray-400">
              <Users size={16} className="mr-2" />
              <span>
                {event.attendees.length} attending • Max {event.maxAttendees}
              </span>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row justify-between items-center mt-auto gap-2">
          <div className="flex items-center">
            <img 
              src={event.organizer.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(event.organizer.name)}&background=random`} 
              alt={event.organizer.name}
              className="w-8 h-8 rounded-full mr-2"
            />
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {event.organizer.name}
            </span>
          </div>
          
          <div className="flex flex-wrap gap-2 justify-end">
            {isOrganizer && showAnalytics && (
              <Link 
                to={`/event/${event.id}/analytics`}
                className="text-secondary-600 dark:text-secondary-400 font-medium hover:text-secondary-700 dark:hover:text-secondary-300 transition-colors flex items-center"
              >
                <BarChart size={16} className="mr-1" />
                View Analytics
              </Link>
            )}
            <Link 
              to={`/event/${event.id}`}
              className="text-primary-600 dark:text-primary-400 font-medium hover:text-primary-700 dark:hover:text-primary-300 transition-colors"
            >
              View Details →
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default EventCard;

// Helper to conditionally join class names
function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}