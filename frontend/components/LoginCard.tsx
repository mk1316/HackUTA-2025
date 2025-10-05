'use client';

import { useState } from 'react';
import Link from 'next/link';

interface LoginCardProps {
  onSubmit: (credentials: { email: string; password: string; remember: boolean }) => void;
  isLoading: boolean;
  error: string;
}

export default function LoginCard({ onSubmit, isLoading, error }: LoginCardProps) {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    remember: false
  });
  const [validationErrors, setValidationErrors] = useState<{
    email?: string;
    password?: string;
  }>({});

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Clear validation errors when user starts typing
    if (validationErrors[name as keyof typeof validationErrors]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Client-side validation
    const errors: { email?: string; password?: string } = {};
    
    if (!formData.email) {
      errors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }
    
    if (!formData.password) {
      errors.password = 'Password is required';
    }
    
    setValidationErrors(errors);
    
    // If no validation errors, submit the form
    if (Object.keys(errors).length === 0) {
      onSubmit(formData);
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
          Sign in to your account to continue
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

      {/* Login form */}
      <form onSubmit={handleSubmit} role="form" className="space-y-6">
        {/* Email field */}
        <div>
          <label 
            htmlFor="email" 
            className="block text-sm font-medium text-white/90 mb-2"
          >
            Email Address
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={formData.email}
            onChange={handleInputChange}
            className={`w-full px-4 py-3 rounded-lg bg-white/10 border backdrop-blur-sm text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-neon-500 focus:border-transparent transition-all duration-200 ${
              validationErrors.email 
                ? 'border-red-500 focus:ring-red-500' 
                : 'border-white/20 hover:border-white/30'
            }`}
            placeholder="Enter your email"
            aria-describedby={validationErrors.email ? 'email-error' : undefined}
            aria-invalid={validationErrors.email ? 'true' : 'false'}
          />
          {validationErrors.email && (
            <p id="email-error" className="mt-2 text-sm text-red-400" role="alert">
              {validationErrors.email}
            </p>
          )}
        </div>

        {/* Password field */}
        <div>
          <label 
            htmlFor="password" 
            className="block text-sm font-medium text-white/90 mb-2"
          >
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            value={formData.password}
            onChange={handleInputChange}
            className={`w-full px-4 py-3 rounded-lg bg-white/10 border backdrop-blur-sm text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-neon-500 focus:border-transparent transition-all duration-200 ${
              validationErrors.password 
                ? 'border-red-500 focus:ring-red-500' 
                : 'border-white/20 hover:border-white/30'
            }`}
            placeholder="Enter your password"
            aria-describedby={validationErrors.password ? 'password-error' : undefined}
            aria-invalid={validationErrors.password ? 'true' : 'false'}
          />
          {validationErrors.password && (
            <p id="password-error" className="mt-2 text-sm text-red-400" role="alert">
              {validationErrors.password}
            </p>
          )}
        </div>

        {/* Remember me and forgot password */}
        <div className="flex items-center justify-between">
          <label className="flex items-center">
            <input
              type="checkbox"
              name="remember"
              checked={formData.remember}
              onChange={handleInputChange}
              className="w-4 h-4 text-neon-500 bg-white/10 border-white/20 rounded focus:ring-neon-500 focus:ring-2"
            />
            <span className="ml-2 text-sm text-white/80">
              Remember me
            </span>
          </label>
          
          <Link 
            href="/forgot-password" 
            className="text-sm text-neon-400 hover:text-neon-300 transition-colors"
          >
            Forgot password?
          </Link>
        </div>

        {/* Submit button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3 px-4 bg-gradient-to-r from-neon-500 to-neon-600 text-white font-semibold rounded-lg hover:from-neon-600 hover:to-neon-700 focus:outline-none focus:ring-2 focus:ring-neon-500 focus:ring-offset-2 focus:ring-offset-transparent disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 neon-glow"
        >
          {isLoading ? (
            <div className="flex items-center justify-center">
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
              Signing in...
            </div>
          ) : (
            'Sign In'
          )}
        </button>

        {/* Sign up link */}
        <div className="text-center">
          <p className="text-white/70 text-sm">
            Don't have an account?{' '}
            <Link 
              href="/signup" 
              className="text-neon-400 hover:text-neon-300 font-medium transition-colors"
            >
              Sign up
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
}
