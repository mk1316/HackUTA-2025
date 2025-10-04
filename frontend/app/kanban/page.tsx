'use client';

import { useState } from 'react';
import KanbanBoard from '../components/KanbanBoard';
import { ParsedEvent } from '../types/syllabus';
import { generateMockParsedData } from '../utils/mockData';
import { ArrowLeft, Filter, Download, Share2, Settings } from 'lucide-react';

export default function KanbanPage() {
  const [events, setEvents] = useState<ParsedEvent[]>(() => {
    // Initialize with mock data for demo
    const mockData = generateMockParsedData();
    return mockData.events.map(event => ({
      ...event,
      status: Math.random() > 0.7 ? 'completed' : Math.random() > 0.5 ? 'in-progress' : 'pending'
    }));
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
    console.log('Add new event');
    // Here you would open a modal to add a new event
  };

  const handleExportBoard = () => {
    console.log('Export kanban board');
    // Here you would implement board export functionality
  };

  const handleShareBoard = () => {
    console.log('Share kanban board');
    // Here you would implement board sharing functionality
  };

  const handleFilterBoard = () => {
    console.log('Filter kanban board');
    // Here you would implement filtering functionality
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
                <h1 className="text-2xl font-bold text-gray-900">Deadline Management</h1>
                <p className="text-sm text-gray-600">Drag and drop to organize your assignments</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={handleFilterBoard}
                className="flex items-center px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </button>
              <button
                onClick={handleExportBoard}
                className="flex items-center px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                <Download className="h-4 w-4 mr-2" />
                Export
              </button>
              <button
                onClick={handleShareBoard}
                className="flex items-center px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </button>
              <button
                className="flex items-center px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <KanbanBoard
          events={events}
          onUpdateEvent={handleUpdateEvent}
          onDeleteEvent={handleDeleteEvent}
          onAddEvent={handleAddEvent}
        />
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
    </div>
  );
}
