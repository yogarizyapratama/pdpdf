'use client';
import React, { useState } from 'react';
import Link from 'next/link';

interface QuickAction {
  icon: string;
  label: string;
  href: string;
  color: string;
}

const QuickActions: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  const quickActions: QuickAction[] = [
    {
      icon: '🔗',
      label: 'Merge',
      href: '/merge-pdf',
      color: 'bg-blue-600 hover:bg-blue-700'
    },
    {
      icon: '✂️',
      label: 'Split',
      href: '/split-pdf',
      color: 'bg-green-600 hover:bg-green-700'
    },
    {
      icon: '🗜️',
      label: 'Compress',
      href: '/compress-pdf',
      color: 'bg-orange-600 hover:bg-orange-700'
    },
    {
      icon: '🔄',
      label: 'Convert',
      href: '/word-to-pdf',
      color: 'bg-purple-600 hover:bg-purple-700'
    },
    {
      icon: '✏️',
      label: 'Edit',
      href: '/watermark-pdf',
      color: 'bg-red-600 hover:bg-red-700'
    },
    {
      icon: '🔒',
      label: 'Protect',
      href: '/protect-pdf',
      color: 'bg-gray-600 hover:bg-gray-700'
    }
  ];

  return (
    <div className="fixed bottom-6 right-24 z-40">
      {/* Quick action buttons - appear when menu is open */}
      {isOpen && (
        <div className="flex flex-col gap-2 mb-3">
          {quickActions.map((action, index) => (
            <Link
              key={action.href}
              href={action.href}
              className={`flex items-center gap-2 px-3 py-2 text-white rounded-full shadow-lg transition-all duration-200 ${action.color} transform hover:scale-105`}
              style={{
                animationDelay: `${index * 50}ms`,
                animation: 'slideInRight 0.3s ease-out forwards'
              }}
              onClick={() => setIsOpen(false)}
            >
              <span className="text-lg">{action.icon}</span>
              <span className="text-sm font-medium whitespace-nowrap">{action.label}</span>
            </Link>
          ))}
        </div>
      )}

      {/* Main toggle button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-12 h-12 bg-indigo-600 text-white rounded-full shadow-lg hover:bg-indigo-700 flex items-center justify-center transition-all duration-300 ${
          isOpen ? 'rotate-45' : 'rotate-0'
        }`}
        title="Quick Actions"
      >
        <span className="text-xl">{isOpen ? '✕' : '⚡'}</span>
      </button>

      <style jsx>{`
        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(100%);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
    </div>
  );
};

export default QuickActions;
