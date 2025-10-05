import { ParsedSyllabus, ParsedEvent } from '../types/syllabus';

export function generateMockParsedData(): ParsedSyllabus {
  const now = new Date();
  const events: ParsedEvent[] = [
    {
      id: 'event-1',
      title: 'Midterm Exam - Data Structures',
      type: 'exam',
      dueDate: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 1 week from now
      dueTime: '10:00',
      description: 'Comprehensive exam covering arrays, linked lists, stacks, and queues',
      points: 100,
      weight: 25,
      status: 'pending',
      priority: 'high',
      courseCode: 'CS 3345',
      location: 'Room 101'
    },
    {
      id: 'event-2',
      title: 'Assignment 3 - Binary Trees',
      type: 'assignment',
      dueDate: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days from now
      dueTime: '23:59',
      description: 'Implement binary tree operations and traversal algorithms',
      points: 50,
      weight: 10,
      status: 'pending',
      priority: 'high',
      courseCode: 'CS 3345',
      location: 'Online'
    },
    {
      id: 'event-3',
      title: 'Quiz 4 - Sorting Algorithms',
      type: 'quiz',
      dueDate: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days from now
      dueTime: '14:30',
      description: 'Quick quiz on bubble sort, merge sort, and quick sort',
      points: 20,
      weight: 5,
      status: 'pending',
      priority: 'medium',
      courseCode: 'CS 3345',
      location: 'Online'
    },
    {
      id: 'event-4',
      title: 'Project Proposal - Final Project',
      type: 'project',
      dueDate: new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 days from now
      dueTime: '17:00',
      description: 'Submit project proposal for final semester project',
      points: 30,
      weight: 15,
      status: 'pending',
      priority: 'high',
      courseCode: 'CS 3345',
      location: 'Online'
    },
    {
      id: 'event-5',
      title: 'Lecture 8 - Graph Algorithms',
      type: 'lecture',
      dueDate: new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day from now
      dueTime: '09:00',
      description: 'Introduction to graph algorithms and data structures',
      points: 0,
      weight: 0,
      status: 'pending',
      priority: 'low',
      courseCode: 'CS 3345',
      location: 'Room 201'
    },
    {
      id: 'event-6',
      title: 'Assignment 4 - Graph Implementation',
      type: 'assignment',
      dueDate: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000).toISOString(), // 2 weeks from now
      dueTime: '23:59',
      description: 'Implement graph data structure and basic algorithms',
      points: 75,
      weight: 12,
      status: 'pending',
      priority: 'medium',
      courseCode: 'CS 3345',
      location: 'Online'
    }
  ];

  return {
    courseName: 'Data Structures and Algorithms',
    courseCode: 'CS 3345',
    instructor: 'Dr. Smith',
    semester: 'Fall',
    year: '2024',
    events: events,
    totalEvents: events.length,
    parsedAt: now.toISOString()
  };
}
