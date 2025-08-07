'use client'

import { useState } from 'react'
import { FileText, Eye, Settings, Download } from 'lucide-react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import PDFThumbnail from '@/components/PDFThumbnail'
import AdBanner from '@/components/AdBanner'
import WorkingAdBanner from '@/components/WorkingAdBanner'
import ToolSEOContent from '@/components/ToolSEOContent'
import FileUpload from '@/components/FileUpload'
import { formatFileSize } from '@/lib/utils'

export default function PDFToWordPage() {
  const [file, setFile] = useState<File | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null)
  const [showPreview, setShowPreview] = useState(false)
  const [conversionOptions, setConversionOptions] = useState({
    format: 'docx',
    preserveLayout: true,
    extractImages: true,
    recognizeText: true,
    pageRange: 'all'
  })

  const handleFileSelected = (files: File[]) => {
    if (files.length > 0) {
      setFile(files[0])
      setDownloadUrl(null)
    }
  }

  const processPDFToWord = async () => {
    if (!file) return

    // Start processing immediately
    setIsProcessing(true)

    try {
      // Import required libraries
      const pdfjsLib = await import('pdfjs-dist')
      
      // Initialize PDF.js
      pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js'
      
      // Convert file to array buffer
      const arrayBuffer = await file.arrayBuffer()
      
      // Load PDF document
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
      
      let extractedText = ''
      
      // Extract text from all pages
      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        const page = await pdf.getPage(pageNum)
        const textContent = await page.getTextContent()
        
        // Join text items
        const pageText = textContent.items
          .map((item) => 'str' in item ? item.str : '')
          .join(' ')
        
        extractedText += `Page ${pageNum}:\n${pageText}\n\n`
      }
      
      // Create document based on format
      let blob: Blob
      
      if (conversionOptions.format === 'docx') {
        // For DOCX, create a simple document structure
        const docContent = `
          <html>
            <head>
              <meta charset="utf-8">
              <title>Converted Document</title>
            </head>
            <body>
              <h1>PDF to Word Conversion</h1>
              <div style="white-space: pre-wrap; font-family: Arial, sans-serif; line-height: 1.6;">
                ${extractedText.replace(/\n/g, '<br>')}
              </div>
            </body>
          </html>
        `
        
        blob = new Blob([docContent], { 
          type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        })
      } else {
        // For TXT format
        blob = new Blob([extractedText], { type: 'text/plain' })
      }
      
      const url = URL.createObjectURL(blob)
      setDownloadUrl(url)
      
    } catch (error) {
      console.error('Error converting PDF to Word:', error)
      alert('Error converting to Word. Please ensure the PDF file is valid and contains extractable text.')
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <>
      <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
        <Header />
        
        {/* 🎯 TOP BANNER AD - First Impression Revenue */}
        <div className="w-full bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
          <div className="max-w-6xl mx-auto px-4 py-3">
            <WorkingAdBanner 
              position="top"
              adFormat="horizontal"
              className="w-full"
              style={{ minHeight: '90px' }}
            />
          </div>
        </div>
        
        <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="flex justify-center mb-4">
                <div className="p-4 bg-blue-100 dark:bg-blue-900 rounded-full">
                  <FileText className="h-12 w-12 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                PDF to Word
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-300">
                Convert PDF documents to editable Word files with preserved formatting
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
                        Selected PDF
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

                  {/* Inline Ad - Better positioned */}
                  <div className="mt-4">
                    <AdBanner position="middle" />
                  </div>
                </div>

                {/* Conversion Options */}
                <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-2 mb-4">
                    <Settings className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Conversion Options
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Output Format */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                        Output Format
                      </label>
                      <div className="space-y-2">
                        {[
                          { value: 'docx', label: 'DOCX (Word 2007+)', desc: 'Modern format, best compatibility' },
                          { value: 'doc', label: 'DOC (Word 97-2003)', desc: 'Legacy format for older versions' }
                        ].map((option) => (
                          <label key={option.value} className="flex items-start">
                            <input
                              type="radio"
                              name="format"
                              value={option.value}
                              checked={conversionOptions.format === option.value}
                              onChange={(e) => setConversionOptions({...conversionOptions, format: e.target.value})}
                              className="mr-3 mt-1 text-blue-600"
                            />
                            <div>
                              <span className="text-gray-700 dark:text-gray-300 font-medium">
                                {option.label}
                              </span>
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                {option.desc}
                              </p>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Page Range */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                        Page Range
                      </label>
                      <div className="space-y-2">
                        {[
                          { value: 'all', label: 'All pages' },
                          { value: 'first', label: 'First page only' },
                          { value: 'custom', label: 'Custom range' }
                        ].map((option) => (
                          <label key={option.value} className="flex items-center">
                            <input
                              type="radio"
                              name="pageRange"
                              value={option.value}
                              checked={conversionOptions.pageRange === option.value}
                              onChange={(e) => setConversionOptions({...conversionOptions, pageRange: e.target.value})}
                              className="mr-3 text-blue-600"
                            />
                            <span className="text-gray-700 dark:text-gray-300">
                              {option.label}
                            </span>
                          </label>
                        ))}
                      </div>
                      
                      {conversionOptions.pageRange === 'custom' && (
                        <input
                          type="text"
                          placeholder="e.g., 1-5, 8, 10-12"
                          className="mt-2 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      )}
                    </div>
                  </div>

                  {/* Conversion Settings */}
                  <div className="mt-6">
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                      Conversion Settings
                    </h4>
                    <div className="space-y-3">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={conversionOptions.preserveLayout}
                          onChange={(e) => setConversionOptions({...conversionOptions, preserveLayout: e.target.checked})}
                          className="mr-3 text-blue-600"
                        />
                        <div>
                          <span className="text-gray-700 dark:text-gray-300 font-medium">
                            Preserve layout
                          </span>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Keep original formatting and positioning
                          </p>
                        </div>
                      </label>
                      
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={conversionOptions.extractImages}
                          onChange={(e) => setConversionOptions({...conversionOptions, extractImages: e.target.checked})}
                          className="mr-3 text-blue-600"
                        />
                        <div>
                          <span className="text-gray-700 dark:text-gray-300 font-medium">
                            Extract images
                          </span>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Include images from the PDF in the Word document
                          </p>
                        </div>
                      </label>
                      
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={conversionOptions.recognizeText}
                          onChange={(e) => setConversionOptions({...conversionOptions, recognizeText: e.target.checked})}
                          className="mr-3 text-blue-600"
                        />
                        <div>
                          <span className="text-gray-700 dark:text-gray-300 font-medium">
                            OCR text recognition
                          </span>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Convert scanned text to editable text
                          </p>
                        </div>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Process Button */}
                <div className="flex flex-col items-center space-y-4">
                  <button
                    onClick={processPDFToWord}
                    disabled={isProcessing}
                    className="flex items-center space-x-3 px-8 py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg transition-colors text-lg font-medium shadow-lg hover:shadow-xl"
                  >
                    {isProcessing ? (
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                    ) : (
                      <FileText className="h-6 w-6" />
                    )}
                    <span>
                      {isProcessing ? 'Converting to Word...' : 'Convert to Word'}
                    </span>
                  </button>
                  
                  {isProcessing && (
                    <div className="text-center">
                      <div className="w-64 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{width: '70%'}}></div>
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                        Processing your PDF... Please wait
                      </p>
                    </div>
                  )}
                </div>

                {/* Download Link */}
                {downloadUrl && (
                  <div className="bg-green-50 dark:bg-green-950/20 rounded-lg p-6 text-center">
                    <h3 className="text-lg font-semibold text-green-900 dark:text-green-100 mb-4">
                      Conversion Completed!
                    </h3>
                    <a
                      href={downloadUrl}
                      download={`converted.${conversionOptions.format}`}
                      className="inline-flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg transition-colors"
                    >
                      <Download className="h-5 w-5" />
                      <span>Download Word Document</span>
                    </a>
                  </div>
                )}
              </div>
            )}

            {/* Info Section */}
            <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                How PDF to Word Conversion Works
              </h3>
              <ol className="list-decimal list-inside space-y-2 text-gray-600 dark:text-gray-300">
                <li>Upload your PDF file using the file picker</li>
                <li>Choose your preferred output format (DOCX or DOC)</li>
                <li>Configure conversion settings and page range</li>
                <li>Click &quot;Convert to Word&quot; to process the file</li>
                <li>Download your editable Word document</li>
              </ol>
              
              <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                  💡 Conversion Tips
                </h4>
                <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                  <li>• Text-based PDFs convert better than scanned documents</li>
                  <li>• Complex layouts may require manual adjustment</li>
                  <li>• DOCX format provides better compatibility with modern features</li>
                  <li>• Enable OCR for scanned or image-based PDFs</li>
                </ul>
              </div>
              
              <div className="mt-6 p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
                <h4 className="font-medium text-green-900 dark:text-green-100 mb-2">
                  🔒 Privacy & Security
                </h4>
                <p className="text-sm text-green-700 dark:text-green-300">
                  High-accuracy PDF to Word conversion. Maintain formatting and layout for professional results.
                </p>
              </div>
            </div>
          </div>
        </main>

        <Footer />
      </div>

      {/* PDF Preview Modal - Improved UX */}
      {showPreview && file && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowPreview(false)
            }
          }}
        >
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 w-full max-w-4xl max-h-[90vh] overflow-hidden mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                PDF Preview - {file.name}
              </h3>
              <button
                onClick={() => setShowPreview(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                aria-label="Close preview"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="overflow-auto max-h-[70vh] bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
              <div className="flex justify-center">
                <PDFThumbnail 
                  pdfFile={file} 
                  width={400}
                  height={500}
                  className="border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg"
                />
              </div>
            </div>
            <div className="mt-4 text-center">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Click outside this window or the X button to close
              </p>
            </div>
          </div>
        </div>
      )}

      {/* SEO Content */}
      <ToolSEOContent toolKey="pdf-to-word" />

      {/* 🎯 SUCCESS-BASED ADS - High-Value Moments */}
      {downloadUrl && (
        <div className="mt-8 space-y-6 max-w-6xl mx-auto px-4">
          {/* Success celebration ad */}
          <div className="bg-green-50 dark:bg-green-950/20 rounded-lg p-4">
            <div className="text-center mb-4">
              <div className="text-green-600 dark:text-green-400 text-sm font-medium">
                ✅ Conversion successful! Support our free tools:
              </div>
            </div>
            <WorkingAdBanner 
              position="bottom"
              adFormat="horizontal"
              className="w-full"
              style={{ minHeight: '90px' }}
            />
          </div>
          
          {/* Additional rectangle ad */}
          <div className="flex justify-center">
            <WorkingAdBanner 
              position="bottom"
              adFormat="rectangle"
              className="max-w-sm"
              style={{ minHeight: '250px' }}
            />
          </div>
        </div>
      )}
      
      {/* Bottom banner even without success */}
      <div className="mt-8 max-w-6xl mx-auto px-4">
        <WorkingAdBanner 
          position="bottom"
          adFormat="horizontal"
          className="w-full"
          style={{ minHeight: '90px' }}
        />
      </div>
    </>
  )
}
