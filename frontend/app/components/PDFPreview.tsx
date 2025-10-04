'use client';

import { useState, useCallback, useEffect } from 'react';
import { ZoomIn, ZoomOut, RotateCw, Download, ChevronLeft, ChevronRight, X } from 'lucide-react';
import dynamic from 'next/dynamic';

// Dynamically import PDF components to avoid SSR issues
const Document = dynamic(() => import('react-pdf').then(mod => mod.Document), { ssr: false });
const Page = dynamic(() => import('react-pdf').then(mod => mod.Page), { ssr: false });

// Set up PDF.js worker
if (typeof window !== 'undefined') {
  import('react-pdf').then((reactPdf) => {
    reactPdf.pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${reactPdf.pdfjs.version}/build/pdf.worker.min.js`;
  });
}

interface PDFPreviewProps {
  file: File;
  onClose: () => void;
}

export default function PDFPreview({ file, onClose }: PDFPreviewProps) {
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.0);
  const [rotation, setRotation] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isClient, setIsClient] = useState<boolean>(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const onDocumentLoadSuccess = useCallback(({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setLoading(false);
    setError(null);
  }, []);

  const onDocumentLoadError = useCallback((error: Error) => {
    setError('Failed to load PDF. Please try a different file.');
    setLoading(false);
    console.error('PDF load error:', error);
  }, []);

  const goToPrevPage = useCallback(() => {
    setPageNumber(prev => Math.max(prev - 1, 1));
  }, []);

  const goToNextPage = useCallback(() => {
    setPageNumber(prev => Math.min(prev + 1, numPages));
  }, [numPages]);

  const zoomIn = useCallback(() => {
    setScale(prev => Math.min(prev + 0.2, 3.0));
  }, []);

  const zoomOut = useCallback(() => {
    setScale(prev => Math.max(prev - 0.2, 0.5));
  }, []);

  const rotate = useCallback(() => {
    setRotation(prev => (prev + 90) % 360);
  }, []);

  const downloadPDF = useCallback(() => {
    const url = URL.createObjectURL(file);
    const link = document.createElement('a');
    link.href = url;
    link.download = file.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [file]);

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 max-w-md mx-4">
          <div className="flex flex-col items-center space-y-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="text-gray-600">Loading PDF preview...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 max-w-md mx-4">
          <div className="flex flex-col items-center space-y-4">
            <div className="text-red-500 text-center">
              <p className="font-medium">Error loading PDF</p>
              <p className="text-sm text-gray-600 mt-2">{error}</p>
            </div>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center space-x-4">
            <h2 className="text-lg font-semibold text-gray-900">PDF Preview</h2>
            <span className="text-sm text-gray-500">
              Page {pageNumber} of {numPages}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between p-4 border-b bg-gray-50">
          <div className="flex items-center space-x-2">
            <button
              onClick={goToPrevPage}
              disabled={pageNumber <= 1}
              className="p-2 text-gray-600 hover:text-gray-800 disabled:text-gray-300 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={goToNextPage}
              disabled={pageNumber >= numPages}
              className="p-2 text-gray-600 hover:text-gray-800 disabled:text-gray-300 disabled:cursor-not-allowed"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={zoomOut}
              className="p-2 text-gray-600 hover:text-gray-800"
            >
              <ZoomOut className="h-5 w-5" />
            </button>
            <span className="text-sm text-gray-600 min-w-[60px] text-center">
              {Math.round(scale * 100)}%
            </span>
            <button
              onClick={zoomIn}
              className="p-2 text-gray-600 hover:text-gray-800"
            >
              <ZoomIn className="h-5 w-5" />
            </button>
            <button
              onClick={rotate}
              className="p-2 text-gray-600 hover:text-gray-800"
            >
              <RotateCw className="h-5 w-5" />
            </button>
            <button
              onClick={downloadPDF}
              className="p-2 text-gray-600 hover:text-gray-800"
            >
              <Download className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* PDF Content */}
        <div className="flex-1 overflow-auto p-4 bg-gray-100">
          <div className="flex justify-center">
            {isClient ? (
              <Document
                file={file}
                onLoadSuccess={onDocumentLoadSuccess}
                onLoadError={onDocumentLoadError}
                loading={
                  <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                }
              >
                <Page
                  pageNumber={pageNumber}
                  scale={scale}
                  rotate={rotation}
                  className="shadow-lg"
                />
              </Document>
            ) : (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
