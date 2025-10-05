'use client';

import { useAuth0 } from '@auth0/auth0-react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Auth0LoginCard from '@/components/Auth0LoginCard';

export default function LoginPage() {
  const { user, error, isLoading } = useAuth0();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && user) {
      // User is already authenticated, redirect to dashboard
      router.push('/dashboard');
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen relative overflow-hidden neon-bg">
        <div className="relative z-10 min-h-screen flex items-center justify-center px-4 py-12">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-neon-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-white/70">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen relative overflow-hidden neon-bg">
        <div className="relative z-10 min-h-screen flex items-center justify-center px-4 py-12">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-400 mb-4">Authentication Error</h1>
            <p className="text-white/70 mb-6">{error.message}</p>
            <button 
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (user) {
    return null; // Will redirect to dashboard
  }

  return (
    <div className="min-h-screen relative overflow-hidden neon-bg">
      {/* Animated background elements */}
      <div className="absolute inset-0">
        <div className="neon-shimmer"></div>
        <div className="particle"></div>
        <div className="particle"></div>
        <div className="particle"></div>
        <div className="particle"></div>
        <div className="particle"></div>
      </div>

      {/* Main content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <Auth0LoginCard />
        </div>
      </div>
    </div>
  );
}
