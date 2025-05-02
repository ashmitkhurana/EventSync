import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { motion } from 'framer-motion';

const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  
  const handleToggle = (e: React.MouseEvent) => {
    // Capture click position
    const position = {
      x: e.clientX,
      y: e.clientY
    };
    
    // Pass position to toggleTheme
    toggleTheme(position);
  };
  
  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      onClick={handleToggle}
      className="rounded-full p-2 bg-gray-100 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      {theme === 'light' ? (
        <Moon size={18} className="text-gray-700" />
      ) : (
        <Sun size={18} className="text-yellow-300" />
      )}
    </motion.button>
  );
};

export default ThemeToggle;