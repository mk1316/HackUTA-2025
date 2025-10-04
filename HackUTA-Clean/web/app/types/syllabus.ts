export interface ParsedEvent {
  id: string;
  title: string;
  type: 'assignment' | 'exam' | 'quiz' | 'project' | 'lecture' | 'other';
  dueDate: string; // ISO date string
  dueTime?: string; // Optional time
  description?: string;
  points?: number;
  weight?: number; // Percentage of total grade
  status: 'pending' | 'in-progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  courseCode?: string;
  location?: string;
  isEdited?: boolean; // Track if user edited this item
}

export interface ParsedSyllabus {
  courseName: string;
  courseCode: string;
  instructor: string;
  semester: string;
  year: string;
  events: ParsedEvent[];
  totalEvents: number;
  parsedAt: string; // ISO timestamp
}

export interface EventFormData {
  title: string;
  type: ParsedEvent['type'];
  dueDate: string;
  dueTime: string;
  description: string;
  points: string;
  weight: string;
  priority: ParsedEvent['priority'];
  courseCode: string;
  location: string;
}
