'use client'

import { useState, useEffect } from 'react'
import { PDFDocument } from 'pdf-lib'
import { PenTool } from 'lucide-react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import FileUpload from '@/components/FileUpload'
import AdBanner from '@/components/AdBanner'
import PDFThumbnail from '@/components/PDFThumbnail'
import PDFThumbnailsGrid from '@/components/PDFThumbnailsGrid'
import SimplePDFSigner from '@/components/SimplePDFSigner'
import BasicPDFSigner from '@/components/BasicPDFSigner'
import HybridPDFSigner from '@/components/HybridPDFSigner'

export default function SignPDFPage() {
  const [file, setFile] = useState<File | null>(null)
  const [showPreview, setShowPreview] = useState(false)
  const [showAdModal, setShowAdModal] = useState(false)
  const [totalPages, setTotalPages] = useState<number>(0)
  const [signerMode, setSignerMode] = useState<'simple' | 'basic' | 'hybrid'>('simple')

  // Load PDF.js if not available
  useEffect(() => {
    if (typeof window !== 'undefined' && !(window as any).pdfjsLib) {
      const script = document.createElement('script')
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.min.js'
      script.async = true
      script.onload = () => {
        console.log('PDF.js loaded successfully')
        // Set worker source after PDF.js loads
        if ((window as any).pdfjsLib) {
          (window as any).pdfjsLib.GlobalWorkerOptions.workerSrc = 
            'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js'
        }
      }
      script.onerror = () => {
        console.error('Failed to load PDF.js')
      }
      document.head.appendChild(script)
    }
  }, [])

  const handleFileSelected = async (files: File[]) => {
    if (files.length > 0) {
      const selectedFile = files[0];
      setFile(selectedFile)
      
      // Count total pages for thumbnail display
      try {
        const arrayBuffer = await selectedFile.arrayBuffer();
        const pdfDoc = await PDFDocument.load(arrayBuffer);
        const pageCount = pdfDoc.getPageCount();
        setTotalPages(pageCount);
      } catch (error) {
        console.error('Error counting PDF pages:', error);
        setTotalPages(0);
      }
    }
  }

  return (
    <>
      <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
        <Header />
        
        <main className="flex-1 container mx-auto px-2 sm:px-4 lg:px-8 py-4 sm:py-8">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="text-center mb-6 sm:mb-8 px-2">
              <div className="flex justify-center mb-4">
                <div className="p-3 sm:p-4 bg-blue-100 dark:bg-blue-900 rounded-full">
                  <PenTool className="h-8 w-8 sm:h-12 sm:w-12 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
              <h1 className="text-2xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                Sign PDF
              </h1>
              <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300">
                Add digital signatures to your PDF documents
              </p>
            </div>

            {/* File Upload */}
            {!file && (
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 sm:p-8 shadow-sm border border-gray-200 dark:border-gray-700 mx-2 sm:mx-0">
                <FileUpload 
                  onFilesSelected={handleFileSelected}
                  multiple={false}
                  maxSize={50}
                  accept=".pdf"
                />
              </div>
            )}

            {/* File Info & Canvas PDF Signer */}
            {file && (
              <div className="space-y-6 sm:space-y-8 mx-2 sm:mx-0">
                {/* File Info with Thumbnails */}
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 sm:p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                        Selected File
                      </h3>
                      <p className="text-gray-600 dark:text-gray-300 truncate">{file.name}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                      <button
                        onClick={() => setShowPreview(true)}
                        className="flex-1 sm:flex-none px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm font-medium"
                      >
                        Preview
                      </button>
                      <button
                        onClick={() => {
                          setFile(null)
                        }}
                        className="flex-1 sm:flex-none px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors text-sm font-medium"
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

                {/* Signer Mode Toggle */}
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 sm:p-6 shadow-sm border border-gray-200 dark:border-gray-700 mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Choose Signing Mode
                  </h3>
                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
                    <button
                      onClick={() => setSignerMode('simple')}
                      className={`flex-1 px-3 sm:px-4 py-3 sm:py-2 rounded-lg transition-colors text-sm sm:text-base truncate ${
                        signerMode === 'simple'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      <span className="block sm:inline">📋 Simple Mode</span>
                      <span className="hidden sm:inline"> (Recommended)</span>
                    </button>
                    <button
                      onClick={() => setSignerMode('basic')}
                      className={`flex-1 px-3 sm:px-4 py-3 sm:py-2 rounded-lg transition-colors text-sm sm:text-base truncate ${
                        signerMode === 'basic'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      🎯 Basic Mode
                    </button>
                    <button
                      onClick={() => setSignerMode('hybrid')}
                      className={`flex-1 px-3 sm:px-4 py-3 sm:py-2 rounded-lg transition-colors text-sm sm:text-base truncate ${
                        signerMode === 'hybrid'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      🔧 Advanced Mode
                    </button>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                    {signerMode === 'simple' 
                      ? 'Uses iframe-based PDF display with overlay signatures - more reliable'
                      : signerMode === 'basic'
                      ? 'Canvas-based preview with guaranteed compatibility'
                      : 'Uses react-pdf rendering with interactive overlays - more features but may have loading issues'
                    }
                  </p>
                </div>

                {/* PDF Signer Component */}
                <div className="bg-white dark:bg-gray-800 rounded-lg p-2 sm:p-4 lg:p-6 shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                  {signerMode === 'simple' && (
                    <SimplePDFSigner 
                      file={file}
                      onFileChange={setFile}
                    />
                  )}
                  {signerMode === 'basic' && (
                    <BasicPDFSigner 
                      file={file}
                    />
                  )}
                  {signerMode === 'hybrid' && (
                    <HybridPDFSigner 
                      file={file}
                    />
                  )}
                </div>
              </div>
            )}

            {/* Info Section */}
            <div className="mt-6 sm:mt-8 bg-white dark:bg-gray-800 rounded-lg p-4 sm:p-6 shadow-sm border border-gray-200 dark:border-gray-700 mx-2 sm:mx-0">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                How to Sign PDFs
              </h3>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                {/* Simple Mode Instructions */}
                <div className="bg-blue-50 dark:bg-blue-950/20 rounded-lg p-4">
                  <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                    📋 Simple Mode (Recommended)
                  </h4>
                  <ol className="list-decimal list-inside space-y-1 text-sm text-blue-700 dark:text-blue-300">
                    <li>Upload a PDF file using the file picker</li>
                    <li>Enter your signature text in the input field</li>
                    <li>Adjust font size if needed</li>
                    <li>Click &ldquo;Add Signature&rdquo; to enable placement mode</li>
                    <li>Click anywhere on the PDF to place signatures</li>
                    <li>Drag signatures to reposition them</li>
                    <li>Navigate between pages to sign multiple pages</li>
                    <li>Click &ldquo;Sign &amp; Download PDF&rdquo; to get your signed document</li>
                  </ol>
                  <div className="mt-2 text-xs text-blue-600 dark:text-blue-400">
                    ✅ More reliable, works on all browsers
                  </div>
                </div>

                {/* Advanced Mode Instructions */}
                <div className="bg-green-50 dark:bg-green-950/20 rounded-lg p-4">
                  <h4 className="font-medium text-green-900 dark:text-green-100 mb-2">
                    🔧 Advanced Mode
                  </h4>
                  <ol className="list-decimal list-inside space-y-1 text-sm text-green-700 dark:text-green-300">
                    <li>Upload PDF and wait for rendering</li>
                    <li>Enter signature text in the input field</li>
                    <li>Click &ldquo;Add Signature&rdquo; to enable signature mode</li>
                    <li>Click anywhere on the PDF canvas to place signatures</li>
                    <li>Drag signatures to reposition as needed</li>
                    <li>Use zoom controls for precise placement</li>
                    <li>Navigate between pages using controls</li>
                    <li>Click &ldquo;Sign &amp; Download PDF&rdquo; to export</li>
                  </ol>
                  <div className="mt-2 text-xs text-green-600 dark:text-green-400">
                    ⚠️ May have loading issues on some browsers
                  </div>
                </div>
              </div>
              
              <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg">
                <h4 className="font-medium text-yellow-900 dark:text-yellow-100 mb-2">
                  💡 Pro Tips
                </h4>
                <ul className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
                  <li>• <strong>Choose Simple Mode</strong> if you experience PDF loading issues</li>
                  <li>• <strong>Test signatures</strong> on page 1 before signing all pages</li>
                  <li>• <strong>Use larger font sizes</strong> for better visibility in printed documents</li>
                  <li>• <strong>Place signatures away from text</strong> to avoid overlapping content</li>
                  <li>• <strong>Download immediately</strong> after signing to avoid losing your work</li>
                </ul>
              </div>
              
              <div className="mt-6 p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
                <h4 className="font-medium text-green-900 dark:text-green-100 mb-2">
                  🔒 Privacy & Security
                </h4>
                <p className="text-sm text-green-700 dark:text-green-300">
                  All PDF signing happens locally in your browser using react-pdf for display and PDF-lib for processing. 
                  Your documents and signatures are never uploaded to our servers.
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
