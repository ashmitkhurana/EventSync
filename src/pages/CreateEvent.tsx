import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { motion } from 'framer-motion';
import { CalendarDays, MapPin, User, Tag, Clock, Users, Image as ImageIcon, Info, CheckCircle } from 'lucide-react';
import { Event, useEvents } from '../hooks/useEvents';
import { useAuth } from '../hooks/useAuth';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { formatDate } from '../lib/utils';

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
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [previewImageUrl, setPreviewImageUrl] = useState('');
  
  const { 
    register, 
    handleSubmit, 
    control,
    setValue,
    watch,
    formState: { errors, isValid } 
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
    if (!user) return;
    
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
      navigate(`/event/${newEvent.id}`);
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
      case 1:
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
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Time
                </label>
                <div className="relative">
                  <Clock size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400" />
                  <input
                    type="time"
                    className="block w-full pl-10 pr-3 py-2 rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                    {...register('time', { required: 'Time is required' })}
                  />
                </div>
                {errors.time && (
                  <p className="mt-1 text-sm text-error-500">{errors.time.message}</p>
                )}
              </div>
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
      
      case 2:
        return (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-6"
          >
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
      
      case 3:
        return (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-6"
          >
            <motion.div 
              variants={itemVariants}
              className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-md"
            >
              <div className="aspect-video overflow-hidden bg-gray-100 dark:bg-gray-700">
                <img
                  src={watchedValues.imageUrl}
                  alt={watchedValues.title}
                  className="w-full h-full object-cover"
                />
              </div>
              
              <div className="p-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                  {watchedValues.title || 'Event Title'}
                </h2>
                
                <div className="flex flex-wrap gap-2 mb-4">
                  {selectedCategories.map(category => (
                    <span 
                      key={category}
                      className="px-3 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-300"
                    >
                      {category}
                    </span>
                  ))}
                </div>
                
                <div className="space-y-3 mb-6">
                  <div className="flex items-center text-gray-500 dark:text-gray-400">
                    <CalendarDays size={16} className="mr-2" />
                    <span>
                      {watchedValues.date ? formatDate(watchedValues.date) : 'Event Date'}
                      {watchedValues.time && ` • ${watchedValues.time}`}
                    </span>
                  </div>
                  
                  <div className="flex items-center text-gray-500 dark:text-gray-400">
                    <MapPin size={16} className="mr-2" />
                    <span>{watchedValues.location || 'Event Location'}</span>
                  </div>
                  
                  <div className="flex items-center text-gray-500 dark:text-gray-400">
                    <Users size={16} className="mr-2" />
                    <span>
                      Max {watchedValues.maxAttendees || '0'} attendees • {watchedValues.isPublic ? 'Public' : 'Private'} event
                    </span>
                  </div>
                </div>
                
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    About this event
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 whitespace-pre-line">
                    {watchedValues.description || 'No description provided.'}
                  </p>
                </div>
                
                <div className="border-t border-gray-200 dark:border-gray-700 mt-6 pt-4 flex items-center">
                  <img 
                    src={user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || '')}&background=random`}
                    alt={user?.name || 'Organizer'}
                    className="w-8 h-8 rounded-full mr-2"
                  />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Organized by <span className="font-medium">{user?.name}</span>
                  </span>
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
    if (currentStep === 1) {
      if (!watchedValues.title || !watchedValues.description || !watchedValues.date || 
          !watchedValues.time || !watchedValues.location) {
        return;
      }
    }
    
    if (currentStep === 2 && selectedCategories.length === 0) {
      return;
    }
    
    setCurrentStep(currentStep + 1);
  };
  
  const prevStep = () => {
    setCurrentStep(currentStep - 1);
  };
  
  const isStepValid = () => {
    if (currentStep === 1) {
      return !!watchedValues.title && !!watchedValues.description && 
             !!watchedValues.date && !!watchedValues.time && !!watchedValues.location;
    }
    
    if (currentStep === 2) {
      return selectedCategories.length > 0;
    }
    
    return true;
  };
  
  return (
    <div className="container mx-auto px-4 pt-24 pb-16">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-3xl mx-auto"
      >
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Create a New Event
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Fill in the details below to create and share your event
          </p>
        </div>
        
        {/* Steps Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-center">
            {steps.map((step, index) => (
              <React.Fragment key={step.title}>
                {/* Step circle */}
                <div 
                  className={`flex items-center justify-center w-10 h-10 rounded-full ${
                    index + 1 === currentStep
                      ? 'bg-primary-600 text-white'
                      : index + 1 < currentStep
                        ? 'bg-primary-100 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400'
                        : 'bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-400'
                  }`}
                >
                  {step.icon}
                </div>
                
                {/* Connector line */}
                {index < steps.length - 1 && (
                  <div 
                    className={`w-16 h-1 ${
                      index + 1 < currentStep
                        ? 'bg-primary-600 dark:bg-primary-400'
                        : 'bg-gray-200 dark:bg-gray-700'
                    }`}
                  ></div>
                )}
              </React.Fragment>
            ))}
          </div>
          
          <div className="flex justify-between mt-2">
            {steps.map((step, index) => (
              <div key={step.title} className="w-32 text-center">
                <span 
                  className={`text-sm font-medium ${
                    index + 1 === currentStep
                      ? 'text-primary-600 dark:text-primary-400'
                      : 'text-gray-500 dark:text-gray-400'
                  }`}
                >
                  {step.title}
                </span>
              </div>
            ))}
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="p-6">
              {renderStep()}
            </div>
            
            <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 flex justify-between">
              {currentStep > 1 ? (
                <Button
                  type="button"
                  variant="outline"
                  onClick={prevStep}
                >
                  Back
                </Button>
              ) : (
                <div></div>
              )}
              
              {currentStep < steps.length ? (
                <Button
                  type="button"
                  onClick={nextStep}
                  disabled={!isStepValid()}
                >
                  Continue
                </Button>
              ) : (
                <Button
                  type="submit"
                  loading={isLoading}
                >
                  Create Event
                </Button>
              )}
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default CreateEvent;