'use client';

import { useAuth0 } from '@auth0/auth0-react';
import { useState } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function DashboardPage() {
  const { user, error, logout, getAccessTokenSilently } = useAuth0();
  const [apiData, setApiData] = useState(null);
  const [apiError, setApiError] = useState<string | null>(null);

  const fetchApiData = async () => {
    try {
      const token = await getAccessTokenSilently();
      const response = await fetch('/api/protected', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (response.ok) {
        const data = await response.json();
        setApiData(data);
        setApiError(null);
      } else {
        setApiError('Failed to fetch protected data');
      }
    } catch (err) {
      setApiError('Network error');
    }
  };

  return (
    <ProtectedRoute>
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-white mb-4">
              Welcome, {user?.name || 'User'}! 🎉
            </h1>
            <p className="text-gray-300 text-lg">
              You're successfully authenticated with Auth0
            </p>
          </div>

          {/* User Info Card */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 mb-8">
            <h2 className="text-xl font-semibold text-white mb-4">
              👤 User Information
            </h2>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-400">Name:</span>
                <span className="text-white ml-2">{user?.name || 'Not specified'}</span>
              </div>
              <div>
                <span className="text-gray-400">Email:</span>
                <span className="text-white ml-2">{user?.email || 'Not specified'}</span>
              </div>
              <div>
                <span className="text-gray-400">Email Verified:</span>
                <span className="text-white ml-2">{user?.email_verified ? 'Yes' : 'No'}</span>
              </div>
              <div>
                <span className="text-gray-400">User ID:</span>
                <span className="text-white ml-2 font-mono text-xs">{user?.sub || 'Not specified'}</span>
              </div>
            </div>
          </div>

          {/* API Testing Section */}
          <div className="grid md:grid-cols-2 gap-8 mb-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <h2 className="text-xl font-semibold text-white mb-4">
                🔐 Protected API Test
              </h2>
              <p className="text-gray-300 mb-4">
                Test your Auth0 access token with the backend API
              </p>
              <button
                onClick={fetchApiData}
                className="w-full py-2 px-4 bg-gradient-to-r from-neon-500 to-neon-600 text-white font-semibold rounded-lg hover:from-neon-600 hover:to-neon-700 transition-all duration-200"
              >
                Test API Connection
              </button>
              
              {apiData && (
                <div className="mt-4 p-3 bg-green-500/20 border border-green-500/30 rounded-lg">
                  <p className="text-green-200 text-sm">✅ API Response:</p>
                  <pre className="text-xs text-green-100 mt-1 overflow-x-auto">
                    {JSON.stringify(apiData, null, 2)}
                  </pre>
                </div>
              )}
              
              {apiError && (
                <div className="mt-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg">
                  <p className="text-red-200 text-sm">❌ Error: {apiError}</p>
                </div>
              )}
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <h2 className="text-xl font-semibold text-white mb-4">
                🚀 Next Steps
              </h2>
              <ul className="space-y-2 text-gray-300">
                <li>• Connect to your backend API</li>
                <li>• Implement syllabus parsing</li>
                <li>• Add calendar integration</li>
                <li>• Build study scheduling features</li>
              </ul>
            </div>
          </div>

          {/* Logout Button */}
          <div className="text-center">
            <button
              onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}
              className="inline-block px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-200"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
    </ProtectedRoute>
  );
}
