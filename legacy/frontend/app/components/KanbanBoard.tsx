'use client';

import { useState, useCallback, useEffect } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ParsedEvent } from '../types/syllabus';
import { 
  Calendar, 
  Clock, 
  Target, 
  BookOpen, 
  AlertCircle, 
  CheckCircle2, 
  Plus,
  Edit3,
  Trash2,
  GripVertical
} from 'lucide-react';

interface KanbanBoardProps {
  events: ParsedEvent[];
  onUpdateEvent: (eventId: string, updates: Partial<ParsedEvent>) => void;
  onDeleteEvent: (eventId: string) => void;
  onAddEvent: () => void;
}

interface KanbanColumnProps {
  id: string;
  title: string;
  events: ParsedEvent[];
  color: string;
  onUpdateEvent: (eventId: string, updates: Partial<ParsedEvent>) => void;
  onDeleteEvent: (eventId: string) => void;
}

interface KanbanCardProps {
  event: ParsedEvent;
  onUpdateEvent: (eventId: string, updates: Partial<ParsedEvent>) => void;
  onDeleteEvent: (eventId: string) => void;
}

function KanbanCard({ event, onUpdateEvent, onDeleteEvent }: KanbanCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: event.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

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
      case 'assignment': return 'text-blue-600';
      case 'exam': return 'text-red-600';
      case 'quiz': return 'text-yellow-600';
      case 'project': return 'text-purple-600';
      case 'lecture': return 'text-green-600';
      default: return 'text-gray-600';
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
      day: 'numeric'
    });
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-gray-600 rounded-lg shadow-sm border border-gray-500 p-4 hover:shadow-md transition-all duration-200 ${
        isDragging ? 'rotate-2 scale-105' : ''
      }`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-2">
          <div className={`p-1 rounded ${getTypeColor(event.type)}`}>
            {getTypeIcon(event.type)}
          </div>
          <div className={`w-2 h-2 rounded-full ${getPriorityColor(event.priority)}`} />
        </div>
        <div className="flex items-center space-x-1">
          <button
            {...attributes}
            {...listeners}
            className="p-1 text-gray-400 hover:text-gray-600 cursor-grab active:cursor-grabbing"
          >
            <GripVertical className="h-4 w-4" />
          </button>
          <button
            onClick={() => onUpdateEvent(event.id, { status: 'completed' })}
            className="p-1 text-gray-400 hover:text-green-600 transition-colors"
          >
            <CheckCircle2 className="h-4 w-4" />
          </button>
          <button
            onClick={() => onDeleteEvent(event.id)}
            className="p-1 text-gray-400 hover:text-red-600 transition-colors"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      <h3 className="font-semibold text-white mb-2 line-clamp-2">{event.title}</h3>
      
      <div className="space-y-2 text-sm text-gray-300">
        <div className="flex items-center space-x-2">
          <Calendar className="h-4 w-4" />
          <span>{formatDate(event.dueDate)}</span>
        </div>
        
        {event.dueTime && (
          <div className="flex items-center space-x-2">
            <Clock className="h-4 w-4" />
            <span>{event.dueTime}</span>
          </div>
        )}

        {event.points && (
          <div className="flex items-center space-x-2">
            <Target className="h-4 w-4" />
            <span>{event.points} points</span>
          </div>
        )}

        {event.courseCode && (
          <div className="text-xs text-gray-200 bg-gray-500 px-2 py-1 rounded">
            {event.courseCode}
          </div>
        )}
      </div>

      {event.description && (
        <p className="text-xs text-gray-400 mt-3 line-clamp-2">{event.description}</p>
      )}
    </div>
  );
}

function KanbanColumn({ id, title, events, color, onUpdateEvent, onDeleteEvent }: KanbanColumnProps) {
  return (
    <div className="flex-1 bg-gray-700 rounded-lg p-4 min-h-[600px]">
      <div className="flex items-center justify-between mb-4">
        <h3 className={`font-semibold text-lg text-white`}>{title}</h3>
        <span className="bg-gray-600 text-gray-200 text-sm px-2 py-1 rounded-full">
          {events.length}
        </span>
      </div>
      
      <SortableContext items={events.map(event => event.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-3">
          {events.map((event) => (
            <KanbanCard
              key={event.id}
              event={event}
              onUpdateEvent={onUpdateEvent}
              onDeleteEvent={onDeleteEvent}
            />
          ))}
        </div>
      </SortableContext>
    </div>
  );
}

export default function KanbanBoard({ events, onUpdateEvent, onDeleteEvent, onAddEvent }: KanbanBoardProps) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const [columns, setColumns] = useState({
    pending: events.filter(event => event.status === 'pending'),
    'in-progress': events.filter(event => event.status === 'in-progress'),
    completed: events.filter(event => event.status === 'completed'),
  });

  // Update columns when events prop changes
  useEffect(() => {
    setColumns({
      pending: events.filter(event => event.status === 'pending'),
      'in-progress': events.filter(event => event.status === 'in-progress'),
      completed: events.filter(event => event.status === 'completed'),
    });
  }, [events]);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    // Find which column the active item is in
    let activeColumn = '';
    let activeIndex = -1;

    Object.entries(columns).forEach(([columnId, columnEvents]) => {
      const index = columnEvents.findIndex(event => event.id === activeId);
      if (index !== -1) {
        activeColumn = columnId;
        activeIndex = index;
      }
    });

    // Find which column the over item is in
    let overColumn = '';
    let overIndex = -1;

    Object.entries(columns).forEach(([columnId, columnEvents]) => {
      const index = columnEvents.findIndex(event => event.id === overId);
      if (index !== -1) {
        overColumn = columnId;
        overIndex = index;
      }
    });

    // If dropping on a column (not on another item)
    if (overId === 'pending' || overId === 'in-progress' || overId === 'completed') {
      overColumn = overId;
      overIndex = 0;
    }

    if (activeColumn === overColumn) {
      // Reordering within the same column
      const newEvents = [...columns[activeColumn as keyof typeof columns]];
      const newOrder = arrayMove(newEvents, activeIndex, overIndex);
      
      setColumns(prev => ({
        ...prev,
        [activeColumn]: newOrder,
      }));
    } else {
      // Moving between columns
      const activeEvents = [...columns[activeColumn as keyof typeof columns]];
      const overEvents = [...columns[overColumn as keyof typeof columns]];
      
      const [movedEvent] = activeEvents.splice(activeIndex, 1);
      movedEvent.status = overColumn as ParsedEvent['status'];
      
      overEvents.splice(overIndex, 0, movedEvent);
      
      setColumns(prev => ({
        ...prev,
        [activeColumn]: activeEvents,
        [overColumn]: overEvents,
      }));

      // Update the event status
      onUpdateEvent(activeId, { status: overColumn as ParsedEvent['status'] });
    }
  }, [columns, onUpdateEvent]);

  return (
    <div className="bg-gray-900 rounded-2xl shadow-xl overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-800 to-gray-700 p-6 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Target className="h-8 w-8" />
            <div>
              <h2 className="text-2xl font-bold">Deadline Management</h2>
              <p className="text-gray-300">Drag and drop to manage your assignments</p>
            </div>
          </div>
          <button
            onClick={onAddEvent}
            className="flex items-center px-4 py-2 text-white hover:text-gray-300 transition-colors cursor-pointer"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Task
          </button>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="p-6 bg-gray-800">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <KanbanColumn
              id="pending"
              title="To Do"
              events={columns.pending}
              color="text-white"
              onUpdateEvent={onUpdateEvent}
              onDeleteEvent={onDeleteEvent}
            />
            <KanbanColumn
              id="in-progress"
              title="In Progress"
              events={columns['in-progress']}
              color="text-white"
              onUpdateEvent={onUpdateEvent}
              onDeleteEvent={onDeleteEvent}
            />
            <KanbanColumn
              id="completed"
              title="Done"
              events={columns.completed}
              color="text-white"
              onUpdateEvent={onUpdateEvent}
              onDeleteEvent={onDeleteEvent}
            />
          </div>
        </DndContext>
      </div>
    </div>
  );
}
