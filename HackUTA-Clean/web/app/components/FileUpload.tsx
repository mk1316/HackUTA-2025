'use client';

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, X, AlertCircle } from 'lucide-react';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  onFileRemove: () => void;
  selectedFile: File | null;
  isProcessing?: boolean;
  error?: string;
}

export default function FileUpload({ 
  onFileSelect, 
  onFileRemove, 
  selectedFile, 
  isProcessing = false,
  error 
}: FileUploadProps) {
  const [dragActive, setDragActive] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      onFileSelect(acceptedFiles[0]);
    }
  }, [onFileSelect]);

  const { getRootProps, getInputProps, isDragReject } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt']
    },
    maxFiles: 1,
    onDragEnter: () => setDragActive(true),
    onDragLeave: () => setDragActive(false),
    onDropAccepted: () => setDragActive(false),
    onDropRejected: () => setDragActive(false)
  });

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (selectedFile) {
    return (
      <div className="w-full max-w-2xl mx-auto">
        <div className="glassmorphism border-2 border-green-400 border-opacity-50 rounded-2xl p-8 shadow-2xl">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-500 rounded-xl blur-lg opacity-50 animate-pulse-glow" />
                <FileText className="relative h-10 w-10 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-white text-lg">{selectedFile.name}</h3>
                <p className="text-sm text-white text-opacity-70">{formatFileSize(selectedFile.size)}</p>
              </div>
            </div>
            <button
              onClick={onFileRemove}
              className="p-3 text-white text-opacity-60 hover:text-red-400 hover:bg-red-500 hover:bg-opacity-20 rounded-xl transition-all duration-300"
              disabled={isProcessing}
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          
          {isProcessing && (
            <div className="flex items-center space-x-3 text-blue-300">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-300"></div>
              <span className="text-sm font-medium">Processing syllabus...</span>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all duration-300 glassmorphism
          ${dragActive 
            ? 'border-blue-400 border-opacity-60 bg-blue-500 bg-opacity-10' 
            : isDragReject 
            ? 'border-red-400 border-opacity-60 bg-red-500 bg-opacity-10' 
            : 'border-white border-opacity-30 hover:border-white hover:border-opacity-50'
          }
          ${isProcessing ? 'pointer-events-none opacity-50' : ''}
        `}
      >
        <input {...getInputProps()} />
        
        <div className="flex flex-col items-center space-y-6">
          <div className={`
            p-6 rounded-full transition-all duration-300
            ${dragActive 
              ? 'bg-blue-500 bg-opacity-20 animate-pulse-glow' 
              : isDragReject 
              ? 'bg-red-500 bg-opacity-20' 
              : 'bg-white bg-opacity-10 hover:bg-opacity-20'
            }
          `}>
            <Upload className={`
              h-12 w-12 transition-all duration-300
              ${dragActive ? 'text-blue-300' : isDragReject ? 'text-red-300' : 'text-white'}
            `} />
          </div>
          
          <div>
            <h3 className="text-2xl font-bold text-white mb-3">
              {isDragReject ? 'Invalid file type' : 'Upload your syllabus'}
            </h3>
            <p className="text-white text-opacity-80 mb-4 text-lg">
              Drag and drop your syllabus file here, or click to browse
            </p>
            <p className="text-sm text-white text-opacity-60">
              Supports PDF, DOC, DOCX, and TXT files
            </p>
          </div>
        </div>
      </div>
      
      {error && (
        <div className="mt-6 flex items-center space-x-3 text-red-300 glassmorphism p-4 rounded-xl">
          <AlertCircle className="h-5 w-5" />
          <span className="text-sm font-medium">{error}</span>
        </div>
      )}
    </div>
  );
}
