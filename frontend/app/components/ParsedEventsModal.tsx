'use client';

import React, { useState, useCallback } from 'react';
import { X, Edit3, Save, Trash2, Plus, Calendar, Clock, BookOpen, Target, AlertCircle, CheckCircle2, Download } from 'lucide-react';
import { ParsedSyllabus, ParsedEvent, EventFormData } from '../types/syllabus';
import { downloadICS } from '../utils/calendar';
import { generateVoiceSummary } from '../lib/api';

interface ParsedEventsModalProps {
  isOpen: boolean;
  onClose: () => void;
  parsedData: ParsedSyllabus | null;
  onSave: (events: ParsedEvent[]) => void;
  onContinue: () => void;
  syllabusFile?: File | null;
}

export default function ParsedEventsModal({ 
  isOpen, 
  onClose, 
  parsedData, 
  onSave, 
  onContinue,
  syllabusFile 
}: ParsedEventsModalProps) {
  const [events, setEvents] = useState<ParsedEvent[]>([]);
  const [editingEvent, setEditingEvent] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [isGeneratingVoice, setIsGeneratingVoice] = useState(false);
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
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (!isOpen || !parsedData) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-6xl w-full max-h-[90vh] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Review Parsed Events</h2>
            <p className="text-gray-600 mt-1">
              {parsedData.courseName} • {parsedData.courseCode} • {parsedData.semester} {parsedData.year}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
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
                  className="bg-gray-50 rounded-xl p-4 border border-gray-200 hover:shadow-md transition-shadow"
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
                          <h3 className="font-semibold text-gray-900">{event.title}</h3>
                          <div className="flex items-center space-x-4 text-sm text-gray-600">
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
                          className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                        >
                          <Edit3 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(event.id)}
                          className="p-2 text-gray-400 hover:text-red-600 transition-colors"
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
            <button
              onClick={async () => {
                if (!syllabusFile) {
                  alert('No syllabus file available. Please upload a syllabus first.');
                  return;
                }
                
                setIsGeneratingVoice(true);
                try {
                  console.log('🎤 Generating voice summary...');
                  const result = await generateVoiceSummary(syllabusFile);
                  
                  if (result.success && result.data) {
                    console.log('✅ Voice summary generated successfully');
                    
                    // Convert base64 to audio blob
                    const audioData = atob(result.data.audio_base64);
                    const audioArray = new Uint8Array(audioData.length);
                    for (let i = 0; i < audioData.length; i++) {
                      audioArray[i] = audioData.charCodeAt(i);
                    }
                    const audioBlob = new Blob([audioArray], { type: 'audio/mpeg' });
                    const audioUrl = URL.createObjectURL(audioBlob);
                    
                    // Create and play audio
                    const audio = new Audio(audioUrl);
                    
                    // Try to play audio and handle errors
                    audio.play()
                      .then(() => {
                        console.log('🔊 Audio is playing!');
                        alert(`🎤 Voice Summary:\n\n${result.data.summary_text}\n\n🔊 Audio is now playing! Listen to Macdonald Trunk's summary.`);
                      })
                      .catch((err) => {
                        console.error('❌ Audio playback failed:', err);
                        alert(`🎤 Voice Summary:\n\n${result.data.summary_text}\n\n⚠️ Audio playback was blocked by your browser. Please check your browser settings or click OK and try clicking the Voice Summary button again.`);
                      });
                  } else {
                    throw new Error(result.error || 'Failed to generate voice summary');
                  }
                } catch (error) {
                  console.error('❌ Voice summary error:', error);
                  alert(`Failed to generate voice summary: ${error instanceof Error ? error.message : 'Unknown error'}`);
                } finally {
                  setIsGeneratingVoice(false);
                }
              }}
              disabled={isGeneratingVoice || !syllabusFile}
              className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGeneratingVoice ? (
                <>
                  <svg className="animate-spin h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Generating...
                </>
              ) : (
                <>
                  <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  </svg>
                  Voice Summary
                </>
              )}
            </button>
            <span className="text-sm text-gray-600">
              {events.length} events found
            </span>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
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
    </div>
  );
}
