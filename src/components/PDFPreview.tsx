'use client'

import { useState, useEffect } from 'react'
import { Document, Page, pdfjs } from 'react-pdf'
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from 'lucide-react'
import '@/lib/pdf-config' // Initialize PDF.js worker

interface PDFPreviewProps {
  file: File | Blob
  className?: string
  height?: number
}

export default function PDFPreview({ file, className = '', height = 300 }: PDFPreviewProps) {
  const [numPages, setNumPages] = useState<number>(0)
  const [pageNumber, setPageNumber] = useState<number>(1)
  const [scale, setScale] = useState<number>(0.6)
  const [fileUrl, setFileUrl] = useState<string>('')

  useEffect(() => {
    if (file) {
      const url = URL.createObjectURL(file)
      setFileUrl(url)
      
      return () => {
        URL.revokeObjectURL(url)
      }
    }
  }, [file])

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages)
    setPageNumber(1)
  }

  const previousPage = () => {
    setPageNumber(prev => Math.max(prev - 1, 1))
  }

  const nextPage = () => {
    setPageNumber(prev => Math.min(prev + 1, numPages))
  }

  const zoomIn = () => {
    setScale(prev => Math.min(prev + 0.2, 2.0))
  }

  const zoomOut = () => {
    setScale(prev => Math.max(prev - 0.2, 0.4))
  }

  if (!fileUrl) {
    return (
      <div className={`bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center ${className}`} style={{ height }}>
        <div className="text-gray-500 dark:text-gray-400">Loading PDF...</div>
      </div>
    )
  }

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden ${className}`}>
      {/* Compact Controls */}
      <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
        <div className="flex items-center space-x-1">
          <button
            onClick={previousPage}
            disabled={pageNumber <= 1}
            className="p-1 rounded text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="h-3 w-3" />
          </button>
          
          <span className="text-xs text-gray-700 dark:text-gray-300 px-1">
            {numPages > 0 ? `${pageNumber}/${numPages}` : 'Loading...'}
          </span>
          
          <button
            onClick={nextPage}
            disabled={pageNumber >= numPages}
            className="p-1 rounded text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronRight className="h-3 w-3" />
          </button>
        </div>

        <div className="flex items-center space-x-1">
          <button
            onClick={zoomOut}
            className="p-1 rounded text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
          >
            <ZoomOut className="h-3 w-3" />
          </button>
          
          <span className="text-xs text-gray-700 dark:text-gray-300 px-1">
            {Math.round(scale * 100)}%
          </span>
          
          <button
            onClick={zoomIn}
            className="p-1 rounded text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
          >
            <ZoomIn className="h-3 w-3" />
          </button>
        </div>
      </div>

      {/* PDF Viewer */}
      <div className="overflow-auto bg-gray-100 dark:bg-gray-900" style={{ height: height - 40 }}>
        <div className="flex justify-center p-2">
          <Document
            file={fileUrl}
            onLoadSuccess={onDocumentLoadSuccess}
            onLoadError={(error) => {
              console.warn('PDF load error:', error)
            }}
            loading={
              <div className="flex items-center justify-center p-8">
                <div className="text-gray-500 dark:text-gray-400">Loading PDF...</div>
              </div>
            }
            error={
              <div className="flex items-center justify-center p-8">
                <div className="text-red-500">
                  Failed to load PDF. Please check your internet connection and try again.
                </div>
              </div>
            }
          >
            <Page
              pageNumber={pageNumber}
              scale={scale}
              renderTextLayer={true}
              renderAnnotationLayer={true}
              loading={
                <div className="flex items-center justify-center p-4">
                  <div className="text-gray-500 dark:text-gray-400">Loading page...</div>
                </div>
              }
              className="shadow-sm rounded"
            />
          </Document>
        </div>
      </div>
    </div>
  )
}
