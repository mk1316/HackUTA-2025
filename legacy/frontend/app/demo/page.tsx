'use client';

import AnimatedBackground from '../components/AnimatedBackground';
import ThemeToggle from '../components/ThemeToggle';

export default function Demo() {
    return (
      <div className="min-h-screen relative overflow-hidden">
        {/* Animated Background */}
        <AnimatedBackground />
        
        {/* Theme Toggle Button */}
        <ThemeToggle />
        
        <main className="relative z-10 min-h-screen p-6">
          <h1 className="text-2xl font-semibold text-white">HackUTA Demo</h1>
          <p className="text-sm text-white text-opacity-80 mt-1">Syllabus → Plan (frontend scaffold)</p>
        </main>
      </div>
    );
  }
  