import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';

const ThemeRipple: React.FC = () => {
  const { theme, ripplePosition, isAnimating } = useTheme();
  
  // Maximum dimension to ensure the circle covers the entire screen
  const maxDimension = Math.max(
    window.innerWidth * 3,
    window.innerHeight * 3
  );
  
  if (!ripplePosition) return null;
  
  // Determine the opposite color of the current theme for the ripple
  // This will give the appearance that the ripple is revealing the new theme
  const rippleColor = theme === 'light' ? 'rgb(15, 23, 42)' : 'rgb(249, 250, 251)';
  
  return (
    <AnimatePresence>
      {isAnimating && (
        <motion.div
          initial={{ 
            position: 'fixed',
            zIndex: 9999,
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            pointerEvents: 'none'
          }}
          className="fixed inset-0 overflow-hidden pointer-events-none will-change-transform"
        >
          <motion.div
            initial={{ 
              width: 0, 
              height: 0,
              x: ripplePosition.x,
              y: ripplePosition.y,
              borderRadius: '100%',
              backgroundColor: rippleColor
            }}
            animate={{ 
              width: maxDimension,
              height: maxDimension,
              x: ripplePosition.x - maxDimension / 2,
              y: ripplePosition.y - maxDimension / 2,
            }}
            exit={{ 
              opacity: 0,
              transition: { duration: 0.3, ease: 'easeOut' }  
            }}
            transition={{ 
              duration: 0.9, 
              ease: [0.2, 0.85, 0.45, 1.0], // Custom cubic bezier for smoother motion
              opacity: { duration: 0.9 }
            }}
            className="origin-center will-change-transform"
            style={{
              backfaceVisibility: 'hidden', // Optimize rendering
              WebkitBackfaceVisibility: 'hidden',
              WebkitPerspective: 1000,
              perspective: 1000,
              transformStyle: 'preserve-3d'
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ThemeRipple; 