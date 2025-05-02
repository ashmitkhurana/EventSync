import React, { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useEvents, Event } from '../hooks/useEvents';
import Button from '../components/ui/Button';
import { Info, Upload, FileText, Trash2, X, CheckCircle, Edit, AlertCircle } from 'lucide-react';
import Papa from 'papaparse';
import { ParseResult } from 'papaparse';
import { motion } from 'framer-motion';

interface CSVEvent {
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  categories: string;
  maxAttendees: string;
  isPublic: string;
  imageUrl: string;
}

interface EventWithValidation extends Omit<Event, 'id' | 'createdAt'> {
  valid: boolean;
  errors?: string[];
}

const CreateMultipleEvents: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { createEvent, isLoading } = useEvents();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [parsedEvents, setParsedEvents] = useState<EventWithValidation[]>([]);
  const [currentStep, setCurrentStep] = useState<'upload' | 'preview' | 'result'>('upload');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [creationResult, setCreationResult] = useState<{
    success: number;
    failed: number;
    events: { id: string; title: string; success: boolean; error?: string }[];
  }>({ success: 0, failed: 0, events: [] });

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError(null);
    setIsUploading(true);
    
    const file = event.target.files?.[0];
    if (!file) {
      setIsUploading(false);
      return;
    }

    // Validate file type
    if (!file.name.endsWith('.csv')) {
      setUploadError('Please upload a CSV file');
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }

    // Parse CSV file
    Papa.parse<CSVEvent>(file, {
      header: true,
      complete: (results: ParseResult<CSVEvent>) => {
        if (results.errors.length > 0) {
          setUploadError(`Error parsing CSV: ${results.errors[0].message}`);
          setIsUploading(false);
          return;
        }

        if (results.data.length === 0) {
          setUploadError('CSV file is empty');
          setIsUploading(false);
          return;
        }

        // Process each CSV row into an event with validation
        const processedEvents = results.data
          .filter(row => row.title) // Skip empty rows
          .map((row: CSVEvent) => {
            const categoryArray = row.categories
              ? row.categories.split(',').map((cat: string) => cat.trim())
              : [];

            // Create event object
            const eventData: EventWithValidation = {
              title: row.title,
              description: row.description || '',
              date: row.date || '',
              time: row.time || '',
              location: row.location || '',
              categories: categoryArray,
              maxAttendees: parseInt(row.maxAttendees) || 50,
              isPublic: row.isPublic?.toLowerCase() === 'true',
              imageUrl: row.imageUrl || 'https://images.pexels.com/photos/3183132/pexels-photo-3183132.jpeg',
              organizer: {
                id: user?.id || '',
                name: user?.name || 'Anonymous',
                avatar: user?.avatar,
              },
              attendees: [],
              rsvpAttendees: [],
              valid: true,
              errors: [],
            };

            // Validate required fields
            if (!eventData.title) {
              eventData.valid = false;
              eventData.errors?.push('Title is required');
            }
            if (!eventData.description) {
              eventData.valid = false;
              eventData.errors?.push('Description is required');
            }
            if (!eventData.date) {
              eventData.valid = false;
              eventData.errors?.push('Date is required');
            }
            if (!eventData.time) {
              eventData.valid = false;
              eventData.errors?.push('Time is required');
            }
            if (!eventData.location) {
              eventData.valid = false;
              eventData.errors?.push('Location is required');
            }
            if (eventData.categories.length === 0) {
              eventData.valid = false;
              eventData.errors?.push('At least one category is required');
            }

            return eventData;
          });

        setParsedEvents(processedEvents);
        setCurrentStep('preview');
        setIsUploading(false);
      },
      error: (error: Error) => {
        setUploadError(`Error parsing CSV: ${error.message}`);
        setIsUploading(false);
      }
    });
  }, [user]);

  const removeEvent = (index: number) => {
    setParsedEvents(prev => prev.filter((_, i) => i !== index));
  };

  const handleCreateEvents = async () => {
    if (!user) {
      setUploadError('You must be logged in to create events');
      return;
    }

    const results = {
      success: 0,
      failed: 0,
      events: [] as { id: string; title: string; success: boolean; error?: string }[],
    };

    // Process each event
    for (const event of parsedEvents) {
      try {
        if (!event.valid) {
          results.failed++;
          results.events.push({
            id: '',
            title: event.title,
            success: false,
            error: event.errors?.join(', ') || 'Invalid event data',
          });
          continue;
        }

        // Extract only the event data without validation fields
        const eventData = {
          title: event.title,
          description: event.description,
          date: event.date,
          time: event.time,
          location: event.location,
          categories: event.categories,
          maxAttendees: event.maxAttendees,
          isPublic: event.isPublic,
          imageUrl: event.imageUrl,
          organizer: event.organizer,
          attendees: event.attendees,
          rsvpAttendees: event.rsvpAttendees
        };
        
        // Create event
        const createdEvent = await createEvent(eventData);
        
        // Record success
        results.success++;
        results.events.push({
          id: createdEvent.id,
          title: createdEvent.title,
          success: true,
        });
      } catch (error) {
        // Record failure
        results.failed++;
        results.events.push({
          id: '',
          title: event.title,
          success: false,
          error: error instanceof Error ? error.message : 'Failed to create event',
        });
      }
    }

    setCreationResult(results);
    setCurrentStep('result');
  };

  const resetForm = () => {
    setParsedEvents([]);
    setCurrentStep('upload');
    setUploadError(null);
    setCreationResult({ success: 0, failed: 0, events: [] });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const csvTemplateContent = `title,description,date,time,location,categories,maxAttendees,isPublic,imageUrl
Tech Conference 2023,A conference about the latest technology trends.,2023-09-15,10:00 AM,Convention Center NYC,Technology,100,true,https://example.com/image1.jpg
Hackathon,Join us for 24 hours of coding and innovation.,2023-10-01,9:00 AM,Tech Hub SF,"Technology,Networking",50,true,
Music Festival,Enjoy live performances from top artists.,2023-11-20,7:00 PM,Central Park,"Music,Festival",500,true,`;

  const downloadCSVTemplate = () => {
    const blob = new Blob([csvTemplateContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'events_template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  const renderUploadScreen = () => (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8"
    >
      <motion.div 
        variants={itemVariants}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8"
      >
        <div className="text-center mb-6">
          <Upload className="mx-auto h-12 w-12 text-gray-400" />
          <h2 className="mt-3 text-xl font-semibold text-gray-900 dark:text-white">
            Upload CSV file
          </h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Create multiple events at once by uploading a CSV file
          </p>
        </div>

        <div className="max-w-xl mx-auto">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            CSV File
          </label>
          <div className="mt-1 flex items-center">
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              className="block w-full text-sm text-gray-500 dark:text-gray-400
                file:mr-4 file:py-2 file:px-4
                file:rounded-md file:border-0
                file:text-sm file:font-semibold
                file:bg-primary-50 file:text-primary-700
                dark:file:bg-primary-900/20 dark:file:text-primary-300
                hover:file:bg-primary-100 dark:hover:file:bg-primary-800/30
                focus:outline-none"
              disabled={isUploading}
            />
            {isUploading && (
              <div className="ml-3 flex-shrink-0">
                <svg className="animate-spin h-5 w-5 text-primary-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
            )}
          </div>
          {uploadError && (
            <p className="mt-2 text-sm text-error-500">
              {uploadError}
            </p>
          )}
        </div>

        <div className="mt-6">
          <div className="rounded-md bg-primary-50 dark:bg-primary-900/20 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <Info className="h-5 w-5 text-primary-400" aria-hidden="true" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-primary-800 dark:text-primary-300">
                  CSV Format Information
                </h3>
                <div className="mt-2 text-sm text-primary-700 dark:text-primary-400">
                  <p>
                    Your CSV file should include the following columns:
                  </p>
                  <ul className="list-disc list-inside mt-1 space-y-1">
                    <li>title (required)</li>
                    <li>description (required)</li>
                    <li>date (required, YYYY-MM-DD format)</li>
                    <li>time (required, e.g., "10:00 AM")</li>
                    <li>location (required)</li>
                    <li>categories (required, comma-separated values)</li>
                    <li>maxAttendees (optional, default: 50)</li>
                    <li>isPublic (optional, "true" or "false", default: true)</li>
                    <li>imageUrl (optional)</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-4">
            <Button
              type="button"
              variant="outline"
              onClick={downloadCSVTemplate}
              className="w-full"
            >
              <FileText className="w-4 h-4 mr-2" />
              Download CSV Template
            </Button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );

  const renderPreviewScreen = () => (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      <motion.div 
        variants={itemVariants}
        className="flex items-center justify-between mb-4"
      >
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Event Preview
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Showing {parsedEvents.length} events from your CSV file
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={resetForm}
          className="font-medium"
        >
          Upload Different File
        </Button>
      </motion.div>

      <motion.div 
        variants={itemVariants}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Title
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Date & Time
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Location
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Categories
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
              {parsedEvents.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                    No events found in the CSV file
                  </td>
                </tr>
              ) : (
                parsedEvents.map((event, index) => (
                  <tr key={index} className={!event.valid ? 'bg-error-50 dark:bg-error-900/20' : ''}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {event.valid ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-success-100 text-success-800 dark:bg-success-900/20 dark:text-success-300">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Valid
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-error-100 text-error-800 dark:bg-error-900/20 dark:text-error-300">
                          <AlertCircle className="w-3 h-3 mr-1" />
                          Invalid
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {event.title || <span className="text-error-500">Missing title</span>}
                      </div>
                      {!event.valid && event.errors && (
                        <div className="text-xs text-error-500 mt-1">
                          {event.errors.join(', ')}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {event.date ? event.date : <span className="text-error-500">Missing date</span>}
                      {event.time ? ` • ${event.time}` : <span className="text-error-500"> • Missing time</span>}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {event.location || <span className="text-error-500">Missing location</span>}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                      {event.categories.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {event.categories.map((category, catIndex) => (
                            <span key={catIndex} className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800 dark:bg-primary-900/20 dark:text-primary-300">
                              {category}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-error-500">Missing categories</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => removeEvent(index)}
                        className="text-error-600 hover:text-error-900 dark:text-error-400 dark:hover:text-error-300 mr-3"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <button
                        className="text-primary-600 hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-300"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      <motion.div 
        variants={itemVariants} 
        className="flex justify-between items-center mt-6"
      >
        <div>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {parsedEvents.filter(e => e.valid).length} of {parsedEvents.length} events are valid
          </span>
        </div>
        <div className="flex space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={resetForm}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleCreateEvents}
            disabled={parsedEvents.length === 0 || parsedEvents.every(e => !e.valid) || isLoading}
          >
            {isLoading ? 'Creating Events...' : 'Create Events'}
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );

  const renderResultScreen = () => (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      <motion.div 
        variants={itemVariants}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 text-center"
      >
        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-success-100 dark:bg-success-900/20">
          <CheckCircle className="h-6 w-6 text-success-600 dark:text-success-400" />
        </div>
        <h2 className="mt-3 text-lg font-medium text-gray-900 dark:text-white">
          Event creation complete
        </h2>
        <div className="mt-2 flex justify-center space-x-6">
          <div className="text-center">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Successful</p>
            <p className="mt-1 text-3xl font-semibold text-success-600 dark:text-success-400">{creationResult.success}</p>
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Failed</p>
            <p className="mt-1 text-3xl font-semibold text-error-600 dark:text-error-400">{creationResult.failed}</p>
          </div>
        </div>
      </motion.div>

      {creationResult.events.length > 0 && (
        <motion.div 
          variants={itemVariants}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Event
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Result
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                {creationResult.events.map((event, index) => (
                  <tr key={index} className={!event.success ? 'bg-error-50 dark:bg-error-900/20' : ''}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {event.success ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-success-100 text-success-800 dark:bg-success-900/20 dark:text-success-300">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Success
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-error-100 text-error-800 dark:bg-error-900/20 dark:text-error-300">
                          <X className="w-3 h-3 mr-1" />
                          Failed
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {event.title}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {event.success ? (
                        <button 
                          onClick={() => navigate(`/event/${event.id}`)}
                          className="text-primary-600 hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-300"
                        >
                          View Event
                        </button>
                      ) : (
                        <span className="text-error-500">{event.error}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      <motion.div variants={itemVariants} className="flex justify-end space-x-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => navigate('/events')}
        >
          View All Events
        </Button>
        <Button
          type="button"
          onClick={resetForm}
        >
          Create More Events
        </Button>
      </motion.div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="container max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-raleway font-extrabold text-gray-900 dark:text-white">
              Create Multiple Events
            </h1>
            <p className="text-gray-600 dark:text-gray-400 font-raleway font-light">
              Create events in bulk by uploading a CSV file
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => navigate('/create-event')}
          >
            Create Single Event
          </Button>
        </div>

        {currentStep === 'upload' && renderUploadScreen()}
        {currentStep === 'preview' && renderPreviewScreen()}
        {currentStep === 'result' && renderResultScreen()}
      </div>
    </div>
  );
};

export default CreateMultipleEvents; 