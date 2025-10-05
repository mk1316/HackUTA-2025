'use client';

import { useRef } from 'react';

interface FileUploadProps {
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
  onDrop: (e: React.DragEvent<HTMLDivElement>) => void;
}

/**
 * FileUpload component for handling PDF file uploads
 * Supports both drag & drop and click to browse functionality
 */
export default function FileUpload({ onFileChange, onDragOver, onDrop }: FileUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div 
      className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center hover:border-gray-400 dark:hover:border-gray-500 transition-colors"
      onDragOver={onDragOver}
      onDrop={onDrop}
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
          onChange={onFileChange}
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
  );
}
