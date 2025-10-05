/**
 * Convert syllabus data from API format to ParsedEvent format
 */

import { ParsedEvent } from '../types/syllabus';

type SyllabusData = {
  course_name?: string;
  course_code?: string;
  professor?: {
    name?: string;
    email?: string;
    office_hours?: string;
  };
  class_schedule?: string;
  homework?: Array<{ title: string; due_date: string; due_time?: string; description?: string }>;
  exams?: Array<{ type: string; date: string; time?: string; description?: string }>;
  projects?: Array<{ title: string; due_date: string; due_time?: string; description?: string }>;
  office_hours?: Array<{
    day: string;
    time: string;
    location?: string;
    recurrence?: string;
    start_date: string;
    end_date: string;
  }>;
  class_meetings?: Array<{
    days: string[];
    time: string;
    location?: string;
    recurrence?: string;
    start_date: string;
    end_date: string;
  }>;
};

export function convertSyllabusToEvents(syllabus: SyllabusData): ParsedEvent[] {
  const events: ParsedEvent[] = [];

  // Convert homework to events
  if (syllabus.homework && Array.isArray(syllabus.homework)) {
    syllabus.homework.forEach((hw, index) => {
      events.push({
        id: `hw-${index}`,
        title: hw.title || 'Homework',
        type: 'assignment',
        dueDate: hw.due_date || new Date().toISOString(),
        dueTime: hw.due_time,
        description: hw.description,
        status: 'pending',
        priority: 'medium',
        courseCode: syllabus.course_code,
      });
    });
  }

  // Convert exams to events
  if (syllabus.exams && Array.isArray(syllabus.exams)) {
    syllabus.exams.forEach((exam, index) => {
      events.push({
        id: `exam-${index}`,
        title: exam.type || 'Exam',
        type: 'exam',
        dueDate: exam.date || new Date().toISOString(),
        dueTime: exam.time,
        description: exam.description,
        status: 'pending',
        priority: 'high',
        courseCode: syllabus.course_code,
      });
    });
  }

  // Convert projects to events
  if (syllabus.projects && Array.isArray(syllabus.projects)) {
    syllabus.projects.forEach((project, index) => {
      events.push({
        id: `project-${index}`,
        title: project.title || 'Project',
        type: 'project',
        dueDate: project.due_date || new Date().toISOString(),
        dueTime: project.due_time,
        description: project.description,
        status: 'pending',
        priority: 'high',
        courseCode: syllabus.course_code,
      });
    });
  }

  // Convert office hours to recurring events
  if (syllabus.office_hours && Array.isArray(syllabus.office_hours)) {
    syllabus.office_hours.forEach((oh, index) => {
      events.push({
        id: `office-hours-${index}`,
        title: `Office Hours - ${oh.day}`,
        type: 'office_hours',
        dueDate: oh.start_date || new Date().toISOString(),
        dueTime: oh.time,
        description: `Office Hours\nTime: ${oh.time}\nLocation: ${oh.location || 'TBD'}\nDay: ${oh.day}`,
        location: oh.location,
        status: 'pending',
        priority: 'low',
        courseCode: syllabus.course_code,
        recurrence: 'weekly',
        endDate: oh.end_date,
      });
    });
  }

  // Convert class meetings to recurring events
  if (syllabus.class_meetings && Array.isArray(syllabus.class_meetings)) {
    syllabus.class_meetings.forEach((cm, index) => {
      // Create one event for the class meeting (will recur on specified days)
      const daysStr = cm.days.join(', ');
      events.push({
        id: `class-${index}`,
        title: `${syllabus.course_name || syllabus.course_code || 'Class'}`,
        type: 'class',
        dueDate: cm.start_date || new Date().toISOString(),
        dueTime: cm.time,
        description: `Class Meeting\nDays: ${daysStr}\nTime: ${cm.time}\nLocation: ${cm.location || 'TBD'}`,
        location: cm.location,
        status: 'pending',
        priority: 'medium',
        courseCode: syllabus.course_code,
        recurrence: 'weekly',
        endDate: cm.end_date,
        days: cm.days,
      });
    });
  }

  return events;
}
