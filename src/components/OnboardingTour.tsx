'use client';
import React, { useState, useEffect } from 'react';
import { useToast } from './GlobalToast';

interface TourStep {
  target: string;
  title: string;
  content: string;
  position: 'top' | 'bottom' | 'left' | 'right';
}

const OnboardingTour: React.FC = () => {
  const [isActive, setIsActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [hasSeenTour, setHasSeenTour] = useState(false);
  const { showToast } = useToast();

  const tourSteps: TourStep[] = [
    {
      target: 'main-tools',
      title: '🎉 Welcome to PDF All-in-One!',
      content: 'Your complete PDF toolkit in one place. Let\'s take a quick tour to get you started.',
      position: 'bottom'
    },
    {
      target: 'upload-area',
      title: '📁 Start Here',
      content: 'Simply drag and drop your PDF files here, or click to browse and select files from your device.',
      position: 'top'
    },
    {
      target: 'tool-categories',
      title: '🛠️ Tool Categories',
      content: 'Browse tools by category: Organize, Optimize, Convert, Edit, and Security. Each tool is designed for specific tasks.',
      position: 'bottom'
    },
    {
      target: 'privacy-badge',
      title: '🔒 Privacy First',
      content: 'All processing happens in your browser. Your files never leave your device, ensuring complete privacy.',
      position: 'top'
    },
    {
      target: 'theme-toggle',
      title: '🌙 Dark Mode',
      content: 'Toggle between light and dark themes for a comfortable viewing experience.',
      position: 'left'
    }
  ];

  useEffect(() => {
    const tourSeen = localStorage.getItem('pdf-tour-completed');
    if (!tourSeen) {
      // Show tour after a short delay
      const timer = setTimeout(() => {
        setIsActive(true);
      }, 2000);
      return () => clearTimeout(timer);
    } else {
      setHasSeenTour(true);
    }
  }, []);

  const nextStep = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      completeTour();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const skipTour = () => {
    setIsActive(false);
    localStorage.setItem('pdf-tour-completed', 'true');
    showToast('Tour skipped. You can restart it anytime from the help menu.', 'info');
  };

  const completeTour = () => {
    setIsActive(false);
    localStorage.setItem('pdf-tour-completed', 'true');
    setHasSeenTour(true);
    showToast('🎉 Tour completed! You\'re ready to start working with PDFs.', 'success');
  };

  const restartTour = () => {
    localStorage.removeItem('pdf-tour-completed');
    setCurrentStep(0);
    setIsActive(true);
    setHasSeenTour(false);
  };

  if (!isActive && !hasSeenTour) return null;

  return (
    <>
      {/* Tour overlay */}
      {isActive && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full p-6 shadow-2xl">
            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Step {currentStep + 1} of {tourSteps.length}
                </span>
                <button
                  onClick={skipTour}
                  className="text-gray-400 hover:text-gray-600 text-sm"
                >
                  Skip Tour
                </button>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${((currentStep + 1) / tourSteps.length) * 100}%` }}
                />
              </div>
            </div>

            <div className="text-center mb-6">
              <h3 className="text-xl font-bold mb-2">
                {tourSteps[currentStep].title}
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                {tourSteps[currentStep].content}
              </p>
            </div>

            <div className="flex justify-between">
              <button
                onClick={prevStep}
                disabled={currentStep === 0}
                className="px-4 py-2 text-gray-600 disabled:text-gray-400 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              
              <div className="flex gap-2">
                <button
                  onClick={skipTour}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Skip
                </button>
                <button
                  onClick={nextStep}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                >
                  {currentStep === tourSteps.length - 1 ? 'Finish' : 'Next'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Restart tour button for returning users */}
      {hasSeenTour && (
        <button
          onClick={restartTour}
          className="fixed bottom-20 left-6 z-40 px-3 py-2 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 text-sm font-medium"
          title="Restart Tour"
        >
          🎯 Tour
        </button>
      )}
    </>
  );
};

export default OnboardingTour;
