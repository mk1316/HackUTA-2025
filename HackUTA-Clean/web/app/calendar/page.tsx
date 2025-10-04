'use client';

import { useState } from 'react';
import CalendarView from '../components/CalendarView';
import { ParsedEvent } from '../types/syllabus';
import { generateMockParsedData } from '../utils/mockData';
import { ArrowLeft, Plus, Filter, Download, Share2 } from 'lucide-react';

export default function CalendarPage() {
  const [events, setEvents] = useState<ParsedEvent[]>(() => {
    // Initialize with mock data for demo
    const mockData = generateMockParsedData();
    return mockData.events;
  });
  const [selectedEvent, setSelectedEvent] = useState<ParsedEvent | null>(null);

  const handleEventClick = (event: ParsedEvent) => {
    setSelectedEvent(event);
  };

  const handleDateClick = (date: Date) => {
    console.log('Date clicked:', date);
    // Here you could open a modal to add a new event
  };

  const handleAddEvent = () => {
    console.log('Add new event');
    // Here you would open a modal to add a new event
  };

  const handleExportCalendar = () => {
    console.log('Export calendar');
    // Here you would implement calendar export functionality
  };

  const handleShareCalendar = () => {
    console.log('Share calendar');
    // Here you would implement calendar sharing functionality
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => window.history.back()}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <ArrowLeft className="h-6 w-6" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Academic Calendar</h1>
                <p className="text-sm text-gray-600">Manage your course schedule and deadlines</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={handleAddEvent}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Event
              </button>
              <button
                onClick={handleExportCalendar}
                className="flex items-center px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                <Download className="h-4 w-4 mr-2" />
                Export
              </button>
              <button
                onClick={handleShareCalendar}
                className="flex items-center px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <CalendarView
          events={events}
          onEventClick={handleEventClick}
          onDateClick={handleDateClick}
        />
      </main>

      {/* Event Detail Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">Event Details</h3>
              <button
                onClick={() => setSelectedEvent(null)}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-gray-900">{selectedEvent.title}</h4>
                <p className="text-sm text-gray-600">{selectedEvent.courseCode}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Date:</span>
                  <p>{new Date(selectedEvent.dueDate).toLocaleDateString()}</p>
                </div>
                {selectedEvent.dueTime && (
                  <div>
                    <span className="font-medium text-gray-700">Time:</span>
                    <p>{selectedEvent.dueTime}</p>
                  </div>
                )}
                {selectedEvent.points && (
                  <div>
                    <span className="font-medium text-gray-700">Points:</span>
                    <p>{selectedEvent.points}</p>
                  </div>
                )}
                {selectedEvent.weight && (
                  <div>
                    <span className="font-medium text-gray-700">Weight:</span>
                    <p>{selectedEvent.weight}%</p>
                  </div>
                )}
              </div>
              
              {selectedEvent.description && (
                <div>
                  <span className="font-medium text-gray-700">Description:</span>
                  <p className="text-sm text-gray-600 mt-1">{selectedEvent.description}</p>
                </div>
              )}
              
              {selectedEvent.location && (
                <div>
                  <span className="font-medium text-gray-700">Location:</span>
                  <p className="text-sm text-gray-600">{selectedEvent.location}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
