import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Calendar, Settings, LogOut, Edit, MailIcon, AtSign, Camera } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useEvents } from '../hooks/useEvents';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import EventCard from '../components/EventCard';

const Profile: React.FC = () => {
  const { user, logout } = useAuth();
  const { events } = useEvents();
  const [activeTab, setActiveTab] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);
  
  // Mock user events (in a real app, would be filtered from the API)
  const userEvents = events.slice(0, 3); // First 3 events for demo purposes
  
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };
  
  const tabs = [
    { id: 'profile', label: 'Profile', icon: <User size={20} /> },
    { id: 'events', label: 'My Events', icon: <Calendar size={20} /> },
    { id: 'settings', label: 'Settings', icon: <Settings size={20} /> }
  ];
  
  // Profile information form
  const ProfileInfo = () => (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      <motion.div variants={itemVariants} className="flex flex-col md:flex-row items-center gap-8">
        <div className="relative">
          <img
            src={user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || '')}&background=random`}
            alt={user?.name}
            className="w-32 h-32 rounded-full object-cover"
          />
          {isEditing && (
            <button 
              className="absolute bottom-0 right-0 bg-primary-600 text-white p-2 rounded-full shadow-lg hover:bg-primary-700 transition-colors"
              aria-label="Change profile picture"
            >
              <Camera size={16} />
            </button>
          )}
        </div>
        
        <div className="flex-1 text-center md:text-left">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {user?.name}
          </h1>
          <div className="flex flex-col md:flex-row items-center gap-4 text-gray-600 dark:text-gray-300">
            <div className="flex items-center">
              <MailIcon size={16} className="mr-2" />
              <span>{user?.email}</span>
            </div>
            <div className="flex items-center">
              <AtSign size={16} className="mr-2" />
              <span>Joined Jan 2024</span>
            </div>
          </div>
          
          {!isEditing && (
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-4"
              icon={<Edit size={16} />}
              iconPosition="left"
              onClick={() => setIsEditing(true)}
            >
              Edit Profile
            </Button>
          )}
        </div>
      </motion.div>
      
      {isEditing ? (
        <motion.form 
          variants={itemVariants}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 space-y-4"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Full Name"
              defaultValue={user?.name}
            />
            <Input
              label="Email"
              type="email"
              defaultValue={user?.email}
            />
            <Input
              label="Location"
              placeholder="e.g., San Francisco, CA"
            />
            <Input
              label="Phone"
              type="tel"
              placeholder="e.g., (555) 123-4567"
            />
          </div>
          
          <div className="pt-4 flex justify-end gap-3">
            <Button 
              variant="outline" 
              onClick={() => setIsEditing(false)}
            >
              Cancel
            </Button>
            <Button 
              onClick={() => setIsEditing(false)}
            >
              Save Changes
            </Button>
          </div>
        </motion.form>
      ) : (
        <motion.div variants={itemVariants} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            About
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            No bio yet. Click 'Edit Profile' to add information about yourself.
          </p>
        </motion.div>
      )}
    </motion.div>
  );
  
  // Events tab content
  const EventsTab = () => (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      <motion.div variants={itemVariants} className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Your Events
        </h2>
        <Button size="sm">
          Create New Event
        </Button>
      </motion.div>
      
      {userEvents.length > 0 ? (
        <motion.div 
          variants={itemVariants}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {userEvents.map(event => (
            <EventCard key={event.id} event={event} />
          ))}
        </motion.div>
      ) : (
        <motion.div 
          variants={itemVariants}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-8 text-center"
        >
          <div className="mx-auto w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
            <Calendar size={24} className="text-gray-500 dark:text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No events yet
          </h3>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            You haven't created or RSVP'd to any events yet.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button>
              Create an event
            </Button>
            <Button variant="outline">
              Browse events
            </Button>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
  
  // Settings tab content
  const SettingsTab = () => (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8"
    >
      <motion.div 
        variants={itemVariants}
        className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden"
      >
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Account Settings
          </h3>
        </div>
        
        <div className="p-6 space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h4 className="text-base font-medium text-gray-900 dark:text-white">
                Email Notifications
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                Receive email updates about your account activity
              </p>
            </div>
            <div className="relative inline-block w-12 h-6 transition duration-200 ease-in-out rounded-full bg-gray-200 dark:bg-gray-700 cursor-pointer">
              <label htmlFor="toggle-email" className="absolute left-0 inline-block w-6 h-6 transition duration-200 ease-in-out transform bg-white rounded-full shadow-sm translate-x-0 cursor-pointer"></label>
              <input type="checkbox" id="toggle-email" name="toggle-email" className="hidden" defaultChecked />
            </div>
          </div>
          
          <div className="flex justify-between items-center">
            <div>
              <h4 className="text-base font-medium text-gray-900 dark:text-white">
                Event Reminders
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                Get notified before events you've RSVP'd to
              </p>
            </div>
            <div className="relative inline-block w-12 h-6 transition duration-200 ease-in-out rounded-full bg-primary-500 cursor-pointer">
              <label htmlFor="toggle-reminders" className="absolute left-0 inline-block w-6 h-6 transition duration-200 ease-in-out transform bg-white rounded-full shadow-sm translate-x-6 cursor-pointer"></label>
              <input type="checkbox" id="toggle-reminders" name="toggle-reminders" className="hidden" defaultChecked />
            </div>
          </div>
          
          <div className="flex justify-between items-center">
            <div>
              <h4 className="text-base font-medium text-gray-900 dark:text-white">
                Two-Factor Authentication
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                Additional security for your account
              </p>
            </div>
            <Button variant="outline" size="sm">
              Enable
            </Button>
          </div>
        </div>
      </motion.div>
      
      <motion.div 
        variants={itemVariants}
        className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6"
      >
        <h3 className="text-lg font-medium text-red-600 dark:text-red-400 mb-4">
          Danger Zone
        </h3>
        
        <div className="space-y-4">
          <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
            <h4 className="text-base font-medium text-red-800 dark:text-red-300">
              Delete Account
            </h4>
            <p className="text-sm text-red-600 dark:text-red-400 mt-1 mb-3">
              Permanently delete your account and all associated data. This action cannot be undone.
            </p>
            <Button variant="danger" size="sm">
              Delete Account
            </Button>
          </div>
          
          <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
            <h4 className="text-base font-medium text-yellow-800 dark:text-yellow-300">
              Export Your Data
            </h4>
            <p className="text-sm text-yellow-600 dark:text-yellow-400 mt-1 mb-3">
              Download all your personal data and event history.
            </p>
            <Button variant="outline" size="sm">
              Export Data
            </Button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
  
  // Render active tab content
  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return <ProfileInfo />;
      case 'events':
        return <EventsTab />;
      case 'settings':
        return <SettingsTab />;
      default:
        return <ProfileInfo />;
    }
  };
  
  return (
    <div className="container mx-auto px-4 pt-24 pb-16">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="md:w-64 flex-shrink-0"
        >
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
            <nav className="divide-y divide-gray-200 dark:divide-gray-700">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  className={`flex items-center w-full px-6 py-4 text-left transition-colors ${
                    activeTab === tab.id
                      ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400'
                      : 'hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200'
                  }`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  <span className="mr-3">{tab.icon}</span>
                  <span className="font-medium">{tab.label}</span>
                </button>
              ))}
              <button
                className="flex items-center w-full px-6 py-4 text-left text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
                onClick={logout}
              >
                <LogOut size={20} className="mr-3" />
                <span className="font-medium">Log out</span>
              </button>
            </nav>
          </div>
        </motion.div>
        
        {/* Main Content */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex-1"
        >
          {renderTabContent()}
        </motion.div>
      </div>
    </div>
  );
};

export default Profile;