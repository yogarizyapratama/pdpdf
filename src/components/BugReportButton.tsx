'use client';
import React from 'react';
import { useToast } from './GlobalToast';

const BugReportButton: React.FC = () => {
  const { showToast } = useToast();
  const handleClick = () => {
    showToast('Bug report submitted! Thank you for helping us improve.', 'success');
  };
  return (
    <button
      onClick={handleClick}
      className="fixed bottom-6 right-6 z-50 px-4 py-2 bg-red-600 text-white rounded-full shadow-lg hover:bg-red-700 font-semibold"
      title="Report a Bug"
    >
      🐞 Report a Bug
    </button>
  );
};

export default BugReportButton;
