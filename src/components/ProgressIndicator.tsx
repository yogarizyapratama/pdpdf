'use client';
import React from 'react';

interface ProgressIndicatorProps {
  progress: number;
  status: 'uploading' | 'processing' | 'complete' | 'error';
  fileName?: string;
  stage?: string;
}

const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  progress,
  status,
  fileName,
  stage
}) => {
  const getStatusIcon = () => {
    switch (status) {
      case 'uploading':
        return '📤';
      case 'processing':
        return '⚙️';
      case 'complete':
        return '✅';
      case 'error':
        return '❌';
      default:
        return '📄';
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'uploading':
        return 'bg-blue-600';
      case 'processing':
        return 'bg-yellow-600';
      case 'complete':
        return 'bg-green-600';
      case 'error':
        return 'bg-red-600';
      default:
        return 'bg-gray-600';
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'uploading':
        return 'Uploading...';
      case 'processing':
        return stage || 'Processing...';
      case 'complete':
        return 'Complete!';
      case 'error':
        return 'Error occurred';
      default:
        return 'Ready';
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-lg border dark:border-gray-700">
      <div className="flex items-center gap-3 mb-3">
        <span className="text-2xl">{getStatusIcon()}</span>
        <div className="flex-1">
          <div className="font-medium text-sm truncate">
            {fileName || 'Processing file...'}
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400">
            {getStatusText()}
          </div>
        </div>
        <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {Math.round(progress)}%
        </div>
      </div>

      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
        <div
          className={`h-2 rounded-full transition-all duration-300 ${getStatusColor()}`}
          style={{ width: `${Math.min(progress, 100)}%` }}
        />
      </div>

      {stage && status === 'processing' && (
        <div className="mt-2 text-xs text-gray-600 dark:text-gray-400">
          {stage}
        </div>
      )}

      {/* Animated processing indicator */}
      {status === 'processing' && (
        <div className="flex items-center gap-1 mt-2">
          <div className="flex gap-1">
            <div className="w-1 h-1 bg-yellow-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <div className="w-1 h-1 bg-yellow-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <div className="w-1 h-1 bg-yellow-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
          <span className="text-xs text-gray-600 dark:text-gray-400 ml-2">
            Working on it...
          </span>
        </div>
      )}
    </div>
  );
};

export default ProgressIndicator;
