'use client';
import React, { useState, useEffect } from 'react';

const ThemeToggle: React.FC = () => {
  const [dark, setDark] = useState(false);
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('theme') === 'dark';
      setDark(saved);
      document.documentElement.classList.toggle('dark', saved);
    }
  }, []);
  
  const toggle = () => {
    setDark((d) => {
      document.documentElement.classList.toggle('dark', !d);
      localStorage.setItem('theme', !d ? 'dark' : 'light');
      return !d;
    });
  };
  
  return (
    <button
      onClick={toggle}
      data-theme-toggle
      className="fixed top-6 left-6 z-50 px-4 py-2 bg-gray-900 text-white rounded-full shadow-lg hover:bg-gray-700 font-semibold"
      title="Toggle Dark/Light Mode (Ctrl/Cmd + T)"
    >
      {dark ? '🌙 Dark' : '☀️ Light'}
    </button>
  );
};

export default ThemeToggle;
