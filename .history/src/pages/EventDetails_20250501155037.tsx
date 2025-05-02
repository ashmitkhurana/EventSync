import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CalendarDays, MapPin, Users, Share2, Heart, Calendar, Edit, Trash2, ChevronLeft, AlertCircle, CheckCircle } from 'lucide-react';
import { Event, useEvents } from '../hooks/useEvents';
import { useAuth } from '../hooks/useAuth';
import Button from '../components/ui/Button';
import CategoryBadge from '../components/CategoryBadge';
import { formatDate } from '../lib/utils';

const EventDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getEvent, rsvp, deleteEvent, isLoading } = useEvents();
  const { user, isAuthenticated } = useAuth();
  const [event, setEvent] = useState<Event | null>(null);
  const [isAttending, setIsAttending] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [rsvpStatus, setRsvpStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  
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
  
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
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
    <div className="container mx-auto px-4 pt-24 pb-16">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-4xl mx-auto"
      >
        {/* Back Button */}
        <motion.div variants={itemVariants} className="mb-6">
          <Link to="/browse" className="inline-flex items-center text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400">
            <ChevronLeft size={16} className="mr-1" />
            Back to events
          </Link>
        </motion.div>
        
        {/* Event Header */}
        <motion.div 
          variants={itemVariants}
          className="relative aspect-video overflow-hidden rounded-xl mb-8"
        >
          <img 
            src={event.imageUrl} 
            alt={event.title} 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
          <div className="absolute bottom-0 left-0 p-6 w-full">
            <div className="flex flex-wrap gap-2 mb-3">
              {event.categories.map(category => (
                <CategoryBadge key={category} category={category} />
              ))}
            </div>
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-2">
              {event.title}
            </h1>
            <div className="flex items-center text-white/90">
              <CalendarDays size={18} className="mr-2" />
              <span>
                {formatDate(event.date)} • {event.time}
              </span>
            </div>
          </div>
        </motion.div>
        
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Event Details */}
          <motion.div variants={itemVariants} className="lg:w-2/3">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
              <div className="p-6">
                <div className="flex justify-between mb-6">
                  <div className="flex items-center">
                    <img 
                      src={event.organizer.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(event.organizer.name)}&background=random`}
                      alt={event.organizer.name}
                      className="w-10 h-10 rounded-full mr-3"
                    />
                    <div>
                      <span className="block text-sm text-gray-500 dark:text-gray-400">
                        Organized by
                      </span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {event.organizer.name}
                      </span>
                    </div>
                  </div>
                  
                  {isOrganizer && (
                    <div className="flex gap-2">
                      <Link to={`/event/edit/${event.id}`}>
                        <Button 
                          variant="outline" 
                          size="sm"
                          icon={<Edit size={16} />}
                          iconPosition="left"
                        >
                          Edit
                        </Button>
                      </Link>
                      <Button 
                        variant="danger" 
                        size="sm"
                        icon={<Trash2 size={16} />}
                        iconPosition="left"
                        onClick={() => setShowDeleteConfirm(true)}
                      >
                        Delete
                      </Button>
                    </div>
                  )}
                </div>
                
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  About this event
                </h2>
                <p className="text-gray-600 dark:text-gray-300 mb-6 whitespace-pre-line">
                  {event.description}
                </p>
              </div>
              
              <div className="border-t border-gray-200 dark:border-gray-700 p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Date and time
                </h2>
                <div className="flex items-start">
                  <Calendar size={20} className="text-gray-500 dark:text-gray-400 mr-3 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {formatDate(event.date, 'EEEE, MMMM d, yyyy')}
                    </p>
                    <p className="text-gray-600 dark:text-gray-300">
                      {event.time} (Local time)
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="border-t border-gray-200 dark:border-gray-700 p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Location
                </h2>
                <div className="flex items-start">
                  <MapPin size={20} className="text-gray-500 dark:text-gray-400 mr-3 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {event.location}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
          
          {/* Sidebar */}
          <motion.div variants={itemVariants} className="lg:w-1/3">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 sticky top-24">
              <div className="space-y-6">
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                    {isAttending ? 'You\'re attending!' : 'Join this event'}
                  </p>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    {event.attendees.length} attending • {event.maxAttendees - event.attendees.length} spots left
                  </p>
                  
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-4">
                    <div 
                      className="bg-primary-600 h-2 rounded-full" 
                      style={{ width: `${(event.attendees.length / event.maxAttendees) * 100}%` }}
                    ></div>
                  </div>
                  
                  {rsvpStatus === 'success' && (
                    <div className="mb-4 p-3 bg-success-50 dark:bg-success-900/20 text-success-600 dark:text-success-400 rounded-md flex items-center">
                      <CheckCircle size={16} className="mr-2" />
                      {isAttending 
                        ? 'You\'re now attending this event!'
                        : 'You\'ve been removed from the attendee list.'}
                    </div>
                  )}
                  
                  {rsvpStatus === 'error' && (
                    <div className="mb-4 p-3 bg-error-50 dark:bg-error-900/20 text-error-600 dark:text-error-400 rounded-md flex items-center">
                      <AlertCircle size={16} className="mr-2" />
                      Something went wrong. Please try again.
                    </div>
                  )}
                  
                  <Button
                    fullWidth
                    loading={rsvpStatus === 'loading'}
                    onClick={handleRSVP}
                    variant={isAttending ? 'outline' : 'primary'}
                    icon={isAttending ? <Users size={16} /> : <Heart size={16} />}
                    iconPosition="left"
                  >
                    {isAttending ? 'Cancel RSVP' : 'RSVP'}
                  </Button>
                </div>
                
                <Button
                  fullWidth
                  variant="outline"
                  icon={<Share2 size={16} />}
                  iconPosition="left"
                  onClick={handleShare}
                >
                  Share
                </Button>
                
                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <p className="font-medium text-gray-900 dark:text-white mb-3">
                    Current attendees ({event.attendees.length})
                  </p>
                  
                  {event.attendees.length > 0 ? (
                    <div className="flex flex-wrap -mx-1">
                      {event.attendees.map(attendee => (
                        <div key={attendee.id} className="px-1 py-1">
                          <img 
                            src={attendee.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(attendee.name)}&background=random`}
                            alt={attendee.name}
                            title={attendee.name}
                            className="w-8 h-8 rounded-full"
                          />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      No attendees yet. Be the first to RSVP!
                    </p>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
      
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