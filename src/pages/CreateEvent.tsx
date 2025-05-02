import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { motion } from 'framer-motion';
import { CalendarDays, MapPin, Tag, Clock, Users, Image as ImageIcon, Info, CheckCircle } from 'lucide-react';
import { Event, useEvents } from '../hooks/useEvents';
import { useAuth } from '../hooks/useAuth';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { formatDate } from '../lib/utils';
import TimeSelect from '../components/ui/TimeSelect';

interface CreateEventFormData {
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  categories: string[];
  maxAttendees: number;
  isPublic: boolean;
  imageUrl: string;
}

const categories = [
  'Technology', 'Business', 'Design', 'Marketing', 'Music', 'Food',
  'Arts', 'Health', 'Sports', 'Education', 'Lifestyle', 'Networking',
  'Conference', 'Workshop', 'Festival', 'Startup', 'Wellness', 'Cooking'
];

const CreateEvent: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { createEvent, isLoading } = useEvents();
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [previewImageUrl, setPreviewImageUrl] = useState('');

  const { 
    register, 
    handleSubmit, 
    control,
    setValue,
    watch,
    formState: { errors } 
  } = useForm<CreateEventFormData>({
    defaultValues: {
      isPublic: true,
      maxAttendees: 50,
      categories: [],
      imageUrl: 'https://images.pexels.com/photos/3183132/pexels-photo-3183132.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    },
    mode: 'onChange'
  });
  
  const watchedValues = watch();
  
  const onSubmit = async (data: CreateEventFormData) => {
    if (currentStep !== 2) {
      return;
    }
    
    if (!user) {
      console.error('No user found');
      return;
    }

    try {
      const eventData: Omit<Event, 'id' | 'createdAt'> = {
        ...data,
        categories: selectedCategories,
        organizer: {
          id: user.id,
          name: user.name,
          avatar: user.avatar,
        },
        attendees: [],
      };
      const newEvent = await createEvent(eventData);
      if (newEvent) {
        navigate(`/event/${newEvent.id}`);
      }
    } catch (error) {
      console.error('Error creating event:', error);
    }
  };
  
  const toggleCategory = (category: string) => {
    setSelectedCategories(prev => {
      const newCategories = prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category];
      setValue('categories', newCategories);
      return newCategories;
    });
  };
  
  const handleImageUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setPreviewImageUrl(url);
    setValue('imageUrl', url);
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
  
  // Steps
  const steps = [
    { title: 'Basic Info', icon: <Info size={20} /> },
    { title: 'Details', icon: <Tag size={20} /> },
    { title: 'Preview', icon: <CheckCircle size={20} /> }
  ];
  
  // Render Form Steps
  const renderStep = () => {
    switch (currentStep) {
      case 0: // Basic Info
        return (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-6"
          >
            <motion.div variants={itemVariants}>
              <Input
                label="Event Title"
                leftIcon={<CalendarDays size={18} />}
                placeholder="Give your event a clear, descriptive title"
                error={errors.title?.message}
                {...register('title', { 
                  required: 'Title is required',
                  minLength: {
                    value: 5,
                    message: 'Title must be at least 5 characters long'
                  }
                })}
              />
            </motion.div>
            
            <motion.div variants={itemVariants}>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Event Description
              </label>
              <textarea
                className="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border py-2 px-3 min-h-32"
                placeholder="Describe your event, including what attendees can expect"
                {...register('description', { 
                  required: 'Description is required',
                  minLength: {
                    value: 20,
                    message: 'Description must be at least 20 characters long'
                  }
                })}
              />
              {errors.description && (
                <p className="mt-1 text-sm text-error-500">{errors.description.message}</p>
              )}
            </motion.div>
            
            <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Date"
                type="date"
                leftIcon={<CalendarDays size={18} />}
                error={errors.date?.message}
                min={new Date().toISOString().split('T')[0]}
                {...register('date', { required: 'Date is required' })}
              />
              <Controller
                name="time"
                control={control}
                rules={{ 
                  required: 'Time is required',
                  pattern: {
                    value: /^(0?[1-9]|1[0-2]):[0-5][0-9] (AM|PM)$/,
                    message: 'Please enter a valid time'
                  }
                }}
                render={({ field }) => (
                  <TimeSelect
                    label="Time"
                    leftIcon={<Clock size={18} />}
                    error={errors.time?.message}
                    {...field}
                  />
                )}
              />
            </motion.div>
            
            <motion.div variants={itemVariants}>
              <Input
                label="Location"
                leftIcon={<MapPin size={18} />}
                placeholder="Venue name and address"
                error={errors.location?.message}
                {...register('location', { required: 'Location is required' })}
              />
            </motion.div>
          </motion.div>
        );

      case 1: // Details
        return (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-6"
          >
            <motion.div variants={itemVariants}>
              <Input
                label="Image URL"
                leftIcon={<ImageIcon size={18} />}
                placeholder="Enter URL for event cover image"
                value={watchedValues.imageUrl}
                onChange={handleImageUrlChange}
              />
              
              {previewImageUrl || watchedValues.imageUrl ? (
                <div className="mt-3 relative aspect-video rounded-md overflow-hidden bg-gray-100 dark:bg-gray-700">
                  <img
                    src={previewImageUrl || watchedValues.imageUrl}
                    alt="Event cover preview"
                    className="w-full h-full object-cover"
                    onError={() => setPreviewImageUrl('')}
                  />
                </div>
              ) : null}
            </motion.div>
            
            <motion.div variants={itemVariants}>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Event Categories (Select up to 3)
              </label>
              <div className="flex flex-wrap gap-2">
                {categories.map(category => (
                  <button
                    key={category}
                    type="button"
                    className={`inline-block rounded-full px-3 py-1 text-sm font-medium transition-colors ${
                      selectedCategories.includes(category)
                        ? 'bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-300'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                    onClick={() => toggleCategory(category)}
                    disabled={!selectedCategories.includes(category) && selectedCategories.length >= 3}
                  >
                    {category}
                  </button>
                ))}
              </div>
              {selectedCategories.length === 0 && (
                <p className="mt-1 text-sm text-error-500">Please select at least one category</p>
              )}
            </motion.div>
            
            <motion.div variants={itemVariants}>
              <Input
                label="Maximum Attendees"
                leftIcon={<Users size={18} />}
                type="number"
                min="1"
                error={errors.maxAttendees?.message}
                {...register('maxAttendees', {
                  required: 'Maximum attendees is required',
                  min: {
                    value: 1,
                    message: 'At least 1 attendee is required'
                  },
                  valueAsNumber: true
                })}
              />
            </motion.div>
            
            <motion.div variants={itemVariants}>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Event Privacy
              </label>
              <div className="space-y-2">
                <div className="flex items-center">
                  <input
                    id="public"
                    type="radio"
                    value="public"
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                    {...register('isPublic')}
                    onChange={() => setValue('isPublic', true)}
                    checked={watchedValues.isPublic}
                  />
                  <label htmlFor="public" className="ml-3">
                    <span className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Public Event
                    </span>
                    <span className="block text-sm text-gray-500 dark:text-gray-400">
                      Anyone can discover and RSVP to this event
                    </span>
                  </label>
                </div>
                
                <div className="flex items-center">
                  <input
                    id="private"
                    type="radio"
                    value="private"
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                    {...register('isPublic')}
                    onChange={() => setValue('isPublic', false)}
                    checked={!watchedValues.isPublic}
                  />
                  <label htmlFor="private" className="ml-3">
                    <span className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Private Event
                    </span>
                    <span className="block text-sm text-gray-500 dark:text-gray-400">
                      Only people with the link can RSVP
                    </span>
                  </label>
                </div>
              </div>
            </motion.div>
          </motion.div>
        );

      case 2: // Preview
        return (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-6"
          >
            {/* Event Preview Card */}
            <motion.div 
              variants={itemVariants}
              className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-lg"
            >
              <div className="relative aspect-video">
                <img
                  src={watchedValues.imageUrl}
                  alt={watchedValues.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-0 right-0 left-0 p-3 bg-gradient-to-b from-black/50 to-transparent flex flex-wrap gap-1.5 justify-end">
                  {selectedCategories.map(category => (
                    <span key={category} className="bg-white/90 text-gray-900 text-xs px-2 py-1 rounded-full">
                      {category}
                    </span>
                  ))}
                </div>
              </div>
              
              <div className="p-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  {watchedValues.title}
                </h2>
                
                <div className="space-y-4 mb-6">
                  <div className="flex items-center text-gray-600 dark:text-gray-300">
                    <CalendarDays size={20} className="mr-3" />
                    <div>
                      <p className="font-medium">Date and Time</p>
                      <p>{formatDate(watchedValues.date)} • {watchedValues.time}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center text-gray-600 dark:text-gray-300">
                    <MapPin size={20} className="mr-3" />
                    <div>
                      <p className="font-medium">Location</p>
                      <p>{watchedValues.location}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center text-gray-600 dark:text-gray-300">
                    <Users size={20} className="mr-3" />
                    <div>
                      <p className="font-medium">Capacity</p>
                      <p>Maximum {watchedValues.maxAttendees} attendees</p>
                    </div>
                  </div>
                </div>
                
                <div className="prose dark:prose-invert max-w-none">
                  <h3 className="text-lg font-semibold mb-2">About this event</h3>
                  <p className="whitespace-pre-line">{watchedValues.description}</p>
                </div>
                
                <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center">
                    <img 
                      src={user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || '')}&background=random`}
                      alt={user?.name}
                      className="w-10 h-10 rounded-full mr-3"
                    />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        Organized by {user?.name}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {watchedValues.isPublic ? 'Public' : 'Private'} Event
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
            
            <motion.div 
              variants={itemVariants}
              className="bg-primary-50 dark:bg-primary-900/20 rounded-lg p-4 flex items-start"
            >
              <Info size={20} className="text-primary-500 mr-3 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-primary-800 dark:text-primary-300 font-medium">Ready to create your event?</p>
                <p className="text-primary-700 dark:text-primary-400 text-sm mt-1">
                  Double check all details before submitting. You can edit your event later if needed.
                </p>
              </div>
            </motion.div>
          </motion.div>
        );

      default:
        return null;
    }
  };
  
  const nextStep = () => {
    if (currentStep === 0) {
      if (!watchedValues.title || !watchedValues.description || !watchedValues.date || 
          !watchedValues.time || !watchedValues.location) {
        return;
      }
    }
    
    if (currentStep === 1) {
      if (selectedCategories.length === 0) {
        return;
      }
    }
    
    // Only allow proceeding to next step if we're not already at the preview step
    if (currentStep < 2) {
      setCurrentStep(currentStep + 1);
    }
  };
  
  const prevStep = () => {
    setCurrentStep(currentStep - 1);
  };
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="container max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white text-center mb-2">
          Create an Event
        </h1>
        <p className="text-gray-600 dark:text-gray-400 text-center mb-8">
          Fill in the details below to create and share your event
        </p>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center">
            {steps.map((step, index) => (
              <React.Fragment key={step.title}>
                <div className="flex items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      currentStep > index
                        ? 'bg-primary-500 text-white'
                        : currentStep === index
                        ? 'bg-primary-500 text-white'
                        : 'bg-gray-300 dark:bg-gray-600 text-gray-600 dark:text-gray-300'
                    }`}
                  >
                    {step.icon}
                  </div>
                  <span
                    className={`ml-2 text-sm font-medium ${
                      currentStep === index
                        ? 'text-primary-500'
                        : 'text-gray-500 dark:text-gray-400'
                    }`}
                  >
                    {step.title}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`w-24 h-1 mx-2 ${
                      currentStep > index
                        ? 'bg-primary-500'
                        : 'bg-gray-300 dark:bg-gray-600'
                    }`}
                  />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Form */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 md:p-8">
          <form onSubmit={handleSubmit(onSubmit)}>
            {renderStep()}
            
            <div className="mt-8 flex justify-between">
              {currentStep > 0 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={prevStep}
                >
                  Back
                </Button>
              )}
              
              <div className="ml-auto">
                {currentStep < 2 ? (
                  <Button
                    type="button"
                    onClick={nextStep}
                    disabled={
                      (currentStep === 0 && (!watchedValues.title || !watchedValues.description || !watchedValues.date || !watchedValues.time || !watchedValues.location)) ||
                      (currentStep === 1 && selectedCategories.length === 0)
                    }
                  >
                    Continue
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Creating...' : 'Create Event'}
                  </Button>
                )}
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateEvent;