import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark';

interface RipplePosition {
  x: number;
  y: number;
}

interface ThemeContextType {
  theme: Theme;
  toggleTheme: (position?: RipplePosition) => void;
  ripplePosition: RipplePosition | null;
  isAnimating: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Animation duration in milliseconds
const ANIMATION_DURATION = 900;
const THEME_CHANGE_DELAY = 100; // Slightly increased for smoother transition

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    // Check for saved theme preference
    const savedTheme = localStorage.getItem('theme') as Theme | null;
    // Check for system preference
    const systemPreference = window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light';
    
    return savedTheme || systemPreference;
  });
  
  // Add state for ripple position
  const [ripplePosition, setRipplePosition] = useState<RipplePosition | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [pendingTheme, setPendingTheme] = useState<Theme | null>(null);

  useEffect(() => {
    // Add optimization styles for smoother transitions
    const styleId = 'theme-transition-styles';
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style');
      style.id = styleId;
      style.innerHTML = `
        * {
          transition: background-color 0.5s ease, 
                      border-color 0.5s ease, 
                      color 0.15s ease,
                      fill 0.5s ease, 
                      box-shadow 0.5s ease !important;
        }
      `;
      document.head.appendChild(style);
    }

    // Update the HTML class when theme changes
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    // Save to localStorage
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Effect to handle animation completion
  useEffect(() => {
    if (isAnimating && pendingTheme) {
      // Set a timer to allow the ripple to expand a bit before changing the theme
      const themeChangeTimer = setTimeout(() => {
        setTheme(pendingTheme);
      }, THEME_CHANGE_DELAY);
      
      // Clear animation state after animation completes
      const animationTimer = setTimeout(() => {
        setIsAnimating(false);
        setPendingTheme(null);
      }, ANIMATION_DURATION);
      
      return () => {
        clearTimeout(themeChangeTimer);
        clearTimeout(animationTimer);
      };
    }
  }, [isAnimating, pendingTheme]);

  const toggleTheme = (position?: RipplePosition) => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    
    // If position is provided, start ripple animation
    if (position) {
      setRipplePosition(position);
      setIsAnimating(true);
      setPendingTheme(newTheme);
    } else {
      // If no position provided, change theme immediately (fallback)
      setTheme(newTheme);
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, ripplePosition, isAnimating }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}