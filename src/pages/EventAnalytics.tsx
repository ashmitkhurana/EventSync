import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  Calendar, MapPin, Clock, ArrowLeft, BarChart2, 
  TrendingUp, UserCheck, Activity, Eye, Share2, ChevronRight 
} from 'lucide-react';
import { useEvents } from '../hooks/useEvents';
import { Event } from '../hooks/useEvents';
import { useAuth } from '../hooks/useAuth';
import Button from '../components/ui/Button';
import { formatDate } from '../lib/utils';

const EventAnalytics: React.FC = () => {
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
  
  // Authorize access - only organizer can view analytics
  if (!isLoading && event && user && event.organizer.id !== user.id) {
    return (
      <div className="container mx-auto px-4 pt-24 pb-16">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Unauthorized Access
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            You don't have permission to view analytics for this event.
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
  
  // Calculate analytics data
  const rsvpCount = event.rsvpAttendees?.length || 0;
  const rsvpPercentage = Math.round((rsvpCount / event.maxAttendees) * 100);
  const daysLeft = Math.ceil((new Date(event.date).getTime() - new Date().getTime()) / (1000 * 3600 * 24));
  
  // Get latest RSVPs
  const latestRsvps = [...(event.rsvpAttendees || [])]
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 5);
  
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
  
  // Map userIds to attendees for displaying names
  const getRsvpAttendeeInfo = (userId: string) => {
    // Look for an attendee with matching id
    const attendee = event.attendees.find(a => compareIds(a.id, userId));
    
    if (attendee && attendee.name && attendee.name !== 'Anonymous') {
      return attendee;
    }
    
    // If no match found or name is Anonymous, return placeholder
    return { name: `User #${userId.substring(0, 5)}...` };
  };
  
  // Mock data for demo purposes
  const pageViews = 342;
  const registrationRate = 68;
  const dailyVisits = [12, 18, 25, 33, 28, 42, 50];
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20 pb-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="h-8 w-8 rounded-full"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft size={16} />
            </Button>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <BarChart2 className="text-primary-500" />
              Analytics for {event.title}
            </h1>
          </div>
          
          <div className="flex gap-2">
            <Link to={`/event/${event.id}`}>
              <Button variant="outline">
                View Event Page
              </Button>
            </Link>
          </div>
        </div>
        
        {/* Event Info Card */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 mb-6 flex flex-col md:flex-row gap-4">
          <img 
            src={event.imageUrl} 
            alt={event.title} 
            className="w-full md:w-48 h-32 object-cover rounded-md"
          />
          
          <div className="flex-1">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              {event.title}
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center text-gray-600 dark:text-gray-300">
                <Calendar className="w-4 h-4 mr-2 text-gray-500" />
                {formatDate(event.date)} at {event.time}
              </div>
              
              <div className="flex items-center text-gray-600 dark:text-gray-300">
                <MapPin className="w-4 h-4 mr-2 text-gray-500" />
                {event.location}
              </div>
              
              <div className="flex items-center text-gray-600 dark:text-gray-300">
                <Clock className="w-4 h-4 mr-2 text-gray-500" />
                {daysLeft > 0 ? `${daysLeft} days left` : 'Event has passed'}
              </div>
            </div>
          </div>
        </div>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Total RSVPs
                </p>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  {rsvpCount}
                </h3>
              </div>
              <div className="p-2 bg-primary-50 dark:bg-primary-900/20 rounded-lg">
                <UserCheck className="w-6 h-6 text-primary-500" />
              </div>
            </div>
            <div className="mt-2">
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                <div 
                  className="bg-primary-500 h-2.5 rounded-full" 
                  style={{ width: `${rsvpPercentage}%` }}
                ></div>
              </div>
              <p className="text-xs mt-1 text-gray-500 dark:text-gray-400">
                {rsvpPercentage}% of capacity ({event.maxAttendees} max)
              </p>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Page Views
                </p>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  {pageViews}
                </h3>
              </div>
              <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <Eye className="w-6 h-6 text-blue-500" />
              </div>
            </div>
            <p className="text-sm text-green-500 dark:text-green-400 flex items-center mt-2">
              <TrendingUp className="w-4 h-4 mr-1" />
              +12% from last week
            </p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Registration Rate
                </p>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  {registrationRate}%
                </h3>
              </div>
              <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <Activity className="w-6 h-6 text-purple-500" />
              </div>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              Percentage of visitors who RSVP
            </p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Days Left
                </p>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  {daysLeft > 0 ? daysLeft : 'Ended'}
                </h3>
              </div>
              <div className="p-2 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                <Clock className="w-6 h-6 text-orange-500" />
              </div>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              {daysLeft > 0 
                ? `Event is scheduled for ${formatDate(event.date)}` 
                : 'Event has already taken place'}
            </p>
          </div>
        </div>
        
        {/* Daily Visits Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Daily Page Visits
          </h3>
          
          <div className="h-48 flex items-end justify-between gap-1">
            {dailyVisits.map((visits, i) => (
              <div key={i} className="relative h-full flex flex-col justify-end flex-1">
                <div 
                  className="bg-primary-500 dark:bg-primary-600 rounded-t-sm w-full" 
                  style={{ height: `${(visits / Math.max(...dailyVisits)) * 100}%` }}
                ></div>
                <span className="text-xs text-gray-500 dark:text-gray-400 text-center mt-1">
                  {['M', 'T', 'W', 'T', 'F', 'S', 'S'][i]}
                </span>
              </div>
            ))}
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* RSVPs List */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Latest RSVPs
              </h3>
              <Link to={`/event/${event.id}/rsvps`}>
                <Button variant="ghost" size="sm" className="text-sm">
                  View All <ChevronRight size={16} className="ml-1" />
                </Button>
              </Link>
            </div>
            
            {latestRsvps.length > 0 ? (
              <div className="space-y-3">
                {latestRsvps.map((rsvp, index) => (
                  <div 
                    key={index}
                    className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700 last:border-none"
                  >
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center mr-3">
                        <UserCheck size={14} className="text-primary-600 dark:text-primary-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {getRsvpAttendeeInfo(rsvp.userId).name}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {new Date(rsvp.timestamp).toLocaleDateString()} at {new Date(rsvp.timestamp).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500 dark:text-gray-400">
                  No RSVPs yet
                </p>
              </div>
            )}
          </div>
          
          {/* Recommended Actions */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Recommended Actions
            </h3>
            
            <div className="space-y-4">
              <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                <h4 className="text-base font-medium text-green-700 dark:text-green-400 mb-1">
                  Share Your Event
                </h4>
                <p className="text-sm text-green-600 dark:text-green-500 mb-2">
                  Increase visibility by sharing your event on social media.
                </p>
                <Button size="sm" className="bg-green-600 hover:bg-green-700">
                  <Share2 size={16} className="mr-1" /> Share Now
                </Button>
              </div>
              
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                <h4 className="text-base font-medium text-blue-700 dark:text-blue-400 mb-1">
                  Send Reminder
                </h4>
                <p className="text-sm text-blue-600 dark:text-blue-500 mb-2">
                  Send a reminder to all {rsvpCount} registered attendees.
                </p>
                <Button size="sm" variant="outline" className="border-blue-600 text-blue-600 hover:bg-blue-50">
                  Schedule Reminder
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventAnalytics; 