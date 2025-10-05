'use client';

import { useState, useEffect } from 'react';
import KanbanBoard from '../components/KanbanBoard';
import AnimatedBackground from '../components/AnimatedBackground';
import ThemeToggle from '../components/ThemeToggle';
import { ParsedEvent } from '../types/syllabus';
import { generateMockParsedData } from '../utils/mockData';
import { ArrowLeft, Filter, ChevronDown, X, Plus, AlertCircle } from 'lucide-react';

export default function KanbanPage() {
  const [events, setEvents] = useState<ParsedEvent[]>([]);
  const [isClient, setIsClient] = useState(false);

  // Initialize events on client side to avoid hydration mismatch
  useEffect(() => {
    setIsClient(true);
    const mockData = generateMockParsedData();
    const eventsWithStatus = mockData.events.map(event => ({
      ...event,
      status: Math.random() > 0.7 ? 'completed' as const : Math.random() > 0.5 ? 'in-progress' as const : 'pending' as const
    }));
    setEvents(eventsWithStatus);
  }, []);
  
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formErrors, setFormErrors] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    title: '',
    type: 'assignment' as ParsedEvent['type'],
    dueDate: '',
    dueTime: '',
    description: '',
    points: '',
    weight: '',
    priority: 'medium' as ParsedEvent['priority'],
    courseCode: '',
    location: ''
  });
  const [filters, setFilters] = useState({
    status: [] as string[],
    type: [] as string[],
    priority: [] as string[]
  });

  const handleUpdateEvent = (eventId: string, updates: Partial<ParsedEvent>) => {
    setEvents(prev => prev.map(event => 
      event.id === eventId ? { ...event, ...updates } : event
    ));
  };

  const handleDeleteEvent = (eventId: string) => {
    setEvents(prev => prev.filter(event => event.id !== eventId));
  };

  const handleAddEvent = () => {
    setShowAddForm(true);
  };

  const handleAddTask = () => {
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
      id: `event-${Math.random().toString(36).substr(2, 9)}`,
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
  };

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

  const handleFilterBoard = () => {
    setShowFilterDropdown(!showFilterDropdown);
  };

  const toggleFilter = (category: 'status' | 'type' | 'priority', value: string) => {
    setFilters(prev => ({
      ...prev,
      [category]: prev[category].includes(value)
        ? prev[category].filter(item => item !== value)
        : [...prev[category], value]
    }));
  };

  const clearFilters = () => {
    setFilters({
      status: [],
      type: [],
      priority: []
    });
  };

  const getFilteredEvents = () => {
    return events.filter(event => {
      const statusMatch = filters.status.length === 0 || filters.status.includes(event.status || 'pending');
      const typeMatch = filters.type.length === 0 || filters.type.includes(event.type);
      const priorityMatch = filters.priority.length === 0 || filters.priority.includes(event.priority);
      return statusMatch && typeMatch && priorityMatch;
    });
  };

  const hasActiveFilters = filters.status.length > 0 || filters.type.length > 0 || filters.priority.length > 0;

  // Close dropdown when clicking outside
  const handleClickOutside = (event: React.MouseEvent) => {
    if (showFilterDropdown) {
      setShowFilterDropdown(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden" onClick={handleClickOutside}>
      {/* Animated Background */}
      <AnimatedBackground />
      
      {/* Theme Toggle Button */}
      <ThemeToggle />
      
      {/* Header */}
      <div className="relative z-50 glassmorphism border-b border-white border-opacity-20">
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
                <h1 className="text-2xl font-bold text-white">Deadline Management</h1>
                <p className="text-sm text-white text-opacity-80">Drag and drop to organize your assignments</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              {/* Filter Dropdown */}
              <div className="relative">
                <button
                  onClick={handleFilterBoard}
                  className={`flex items-center px-3 py-1.5 rounded-lg transition-colors text-sm ${
                    hasActiveFilters 
                      ? 'bg-blue-600 text-white hover:bg-blue-700' 
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  <Filter className="h-3.5 w-3.5 mr-1.5" />
                  Filter
                  {hasActiveFilters && (
                    <span className="ml-1.5 px-1.5 py-0.5 bg-blue-900 text-white rounded-full text-xs font-medium">
                      {filters.status.length + filters.type.length + filters.priority.length}
                    </span>
                  )}
                  <ChevronDown className="h-3.5 w-3.5 ml-1.5" />
                </button>
                
                {showFilterDropdown && (
                  <div 
                    className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-[999999]"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">Filter Events</h3>
                        <button
                          onClick={() => setShowFilterDropdown(false)}
                          className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          <X className="h-5 w-5" />
                        </button>
                      </div>
                      
                      {/* Status Filter */}
                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Status</h4>
                        <div className="space-y-2">
                          {['pending', 'in-progress', 'completed'].map(status => (
                            <label key={status} className="flex items-center space-x-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={filters.status.includes(status)}
                                onChange={() => toggleFilter('status', status)}
                                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                              />
                              <span className="text-sm text-gray-700 capitalize">{status.replace('-', ' ')}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                      
                      {/* Type Filter */}
                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Type</h4>
                        <div className="space-y-2">
                          {['assignment', 'exam', 'quiz', 'project', 'lecture'].map(type => (
                            <label key={type} className="flex items-center space-x-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={filters.type.includes(type)}
                                onChange={() => toggleFilter('type', type)}
                                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                              />
                              <span className="text-sm text-gray-700 capitalize">{type}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                      
                      {/* Priority Filter */}
                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Priority</h4>
                        <div className="space-y-2">
                          {['low', 'medium', 'high'].map(priority => (
                            <label key={priority} className="flex items-center space-x-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={filters.priority.includes(priority)}
                                onChange={() => toggleFilter('priority', priority)}
                                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                              />
                              <span className="text-sm text-gray-700 capitalize">{priority}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                      
                      {/* Clear Filters and Done */}
                      <div className="flex justify-end space-x-3">
                        <button
                          onClick={clearFilters}
                          className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors cursor-pointer"
                        >
                          Clear All
                        </button>
                        <button
                          onClick={() => setShowFilterDropdown(false)}
                          className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
                        >
                          Done
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>


      {/* Main Content */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isClient ? (
          <KanbanBoard
            events={getFilteredEvents()}
            onUpdateEvent={handleUpdateEvent}
            onDeleteEvent={handleDeleteEvent}
            onAddEvent={handleAddEvent}
          />
        ) : (
          <div className="flex items-center justify-center h-64">
            <div className="text-white text-lg">Loading...</div>
          </div>
        )}
      </main>

      {/* Stats */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">To Do</p>
                <p className="text-2xl font-bold text-gray-900">
                  {events.filter(e => e.status === 'pending').length}
                </p>
              </div>
              <div className="p-3 bg-gray-100 rounded-full">
                <div className="w-6 h-6 bg-gray-400 rounded-full"></div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">In Progress</p>
                <p className="text-2xl font-bold text-gray-900">
                  {events.filter(e => e.status === 'in-progress').length}
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <div className="w-6 h-6 bg-blue-500 rounded-full"></div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-gray-900">
                  {events.filter(e => e.status === 'completed').length}
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <div className="w-6 h-6 bg-green-500 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Task Popup Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900">Add New Task</h3>
              <button
                onClick={() => {
                  setShowAddForm(false);
                  setFormErrors([]);
                }}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            {/* Form Content */}
            <div className="p-6">
              {/* Error Messages */}
              {formErrors.length > 0 && (
                <div className="mb-4 p-4 rounded-xl bg-red-50 border border-red-200">
                  <div className="flex items-center space-x-2">
                    <AlertCircle className="h-5 w-5 text-red-500" />
                    <span className="font-medium text-red-700">
                      Please fill in all required fields:
                    </span>
                  </div>
                  <ul className="mt-2 ml-7 space-y-1 text-red-600">
                    {formErrors.map((error, index) => (
                      <li key={index} className="text-sm">• {error}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({...formData, title: e.target.value})}
                      className="w-full px-4 py-3 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 text-gray-900 shadow-md rounded-xl focus:ring-4 focus:ring-blue-500/30 focus:border-blue-400 transition-all duration-200 hover:shadow-xl"
                      placeholder="Enter task title"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({...formData, type: e.target.value as ParsedEvent['type']})}
                      className="w-full px-4 py-3 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 text-gray-900 shadow-md rounded-xl focus:ring-4 focus:ring-blue-500/30 focus:border-blue-400 transition-all duration-200 hover:shadow-xl"
                    >
                      <option value="assignment">Assignment</option>
                      <option value="exam">Exam</option>
                      <option value="quiz">Quiz</option>
                      <option value="project">Project</option>
                      <option value="lecture">Lecture</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Due Date *</label>
                    <input
                      type="date"
                      value={formData.dueDate}
                      onChange={(e) => setFormData({...formData, dueDate: e.target.value})}
                      className="w-full px-4 py-3 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 text-gray-900 shadow-md rounded-xl focus:ring-4 focus:ring-blue-500/30 focus:border-blue-400 transition-all duration-200 hover:shadow-xl"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Due Time</label>
                    <input
                      type="time"
                      value={formData.dueTime}
                      onChange={(e) => setFormData({...formData, dueTime: e.target.value})}
                      className="w-full px-4 py-3 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 text-gray-900 shadow-md rounded-xl focus:ring-4 focus:ring-blue-500/30 focus:border-blue-400 transition-all duration-200 hover:shadow-xl"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                    <select
                      value={formData.priority}
                      onChange={(e) => setFormData({...formData, priority: e.target.value as ParsedEvent['priority']})}
                      className="w-full px-4 py-3 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 text-gray-900 shadow-md rounded-xl focus:ring-4 focus:ring-blue-500/30 focus:border-blue-400 transition-all duration-200 hover:shadow-xl"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Points (optional)</label>
                    <input
                      type="number"
                      value={formData.points}
                      onChange={(e) => setFormData({...formData, points: e.target.value})}
                      className="w-full px-4 py-3 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 text-gray-900 shadow-md rounded-xl focus:ring-4 focus:ring-blue-500/30 focus:border-blue-400 transition-all duration-200 hover:shadow-xl"
                      placeholder="e.g., 100"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description (optional)</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    rows={3}
                    className="w-full px-4 py-3 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 text-gray-900 shadow-md rounded-xl focus:ring-4 focus:ring-blue-500/30 focus:border-blue-400 transition-all duration-200 hover:shadow-xl"
                    placeholder="Enter task description"
                  />
                </div>
              </div>
            </div>
            
            {/* Footer */}
            <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
              <button
                onClick={() => {
                  setShowAddForm(false);
                  setFormErrors([]);
                }}
                className="px-4 py-2 bg-gray-200 text-gray-800 hover:bg-gray-300 rounded-lg transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleAddTask}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors cursor-pointer"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Task
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
