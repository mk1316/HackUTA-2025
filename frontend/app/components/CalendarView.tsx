'use client';

import { useRef, useEffect, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { ParsedEvent } from '../types/syllabus';
import { Calendar, Clock, Target, BookOpen, AlertCircle, ArrowLeft, ArrowRight, Grid, List } from 'lucide-react';

interface CalendarViewProps {
  events: ParsedEvent[];
  onEventClick?: (event: ParsedEvent) => void;
  onDateClick?: (date: Date) => void;
}

export default function CalendarView({ events, onEventClick, onDateClick }: CalendarViewProps) {
  const calendarRef = useRef<FullCalendar>(null);
  const [view, setView] = useState<'dayGridMonth' | 'timeGridWeek' | 'timeGridDay'>('dayGridMonth');
  const [currentDate, setCurrentDate] = useState(new Date());

  // Convert ParsedEvent to FullCalendar event format
  const calendarEvents = events.map(event => ({
    id: event.id,
    title: event.title,
    start: event.dueDate,
    end: event.dueDate,
    allDay: !event.dueTime,
    extendedProps: {
      type: event.type,
      priority: event.priority,
      points: event.points,
      weight: event.weight,
      description: event.description,
      location: event.location,
      courseCode: event.courseCode,
      status: event.status
    },
    backgroundColor: getEventColor(event.type),
    borderColor: getEventBorderColor(event.type),
    textColor: '#ffffff',
    classNames: [`priority-${event.priority}`, `type-${event.type}`]
  }));

  function getEventColor(type: ParsedEvent['type']): string {
    switch (type) {
      case 'assignment': return '#3B82F6'; // Blue
      case 'exam': return '#EF4444'; // Red
      case 'quiz': return '#F59E0B'; // Yellow
      case 'project': return '#8B5CF6'; // Purple
      case 'lecture': return '#10B981'; // Green
      default: return '#6B7280'; // Gray
    }
  }

  function getEventBorderColor(type: ParsedEvent['type']): string {
    switch (type) {
      case 'assignment': return '#1D4ED8';
      case 'exam': return '#DC2626';
      case 'quiz': return '#D97706';
      case 'project': return '#7C3AED';
      case 'lecture': return '#059669';
      default: return '#4B5563';
    }
  }

  const handleEventClick = (clickInfo: any) => {
    const event = events.find(e => e.id === clickInfo.event.id);
    if (event && onEventClick) {
      onEventClick(event);
    }
  };

  const handleDateClick = (dateInfo: any) => {
    if (onDateClick) {
      onDateClick(dateInfo.date);
    }
  };

  const navigateToPrevious = () => {
    if (calendarRef.current) {
      calendarRef.current.getApi().prev();
      setCurrentDate(calendarRef.current.getApi().getDate());
    }
  };

  const navigateToNext = () => {
    if (calendarRef.current) {
      calendarRef.current.getApi().next();
      setCurrentDate(calendarRef.current.getApi().getDate());
    }
  };

  const navigateToToday = () => {
    if (calendarRef.current) {
      calendarRef.current.getApi().today();
      setCurrentDate(new Date());
    }
  };

  const changeView = (newView: 'dayGridMonth' | 'timeGridWeek' | 'timeGridDay') => {
    setView(newView);
    if (calendarRef.current) {
      calendarRef.current.getApi().changeView(newView);
    }
  };

  const getViewTitle = () => {
    if (calendarRef.current) {
      return calendarRef.current.getApi().view.title;
    }
    return '';
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
      {/* Calendar Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <Calendar className="h-8 w-8" />
            <div>
              <h2 className="text-2xl font-bold">Academic Calendar</h2>
              <p className="text-blue-100">Manage your course schedule and deadlines</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={navigateToPrevious}
              className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <button
              onClick={navigateToToday}
              className="px-4 py-2 bg-white bg-opacity-20 rounded-lg hover:bg-opacity-30 transition-colors font-medium"
            >
              Today
            </button>
            <button
              onClick={navigateToNext}
              className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
            >
              <ArrowRight className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Custom Title Display */}
        <div className="text-center mb-4">
          <h3 className="text-xl font-bold text-white">
            {getViewTitle()}
          </h3>
        </div>

        {/* View Controls */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => changeView('dayGridMonth')}
            className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
              view === 'dayGridMonth' 
                ? 'bg-white bg-opacity-30' 
                : 'hover:bg-white hover:bg-opacity-20'
            }`}
          >
            <Grid className="h-4 w-4 mr-2" />
            Month
          </button>
          <button
            onClick={() => changeView('timeGridWeek')}
            className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
              view === 'timeGridWeek' 
                ? 'bg-white bg-opacity-30' 
                : 'hover:bg-white hover:bg-opacity-20'
            }`}
          >
            <List className="h-4 w-4 mr-2" />
            Week
          </button>
          <button
            onClick={() => changeView('timeGridDay')}
            className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
              view === 'timeGridDay' 
                ? 'bg-white bg-opacity-30' 
                : 'hover:bg-white hover:bg-opacity-20'
            }`}
          >
            <Clock className="h-4 w-4 mr-2" />
            Day
          </button>
        </div>
      </div>

      {/* Calendar Content */}
      <div className="p-6">
        <FullCalendar
          ref={calendarRef}
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView={view}
          headerToolbar={false}
          events={calendarEvents}
          eventClick={handleEventClick}
          dateClick={handleDateClick}
          height="auto"
          dayMaxEvents={3}
          moreLinkClick="popover"
          eventDisplay="block"
          eventTimeFormat={{
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
          }}
          slotMinTime="06:00:00"
          slotMaxTime="22:00:00"
          weekends={true}
          nowIndicator={true}
          dayHeaderFormat={{ weekday: 'short' }}
          dayCellContent={(info) => (
            <div className="text-center">
              <div className="font-semibold">{info.dayNumberText}</div>
            </div>
          )}
          eventContent={(eventInfo) => (
            <div className="p-1">
              <div className="font-medium text-sm truncate">{eventInfo.event.title}</div>
              {eventInfo.event.extendedProps.dueTime && (
                <div className="text-xs opacity-90">
                  {eventInfo.event.extendedProps.dueTime}
                </div>
              )}
            </div>
          )}
        />
      </div>

      {/* Legend */}
      <div className="bg-gray-50 p-4 border-t">
        <div className="flex flex-wrap items-center justify-center space-x-6 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded bg-blue-500"></div>
            <span>Assignments</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded bg-red-500"></div>
            <span>Exams</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded bg-yellow-500"></div>
            <span>Quizzes</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded bg-purple-500"></div>
            <span>Projects</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded bg-green-500"></div>
            <span>Lectures</span>
          </div>
        </div>
      </div>
    </div>
  );
}
