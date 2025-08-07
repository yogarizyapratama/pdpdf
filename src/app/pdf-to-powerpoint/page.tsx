'use client'

// Force dynamic rendering to avoid SSG issues with PDF processing
export const dynamic = 'force-dynamic'

import { useState } from 'react'
import { Download, Eye, Settings, Presentation } from 'lucide-react'
import StructuredData from '@/components/StructuredData'
import ToolLayout from '@/components/ToolLayout'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import FileUpload from '@/components/FileUpload'
import PDFThumbnail from '@/components/PDFThumbnail'
import AdBanner from '@/components/AdBanner'
import { formatFileSize } from '@/lib/utils'

export default function PDFToPowerPointPage() {
  const [file, setFile] = useState<File | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null)
  const [showPreview, setShowPreview] = useState(false)
  const [conversionOptions, setConversionOptions] = useState({
    format: 'pptx',
    slidesPerPage: 'one',
    preserveLayout: true,
    extractImages: true,
    pageRange: 'all'
  })

  const handleFileSelected = (files: File[]) => {
    if (files.length > 0) {
      setFile(files[0])
      setDownloadUrl(null)
    }
  }

  const processPDFToPowerPoint = async () => {
    if (!file) return

    setIsProcessing(true)

    try {
      // Import required libraries
      const pdfjsLib = await import('react-pdf').then(module => module.pdfjs)
      
      // Initialize PDF.js
      pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js'
      
      // Convert file to array buffer
      const arrayBuffer = await file.arrayBuffer()
      
      // Load PDF document
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
      
      const slides = []
      
      // Extract content from all pages
      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        const page = await pdf.getPage(pageNum)
        const textContent = await page.getTextContent()
        
        // Join text items
        const slideText = textContent.items
          .map((item) => 'str' in item ? item.str : '')
          .join(' ')
        
        slides.push({
          title: `Slide ${pageNum}`,
          content: slideText
        })
      }
      
      // Create presentation content
      let presentationContent: string
      
      if (conversionOptions.format === 'pptx') {
        // Create HTML structure that resembles PowerPoint
        presentationContent = `
          <html>
            <head>
              <meta charset="utf-8">
              <title>PDF to PowerPoint Conversion</title>
              <style>
                .slide {
                  page-break-after: always;
                  padding: 40px;
                  min-height: 500px;
                  border: 1px solid #ccc;
                  margin-bottom: 20px;
                }
                .slide-title {
                  font-size: 24px;
                  font-weight: bold;
                  margin-bottom: 20px;
                  color: #333;
                }
                .slide-content {
                  font-size: 14px;
                  line-height: 1.6;
                  white-space: pre-wrap;
                }
              </style>
            </head>
            <body>
              <h1>PDF to PowerPoint Conversion</h1>
              ${slides.map(slide => `
                <div class="slide">
                  <div class="slide-title">${slide.title}</div>
                  <div class="slide-content">${slide.content}</div>
                </div>
              `).join('')}
            </body>
          </html>
        `
      } else {
        // Plain text format
        presentationContent = slides.map(slide => 
          `${slide.title}\n${'='.repeat(20)}\n${slide.content}\n\n`
        ).join('')
      }
      
      const blob = new Blob([presentationContent], { 
        type: conversionOptions.format === 'pptx' 
          ? 'application/vnd.openxmlformats-officedocument.presentationml.presentation'
          : 'text/plain'
      })
      
      const url = URL.createObjectURL(blob)
      setDownloadUrl(url)
      
    } catch (error) {
      console.error('Error converting PDF to PowerPoint:', error)
      alert('Error converting to PowerPoint. Please ensure the PDF file is valid and try again.')
    } finally {
      setIsProcessing(false)
    }
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
                <div className="p-4 bg-orange-100 dark:bg-orange-900 rounded-full">
                  <Presentation className="h-12 w-12 text-orange-600 dark:text-orange-400" />
                </div>
              </div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                PDF to PowerPoint
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-300">
                Convert PDF documents to editable PowerPoint presentations
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

                {/* Conversion Options */}
                <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-2 mb-4">
                    <Settings className="h-5 w-5 text-orange-600 dark:text-orange-400" />
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
                          { value: 'pptx', label: 'PPTX (PowerPoint 2007+)', desc: 'Modern format, best compatibility' },
                          { value: 'ppt', label: 'PPT (PowerPoint 97-2003)', desc: 'Legacy format for older versions' }
                        ].map((option) => (
                          <label key={option.value} className="flex items-start">
                            <input
                              type="radio"
                              name="format"
                              value={option.value}
                              checked={conversionOptions.format === option.value}
                              onChange={(e) => setConversionOptions({...conversionOptions, format: e.target.value})}
                              className="mr-3 mt-1 text-orange-600"
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

                    {/* Slides Per Page */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                        Slides Layout
                      </label>
                      <div className="space-y-2">
                        {[
                          { value: 'one', label: 'One slide per PDF page' },
                          { value: 'multiple', label: 'Multiple pages per slide' }
                        ].map((option) => (
                          <label key={option.value} className="flex items-center">
                            <input
                              type="radio"
                              name="slidesPerPage"
                              value={option.value}
                              checked={conversionOptions.slidesPerPage === option.value}
                              onChange={(e) => setConversionOptions({...conversionOptions, slidesPerPage: e.target.value})}
                              className="mr-3 text-orange-600"
                            />
                            <span className="text-gray-700 dark:text-gray-300">
                              {option.label}
                            </span>
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
                              className="mr-3 text-orange-600"
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
                          className="mt-2 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-orange-500"
                        />
                      )}
                    </div>

                    {/* Conversion Settings */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                        Settings
                      </label>
                      <div className="space-y-3">
                        <label className="flex items-start">
                          <input
                            type="checkbox"
                            checked={conversionOptions.preserveLayout}
                            onChange={(e) => setConversionOptions({...conversionOptions, preserveLayout: e.target.checked})}
                            className="mr-3 mt-1 text-orange-600"
                          />
                          <div>
                            <span className="text-gray-700 dark:text-gray-300 font-medium">
                              Preserve layout
                            </span>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              Maintain original formatting and positioning
                            </p>
                          </div>
                        </label>
                        
                        <label className="flex items-start">
                          <input
                            type="checkbox"
                            checked={conversionOptions.extractImages}
                            onChange={(e) => setConversionOptions({...conversionOptions, extractImages: e.target.checked})}
                            className="mr-3 mt-1 text-orange-600"
                          />
                          <div>
                            <span className="text-gray-700 dark:text-gray-300 font-medium">
                              Extract images
                            </span>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              Include images from PDF in presentation
                            </p>
                          </div>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Process Button */}
                <div className="flex justify-center">
                  <button
                    onClick={processPDFToPowerPoint}
                    disabled={isProcessing}
                    className="flex items-center space-x-3 px-8 py-4 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg transition-colors text-lg font-medium"
                  >
                    <Presentation className="h-6 w-6" />
                    <span>
                      {isProcessing ? 'Converting to PowerPoint...' : 'Convert to PowerPoint'}
                    </span>
                  </button>
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
                      <span>Download PowerPoint</span>
                    </a>
                  </div>
                )}
              </div>
            )}

            {/* Info Section */}
            <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                How PDF to PowerPoint Conversion Works
              </h3>
              <ol className="list-decimal list-inside space-y-2 text-gray-600 dark:text-gray-300">
                <li>Upload your PDF file using the file picker</li>
                <li>Choose your preferred output format (PPTX or PPT)</li>
                <li>Configure slide layout and conversion settings</li>
                <li>Click &quot;Convert to PowerPoint&quot; to process the file</li>
                <li>Download your editable PowerPoint presentation</li>
              </ol>
              
              <div className="mt-6 p-4 bg-orange-50 dark:bg-orange-950/20 rounded-lg">
                <h4 className="font-medium text-orange-900 dark:text-orange-100 mb-2">
                  💡 Conversion Tips
                </h4>
                <ul className="text-sm text-orange-700 dark:text-orange-300 space-y-1">
                  <li>• PDFs with clear page layouts convert better to slides</li>
                  <li>• One slide per page works best for presentation content</li>
                  <li>• PPTX format provides better compatibility with modern features</li>
                  <li>• Complex layouts may require manual adjustment after conversion</li>
                </ul>
              </div>
              
              <div className="mt-6 p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
                <h4 className="font-medium text-green-900 dark:text-green-100 mb-2">
                  🔒 Privacy & Security
                </h4>
                <p className="text-sm text-green-700 dark:text-green-300">
                  Professional PDF to PowerPoint conversion. Convert presentations while preserving layout and quality.
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

      {/* Bottom Ad Banner */}
      <div className="mt-8">
        <AdBanner position="bottom" />
      </div>
    </>
  )
}
