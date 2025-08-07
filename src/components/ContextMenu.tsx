'use client';
import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

interface ContextMenuItem {
  icon: string;
  label: string;
  href?: string;
  action?: () => void;
  shortcut?: string;
}

const ContextMenu: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const menuRef = useRef<HTMLDivElement>(null);

  const menuItems: ContextMenuItem[] = [
    {
      icon: '📁',
      label: 'Upload Files',
      action: () => {
        const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
        if (fileInput) fileInput.click();
      },
      shortcut: 'Ctrl+U'
    },
    { icon: '🔗', label: 'Merge PDFs', href: '/merge-pdf', shortcut: 'Ctrl+M' },
    { icon: '✂️', label: 'Split PDF', href: '/split-pdf', shortcut: 'Ctrl+S' },
    { icon: '🗜️', label: 'Compress PDF', href: '/compress-pdf', shortcut: 'Ctrl+K' },
    { icon: '📄', label: 'Word to PDF', href: '/word-to-pdf' },
    { icon: '🖼️', label: 'JPG to PDF', href: '/jpg-to-pdf' },
    { icon: '🔒', label: 'Protect PDF', href: '/protect-pdf' },
    { icon: '🔓', label: 'Unlock PDF', href: '/unlock-pdf' },
    {
      icon: '❓',
      label: 'Help Center',
      action: () => {
        // Trigger help center modal
        const helpButton = document.querySelector('[data-help-center]') as HTMLButtonElement;
        if (helpButton) helpButton.click();
      }
    }
  ];

  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      setPosition({ x: e.clientX, y: e.clientY });
      setIsVisible(true);
    };

    const handleClick = () => {
      setIsVisible(false);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsVisible(false);
      }
    };

    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('click', handleClick);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('click', handleClick);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  if (!isVisible) return null;

  return (
    <div
      ref={menuRef}
      className="fixed bg-white dark:bg-gray-800 rounded-lg shadow-xl border dark:border-gray-700 py-2 min-w-48 z-50"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        transform: 'translate(-50%, 0)'
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="px-3 py-2 text-xs font-medium text-gray-500 dark:text-gray-400 border-b dark:border-gray-700">
        Quick Actions
      </div>
      
      {menuItems.map((item, index) => (
        <div key={index}>
          {item.href ? (
            <Link
              href={item.href}
              className="flex items-center gap-3 px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-sm"
              onClick={() => setIsVisible(false)}
            >
              <span>{item.icon}</span>
              <span className="flex-1">{item.label}</span>
              {item.shortcut && (
                <kbd className="text-xs bg-gray-200 dark:bg-gray-600 px-1 rounded">
                  {item.shortcut}
                </kbd>
              )}
            </Link>
          ) : (
            <button
              onClick={() => {
                item.action?.();
                setIsVisible(false);
              }}
              className="w-full flex items-center gap-3 px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-sm text-left"
            >
              <span>{item.icon}</span>
              <span className="flex-1">{item.label}</span>
              {item.shortcut && (
                <kbd className="text-xs bg-gray-200 dark:bg-gray-600 px-1 rounded">
                  {item.shortcut}
                </kbd>
              )}
            </button>
          )}
        </div>
      ))}
      
      <div className="border-t dark:border-gray-700 mt-2 pt-2 px-3 text-xs text-gray-500 dark:text-gray-400">
        Right-click anywhere for quick access
      </div>
    </div>
  );
};

export default ContextMenu;
