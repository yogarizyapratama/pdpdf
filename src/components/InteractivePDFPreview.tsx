'use client'

import { useState, useEffect, useRef } from 'react'
import { Document, Page, pdfjs } from 'react-pdf'
import '@/lib/pdf-config' // Initialize PDF.js worker

interface Signature {
  id: string
  x: number
  y: number
  width: number
  height: number
  pageNumber: number
}

interface InteractivePDFPreviewProps {
  file: File | Blob
  width?: number
  className?: string
  signatures: Signature[]
  onSignatureAdd: (signature: Omit<Signature, 'id'>) => void
  onSignatureRemove: (id: string) => void
  isSignatureMode?: boolean
}

export default function InteractivePDFPreview({ 
  file, 
  width = 600, 
  className = '',
  signatures,
  onSignatureAdd,
  onSignatureRemove,
  isSignatureMode = false
}: InteractivePDFPreviewProps) {
  const [numPages, setNumPages] = useState<number>(0)
  const [fileUrl, setFileUrl] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [scale, setScale] = useState(1)
  const containerRef = useRef<HTMLDivElement>(null)

  // Debug info
  useEffect(() => {
    console.log('InteractivePDFPreview component mounted')
    console.log('PDF.js worker source:', pdfjs.GlobalWorkerOptions.workerSrc)
    console.log('PDF.js version:', pdfjs.version)
  }, [])

  useEffect(() => {
    if (file) {
      console.log('Loading PDF file:', file instanceof File ? file.name : 'blob', 'Size:', file.size)
      const url = URL.createObjectURL(file)
      setFileUrl(url)
      setLoading(true)
      setError(false)
      
      return () => {
        URL.revokeObjectURL(url)
      }
    }
  }, [file])

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    console.log('PDF loaded successfully with', numPages, 'pages')
    setNumPages(numPages)
    setLoading(false)
    setError(false)
  }

  const onDocumentLoadError = (error: Error) => {
    console.error('Error loading PDF:', error)
    console.error('PDF.js worker source:', pdfjs.GlobalWorkerOptions.workerSrc)
    setError(true)
    setLoading(false)
  }

  const handlePageClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!isSignatureMode) return

    const rect = event.currentTarget.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top

    // Convert to PDF coordinates (relative to page size)
    const relativeX = (x / rect.width) * 100
    const relativeY = (y / rect.height) * 100

    const newSignature = {
      x: relativeX,
      y: relativeY,
      width: 20, // 20% of page width
      height: 8,  // 8% of page height
      pageNumber: currentPage
    }

    onSignatureAdd(newSignature)
  }

  const handleSignatureClick = (event: React.MouseEvent, signatureId: string) => {
    event.stopPropagation()
    onSignatureRemove(signatureId)
  }

  const currentPageSignatures = signatures.filter(sig => sig.pageNumber === currentPage)

  return (
    <div className={`relative ${className}`}>
      {loading && (
        <div 
          className="flex items-center justify-center bg-gray-100 dark:bg-gray-700 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600"
          style={{ width, minHeight: '400px' }}
        >
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Loading PDF...</p>
          </div>
        </div>
      )}

      {error && (
        <div 
          className="flex items-center justify-center bg-red-50 dark:bg-red-900/20 rounded-lg border-2 border-dashed border-red-300 dark:border-red-600"
          style={{ width, minHeight: '400px' }}
        >
          <div className="text-center">
            <p className="text-sm text-red-600 dark:text-red-400">Failed to load PDF</p>
            <button 
              onClick={() => {
                setError(false)
                setLoading(true)
              }}
              className="mt-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {!loading && !error && fileUrl && (
        <div className="relative">
          <Document
            file={fileUrl}
            onLoadSuccess={onDocumentLoadSuccess}
            onLoadError={onDocumentLoadError}
            loading={
              <div 
                className="flex items-center justify-center bg-gray-100 dark:bg-gray-700 rounded-lg border border-gray-300 dark:border-gray-600"
                style={{ width, minHeight: '400px' }}
              >
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Loading PDF...</p>
                </div>
              </div>
            }
            error={
              <div 
                className="flex items-center justify-center bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-300 dark:border-red-600"
                style={{ width, minHeight: '400px' }}
              >
                <div className="text-center">
                  <p className="text-sm text-red-600 dark:text-red-400">Failed to load PDF document</p>
                  <button 
                    onClick={() => window.location.reload()}
                    className="mt-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm transition-colors"
                  >
                    Refresh Page
                  </button>
                </div>
              </div>
            }
            options={{
              cMapUrl: 'https://unpkg.com/pdfjs-dist@3.11.174/cmaps/',
              cMapPacked: true,
              standardFontDataUrl: 'https://unpkg.com/pdfjs-dist@3.11.174/standard_fonts/',
              verbosity: 0
            }}
            className="pdf-document"
          >
            <div 
              ref={containerRef}
              className={`relative ${isSignatureMode ? 'cursor-crosshair' : 'cursor-default'}`}
              onClick={handlePageClick}
            >
              <Page
                pageNumber={currentPage}
                width={width}
                scale={scale}
                renderTextLayer={false}
                renderAnnotationLayer={false}
                loading={
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                    <span className="ml-2 text-sm text-gray-500">Loading page {currentPage}...</span>
                  </div>
                }
                error={
                  <div className="text-center py-8">
                    <p className="text-red-600 mb-2">Error loading page {currentPage}</p>
                    <button 
                      onClick={() => window.location.reload()}
                      className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-sm"
                    >
                      Refresh
                    </button>
                  </div>
                }
              />
              
              {/* Render signatures on current page */}
              {currentPageSignatures.map((signature) => (
                <div
                  key={signature.id}
                  className="absolute border-2 border-blue-500 bg-blue-100/20 dark:bg-blue-900/20 cursor-pointer hover:bg-blue-200/30 dark:hover:bg-blue-800/30 transition-colors"
                  style={{
                    left: `${signature.x}%`,
                    top: `${signature.y}%`,
                    width: `${signature.width}%`,
                    height: `${signature.height}%`,
                  }}
                  onClick={(e) => handleSignatureClick(e, signature.id)}
                  title="Click to remove signature"
                >
                  <div className="flex items-center justify-center h-full text-xs text-blue-700 dark:text-blue-300 font-medium">
                    📝 Signature
                  </div>
                </div>
              ))}

              {/* Signature mode overlay */}
              {isSignatureMode && (
                <div className="absolute inset-0 bg-blue-500/5 pointer-events-none">
                  <div className="absolute top-2 left-2 bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                    Click to place signature
                  </div>
                </div>
              )}
            </div>
          </Document>

          {/* Page Navigation */}
          {numPages > 1 && (
            <div className="flex items-center justify-center gap-4 mt-4">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage <= 1}
                className="px-3 py-2 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
              >
                Previous
              </button>
              
              <span className="text-sm text-gray-600 dark:text-gray-300">
                Page {currentPage} of {numPages}
              </span>
              
              <button
                onClick={() => setCurrentPage(prev => Math.min(numPages, prev + 1))}
                disabled={currentPage >= numPages}
                className="px-3 py-2 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
              >
                Next
              </button>
            </div>
          )}

          {/* Zoom Controls */}
          <div className="flex items-center justify-center gap-2 mt-2">
            <button
              onClick={() => setScale(prev => Math.max(0.5, prev - 0.1))}
              className="px-2 py-1 bg-gray-600 hover:bg-gray-700 text-white rounded text-sm"
            >
              -
            </button>
            <span className="text-sm text-gray-600 dark:text-gray-300 min-w-16 text-center">
              {Math.round(scale * 100)}%
            </span>
            <button
              onClick={() => setScale(prev => Math.min(2, prev + 0.1))}
              className="px-2 py-1 bg-gray-600 hover:bg-gray-700 text-white rounded text-sm"
            >
              +
            </button>
          </div>

          {/* Page info */}
          {numPages > 0 && (
            <div className="text-center mt-2">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {numPages} page{numPages !== 1 ? 's' : ''}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
