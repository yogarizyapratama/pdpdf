'use client';
import React from 'react';

interface PDFErrorDisplayProps {
  error: string;
  onRetry?: () => void;
  suggestions?: string[];
}

const PDFErrorDisplay: React.FC<PDFErrorDisplayProps> = ({ 
  error, 
  onRetry, 
  suggestions = [] 
}) => {
  const getErrorIcon = () => {
    if (error.toLowerCase().includes('password') || error.toLowerCase().includes('encrypted')) {
      return '🔒';
    }
    if (error.toLowerCase().includes('corrupted') || error.toLowerCase().includes('invalid')) {
      return '🚫';
    }
    if (error.toLowerCase().includes('large') || error.toLowerCase().includes('size')) {
      return '📏';
    }
    return '⚠️';
  };

  const getDefaultSuggestions = () => {
    const defaultSuggestions = [];
    
    if (error.toLowerCase().includes('password') || error.toLowerCase().includes('encrypted')) {
      defaultSuggestions.push('Use our "Unlock PDF" tool to remove password protection first');
      defaultSuggestions.push('Contact the PDF creator for the password');
    } else if (error.toLowerCase().includes('corrupted') || error.toLowerCase().includes('invalid')) {
      defaultSuggestions.push('Try opening the PDF in another application to verify it works');
      defaultSuggestions.push('Re-download the PDF file if possible');
      defaultSuggestions.push('Convert the file to PDF using our conversion tools');
    } else if (error.toLowerCase().includes('large') || error.toLowerCase().includes('size')) {
      defaultSuggestions.push('Use our "Compress PDF" tool to reduce file size first');
      defaultSuggestions.push('Split the PDF into smaller sections using another tool');
    } else {
      defaultSuggestions.push('Ensure the file has a .pdf extension');
      defaultSuggestions.push('Try uploading a different PDF file');
      defaultSuggestions.push('Check if the file downloaded completely');
    }
    
    return defaultSuggestions;
  };

  const allSuggestions = suggestions.length > 0 ? suggestions : getDefaultSuggestions();

  return (
    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
      <div className="flex items-start gap-3">
        <span className="text-2xl">{getErrorIcon()}</span>
        <div className="flex-1">
          <h3 className="font-semibold text-red-800 dark:text-red-200 mb-2">
            PDF Processing Error
          </h3>
          <p className="text-red-700 dark:text-red-300 mb-3">
            {error}
          </p>
          
          {allSuggestions.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium text-red-800 dark:text-red-200 text-sm">
                💡 Try these solutions:
              </h4>
              <ul className="space-y-1">
                {allSuggestions.map((suggestion, index) => (
                  <li key={index} className="text-sm text-red-600 dark:text-red-400 flex items-start gap-2">
                    <span className="text-red-400 mt-1">•</span>
                    <span>{suggestion}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {onRetry && (
            <button
              onClick={onRetry}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm font-medium"
            >
              Try Another File
            </button>
          )}
        </div>
      </div>

      <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded border border-blue-200 dark:border-blue-800">
        <div className="flex items-start gap-2">
          <span className="text-blue-600 dark:text-blue-400">ℹ️</span>
          <div className="text-sm text-blue-700 dark:text-blue-300">
            <strong>Need help?</strong> Our tools work best with:
            <ul className="mt-1 ml-4 space-y-1">
              <li>• Standard PDF files (not scanned images)</li>
              <li>• Unprotected/unlocked PDFs</li>
              <li>• Files smaller than 100MB</li>
              <li>• PDFs with valid structure</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PDFErrorDisplay;
