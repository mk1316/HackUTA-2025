'use client';

import { useState } from 'react';
import { ParsedEvent } from '../types/syllabus';
import { downloadICS } from '../utils/calendar';

interface CalendarViewProps {
  events: ParsedEvent[];
  courseName?: string;
  onEventClick?: (event: ParsedEvent) => void;
}

export default function CalendarView({ events, courseName = 'Course', onEventClick }: CalendarViewProps) {
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState<ParsedEvent | null>(null);

  const getEventColor = (type: ParsedEvent['type']): string => {
    switch (type) {
      case 'assignment': return 'bg-blue-500 border-blue-600';
      case 'exam': return 'bg-red-500 border-red-600';
      case 'quiz': return 'bg-yellow-500 border-yellow-600';
      case 'project': return 'bg-purple-500 border-purple-600';
      case 'lecture': return 'bg-green-500 border-green-600';
      default: return 'bg-gray-500 border-gray-600';
    }
  };

  const getTypeEmoji = (type: ParsedEvent['type']): string => {
    switch (type) {
      case 'assignment': return '📝';
      case 'exam': return '📊';
      case 'quiz': return '📋';
      case 'project': return '🔬';
      case 'lecture': return '👨‍🏫';
      default: return '📌';
    }
  };

  const getPriorityColor = (priority: ParsedEvent['priority']): string => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    return { daysInMonth, startingDayOfWeek, year, month };
  };

  const getEventsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return events.filter(event => event.dueDate.startsWith(dateStr));
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setSelectedMonth(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
      return newDate;
    });
  };

  const handleExportToCalendar = () => {
    downloadICS(events, courseName);
  };

  const handleEventClick = (event: ParsedEvent) => {
    setSelectedEvent(event);
    if (onEventClick) {
      onEventClick(event);
    }
  };

  const { daysInMonth, startingDayOfWeek, year, month } = getDaysInMonth(selectedMonth);
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Generate calendar grid
  const calendarDays = [];
  for (let i = 0; i < startingDayOfWeek; i++) {
    calendarDays.push(null);
  }
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(day);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                📅 Academic Calendar
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                {courseName} - {events.length} events
              </p>
            </div>
            <button
              onClick={handleExportToCalendar}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl font-medium"
            >
              📥 Export to Calendar
            </button>
          </div>

          {/* Calendar Navigation */}
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => navigateMonth('prev')}
              className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              ← Previous
            </button>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {monthNames[month]} {year}
            </h2>
            <button
              onClick={() => navigateMonth('next')}
              className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              Next →
            </button>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-2">
            {/* Day headers */}
            {dayNames.map(day => (
              <div
                key={day}
                className="text-center font-semibold text-gray-700 dark:text-gray-300 py-2"
              >
                {day}
              </div>
            ))}

            {/* Calendar days */}
            {calendarDays.map((day, index) => {
              if (day === null) {
                return <div key={`empty-${year}-${month}-${index}`} className="min-h-24 bg-gray-50 dark:bg-gray-900 rounded-lg" />;
              }

              const date = new Date(year, month, day);
              const dayEvents = getEventsForDate(date);
              const isToday = new Date().toDateString() === date.toDateString();

              return (
                <div
                  key={`day-${year}-${month}-${day}`}
                  className={`min-h-24 p-2 rounded-lg border-2 transition-all ${
                    isToday
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
                  } hover:shadow-md`}
                >
                  <div className={`text-sm font-semibold mb-1 ${
                    isToday ? 'text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300'
                  }`}>
                    {day}
                  </div>
                  <div className="space-y-1">
                    {dayEvents.slice(0, 2).map(event => (
                      <button
                        key={event.id}
                        onClick={() => handleEventClick(event)}
                        className={`w-full text-left text-xs px-2 py-1 rounded ${getEventColor(event.type)} text-white truncate hover:opacity-80 transition-opacity`}
                        title={event.title}
                      >
                        {getTypeEmoji(event.type)} {event.title}
                      </button>
                    ))}
                    {dayEvents.length > 2 && (
                      <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
                        +{dayEvents.length - 2} more
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Event List */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            All Events
          </h3>
          <div className="space-y-3">
            {events
              .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
              .map(event => (
                <button
                  key={event.id}
                  onClick={() => handleEventClick(event)}
                  className="w-full text-left p-4 rounded-lg border-2 border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-400 transition-all hover:shadow-md"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="text-2xl">{getTypeEmoji(event.type)}</span>
                        <h4 className="font-semibold text-gray-900 dark:text-white">
                          {event.title}
                        </h4>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getPriorityColor(event.priority)}`}>
                          {event.priority}
                        </span>
                      </div>
                      {event.description && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                          {event.description}
                        </p>
                      )}
                      <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                        <span>📅 {new Date(event.dueDate).toLocaleDateString()}</span>
                        {event.dueTime && <span>🕐 {event.dueTime}</span>}
                        {event.points && <span>💯 {event.points} pts</span>}
                        {event.location && <span>📍 {event.location}</span>}
                      </div>
                    </div>
                    <div className={`px-3 py-1 rounded-lg text-white text-xs font-medium ${getEventColor(event.type)}`}>
                      {event.type}
                    </div>
                  </div>
                </button>
              ))}
          </div>
        </div>

        {/* Event Detail Modal */}
        {selectedEvent && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <span className="text-4xl">{getTypeEmoji(selectedEvent.type)}</span>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                      {selectedEvent.title}
                    </h3>
                    <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${getPriorityColor(selectedEvent.priority)} mt-1`}>
                      {selectedEvent.priority} priority
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedEvent(null)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                {selectedEvent.description && (
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Description</h4>
                    <p className="text-gray-600 dark:text-gray-400">{selectedEvent.description}</p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Due Date</h4>
                    <p className="text-gray-600 dark:text-gray-400">
                      {new Date(selectedEvent.dueDate).toLocaleDateString()}
                    </p>
                  </div>
                  {selectedEvent.dueTime && (
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Due Time</h4>
                      <p className="text-gray-600 dark:text-gray-400">{selectedEvent.dueTime}</p>
                    </div>
                  )}
                  {selectedEvent.points && (
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Points</h4>
                      <p className="text-gray-600 dark:text-gray-400">{selectedEvent.points}</p>
                    </div>
                  )}
                  {selectedEvent.weight && (
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Weight</h4>
                      <p className="text-gray-600 dark:text-gray-400">{selectedEvent.weight}%</p>
                    </div>
                  )}
                  {selectedEvent.location && (
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Location</h4>
                      <p className="text-gray-600 dark:text-gray-400">{selectedEvent.location}</p>
                    </div>
                  )}
                  {selectedEvent.courseCode && (
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Course</h4>
                      <p className="text-gray-600 dark:text-gray-400">{selectedEvent.courseCode}</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setSelectedEvent(null)}
                  className="px-6 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Legend */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 mt-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Event Types</h3>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 rounded bg-blue-500"></div>
              <span className="text-sm text-gray-700 dark:text-gray-300">Assignments</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 rounded bg-red-500"></div>
              <span className="text-sm text-gray-700 dark:text-gray-300">Exams</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 rounded bg-yellow-500"></div>
              <span className="text-sm text-gray-700 dark:text-gray-300">Quizzes</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 rounded bg-purple-500"></div>
              <span className="text-sm text-gray-700 dark:text-gray-300">Projects</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 rounded bg-green-500"></div>
              <span className="text-sm text-gray-700 dark:text-gray-300">Lectures</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
