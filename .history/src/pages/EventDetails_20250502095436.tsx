import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CalendarDays, MapPin, Users, Share2, Heart, Calendar, Edit, Trash2, ChevronLeft, AlertCircle, CheckCircle, ArrowLeft } from 'lucide-react';
import { Event, useEvents } from '../hooks/useEvents';
import { useAuth } from '../hooks/useAuth';
import Button from '../components/ui/Button';
import CategoryBadge from '../components/CategoryBadge';
import { formatDate } from '../lib/utils';

const EventDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getEvent, rsvp, deleteEvent, isLoading, events } = useEvents();
  const { user, isAuthenticated } = useAuth();
  const [event, setEvent] = useState<Event | null>(null);
  const [isAttending, setIsAttending] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [rsvpStatus, setRsvpStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [isLiked, setIsLiked] = useState(false);
  
  useEffect(() => {
    if (id) {
      const eventData = getEvent(id);
      if (eventData) {
        setEvent(eventData);
        
        // Check if current user is attending
        if (user) {
          const attending = eventData.attendees.some(a => a.id === user.id);
          setIsAttending(attending);
        }
      } else {
        // Event not found
        navigate('/not-found');
      }
    }
  }, [id, getEvent, navigate, user]);
  
  const handleRSVP = async () => {
    if (!isAuthenticated || !user || !event) {
      navigate('/login');
      return;
    }
    
    setRsvpStatus('loading');
    try {
      const success = await rsvp(event.id, user.id, isAttending ? 'not-going' : 'going');
      
      if (success) {
        setIsAttending(!isAttending);
        setRsvpStatus('success');
        
        // Reset status after 3 seconds
        setTimeout(() => {
          setRsvpStatus('idle');
        }, 3000);
      } else {
        setRsvpStatus('error');
      }
    } catch (error) {
      setRsvpStatus('error');
    }
  };
  
  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({
        title: event?.title,
        text: `Check out this event: ${event?.title}`,
        url: window.location.href,
      });
    } else {
      // Fallback for browsers that don't support Web Share API
      navigator.clipboard.writeText(window.location.href);
      // Show a toast (would implement with a toast library in a real app)
      alert('Link copied to clipboard!');
    }
  };
  
  const handleDelete = async () => {
    if (!event) return;
    
    try {
      const success = await deleteEvent(event.id);
      if (success) {
        navigate('/');
      }
    } catch (error) {
      console.error('Error deleting event:', error);
    }
  };
  
  const isOrganizer = user && event?.organizer.id === user.id;
  
  if (!event) return null;
  
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
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
                <Button className="w-full" size="lg">
                  Register Now
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
      
      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6"
          >
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Delete Event
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Are you sure you want to delete this event? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <Button
                variant="outline"
                onClick={() => setShowDeleteConfirm(false)}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                loading={isLoading}
                onClick={handleDelete}
              >
                Delete
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default EventDetails;