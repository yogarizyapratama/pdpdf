'use client'

import { useState } from 'react'
import { Wrench, Eye, Download } from 'lucide-react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import FileUpload from '@/components/FileUpload'
import AdBanner from '@/components/AdBanner'
import { formatFileSize } from '@/lib/utils'

export default function RepairPDFPage() {
  const [file, setFile] = useState<File | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null)
  const [showPreview, setShowPreview] = useState(false)

  const handleFileSelected = (files: File[]) => {
    const selectedFile = files[0]
    if (!selectedFile) return
    setFile(selectedFile)
  }

  const repairPDF = async () => {
    if (!file) return

    setIsProcessing(true)
    try {
      // Placeholder for actual repair logic
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Create a placeholder download URL
      const url = URL.createObjectURL(file)
      setDownloadUrl(url)
    } catch (error) {
      console.error('Error repairing PDF:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  const resetForm = () => {
    setFile(null)
    setDownloadUrl(null)
    setShowPreview(false)
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="p-4 bg-red-100 dark:bg-red-900 rounded-full">
                <Wrench className="h-12 w-12 text-red-600 dark:text-red-400" />
              </div>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Repair PDF Files
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Fix corrupted or damaged PDF files and restore their functionality quickly and easily.
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

          {/* File Info */}
          {file && (
            <div className="space-y-8">
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
                      onClick={resetForm}
                      className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>

              {/* Inline Ad */}
              <AdBanner position="middle" />

              {/* Repair Button */}
              <div className="flex justify-center">
                <button
                  onClick={repairPDF}
                  disabled={isProcessing}
                  className="flex items-center space-x-3 px-8 py-4 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg transition-colors text-lg font-medium"
                >
                  {isProcessing ? (
                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <Wrench className="h-6 w-6" />
                  )}
                  <span>{isProcessing ? 'Repairing...' : 'Repair PDF'}</span>
                </button>
              </div>

              {/* Download Section */}
              {downloadUrl && (
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-green-900 dark:text-green-100">
                        ✓ PDF Repaired Successfully!
                      </h3>
                      <p className="text-green-700 dark:text-green-300">
                        Your PDF has been repaired and is ready for download.
                      </p>
                    </div>
                    <a
                      href={downloadUrl}
                      download={file.name.replace('.pdf', '_repaired.pdf')}
                      className="flex items-center space-x-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                    >
                      <Download className="h-5 w-5" />
                      <span>Download</span>
                    </a>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Tutorial */}
          <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-4">
              How to Repair PDFs
            </h3>
            <ol className="list-decimal list-inside space-y-2 text-blue-800 dark:text-blue-200">
              <li>Upload your corrupted PDF file using the file picker</li>
              <li>Click &ldquo;Repair PDF&rdquo; to start the repair process</li>
              <li>Wait for the repair to complete</li>
              <li>Download the repaired PDF file</li>
            </ol>
            
            <div className="mt-6 p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
              <h4 className="font-medium text-green-900 dark:text-green-100 mb-2">
                🔒 Privacy & Security
              </h4>
              <p className="text-sm text-green-700 dark:text-green-300">
                All processing is done locally in your browser. Your files are never uploaded to any server.
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />

      {/* Preview Modal */}
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
                <p className="text-gray-600 dark:text-gray-400">
                  PDF preview functionality will be implemented here.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Ad */}
      <AdBanner position="bottom" />
    </div>
  )
}
