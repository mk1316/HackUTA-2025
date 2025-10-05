'use client';

import { useState, useRef } from 'react';
import FileUpload from './components/FileUpload';
import FileInfo from './components/FileInfo';
import ProcessButton from './components/ProcessButton';
import ErrorDisplay from './components/ErrorDisplay';
import SyllabusResults from './components/SyllabusResults';
import HumorousSummary from './components/HumorousSummary';

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
  
  // State for humorous summary
  const [humorousSummary, setHumorousSummary] = useState<string>('');
  const [isGeneratingHumorous, setIsGeneratingHumorous] = useState<boolean>(false);
  
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

  /**
   * Generates a humorous summary of the syllabus
   */
  const handleGenerateHumorousSummary = async (): Promise<void> => {
    if (!file) return;

    setIsGeneratingHumorous(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/generate-humorous-summary', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to generate humorous summary');
      }

      const data = await response.json();
      setHumorousSummary(data.result);

      // Immediately trigger audio generation with a single success/failure log
      try {
        const audioResponse = await fetch('/api/generate-audio', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ text: data.result }),
        });
        if (audioResponse.ok) {
          console.log('Audio generation: success');
        } else {
          console.log('Audio generation: failed');
        }
      } catch {
        console.log('Audio generation: failed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsGeneratingHumorous(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <div className="w-full max-w-2xl">
        <div className="space-y-6">
          {/* File Upload Component */}
          <FileUpload
            onFileChange={handleFileChange}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          />

          {/* Selected File Information - Shows when file is uploaded */}
          {file && (
            <FileInfo
              file={file}
              onRemove={clearFile}
            />
          )}

          {/* Process Button - Only shows when file is selected */}
          {file && (
            <ProcessButton
              isProcessing={isProcessing}
              onProcess={handleProcessFile}
            />
          )}

          {/* Error Display - Shows when processing fails */}
          <ErrorDisplay error={error} />

          {/* Result Display - Shows structured syllabus data */}
          {result && (
            <SyllabusResults 
              result={result} 
              onGenerateHumorousSummary={handleGenerateHumorousSummary}
            />
          )}

          {/* Humorous Summary Display */}
          <HumorousSummary
            summary={humorousSummary}
            isGenerating={isGeneratingHumorous}
            onGenerate={handleGenerateHumorousSummary}
          />
        </div>
      </div>
    </div>
  );
}
