'use client';

import { useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import Link from 'next/link';

export default function Auth0LoginCard() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { loginWithRedirect } = useAuth0();

  const handleAuth0Login = async () => {
    setIsLoading(true);
    setError('');

    try {
      await loginWithRedirect({
        authorizationParams: {
          redirect_uri: window.location.origin
        },
        appState: {
          returnTo: '/dashboard'
        }
      });
    } catch (err) {
      setError('Failed to initiate login. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="neon-card">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">
          Welcome Back
        </h1>
        <p className="text-white/70">
          Sign in with Auth0 to continue
        </p>
      </div>

      {/* Error message */}
      {error && (
        <div 
          className="mb-6 p-4 rounded-lg bg-red-500/20 border border-red-500/30 text-red-200 text-sm"
          role="alert"
          aria-live="polite"
        >
          {error}
        </div>
      )}

      {/* Auth0 Login Button */}
      <div className="space-y-6">
        <button
          onClick={handleAuth0Login}
          disabled={isLoading}
          className="w-full py-4 px-6 auth0-button neon-button-glow text-white font-semibold rounded-lg focus:outline-none focus:ring-2 focus:ring-neon-500 focus:ring-offset-2 focus:ring-offset-transparent disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group"
        >
          {isLoading ? (
            <div className="flex items-center justify-center">
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
              Connecting to Auth0...
            </div>
          ) : (
            <div className="flex items-center justify-center">
              <svg 
                className="w-5 h-5 mr-2" 
                viewBox="0 0 24 24" 
                fill="currentColor"
              >
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
              Login with Auth0
            </div>
          )}
          
          {/* Animated glow effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-neon-400/20 to-neon-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-pulse"></div>
        </button>

        {/* Features list */}
        <div className="space-y-3 text-sm text-white/60">
          <div className="flex items-center">
            <svg className="w-4 h-4 mr-2 text-neon-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            Secure authentication
          </div>
          <div className="flex items-center">
            <svg className="w-4 h-4 mr-2 text-neon-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            Single sign-on
          </div>
          <div className="flex items-center">
            <svg className="w-4 h-4 mr-2 text-neon-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            Protected dashboard access
          </div>
        </div>

        {/* Back to home link */}
        <div className="text-center pt-4">
          <Link 
            href="/" 
            className="text-neon-400 hover:text-neon-300 text-sm transition-colors"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
