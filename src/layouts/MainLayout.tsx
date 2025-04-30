import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useAuth } from '../hooks/useAuth';
import { useEvents } from '../hooks/useEvents';

const MainLayout: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const { fetchEvents } = useEvents();
  const [pageLoaded, setPageLoaded] = useState(false);

  useEffect(() => {
    // Fetch events data when layout mounts
    fetchEvents();
    
    // Set page as loaded after short delay to allow for animation
    const timer = setTimeout(() => {
      setPageLoaded(true);
    }, 100);
    
    return () => clearTimeout(timer);
  }, [fetchEvents]);

  // If not authenticated, we should redirect to login
  // This is handled by the Router component

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        when: "beforeChildren",
        staggerChildren: 0.1,
        duration: 0.3 
      }
    },
    exit: { 
      opacity: 0,
      transition: { duration: 0.2 } 
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      
      <AnimatePresence>
        {pageLoaded && (
          <motion.main 
            className="flex-grow container mx-auto px-4 py-6 sm:px-6 lg:px-8"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <Outlet />
          </motion.main>
        )}
      </AnimatePresence>
      
      <Footer />
    </div>
  );
};

export default MainLayout;