'use client';

import { useState } from 'react';
import FileUpload from './components/FileUpload';
import PDFViewer from './components/PDFViewer';
import ParsedEventsModal from './components/ParsedEventsModal';
import AnimatedBackground from './components/AnimatedBackground';
import { generateMockParsedData } from './utils/mockData';
import { ParsedSyllabus, ParsedEvent } from './types/syllabus';
import { apiClient, convertBackendToFrontend } from './utils/api';
import { Calendar, FileText, Clock, CheckCircle, Sparkles, Zap, Target, ArrowRight } from 'lucide-react';
import { uploadSyllabus } from './lib/api';

export default function Home() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [showPDFPreview, setShowPDFPreview] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);
  const [showParsedModal, setShowParsedModal] = useState(false);
  const [parsedData, setParsedData] = useState<ParsedSyllabus | null>(null);
  const [savedEvents, setSavedEvents] = useState<ParsedEvent[]>([]);

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
      
      console.log('Successfully processed syllabus:', selectedFile.name);
    } catch (err) {
      console.error('Error processing syllabus:', err);
      setError(err instanceof Error ? err.message : 'Failed to process syllabus. Please try again.');
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

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated Background */}
      <AnimatedBackground />
      
      {/* Header */}
      <header className="relative z-10 glassmorphism border-b border-white border-opacity-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl blur-lg opacity-75 animate-pulse-glow" />
                <Calendar className="relative h-10 w-10 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold gradient-text">Syllabus to Calendar</h1>
                <p className="text-sm text-white text-opacity-80 flex items-center">
                  <Sparkles className="h-4 w-4 mr-1" />
                  Transform your course syllabus into a smart calendar
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2 text-sm text-white text-opacity-80 glassmorphism px-4 py-2 rounded-full">
              <CheckCircle className="h-4 w-4" />
              <span>HackUTA 2025</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Upload Section */}
          <div className="mb-12">
            <div className="text-center mb-12">
              <div className="inline-flex items-center space-x-2 mb-6">
                <Zap className="h-6 w-6 text-yellow-400 animate-pulse" />
                <span className="text-yellow-400 font-semibold text-sm uppercase tracking-wider">AI-Powered</span>
                <Zap className="h-6 w-6 text-yellow-400 animate-pulse" />
              </div>
              <h2 className="text-5xl font-bold text-white mb-6">
                Upload Your <span className="gradient-text">Syllabus</span>
              </h2>
              <p className="text-xl text-white text-opacity-90 max-w-3xl mx-auto leading-relaxed">
                Upload your course syllabus and we'll automatically extract important dates, 
                assignments, and deadlines to create a personalized calendar.
              </p>
            </div>

            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl blur-xl opacity-30 animate-pulse-glow" />
              <div className="relative glassmorphism rounded-2xl p-8">
                <FileUpload
                  onFileSelect={handleFileSelect}
                  onFileRemove={handleFileRemove}
                  selectedFile={selectedFile}
                  isProcessing={isProcessing}
                  error={error}
                />
              </div>
            </div>
          </div>

          {/* File Actions */}
          {selectedFile && !isProcessing && (
            <div className="flex flex-col sm:flex-row gap-6 justify-center mb-12">
              {selectedFile.type === 'application/pdf' && (
                <button
                  onClick={handlePreviewPDF}
                  className="group flex items-center justify-center px-8 py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/25"
                >
                  <FileText className="h-5 w-5 mr-3 group-hover:animate-pulse" />
                  <span className="font-semibold">Preview PDF</span>
                  <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </button>
              )}
              <button
                onClick={handleProcessSyllabus}
                className="group flex items-center justify-center px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-green-500/25 shimmer-effect"
              >
                <Clock className="h-5 w-5 mr-3 group-hover:animate-spin" />
                <span className="font-semibold">Process Syllabus</span>
                <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          )}

          {/* Features Preview */}
          <div className="grid md:grid-cols-3 gap-8 mt-20">
            <div className="group glassmorphism rounded-2xl p-8 card-hover">
              <div className="flex items-center mb-6">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-blue-600 rounded-xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity" />
                  <div className="relative p-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl">
                    <FileText className="h-8 w-8 text-white" />
                  </div>
                </div>
                <h3 className="text-xl font-bold text-white ml-4">Smart Parsing</h3>
              </div>
              <p className="text-white text-opacity-80 leading-relaxed">
                Automatically extract assignments, due dates, and important events from your syllabus using advanced AI.
              </p>
              <div className="mt-4 flex items-center text-blue-300 text-sm font-medium">
                <Target className="h-4 w-4 mr-2" />
                <span>99% Accuracy</span>
              </div>
            </div>

            <div className="group glassmorphism rounded-2xl p-8 card-hover">
              <div className="flex items-center mb-6">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-600 rounded-xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity" />
                  <div className="relative p-3 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl">
                    <Calendar className="h-8 w-8 text-white" />
                  </div>
                </div>
                <h3 className="text-xl font-bold text-white ml-4">Calendar Integration</h3>
              </div>
              <p className="text-white text-opacity-80 leading-relaxed">
                Export to Google Calendar, Outlook, or download as iCal files for seamless integration.
              </p>
              <div className="mt-4 flex items-center text-green-300 text-sm font-medium">
                <Sparkles className="h-4 w-4 mr-2" />
                <span>Multi-Platform</span>
              </div>
            </div>

            <div className="group glassmorphism rounded-2xl p-8 card-hover">
              <div className="flex items-center mb-6">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-600 rounded-xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity" />
                  <div className="relative p-3 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl">
                    <Clock className="h-8 w-8 text-white" />
                  </div>
                </div>
                <h3 className="text-xl font-bold text-white ml-4">Deadline Management</h3>
              </div>
              <p className="text-white text-opacity-80 leading-relaxed">
                Visual kanban board to manage and reschedule assignments with intuitive drag-and-drop.
              </p>
              <div className="mt-4 flex items-center justify-between">
                <div className="flex items-center text-purple-300 text-sm font-medium">
                  <Zap className="h-4 w-4 mr-2" />
                  <span>Drag & Drop</span>
                </div>
                <button
                  onClick={handleGoToKanban}
                  className="px-4 py-2 bg-purple-500 bg-opacity-20 text-purple-200 rounded-lg hover:bg-opacity-30 transition-colors text-sm font-medium"
                >
                  Try Kanban →
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* PDF Preview Modal */}
      {showPDFPreview && selectedFile && (
        <PDFViewer
          file={selectedFile}
          onClose={() => setShowPDFPreview(false)}
        />
      )}

      {/* Parsed Events Modal */}
      <ParsedEventsModal
        isOpen={showParsedModal}
        onClose={() => setShowParsedModal(false)}
        parsedData={parsedData}
        onSave={handleSaveEvents}
        onContinue={handleContinueToCalendar}
      />
    </div>
  );
}
