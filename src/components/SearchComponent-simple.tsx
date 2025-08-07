'use client';
import React, { useState, useEffect } from 'react';
import { Search, X, Filter } from 'lucide-react';

interface Tool {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  category: string;
  popular?: boolean;
  isTopTool?: boolean;
  usage?: number;
}

interface SearchProps {
  tools: Tool[];
  onSearchChange: (query: string) => void;
  onCategoryChange: (category: string) => void;
  selectedCategory?: string;
}

const categories = [
  { id: 'all', title: 'Semua Tools' },
  { id: 'organize', title: 'Organize PDF' },
  { id: 'convert', title: 'Convert PDF' },
  { id: 'optimize', title: 'Optimize PDF' },
  { id: 'edit', title: 'Edit PDF' },
  { id: 'security', title: 'PDF Security' }
];

export default function SearchComponent({
  tools,
  onSearchChange,
  onCategoryChange,
  selectedCategory = 'all'
}: SearchProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Update parent when search changes
  useEffect(() => {
    onSearchChange(searchQuery);
  }, [searchQuery, onSearchChange]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const clearSearch = () => {
    setSearchQuery('');
  };

  const handleCategoryChange = (categoryId: string) => {
    onCategoryChange(categoryId);
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Main Search Bar */}
      <div className="relative mb-4">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Cari tools PDF..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="w-full pl-12 pr-12 py-4 text-lg border-2 border-gray-200 dark:border-gray-600 rounded-2xl focus:border-blue-500 focus:outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 shadow-lg"
          />
          {searchQuery && (
            <button
              onClick={clearSearch}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 w-5 h-5"
            >
              <X />
            </button>
          )}
        </div>
      </div>

      {/* Filter Toggle */}
      <div className="flex justify-center mb-4">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
        >
          <Filter className="w-4 h-4" />
          Filter Kategori
        </button>
      </div>

      {/* Category Filters */}
      {showFilters && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Filter berdasarkan Kategori
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => handleCategoryChange(category.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedCategory === category.id
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {category.title}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Search Suggestions */}
      {searchQuery && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 mb-4">
          <div className="p-4">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Saran Pencarian:
            </h4>
            <div className="flex flex-wrap gap-2">
              {['merge pdf', 'compress pdf', 'split pdf', 'convert pdf', 'protect pdf'].map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => setSearchQuery(suggestion)}
                  className="px-3 py-1 bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-full text-sm hover:bg-blue-100 dark:hover:bg-blue-800 transition-colors"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Quick Stats */}
      <div className="text-center text-gray-600 dark:text-gray-400 text-sm">
        {searchQuery
          ? `Mencari "${searchQuery}" dalam ${tools.length} tools...`
          : `${tools.length} tools PDF tersedia`
        }
      </div>
    </div>
  );
}
