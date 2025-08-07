'use client'

import { useState, useEffect } from 'react'
import { Document, Page, pdfjs } from 'react-pdf'
import { CheckCircle, Circle } from 'lucide-react'
import '@/lib/pdf-config' // Initialize PDF.js worker

interface PDFPagePreviewProps {
  file: File | Blob
  pageNumber: number
  width?: number
  height?: number
  isSelected?: boolean
  onToggle?: (pageNumber: number) => void
  showCheckbox?: boolean
  className?: string
  selectionType?: 'remove' | 'extract' | 'organize'
}

export default function PDFPagePreview({ 
  file, 
  pageNumber,
  width = 150, 
  height = 200, 
  isSelected = false,
  onToggle,
  showCheckbox = true,
  className = '',
  selectionType = 'remove'
}: PDFPagePreviewProps) {
  const [fileUrl, setFileUrl] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    if (file) {
      const url = URL.createObjectURL(file)
      setFileUrl(url)
      setLoading(true)
      setError(false)
      
      return () => {
        URL.revokeObjectURL(url)
      }
    }
  }, [file])

  const onDocumentLoadSuccess = () => {
    setLoading(false)
  }

  const onDocumentLoadError = (error: Error) => {
    console.warn('PDF page preview load error:', error)
    setError(true)
    setLoading(false)
  }

  const onPageLoadError = (error: Error) => {
    console.warn('PDF page load error:', error)
    setError(true)
    setLoading(false)
  }

  const handleClick = () => {
    if (onToggle) {
      onToggle(pageNumber)
    }
  }

  const getSelectionColor = () => {
    switch (selectionType) {
      case 'remove':
        return isSelected ? 'border-red-500 bg-red-50 dark:bg-red-950/20' : 'border-gray-200 dark:border-gray-600'
      case 'extract':
        return isSelected ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/20' : 'border-gray-200 dark:border-gray-600'
      case 'organize':
        return isSelected ? 'border-green-500 bg-green-50 dark:bg-green-950/20' : 'border-gray-200 dark:border-gray-600'
      default:
        return 'border-gray-200 dark:border-gray-600'
    }
  }

  const getCheckboxColor = () => {
    switch (selectionType) {
      case 'remove':
        return 'text-red-600'
      case 'extract':
        return 'text-blue-600'
      case 'organize':
        return 'text-green-600'
      default:
        return 'text-gray-600'
    }
  }

  if (!fileUrl) {
    return (
      <div 
        className={`border rounded-lg flex items-center justify-center bg-gray-100 dark:bg-gray-700 ${className}`}
        style={{ width, height }}
      >
        <span className="text-gray-500 text-xs">Loading...</span>
      </div>
    )
  }

  return (
    <div 
      className={`relative border-2 rounded-lg overflow-hidden bg-white dark:bg-gray-800 transition-all duration-200 ${
        onToggle ? 'cursor-pointer hover:shadow-md' : ''
      } ${getSelectionColor()} ${className}`}
      style={{ width, height }}
      onClick={handleClick}
    >
      {/* Checkbox */}
      {showCheckbox && onToggle && (
        <div className="absolute top-2 left-2 z-10">
          {isSelected ? (
            <CheckCircle className={`h-6 w-6 ${getCheckboxColor()} bg-white rounded-full`} />
          ) : (
            <Circle className="h-6 w-6 text-gray-400 bg-white rounded-full" />
          )}
        </div>
      )}

      {/* Page Number */}
      <div className="absolute top-2 right-2 z-10 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
        {pageNumber}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-700">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
        </div>
      )}
      
      {/* Error State */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-700">
          <span className="text-gray-500 text-xs text-center px-2">
            Preview unavailable
          </span>
        </div>
      )}

      {/* PDF Page */}
      {!error && (
        <Document
          file={fileUrl}
          onLoadSuccess={onDocumentLoadSuccess}
          onLoadError={onDocumentLoadError}
          loading=""
          error=""
        >
          <Page
            pageNumber={pageNumber}
            width={width - 4} // Account for border
            loading=""
            onLoadError={onPageLoadError}
            renderTextLayer={false}
            renderAnnotationLayer={false}
            className="flex justify-center items-center"
          />
        </Document>
      )}
    </div>
  )
}
