import { ParsedSyllabus } from '../types/syllabus';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface UploadResponse {
  _id: string;
  course_name: string;
  professor: {
    name: string;
    email?: string;
    office?: string;
  };
  class_schedule: string;
  chapters: Array<{
    title: string;
    topics: string[];
    reading_materials: string[];
  }>;
  homework: Array<{
    title: string;
    due_date: string;
    description: string;
    points: number;
  }>;
  exams: Array<{
    title: string;
    date: string;
    time?: string;
    location?: string;
    description: string;
    points: number;
  }>;
  projects: Array<{
    title: string;
    due_date: string;
    description: string;
    points: number;
  }>;
  academic_dates: string[];
}

class ApiClient {
  private baseUrl: string;
  private authToken: string | null = null;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  setAuthToken(token: string | null) {
    this.authToken = token;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (this.authToken) {
      headers.Authorization = `Bearer ${this.authToken}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.detail || `HTTP ${response.status}: ${response.statusText}`,
        };
      }

      return {
        success: true,
        data: data.data || data,
        message: data.message,
      };
    } catch (error) {
      console.error('API request failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }

  async uploadSyllabus(file: File): Promise<ApiResponse<UploadResponse>> {
    console.log('🌐 API Client: Starting file upload', {
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      baseUrl: this.baseUrl,
      hasAuthToken: !!this.authToken
    });

    const formData = new FormData();
    formData.append('file', file);

    const url = `${this.baseUrl}/upload/`;
    console.log('📡 API Client: Upload URL:', url);
    
    const headers: Record<string, string> = {};
    if (this.authToken) {
      headers.Authorization = `Bearer ${this.authToken}`;
      console.log('🔐 API Client: Auth token included');
    } else {
      console.log('⚠️ API Client: No auth token available');
    }

    try {
      console.log('📤 API Client: Sending POST request...');
      const response = await fetch(url, {
        method: 'POST',
        body: formData,
        headers,
      });

      console.log('📥 API Client: Response received', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
        headers: Object.fromEntries(response.headers.entries())
      });

      const data = await response.json();
      console.log('📊 API Client: Response data:', data);

      if (!response.ok) {
        console.error('❌ API Client: Upload failed', {
          status: response.status,
          error: data.detail || response.statusText
        });
        return {
          success: false,
          error: data.detail || `HTTP ${response.status}: ${response.statusText}`,
        };
      }

      console.log('✅ API Client: Upload successful');
      return {
        success: true,
        data: data.data || data,
        message: data.message,
      };
    } catch (error) {
      console.error('❌ API Client: Upload failed with error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Upload failed',
      };
    }
  }

  async getUploadHistory(): Promise<ApiResponse<UploadResponse[]>> {
    return this.request<UploadResponse[]>('/upload/history');
  }

  async getSyllabus(syllabusId: string): Promise<ApiResponse<UploadResponse>> {
    return this.request<UploadResponse>(`/upload/${syllabusId}`);
  }

  async healthCheck(): Promise<ApiResponse<{ status: string }>> {
    return this.request<{ status: string }>('/health');
  }
}

// Create a singleton instance
export const apiClient = new ApiClient(API_BASE_URL);

// Helper function to convert backend response to frontend format
export function convertBackendToFrontend(backendData: UploadResponse): ParsedSyllabus {
  console.log('🔄 Converting backend data to frontend format:', {
    courseName: backendData.course_name,
    professor: backendData.professor.name,
    homeworkCount: backendData.homework.length,
    examsCount: backendData.exams.length,
    projectsCount: backendData.projects.length
  });

  const events = [
    ...backendData.homework.map((hw, index) => ({
      id: `hw-${index}`,
      title: hw.title,
      type: 'assignment' as const,
      dueDate: hw.due_date,
      dueTime: '23:59',
      description: hw.description,
      points: hw.points,
      weight: 0,
      status: 'pending' as const,
      priority: 'medium' as const,
      courseCode: backendData.course_name,
      location: 'Online',
    })),
    ...backendData.exams.map((exam, index) => ({
      id: `exam-${index}`,
      title: exam.title,
      type: 'exam' as const,
      dueDate: exam.date,
      dueTime: exam.time || '10:00',
      description: exam.description,
      points: exam.points,
      weight: 0,
      status: 'pending' as const,
      priority: 'high' as const,
      courseCode: backendData.course_name,
      location: exam.location || 'TBA',
    })),
    ...backendData.projects.map((project, index) => ({
      id: `project-${index}`,
      title: project.title,
      type: 'project' as const,
      dueDate: project.due_date,
      dueTime: '23:59',
      description: project.description,
      points: project.points,
      weight: 0,
      status: 'pending' as const,
      priority: 'high' as const,
      courseCode: backendData.course_name,
      location: 'Online',
    })),
  ];

  const result = {
    courseName: backendData.course_name,
    courseCode: backendData.course_name,
    instructor: backendData.professor.name,
    semester: 'Fall', // This would need to be extracted from the syllabus
    year: '2024', // This would need to be extracted from the syllabus
    events,
    totalEvents: events.length,
    parsedAt: new Date().toISOString(),
  };

  console.log('✅ Data conversion completed:', {
    courseName: result.courseName,
    totalEvents: result.totalEvents,
    eventTypes: {
      assignments: events.filter(e => e.type === 'assignment').length,
      exams: events.filter(e => e.type === 'exam').length,
      projects: events.filter(e => e.type === 'project').length
    }
  });

  return result;
}
