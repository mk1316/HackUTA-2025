'use client';

import { useEffect, useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';

export default function AnimatedBackground() {
  const [mounted, setMounted] = useState(false);
  const { theme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  if (theme === 'spiderverse') {
    return (
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {/* Spiderverse GIF Background */}
        <div 
          className="absolute inset-0"
          style={{
            backgroundImage: 'url(/200.webp)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
          }}
        />
        
        {/* Overlay for better text readability - reduced opacity */}
        <div className="absolute inset-0 bg-black bg-opacity-20" />
        
        {/* Spiderverse particles */}
        <div className="absolute inset-0">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-cyan-400 rounded-full animate-pulse"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${2 + Math.random() * 2}s`
              }}
            />
          ))}
        </div>
        
        {/* Spiderverse energy orbs */}
        <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full opacity-20 animate-float spiderverse-glow" />
        <div className="absolute top-40 right-20 w-24 h-24 bg-gradient-to-r from-red-500 to-pink-500 rounded-full opacity-20 animate-float spiderverse-glow-red" style={{ animationDelay: '1s' }} />
        <div className="absolute bottom-32 left-1/4 w-20 h-20 bg-gradient-to-r from-green-400 to-cyan-400 rounded-full opacity-20 animate-float spiderverse-glow-green" style={{ animationDelay: '2s' }} />
        <div className="absolute bottom-20 right-1/3 w-28 h-28 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full opacity-20 animate-float" style={{ animationDelay: '3s' }} />
        
        {/* Spiderverse grid lines */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-cyan-400 to-transparent" />
          <div className="absolute top-1/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-blue-400 to-transparent" />
          <div className="absolute top-1/2 left-0 w-full h-px bg-gradient-to-r from-transparent via-cyan-400 to-transparent" />
          <div className="absolute top-3/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-blue-400 to-transparent" />
          <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-cyan-400 to-transparent" />
        </div>
      </div>
    );
  }

  // Default theme (existing code)
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      {/* Gradient Background */}
      <div className="absolute inset-0 gradient-bg opacity-90" />
      
      {/* Animated Particles */}
      <div className="absolute inset-0">
        <div className="particle" />
        <div className="particle" />
        <div className="particle" />
        <div className="particle" />
        <div className="particle" />
      </div>
      
      
      {/* Geometric Shapes */}
      <div className="absolute top-1/3 right-10 w-0 h-0 border-l-[15px] border-r-[15px] border-b-[25px] border-l-transparent border-r-transparent border-b-white border-b-opacity-10 animate-float" style={{ animationDelay: '1.5s' }} />
      <div className="absolute bottom-1/3 left-20 w-0 h-0 border-l-[20px] border-r-[20px] border-b-[35px] border-l-transparent border-r-transparent border-b-white border-b-opacity-10 animate-float" style={{ animationDelay: '2.5s' }} />
      
      {/* Gradient Orbs */}
      <div className="absolute top-1/4 left-1/3 w-32 h-32 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full opacity-20 animate-float" style={{ animationDelay: '0.5s' }} />
      <div className="absolute bottom-1/4 right-1/4 w-24 h-24 bg-gradient-to-r from-pink-400 to-red-400 rounded-full opacity-20 animate-float" style={{ animationDelay: '1.8s' }} />
    </div>
  );
}
