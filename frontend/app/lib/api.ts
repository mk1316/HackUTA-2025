/**
 * API Service Layer
 * Handles all API calls to the backend
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Upload and process a syllabus PDF
 */
export async function uploadSyllabus(file: File): Promise<ApiResponse<any>> {
  try {
    const formData = new FormData();
    formData.append('files', file);

    const response = await fetch(`${API_URL}/parse`, {
      method: 'POST',
      body: formData,
      // Add auth header if you have a token
      // headers: {
      //   'Authorization': `Bearer ${token}`
      // }
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: 'Upload failed' }));
      throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return {
      success: data.success || true,
      data: data.data || data
    };
  } catch (error) {
    console.error('Upload error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to upload syllabus'
    };
  }
}

/**
 * Get syllabus upload history
 */
export async function getSyllabusHistory(): Promise<ApiResponse<any[]>> {
  try {
    const response = await fetch(`${API_URL}/upload/history`, {
      method: 'GET',
      // Add auth header if needed
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return {
      success: true,
      data: data
    };
  } catch (error) {
    console.error('History fetch error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch history'
    };
  }
}

/**
 * Get a specific syllabus by ID
 */
export async function getSyllabusById(id: string): Promise<ApiResponse<any>> {
  try {
    const response = await fetch(`${API_URL}/upload/${id}`, {
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return {
      success: true,
      data: data
    };
  } catch (error) {
    console.error('Fetch syllabus error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch syllabus'
    };
  }
}

/**
 * Sync events to Google Calendar
 */
export async function syncToCalendar(syllabusId: string): Promise<ApiResponse<any>> {
  try {
    const response = await fetch(`${API_URL}/calendar/sync/${syllabusId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: 'Sync failed' }));
      throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return {
      success: true,
      data: data
    };
  } catch (error) {
    console.error('Calendar sync error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to sync to calendar'
    };
  }
}

/**
 * Get calendar events
 */
export async function getCalendarEvents(): Promise<ApiResponse<any[]>> {
  try {
    const response = await fetch(`${API_URL}/calendar/events`, {
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return {
      success: true,
      data: data
    };
  } catch (error) {
    console.error('Fetch events error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch events'
    };
  }
}

/**
 * Delete a calendar event
 */
export async function deleteCalendarEvent(eventId: string): Promise<ApiResponse<void>> {
  try {
    const response = await fetch(`${API_URL}/calendar/events/${eventId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return {
      success: true
    };
  } catch (error) {
    console.error('Delete event error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete event'
    };
  }
}

/**
 * Get current user profile
 */
export async function getUserProfile(token: string): Promise<ApiResponse<any>> {
  try {
    const response = await fetch(`${API_URL}/auth/me`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return {
      success: true,
      data: data
    };
  } catch (error) {
    console.error('Get profile error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch profile'
    };
  }
}

/**
 * Update user preferences
 */
export async function updateUserPreferences(
  token: string,
  preferences: any
): Promise<ApiResponse<any>> {
  try {
    const response = await fetch(`${API_URL}/auth/preferences`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(preferences)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return {
      success: true,
      data: data
    };
  } catch (error) {
    console.error('Update preferences error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update preferences'
    };
  }
}
