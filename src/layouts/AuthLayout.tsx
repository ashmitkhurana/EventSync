import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import ThemeToggle from '../components/ThemeToggle';
import { CalendarDays } from 'lucide-react';

const AuthLayout: React.FC = () => {
  const { isAuthenticated } = useAuth();

  // Redirect to home if already authenticated
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
      {/* Left panel - Form */}
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full lg:w-1/2 flex items-center justify-center p-8"
      >
        <div className="w-full max-w-md">
          <div className="flex justify-between mb-8">
            <div className="flex items-center">
              <CalendarDays size={32} className="text-primary-600 dark:text-primary-400 mr-2" />
              <span className="text-2xl font-bold text-gray-900 dark:text-white">EventSync</span>
            </div>
            <ThemeToggle />
          </div>
          
          <Outlet />
        </div>
      </motion.div>
      
      {/* Right panel - Image/Illustration (hidden on mobile) */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.3 }}
        className="hidden lg:block lg:w-1/2 bg-gradient-to-br from-primary-500 to-secondary-500 relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-cover bg-center opacity-30" 
          style={{ 
            backgroundImage: `url('https://images.pexels.com/photos/2774556/pexels-photo-2774556.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1')`,
            backgroundSize: 'cover'
          }}>
        </div>
        
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-12">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="max-w-md text-center"
          >
            <h2 className="text-3xl font-bold mb-4">Welcome to EventSync</h2>
            <p className="text-lg text-white/90 mb-8">
              Your all-in-one platform to discover, create, and manage events that matter to you.
            </p>
            <div className="flex space-x-4 justify-center">
              <div className="bg-white/20 backdrop-blur-sm p-4 rounded-lg">
                <p className="font-bold text-2xl">100+</p>
                <p className="text-sm">Events</p>
              </div>
              <div className="bg-white/20 backdrop-blur-sm p-4 rounded-lg">
                <p className="font-bold text-2xl">5k+</p>
                <p className="text-sm">Users</p>
              </div>
              <div className="bg-white/20 backdrop-blur-sm p-4 rounded-lg">
                <p className="font-bold text-2xl">20+</p>
                <p className="text-sm">Categories</p>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default AuthLayout;