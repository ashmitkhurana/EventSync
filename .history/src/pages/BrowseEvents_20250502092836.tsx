import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Filter, Calendar, MapPin, X } from 'lucide-react';
import { useEvents } from '../hooks/useEvents';
import EventCard from '../components/EventCard';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import CategoryBadge from '../components/CategoryBadge';

const BrowseEvents: React.FC = () => {
  const { events, fetchEvents, isLoading } = useEvents();
  const location = useLocation();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedLocation, setSelectedLocation] = useState<string>('');
  const searchInputRef = useRef<HTMLInputElement>(null);
  
  // Get URL query parameters
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const categoryParam = params.get('category');
    const searchParam = params.get('search');
    
    if (categoryParam) {
      setSelectedCategories([categoryParam]);
    }
    
    if (searchParam) {
      setSearchTerm(searchParam);
      // Focus the search input if we came from homepage search
      searchInputRef.current?.focus();
    }
    
    fetchEvents();
  }, [location.search, fetchEvents]);
  
  // Get all unique categories from events
  const allCategories = Array.from(
    new Set(events.flatMap(event => event.categories))
  ).sort();
  
  // Get all unique locations from events
  const allLocations = Array.from(
    new Set(events.map(event => {
      // Extract city from full location
      const locationParts = event.location.split(',');
      return locationParts.length > 1 
        ? locationParts[locationParts.length - 2].trim() 
        : event.location;
    }))
  ).sort();
  
  // Filter events based on search and filters
  const filteredEvents = events.filter(event => {
    // Search term filter
    const matchesSearch = searchTerm 
      ? event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.description.toLowerCase().includes(searchTerm.toLowerCase())
      : true;
    
    // Category filter
    const matchesCategory = selectedCategories.length > 0
      ? selectedCategories.some(cat => event.categories.includes(cat))
      : true;
    
    // Date filter
    const matchesDate = selectedDate
      ? event.date === selectedDate
      : true;
    
    // Location filter
    const matchesLocation = selectedLocation
      ? event.location.toLowerCase().includes(selectedLocation.toLowerCase())
      : true;
    
    return matchesSearch && matchesCategory && matchesDate && matchesLocation;
  });
  
  // Toggle category selection
  const toggleCategory = (category: string) => {
    setSelectedCategories(prev => 
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };
  
  // Clear all filters
  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategories([]);
    setSelectedDate('');
    setSelectedLocation('');
    navigate('/browse');
  };
  
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
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
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-12 text-center"
      >
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
          Browse Events
        </h1>
        <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          Discover upcoming events near you and around the world
        </p>
      </motion.div>
      
      {/* Search and Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="mb-8"
      >
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-grow">
              <Input
                ref={searchInputRef}
                leftIcon={<Search size={18} />}
                placeholder="Search events..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="grid grid-cols-2 md:flex gap-2">
              <div className="relative">
                <Input
                  leftIcon={<Calendar size={18} />}
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full"
                />
              </div>
              
              <div className="relative">
                <select 
                  className="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border py-2 px-3 pl-10"
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                >
                  <option value="">Any Location</option>
                  {allLocations.map(location => (
                    <option key={location} value={location}>{location}</option>
                  ))}
                </select>
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MapPin size={18} className="text-gray-500 dark:text-gray-400" />
                </div>
              </div>
              
              {(searchTerm || selectedCategories.length > 0 || selectedDate || selectedLocation) && (
                <Button
                  variant="outline"
                  icon={<X size={16} />}
                  iconPosition="left"
                  onClick={clearFilters}
                  className="whitespace-nowrap"
                >
                  Clear
                </Button>
              )}
            </div>
          </div>
          
          {/* Categories */}
          <div>
            <div className="flex items-center mb-3">
              <Filter size={16} className="text-gray-500 dark:text-gray-400 mr-2" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Filter by category:
              </span>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {allCategories.map(category => (
                <button
                  key={category}
                  className={`inline-block rounded-full px-3 py-1 text-sm font-medium transition-colors ${
                    selectedCategories.includes(category)
                      ? 'bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-300'
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                  onClick={() => toggleCategory(category)}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
      
      {/* Events Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow animate-pulse">
              <div className="h-48 bg-gray-300 dark:bg-gray-700" />
              <div className="p-5 space-y-4">
                <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-3/4" />
                <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-full" />
                <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-full" />
                <div className="h-10 bg-gray-300 dark:bg-gray-700 rounded w-1/4" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {filteredEvents.length > 0 ? (
            filteredEvents.map(event => (
              <motion.div key={event.id} variants={itemVariants}>
                <EventCard event={event} />
              </motion.div>
            ))
          ) : (
            <motion.div 
              variants={itemVariants}
              className="col-span-1 md:col-span-2 lg:col-span-3 text-center py-16"
            >
              <div className="mx-auto w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-6">
                <Calendar size={32} className="text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                No events found
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Try adjusting your search filters or browse all events
              </p>
              <Button onClick={clearFilters}>
                View all events
              </Button>
            </motion.div>
          )}
        </motion.div>
      )}
    </div>
  );
};

export default BrowseEvents;