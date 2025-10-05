'use client';

interface ProcessButtonProps {
  isProcessing: boolean;
  onProcess: () => void;
}

/**
 * ProcessButton component handles the file processing action
 * Shows loading state during processing
 */
export default function ProcessButton({ isProcessing, onProcess }: ProcessButtonProps) {
  return (
    <div className="text-center">
      <button
        onClick={onProcess}
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
  );
}
