import React from 'react';

interface StatusMessageProps {
  success?: string;
  error?: string;
  onDismiss?: () => void;
}

export default function StatusMessage({ success, error, onDismiss }: StatusMessageProps) {
  if (!success && !error) return null;
  
  return (
    <div className="mb-4">
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded relative" role="alert">
          <span className="block sm:inline">{success}</span>
          {onDismiss && (
            <button
              type="button"
              className="absolute top-0 bottom-0 right-0 px-4 py-3"
              onClick={onDismiss}
            >
              <span className="sr-only">Dismiss</span>
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"></path>
              </svg>
            </button>
          )}
        </div>
      )}
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded relative" role="alert">
          <span className="block sm:inline">{error}</span>
          {onDismiss && (
            <button
              type="button"
              className="absolute top-0 bottom-0 right-0 px-4 py-3"
              onClick={onDismiss}
            >
              <span className="sr-only">Dismiss</span>
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"></path>
              </svg>
            </button>
          )}
        </div>
      )}
    </div>
  );
}