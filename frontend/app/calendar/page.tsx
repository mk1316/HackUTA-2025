'use client';

import { useState, useCallback } from 'react';
import CalendarView from '../components/CalendarView';
import AnimatedBackground from '../components/AnimatedBackground';
import ThemeToggle from '../components/ThemeToggle';
import { ParsedEvent, EventFormData } from '../types/syllabus';
import { generateMockParsedData } from '../utils/mockData';
import { ArrowLeft, Plus, Filter, Calendar, Apple, Chrome, X, AlertCircle, ChevronDown } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

export default function CalendarPage() {
  const { theme } = useTheme();
  const [events, setEvents] = useState<ParsedEvent[]>(() => {
    // Initialize with mock data for demo
    const mockData = generateMockParsedData();
    return mockData.events;
  });
  const [selectedEvent, setSelectedEvent] = useState<ParsedEvent | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showCalendarDropdown, setShowCalendarDropdown] = useState(false);
  const [formErrors, setFormErrors] = useState<string[]>([]);
  const [formData, setFormData] = useState<EventFormData>({
    title: '',
    type: 'assignment',
    dueDate: '',
    dueTime: '',
    description: '',
    points: '',
    weight: '',
    priority: 'medium',
    courseCode: '',
    location: ''
  });

  const handleEventClick = (event: ParsedEvent) => {
    setSelectedEvent(event);
  };

  const handleDateClick = (date: Date) => {
    console.log('Date clicked:', date);
    // Here you could open a modal to add a new event
  };

  const handleAddEvent = useCallback(() => {
    const errors: string[] = [];
    
    // Validate required fields
    if (!formData.title.trim()) {
      errors.push('Title is required');
    }
    if (!formData.dueDate) {
      errors.push('Due date is required');
    }
    
    // If there are errors, show them and don't proceed
    if (errors.length > 0) {
      setFormErrors(errors);
      return;
    }
    
    // Clear any previous errors
    setFormErrors([]);
    
    const newEvent: ParsedEvent = {
      id: `event-${Date.now()}`,
      title: formData.title,
      type: formData.type,
      dueDate: new Date(formData.dueDate).toISOString(),
      dueTime: formData.dueTime,
      description: formData.description,
      points: formData.points ? parseInt(formData.points) : undefined,
      weight: formData.weight ? parseFloat(formData.weight) : undefined,
      priority: formData.priority,
      courseCode: formData.courseCode,
      location: formData.location,
      status: 'pending',
      isEdited: false
    };
    setEvents([...events, newEvent]);
    setShowAddForm(false);
    
    // Reset form
    setFormData({
      title: '',
      type: 'assignment',
      dueDate: '',
      dueTime: '',
      description: '',
      points: '',
      weight: '',
      priority: 'medium',
      courseCode: '',
      location: ''
    });
  }, [events, formData]);

  const resetForm = () => {
    setFormData({
      title: '',
      type: 'assignment',
      dueDate: '',
      dueTime: '',
      description: '',
      points: '',
      weight: '',
      priority: 'medium',
      courseCode: '',
      location: ''
    });
    setFormErrors([]);
  };

  const addToGoogleCalendar = (event: ParsedEvent) => {
    const startDate = new Date(event.dueDate).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    const endDate = new Date(new Date(event.dueDate).getTime() + 60*60*1000).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    
    const params = new URLSearchParams({
      action: 'TEMPLATE',
      text: event.title,
      dates: `${startDate}/${endDate}`,
      details: event.description || '',
      location: event.location || ''
    });
    
    const url = `https://calendar.google.com/calendar/render?${params}`;
    window.open(url, '_blank');
    setShowCalendarDropdown(false);
  };

  const addToAppleCalendar = (event: ParsedEvent) => {
    const startDate = new Date(event.dueDate).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    const endDate = new Date(new Date(event.dueDate).getTime() + 60*60*1000).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    
    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Your App//EN
BEGIN:VEVENT
UID:${event.id}@yourapp.com
DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z
DTSTART:${startDate}
DTEND:${endDate}
SUMMARY:${event.title}
DESCRIPTION:${event.description || ''}
LOCATION:${event.location || ''}
END:VEVENT
END:VCALENDAR`;

    const blob = new Blob([icsContent], { type: 'text/calendar' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${event.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.ics`;
    link.click();
    URL.revokeObjectURL(url);
    setShowCalendarDropdown(false);
  };

  const addAllToGoogleCalendar = () => {
    // For multiple events, we'll add them one by one
    events.forEach((event, index) => {
      setTimeout(() => {
        addToGoogleCalendar(event);
      }, index * 500); // Stagger the requests
    });
  };

  const addAllToAppleCalendar = () => {
    // Create a single .ics file with all events
    let icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Your App//EN`;

    events.forEach(event => {
      const startDate = new Date(event.dueDate).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
      const endDate = new Date(new Date(event.dueDate).getTime() + 60*60*1000).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
      
      icsContent += `
BEGIN:VEVENT
UID:${event.id}@yourapp.com
DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z
DTSTART:${startDate}
DTEND:${endDate}
SUMMARY:${event.title}
DESCRIPTION:${event.description || ''}
LOCATION:${event.location || ''}
END:VEVENT`;
    });

    icsContent += `
END:VCALENDAR`;

    const blob = new Blob([icsContent], { type: 'text/calendar' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'academic_calendar.ics';
    link.click();
    URL.revokeObjectURL(url);
    setShowCalendarDropdown(false);
  };

  // Close dropdown when clicking outside
  const handleClickOutside = (event: React.MouseEvent) => {
    if (showCalendarDropdown) {
      setShowCalendarDropdown(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden" onClick={handleClickOutside}>
      {/* Animated Background */}
      <AnimatedBackground />
      
      {/* Theme Toggle Button */}
      <ThemeToggle />
      
      {/* Header */}
      <div className="relative z-10 glassmorphism border-b border-white border-opacity-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => window.history.back()}
                className="p-2 text-white text-opacity-80 hover:text-opacity-100 transition-colors"
              >
                <ArrowLeft className="h-6 w-6" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-white">Academic Calendar</h1>
                <p className="text-sm text-white text-opacity-80">Manage your course schedule and deadlines</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowAddForm(true)}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Event
              </button>
              
              {/* Add to Calendar Button */}
              <button
                onClick={() => setShowCalendarDropdown(!showCalendarDropdown)}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Calendar className="h-4 w-4 mr-2" />
                Add to Calendar
                <ChevronDown className="h-4 w-4 ml-2" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <CalendarView
          events={events}
          onEventClick={handleEventClick}
          onDateClick={handleDateClick}
        />
      </main>

      {/* Calendar Dropdown - moved outside header */}
      {showCalendarDropdown && (
        <div 
          className="fixed top-20 right-6 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-[9999]"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="py-2">
            <div className="px-4 py-2 text-sm font-medium text-gray-700 border-b border-gray-100">
              Add All Events
            </div>
            <button
              onClick={addAllToGoogleCalendar}
              className="w-full flex items-center px-4 py-3 text-left hover:bg-gray-50 transition-colors"
            >
              <Chrome className="h-5 w-5 mr-3 text-blue-500" />
              <div>
                <div className="font-medium text-gray-900">Google Calendar</div>
                <div className="text-sm text-gray-500">Add all events to Google Calendar</div>
              </div>
            </button>
            <button
              onClick={addAllToAppleCalendar}
              className="w-full flex items-center px-4 py-3 text-left hover:bg-gray-50 transition-colors"
            >
              <Apple className="h-5 w-5 mr-3 text-gray-600" />
              <div>
                <div className="font-medium text-gray-900">Apple Calendar</div>
                <div className="text-sm text-gray-500">Download .ics file for Apple Calendar</div>
              </div>
            </button>
          </div>
        </div>
      )}

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
              
              {/* Share Buttons */}
              <div className="pt-4 border-t border-gray-200">
                <div className="flex space-x-3">
                  <button
                    onClick={() => addToGoogleCalendar(selectedEvent)}
                    className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    <Chrome className="h-4 w-4 mr-2" />
                    Add to Google
                  </button>
                  <button
                    onClick={() => addToAppleCalendar(selectedEvent)}
                    className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    <Apple className="h-4 w-4 mr-2" />
                    Add to Apple
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Event Popup Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
          <div className={`${theme === 'spiderverse' ? 'glassmorphism' : 'bg-white'} rounded-2xl max-w-2xl w-full shadow-2xl`}>
            {/* Header */}
            <div className={`flex items-center justify-between p-6 border-b ${theme === 'spiderverse' ? 'border-white border-opacity-20' : 'border-gray-200'}`}>
              <h3 className={`text-xl font-semibold ${theme === 'spiderverse' ? 'text-white' : 'text-gray-900'}`}>Add New Event</h3>
              <button
                onClick={() => {
                  setShowAddForm(false);
                  setFormErrors([]);
                }}
                className={`p-2 ${theme === 'spiderverse' ? 'text-white text-opacity-80 hover:text-opacity-100' : 'text-gray-400 hover:text-gray-600'} transition-colors`}
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            {/* Form Content */}
            <div className="p-6">
              {/* Error Messages */}
              {formErrors.length > 0 && (
                <div className={`mb-4 p-4 rounded-xl ${theme === 'spiderverse' ? 'bg-red-500/20 border border-red-400/50' : 'bg-red-50 border border-red-200'}`}>
                  <div className="flex items-center space-x-2">
                    <AlertCircle className={`h-5 w-5 ${theme === 'spiderverse' ? 'text-red-300' : 'text-red-500'}`} />
                    <span className={`font-medium ${theme === 'spiderverse' ? 'text-red-300' : 'text-red-700'}`}>
                      Please fill in all required fields:
                    </span>
                  </div>
                  <ul className={`mt-2 ml-7 space-y-1 ${theme === 'spiderverse' ? 'text-red-200' : 'text-red-600'}`}>
                    {formErrors.map((error, index) => (
                      <li key={index} className="text-sm">• {error}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium ${theme === 'spiderverse' ? 'text-white' : 'text-gray-700'} mb-1`}>Title *</label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({...formData, title: e.target.value})}
                      className={`w-full px-4 py-3 ${theme === 'spiderverse' ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border-2 border-cyan-400/50 text-black placeholder-gray-500 shadow-lg backdrop-blur-sm' : 'bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 text-gray-900 shadow-md'} rounded-xl focus:ring-4 focus:ring-blue-500/30 focus:border-blue-400 transition-all duration-200 hover:shadow-xl`}
                      placeholder="Enter assignment title"
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium ${theme === 'spiderverse' ? 'text-white' : 'text-gray-700'} mb-1`}>Type</label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({...formData, type: e.target.value as ParsedEvent['type']})}
                      className={`w-full px-4 py-3 ${theme === 'spiderverse' ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border-2 border-cyan-400/50 text-black' : 'bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 text-gray-900'} rounded-xl focus:ring-4 focus:ring-blue-500/30 focus:border-blue-400 transition-all duration-200 hover:shadow-xl`}
                    >
                      <option value="assignment">Assignment</option>
                      <option value="exam">Exam</option>
                      <option value="quiz">Quiz</option>
                      <option value="project">Project</option>
                      <option value="lecture">Lecture</option>
                    </select>
                  </div>
                  <div>
                    <label className={`block text-sm font-medium ${theme === 'spiderverse' ? 'text-white' : 'text-gray-700'} mb-1`}>Due Date *</label>
                    <input
                      type="date"
                      value={formData.dueDate}
                      onChange={(e) => setFormData({...formData, dueDate: e.target.value})}
                      className={`w-full px-4 py-3 ${theme === 'spiderverse' ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border-2 border-cyan-400/50 text-black' : 'bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 text-gray-900'} rounded-xl focus:ring-4 focus:ring-blue-500/30 focus:border-blue-400 transition-all duration-200 hover:shadow-xl`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium ${theme === 'spiderverse' ? 'text-white' : 'text-gray-700'} mb-1`}>Due Time</label>
                    <input
                      type="time"
                      value={formData.dueTime}
                      onChange={(e) => setFormData({...formData, dueTime: e.target.value})}
                      className={`w-full px-4 py-3 ${theme === 'spiderverse' ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border-2 border-cyan-400/50 text-black' : 'bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 text-gray-900'} rounded-xl focus:ring-4 focus:ring-blue-500/30 focus:border-blue-400 transition-all duration-200 hover:shadow-xl`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium ${theme === 'spiderverse' ? 'text-white' : 'text-gray-700'} mb-1`}>Priority</label>
                    <select
                      value={formData.priority}
                      onChange={(e) => setFormData({...formData, priority: e.target.value as ParsedEvent['priority']})}
                      className={`w-full px-4 py-3 ${theme === 'spiderverse' ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border-2 border-cyan-400/50 text-black' : 'bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 text-gray-900'} rounded-xl focus:ring-4 focus:ring-blue-500/30 focus:border-blue-400 transition-all duration-200 hover:shadow-xl`}
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                  <div>
                    <label className={`block text-sm font-medium ${theme === 'spiderverse' ? 'text-white' : 'text-gray-700'} mb-1`}>Points (optional)</label>
                    <input
                      type="number"
                      value={formData.points}
                      onChange={(e) => setFormData({...formData, points: e.target.value})}
                      className={`w-full px-4 py-3 ${theme === 'spiderverse' ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border-2 border-cyan-400/50 text-black placeholder-gray-500 shadow-lg backdrop-blur-sm' : 'bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 text-gray-900 shadow-md'} rounded-xl focus:ring-4 focus:ring-blue-500/30 focus:border-blue-400 transition-all duration-200 hover:shadow-xl`}
                      placeholder="e.g., 100"
                    />
                  </div>
                </div>
                
                <div>
                  <label className={`block text-sm font-medium ${theme === 'spiderverse' ? 'text-white' : 'text-gray-700'} mb-1`}>Description (optional)</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    rows={3}
                    className={`w-full px-4 py-3 ${theme === 'spiderverse' ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border-2 border-cyan-400/50 text-black placeholder-gray-500 shadow-lg backdrop-blur-sm' : 'bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 text-gray-900 shadow-md'} rounded-xl focus:ring-4 focus:ring-blue-500/30 focus:border-blue-400 transition-all duration-200 hover:shadow-xl`}
                    placeholder="Enter assignment description"
                  />
                </div>
              </div>
            </div>
            
            {/* Footer */}
            <div className={`flex items-center justify-end space-x-3 p-6 border-t ${theme === 'spiderverse' ? 'border-white border-opacity-20' : 'border-gray-200'}`}>
              <button
                onClick={() => {
                  setShowAddForm(false);
                  setFormErrors([]);
                }}
                className={`px-4 py-2 ${theme === 'spiderverse' ? 'glassmorphism text-white hover:bg-opacity-30' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'} rounded-lg transition-colors`}
              >
                Cancel
              </button>
              <button
                onClick={handleAddEvent}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Event
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
