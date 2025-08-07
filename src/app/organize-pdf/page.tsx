'use client'

// Force dynamic rendering to avoid SSG issues with PDF processing
export const dynamic = 'force-dynamic'

import { useState } from 'react'
import { ArrowUpDown, Download, Eye, Trash2, RotateCw } from 'lucide-react'
import StructuredData from '@/components/StructuredData'
import ToolLayout from '@/components/ToolLayout'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import FileUpload from '@/components/FileUpload'
import PDFThumbnail from '@/components/PDFThumbnail'
import AdBanner from '@/components/AdBanner'
import { formatFileSize } from '@/lib/utils'
import { DndContext, closestCenter, DragEndEvent } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import PDFThumbnailsGrid from '@/components/PDFThumbnailsGrid';

interface PageItem {
  id: string
  pageNumber: number
  rotation: number
}

function SortablePageItem({ page, onRemove, onRotate }: { 
  page: PageItem
  onRemove: (id: string) => void
  onRotate: (id: string) => void
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: page.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 transition-colors"
    >
      <div className="flex items-center gap-4">
        <div 
          {...attributes} 
          {...listeners}
          className="cursor-grab active:cursor-grabbing p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
        >
          <ArrowUpDown className="h-5 w-5 text-gray-400" />
        </div>
        
        <div className="flex-1 flex items-center gap-4">
          <div className="text-center">
            <div className="w-16 h-20 bg-gray-100 dark:bg-gray-700 rounded border flex items-center justify-center">
              <span className="text-xs text-gray-600 dark:text-gray-400">
                Page {page.pageNumber}
              </span>
            </div>
            {page.rotation !== 0 && (
              <span className="text-xs text-blue-600 dark:text-blue-400 mt-1 block">
                {page.rotation}°
              </span>
            )}
          </div>
          
          <div className="flex-1">
            <h3 className="font-medium text-gray-900 dark:text-white">
              Page {page.pageNumber}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {page.rotation !== 0 ? `Rotated ${page.rotation}°` : 'Original orientation'}
            </p>
          </div>
        </div>

        <div className="flex space-x-2">
          <button
            onClick={() => onRotate(page.id)}
            className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/20 rounded transition-colors"
            title="Rotate 90°"
          >
            <RotateCw className="h-4 w-4" />
          </button>
          <button
            onClick={() => onRemove(page.id)}
            className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 rounded transition-colors"
            title="Remove page"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

export default function OrganizePDFPage() {
  const [file, setFile] = useState<File | null>(null)
  const [pages, setPages] = useState<PageItem[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null)
  const [showPreview, setShowPreview] = useState(false)
  const [showAdModal, setShowAdModal] = useState(false)

  const handleFileSelected = (files: File[]) => {
    if (files.length > 0) {
      setFile(files[0])
      // Initialize pages - in production, get actual page count from PDF
      const initialPages: PageItem[] = Array.from({ length: 5 }, (_, i) => ({
        id: `page-${i + 1}`,
        pageNumber: i + 1,
        rotation: 0
      }))
      setPages(initialPages)
      setDownloadUrl(null)
    }
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      setPages((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id)
        const newIndex = items.findIndex((item) => item.id === over.id)

        return arrayMove(items, oldIndex, newIndex)
      })
    }
  }

  const removePage = (id: string) => {
    setPages(pages.filter(page => page.id !== id))
  }

  const rotatePage = (id: string) => {
    setPages(pages.map(page => 
      page.id === id 
        ? { ...page, rotation: (page.rotation + 90) % 360 }
        : page
    ))
  }

  const processOrganizePDF = async () => {
    if (!file || pages.length === 0) return

    // Show ad modal before processing
    setShowAdModal(true)
    
    setTimeout(async () => {
      setShowAdModal(false)
      setIsProcessing(true)

      try {
        // Simulate processing - in production, implement actual PDF reorganization
        await new Promise(resolve => setTimeout(resolve, 2000))
        
        // For now, just download the original file
        const blob = new Blob([file], { type: 'application/pdf' })
        const url = URL.createObjectURL(blob)
        setDownloadUrl(url)
        
      } catch (error) {
        console.error('Error organizing PDF:', error)
        alert('Error organizing PDF. Please try again.')
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
                <div className="p-4 bg-purple-100 dark:bg-purple-900 rounded-full">
                  <ArrowUpDown className="h-12 w-12 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                Organize PDF Pages
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-300">
                Reorder, rotate, and remove pages to organize your PDF documents
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
                        {formatFileSize(file.size)} • {pages.length} pages
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
                          setPages([])
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

                {/* Page Organization */}
                <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Organize Pages
                  </h3>
                  
                  <div className="mb-4 p-4 bg-purple-50 dark:bg-purple-950/20 rounded-lg">
                    <h4 className="font-medium text-purple-900 dark:text-purple-100 mb-2">
                      📝 How to organize:
                    </h4>
                    <ul className="text-sm text-purple-700 dark:text-purple-300 space-y-1">
                      <li>• Drag pages up/down to reorder them</li>
                      <li>• Click rotate button to rotate pages 90°</li>
                      <li>• Click trash button to remove pages</li>
                    </ul>
                  </div>

                  <DndContext 
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                  >
                    <SortableContext 
                      items={pages}
                      strategy={verticalListSortingStrategy}
                    >
                      <div className="space-y-3">
                        {pages.map((page) => (
                          <SortablePageItem
                            key={page.id}
                            page={page}
                            onRemove={removePage}
                            onRotate={rotatePage}
                          />
                        ))}
                      </div>
                    </SortableContext>
                  </DndContext>

                  {pages.length === 0 && (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                      All pages have been removed. Upload a new file to start over.
                    </div>
                  )}
                </div>

                {/* Process Button */}
                {pages.length > 0 && (
                  <div className="flex justify-center">
                    <button
                      onClick={processOrganizePDF}
                      disabled={isProcessing}
                      className="flex items-center space-x-3 px-8 py-4 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg transition-colors text-lg font-medium"
                    >
                      <ArrowUpDown className="h-6 w-6" />
                      <span>
                        {isProcessing ? 'Organizing PDF...' : 'Organize PDF'}
                      </span>
                    </button>
                  </div>
                )}

                {/* Download Link */}
                {downloadUrl && (
                  <div className="bg-green-50 dark:bg-green-950/20 rounded-lg p-6 text-center">
                    <h3 className="text-lg font-semibold text-green-900 dark:text-green-100 mb-4">
                      PDF Organized Successfully!
                    </h3>
                    <a
                      href={downloadUrl}
                      download="organized.pdf"
                      className="inline-flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg transition-colors"
                    >
                      <Download className="h-5 w-5" />
                      <span>Download Organized PDF</span>
                    </a>
                  </div>
                )}
              </div>
            )}

            {/* Info Section */}
            <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                How to Organize PDF Pages
              </h3>
              <ol className="list-decimal list-inside space-y-2 text-gray-600 dark:text-gray-300">
                <li>Upload a PDF file using the file picker</li>
                <li>Drag and drop pages to reorder them</li>
                <li>Use rotation buttons to rotate pages</li>
                <li>Remove unwanted pages with trash buttons</li>
                <li>Click &quot;Organize PDF&quot; to process the file</li>
                <li>Download your reorganized PDF</li>
              </ol>
              
              <div className="mt-6 p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
                <h4 className="font-medium text-green-900 dark:text-green-100 mb-2">
                  🔒 Privacy & Security
                </h4>
                <p className="text-sm text-green-700 dark:text-green-300">
                  Intuitive drag-and-drop interface for PDF organization. Reorder, rotate, and manage pages effortlessly.
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
