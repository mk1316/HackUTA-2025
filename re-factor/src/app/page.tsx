'use client';

import { useState, useRef } from 'react';

/**
 * Main component for PDF upload and AI processing
 * Handles file upload, drag & drop, and displays AI-generated summaries
 */
export default function Home() {
  // State management for file upload and processing
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string>('');
  
  // Ref for the hidden file input element
  const fileInputRef = useRef<HTMLInputElement>(null);

  /**
   * Handles file selection from the file input
   * @param e - File input change event
   */
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      // Clear previous results and errors when new file is selected
      setResult('');
      setError('');
    }
  };

  /**
   * Prevents default drag behavior to allow custom drop handling
   * @param e - Drag over event
   */
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>): void => {
    e.preventDefault();
  };

  /**
   * Handles file drop from drag and drop interface
   * @param e - Drop event
   */
  const handleDrop = (e: React.DragEvent<HTMLDivElement>): void => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      setFile(droppedFile);
      // Clear previous results and errors when new file is dropped
      setResult('');
      setError('');
    }
  };

  /**
   * Processes the uploaded PDF file with Gemini AI
   * Sends file to backend API and handles response
   */
  const handleProcessFile = async (): Promise<void> => {
    if (!file) return;

    setIsProcessing(true);
    setError('');
    setResult('');

    try {
      // Create FormData to send file to API
      const formData = new FormData();
      formData.append('file', file);

      // Send POST request to process-pdf API endpoint
      const response = await fetch('/api/process-pdf', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to process file');
      }

      const data = await response.json();
      setResult(data.result);
    } catch (err) {
      // Handle errors gracefully with user-friendly messages
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsProcessing(false);
    }
  };

  /**
   * Clears the selected file and resets the file input
   */
  const clearFile = (): void => {
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <div className="w-full max-w-2xl">
        <div className="space-y-6">
          {/* File Upload Area - Drag and drop interface */}
          <div 
            className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center hover:border-gray-400 dark:hover:border-gray-500 transition-colors"
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            <div className="space-y-4">
              {/* Upload icon */}
              <div className="mx-auto w-12 h-12 text-gray-400">
                <svg
                  className="w-full h-full"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  />
                </svg>
              </div>
              
              {/* Upload instructions */}
              <div>
                <p className="text-lg font-medium text-gray-900 dark:text-gray-100">
                  Upload a Syllabus PDF
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Extract assignments, exams, and important dates automatically
                </p>
              </div>
              
              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                id="file-upload"
                accept=".pdf"
                onChange={handleFileChange}
              />
              
              {/* File selection button */}
              <label
                htmlFor="file-upload"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 cursor-pointer"
              >
                Choose Syllabus PDF
              </label>
            </div>
          </div>

          {/* Selected File Information - Shows when file is uploaded */}
          {file && (
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {/* PDF icon */}
                  <div className="w-8 h-8 text-red-500">
                    <svg fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                    </svg>
                  </div>
                  
                  {/* File details */}
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {file.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                
                {/* Remove file button */}
                <button
                  onClick={clearFile}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  aria-label="Remove file"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          )}

          {/* Process Button - Only shows when file is selected */}
          {file && (
            <div className="text-center">
              <button
                onClick={handleProcessFile}
                disabled={isProcessing}
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? (
                  <>
                    {/* Loading spinner */}
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </>
                ) : (
                  'Extract Syllabus Data'
                )}
              </button>
            </div>
          )}

          {/* Error Display - Shows when processing fails */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  {/* Error icon */}
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                    Error
                  </h3>
                  <div className="mt-2 text-sm text-red-700 dark:text-red-300">
                    {error}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Result Display - Shows structured syllabus data */}
          {result && (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6">
              <div className="flex items-center mb-4">
                <div className="flex-shrink-0">
                  {/* Success icon */}
                  <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-lg font-medium text-green-800 dark:text-green-200">
                    Syllabus Extracted Successfully!
                  </h3>
                </div>
              </div>
              
              {/* Course Information */}
              <div className="space-y-4">
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                    {result.course_name} ({result.course_code})
                  </h4>
                  {result.professor && (
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      <p><strong>Professor:</strong> {result.professor.name}</p>
                      {result.professor.email && <p><strong>Email:</strong> {result.professor.email}</p>}
                      {result.professor.office_hours && <p><strong>Office Hours:</strong> {result.professor.office_hours}</p>}
                    </div>
                  )}
                  {result.class_schedule && (
                    <div className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                      <p><strong>Schedule:</strong> {result.class_schedule}</p>
                    </div>
                  )}
                </div>

                {/* Homework/Assignments */}
                {result.homework && result.homework.length > 0 && (
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">📝 Assignments</h4>
                    <div className="space-y-2">
                      {result.homework.map((assignment: any, index: number) => (
                        <div key={index} className="border-l-4 border-blue-500 pl-3">
                          <p className="font-medium text-gray-900 dark:text-gray-100">{assignment.title}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Due: {assignment.due_date}</p>
                          {assignment.description && (
                            <p className="text-sm text-gray-500 dark:text-gray-500">{assignment.description}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Exams */}
                {result.exams && result.exams.length > 0 && (
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">📚 Exams</h4>
                    <div className="space-y-2">
                      {result.exams.map((exam: any, index: number) => (
                        <div key={index} className="border-l-4 border-red-500 pl-3">
                          <p className="font-medium text-gray-900 dark:text-gray-100">{exam.type}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Date: {exam.date}</p>
                          {exam.description && (
                            <p className="text-sm text-gray-500 dark:text-gray-500">{exam.description}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Projects */}
                {result.projects && result.projects.length > 0 && (
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">🚀 Projects</h4>
                    <div className="space-y-2">
                      {result.projects.map((project: any, index: number) => (
                        <div key={index} className="border-l-4 border-green-500 pl-3">
                          <p className="font-medium text-gray-900 dark:text-gray-100">{project.title}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Due: {project.due_date}</p>
                          {project.description && (
                            <p className="text-sm text-gray-500 dark:text-gray-500">{project.description}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
