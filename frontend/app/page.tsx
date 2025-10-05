'use client';

import { useAuth0 } from '@auth0/auth0-react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useState } from 'react';
import FileUpload from './components/FileUpload';
import PDFViewer from './components/PDFViewer';
import ParsedEventsModal from './components/ParsedEventsModal';
import AnimatedBackground from './components/AnimatedBackground';
import ThemeToggle from './components/ThemeToggle';
import { generateMockParsedData } from './utils/mockData';
import { ParsedSyllabus, ParsedEvent } from './types/syllabus';
import { apiClient, convertBackendToFrontend } from './utils/api';
import { Calendar, FileText, Clock, CheckCircle, Sparkles, Zap, Target, ArrowRight } from 'lucide-react';
import { uploadSyllabus } from './lib/api';

export default function Home() {
  const { user, isLoading } = useAuth0();
  const router = useRouter();
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [showPDFPreview, setShowPDFPreview] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);
  const [showParsedModal, setShowParsedModal] = useState(false);
  const [parsedData, setParsedData] = useState<ParsedSyllabus | null>(null);
  const [savedEvents, setSavedEvents] = useState<ParsedEvent[]>([]);

  useEffect(() => {
    if (!isLoading) {
      if (user) {
        // User is authenticated, redirect to dashboard
        router.push('/dashboard');
      } else {
        // User is not authenticated, redirect to login
        router.push('/login');
      }
    }
  }, [user, isLoading, router]);

  const handleFileSelect = async (file: File) => {
    console.log('📁 File selected:', {
      name: file.name,
      size: file.size,
      type: file.type,
      lastModified: new Date(file.lastModified).toISOString()
    });
    
    setSelectedFile(file);
    setError(undefined);
    
    // Simulate processing
    setIsProcessing(true);
    console.log('⏳ Starting file processing simulation...');
    setTimeout(() => {
      setIsProcessing(false);
      console.log('✅ File processing simulation completed');
    }, 2000);
  };

  const handleFileRemove = () => {
    console.log('🗑️ File removed:', selectedFile?.name);
    setSelectedFile(null);
    setShowPDFPreview(false);
    setError(undefined);
  };

  const handlePreviewPDF = () => {
    if (selectedFile && selectedFile.type === 'application/pdf') {
      console.log('👁️ Opening PDF preview for:', selectedFile.name);
      setShowPDFPreview(true);
    } else {
      console.log('⚠️ Cannot preview non-PDF file:', selectedFile?.type);
    }
  };

  const handleProcessSyllabus = async () => {
    if (!selectedFile) {
      console.log('❌ No file selected for processing');
      return;
    }
    
    console.log('🚀 Starting syllabus processing for:', {
      fileName: selectedFile.name,
      fileSize: selectedFile.size,
      fileType: selectedFile.type
    });
    
    setIsProcessing(true);
    setError(undefined);
    
    try {
      console.log('📤 Uploading file to backend API...');
      
      // Make real API call to backend
      const response = await apiClient.uploadSyllabus(selectedFile);
      
      console.log('📥 Backend response received:', {
        success: response.success,
        hasData: !!response.data,
        message: response.message,
        error: response.error
      });
      
      if (response.success && response.data) {
        console.log('✅ API call successful, converting data...');
        
        // Convert backend response to frontend format
        const parsedData = convertBackendToFrontend(response.data);
        
        console.log('📊 Converted parsed data:', {
          courseName: parsedData.courseName,
          totalEvents: parsedData.totalEvents,
          events: parsedData.events.map(e => ({
            title: e.title,
            type: e.type,
            dueDate: e.dueDate
          }))
        });
        
        setParsedData(parsedData);
        setShowParsedModal(true);
        console.log('🎉 Successfully processed syllabus and opened modal');
      } else {
        throw new Error(response.error || 'Failed to process syllabus');
      }
    } catch (err) {
      console.error('❌ Syllabus processing error:', err);
      setError(err instanceof Error ? err.message : 'Failed to process syllabus. Please try again.');
      
      // Fallback to mock data for demonstration
      console.log('🔄 Falling back to mock data for demonstration');
      const mockData = generateMockParsedData();
      setParsedData(mockData);
      setShowParsedModal(true);
      console.log('📋 Mock data loaded and modal opened');
    } finally {
      setIsProcessing(false);
      console.log('🏁 Syllabus processing completed');
    }
  };

  const handleSaveEvents = (events: ParsedEvent[]) => {
    console.log('💾 Saving events:', {
      totalEvents: events.length,
      events: events.map(e => ({
        id: e.id,
        title: e.title,
        type: e.type,
        dueDate: e.dueDate
      }))
    });
    setSavedEvents(events);
  };

  const handleContinueToCalendar = () => {
    console.log('📅 Continuing to calendar view');
    setShowParsedModal(false);
    // Navigate to calendar page
    window.location.href = '/calendar';
  };

  const handleGoToKanban = () => {
    console.log('📋 Navigating to kanban board');
    window.location.href = '/kanban';
  };

  // Show loading while checking authentication status
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-neon-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white/70">Loading...</p>
        </div>
      </div>
    );
  }

  // This should not render as we redirect immediately
  return null;
}
