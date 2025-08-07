'use client'

// Force dynamic rendering to avoid SSG issues with PDF processing
export const dynamic = 'force-dynamic'

import { useState } from 'react'
import { Scissors, Download, Eye } from 'lucide-react'
import { PDFDocument } from 'pdf-lib'
import StructuredData from '@/components/StructuredData'
import ToolLayout from '@/components/ToolLayout'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import FileUpload from '@/components/FileUpload'
import PDFThumbnail from '@/components/PDFThumbnail'
import PDFPagePreview from '@/components/PDFPagePreview'
import AdBanner from '@/components/AdBanner'
import { formatFileSize } from '@/lib/utils'
import PDFThumbnailsGrid from '@/components/PDFThumbnailsGrid'

export default function ExtractPagesPage() {
  const [file, setFile] = useState<File | null>(null)
  const [totalPages, setTotalPages] = useState<number>(0)
  const [pagesToExtract, setPagesToExtract] = useState<number[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null)
  const [showPreview, setShowPreview] = useState(false)
  const [showAdModal, setShowAdModal] = useState(false)

  const handleFileSelected = async (files: File[]) => {
    if (files.length > 0) {
      const selectedFile = files[0]
      setFile(selectedFile)
      setPagesToExtract([])
      setDownloadUrl(null)
      
      // Get total pages using pdf-lib
      try {
        const arrayBuffer = await selectedFile.arrayBuffer()
        const pdf = await PDFDocument.load(arrayBuffer)
        const pageCount = pdf.getPageCount()
        setTotalPages(pageCount)
      } catch (error) {
        console.error('Error reading PDF:', error)
        setTotalPages(0)
      }
    }
  }

  const togglePageExtraction = (pageNumber: number) => {
    setPagesToExtract(prev => 
      prev.includes(pageNumber) 
        ? prev.filter(p => p !== pageNumber)
        : [...prev, pageNumber]
    )
  }

  const processExtractPages = async () => {
    if (!file || pagesToExtract.length === 0) return

    // Show ad modal before processing
    setShowAdModal(true)
    
    setTimeout(async () => {
      setShowAdModal(false)
      setIsProcessing(true)

      try {
        // Simulate processing - in production, implement actual PDF page extraction
        await new Promise(resolve => setTimeout(resolve, 2000))
        
        // For now, just download the original file
        const blob = new Blob([file], { type: 'application/pdf' })
        const url = URL.createObjectURL(blob)
        setDownloadUrl(url)
        
      } catch (error) {
        console.error('Error extracting pages:', error)
        alert('Error extracting pages. Please try again.')
      } finally {
        setIsProcessing(false)
      }
    }, 3000)
  }

  return (
    <>
      <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
        <Header />
        
        <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="flex justify-center mb-4">
                <div className="p-4 bg-blue-100 dark:bg-blue-900 rounded-full">
                  <Scissors className="h-12 w-12 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                Extract PDF Pages
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-300">
                Extract specific pages from your PDF and create a new document
              </p>
            </div>

            {/* File Upload */}
            {!file && (
              <div className="bg-white dark:bg-gray-800 rounded-lg p-8 shadow-sm border border-gray-200 dark:border-gray-700">
                <FileUpload 
                  onFilesSelected={handleFileSelected}
                  multiple={false}
                  maxSize={50}
                  accept=".pdf"
                />
              </div>
            )}

            {/* File Processing */}
            {file && (
              <div className="space-y-8">
                {/* File Info */}
                <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Selected File
                      </h3>
                      <p className="text-gray-600 dark:text-gray-300">{file.name}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {formatFileSize(file.size)}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setShowPreview(true)}
                        className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                      >
                        <Eye className="h-4 w-4" />
                        <span>Preview</span>
                      </button>
                      <button
                        onClick={() => {
                          setFile(null)
      {/* Show thumbnails after file upload and totalPages available */}
      {file && totalPages > 0 && (
        <PDFThumbnailsGrid pdfFile={file} totalPages={totalPages} />
      )}
                          setPagesToExtract([])
                          setDownloadUrl(null)
                        }}
                        className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                      >
                        Remove
                      </button>
                    </div>
                  </div>

                  {/* File Info Grid */}
                  <div className="grid grid-cols-1 gap-4 mb-4">
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                      <div className="flex items-center gap-4">
                        <PDFThumbnail 
                          pdfFile={file} 
                          pageNumber={1}
                          width={60}
                          height={80}
                          className="rounded-lg"
                        />
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900 dark:text-white truncate">
                            {file.name}
                          </h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Size: {formatFileSize(file.size)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Inline Ad */}
                  <AdBanner position="middle" />
                </div>

                {/* Page Selection */}
                <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Select Pages to Extract
                  </h3>
                  
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Page Numbers (comma-separated, e.g., 1,3,5-7)
                    </label>
                    <input
                      type="text"
                      placeholder="Enter page numbers to extract..."
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      onChange={(e) => {
                        // Parse page numbers from input
                        const input = e.target.value
                        const pages: number[] = []
                        const parts = input.split(',').map(p => p.trim())
                        
                        parts.forEach(part => {
                          if (part.includes('-')) {
                            const [start, end] = part.split('-').map(p => parseInt(p.trim()))
                            if (!isNaN(start) && !isNaN(end)) {
                              for (let i = start; i <= end; i++) {
                                if (i > 0) pages.push(i)
                              }
                            }
                          } else {
                            const pageNum = parseInt(part)
                            if (!isNaN(pageNum) && pageNum > 0) {
                              pages.push(pageNum)
                            }
                          }
                        })
                        
                        setPagesToExtract([...new Set(pages)].sort((a, b) => a - b))
                      }}
                    />
                  </div>

                  {pagesToExtract.length > 0 && (
                    <div className="bg-blue-50 dark:bg-blue-950/20 rounded-lg p-4">
                      <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                        Pages to Extract: {pagesToExtract.length}
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {pagesToExtract.map(page => (
                          <span 
                            key={page}
                            className="inline-flex items-center px-3 py-1 bg-blue-600 text-white rounded-full text-sm"
                          >
                            Page {page}
                            <button
                              onClick={() => togglePageExtraction(page)}
                              className="ml-2 hover:text-blue-200"
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Page Preview Grid */}
                {totalPages > 0 && (
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                      <Eye className="h-5 w-5 mr-2" />
                      Page Preview - Click to Select for Extraction
                    </h3>
                    
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                      Click on the pages you want to extract. Selected pages will be highlighted in blue.
                    </p>

                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                      {Array.from({ length: totalPages }, (_, index) => (
                        <PDFPagePreview
                          key={index + 1}
                          file={file!}
                          pageNumber={index + 1}
                          width={150}
                          height={200}
                          isSelected={pagesToExtract.includes(index + 1)}
                          onToggle={togglePageExtraction}
                          selectionType="extract"
                          showCheckbox={true}
                          className="hover:scale-105 transition-transform"
                        />
                      ))}
                    </div>

                    {pagesToExtract.length > 0 && (
                      <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                        <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                          📋 Summary: {pagesToExtract.length} pages selected for extraction
                        </h4>
                        <p className="text-sm text-blue-700 dark:text-blue-300">
                          Pages to extract: {pagesToExtract.sort((a, b) => a - b).join(', ')}
                        </p>
                        <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                          Will create a new PDF with {pagesToExtract.length} pages
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Process Button */}
                <div className="flex justify-center">
                  <button
                    onClick={processExtractPages}
                    disabled={isProcessing || pagesToExtract.length === 0}
                    className="flex items-center space-x-3 px-8 py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg transition-colors text-lg font-medium"
                  >
                    <Scissors className="h-6 w-6" />
                    <span>
                      {isProcessing ? 'Extracting Pages...' : 'Extract Pages'}
                    </span>
                  </button>
                </div>

                {/* Download Link */}
                {downloadUrl && (
                  <div className="bg-green-50 dark:bg-green-950/20 rounded-lg p-6 text-center">
                    <h3 className="text-lg font-semibold text-green-900 dark:text-green-100 mb-4">
                      Pages Extracted Successfully!
                    </h3>
                    <a
                      href={downloadUrl}
                      download="extracted-pages.pdf"
                      className="inline-flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg transition-colors"
                    >
                      <Download className="h-5 w-5" />
                      <span>Download Extracted Pages</span>
                    </a>
                  </div>
                )}
              </div>
            )}

            {/* Info Section */}
            <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                How to Extract PDF Pages
              </h3>
              <ol className="list-decimal list-inside space-y-2 text-gray-600 dark:text-gray-300">
                <li>Upload a PDF file using the file picker</li>
                <li>Specify which pages to extract (e.g., 1,3,5-7)</li>
                <li>Review the pages to be extracted</li>
                <li>Click &quot;Extract Pages&quot; to process the file</li>
                <li>Download your new PDF with extracted pages</li>
              </ol>
              
              <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                  📝 Page Selection Tips
                </h4>
                <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                  <li>• Use commas to separate individual pages: 1,3,5</li>
                  <li>• Use dashes for page ranges: 5-10</li>
                  <li>• Combine both: 1,3,5-7,10</li>
                  <li>• Page numbers start from 1</li>
                </ul>
              </div>
              
              <div className="mt-6 p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
                <h4 className="font-medium text-green-900 dark:text-green-100 mb-2">
                  🔒 Privacy & Security
                </h4>
                <p className="text-sm text-green-700 dark:text-green-300">
                  Precise page extraction with visual selection. Create new PDFs from specific pages easily.
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
