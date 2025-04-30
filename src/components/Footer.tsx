import React from 'react';
import { Link } from 'react-router-dom';
import { CalendarDays, Heart, Instagram, Twitter, Facebook, Github } from 'lucide-react';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 py-12">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center mb-4">
              <CalendarDays size={28} className="text-primary-600 dark:text-primary-400 mr-2" />
              <span className="text-xl font-bold text-gray-900 dark:text-white">EventSync</span>
            </div>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Discover, create, and manage events that matter to you.
            </p>
            <div className="flex space-x-4">
              <Link to="#" aria-label="Twitter" className="text-gray-500 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400">
                <Twitter size={20} />
              </Link>
              <Link to="#" aria-label="Facebook" className="text-gray-500 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400">
                <Facebook size={20} />
              </Link>
              <Link to="#" aria-label="Instagram" className="text-gray-500 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400">
                <Instagram size={20} />
              </Link>
              <Link to="#" aria-label="GitHub" className="text-gray-500 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400">
                <Github size={20} />
              </Link>
            </div>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-4">
              Explore
            </h3>
            <ul className="space-y-3">
              <li>
                <Link to="/browse" className="text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400">
                  Browse Events
                </Link>
              </li>
              <li>
                <Link to="/create-event" className="text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400">
                  Create Event
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400">
                  About Us
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-4">
              Help
            </h3>
            <ul className="space-y-3">
              <li>
                <Link to="/faq" className="text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400">
                  FAQ
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-4">
              Newsletter
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Stay updated with the latest events and news.
            </p>
            <form className="flex flex-col sm:flex-row gap-2">
              <input
                type="email"
                placeholder="Enter your email"
                className="px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-md transition-colors"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>
        
        <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            © {currentYear} EventSync. All rights reserved.
          </p>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-2 md:mt-0 flex items-center">
            Made with <Heart size={14} className="text-accent-500 mx-1" /> by EventSync Team
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;