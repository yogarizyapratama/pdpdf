'use client';

import Link from 'next/link'
import { useState, useMemo } from 'react'
import { 
  Merge, 
  Split, 
  Zap as Compress, 
  FileImage, 
  FileText, 
  Download,
  Upload,
  Edit3,
  Shield,
  Search,
  RotateCcw,
  Copy,
  Scissors,
  Settings,
  Lock,
  Eye,
  Scan,
  ArrowRight,
  Star,
  TrendingUp
} from 'lucide-react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import AdBanner from '@/components/AdBanner'
import WorkingAdBanner from '@/components/WorkingAdBanner'
import SearchComponent from '@/components/SearchComponent'

interface ToolCard {
  title: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  href: string
  category: string
  popular?: boolean
  usage?: number
  isTopTool?: boolean
}

const tools: ToolCard[] = [
  // Top 2 Most Used Tools
  {
    title: 'Merge PDF',
    description: 'Combine multiple PDF files into one document',
    icon: Merge,
    href: '/merge-pdf',
    category: 'organize',
    popular: true,
    usage: 95,
    isTopTool: true
  },
  {
    title: 'Compress PDF',
    description: 'Reduce PDF file size while maintaining quality',
    icon: Compress,
    href: '/compress-pdf',
    category: 'optimize',
    popular: true,
    usage: 88,
    isTopTool: true
  },
  
  // Other Popular Tools
  {
    title: 'Split PDF',
    description: 'Extract pages or split PDF into multiple files',
    icon: Split,
    href: '/split-pdf',
    category: 'organize',
    popular: true,
    usage: 82
  },
  {
    title: 'PDF to JPG',
    description: 'Convert PDF pages to JPG images',
    icon: FileImage,
    href: '/pdf-to-jpg',
    category: 'convert',
    popular: true,
    usage: 78
  },
  
  // Organize PDF Tools
  {
    title: 'Remove Pages',
    description: 'Delete unwanted pages from your PDF',
    icon: Scissors,
    href: '/remove-pages',
    category: 'organize'
  },
  {
    title: 'Extract Pages',
    description: 'Extract specific pages as new PDF',
    icon: Copy,
    href: '/extract-pages',
    category: 'organize'
  },
  {
    title: 'Organize PDF',
    description: 'Reorder pages by drag and drop',
    icon: Settings,
    href: '/organize-pdf',
    category: 'organize'
  },
  {
    title: 'Rotate PDF',
    description: 'Rotate PDF pages clockwise or counterclockwise',
    icon: RotateCcw,
    href: '/rotate-pdf',
    category: 'organize'
  },

  // Convert PDF Tools
  {
    title: 'PDF to Word',
    description: 'Convert PDF to editable Word document',
    icon: FileText,
    href: '/pdf-to-word',
    category: 'convert'
  },
  {
    title: 'Word to PDF',
    description: 'Convert Word documents to PDF',
    icon: Upload,
    href: '/word-to-pdf',
    category: 'convert'
  },
  {
    title: 'PDF to Excel',
    description: 'Convert PDF tables to Excel spreadsheets',
    icon: FileText,
    href: '/pdf-to-excel',
    category: 'convert'
  },
  {
    title: 'Excel to PDF',
    description: 'Convert Excel files to PDF format',
    icon: Upload,
    href: '/excel-to-pdf',
    category: 'convert'
  },
  {
    title: 'PDF to PowerPoint',
    description: 'Convert PDF to PowerPoint presentation',
    icon: FileText,
    href: '/pdf-to-powerpoint',
    category: 'convert'
  },
  {
    title: 'PowerPoint to PDF',
    description: 'Convert presentations to PDF format',
    icon: Upload,
    href: '/powerpoint-to-pdf',
    category: 'convert'
  },
  {
    title: 'JPG to PDF',
    description: 'Convert images to PDF document',
    icon: Scan,
    href: '/jpg-to-pdf',
    category: 'convert'
  },
  {
    title: 'HTML to PDF',
    description: 'Convert web pages to PDF',
    icon: Download,
    href: '/html-to-pdf',
    category: 'convert'
  },

  // Optimize PDF Tools
  {
    title: 'Repair PDF',
    description: 'Fix corrupted or damaged PDF files',
    icon: Settings,
    href: '/repair-pdf',
    category: 'optimize'
  },
  {
    title: 'OCR PDF',
    description: 'Extract text from scanned PDF documents',
    icon: Search,
    href: '/ocr-pdf',
    category: 'optimize'
  },

  // Edit PDF Tools
  {
    title: 'Add Page Numbers',
    description: 'Insert page numbers to your PDF',
    icon: Edit3,
    href: '/pagenumber-pdf',
    category: 'edit'
  },
  {
    title: 'Add Watermark',
    description: 'Add text or image watermarks to PDF',
    icon: Edit3,
    href: '/watermark-pdf',
    category: 'edit'
  },
  {
    title: 'Sign PDF',
    description: 'Add digital signatures to PDF documents',
    icon: Edit3,
    href: '/sign-pdf',
    category: 'edit'
  },
  {
    title: 'Crop PDF',
    description: 'Trim margins and crop PDF pages',
    icon: Scissors,
    href: '/crop-pdf',
    category: 'edit'
  },
  {
    title: 'Scan to PDF',
    description: 'Scan documents and save as PDF',
    icon: Scan,
    href: '/scan-to-pdf',
    category: 'edit'
  },

  // Security Tools
  {
    title: 'Protect PDF',
    description: 'Add password protection to PDF files',
    icon: Lock,
    href: '/protect-pdf',
    category: 'security'
  },
  {
    title: 'Unlock PDF',
    description: 'Remove password protection from PDF',
    icon: Lock,
    href: '/unlock-pdf',
    category: 'security'
  },
  {
    title: 'Compare PDF',
    description: 'Compare two PDF documents for differences',
    icon: Eye,
    href: '/compare-pdf',
    category: 'security'
  }
]

