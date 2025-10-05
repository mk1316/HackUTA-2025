'use client';

interface SyllabusData {
  course_name?: string;
  course_code?: string;
  professor?: {
    name?: string;
    email?: string;
    office_hours?: string;
  };
  class_schedule?: string;
  homework?: Array<{
    title: string;
    due_date: string;
    description?: string;
  }>;
  exams?: Array<{
    type: string;
    date: string;
    description?: string;
  }>;
  projects?: Array<{
    title: string;
    due_date: string;
    description?: string;
  }>;
}

interface SyllabusResultsProps {
  result: SyllabusData;
  onGenerateHumorousSummary: () => void;
}

/**
 * Get event type icon based on event type
 */
const getEventIcon = (type: string) => {
  const lowerType = type.toLowerCase();
  if (lowerType.includes('exam') || lowerType.includes('midterm') || lowerType.includes('final')) {
    return (
      <div className="w-8 h-8 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
        <svg className="w-4 h-4 text-red-600 dark:text-red-400" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
      </div>
    );
  } else if (lowerType.includes('assignment') || lowerType.includes('homework') || lowerType.includes('hw')) {
    return (
      <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
        <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
        </svg>
      </div>
    );
  } else if (lowerType.includes('quiz')) {
    return (
      <div className="w-8 h-8 bg-yellow-100 dark:bg-yellow-900/20 rounded-full flex items-center justify-center">
        <svg className="w-4 h-4 text-yellow-600 dark:text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
        </svg>
      </div>
    );
  } else if (lowerType.includes('project')) {
    return (
      <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center">
        <svg className="w-4 h-4 text-purple-600 dark:text-purple-400" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
        </svg>
      </div>
    );
  } else {
    return (
      <div className="w-8 h-8 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
        <svg className="w-4 h-4 text-green-600 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
        </svg>
      </div>
    );
  }
};

/**
 * Get event type color dot
 */
const getEventTypeDot = (type: string) => {
  const lowerType = type.toLowerCase();
  if (lowerType.includes('exam') || lowerType.includes('midterm') || lowerType.includes('final')) {
    return 'bg-red-500';
  } else if (lowerType.includes('assignment') || lowerType.includes('homework') || lowerType.includes('hw')) {
    return 'bg-blue-500';
  } else if (lowerType.includes('quiz')) {
    return 'bg-yellow-500';
  } else if (lowerType.includes('project')) {
    return 'bg-purple-500';
  } else {
    return 'bg-green-500';
  }
};

/**
 * Format date for display
 */
const formatDate = (dateString: string) => {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  } catch {
    return dateString;
  }
};

/**
 * SyllabusResults component displays the extracted syllabus data
 * Shows course info, assignments, exams, and projects in organized sections
 */
export default function SyllabusResults({ result, onGenerateHumorousSummary }: SyllabusResultsProps) {
  if (!result) return null;

  // Combine all events into a single array
  const allEvents = [
    ...(result.homework?.map(item => ({ ...item, type: 'Assignment' })) || []),
    ...(result.exams?.map(item => ({ ...item, type: item.type || 'Exam' })) || []),
    ...(result.projects?.map(item => ({ ...item, type: 'Project' })) || [])
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            Review Parsed Events
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {result.course_name} • {result.course_code}
          </p>
        </div>
        <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Events List */}
      <div className="max-h-96 overflow-y-auto">
        {allEvents.length > 0 ? (
          <div className="space-y-0">
            {allEvents.map((event, index) => (
              <div key={index} className="flex items-center p-4 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                {/* Event Icon */}
                <div className="flex-shrink-0 mr-4">
                  {getEventIcon(event.type)}
                </div>

                {/* Event Details */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                    {'title' in event ? event.title : event.type}
                  </h3>
                  <div className="flex items-center space-x-4 mt-1 text-xs text-gray-500 dark:text-gray-400">
                    <div className="flex items-center">
                      <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                      </svg>
                      {formatDate(('due_date' in event ? event.due_date : event.date) || '')}
                    </div>
                  </div>
                </div>

                {/* Action Icons */}
                <div className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${getEventTypeDot(event.type)}`}></div>
                  <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                    </svg>
                  </button>
                  <button className="text-gray-400 hover:text-red-600 dark:hover:text-red-400">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" clipRule="evenodd" />
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center text-gray-500 dark:text-gray-400">
            No events found in the syllabus
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
        <div className="flex items-center space-x-2">
          <button className="inline-flex items-center px-3 py-1 text-sm font-medium text-green-700 bg-green-100 dark:bg-green-900/20 dark:text-green-400 rounded-md hover:bg-green-200 dark:hover:bg-green-900/30">
            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Add Event
          </button>
          <button 
            onClick={onGenerateHumorousSummary}
            className="inline-flex items-center px-3 py-1 text-sm font-medium text-purple-700 bg-purple-100 dark:bg-purple-900/20 dark:text-purple-400 rounded-md hover:bg-purple-200 dark:hover:bg-purple-900/30"
          >
            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            😂 Funny Summary
          </button>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {allEvents.length} events found
          </span>
        </div>
        <div className="flex items-center space-x-3">
          <button className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-md hover:bg-gray-50 dark:hover:bg-gray-500">
            Cancel
          </button>
          <button className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md">
            Continue to Calendar
          </button>
        </div>
      </div>
    </div>
  );
}
