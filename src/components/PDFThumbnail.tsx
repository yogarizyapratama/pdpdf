'use client'

import { useState, useEffect } from 'react'
import { Document, Page, pdfjs } from 'react-pdf'
import '@/lib/pdf-config' // Initialize PDF.js worker

interface PDFThumbnailProps {
  pdfFile: File | ArrayBuffer
  width?: number
  height?: number
  className?: string
  pageNumber?: number
  onClick?: () => void
}

export default function PDFThumbnail({ 
  pdfFile, 
  width = 120, 
  height = 160, 
  className = '',
  pageNumber = 1,
  onClick
}: PDFThumbnailProps) {
  const [numPages, setNumPages] = useState<number>(0)
  const [fileUrl, setFileUrl] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    if (pdfFile instanceof File || pdfFile instanceof Blob) {
      const url = URL.createObjectURL(pdfFile)
      setFileUrl(url)
      setLoading(true)
      setError(false)
      return () => {
        URL.revokeObjectURL(url)
      }
    } else if (pdfFile) {
      // If ArrayBuffer, convert to Blob
      const blob = new Blob([pdfFile], { type: 'application/pdf' })
      const url = URL.createObjectURL(blob)
      setFileUrl(url)
      setLoading(true)
      setError(false)
      return () => {
        URL.revokeObjectURL(url)
      }
    }
  }, [pdfFile])

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages)
    setLoading(false)
  }

  const onDocumentLoadError = (error: Error) => {
    console.warn('PDF thumbnail load error:', error)
    setError(true)
    setLoading(false)
  }

  const onPageLoadError = (error: Error) => {
    console.warn('PDF page load error:', error)
    setError(true)
    setLoading(false)
  }

  if (!fileUrl) {
    return (
      <div 
        className={`border border-gray-200 dark:border-gray-600 rounded-lg flex items-center justify-center bg-gray-100 dark:bg-gray-700 ${className}`}
        style={{ width, height }}
      >
        <span className="text-gray-500 text-xs">No file</span>
      </div>
    )
  }

  return (
    <div 
      className={`relative border border-gray-200 dark:border-gray-600 rounded-lg overflow-hidden bg-white dark:bg-gray-800 ${onClick ? 'cursor-pointer hover:border-blue-400 transition-colors' : ''} ${className}`}
      style={{ width, height }}
      onClick={onClick}
    >
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
        </div>
      )}
      
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-700">
          <span className="text-gray-500 text-xs text-center px-2">
            Preview unavailable
          </span>
        </div>
      )}

      {!error && (
        <Document
          file={fileUrl}
          onLoadSuccess={onDocumentLoadSuccess}
          onLoadError={onDocumentLoadError}
          loading=""
          error=""
        >
          <Page
            pageNumber={Math.min(pageNumber, numPages)}
            width={width - 2} // Account for border
            loading=""
            onLoadError={onPageLoadError}
            renderTextLayer={false}
            renderAnnotationLayer={false}
          />
        </Document>
      )}
      
      {/* Page count indicator */}
      {numPages > 1 && !loading && !error && (
        <div className="absolute bottom-1 right-1 bg-black bg-opacity-70 text-white text-xs px-1 py-0.5 rounded">
          {numPages} pages
        </div>
      )}
    </div>
  )
}
