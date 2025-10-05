/**
 * Calendar utility functions
 * Export events to .ics format for Apple Calendar, Google Calendar, etc.
 */

import { ParsedEvent } from '../types/syllabus';

/**
 * Convert events to .ics (iCalendar) format
 * Compatible with Apple Calendar, Google Calendar, Outlook, etc.
 */
export function exportToICS(events: ParsedEvent[], courseName: string = 'Course'): string {
  const now = new Date();
  const timestamp = now.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  
  let ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//SyllabusSync//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:${courseName}`,
    'X-WR-TIMEZONE:America/Chicago',
  ];

  events.forEach((event, index) => {
    const eventDate = new Date(event.dueDate);
    const dateStr = eventDate.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    
    // Create unique ID
    const uid = `syllabus-sync-${event.id}-${index}@syllabussync.app`;
    
    // Event type emoji
    const typeEmoji = {
      'assignment': '📝',
      'exam': '📊',
      'project': '🔬',
      'quiz': '📋',
      'lecture': '👨‍🏫',
      'other': '📌'
    }[event.type] || '📌';
    
    ics.push('BEGIN:VEVENT');
    ics.push(`UID:${uid}`);
    ics.push(`DTSTAMP:${timestamp}`);
    ics.push(`DTSTART:${dateStr}`);
    ics.push(`DTEND:${dateStr}`);
    ics.push(`SUMMARY:${typeEmoji} ${event.title}`);
    
    if (event.description) {
      // Escape special characters in description
      const desc = event.description.replace(/\n/g, '\\n').replace(/,/g, '\\,');
      ics.push(`DESCRIPTION:${desc}`);
    }
    
    if (event.location) {
      ics.push(`LOCATION:${event.location}`);
    }
    
    // Add course code as category
    if (event.courseCode) {
      ics.push(`CATEGORIES:${event.courseCode}`);
    }
    
    // Add priority
    const priorityMap = { 'high': '1', 'medium': '5', 'low': '9' };
    ics.push(`PRIORITY:${priorityMap[event.priority] || '5'}`);
    
    // Add alarm (reminder) - 1 day before
    ics.push('BEGIN:VALARM');
    ics.push('TRIGGER:-P1D');
    ics.push('ACTION:DISPLAY');
    ics.push(`DESCRIPTION:Reminder: ${event.title} due tomorrow`);
    ics.push('END:VALARM');
    
    ics.push('END:VEVENT');
  });

  ics.push('END:VCALENDAR');
  
  return ics.join('\r\n');
}

/**
 * Download .ics file
 */
export function downloadICS(events: ParsedEvent[], courseName: string = 'Course'): void {
  const icsContent = exportToICS(events, courseName);
  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `${courseName.replace(/\s+/g, '_')}_calendar.ics`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Share calendar via Web Share API (mobile)
 */
export async function shareCalendar(events: ParsedEvent[], courseName: string = 'Course'): Promise<boolean> {
  if (!navigator.share) {
    return false;
  }
  
  try {
    const icsContent = exportToICS(events, courseName);
    const blob = new Blob([icsContent], { type: 'text/calendar' });
    const file = new File([blob], `${courseName}_calendar.ics`, { type: 'text/calendar' });
    
    await navigator.share({
      title: `${courseName} Calendar`,
      text: `Calendar events for ${courseName}`,
      files: [file]
    });
    
    return true;
  } catch (error) {
    console.error('Error sharing calendar:', error);
    return false;
  }
}
