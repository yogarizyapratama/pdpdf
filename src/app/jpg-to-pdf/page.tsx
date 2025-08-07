'use client'

import { useState, useCallback } from 'react'
import { FileImage, Download, RotateCcw, ArrowUp, ArrowDown, Trash2 } from 'lucide-react'
import StructuredData from '@/components/StructuredData'
import ToolLayout from '@/components/ToolLayout'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import FileUpload from '@/components/FileUpload'
import { downloadBlob, generateId } from '@/lib/utils'
import { PDFDocument, degrees } from 'pdf-lib'
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
import {
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

interface ImageWithId {
  id: string
  file: File
  preview: string
  rotation: number
}

interface SortableImageItemProps {
  imageWithId: ImageWithId
  index: number
  onRemove: (id: string) => void
  onRotate: (id: string) => void
  onMoveUp: (id: string) => void
  onMoveDown: (id: string) => void
  canMoveUp: boolean
  canMoveDown: boolean
}

function SortableImageItem({ 
  imageWithId, 
  index, 
  onRemove, 
  onRotate, 
  onMoveUp, 
  onMoveDown,
  canMoveUp,
  canMoveDown 
}: SortableImageItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: imageWithId.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden"
    >
      <div className="aspect-video relative bg-gray-100 dark:bg-gray-700">
        <img
          src={imageWithId.preview}
          alt={imageWithId.file.name}
          className="w-full h-full object-contain"
          style={{ transform: `rotate(${imageWithId.rotation}deg)` }}
        />
        <div 
          {...attributes} 
          {...listeners}
          className="absolute top-2 left-2 cursor-grab active:cursor-grabbing p-2 bg-black/50 text-white rounded"
        >
          <div className="flex flex-col space-y-1">
            <div className="w-1 h-1 bg-current rounded-full"></div>
            <div className="w-1 h-1 bg-current rounded-full"></div>
            <div className="w-1 h-1 bg-current rounded-full"></div>
          </div>
        </div>
      </div>
      
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center space-x-2 mb-1">
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                #{index + 1}
              </span>
              <h3 className="font-medium text-gray-900 dark:text-white truncate">
                {imageWithId.file.name}
              </h3>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {(imageWithId.file.size / (1024 * 1024)).toFixed(2)} MB
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => onMoveUp(imageWithId.id)}
              disabled={!canMoveUp}
              className="p-2 text-gray-400 hover:text-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              aria-label="Move up"
            >
              <ArrowUp className="h-4 w-4" />
            </button>
            
            <button
              onClick={() => onMoveDown(imageWithId.id)}
              disabled={!canMoveDown}
              className="p-2 text-gray-400 hover:text-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              aria-label="Move down"
            >
              <ArrowDown className="h-4 w-4" />
            </button>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => onRotate(imageWithId.id)}
              className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
              aria-label="Rotate image"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
            
            <button
              onClick={() => onRemove(imageWithId.id)}
              className="p-2 text-gray-400 hover:text-red-600 transition-colors"
              aria-label={`Remove ${imageWithId.file.name}`}
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function JPGToPDFPage() {
  const [imagesWithIds, setImagesWithIds] = useState<ImageWithId[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string>('')
  const [pageSize, setPageSize] = useState<'A4' | 'Letter' | 'A3'>('A4')
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait')
  const [fitMode, setFitMode] = useState<'fit' | 'fill' | 'stretch'>('fit')

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const createImagePreview = useCallback((file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader()
      reader.onload = (e) => resolve(e.target?.result as string)
      reader.readAsDataURL(file)
    })
  }, [])

  const handleFilesSelected = useCallback(async (files: File[]) => {
    const newImagesWithIds: ImageWithId[] = []
    
    for (const file of files) {
      const preview = await createImagePreview(file)
      newImagesWithIds.push({
        id: generateId(),
        file,
        preview,
        rotation: 0
      })
    }
    
    setImagesWithIds(prev => [...prev, ...newImagesWithIds])
    setError('')
  }, [createImagePreview])

  const removeImage = useCallback((id: string) => {
    setImagesWithIds(prev => prev.filter(img => img.id !== id))
  }, [])

  const rotateImage = useCallback((id: string) => {
    setImagesWithIds(prev => prev.map(img => 
      img.id === id 
        ? { ...img, rotation: (img.rotation + 90) % 360 }
        : img
    ))
  }, [])

  const moveImageUp = useCallback((id: string) => {
    setImagesWithIds(prev => {
      const index = prev.findIndex(img => img.id === id)
      if (index > 0) {
        return arrayMove(prev, index, index - 1)
      }
      return prev
    })
  }, [])

  const moveImageDown = useCallback((id: string) => {
    setImagesWithIds(prev => {
      const index = prev.findIndex(img => img.id === id)
      if (index < prev.length - 1) {
        return arrayMove(prev, index, index + 1)
      }
      return prev
    })
  }, [])

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event

    if (active.id !== over?.id) {
      setImagesWithIds(prev => {
        const oldIndex = prev.findIndex(img => img.id === active.id)
        const newIndex = prev.findIndex(img => img.id === over!.id)
        return arrayMove(prev, oldIndex, newIndex)
      })
    }
  }, [])

  const convertToPDF = async () => {
    if (imagesWithIds.length === 0) {
      setError('Please select at least one image file')
      return
    }

    setIsProcessing(true)
    setError('')

    try {
      const pdfDoc = await PDFDocument.create()
      
      // Page size configurations
      const pageSizes = {
        A4: { width: 595, height: 842 },
        Letter: { width: 612, height: 792 },
        A3: { width: 842, height: 1191 }
      }
      
      const { width: pageWidth, height: pageHeight } = pageSizes[pageSize]
      const actualWidth = orientation === 'landscape' ? pageHeight : pageWidth
      const actualHeight = orientation === 'landscape' ? pageWidth : pageHeight

      for (const imageWithId of imagesWithIds) {
        const page = pdfDoc.addPage([actualWidth, actualHeight])
        
        // Convert image to appropriate format for pdf-lib
        let imageBytes: Uint8Array
        if (imageWithId.file.type === 'image/jpeg' || imageWithId.file.type === 'image/jpg') {
          imageBytes = new Uint8Array(await imageWithId.file.arrayBuffer())
        } else {
          // Convert other formats to JPEG
          const canvas = document.createElement('canvas')
          const ctx = canvas.getContext('2d')!
          const img = new Image()
          
          await new Promise((resolve) => {
            img.onload = resolve
            img.src = imageWithId.preview
          })
          
          canvas.width = img.width
          canvas.height = img.height
          ctx.drawImage(img, 0, 0)
          
          const blob = await new Promise<Blob>((resolve) => {
            canvas.toBlob((blob) => {
              if (blob) resolve(blob)
            }, 'image/jpeg', 0.9)
          })
          
          imageBytes = new Uint8Array(await blob!.arrayBuffer())
        }
        
        const image = await pdfDoc.embedJpg(imageBytes)
        const imageDims = image.scale(1)
        
        // Calculate dimensions based on fit mode
        let { width, height } = imageDims
        
        switch (fitMode) {
          case 'fit':
            // Scale to fit within page while maintaining aspect ratio
            const scaleX = actualWidth / width
            const scaleY = actualHeight / height
            const scale = Math.min(scaleX, scaleY)
            width *= scale
            height *= scale
            break
          case 'fill':
            // Scale to fill page while maintaining aspect ratio (may crop)
            const fillScaleX = actualWidth / width
            const fillScaleY = actualHeight / height
            const fillScale = Math.max(fillScaleX, fillScaleY)
            width *= fillScale
            height *= fillScale
            break
          case 'stretch':
            // Stretch to exactly fit page (may distort)
            width = actualWidth
            height = actualHeight
            break
        }
        
        // Center the image on the page
        const x = (actualWidth - width) / 2
        const y = (actualHeight - height) / 2
        
        // Apply rotation if needed
        const rotation = imageWithId.rotation
        if (rotation !== 0) {
          page.drawImage(image, {
            x: x + width / 2,
            y: y + height / 2,
            width,
            height,
            rotate: degrees(rotation)
          })
        } else {
          page.drawImage(image, { x, y, width, height })
        }
      }
      
      const pdfBytes = await pdfDoc.save()
      const blob = new Blob([pdfBytes], { type: 'application/pdf' })
      downloadBlob(blob, 'images-to-pdf.pdf')
      
    } catch (err) {
      setError('Failed to convert images to PDF. Please ensure all files are valid image files.')
      console.error('Conversion error:', err)
    } finally {
      setIsProcessing(false)
    }
  }

  const resetImages = () => {
    setImagesWithIds([])
    setError('')
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="p-4 bg-orange-100 dark:bg-orange-900 rounded-full">
                <FileImage className="h-12 w-12 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              JPG to PDF Converter
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Convert your image files (JPG, PNG, BMP, GIF) to PDF format. Arrange images in your desired order and customize page settings.
            </p>
          </div>

          {/* Upload Section */}
          {imagesWithIds.length === 0 && (
            <div className="mb-8">
              <FileUpload 
                onFilesSelected={handleFilesSelected}
                multiple={true}
                maxSize={20}
                accept="image/*"
              >
                <div className="space-y-4">
                  <div className="flex justify-center">
                    <FileImage className="h-12 w-12 text-gray-400" />
                  </div>
                  <div>
                    <p className="text-lg font-medium text-gray-900 dark:text-white">
                      Choose images or drag and drop
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      JPG, PNG, BMP, GIF files (max 20MB each)
                    </p>
                  </div>
                </div>
              </FileUpload>
            </div>
          )}

          {/* Settings and Images */}
          {imagesWithIds.length > 0 && (
            <div className="space-y-8">
              {/* PDF Settings */}
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                  PDF Settings
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Page Size */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Page Size
                    </label>
                    <select
                      value={pageSize}
                      onChange={(e) => setPageSize(e.target.value as 'A4' | 'Letter' | 'A3')}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-md"
                    >
                      <option value="A4">A4 (210 × 297 mm)</option>
                      <option value="Letter">Letter (8.5 × 11 in)</option>
                      <option value="A3">A3 (297 × 420 mm)</option>
                    </select>
                  </div>

                  {/* Orientation */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Orientation
                    </label>
                    <select
                      value={orientation}
                      onChange={(e) => setOrientation(e.target.value as 'portrait' | 'landscape')}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-md"
                    >
                      <option value="portrait">Portrait</option>
                      <option value="landscape">Landscape</option>
                    </select>
                  </div>

                  {/* Fit Mode */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Image Fit
                    </label>
                    <select
                      value={fitMode}
                      onChange={(e) => setFitMode(e.target.value as 'fit' | 'fill' | 'stretch')}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-md"
                    >
                      <option value="fit">Fit (maintain aspect ratio)</option>
                      <option value="fill">Fill (may crop)</option>
                      <option value="stretch">Stretch (may distort)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* File Management */}
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Images ({imagesWithIds.length})
                </h2>
                <div className="flex space-x-3">
                  <FileUpload 
                    onFilesSelected={handleFilesSelected}
                    multiple={true}
                    maxSize={20}
                    accept="image/*"
                    className="inline-block"
                  >
                    <button className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors text-sm">
                      Add More Images
                    </button>
                  </FileUpload>
                  
                  <button
                    onClick={resetImages}
                    className="px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors text-sm"
                  >
                    Reset All
                  </button>
                </div>
              </div>

              {/* Sortable Image Grid */}
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={imagesWithIds.map(img => img.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {imagesWithIds.map((imageWithId, index) => (
                      <SortableImageItem
                        key={imageWithId.id}
                        imageWithId={imageWithId}
                        index={index}
                        onRemove={removeImage}
                        onRotate={rotateImage}
                        onMoveUp={moveImageUp}
                        onMoveDown={moveImageDown}
                        canMoveUp={index > 0}
                        canMoveDown={index < imagesWithIds.length - 1}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>

              {/* Error */}
              {error && (
                <div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <p className="text-red-700 dark:text-red-300">{error}</p>
                </div>
              )}

              {/* Convert Button */}
              <div className="flex justify-center">
                <button
                  onClick={convertToPDF}
                  disabled={isProcessing || imagesWithIds.length === 0}
                  className="flex items-center space-x-3 px-8 py-4 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg transition-colors text-lg font-medium"
                >
                  <Download className="h-6 w-6" />
                  <span>
                    {isProcessing ? 'Converting to PDF...' : 'Convert to PDF'}
                  </span>
                </button>
              </div>
            </div>
          )}

          {/* Info Section */}
          <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              How to Convert Images to PDF
            </h3>
            <ol className="list-decimal list-inside space-y-2 text-gray-600 dark:text-gray-300">
              <li>Upload your image files (JPG, PNG, BMP, GIF formats supported)</li>
              <li>Arrange images in your desired order by dragging or using arrow buttons</li>
              <li>Rotate images if needed using the rotate button</li>
              <li>Configure PDF settings: page size, orientation, and image fit mode</li>
              <li>Click &quot;Convert to PDF&quot; to create your PDF document</li>
              <li>Download the resulting PDF file</li>
            </ol>
            
            <div className="mt-6 p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
              <h4 className="font-medium text-green-900 dark:text-green-100 mb-2">
                🔒 Privacy & Security
              </h4>
              <p className="text-sm text-green-700 dark:text-green-300">
                All image processing happens locally in your browser. Your images are never uploaded to our servers.
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