const categories = [
  {
    id: 'organize',
    title: 'Organize PDF',
    description: 'Merge, split, and organize your PDFs',
    color: 'bg-blue-500',
    icon: Settings
  },
  {
    id: 'convert',
    title: 'Convert PDF',
    description: 'Convert PDFs to and from other formats',
    color: 'bg-green-500',
    icon: FileText
  },
  {
    id: 'optimize',
    title: 'Optimize PDF',
    description: 'Compress and enhance your PDFs',
    color: 'bg-purple-500',
    icon: Compress
  },
  {
    id: 'edit',
    title: 'Edit PDF',
    description: 'Modify and enhance PDF content',
    color: 'bg-red-500',
    icon: Edit3
  },
  {
    id: 'security',
    title: 'PDF Security',
    description: 'Protect and secure your PDFs',
    color: 'bg-gray-500',
    icon: Shield
  }
]

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  
  // Filter tools based on search and category
  const filteredTools = useMemo(() => {
    let filtered = tools

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(tool => tool.category === selectedCategory)
    }

    if (searchQuery) {
      filtered = filtered.filter(tool =>
        tool.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tool.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    return filtered
  }, [searchQuery, selectedCategory])

  const topTools = tools.filter(tool => tool.isTopTool)
  const popularTools = tools.filter(tool => tool.popular && !tool.isTopTool)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Hero Section with Search */}
        <div className="text-center mb-12">
          <div className="flex justify-center items-center gap-2 mb-6">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              PDF All-in-One
            </h1>
          </div>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
            Your complete PDF solution - merge, split, convert, compress, and more. All tools you need in one place.
          </p>
          
          {/* Search Component */}
          <div className="max-w-2xl mx-auto mb-8">
            <SearchComponent
              tools={tools}
              onSearchChange={setSearchQuery}
              onCategoryChange={setSelectedCategory}
            />
          </div>
        </div>

         {/* 🎯 TOP HOMEPAGE AD - Maximum Traffic Capture */}
      <div className="w-full bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm shadow-sm border-b border-gray-200 dark:border-gray-700 mb-5">
        <div className="max-w-6xl mx-auto px-4 py-3">
          <WorkingAdBanner 
            position="top"
            adFormat="horizontal"
            className="w-full"
            style={{ minHeight: '90px' }}
          />
        </div>
      </div>

        {/* Top 2 Most Used Tools - Featured Section */}
        {searchQuery === '' && selectedCategory === 'all' && (
          <div className="mb-12">
            <div className="text-center mb-8">
              <div className="flex items-center justify-center gap-2 mb-4">
                <TrendingUp className="w-6 h-6 text-yellow-500" />
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                  Most Popular Tools
                </h2>
                <TrendingUp className="w-6 h-6 text-yellow-500" />
              </div>
              <p className="text-gray-600 dark:text-gray-300">
                The most frequently used tools by our users
              </p>
            </div>
            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {topTools.map((tool, index) => {
                const Icon = tool.icon
                return (
                  <Link key={tool.href} href={tool.href}>
                    <div className="group relative overflow-hidden bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 p-8 border-2 border-yellow-200 dark:border-yellow-600">
                      {/* Top Tool Badge */}
                      <div className="absolute top-4 right-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1">
                        <Star className="w-4 h-4 fill-current" />
                        #{index + 1}
                      </div>
                      
                      {/* Usage Stats */}
                      <div className="absolute top-4 left-4 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-3 py-1 rounded-full text-sm font-semibold">
                        {tool.usage}% users
                      </div>
                      
                      <div className="flex items-center mb-6 mt-8">
                        <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center mr-4 group-hover:scale-110 transition-transform">
                          <Icon className="w-8 h-8 text-white" />
                        </div>
                        <div>
                          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                            {tool.title}
                          </h3>
                          <p className="text-gray-600 dark:text-gray-300">
                            {tool.description}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                          Very Popular
                        </span>
                        <ArrowRight className="w-6 h-6 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        )}

        {/* Popular Tools Section */}
        {searchQuery === '' && selectedCategory === 'all' && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-8">
              Other Popular Tools
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {popularTools.map((tool) => {
                const Icon = tool.icon
                return (
                  <Link key={tool.href} href={tool.href}>
                    <div className="group bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border border-gray-200 dark:border-gray-700">
                      <div className="flex items-center mb-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center mr-3 group-hover:scale-110 transition-transform">
                          <Icon className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
                            {tool.title}
                          </h3>
                          {tool.usage && (
                            <span className="text-xs text-blue-600 dark:text-blue-400">
                              {tool.usage}% users
                            </span>
                          )}
                        </div>
                      </div>
                      <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
                        {tool.description}
                      </p>
                      <div className="flex justify-between items-center">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">
                          Popular
                        </span>
                        <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        )}

        {/* Search Results or Category Tools */}
        {(searchQuery || selectedCategory !== 'all') && (
          <div className="mb-12">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {searchQuery 
                  ? `Search results: "${searchQuery}"` 
                  : `${categories.find(c => c.id === selectedCategory)?.title} Tools`
                }
              </h2>
              <p className="text-gray-600 dark:text-gray-300">
                {filteredTools.length} tools found
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredTools.map((tool) => {
                const Icon = tool.icon
                return (
                  <Link key={tool.href} href={tool.href}>
                    <div className="group bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border border-gray-200 dark:border-gray-700">
                      <div className="flex items-center mb-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center mr-3 group-hover:scale-110 transition-transform">
                          <Icon className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
                            {tool.title}
                          </h3>
                          {tool.isTopTool && (
                            <span className="text-xs text-yellow-600 dark:text-yellow-400 flex items-center gap-1">
                              <Star className="w-3 h-3 fill-current" /> Top Tool
                            </span>
                          )}
                          {tool.popular && !tool.isTopTool && (
                            <span className="text-xs text-green-600 dark:text-green-400">
                              Popular
                            </span>
                          )}
                        </div>
                      </div>
                      <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
                        {tool.description}
                      </p>
                      <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all ml-auto" />
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        )}

        {/* All Categories - Only show when no search/filter */}
        {searchQuery === '' && selectedCategory === 'all' && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-8">
              All Tool Categories
            </h2>
            <div className="space-y-12">
              {categories.map((category) => {
                const CategoryIcon = category.icon
                const categoryTools = tools.filter(tool => tool.category === category.id)
                
                return (
                  <div key={category.id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
                    <div className="flex items-center mb-6">
                      <div className={`w-12 h-12 ${category.color} rounded-xl flex items-center justify-center mr-4`}>
                        <CategoryIcon className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                          {category.title}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-300">
                          {category.description}
                        </p>
                      </div>
                    </div>
                    
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                      {categoryTools.map((tool) => {
                        const Icon = tool.icon
                        return (
                          <Link key={tool.href} href={tool.href}>
                            <div className="group bg-gray-50 dark:bg-gray-700 rounded-lg p-4 hover:bg-blue-50 dark:hover:bg-gray-600 transition-all duration-300">
                              <div className="flex items-center mb-3">
                                <div className="w-10 h-10 bg-white dark:bg-gray-800 rounded-lg shadow-md flex items-center justify-center mr-3 group-hover:scale-105 transition-transform">
                                  <Icon className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                                </div>
                                <div className="flex-1">
                                  <h4 className="font-medium text-gray-900 dark:text-white text-sm">
                                    {tool.title}
                                  </h4>
                                  {tool.isTopTool && (
                                    <span className="text-xs text-yellow-600 dark:text-yellow-400 flex items-center gap-1">
                                      <Star className="w-3 h-3 fill-current" /> Top
                                    </span>
                                  )}
                                  {tool.popular && !tool.isTopTool && (
                                    <span className="text-xs text-green-600 dark:text-green-400">
                                      Popular
                                    </span>
                                  )}
                                </div>
                              </div>
                              <p className="text-gray-600 dark:text-gray-300 text-xs">
                                {tool.description}
                              </p>
                            </div>
                          </Link>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Ad Banner */}
        <div className="flex justify-center mb-8">
          <AdBanner />
        </div>

        {/* Features Section */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mb-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-8">
            Why Choose PDF All-in-One?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                100% Safe & Private
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Your files are processed locally and automatically deleted after completion
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-teal-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Compress className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Free & Unlimited
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Use all tools without registration, watermarks, or file limitations
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Settings className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Complete Toolkit
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Everything you need to work with PDFs in one convenient place
              </p>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-700 rounded-2xl p-8 mb-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-8">
            What Our Users Say
          </h2>
          <div className="overflow-x-auto">
            <div className="flex space-x-6 pb-4">
              {/* Review Cards */}
              <div className="min-w-[320px] max-w-xs bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 flex flex-col items-center">
                <img 
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=facearea&w=128&h=128&facepad=2" 
                  alt="Alex Johnson" 
                  className="w-16 h-16 rounded-full mb-4 object-cover border-4 border-blue-500" 
                />
                <span className="font-bold text-lg text-gray-900 dark:text-gray-100 mb-1">Alex Johnson</span>
                <span className="text-sm text-gray-500 dark:text-gray-400 mb-2">Software Engineer, USA</span>
                <span className="text-yellow-500 mb-3 text-lg">★★★★★</span>
                <blockquote className="italic text-gray-700 dark:text-gray-300 text-center text-sm">
                  &ldquo;Amazing PDF merger! The interface is clean and intuitive. Saved me hours of work.&rdquo;
                </blockquote>
              </div>
              
              <div className="min-w-[320px] max-w-xs bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 flex flex-col items-center">
                <img 
                  src="https://images.unsplash.com/photo-1494790108755-2616b612b47c?auto=format&fit=facearea&w=128&h=128&facepad=2" 
                  alt="Sarah Williams" 
                  className="w-16 h-16 rounded-full mb-4 object-cover border-4 border-green-500" 
                />
                <span className="font-bold text-lg text-gray-900 dark:text-gray-100 mb-1">Sarah Williams</span>
                <span className="text-sm text-gray-500 dark:text-gray-400 mb-2">Marketing Manager, UK</span>
                <span className="text-yellow-500 mb-3 text-lg">★★★★★</span>
                <blockquote className="italic text-gray-700 dark:text-gray-300 text-center text-sm">
                  &ldquo;The compression tool is outstanding! Reduced file sizes while maintaining perfect quality.&rdquo;
                </blockquote>
              </div>
              
              <div className="min-w-[320px] max-w-xs bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 flex flex-col items-center">
                <img 
                  src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=facearea&w=128&h=128&facepad=2" 
                  alt="Michael Chen" 
                  className="w-16 h-16 rounded-full mb-4 object-cover border-4 border-purple-500" 
                />
                <span className="font-bold text-lg text-gray-900 dark:text-gray-100 mb-1">Michael Chen</span>
                <span className="text-sm text-gray-500 dark:text-gray-400 mb-2">Business Analyst, Canada</span>
                <span className="text-yellow-500 mb-3 text-lg">★★★★★</span>
                <blockquote className="italic text-gray-700 dark:text-gray-300 text-center text-sm">
                  &ldquo;Free and no watermarks! Perfect for daily business use. Highly recommended.&rdquo;
                </blockquote>
              </div>

              <div className="min-w-[320px] max-w-xs bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 flex flex-col items-center">
                <img 
                  src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=facearea&w=128&h=128&facepad=2" 
                  alt="Emma Rodriguez" 
                  className="w-16 h-16 rounded-full mb-4 object-cover border-4 border-red-500" 
                />
                <span className="font-bold text-lg text-gray-900 dark:text-gray-100 mb-1">Emma Rodriguez</span>
                <span className="text-sm text-gray-500 dark:text-gray-400 mb-2">Graphic Designer, Spain</span>
                <span className="text-yellow-500 mb-3 text-lg">★★★★★</span>
                <blockquote className="italic text-gray-700 dark:text-gray-300 text-center text-sm">
                  &ldquo;The split and organize tools are fantastic! Makes document management so much easier.&rdquo;
                </blockquote>
              </div>

              <div className="min-w-[320px] max-w-xs bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 flex flex-col items-center">
                <img 
                  src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=facearea&w=128&h=128&facepad=2" 
                  alt="David Kumar" 
                  className="w-16 h-16 rounded-full mb-4 object-cover border-4 border-yellow-500" 
                />
                <span className="font-bold text-lg text-gray-900 dark:text-gray-100 mb-1">David Kumar</span>
                <span className="text-sm text-gray-500 dark:text-gray-400 mb-2">Data Scientist, India</span>
                <span className="text-yellow-500 mb-3 text-lg">★★★★★</span>
                <blockquote className="italic text-gray-700 dark:text-gray-300 text-center text-sm">
                  &ldquo;The OCR feature is incredible! Extracted text from scanned documents in seconds.&rdquo;
                </blockquote>
              </div>
            </div>
          </div>
        </div>
        
        {/* 🎯 HOMEPAGE MIDDLE AD - Between Content Sections */}
        <div className="my-12 max-w-6xl mx-auto px-4">
          <WorkingAdBanner 
            position="middle"
            adFormat="horizontal"
            className="w-full"
            style={{ minHeight: '90px' }}
          />
        </div>
      </main>
      
      {/* 🎯 HOMEPAGE BOTTOM AD - Exit Intent Revenue */}
      <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 py-6">
        <div className="max-w-6xl mx-auto px-4">
          <WorkingAdBanner 
            position="bottom"
            adFormat="horizontal"
            className="w-full"
            style={{ minHeight: '90px' }}
          />
        </div>
      </div>

      <Footer />
    </div>
  )
}
