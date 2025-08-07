'use client';
import React, { useEffect, useState } from 'react';
import { useToast } from './GlobalToast';

interface Shortcut {
  key: string;
  description: string;
  action: () => void;
}

const KeyboardShortcuts: React.FC = () => {
  const [showShortcuts, setShowShortcuts] = useState(false);
  const { showToast } = useToast();

  const shortcuts: Shortcut[] = [
    {
      key: 'Ctrl/Cmd + U',
      description: 'Upload files',
      action: () => {
        const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
        if (fileInput) {
          fileInput.click();
        }
      }
    },
    {
      key: 'Ctrl/Cmd + M',
      description: 'Merge PDFs',
      action: () => {
        window.location.href = '/merge-pdf';
      }
    },
    {
      key: 'Ctrl/Cmd + S',
      description: 'Split PDF',
      action: () => {
        window.location.href = '/split-pdf';
      }
    },
    {
      key: 'Ctrl/Cmd + K',
      description: 'Compress PDF',
      action: () => {
        window.location.href = '/compress-pdf';
      }
    },
    {
      key: 'Ctrl/Cmd + H',
      description: 'Show/Hide shortcuts',
      action: () => {
        setShowShortcuts(!showShortcuts);
      }
    },
    {
      key: 'Ctrl/Cmd + T',
      description: 'Toggle theme',
      action: () => {
        const themeButton = document.querySelector('[data-theme-toggle]') as HTMLButtonElement;
        if (themeButton) {
          themeButton.click();
        }
      }
    },
    {
      key: 'Escape',
      description: 'Close modals/dialogs',
      action: () => {
        const closeButtons = document.querySelectorAll('[data-close-modal]');
        closeButtons.forEach(button => (button as HTMLButtonElement).click());
      }
    }
  ];

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isCtrlOrCmd = e.ctrlKey || e.metaKey;
      
      if (isCtrlOrCmd && e.key.toLowerCase() === 'h') {
        e.preventDefault();
        setShowShortcuts(!showShortcuts);
        return;
      }

      if (isCtrlOrCmd && e.key.toLowerCase() === 'u') {
        e.preventDefault();
        const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
        if (fileInput) {
          fileInput.click();
          showToast('File picker opened', 'info');
        }
        return;
      }

      if (isCtrlOrCmd && e.key.toLowerCase() === 'm') {
        e.preventDefault();
        window.location.href = '/merge-pdf';
        return;
      }

      if (isCtrlOrCmd && e.key.toLowerCase() === 's') {
        e.preventDefault();
        window.location.href = '/split-pdf';
        return;
      }

      if (isCtrlOrCmd && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        window.location.href = '/compress-pdf';
        return;
      }

      if (isCtrlOrCmd && e.key.toLowerCase() === 't') {
        e.preventDefault();
        const themeButton = document.querySelector('[data-theme-toggle]') as HTMLButtonElement;
        if (themeButton) {
          themeButton.click();
        }
        return;
      }

      if (e.key === 'Escape') {
        setShowShortcuts(false);
        const closeButtons = document.querySelectorAll('[data-close-modal]');
        closeButtons.forEach(button => (button as HTMLButtonElement).click());
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [showShortcuts, showToast]);

  return (
    <>
      {/* Shortcuts toggle button */}
      <button
        onClick={() => setShowShortcuts(!showShortcuts)}
        className="fixed bottom-6 left-6 z-40 px-3 py-2 bg-gray-600 text-white rounded-full shadow-lg hover:bg-gray-700 text-sm font-medium"
        title="Keyboard Shortcuts (Ctrl/Cmd + H)"
      >
        ⌨️
      </button>

      {/* Shortcuts modal */}
      {showShortcuts && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">⌨️ Keyboard Shortcuts</h2>
                <button
                  onClick={() => setShowShortcuts(false)}
                  className="text-gray-500 hover:text-gray-700 text-xl"
                  data-close-modal
                >
                  ✕
                </button>
              </div>

              <div className="space-y-3">
                {shortcuts.map((shortcut, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center p-2 rounded hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <span className="text-sm text-gray-600 dark:text-gray-300">
                      {shortcut.description}
                    </span>
                    <kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-700 text-xs rounded font-mono">
                      {shortcut.key}
                    </kbd>
                  </div>
                ))}
              </div>

              <div className="mt-6 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-sm">
                <strong>💡 Pro tip:</strong> Use Ctrl/Cmd + H to quickly toggle this shortcuts panel.
              </div>

              <div className="mt-4 text-center">
                <button
                  onClick={() => setShowShortcuts(false)}
                  className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 font-medium"
                >
                  Got it!
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default KeyboardShortcuts;
