import React from 'react';

interface CategoryBadgeProps {
  category: string;
  size?: 'sm' | 'md';
}

// Map of categories to colors - Improved contrast for dark mode
const categoryColors: Record<string, string> = {
  Technology: 'bg-blue-100 text-blue-800 dark:bg-blue-900/70 dark:text-blue-100',
  Business: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/70 dark:text-indigo-100',
  Design: 'bg-purple-100 text-purple-800 dark:bg-purple-900/70 dark:text-purple-100',
  Marketing: 'bg-pink-100 text-pink-800 dark:bg-pink-900/70 dark:text-pink-100',
  Music: 'bg-green-100 text-green-800 dark:bg-green-900/70 dark:text-green-100',
  Food: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/70 dark:text-yellow-100',
  Arts: 'bg-red-100 text-red-800 dark:bg-red-900/70 dark:text-red-100',
  Health: 'bg-teal-100 text-teal-800 dark:bg-teal-900/70 dark:text-teal-100',
  Sports: 'bg-orange-100 text-orange-800 dark:bg-orange-900/70 dark:text-orange-100',
  Education: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/70 dark:text-cyan-100',
  Lifestyle: 'bg-lime-100 text-lime-800 dark:bg-lime-900/70 dark:text-lime-100',
  Networking: 'bg-sky-100 text-sky-800 dark:bg-sky-900/70 dark:text-sky-100',
  Conference: 'bg-amber-100 text-amber-800 dark:bg-amber-900/70 dark:text-amber-100',
  Workshop: 'bg-violet-100 text-violet-800 dark:bg-violet-900/70 dark:text-violet-100',
  Festival: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/70 dark:text-emerald-100',
  Startup: 'bg-fuchsia-100 text-fuchsia-800 dark:bg-fuchsia-900/70 dark:text-fuchsia-100',
  Wellness: 'bg-rose-100 text-rose-800 dark:bg-rose-900/70 dark:text-rose-100',
  Cooking: 'bg-amber-100 text-amber-800 dark:bg-amber-900/70 dark:text-amber-100',
  Entertainment: 'bg-purple-100 text-purple-800 dark:bg-purple-900/70 dark:text-purple-100',
  Creative: 'bg-pink-100 text-pink-800 dark:bg-pink-900/70 dark:text-pink-100',
};

// Default color for categories not in the map
const defaultColor = 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-100';

const CategoryBadge: React.FC<CategoryBadgeProps> = ({ category, size = 'md' }) => {
  const colorClass = categoryColors[category] || defaultColor;
  
  const sizeClass = size === 'sm' 
    ? 'text-xs px-2 py-0.5' 
    : 'text-sm px-2.5 py-0.5';
  
  return (
    <span 
      className={`inline-flex items-center rounded-full font-medium ${colorClass} ${sizeClass}`}
    >
      {category}
    </span>
  );
};

export default CategoryBadge;