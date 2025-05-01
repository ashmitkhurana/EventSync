import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { CalendarDays, Menu, X, Bell, User, LogOut } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import ThemeToggle from './ThemeToggle';
import Button from './ui/Button';

const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const location = useLocation();
  
  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);
  
  // Close mobile menu when route changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);
  
  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileDropdownOpen) {
        const target = event.target as HTMLElement;
        if (!target.closest('.profile-dropdown')) {
          setProfileDropdownOpen(false);
        }
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [profileDropdownOpen]);
  
  const navLinks = [
    { title: 'Home', path: '/' },
    { title: 'Browse Events', path: '/browse' },
    { title: 'Create Event', path: '/create-event' },
  ];
  
  const mobileMenuVariants = {
    closed: { opacity: 0, x: '100%' },
    open: { opacity: 1, x: 0 },
  };
  
  const profileDropdownVariants = {
    hidden: { opacity: 0, y: -5, scale: 0.95 },
    visible: { opacity: 1, y: 0, scale: 1 },
  };
  
  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-white shadow-md dark:bg-gray-800' : 'bg-transparent dark:bg-transparent'
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <CalendarDays size={28} className="text-primary-600 dark:text-primary-400 mr-2" />
            <span className="text-xl font-bold text-gray-900 dark:text-white">EventSync</span>
          </Link>
          
          {/* Desktop Menu */}
          <nav className="hidden md:flex items-center space-x-8">
            {navLinks.map(link => (
              <Link
                key={link.path}
                to={link.path}
                className={`text-base font-medium transition-colors hover:text-primary-600 dark:hover:text-primary-400 ${
                  location.pathname === link.path
                    ? 'text-primary-600 dark:text-primary-400'
                    : 'text-gray-700 dark:text-gray-200'
                } ${
                  link.path === '/' ? 'text-primary-600 dark:text-primary-400' : ''
                }`}
              >
                {link.title}
              </Link>
            ))}
          </nav>
          
          {/* Right Section */}
          <div className="flex items-center space-x-4">
            <ThemeToggle />
            
            {isAuthenticated ? (
              <>
                {/* Notification Icon */}
                <button 
                  aria-label="Notifications" 
                  className="p-2 text-gray-700 dark:text-gray-200 hover:text-primary-600 dark:hover:text-primary-400 rounded-full focus:outline-none"
                >
                  <Bell size={20} />
                </button>
                
                {/* User Profile */}
                <div className="relative profile-dropdown">
                  <button
                    className="flex items-center space-x-1 focus:outline-none"
                    onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                    aria-expanded={profileDropdownOpen}
                  >
                    <img 
                      src={user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || '')}&background=random`}
                      alt={user?.name || 'User profile'}
                      className="w-8 h-8 rounded-full border-2 border-white dark:border-gray-700"
                    />
                  </button>
                  
                  <AnimatePresence>
                    {profileDropdownOpen && (
                      <motion.div
                        initial="hidden"
                        animate="visible"
                        exit="hidden"
                        variants={profileDropdownVariants}
                        transition={{ duration: 0.2 }}
                        className="absolute right-0 mt-2 w-48 py-2 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700"
                      >
                        <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{user?.name}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user?.email}</p>
                        </div>
                        
                        <Link 
                          to="/profile" 
                          className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                          onClick={() => setProfileDropdownOpen(false)}
                        >
                          <User size={16} className="mr-2" />
                          Profile
                        </Link>
                        
                        <button 
                          className="flex w-full items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                          onClick={() => {
                            logout();
                            setProfileDropdownOpen(false);
                          }}
                        >
                          <LogOut size={16} className="mr-2" />
                          Sign out
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </>
            ) : (
              <div className="hidden md:flex items-center space-x-3">
                <Link to="/login">
                  <Button variant="ghost" size="sm">
                    Log in
                  </Button>
                </Link>
                <Link to="/signup">
                  <Button size="sm">
                    Sign up
                  </Button>
                </Link>
              </div>
            )}
            
            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 rounded-md text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-expanded={mobileMenuOpen}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial="closed"
            animate="open"
            exit="closed"
            variants={mobileMenuVariants}
            className="fixed inset-y-0 right-0 w-full sm:w-80 bg-white dark:bg-gray-800 shadow-xl z-50 overflow-y-auto"
            transition={{ type: 'tween', duration: 0.3 }}
          >
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <Link to="/" className="flex items-center" onClick={() => setMobileMenuOpen(false)}>
                <CalendarDays size={24} className="text-primary-600 dark:text-primary-400 mr-2" />
                <span className="text-lg font-bold text-gray-900 dark:text-white">EventSync</span>
              </Link>
              <button
                className="p-2 rounded-md text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none"
                onClick={() => setMobileMenuOpen(false)}
                aria-label="Close menu"
              >
                <X size={24} />
              </button>
            </div>
            
            <nav className="p-4">
              <ul className="space-y-3">
                {navLinks.map(link => (
                  <li key={link.path}>
                    <Link
                      to={link.path}
                      className={`block px-3 py-2 rounded-md text-base font-medium ${
                        location.pathname === link.path
                          ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400'
                          : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {link.title}
                    </Link>
                  </li>
                ))}
              </ul>
              
              {!isAuthenticated && (
                <div className="mt-6 grid grid-cols-2 gap-3 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="outline" fullWidth>
                      Log in
                    </Button>
                  </Link>
                  <Link to="/signup" onClick={() => setMobileMenuOpen(false)}>
                    <Button fullWidth>
                      Sign up
                    </Button>
                  </Link>
                </div>
              )}
              
              {isAuthenticated && (
                <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center px-3 py-2">
                    <img 
                      src={user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || '')}&background=random`}
                      alt={user?.name || 'User profile'}
                      className="w-10 h-10 rounded-full mr-3"
                    />
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{user?.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{user?.email}</p>
                    </div>
                  </div>
                  
                  <ul className="mt-3 space-y-1">
                    <li>
                      <Link
                        to="/profile"
                        className="flex items-center px-3 py-2 rounded-md text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <User size={16} className="mr-2" />
                        Profile
                      </Link>
                    </li>
                    <li>
                      <button
                        className="flex w-full items-center px-3 py-2 rounded-md text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                        onClick={() => {
                          logout();
                          setMobileMenuOpen(false);
                        }}
                      >
                        <LogOut size={16} className="mr-2" />
                        Sign out
                      </button>
                    </li>
                  </ul>
                </div>
              )}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Navbar;