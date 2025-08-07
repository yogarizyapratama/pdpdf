'use client'

import { Eye, ArrowUp, ArrowDown, Trash2 } from 'lucide-react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import PDFThumbnail from '@/components/PDFThumbnail'

interface FileWithId {
  id: string
  file: File
}

interface SortableFileCardProps {
  fileWithId: FileWithId
  index: number
  onRemove: (id: string) => void
  onMoveUp: (id: string) => void
  onMoveDown: (id: string) => void
  canMoveUp: boolean
  canMoveDown: boolean
  onPreview: (file: File) => void
}

export default function SortableFileCard({ 
  fileWithId, 
  index, 
  onRemove, 
  onMoveUp, 
  onMoveDown, 
  canMoveUp, 
  canMoveDown, 
  onPreview 
}: SortableFileCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: fileWithId.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="relative bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-200 group cursor-grab active:cursor-grabbing"
    >
      {/* Drag Handle - Removed since whole card is draggable */}
      
      {/* File Order Number */}
      <div className="absolute top-2 right-2 z-10 w-6 h-6 bg-blue-600 text-white text-xs rounded-full flex items-center justify-center font-medium">
        {index + 1}
      </div>

      {/* PDF Thumbnail */}
      <div className="p-3 pb-2">
        <PDFThumbnail 
          pdfFile={fileWithId.file}
          width={120}
          height={160}
          className="w-full shadow-sm"
          onClick={() => onPreview(fileWithId.file)}
        />
      </div>
      
      {/* File Info */}
      <div className="px-3 pb-3">
        <h3 className="font-medium text-gray-900 dark:text-white text-sm truncate mb-1" title={fileWithId.file.name}>
          {fileWithId.file.name}
        </h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
          {(fileWithId.file.size / (1024 * 1024)).toFixed(1)} MB
        </p>
        
        {/* Action Buttons */}
        <div className="flex items-center justify-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => {
              e.stopPropagation()
              onPreview(fileWithId.file)
            }}
            className="p-1.5 text-gray-400 hover:text-blue-600 transition-colors rounded"
            aria-label="Preview PDF"
            title="Preview"
            onPointerDown={(e) => e.stopPropagation()}
          >
            <Eye className="h-3.5 w-3.5" />
          </button>
          
          {canMoveUp && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                onMoveUp(fileWithId.id)
              }}
              className="p-1.5 text-gray-400 hover:text-green-600 transition-colors rounded"
              aria-label="Move up"
              title="Move up"
              onPointerDown={(e) => e.stopPropagation()}
            >
              <ArrowUp className="h-3.5 w-3.5" />
            </button>
          )}
          
          {canMoveDown && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                onMoveDown(fileWithId.id)
              }}
              className="p-1.5 text-gray-400 hover:text-green-600 transition-colors rounded"
              aria-label="Move down"
              title="Move down"
              onPointerDown={(e) => e.stopPropagation()}
            >
              <ArrowDown className="h-3.5 w-3.5" />
            </button>
          )}
          
          <button
            onClick={(e) => {
              e.stopPropagation()
              onRemove(fileWithId.id)
            }}
            className="p-1.5 text-gray-400 hover:text-red-600 transition-colors rounded"
            aria-label="Remove file"
            title="Remove"
            onPointerDown={(e) => e.stopPropagation()}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  )
}
