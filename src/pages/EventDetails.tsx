import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, MapPin, Users, Clock, Share2, Heart, ArrowLeft } from 'lucide-react';
import { useEvents } from '../hooks/useEvents';
import { Event } from '../hooks/useEvents';
import { useAuth } from '../hooks/useAuth';
import Button from '../components/ui/Button';
import CategoryBadge from '../components/CategoryBadge';
import { formatDate } from '../lib/utils';

const EventDetails: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { events, rsvpToEvent, cancelRsvp } = useEvents();
  const { user } = useAuth();
  const [event, setEvent] = useState<Event | null>(null);
  const [isLiked, setIsLiked] = useState(false);
  const [isRsvping, setIsRsvping] = useState(false);
  
  const hasRsvped = event?.rsvpAttendees.some(
    attendee => attendee.userId === user?.id
  );

  useEffect(() => {
    const foundEvent = events.find(e => e.id === id);
    if (foundEvent) {
      setEvent(foundEvent);
    }
  }, [id, events]);

  if (!event) {
    return (
      <div className="container mx-auto px-4 pt-24 pb-16">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Event not found
          </h2>
          <Button onClick={() => navigate('/browse')}>
            Browse Events
          </Button>
        </div>
      </div>
    );
  }

  const handleShare = async () => {
    try {
      await navigator.share({
        title: event.title,
        text: event.description,
        url: window.location.href,
      });
    } catch (error) {
      console.log('Error sharing:', error);
    }
  };

  const handleRsvp = async () => {
    if (!user) {
      navigate('/auth/login');
      return;
    }
    
    setIsRsvping(true);
    try {
      if (hasRsvped) {
        const updatedEvent = await cancelRsvp(event.id);
        setEvent(updatedEvent);
      } else {
        const updatedEvent = await rsvpToEvent(event.id);
        setEvent(updatedEvent);
      }
    } catch (error) {
      console.error('RSVP action failed', error);
    } finally {
      setIsRsvping(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero Section with Image */}
      <div className="relative h-[40vh] min-h-[300px] w-full overflow-hidden">
        <img
          src={event.imageUrl}
          alt={event.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black bg-opacity-40" />
        
        {/* Back Button */}
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="absolute top-24 left-4 md:left-8 text-white p-2 rounded-full bg-black/30 hover:bg-black/50 transition-colors"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft size={24} />
        </motion.button>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 -mt-16 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 md:p-8"
        >
          {/* Categories */}
          <div className="flex flex-wrap gap-2 mb-4">
            {event.categories.map(category => (
              <CategoryBadge key={category} category={category} />
            ))}
          </div>

          {/* Title and Actions */}
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
              {event.title}
            </h1>
            <div className="flex gap-2">
              <Button
                variant="outline"
                icon={<Share2 size={18} />}
                onClick={handleShare}
              >
                Share
              </Button>
              <Button
                variant={isLiked ? 'primary' : 'outline'}
                icon={<Heart size={18} className={isLiked ? 'fill-current' : ''} />}
                onClick={() => setIsLiked(!isLiked)}
              >
                {isLiked ? 'Liked' : 'Like'}
              </Button>
            </div>
          </div>

          {/* Event Details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2">
              {/* Description */}
              <div className="prose dark:prose-invert max-w-none mb-8">
                <h2 className="text-xl font-semibold mb-4">About this event</h2>
                <p className="text-gray-600 dark:text-gray-300 whitespace-pre-wrap">
                  {event.description}
                </p>
              </div>

              {/* Organizer */}
              <div className="mb-8">
                <h2 className="text-xl font-semibold mb-4">Organizer</h2>
                <div className="flex items-center">
                  <img
                    src={event.organizer.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(event.organizer.name)}&background=random`}
                    alt={event.organizer.name}
                    className="w-12 h-12 rounded-full mr-4"
                  />
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">
                      {event.organizer.name}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Event Organizer
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Event Info Sidebar */}
            <div>
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-6 space-y-6">
                {/* Date & Time */}
                <div className="flex items-start">
                  <Calendar className="w-5 h-5 text-gray-500 dark:text-gray-400 mt-1 mr-3" />
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">
                      Date and time
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      {formatDate(event.date)}
                    </p>
                    <p className="text-gray-600 dark:text-gray-300">
                      {event.time}
                    </p>
                  </div>
                </div>

                {/* Location */}
                <div className="flex items-start">
                  <MapPin className="w-5 h-5 text-gray-500 dark:text-gray-400 mt-1 mr-3" />
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">
                      Location
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      {event.location}
                    </p>
                  </div>
                </div>

                {/* Attendees */}
                <div className="flex items-start">
                  <Users className="w-5 h-5 text-gray-500 dark:text-gray-400 mt-1 mr-3" />
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">
                      Attendees
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      {event.attendees.length} attending • {event.maxAttendees - event.attendees.length} spots left
                    </p>
                  </div>
                </div>

                {/* Duration */}
                <div className="flex items-start">
                  <Clock className="w-5 h-5 text-gray-500 dark:text-gray-400 mt-1 mr-3" />
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">
                      Duration
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      2 hours
                    </p>
                  </div>
                </div>

                {/* Action Button */}
                <Button 
                  className="w-full" 
                  size="lg"
                  variant={hasRsvped ? "secondary" : "primary"}
                  onClick={handleRsvp}
                  disabled={isRsvping}
                >
                  {isRsvping ? 'Processing...' : (hasRsvped ? 'Cancel RSVP' : 'RSVP Now')}
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default EventDetails;