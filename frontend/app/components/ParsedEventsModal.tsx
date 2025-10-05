'use client';

import React, { useState, useCallback } from 'react';
import { X, Edit3, Save, Trash2, Plus, Calendar, Clock, BookOpen, Target, AlertCircle, CheckCircle2, Download } from 'lucide-react';
import { ParsedSyllabus, ParsedEvent, EventFormData } from '../types/syllabus';
import { downloadICS } from '../utils/calendar';
import { useTheme } from '../contexts/ThemeContext';

interface ParsedEventsModalProps {
  isOpen: boolean;
  onClose: () => void;
  parsedData: ParsedSyllabus | null;
  onSave: (events: ParsedEvent[]) => void;
  onContinue: () => void;
}

export default function ParsedEventsModal({ 
  isOpen, 
  onClose, 
  parsedData, 
  onSave, 
  onContinue 
}: ParsedEventsModalProps) {
  const { theme } = useTheme();
  const [events, setEvents] = useState<ParsedEvent[]>([]);
  const [editingEvent, setEditingEvent] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
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

  // Initialize events when modal opens
  React.useEffect(() => {
    if (parsedData && isOpen) {
      setEvents(parsedData.events);
    }
  }, [parsedData, isOpen]);

  const handleEdit = useCallback((eventId: string) => {
    const event = events.find(e => e.id === eventId);
    if (event) {
      setFormData({
        title: event.title,
        type: event.type,
        dueDate: event.dueDate.split('T')[0],
        dueTime: event.dueTime || '',
        description: event.description || '',
        points: event.points?.toString() || '',
        weight: event.weight?.toString() || '',
        priority: event.priority,
        courseCode: event.courseCode || '',
        location: event.location || ''
      });
      setEditingEvent(eventId);
    }
  }, [events]);

  const handleSave = useCallback(() => {
    if (editingEvent) {
      const updatedEvents = events.map(event => 
        event.id === editingEvent 
          ? {
              ...event,
              ...formData,
              points: formData.points ? parseInt(formData.points) : undefined,
              weight: formData.weight ? parseFloat(formData.weight) : undefined,
              isEdited: true
            }
          : event
      );
      setEvents(updatedEvents);
      setEditingEvent(null);
    } else if (showAddForm) {
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
        isEdited: true
      };
      setEvents([...events, newEvent]);
      setShowAddForm(false);
    }
    
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
  }, [editingEvent, events, formData, showAddForm]);

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

  const handleDelete = useCallback((eventId: string) => {
    setEvents(events.filter(event => event.id !== eventId));
  }, [events]);

  const handleExportToCalendar = useCallback(() => {
    const courseName = parsedData?.courseName || 'Course';
    downloadICS(events, courseName);
  }, [events, parsedData]);

  const getTypeIcon = (type: ParsedEvent['type']) => {
    switch (type) {
      case 'assignment': return <BookOpen className="h-4 w-4" />;
      case 'exam': return <Target className="h-4 w-4" />;
      case 'quiz': return <AlertCircle className="h-4 w-4" />;
      case 'project': return <BookOpen className="h-4 w-4" />;
      case 'lecture': return <BookOpen className="h-4 w-4" />;
      default: return <BookOpen className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: ParsedEvent['type']) => {
    switch (type) {
      case 'assignment': return 'text-blue-400';
      case 'exam': return 'text-red-400';
      case 'quiz': return 'text-yellow-400';
      case 'project': return 'text-purple-400';
      case 'lecture': return 'text-green-400';
      default: return 'text-gray-400';
    }
  };

  const getPriorityColor = (priority: ParsedEvent['priority']) => {
    switch (priority) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const formatDate = (dateString: string) => {
    // Parse date in local timezone to avoid off-by-one errors
    const date = new Date(dateString + 'T12:00:00'); // Add noon time to prevent timezone issues
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (!isOpen || !parsedData) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`${theme === 'spiderverse' ? 'glassmorphism' : 'bg-white'} rounded-2xl max-w-6xl w-full max-h-[90vh] flex flex-col shadow-2xl`}>
        {/* Header */}
        <div className={`flex items-center justify-between p-6 border-b ${theme === 'spiderverse' ? 'border-white border-opacity-20' : 'border-gray-200'}`}>
          <div>
            <h2 className={`text-2xl font-bold ${theme === 'spiderverse' ? 'text-white' : 'text-gray-900'}`}>Review Parsed Events</h2>
            <p className={`${theme === 'spiderverse' ? 'text-white text-opacity-80' : 'text-gray-600'} mt-1`}>
              {parsedData.courseName} • {parsedData.courseCode} • {parsedData.semester} {parsedData.year}
            </p>
          </div>
          <button
            onClick={onClose}
            className={`p-2 ${theme === 'spiderverse' ? 'text-white text-opacity-80 hover:text-opacity-100' : 'text-gray-400 hover:text-gray-600'} transition-colors`}
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden flex">
          {/* Events List */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="space-y-4">
              {events.map((event) => (
                <div
                  key={event.id}
                  className={`${theme === 'spiderverse' ? 'glassmorphism' : 'bg-gray-50'} rounded-xl p-4 ${theme === 'spiderverse' ? 'border-white border-opacity-20' : 'border border-gray-200'} hover:shadow-md transition-shadow`}
                >
                  {editingEvent === event.id ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                          <input
                            type="text"
                            value={formData.title}
                            onChange={(e) => setFormData({...formData, title: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                          <select
                            value={formData.type}
                            onChange={(e) => setFormData({...formData, type: e.target.value as ParsedEvent['type']})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          >
                            <option value="assignment">Assignment</option>
                            <option value="exam">Exam</option>
                            <option value="quiz">Quiz</option>
                            <option value="project">Project</option>
                            <option value="lecture">Lecture</option>
                            <option value="other">Other</option>
                          </select>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                          <input
                            type="date"
                            value={formData.dueDate}
                            onChange={(e) => setFormData({...formData, dueDate: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Due Time</label>
                          <input
                            type="time"
                            value={formData.dueTime}
                            onChange={(e) => setFormData({...formData, dueTime: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                          <select
                            value={formData.priority}
                            onChange={(e) => setFormData({...formData, priority: e.target.value as ParsedEvent['priority']})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          >
                            <option value="low">Low</option>
                            <option value="medium">Medium</option>
                            <option value="high">High</option>
                          </select>
                        </div>
                      </div>

                      <div className="flex space-x-2">
                        <button
                          onClick={handleSave}
                          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          <Save className="h-4 w-4 mr-2" />
                          Save
                        </button>
                        <button
                          onClick={() => setEditingEvent(null)}
                          className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className={`p-2 rounded-lg ${getTypeColor(event.type)} bg-opacity-10`}>
                          <div className={getTypeColor(event.type)}>
                            {getTypeIcon(event.type)}
                          </div>
                        </div>
                        <div>
                          <h3 className={`font-semibold ${theme === 'spiderverse' ? 'text-white' : 'text-gray-900'}`}>{event.title}</h3>
                          <div className={`flex items-center space-x-4 text-sm ${theme === 'spiderverse' ? 'text-white text-opacity-80' : 'text-gray-600'}`}>
                            <div className="flex items-center">
                              <Calendar className="h-4 w-4 mr-1" />
                              {formatDate(event.dueDate)}
                            </div>
                            {event.dueTime && (
                              <div className="flex items-center">
                                <Clock className="h-4 w-4 mr-1" />
                                {event.dueTime}
                              </div>
                            )}
                            {event.points && (
                              <span>{event.points} points</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className={`w-3 h-3 rounded-full ${getPriorityColor(event.priority)}`} />
                        <button
                          onClick={() => handleEdit(event.id)}
                          className={`p-2 ${theme === 'spiderverse' ? 'text-white text-opacity-80 hover:text-opacity-100' : 'text-gray-400 hover:text-blue-600'} transition-colors`}
                        >
                          <Edit3 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(event.id)}
                          className={`p-2 ${theme === 'spiderverse' ? 'text-white text-opacity-80 hover:text-red-400' : 'text-gray-400 hover:text-red-600'} transition-colors`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowAddForm(true)}
              className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Event
            </button>
            <span className={`text-sm ${theme === 'spiderverse' ? 'text-white text-opacity-80' : 'text-gray-600'}`}>
              {events.length} events found
            </span>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className={`px-6 py-2 ${theme === 'spiderverse' ? 'glassmorphism text-white hover:bg-opacity-30' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'} rounded-lg transition-colors`}
            >
              Cancel
            </button>
            <button
              onClick={handleExportToCalendar}
              className="flex items-center px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Download className="h-4 w-4 mr-2" />
              Export to Calendar
            </button>
            <button
              onClick={() => {
                onSave(events);
                onContinue();
              }}
              className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Continue to Calendar
            </button>
          </div>
        </div>
      </div>
      
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
                      className={`w-full px-4 py-3 ${theme === 'spiderverse' ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border-2 border-cyan-400/50 text-black shadow-lg backdrop-blur-sm' : 'bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 text-gray-900 shadow-md'} rounded-xl focus:ring-4 focus:ring-blue-500/30 focus:border-blue-400 transition-all duration-200 hover:shadow-xl`}
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
                      className={`w-full px-4 py-3 ${theme === 'spiderverse' ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border-2 border-cyan-400/50 text-black shadow-lg backdrop-blur-sm' : 'bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 text-gray-900 shadow-md'} rounded-xl focus:ring-4 focus:ring-blue-500/30 focus:border-blue-400 transition-all duration-200 hover:shadow-xl`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium ${theme === 'spiderverse' ? 'text-white' : 'text-gray-700'} mb-1`}>Due Time</label>
                    <input
                      type="time"
                      value={formData.dueTime}
                      onChange={(e) => setFormData({...formData, dueTime: e.target.value})}
                      className={`w-full px-4 py-3 ${theme === 'spiderverse' ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border-2 border-cyan-400/50 text-black shadow-lg backdrop-blur-sm' : 'bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 text-gray-900 shadow-md'} rounded-xl focus:ring-4 focus:ring-blue-500/30 focus:border-blue-400 transition-all duration-200 hover:shadow-xl`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium ${theme === 'spiderverse' ? 'text-white' : 'text-gray-700'} mb-1`}>Priority</label>
                    <select
                      value={formData.priority}
                      onChange={(e) => setFormData({...formData, priority: e.target.value as ParsedEvent['priority']})}
                      className={`w-full px-4 py-3 ${theme === 'spiderverse' ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border-2 border-cyan-400/50 text-black shadow-lg backdrop-blur-sm' : 'bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 text-gray-900 shadow-md'} rounded-xl focus:ring-4 focus:ring-blue-500/30 focus:border-blue-400 transition-all duration-200 hover:shadow-xl`}
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
