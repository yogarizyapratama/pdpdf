"use client"

// Force dynamic rendering to avoid SSG issues with PDF processing
export const dynamic = 'force-dynamic'

import { useState, useCallback } from 'react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import PDFPreview from '@/components/PDFPreview'
import PDFThumbnail from '@/components/PDFThumbnail'
import { Merge, RotateCcw, Download, EyeOff } from 'lucide-react'
import SortableFileCard from '@/components/SortableFileCard'
import AdBanner from '@/components/AdBanner'
import AdSenseAd from '@/components/AdSenseAd'
import WorkingAdBanner from '@/components/WorkingAdBanner'
import StructuredData from '@/components/StructuredData'
import { PDFProcessor, ProcessingProgress } from '@/lib/pdf-processor'
import { downloadBlob, generateId } from '@/lib/utils'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import PDFThumbnailsGrid from '@/components/PDFThumbnailsGrid'
import FileUpload from '@/components/FileUpload'
import Head from 'next/head'

interface FileWithId {
  id: string
  file: File
}

export default function MergePDFPage() {
  const [filesWithIds, setFilesWithIds] = useState<FileWithId[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState<ProcessingProgress | null>(null)
  const [error, setError] = useState<string>('')
  const [previewFile, setPreviewFile] = useState<File | null>(null)
  const [totalPages, setTotalPages] = useState<number>(0)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleFilesSelected = useCallback((files: File[]) => {
    const newFilesWithIds = files.map(file => ({
      id: generateId(),
      file
    }))
    setFilesWithIds(prev => [...prev, ...newFilesWithIds])
    setError('')
  }, [])

  const removeFile = useCallback((id: string) => {
    setFilesWithIds(prev => prev.filter(f => f.id !== id))
  }, [])

  const moveFileUp = useCallback((id: string) => {
    setFilesWithIds(prev => {
      const index = prev.findIndex(f => f.id === id)
      if (index > 0) {
        return arrayMove(prev, index, index - 1)
      }
      return prev
    })
  }, [])

  const moveFileDown = useCallback((id: string) => {
    setFilesWithIds(prev => {
      const index = prev.findIndex(f => f.id === id)
      if (index < prev.length - 1) {
        return arrayMove(prev, index, index + 1)
      }
      return prev
    })
  }, [])

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event

    if (active.id !== over?.id) {
      setFilesWithIds(prev => {
        const oldIndex = prev.findIndex(f => f.id === active.id)
        const newIndex = prev.findIndex(f => f.id === over!.id)
        return arrayMove(prev, oldIndex, newIndex)
      })
    }
  }, [])

  const mergePDFs = async () => {
    if (filesWithIds.length < 2) {
      setError('Please select at least 2 PDF files to merge')
      return
    }

    setIsProcessing(true)
    setError('')
    setProgress(null)

    try {
      const files = filesWithIds.map(f => f.file)
      const mergedPdfBytes = await PDFProcessor.mergePDFs(files, setProgress)
      
      const blob = new Blob([mergedPdfBytes], { type: 'application/pdf' })
      downloadBlob(blob, 'merged-document.pdf')
        
    } catch (err) {
      setError('Failed to merge PDFs. Please ensure all files are valid PDF documents.')
      console.error('Merge error:', err)
    } finally {
      setIsProcessing(false)
      setProgress(null)
    }
  }

  const resetFiles = () => {
    setFilesWithIds([])
    setError('')
    setProgress(null)
  }

  return (
    <>
      <Head>
        <title>Merge PDF Online Free - Combine Multiple PDF Files | PDF All-in-One</title>
        <meta name="description" content="Merge PDF files online for free. Combine multiple PDFs into one document. No registration, watermarks, or file size limits. Fast, secure, and easy to use." />
        <meta name="keywords" content="merge PDF, combine PDF, join PDF files, PDF merger online, merge PDF free, combine PDF online, PDF joiner" />
        <link rel="canonical" href="https://pdf-all-in-one.com/merge-pdf" />
        <meta property="og:title" content="Merge PDF Online Free - Combine Multiple PDF Files" />
        <meta property="og:description" content="Merge PDF files online for free. Combine multiple PDFs into one document. No registration, watermarks, or file size limits." />
        <meta property="og:url" content="https://pdf-all-in-one.com/merge-pdf" />
        <meta property="og:type" content="website" />
      </Head>
      
      <StructuredData 
        tool={{
          name: "Merge PDF Online",
          description: "Combine multiple PDF files into one document online for free",
          url: "https://pdf-all-in-one.com/merge-pdf",
          category: "organize"
        }}
      />
      
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
              <div className="p-4 bg-blue-100 dark:bg-blue-900 rounded-full">
                <Merge className="h-12 w-12 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Merge PDF Files
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Combine multiple PDF documents into a single file. Reorder files by dragging and dropping to organize your merged document.
            </p>
          </div>

          {/* Upload Section */}
          {filesWithIds.length === 0 && (
            <div className="mb-8">
              <FileUpload 
                onFilesSelected={handleFilesSelected}
                multiple={true}
                maxSize={50}
                accept=".pdf"
              />
              
              {/* 🎯 MID-CONTENT AD - High Engagement Zone */}
              <div className="mt-8">
                <WorkingAdBanner 
                  position="middle"
                  adFormat="rectangle"
                  className="max-w-md mx-auto"
                  style={{ minHeight: '250px' }}
                />
              </div>
            </div>
          )}

          {/* File List */}
          {filesWithIds.length > 0 && (
            <div className="mb-8">
              {/* 🎯 AFTER UPLOAD AD - User engaged, ready to see ads */}
              <div className="mb-6">
                <WorkingAdBanner 
                  position="middle"
                  adFormat="horizontal"
                  className="w-full max-w-4xl mx-auto"
                  style={{ minHeight: '90px' }}
                />
              </div>
              
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Files to Merge ({filesWithIds.length})
                </h2>
                <div className="flex space-x-3">
                  <FileUpload 
                    onFilesSelected={handleFilesSelected}
                    multiple={true}
                    maxSize={50}
                    accept=".pdf"
                    className="inline-block"
                  >
                    <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm">
                      Add More Files
                    </button>
                  </FileUpload>
                  
                  <button
                    onClick={resetFiles}
                    className="flex items-center space-x-2 px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors text-sm"
                  >
                    <RotateCcw className="h-4 w-4" />
                    <span>Reset</span>
                  </button>
                </div>
              </div>

              {/* Sortable File Grid */}
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={filesWithIds.map(f => f.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {filesWithIds.map((fileWithId, index) => (
                      <SortableFileCard
                        key={fileWithId.id}
                        fileWithId={fileWithId}
                        index={index}
                        onRemove={removeFile}
                        onMoveUp={moveFileUp}
                        onMoveDown={moveFileDown}
                        canMoveUp={index > 0}
                        canMoveDown={index < filesWithIds.length - 1}
                        onPreview={setPreviewFile}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>

              {/* Progress */}
              {progress && (
                <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
                      {progress.stage}
                    </span>
                    <span className="text-sm text-blue-700 dark:text-blue-300">
                      {progress.currentFile}/{progress.totalFiles}
                    </span>
                  </div>
                  <div className="w-full bg-blue-200 dark:bg-blue-800 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${progress.progress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Error */}
              {error && (
                <div className="mt-6 p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <p className="text-red-700 dark:text-red-300">{error}</p>
                </div>
              )}

              {/* Inline Ad before Merge Button */}
              {filesWithIds.length >= 2 && !isProcessing && (
                <div className="mt-6">
                  <AdBanner position="middle" />
                </div>
              )}

              {/* Merge Button */}
              <div className="mt-8 flex justify-center">
                <button
                  onClick={mergePDFs}
                  disabled={isProcessing || filesWithIds.length < 2}
                  className="flex items-center space-x-3 px-8 py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg transition-colors text-lg font-medium"
                >
                  <Download className="h-6 w-6" />
                  <span>
                    {isProcessing ? 'Merging PDFs...' : 'Merge PDFs'}
                  </span>
                </button>
              </div>
            </div>
          )}

          {/* Info Section */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              How to Merge PDFs
            </h3>
            <ol className="list-decimal list-inside space-y-2 text-gray-600 dark:text-gray-300">
              <li>Upload multiple PDF files using the file picker or drag and drop</li>
              <li>Arrange the files in your desired order by dragging or using the arrow buttons</li>
              <li>Click &quot;Merge PDFs&quot; to combine all files into a single document</li>
              <li>Download the merged PDF file to your device</li>
            </ol>
            
            <div className="mt-6 p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
              <h4 className="font-medium text-green-900 dark:text-green-100 mb-2">
                🔒 Privacy & Security
              </h4>
              <p className="text-sm text-green-700 dark:text-green-300">
                Fast and reliable PDF processing with advanced features. Upload your files and get professional results instantly.
              </p>
            </div>
          </div>

          {/* Ad Space */}
          <div className="mt-8 bg-gray-100 dark:bg-gray-800 rounded-lg p-6 text-center">
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">Advertisement</p>
            <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded flex items-center justify-center">
              <span className="text-gray-400 text-sm">Sidebar Ad 300x250</span>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>

      {/* Preview Modal */}
      {previewFile && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Preview: {previewFile.name}
              </h3>
              <button
                onClick={() => setPreviewFile(null)}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <EyeOff className="h-5 w-5" />
              </button>
            </div>
            <div className="p-4">
              <PDFPreview file={previewFile} height={600} />
            </div>
          </div>
        </div>
      )}

            {/* PDF Thumbnails Preview */}
      {previewFile && totalPages > 0 && (
        <PDFThumbnailsGrid pdfFile={previewFile} totalPages={totalPages} />
      )}
      
      {/* 🎯 BOTTOM BANNER AD - Exit Intent Revenue */}
      <div className="mt-8 mb-4 max-w-6xl mx-auto px-4">
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
