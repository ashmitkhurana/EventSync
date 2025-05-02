import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, MapPin, Users } from 'lucide-react';
import { formatDate } from '../lib/utils';
import { Event } from '../hooks/useEvents';
import CategoryBadge from './CategoryBadge';

interface EventCardProps {
  event: Event;
  featured?: boolean;
}

const EventCard: React.FC<EventCardProps> = ({ event, featured = false }) => {
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
        <div className="absolute top-3 right-3 flex gap-2">
          {event.categories.slice(0, 2).map((category, index) => (
            <CategoryBadge key={index} category={category} />
          ))}
        </div>
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
        
        <div className="flex justify-between items-center mt-auto">
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
          
          <Link 
            to={`/event/${event.id}`}
            className="text-primary-600 dark:text-primary-400 font-medium hover:text-primary-700 dark:hover:text-primary-300 transition-colors"
          >
            View Details →
          </Link>
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