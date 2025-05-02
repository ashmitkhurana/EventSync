import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, UserCheck } from 'lucide-react';
import { useEvents } from '../hooks/useEvents';
import { Event } from '../hooks/useEvents';
import { useAuth } from '../hooks/useAuth';
import Button from '../components/ui/Button';

const EventRsvps: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { events } = useEvents();
  const { user } = useAuth();
  const [event, setEvent] = useState<Event | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const foundEvent = events.find(e => e.id === id);
    if (foundEvent) {
      setEvent(foundEvent);
      setIsLoading(false);
    } else {
      setIsLoading(false);
    }
  }, [id, events]);
  
  // Authorize access - only organizer can view RSVPs
  if (!isLoading && event && user && event.organizer.id !== user.id) {
    return (
      <div className="container mx-auto px-4 pt-24 pb-16">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Unauthorized Access
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            You don't have permission to view RSVPs for this event.
          </p>
          <Button onClick={() => navigate(-1)}>
            Go Back
          </Button>
        </div>
      </div>
    );
  }
  
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 pt-24 pb-16 flex justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }
  
  if (!event) {
    return (
      <div className="container mx-auto px-4 pt-24 pb-16">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Event not found
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            The event you're looking for doesn't exist or has been removed.
          </p>
          <Button onClick={() => navigate('/browse')}>
            Browse Events
          </Button>
        </div>
      </div>
    );
  }
  
  // Sort RSVPs by date (newest first)
  const sortedRsvps = [...(event.rsvpAttendees || [])]
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  
  // Helper function to safely compare MongoDB ObjectIds
  const compareIds = (id1: unknown, id2: unknown): boolean => {
    // Convert both to strings and remove any quotes or ObjectId wrappers
    const normalizeId = (id: unknown): string => {
      if (!id) return '';
      const idStr = id.toString();
      return idStr.replace(/^"(.+)"$/, '$1')
                 .replace(/^ObjectId\(['"](.+)['"]\)$/, '$1');
    };
    
    const normalizedId1 = normalizeId(id1);
    const normalizedId2 = normalizeId(id2);
    
    return normalizedId1 === normalizedId2;
  };
  
  // Get attendee info by userId
  const getRsvpAttendeeInfo = (userId: string) => {
    // Look for an attendee with matching id
    const attendee = event.attendees.find(a => compareIds(a.id, userId));
    
    if (attendee && attendee.name && attendee.name !== 'Anonymous') {
      return attendee;
    }
    
    // If no match found or name is Anonymous, return placeholder
    return { name: `User #${userId.substring(0, 5)}...`, avatar: undefined };
  };
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20 pb-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-6 flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="h-8 w-8 rounded-full"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft size={16} />
          </Button>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            RSVPs for {event.title}
          </h1>
        </div>
        
        {/* RSVPs List */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <div className="mb-4 flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              All RSVPs
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {sortedRsvps.length} of {event.maxAttendees} capacity
            </p>
          </div>
          
          {sortedRsvps.length > 0 ? (
            <div className="space-y-4">
              {sortedRsvps.map((rsvp, index) => {
                const attendeeInfo = getRsvpAttendeeInfo(rsvp.userId);
                return (
                  <div 
                    key={index}
                    className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/30 rounded-lg"
                  >
                    <div className="flex items-center">
                      {attendeeInfo.avatar ? (
                        <img
                          src={attendeeInfo.avatar}
                          alt={attendeeInfo.name}
                          className="w-10 h-10 rounded-full mr-4 object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center mr-4">
                          <UserCheck size={18} className="text-primary-600 dark:text-primary-400" />
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {attendeeInfo.name}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          RSVPed on {new Date(rsvp.timestamp).toLocaleDateString()} at {new Date(rsvp.timestamp).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="mx-auto w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
                <UserCheck size={24} className="text-gray-500 dark:text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No RSVPs yet
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                No one has RSVPed to this event yet.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventRsvps; 