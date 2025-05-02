import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CalendarClock, Search, Sparkles, ArrowRight } from 'lucide-react';
import { useEvents } from '../hooks/useEvents';
import EventCard from '../components/EventCard';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import CategoryBadge from '../components/CategoryBadge';

const Home: React.FC = () => {
  const { events, fetchEvents, isLoading } = useEvents();

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  // Featured event is the first one for demo purposes
  const featuredEvent = events.length > 0 ? events[0] : null;
  
  // Get upcoming events (excluding the featured one)
  const upcomingEvents = events.slice(1, 5);
  
  // Get all available categories from the events
  const allCategories = Array.from(
    new Set(events.flatMap(event => event.categories))
  ).slice(0, 8); // Limit to 8 for the UI

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
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  return (
    <div className="pt-16">
      {/* Hero Section */}
      <motion.section
        className="relative pt-16 pb-24 overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-primary-500/10 to-secondary-500/10 dark:from-primary-900/20 dark:to-secondary-900/20 -z-10" />
        
        <div className="container mx-auto px-4">
          <motion.div 
            className="max-w-3xl mx-auto text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6">
              Discover and Create<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-500 to-secondary-500">
                Memorable Events
              </span>
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
              Find local events, connect with like-minded people, and create unforgettable experiences.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/browse">
                <Button size="lg" className="w-full sm:w-auto">
                  Browse Events
                  <ArrowRight size={16} className="ml-2" />
                </Button>
              </Link>
              <Link to="/create-event">
                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                  Create Event
                </Button>
              </Link>
            </div>
          </motion.div>
          
          {/* Search Bar */}
          <motion.div 
            className="max-w-2xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 relative z-10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="flex flex-col sm:flex-row gap-3">
              <Input
                leftIcon={<Search size={18} />}
                placeholder="Search events..."
                className="flex-grow"
              />
              <Button className="whitespace-nowrap">
                Find Events
              </Button>
            </div>
          </motion.div>
        </div>
      </motion.section>
      
      {/* Categories Section */}
      <motion.section
        className="py-16 bg-gray-50 dark:bg-gray-900"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="container mx-auto px-4">
          <motion.div variants={itemVariants} className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Explore Event Categories
            </h2>
            <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Discover events across a variety of interests and themes
            </p>
          </motion.div>
          
          <motion.div 
            className="grid grid-cols-2 sm:grid-cols-4 gap-4"
            variants={containerVariants}
          >
            {allCategories.map((category, index) => (
              <motion.div
                key={`category-${index}`}
                variants={itemVariants}
                className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow"
              >
                <Link to={`/browse?category=${category}`} className="block p-6 text-center hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <div className="flex justify-center mb-4">
                    <CategoryBadge category={category} size="md" />
                  </div>
                  <h3 className="font-medium text-gray-900 dark:text-white">{category}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {Math.floor(Math.random() * 50) + 5} Events
                  </p>
                </Link>
              </motion.div>
            ))}
          </motion.div>
          
          <motion.div variants={itemVariants} className="text-center mt-10">
            <Link to="/browse">
              <Button variant="outline">
                View All Categories
              </Button>
            </Link>
          </motion.div>
        </div>
      </motion.section>
      
      {/* Featured Event Section */}
      {featuredEvent && (
        <motion.section 
          className="py-16"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <div className="container mx-auto px-4">
            <motion.div variants={itemVariants} className="flex items-center mb-12">
              <Sparkles size={24} className="text-primary-500 mr-3" />
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                Featured Event
              </h2>
            </motion.div>
            
            <motion.div variants={itemVariants}>
              <EventCard event={featuredEvent} featured />
            </motion.div>
          </div>
        </motion.section>
      )}
      
      {/* Upcoming Events Section */}
      <motion.section 
        className="py-16 bg-gray-50 dark:bg-gray-900"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="container mx-auto px-4">
          <motion.div variants={itemVariants} className="flex items-center mb-12">
            <CalendarClock size={24} className="text-primary-500 mr-3" />
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
              Upcoming Events
            </h2>
          </motion.div>
          
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={`loading-skeleton-${i}`} className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow animate-pulse">
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
              className="grid grid-cols-1 md:grid-cols-2 gap-8"
              variants={containerVariants}
            >
              {upcomingEvents.map(event => (
                <motion.div key={event.id} variants={itemVariants}>
                  <EventCard event={event} />
                </motion.div>
              ))}
            </motion.div>
          )}
          
          <motion.div variants={itemVariants} className="text-center mt-12">
            <Link to="/browse">
              <Button variant="outline" icon={<ArrowRight size={16} />} iconPosition="right">
                View All Events
              </Button>
            </Link>
          </motion.div>
        </div>
      </motion.section>
      
      {/* CTA Section */}
      <motion.section 
        className="py-24 bg-gradient-to-r from-primary-600 to-secondary-600 text-white"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.3 }}
      >
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Create Your Own Event?
          </h2>
          <p className="text-lg text-white/90 max-w-2xl mx-auto mb-8">
            Start planning your event today and connect with people who share your interests.
          </p>
          <Link to="/create-event">
            <Button 
              size="lg" 
              className="bg-white text-primary-600 hover:bg-gray-100"
            >
              Get Started
            </Button>
          </Link>
        </div>
      </motion.section>
    </div>
  );
};

export default Home;