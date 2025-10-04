'use client';

import { useEffect, useState } from 'react';

export default function AnimatedBackground() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

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
      
      {/* Floating Shapes */}
      <div className="absolute top-20 left-10 w-20 h-20 bg-white bg-opacity-10 rounded-full animate-float" />
      <div className="absolute top-40 right-20 w-16 h-16 bg-white bg-opacity-10 rounded-full animate-float" style={{ animationDelay: '1s' }} />
      <div className="absolute bottom-32 left-1/4 w-12 h-12 bg-white bg-opacity-10 rounded-full animate-float" style={{ animationDelay: '2s' }} />
      <div className="absolute bottom-20 right-1/3 w-24 h-24 bg-white bg-opacity-10 rounded-full animate-float" style={{ animationDelay: '3s' }} />
      
      {/* Geometric Shapes */}
      <div className="absolute top-1/3 right-10 w-0 h-0 border-l-[15px] border-r-[15px] border-b-[25px] border-l-transparent border-r-transparent border-b-white border-b-opacity-10 animate-float" style={{ animationDelay: '1.5s' }} />
      <div className="absolute bottom-1/3 left-20 w-0 h-0 border-l-[20px] border-r-[20px] border-b-[35px] border-l-transparent border-r-transparent border-b-white border-b-opacity-10 animate-float" style={{ animationDelay: '2.5s' }} />
      
      {/* Gradient Orbs */}
      <div className="absolute top-1/4 left-1/3 w-32 h-32 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full opacity-20 animate-float" style={{ animationDelay: '0.5s' }} />
      <div className="absolute bottom-1/4 right-1/4 w-24 h-24 bg-gradient-to-r from-pink-400 to-red-400 rounded-full opacity-20 animate-float" style={{ animationDelay: '1.8s' }} />
    </div>
  );
}
