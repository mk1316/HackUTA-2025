'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import CalendarView from '../components/CalendarView';
import { ParsedEvent } from '../types/syllabus';

export default function CalendarPage() {
  const router = useRouter();
  const [events, setEvents] = useState<ParsedEvent[]>([]);
  const [courseName, setCourseName] = useState('Course');

  useEffect(() => {
    // Try to get events from sessionStorage
    const storedData = sessionStorage.getItem('syllabusCalendarData');
    if (storedData) {
      try {
        const data = JSON.parse(storedData);
        setEvents(data.events || []);
        setCourseName(data.courseName || 'Course');
      } catch (error) {
        console.error('Error parsing calendar data:', error);
      }
    }
  }, []);

  const handleBack = () => {
    router.push('/');
  };

  return (
    <div className="min-h-screen">
      {/* Back Button */}
      <div className="fixed top-4 left-4 z-50">
        <button
          onClick={handleBack}
          className="px-4 py-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg shadow-lg hover:shadow-xl transition-all border border-gray-200 dark:border-gray-700 font-medium"
        >
          ← Back to Home
        </button>
      </div>

      {events.length > 0 ? (
        <CalendarView events={events} courseName={courseName} />
      ) : (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
          <div className="text-center">
            <div className="text-6xl mb-4">📅</div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              No Events to Display
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Upload and process a syllabus to see your calendar
            </p>
            <button
              onClick={handleBack}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl font-medium"
            >
              Go to Home
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
