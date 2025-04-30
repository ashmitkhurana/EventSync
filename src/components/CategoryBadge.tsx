import React from 'react';

interface CategoryBadgeProps {
  category: string;
  size?: 'sm' | 'md';
}

// Map of categories to colors
const categoryColors: Record<string, string> = {
  Technology: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  Business: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300',
  Design: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
  Marketing: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300',
  Music: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  Food: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  Arts: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
  Health: 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-300',
  Sports: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
  Education: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-300',
  Lifestyle: 'bg-lime-100 text-lime-800 dark:bg-lime-900 dark:text-lime-300',
  Networking: 'bg-sky-100 text-sky-800 dark:bg-sky-900 dark:text-sky-300',
  Conference: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300',
  Workshop: 'bg-violet-100 text-violet-800 dark:bg-violet-900 dark:text-violet-300',
  Festival: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300',
  Startup: 'bg-fuchsia-100 text-fuchsia-800 dark:bg-fuchsia-900 dark:text-fuchsia-300',
  Wellness: 'bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-300',
  Cooking: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300',
  Entertainment: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
  Creative: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300',
};

// Default color for categories not in the map
const defaultColor = 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';

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