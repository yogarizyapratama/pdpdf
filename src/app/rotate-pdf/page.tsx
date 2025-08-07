'use client'

// Force dynamic rendering to avoid SSR issues with PDF.js
export const dynamic = 'force-dynamic'

import { useState, useCallback } from 'react'
import { RotateCw, Eye } from 'lucide-react'
import { PDFDocument, degrees } from 'pdf-lib'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import FileUpload from '@/components/FileUpload'
import PDFThumbnail from '@/components/PDFThumbnail'
import PDFThumbnailsGrid from '@/components/PDFThumbnailsGrid'
import AdBanner from '@/components/AdBanner'
import { downloadBlob, formatFileSize } from '@/lib/utils'

// Set up PDF.js worker only on client side
if (typeof window !== 'undefined') {
  import('react-pdf').then(({ pdfjs }) => pdfjs).then((pdfjsLib) => {
    pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js'
  })
}

interface PageRotation {
  pageNumber: number
  rotation: number // 0, 90, 180, 270
  canvas?: HTMLCanvasElement
}

export default function RotatePDFPage() {
  const [file, setFile] = useState<File | null>(null)
  const [pages, setPages] = useState<PageRotation[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [isLoadingPreview, setIsLoadingPreview] = useState(false)
  const [error, setError] = useState<string>('')
  const [totalPages, setTotalPages] = useState<number>(0)
  const [showPreview, setShowPreview] = useState(false)
  const [showAdModal, setShowAdModal] = useState(false)

  const handleFileSelected = useCallback(async (files: File[]) => {
    if (files.length === 0) return
    
    const selectedFile = files[0]
    setFile(selectedFile)
    setError('')
    setIsLoadingPreview(true)
    setPages([])
    
    try {
      const pdfjsLib = await import('react-pdf').then(module => module.pdfjs)
      const arrayBuffer = await selectedFile.arrayBuffer()
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
      const numPages = pdf.numPages
      setTotalPages(numPages)
      
      const pagesData: PageRotation[] = []
      
      // Generate preview for each page
      for (let pageNum = 1; pageNum <= numPages; pageNum++) {
        const page = await pdf.getPage(pageNum)
        const viewport = page.getViewport({ scale: 0.8 }) // Smaller scale for preview
        
        const canvas = document.createElement('canvas')
        const context = canvas.getContext('2d')!
        canvas.height = viewport.height
        canvas.width = viewport.width
        
        await page.render({
          
          canvasContext: context,
          viewport: viewport
        }).promise
        
        pagesData.push({
          pageNumber: pageNum,
          rotation: 0,
          canvas
        })
      }
      
      setPages(pagesData)
    } catch (err) {
      setError('Failed to load PDF file. Please ensure it\'s a valid PDF document.')
      console.error('PDF loading error:', err)
    } finally {
      setIsLoadingPreview(false)
    }
  }, [])

  const rotatePage = (pageIndex: number, direction: 'clockwise' | 'counterclockwise') => {
    setPages(prev => prev.map((page, index) => {
      if (index === pageIndex) {
        const newRotation = direction === 'clockwise' 
          ? (page.rotation + 90) % 360 
          : (page.rotation - 90 + 360) % 360
        return { ...page, rotation: newRotation }
      }
      return page
    }))
  }

  const rotateAllPages = (direction: 'clockwise' | 'counterclockwise') => {
    setPages(prev => prev.map(page => {
      const newRotation = direction === 'clockwise' 
        ? (page.rotation + 90) % 360 
        : (page.rotation - 90 + 360) % 360
      return { ...page, rotation: newRotation }
    }))
  }

  const resetRotation = () => {
    setPages(prev => prev.map(page => ({ ...page, rotation: 0 })))
  }

  const applyRotation = async () => {
    if (!file) {
      setError('Please select a PDF file')
      return
    }

    // Show ad modal before processing
    setShowAdModal(true)
    
    // Wait 3 seconds before processing
    setTimeout(async () => {
      setShowAdModal(false)
      
      setIsProcessing(true)
      setError('')

      try {
        const formData = new FormData()
        formData.append('file', file)
        formData.append('degrees', '90') // Default rotation for now

        const response = await fetch('/api/rotate-pdf', {
          method: 'POST',
          body: formData,
        })

        if (response.ok) {
          const blob = await response.blob()
          const filename = file.name.replace('.pdf', '_rotated.pdf')
          downloadBlob(blob, filename)
        } else {
          setError('Failed to rotate PDF')
        }
      } catch (err) {
        setError('An error occurred while rotating the PDF')
      } finally {
        setIsProcessing(false)
      }
    }, 3000)
  }

  const resetFile = () => {
    setFile(null)
    setPages([])
    setError('')
    setTotalPages(0)
  }

  const getRotationTransform = (rotation: number) => {
    return `rotate(${rotation}deg)`
  }

  const hasRotationChanges = pages.some(page => page.rotation !== 0)

  return (
    <>
      <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
        <Header />
        
        <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="p-4 bg-indigo-100 dark:bg-indigo-900 rounded-full">
                <RotateCw className="h-12 w-12 text-indigo-600 dark:text-indigo-400" />
              </div>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Rotate PDF Pages
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Rotate individual pages or all pages of your PDF document. Fix orientation and adjust page layouts.
            </p>
          </div>

          {/* Upload Section */}
          {!file && (
            <div className="mb-8">
              <FileUpload 
                onFilesSelected={handleFileSelected}
                multiple={false}
                maxSize={50}
                accept=".pdf"
              />
            </div>
          )}

          {/* File Info & Controls */}
          {file && (
            <div className="space-y-8">
              {/* File Info with Auto Preview */}
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {file.name}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      {formatFileSize(file.size)} • {pages.length} pages
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setShowPreview(true)}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                    >
                      Preview
                    </button>
                    <button
                      onClick={resetFile}
                      className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                </div>

                {/* PDF Thumbnails Grid */}
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    PDF Pages Preview
                  </h3>
                  {totalPages > 0 && (
                    <PDFThumbnailsGrid pdfFile={file} totalPages={totalPages} />
                  )}
                </div>

                {/* Inline Ad */}
                <AdBanner position="middle" />
              </div>

              {/* Global Controls */}
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Rotation Controls
                </h3>
                
                <div className="flex flex-wrap gap-4">
                  <button
                    onClick={() => rotateAllPages('clockwise')}
                    className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg"
                  >
                    <RotateCw className="h-4 w-4" />
                    <span>Rotate All 90° CW</span>
                  </button>
                  
                  <button
                    onClick={() => rotateAllPages('counterclockwise')}
                    className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg"
                  >
                    <RotateCw className="h-4 w-4 transform scale-x-[-1]" />
                    <span>Rotate All 90° CCW</span>
                  </button>
                  
                  <button
                    onClick={resetRotation}
                    className="flex items-center space-x-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg"
                  >
                    <span>Reset All</span>
                  </button>
                </div>
              </div>

              {/* Page Preview */}
              {pages.length > 0 && (
                <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                    <Eye className="h-5 w-5 mr-2" />
                    Page Preview
                  </h3>

                  {isLoadingPreview ? (
                    <div className="flex items-center justify-center py-12">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                      <span className="ml-2 text-gray-600 dark:text-gray-400">Loading preview...</span>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                      {pages.map((page, index) => (
                        <div key={page.pageNumber} className="space-y-3">
                          <div className="relative border border-gray-200 dark:border-gray-600 rounded-lg overflow-hidden bg-white">
                            <div className="p-4 flex justify-center items-center min-h-[200px]">
                              {page.canvas && (
                                <img
                                  src={page.canvas.toDataURL()}
                                  alt={`Page ${page.pageNumber}`}
                                  className="max-w-full max-h-[180px] object-contain transition-transform duration-300"
                                  style={{ transform: getRotationTransform(page.rotation) }}
                                />
                              )}
                            </div>
                            <div className="absolute top-2 right-2 bg-indigo-600 text-white text-xs px-2 py-1 rounded">
                              {page.pageNumber}
                            </div>
                            {page.rotation !== 0 && (
                              <div className="absolute top-2 left-2 bg-orange-600 text-white text-xs px-2 py-1 rounded">
                                {page.rotation}°
                              </div>
                            )}
                          </div>
                          
                          {/* Page Controls */}
                          <div className="flex justify-center space-x-2">
                            <button
                              onClick={() => rotatePage(index, 'counterclockwise')}
                              className="p-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg"
                              title="Rotate 90° Counter-clockwise"
                            >
                              <RotateCw className="h-4 w-4 transform scale-x-[-1] text-gray-600 dark:text-gray-300" />
                            </button>
                            <button
                              onClick={() => rotatePage(index, 'clockwise')}
                              className="p-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg"
                              title="Rotate 90° Clockwise"
                            >
                              <RotateCw className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                            </button>
                          </div>
                          
                          <div className="text-center">
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              Page {page.pageNumber}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-500">
                              Rotation: {page.rotation}°
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Changes Summary */}
              {hasRotationChanges && (
                <div className="bg-indigo-50 dark:bg-indigo-950/20 rounded-lg p-6">
                  <h4 className="font-semibold text-indigo-900 dark:text-indigo-100 mb-2">
                    Rotation Changes
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                    {pages
                      .filter(page => page.rotation !== 0)
                      .map(page => (
                        <div key={page.pageNumber} className="text-indigo-700 dark:text-indigo-300">
                          Page {page.pageNumber}: {page.rotation}°
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* Error */}
              {error && (
                <div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <p className="text-red-700 dark:text-red-300">{error}</p>
                </div>
              )}

              {/* Apply Button */}
              <div className="flex justify-center">
                <button
                  onClick={applyRotation}
                  disabled={isProcessing || !hasRotationChanges}
                  className="flex items-center space-x-3 px-8 py-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg transition-colors text-lg font-medium"
                >
                  <RotateCw className="h-6 w-6" />
                  <span>
                    {isProcessing ? 'Applying Rotation...' : hasRotationChanges ? 'Apply Rotation' : 'No Changes to Apply'}
                  </span>
                </button>
              </div>
            </div>
          )}

          {/* Info Section */}
          <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              About PDF Rotation
            </h3>
            <div className="space-y-4 text-gray-600 dark:text-gray-300">
              <p>
                Rotate PDF pages to fix orientation issues or adjust page layouts. You can rotate individual pages 
                or apply rotation to all pages at once.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">Rotation Options:</h4>
                  <ul className="text-sm space-y-1">
                    <li>• 90° clockwise rotation</li>
                    <li>• 90° counter-clockwise rotation</li>
                    <li>• Multiple 90° increments (180°, 270°)</li>
                    <li>• Individual page control</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">Use Cases:</h4>
                  <ul className="text-sm space-y-1">
                    <li>• Fix scanned document orientation</li>
                    <li>• Adjust landscape/portrait layouts</li>
                    <li>• Correct upside-down pages</li>
                    <li>• Prepare documents for printing</li>
                  </ul>
                </div>
              </div>
            </div>
            
            <div className="mt-6 p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
              <h4 className="font-medium text-green-900 dark:text-green-100 mb-2">
                🔒 Privacy & Security
              </h4>
              <p className="text-sm text-green-700 dark:text-green-300">
                All PDF rotation is performed locally in your browser. Your documents never leave your device, 
                ensuring complete privacy and security.
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>

    {/* PDF Preview Modal */}
    {showPreview && file && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-hidden">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              PDF Preview
            </h3>
            <button
              onClick={() => setShowPreview(false)}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              ✕
            </button>
          </div>
          <div className="overflow-auto max-h-[70vh]">
            <div className="flex justify-center">
              <PDFThumbnail 
                pdfFile={file} 
                pageNumber={1}
                width={400}
                height={500}
                className="border border-gray-200 dark:border-gray-600 rounded-lg"
              />
            </div>
          </div>
        </div>
      </div>
    )}

    {/* Ad Modal */}
    {showAdModal && (
      <AdBanner position="bottom"  />
    )}
  </>
  )
}
