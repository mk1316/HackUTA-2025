'use client';

import { useTheme } from '../contexts/ThemeContext';
import { Palette, Zap } from 'lucide-react';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="fixed bottom-6 right-6 z-50 group"
      title={`Switch to ${theme === 'default' ? 'Spiderverse' : 'Default'} theme`}
    >
      <div className="relative p-4 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-110 hover:rotate-12 shadow-lg hover:shadow-2xl">
        <div className="relative">
          {theme === 'default' ? (
            <Zap className="h-6 w-6 text-white group-hover:animate-pulse" />
          ) : (
            <Palette className="h-6 w-6 text-white group-hover:animate-pulse" />
          )}
        </div>
        
        {/* Animated ring */}
        <div className="absolute inset-0 rounded-full border-2 border-white border-opacity-30 group-hover:border-opacity-60 group-hover:animate-spin" />
        
        {/* Theme indicator */}
        <div className={`absolute -top-1 -right-1 w-3 h-3 rounded-full ${
          theme === 'default' 
            ? 'bg-gradient-to-r from-red-500 to-blue-500' 
            : 'bg-gradient-to-r from-cyan-400 to-pink-500'
        } animate-pulse`} />
      </div>
    </button>
  );
}

