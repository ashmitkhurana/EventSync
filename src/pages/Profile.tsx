import React, { useState, useEffect, useRef, ChangeEvent } from 'react';
import { motion } from 'framer-motion';
import { User, Calendar, Settings, LogOut, Edit, MailIcon, AtSign, Camera, CheckCircle, PhoneIcon, BookOpenIcon, FileTextIcon } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useEvents } from '../hooks/useEvents';
import { Event } from '../hooks/useEvents';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import EventCard from '../components/EventCard';
import { useNavigate } from 'react-router-dom';

// File upload constants (same as in SignUp.tsx)
const MAX_AVATAR_SIZE = 2 * 1024 * 1024; // 2MB
const MAX_RESUME_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_AVATAR_TYPES = ['image/jpeg', 'image/png', 'image/gif'];
const ALLOWED_RESUME_TYPES = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];

const Profile: React.FC = () => {
  const { user, logout } = useAuth();
  const { events, fetchUserRsvpedEvents } = useEvents();
  const [activeTab, setActiveTab] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [rsvpedEvents, setRsvpedEvents] = useState<Event[]>([]);
  const [isLoadingRsvps, setIsLoadingRsvps] = useState(false);
  
  // Profile edit state
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [resumeFileName, setResumeFileName] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: '',
    education: '',
    bio: '',
  });
  const avatarFileInputRef = useRef<HTMLInputElement>(null);
  const resumeFileInputRef = useRef<HTMLInputElement>(null);
  
  const navigate = useNavigate();
  
  // Mock user events (in a real app, would be filtered from the API)
  const userEvents = events.slice(0, 3); // First 3 events for demo purposes
  
  // Load RSVPed events when tab is activated
  useEffect(() => {
    if (activeTab === 'rsvps' && user) {
      loadRsvpedEvents();
    }
  }, [activeTab, user]);
  
  // Reset form data when user changes
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        phone: '',
        education: '',
        bio: '',
      });
    }
  }, [user]);
  
  const loadRsvpedEvents = async () => {
    if (!user) return;
    
    setIsLoadingRsvps(true);
    try {
      const events = await fetchUserRsvpedEvents(user.id);
      setRsvpedEvents(events);
    } catch (error) {
      console.error('Failed to load RSVPed events:', error);
    } finally {
      setIsLoadingRsvps(false);
    }
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleAvatarChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      
      // Validate file type
      if (!ALLOWED_AVATAR_TYPES.includes(file.type)) {
        alert('Please upload a valid image file (JPEG, PNG, or GIF)');
        return;
      }
      
      // Validate file size
      if (file.size > MAX_AVATAR_SIZE) {
        alert('Avatar image must be less than 2MB');
        return;
      }
      
      // Create a preview
      const reader = new FileReader();
      reader.onload = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleResumeChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      
      // Validate file type
      if (!ALLOWED_RESUME_TYPES.includes(file.type)) {
        alert('Please upload a valid document (PDF, DOC, or DOCX)');
        return;
      }
      
      // Validate file size
      if (file.size > MAX_RESUME_SIZE) {
        alert('Resume must be less than 5MB');
        return;
      }
      
      setResumeFileName(file.name);
    }
  };
  
  const handleSaveProfile = () => {
    // In a real app, you would submit the form data to your backend here
    console.log('Saving profile:', formData);
    console.log('Avatar changed:', avatarPreview !== null);
    console.log('Resume changed:', resumeFileName !== null);
    
    // For now, we'll just exit edit mode
    setIsEditing(false);
  };
  
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
    { id: 'rsvps', label: 'My RSVPs', icon: <CheckCircle size={20} /> },
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
            src={avatarPreview || user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || '')}&background=random`}
            alt={user?.name}
            className="w-32 h-32 rounded-full object-cover"
          />
          {isEditing && (
            <button 
              onClick={() => avatarFileInputRef.current?.click()}
              className="absolute bottom-0 right-0 bg-primary-600 text-white p-2 rounded-full shadow-lg hover:bg-primary-700 transition-colors"
              aria-label="Change profile picture"
            >
              <Camera size={16} />
              <input
                ref={avatarFileInputRef}
                type="file"
                id="avatar"
                className="sr-only"
                accept={ALLOWED_AVATAR_TYPES.join(',')}
                onChange={handleAvatarChange}
              />
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
          className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 space-y-6"
          onSubmit={(e) => { e.preventDefault(); handleSaveProfile(); }}
        >
          {/* Required Fields */}
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Basic Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Full Name"
                name="name"
                leftIcon={<User size={18} />}
                value={formData.name}
                onChange={handleInputChange}
                required
              />
              
              <Input
                label="Email"
                type="email"
                leftIcon={<MailIcon size={18} />}
                value={user?.email || ''}
                readOnly
                disabled
                className="bg-gray-100 dark:bg-gray-700 cursor-not-allowed"
              />
              
              <Input
                label="Phone Number"
                name="phone"
                type="tel"
                leftIcon={<PhoneIcon size={18} />}
                placeholder="e.g. (555) 123-4567"
                value={formData.phone}
                onChange={handleInputChange}
                required
              />
              
              <Input
                label="Education"
                name="education"
                leftIcon={<BookOpenIcon size={18} />}
                placeholder="e.g. Bachelor's in Computer Science"
                value={formData.education}
                onChange={handleInputChange}
              />
            </div>
          </div>
          
          {/* Optional Fields */}
          <div className="space-y-6 pt-4 border-t border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white pt-2">Additional Information</h3>
            
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Bio
              </label>
              <div className="mt-1">
                <textarea
                  name="bio"
                  rows={4}
                  placeholder="Tell others about yourself..."
                  className="block w-full rounded-md border border-gray-300 dark:border-gray-600 py-2 px-3 placeholder-gray-400 dark:placeholder-gray-500 shadow-sm text-gray-900 dark:text-white bg-white dark:bg-gray-800 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  value={formData.bio}
                  onChange={handleInputChange}
                ></textarea>
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Resume
              </label>
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <input
                    ref={resumeFileInputRef}
                    type="file"
                    id="resume"
                    className="sr-only"
                    accept={ALLOWED_RESUME_TYPES.join(',')}
                    onChange={handleResumeChange}
                  />
                  <label 
                    htmlFor="resume"
                    className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                    onClick={() => resumeFileInputRef.current?.click()}
                  >
                    <FileTextIcon size={18} className="mr-2" />
                    Upload Resume
                  </label>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Max: 5MB (PDF, DOC, DOCX)
                  </div>
                </div>
                
                {resumeFileName && (
                  <div className="flex items-center space-x-2">
                    <FileTextIcon size={16} className="text-primary-500" />
                    <span className="text-sm text-gray-600 dark:text-gray-300 truncate max-w-[200px]">
                      {resumeFileName}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="pt-4 flex justify-end gap-3">
            <Button 
              type="button"
              variant="outline" 
              onClick={() => {
                setIsEditing(false);
                setAvatarPreview(null);
                setResumeFileName(null);
              }}
            >
              Cancel
            </Button>
            <Button type="submit">
              Save Changes
            </Button>
          </div>
        </motion.form>
      ) : (
        <motion.div variants={itemVariants} className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              About
            </h2>
            {formData.bio ? (
              <p className="text-gray-600 dark:text-gray-300">{formData.bio}</p>
            ) : (
              <p className="text-gray-600 dark:text-gray-300">
                No bio yet. Click 'Edit Profile' to add information about yourself.
              </p>
            )}
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Contact & Personal Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Phone Number
                </h3>
                <p className="mt-1 text-gray-900 dark:text-white">
                  {formData.phone || "Not provided"}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Education
                </h3>
                <p className="mt-1 text-gray-900 dark:text-white">
                  {formData.education || "Not provided"}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Resume
                </h3>
                <p className="mt-1 text-gray-900 dark:text-white">
                  {resumeFileName ? (
                    <span className="flex items-center">
                      <FileTextIcon size={16} className="text-primary-500 mr-2" />
                      {resumeFileName}
                    </span>
                  ) : (
                    "Not uploaded"
                  )}
                </p>
              </div>
            </div>
          </div>
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
            <EventCard key={event.id} event={event} showAnalytics={true} />
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

  // RSVPs tab content
  const RsvpsTab = () => (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      <motion.div variants={itemVariants} className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Your RSVPs
        </h2>
      </motion.div>
      
      {isLoadingRsvps ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      ) : rsvpedEvents.length > 0 ? (
        <motion.div 
          variants={itemVariants}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {rsvpedEvents.map(event => (
            <EventCard key={event.id} event={event} />
          ))}
        </motion.div>
      ) : (
        <motion.div 
          variants={itemVariants}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-8 text-center"
        >
          <div className="mx-auto w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
            <CheckCircle size={24} className="text-gray-500 dark:text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No RSVPs yet
          </h3>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            You haven't RSVPed to any events yet.
          </p>
          <Button variant="outline" onClick={() => navigate('/browse')}>
            Browse events
          </Button>
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
      case 'rsvps':
        return <RsvpsTab />;
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
            </nav>
            
            <div className="p-6 border-t border-gray-200 dark:border-gray-700">
              <Button
                variant="outline"
                size="sm"
                fullWidth
                icon={<LogOut size={16} />}
                iconPosition="left"
                className="text-red-600 dark:text-red-400 border-red-200 dark:border-red-900 hover:bg-red-50 dark:hover:bg-red-900/20"
                onClick={logout}
              >
                Log out
              </Button>
            </div>
          </div>
        </motion.div>
        
        {/* Main Content */}
        <div className="flex-1 min-w-0">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
};

export default Profile;