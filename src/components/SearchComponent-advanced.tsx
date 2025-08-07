'use client';
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Search, X, Filter, SortAsc, SortDesc, Sparkles, History, Tag } from 'lucide-react';

interface Tool {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  category: string;
  popular?: boolean;
  topTool?: boolean;
  usage?: number;
  tags?: string[];
  difficulty?: 'easy' | 'medium' | 'hard';
  fileTypes?: string[];
  features?: string[];
}

interface SearchProps {
  tools: Tool[];
  onSearchChange: (query: string) => void;
  onCategoryChange: (category: string) => void;
  selectedCategory?: string;
}

interface SearchHistory {
  query: string;
  timestamp: number;
  resultsCount: number;
}

interface AISearchSuggestion {
  query: string;
  reason: string;
  confidence: number;
}

const SearchComponent: React.FC<SearchProps> = ({ 
  tools, 
  onSearchChange,
  onCategoryChange, 
  selectedCategory 
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'relevance' | 'popular' | 'name' | 'recent'>('relevance');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedDifficulty, setSelectedDifficulty] = useState<string[]>([]);
  const [selectedFileTypes, setSelectedFileTypes] = useState<string[]>([]);
  const [searchHistory, setSearchHistory] = useState<SearchHistory[]>([]);
  const [aiSuggestions, setAiSuggestions] = useState<AISearchSuggestion[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Load search history from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('pdf-tools-search-history');
    if (saved) {
      setSearchHistory(JSON.parse(saved));
    }
  }, []);

  // Get all unique tags, difficulties, and file types
  const allTags = useMemo(() => {
    const tags = new Set<string>();
    tools.forEach(tool => {
      tool.tags?.forEach(tag => tags.add(tag));
      tool.features?.forEach(feature => tags.add(feature));
    });
    return Array.from(tags);
  }, [tools]);

  const allDifficulties = useMemo(() => 
    Array.from(new Set(tools.map(tool => tool.difficulty).filter(Boolean))), [tools]);

  const allFileTypes = useMemo(() => {
    const types = new Set<string>();
    tools.forEach(tool => {
      tool.fileTypes?.forEach(type => types.add(type));
    });
    return Array.from(types);
  }, [tools]);

  // Advanced filtering and sorting
  const filteredAndSortedTools = useMemo(() => {
    let filtered = tools;

    // Category filter
    if (selectedCategory && selectedCategory !== 'all') {
      filtered = filtered.filter(tool => tool.category === selectedCategory);
    }

    // Text search with advanced matching
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(tool => {
        const titleMatch = tool.title.toLowerCase().includes(query);
        const descMatch = tool.description.toLowerCase().includes(query);
        const categoryMatch = tool.category.toLowerCase().includes(query);
        const tagMatch = tool.tags?.some(tag => tag.toLowerCase().includes(query)) || false;
        const featureMatch = tool.features?.some(feature => feature.toLowerCase().includes(query)) || false;
        
        // Fuzzy matching for typos
        const fuzzyMatch = calculateFuzzyMatch(query, tool.title.toLowerCase()) > 0.7 ||
                          calculateFuzzyMatch(query, tool.description.toLowerCase()) > 0.6;
        
        return titleMatch || descMatch || categoryMatch || tagMatch || featureMatch || fuzzyMatch;
      });
    }

    // Advanced filters
    if (selectedTags.length > 0) {
      filtered = filtered.filter(tool => 
        tool.tags?.some(tag => selectedTags.includes(tag)) ||
        tool.features?.some(feature => selectedTags.includes(feature))
      );
    }

    if (selectedDifficulty.length > 0) {
      filtered = filtered.filter(tool => 
        tool.difficulty && selectedDifficulty.includes(tool.difficulty)
      );
    }

    if (selectedFileTypes.length > 0) {
      filtered = filtered.filter(tool => 
        tool.fileTypes?.some(type => selectedFileTypes.includes(type))
      );
    }

    // Sorting
    const sorted = [...filtered].sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'popular':
          comparison = (b.usage || 0) - (a.usage || 0);
          break;
        case 'name':
          comparison = a.title.localeCompare(b.title);
          break;
        case 'recent':
          comparison = (b.topTool ? 1 : 0) - (a.topTool ? 1 : 0);
          break;
        case 'relevance':
        default:
          // Calculate relevance score
          const scoreA = calculateRelevanceScore(a, searchQuery);
          const scoreB = calculateRelevanceScore(b, searchQuery);
          comparison = scoreB - scoreA;
          break;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return sorted;
  }, [tools, searchQuery, selectedCategory, selectedTags, selectedDifficulty, selectedFileTypes, sortBy, sortOrder]);

  // Update parent component
  useEffect(() => {
    onFilteredToolsChange(filteredAndSortedTools);
  }, [filteredAndSortedTools, onFilteredToolsChange]);

  // Calculate fuzzy match score
  const calculateFuzzyMatch = (query: string, target: string): number => {
    if (query === target) return 1;
    if (query.length === 0) return 0;
    
    let matches = 0;
    let queryIndex = 0;
    
    for (let i = 0; i < target.length && queryIndex < query.length; i++) {
      if (target[i] === query[queryIndex]) {
        matches++;
        queryIndex++;
      }
    }
    
    return matches / query.length;
  };

  // Calculate relevance score
  const calculateRelevanceScore = (tool: Tool, query: string): number => {
    if (!query.trim()) return tool.popular ? 10 : 5;
    
    const q = query.toLowerCase();
    let score = 0;
    
    // Title match (highest weight)
    if (tool.title.toLowerCase().includes(q)) score += 10;
    if (tool.title.toLowerCase().startsWith(q)) score += 15;
    
    // Description match
    if (tool.description.toLowerCase().includes(q)) score += 5;
    
    // Tag/feature match
    if (tool.tags?.some(tag => tag.toLowerCase().includes(q))) score += 7;
    if (tool.features?.some(feature => feature.toLowerCase().includes(q))) score += 7;
    
    // Popular tools boost
    if (tool.popular) score += 3;
    if (tool.topTool) score += 5;
    
    return score;
  };

  // AI-powered search suggestions
  const generateAISuggestions = useCallback(async (query: string) => {
    if (query.length < 3) return;
    
    setIsLoadingSuggestions(true);
    
    try {
      // Simulate AI suggestions - in real app, call AI API
      const suggestions = await generateSmartSuggestions(query, tools);
      setAiSuggestions(suggestions);
    } catch (error) {
      console.error('Failed to generate AI suggestions:', error);
    } finally {
      setIsLoadingSuggestions(false);
    }
  }, [tools]);

  // Debounced AI suggestions
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.trim()) {
        generateAISuggestions(searchQuery);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery, generateAISuggestions]);

  // Save search to history
  const saveSearchHistory = useCallback((query: string, resultsCount: number) => {
    if (query.trim()) {
      const newEntry: SearchHistory = {
        query,
        timestamp: Date.now(),
        resultsCount
      };
      
      const updated = [newEntry, ...searchHistory.filter(h => h.query !== query)].slice(0, 10);
      setSearchHistory(updated);
      localStorage.setItem('pdf-tools-search-history', JSON.stringify(updated));
    }
  }, [searchHistory]);

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    if (value.trim()) {
      setShowSuggestions(true);
    }
  };

  const handleSearchSubmit = () => {
    saveSearchHistory(searchQuery, filteredAndSortedTools.length);
    setShowSuggestions(false);
  };

  const clearSearch = () => {
    setSearchQuery('');
    setShowSuggestions(false);
  };

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const toggleDifficulty = (difficulty: string) => {
    setSelectedDifficulty(prev => 
      prev.includes(difficulty) ? prev.filter(d => d !== difficulty) : [...prev, difficulty]
    );
  };

  const toggleFileType = (fileType: string) => {
    setSelectedFileTypes(prev => 
      prev.includes(fileType) ? prev.filter(f => f !== fileType) : [...prev, fileType]
    );
  };

  const clearAllFilters = () => {
    setSelectedTags([]);
    setSelectedDifficulty([]);
    setSelectedFileTypes([]);
    setSearchQuery('');
  };

  return (
    <div className="relative max-w-4xl mx-auto mb-8">
      {/* Main Search Bar */}
      <div className="relative">
        <div className="relative flex items-center">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            placeholder="Search PDF tools... (try 'convert', 'merge', 'compress')"
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearchSubmit()}
            onFocus={() => searchQuery && setShowSuggestions(true)}
            className="w-full pl-10 pr-20 py-4 text-lg border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-sm"
          />
          <div className="absolute right-3 flex items-center gap-2">
            {searchQuery && (
              <button
                onClick={clearSearch}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1"
              >
                <X className="h-4 w-4" />
              </button>
            )}
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className={`p-2 rounded-lg transition-colors ${
                showAdvanced 
                  ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400' 
                  : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
              }`}
            >
              <Filter className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Search Suggestions Dropdown */}
        {showSuggestions && (searchQuery || searchHistory.length > 0) && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg z-50 max-h-80 overflow-y-auto">
            
            {/* AI Suggestions */}
            {aiSuggestions.length > 0 && (
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="h-4 w-4 text-purple-500" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">AI Suggestions</span>
                </div>
                {aiSuggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setSearchQuery(suggestion.query);
                      setShowSuggestions(false);
                    }}
                    className="w-full text-left p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg group"
                  >
                    <div className="font-medium text-gray-900 dark:text-gray-100">{suggestion.query}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">{suggestion.reason}</div>
                  </button>
                ))}
              </div>
            )}

            {/* Search History */}
            {searchHistory.length > 0 && (
              <div className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <History className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Recent Searches</span>
                </div>
                {searchHistory.slice(0, 5).map((item, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setSearchQuery(item.query);
                      setShowSuggestions(false);
                    }}
                    className="w-full text-left p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg flex justify-between items-center"
                  >
                    <span className="text-gray-900 dark:text-gray-100">{item.query}</span>
                    <span className="text-xs text-gray-500">{item.resultsCount} results</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Advanced Filters */}
      {showAdvanced && (
        <div className="mt-4 p-6 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Advanced Search</h3>
            <button
              onClick={clearAllFilters}
              className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400"
            >
              Clear All
            </button>
          </div>

          {/* Sort Options */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Sort By
            </label>
            <div className="flex flex-wrap gap-2">
              {[
                { value: 'relevance', label: 'Relevance' },
                { value: 'popular', label: 'Most Popular' },
                { value: 'name', label: 'Name' },
                { value: 'recent', label: 'Recently Added' }
              ].map(option => (
                <button
                  key={option.value}
                  onClick={() => setSortBy(option.value as any)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    sortBy === option.value
                      ? 'bg-blue-600 text-white'
                      : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600'
                  }`}
                >
                  {option.label}
                </button>
              ))}
              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="px-3 py-2 rounded-lg text-sm font-medium bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600"
              >
                {sortOrder === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* Tags Filter */}
          {allTags.length > 0 && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Features & Tags
              </label>
              <div className="flex flex-wrap gap-2">
                {allTags.map(tag => (
                  <button
                    key={tag}
                    onClick={() => toggleTag(tag)}
                    className={`px-3 py-1 rounded-full text-sm transition-colors ${
                      selectedTags.includes(tag)
                        ? 'bg-blue-600 text-white'
                        : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600'
                    }`}
                  >
                    <Tag className="h-3 w-3 inline mr-1" />
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Difficulty Filter */}
          {allDifficulties.length > 0 && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Difficulty Level
              </label>
              <div className="flex flex-wrap gap-2">
                {allDifficulties.map(difficulty => (
                  <button
                    key={difficulty}
                    onClick={() => toggleDifficulty(difficulty)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      selectedDifficulty.includes(difficulty)
                        ? 'bg-green-600 text-white'
                        : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600'
                    }`}
                  >
                    {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* File Types Filter */}
          {allFileTypes.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Supported File Types
              </label>
              <div className="flex flex-wrap gap-2">
                {allFileTypes.map(fileType => (
                  <button
                    key={fileType}
                    onClick={() => toggleFileType(fileType)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      selectedFileTypes.includes(fileType)
                        ? 'bg-purple-600 text-white'
                        : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600'
                    }`}
                  >
                    .{fileType}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Search Results Summary */}
      <div className="mt-4 flex justify-between items-center text-sm text-gray-600 dark:text-gray-400">
        <span>
          {filteredAndSortedTools.length} tools found
          {searchQuery && ` for "${searchQuery}"`}
        </span>
        {(selectedTags.length > 0 || selectedDifficulty.length > 0 || selectedFileTypes.length > 0) && (
          <span>
            {selectedTags.length + selectedDifficulty.length + selectedFileTypes.length} filters active
          </span>
        )}
      </div>
    </div>
  );
};

// AI Suggestion Generator (Mock - replace with real AI API)
async function generateSmartSuggestions(query: string, tools: Tool[]): Promise<AISearchSuggestion[]> {
  return new Promise(resolve => {
    setTimeout(() => {
      const suggestions: AISearchSuggestion[] = [];
      
      // Common intent detection
      if (query.includes('convert') || query.includes('change')) {
        suggestions.push({
          query: 'pdf to word',
          reason: 'Most common conversion request',
          confidence: 0.9
        });
      }
      
      if (query.includes('small') || query.includes('size') || query.includes('reduce')) {
        suggestions.push({
          query: 'compress pdf',
          reason: 'File size optimization',
          confidence: 0.85
        });
      }
      
      if (query.includes('combine') || query.includes('join')) {
        suggestions.push({
          query: 'merge pdf',
          reason: 'Combine multiple files',
          confidence: 0.9
        });
      }
      
      resolve(suggestions);
    }, 300);
  });
}

export default SearchComponent;
