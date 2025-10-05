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
  homework?: Array<{ title: string; due_date: string; description?: string }>;
  exams?: Array<{ type: string; date: string; description?: string }>;
  projects?: Array<{ title: string; due_date: string; description?: string }>;
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
        description: project.description,
        status: 'pending',
        priority: 'high',
        courseCode: syllabus.course_code,
      });
    });
  }

  return events;
}
