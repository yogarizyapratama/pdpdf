'use client'

import { useState, useCallback } from 'react'
import { Zap, Download, FileText, BarChart3, Eye } from 'lucide-react'
import { PDFDocument } from 'pdf-lib'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import FileUpload from '@/components/FileUpload'
import PDFThumbnail from '@/components/PDFThumbnail'
import AdBanner from '@/components/AdBanner'
import { ProcessingAd, SuccessAd } from '@/components/ProcessingAd'
import { PDFProcessor, ProcessingProgress } from '@/lib/pdf-processor'
import { downloadBlob, formatFileSize } from '@/lib/utils'
import PDFThumbnailsGrid from '@/components/PDFThumbnailsGrid'
import WorkingAdBanner from '@/components/WorkingAdBanner'

type CompressionLevel = 'low' | 'medium' | 'high' | 'maximum'

interface CompressionResult {
  originalSize: number
  compressedSize: number
  compressionRatio: number
  blob: Blob
}

export default function CompressPDFPage() {
  const [file, setFile] = useState<File | null>(null)
  const [compressionLevel, setCompressionLevel] = useState<CompressionLevel>('medium')
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState<ProcessingProgress | null>(null)
  const [error, setError] = useState<string>('')
  const [result, setResult] = useState<CompressionResult | null>(null)
  const [showPreview, setShowPreview] = useState(false)
  const [totalPages, setTotalPages] = useState<number>(0)

  const handleFileSelected = useCallback(async (files: File[]) => {
    if (files.length === 0) return
    
    const selectedFile = files[0]
    setFile(selectedFile)
    setResult(null)
    setError('')
    
    // Count total pages for thumbnail display
    try {
      const arrayBuffer = await selectedFile.arrayBuffer()
      const pdfDoc = await PDFDocument.load(arrayBuffer)
      const pageCount = pdfDoc.getPageCount()
      setTotalPages(pageCount)
    } catch (error) {
      console.error('Error counting PDF pages:', error)
      setTotalPages(0)
    }
  }, [])

  const compressPDF = async () => {
    if (!file) {
      setError('Please select a PDF file');
      return;
    }

    // Skip ad and proceed directly to compression
    await proceedWithCompression();
  }

  const proceedWithCompression = async () => {
    setIsProcessing(true);
    setError('');
    setProgress(null);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('file', file!);
      formData.append('compressionLevel', compressionLevel);

      const response = await fetch('/api/compress-pdf', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || 'Compression failed');
      }

      const blob = await response.blob();
      
      // Get compression stats from response headers
      const originalSize = parseInt(response.headers.get('X-Original-Size') || file!.size.toString());
      const compressedSize = parseInt(response.headers.get('X-Compressed-Size') || blob.size.toString());
      const compressionRatio = parseFloat(response.headers.get('X-Compression-Ratio') || '0');

      setResult({
        originalSize,
        compressedSize,
        compressionRatio: Math.max(0, compressionRatio), // Ensure non-negative
        blob,
      });
    } catch (err) {
      setError('Failed to compress PDF. Please ensure the file is a valid PDF document.');
      console.error('Compression error:', err);
    } finally {
      setIsProcessing(false);
      setProgress(null);
    }
  }

  const downloadCompressed = () => {
    if (result && file) {
      const filename = file.name.replace('.pdf', '_compressed.pdf')
      downloadBlob(result.blob, filename)
    }
  }

  const resetFile = () => {
    setFile(null)
    setResult(null)
    setError('')
    setProgress(null)
    setTotalPages(0)
  }

  const compressionOptions = [
    {
      level: 'low' as const,
      name: 'Low Compression',
      description: 'Minimal compression, preserves original quality',
      recommended: 'For documents requiring perfect quality'
    },
    {
      level: 'medium' as const,
      name: 'Medium Compression',
      description: 'Good balance of size and quality',
      recommended: 'Recommended for most documents'
    },
    {
      level: 'high' as const,
      name: 'High Compression',
      description: 'Significant size reduction with good quality',
      recommended: 'For web sharing and email'
    },
    {
      level: 'maximum' as const,
      name: 'Maximum Compression',
      description: 'Smallest file size, optimized structure',
      recommended: 'For storage and archiving'
    }
  ]

  return (
    <>
      <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
        <Header />
           {/* 🎯 TOP BANNER AD - Prime Real Estate untuk Revenue Maksimal */}
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
                <div className="p-4 bg-purple-100 dark:bg-purple-900 rounded-full">
                  <Zap className="h-12 w-12 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                Compress PDF File
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                Reduce your PDF file size while maintaining quality. Choose from different compression levels based on your needs.
              </p>
            </div>

          {/* Upload Section */}
          {!file && (
            <div className="mb-8">
              <FileUpload 
                onFilesSelected={handleFileSelected}
                multiple={false}
                maxSize={100}
                accept=".pdf"
              />
            </div>
          )}

          {/* File Info & Compression Options */}
          {file && !result && (
            <div className="space-y-8">
              {/* File Info */}
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 sm:p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-lg flex-shrink-0">
                      <FileText className="h-6 w-6 sm:h-8 sm:w-8 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white truncate">
                        {file.name}
                      </h3>
                      <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">
                        Original size: {formatFileSize(file.size)}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <button
                      onClick={() => setShowPreview(true)}
                      className="flex items-center justify-center px-3 sm:px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors"
                    >
                      <Eye className="h-4 w-4 mr-1 sm:mr-2" />
                      <span className="hidden sm:inline">Preview</span>
                    </button>
                    <button
                      onClick={resetFile}
                      className="flex items-center justify-center px-3 sm:px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white text-sm rounded-lg transition-colors"
                    >
                      <FileText className="h-4 w-4 mr-1 sm:mr-2" />
                      <span>Change</span>
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

                {/* Google AdSense - Content Ad (Allowed in content area) */}
                <div className="my-6">
                  <AdBanner position="middle" />
                </div>
              </div>

              {/* Compression Level Selection */}
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 sm:p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 sm:mb-6">
                  Compression Level
                </h3>
                <div className="space-y-3 sm:space-y-4">
                  {compressionOptions.map((option) => (
                    <label 
                      key={option.level}
                      className="flex items-start space-x-3 sm:space-x-4 p-3 sm:p-4 border border-gray-200 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      <input
                        type="radio"
                        name="compressionLevel"
                        value={option.level}
                        checked={compressionLevel === option.level}
                        onChange={(e) => setCompressionLevel(e.target.value as CompressionLevel)}
                        className="w-4 h-4 text-purple-600 mt-1"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mb-1">
                          <div className="font-medium text-gray-900 dark:text-white text-sm sm:text-base">
                            {option.name}
                          </div>
                          {option.level === 'medium' && (
                            <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 text-xs rounded-full self-start">
                              Recommended
                            </span>
                          )}
                        </div>
                        <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-1">
                          {option.description}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-500">
                          {option.recommended}
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Progress */}
              {progress && (
                <div className="bg-purple-50 dark:bg-purple-950/20 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-purple-900 dark:text-purple-100">
                      {progress.stage}
                    </span>
                    <span className="text-sm text-purple-700 dark:text-purple-300">
                      {Math.round(progress.progress)}%
                    </span>
                  </div>
                  <div className="w-full bg-purple-200 dark:bg-purple-800 rounded-full h-2">
                    <div
                      className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${progress.progress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Error */}
              {error && (
                <div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <p className="text-red-700 dark:text-red-300">{error}</p>
                </div>
              )}

              {/* Google AdSense - Above Button (Natural placement) */}
              {!isProcessing && (
                <div className="mb-8">
                  <AdBanner position="middle" />
                </div>
              )}

              {/* Compress Button */}
              <div className="flex justify-center px-4">
                <button
                  onClick={compressPDF}
                  disabled={isProcessing}
                  className="flex items-center justify-center space-x-2 sm:space-x-3 px-6 sm:px-8 py-3 sm:py-4 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg transition-colors text-base sm:text-lg font-medium w-full max-w-xs sm:max-w-sm"
                >
                  <Zap className="h-5 w-5 sm:h-6 sm:w-6 flex-shrink-0" />
                  <span className="truncate">
                    {isProcessing ? 'Compressing...' : 'Compress PDF'}
                  </span>
                </button>
              </div>
            </div>
          )}

          {/* Compression Results */}
          {result && file && (
            <div className="space-y-8">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="text-center mb-6">
                  <div className="p-4 bg-green-100 dark:bg-green-900 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                    <BarChart3 className="h-8 w-8 text-green-600 dark:text-green-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    {result.compressionRatio > 0 ? 'Compression Complete!' : 'File Optimized!'}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    {result.compressionRatio > 0 
                      ? 'Your PDF has been compressed successfully'
                      : 'Your PDF was already well-optimized. No further compression was possible without quality loss.'
                    }
                  </p>
                </div>

                {/* Compression Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                      {formatFileSize(result.originalSize)}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      Original Size
                    </div>
                  </div>
                  
                  <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400 mb-1">
                      {formatFileSize(result.compressedSize)}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      Compressed Size
                    </div>
                  </div>
                  
                  <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600 dark:text-purple-400 mb-1">
                      {result.compressionRatio > 0 ? result.compressionRatio.toFixed(1) : '0'}%
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {result.compressionRatio > 0 ? 'Size Reduction' : 'Already Optimized'}
                    </div>
                    {result.compressionRatio <= 0 && (
                      <div className="text-xs text-gray-400 mt-1">
                        File is already well-compressed
                      </div>
                    )}
                  </div>
                </div>

                {/* Download Button */}
                <div className="flex justify-center space-x-4">
                  <button
                    onClick={downloadCompressed}
                    className="flex items-center space-x-3 px-8 py-4 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors text-lg font-medium"
                  >
                    <Download className="h-6 w-6" />
                    <span>
                      {result.compressionRatio > 0 ? 'Download Compressed PDF' : 'Download Optimized PDF'}
                    </span>
                  </button>
                  
                  <button
                    onClick={resetFile}
                    className="flex items-center space-x-3 px-6 py-4 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors"
                  >
                    <span>Compress Another File</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Info Section */}
          <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              About PDF Compression
            </h3>
            <div className="space-y-4 text-gray-600 dark:text-gray-300">
              <p>
                PDF compression reduces file size by optimizing images, removing unnecessary data, and applying compression algorithms. Choose the right level based on your needs:
              </p>
              <ul className="list-disc list-inside space-y-2">
                <li><strong>High Quality:</strong> Minimal compression, preserves all details - ideal for documents that will be printed</li>
                <li><strong>Balanced:</strong> Good compression with acceptable quality loss - recommended for most use cases</li>
                <li><strong>Maximum Compression:</strong> Aggressive compression for smallest file size - perfect for web sharing</li>
              </ul>
            </div>
            
            <div className="mt-6 p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
              <h4 className="font-medium text-green-900 dark:text-green-100 mb-2">
                🔒 Privacy & Security
              </h4>
              <p className="text-sm text-green-700 dark:text-green-300">
                All compression happens locally in your browser. Your files are never uploaded to our servers, ensuring complete privacy.
              </p>
            </div>
          </div>

          {/* Google AdSense - Footer Banner (Standard placement) */}
          <div className="mt-8">
            <AdBanner position="bottom" />
          </div>
        </div>
      </main>

      <Footer />

      {/* Preview Modal */}
      {showPreview && file && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Preview: {file.name}
              </h3>
              <button
                onClick={() => setShowPreview(false)}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <Eye className="h-5 w-5" />
              </button>
            </div>
            <div className="p-4">
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
    </div>
    </>
  )
}
