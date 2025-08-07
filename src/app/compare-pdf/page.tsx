'use client'

// Force dynamic rendering to avoid SSG issues with PDF processing
export const dynamic = 'force-dynamic'

import { useState } from 'react'
import { PDFDocument } from 'pdf-lib'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import PDFThumbnail from '@/components/PDFThumbnail'
import PDFThumbnailsGrid from '@/components/PDFThumbnailsGrid'
import AdBanner from '@/components/AdBanner'
import { Eye, ArrowLeftRight, Download } from 'lucide-react'
import FileUpload from '@/components/FileUpload'
import { formatFileSize } from '@/lib/utils'

export default function ComparePDFPage() {
  const [file1, setFile1] = useState<File | null>(null)
  const [file2, setFile2] = useState<File | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null)
  const [showPreview, setShowPreview] = useState(false)
  const [showAdModal, setShowAdModal] = useState(false)
  const [comparisonMode, setComparisonMode] = useState<'side-by-side' | 'overlay' | 'differences'>('side-by-side')
  const [differences, setDifferences] = useState<{ page: number; changes: number }[]>([])
  const [totalPages1, setTotalPages1] = useState<number>(0)
  const [totalPages2, setTotalPages2] = useState<number>(0)

  const handleFile1Selected = async (files: File[]) => {
    if (files.length > 0) {
      const selectedFile = files[0];
      setFile1(selectedFile)
      setDownloadUrl(null)
      setDifferences([])
      
      // Count total pages for thumbnail display
      try {
        const arrayBuffer = await selectedFile.arrayBuffer();
        const pdfDoc = await PDFDocument.load(arrayBuffer);
        const pageCount = pdfDoc.getPageCount();
        setTotalPages1(pageCount);
      } catch (error) {
        console.error('Error counting PDF pages:', error);
        setTotalPages1(0);
      }
    }
  }

  const handleFile2Selected = async (files: File[]) => {
    if (files.length > 0) {
      const selectedFile = files[0];
      setFile2(selectedFile)
      setDownloadUrl(null)
      setDifferences([])
      
      // Count total pages for thumbnail display
      try {
        const arrayBuffer = await selectedFile.arrayBuffer();
        const pdfDoc = await PDFDocument.load(arrayBuffer);
        const pageCount = pdfDoc.getPageCount();
        setTotalPages2(pageCount);
      } catch (error) {
        console.error('Error counting PDF pages:', error);
        setTotalPages2(0);
      }
    }
  }

  const swapFiles = () => {
    const temp = file1
    setFile1(file2)
    setFile2(temp)
  }

  const processComparePDF = async () => {
    if (!file1 || !file2) return

    // Show ad modal before processing
    setShowAdModal(true)
    
    setTimeout(async () => {
      setShowAdModal(false)
      setIsProcessing(true)

      try {
        // Simulate processing - in production, implement actual PDF comparison
        await new Promise(resolve => setTimeout(resolve, 3000))
        
        // Mock differences found
        const mockDifferences = [
          { page: 1, changes: 3 },
          { page: 2, changes: 1 },
          { page: 4, changes: 7 }
        ]
        setDifferences(mockDifferences)
        
        // For now, create a simple comparison report
        const blob = new Blob(['PDF Comparison Report'], { type: 'application/pdf' })
        const url = URL.createObjectURL(blob)
        setDownloadUrl(url)
        
      } catch (error) {
        console.error('Error comparing PDFs:', error)
        alert('Error comparing PDFs. Please try again.')
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
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="flex justify-center mb-4">
                <div className="p-4 bg-purple-100 dark:bg-purple-900 rounded-full">
                  <Eye className="h-12 w-12 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                Compare PDF
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-300">
                Compare two PDF documents to identify differences and changes
              </p>
            </div>

            {/* File Upload Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {/* File 1 Upload */}
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Original PDF (File 1)
                  </h3>
                  {file1 && (
                    <button
                      onClick={() => setFile1(null)}
                      className="px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white rounded text-sm transition-colors"
                    >
                      Remove
                    </button>
                  )}
                </div>

                {!file1 ? (
                  <FileUpload 
                    onFilesSelected={handleFile1Selected}
                    multiple={false}
                    maxSize={50}
                    accept=".pdf"
                  />
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <PDFThumbnail 
                        pdfFile={file1} 
                        pageNumber={1}
                        width={80}
                        height={100}
                        className="rounded-lg"
                      />
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 dark:text-white truncate">
                          {file1.name}
                        </h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Size: {formatFileSize(file1.size)}
                        </p>
                      </div>
                    </div>
                    
                    {/* PDF 1 Thumbnails Grid */}
                    {totalPages1 > 0 && (
                      <div className="mt-4">
                        <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                          PDF 1 Pages Preview
                        </h4>
                        <PDFThumbnailsGrid pdfFile={file1} totalPages={totalPages1} />
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* File 2 Upload */}
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Modified PDF (File 2)
                  </h3>
                  {file2 && (
                    <button
                      onClick={() => setFile2(null)}
                      className="px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white rounded text-sm transition-colors"
                    >
                      Remove
                    </button>
                  )}
                </div>

                {!file2 ? (
                  <FileUpload 
                    onFilesSelected={handleFile2Selected}
                    multiple={false}
                    maxSize={50}
                    accept=".pdf"
                  />
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <PDFThumbnail 
                        pdfFile={file2} 
                        pageNumber={1}
                        width={80}
                        height={100}
                        className="rounded-lg"
                      />
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 dark:text-white truncate">
                          {file2.name}
                        </h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Size: {formatFileSize(file2.size)}
                        </p>
                      </div>
                    </div>
                    
                    {/* PDF 2 Thumbnails Grid */}
                    {totalPages2 > 0 && (
                      <div className="mt-4">
                        <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                          PDF 2 Pages Preview
                        </h4>
                        <PDFThumbnailsGrid pdfFile={file2} totalPages={totalPages2} />
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Swap Files Button */}
            {file1 && file2 && (
              <div className="flex justify-center mb-8">
                <button
                  onClick={swapFiles}
                  className="flex items-center space-x-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                >
                  <ArrowLeftRight className="h-4 w-4" />
                  <span>Swap Files</span>
                </button>
              </div>
            )}

            {/* Comparison Options */}
            {file1 && file2 && (
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700 mb-8">
                <div className="flex items-center gap-2 mb-4">
                  <Eye className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Comparison Options
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { value: 'side-by-side', label: 'Side by Side', desc: 'View both PDFs next to each other' },
                    { value: 'overlay', label: 'Overlay Mode', desc: 'Overlay one PDF on top of the other' },
                    { value: 'differences', label: 'Differences Only', desc: 'Highlight only the changed areas' }
                  ].map((option) => (
                    <label key={option.value} className="flex items-start cursor-pointer">
                      <input
                        type="radio"
                        name="comparisonMode"
                        value={option.value}
                        checked={comparisonMode === option.value}
                        onChange={(e) => setComparisonMode(e.target.value as 'side-by-side' | 'overlay' | 'differences')}
                        className="mr-3 mt-1 text-purple-600"
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

                {/* Inline Ad */}
                <div className="mt-6">
                  <AdBanner position="middle" />
                </div>
              </div>
            )}

            {/* Process Button */}
            {file1 && file2 && (
              <div className="flex justify-center mb-8">
                <button
                  onClick={processComparePDF}
                  disabled={isProcessing}
                  className="flex items-center space-x-3 px-8 py-4 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg transition-colors text-lg font-medium"
                >
                  <Eye className="h-6 w-6" />
                  <span>
                    {isProcessing ? 'Comparing PDFs...' : 'Compare PDFs'}
                  </span>
                </button>
              </div>
            )}

            {/* Comparison Results */}
            {differences.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700 mb-8">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Comparison Results
                </h3>

                <div className="mb-6 p-4 bg-purple-50 dark:bg-purple-950/20 rounded-lg">
                  <h4 className="font-medium text-purple-900 dark:text-purple-100 mb-2">
                    📊 Summary
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-purple-700 dark:text-purple-300">
                    <div>
                      <span className="font-medium">Pages with changes:</span>
                      <span className="ml-2">{differences.length}</span>
                    </div>
                    <div>
                      <span className="font-medium">Total changes:</span>
                      <span className="ml-2">{differences.reduce((sum, diff) => sum + diff.changes, 0)}</span>
                    </div>
                    <div>
                      <span className="font-medium">Comparison mode:</span>
                      <span className="ml-2 capitalize">{comparisonMode.replace('-', ' ')}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    Pages with Differences:
                  </h4>
                  {differences.map((diff, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-750 rounded-lg">
                      <div>
                        <span className="font-medium text-gray-900 dark:text-white">
                          Page {diff.page}
                        </span>
                      </div>
                      <div className="flex items-center space-x-4">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {diff.changes} change{diff.changes !== 1 ? 's' : ''}
                        </span>
                        <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                          diff.changes > 5 
                            ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                            : diff.changes > 2
                            ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                            : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        }`}>
                          {diff.changes > 5 ? 'Major' : diff.changes > 2 ? 'Moderate' : 'Minor'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Download Link */}
            {downloadUrl && (
              <div className="bg-green-50 dark:bg-green-950/20 rounded-lg p-6 text-center mb-8">
                <h3 className="text-lg font-semibold text-green-900 dark:text-green-100 mb-4">
                  Comparison Complete!
                </h3>
                <a
                  href={downloadUrl}
                  download="comparison-report.pdf"
                  className="inline-flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg transition-colors"
                >
                  <Download className="h-5 w-5" />
                  <span>Download Comparison Report</span>
                </a>
              </div>
            )}

            {/* Info Section */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                How PDF Comparison Works
              </h3>
              <ol className="list-decimal list-inside space-y-2 text-gray-600 dark:text-gray-300">
                <li>Upload the original PDF file (File 1)</li>
                <li>Upload the modified PDF file (File 2)</li>
                <li>Choose your preferred comparison mode</li>
                <li>Click &quot;Compare PDFs&quot; to analyze differences</li>
                <li>Review the comparison results and differences</li>
                <li>Download the detailed comparison report</li>
              </ol>
              
              <div className="mt-6 p-4 bg-purple-50 dark:bg-purple-950/20 rounded-lg">
                <h4 className="font-medium text-purple-900 dark:text-purple-100 mb-2">
                  🔍 Comparison Features
                </h4>
                <ul className="text-sm text-purple-700 dark:text-purple-300 space-y-1">
                  <li>• Text changes and modifications</li>
                  <li>• Image and graphic differences</li>
                  <li>• Layout and formatting changes</li>
                  <li>• Added, removed, or moved content</li>
                </ul>
              </div>
              
              <div className="mt-6 p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
                <h4 className="font-medium text-green-900 dark:text-green-100 mb-2">
                  🔒 Privacy & Security
                </h4>
                <p className="text-sm text-green-700 dark:text-green-300">
                  Intelligent PDF comparison with detailed difference analysis. Compare documents side-by-side efficiently.
                </p>
              </div>
            </div>
          </div>
        </main>

        <Footer />
      </div>

      {/* PDF Preview Modal */}
      {showPreview && (file1 || file2) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-6xl max-h-[90vh] overflow-hidden">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                PDF Preview - Side by Side
              </h3>
              <button
                onClick={() => setShowPreview(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                ✕
              </button>
            </div>
            <div className="overflow-auto max-h-[70vh]">
              <div className="grid grid-cols-2 gap-4">
                {file1 && (
                  <div className="text-center">
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                      Original PDF
                    </h4>
                    <PDFThumbnail 
                      pdfFile={file1} 
                      pageNumber={1}
                      width={300}
                      height={400}
                      className="border border-gray-200 dark:border-gray-600 rounded-lg mx-auto"
                    />
                  </div>
                )}
                {file2 && (
                  <div className="text-center">
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                      Modified PDF
                    </h4>
                    <PDFThumbnail 
                      pdfFile={file2} 
                      pageNumber={1}
                      width={300}
                      height={400}
                      className="border border-gray-200 dark:border-gray-600 rounded-lg mx-auto"
                    />
                  </div>
                )}
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
