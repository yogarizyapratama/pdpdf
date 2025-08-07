'use client'

import { useState, useEffect, useRef } from 'react'
import { Document, Page, pdfjs } from 'react-pdf'
import { PDFDocument, rgb } from 'pdf-lib'
import { PenTool, Download, Trash2, ZoomIn, ZoomOut } from 'lucide-react'
import '@/lib/pdf-config' // Initialize PDF.js worker

interface SignatureBox {
  id: string
  x: number
  y: number
  width: number
  height: number
  pageIndex: number
  text: string
}

interface HybridPDFSignerProps {
  file: File
  onClose?: () => void
}

export default function HybridPDFSigner({ file, onClose }: HybridPDFSignerProps) {
  const [numPages, setNumPages] = useState<number>(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [signatures, setSignatures] = useState<SignatureBox[]>([])
  const [isAddingSignature, setIsAddingSignature] = useState(false)
  const [draggedSignature, setDraggedSignature] = useState<string | null>(null)
  const [signatureText, setSignatureText] = useState('Digital Signature')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [scale, setScale] = useState(1)
  const [isProcessing, setIsProcessing] = useState(false)
  const [fileUrl, setFileUrl] = useState<string>('')
  
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const url = URL.createObjectURL(file)
    setFileUrl(url)
    return () => URL.revokeObjectURL(url)
  }, [file])

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    console.log('PDF loaded successfully with', numPages, 'pages')
    setNumPages(numPages)
    setLoading(false)
    setError('')
  }

  const onDocumentLoadError = (error: Error) => {
    console.error('Error loading PDF:', error)
    setError('Failed to load PDF document')
    setLoading(false)
  }

  const handleContainerClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!isAddingSignature || !containerRef.current) return

    const rect = containerRef.current.getBoundingClientRect()
    const x = ((event.clientX - rect.left) / rect.width) * 100
    const y = ((event.clientY - rect.top) / rect.height) * 100

    // Make sure signature is within bounds
    const boundedX = Math.max(0, Math.min(75, x))
    const boundedY = Math.max(0, Math.min(92, y))

    const newSignature: SignatureBox = {
      id: Date.now().toString(),
      x: boundedX,
      y: boundedY,
      width: 25, // 25% of page width
      height: 8,  // 8% of page height
      pageIndex: currentPage - 1,
      text: signatureText
    }

    setSignatures(prev => [...prev, newSignature])
    setIsAddingSignature(false)
  }

  const handleSignatureMouseDown = (event: React.MouseEvent, signatureId: string) => {
    event.stopPropagation()
    setDraggedSignature(signatureId)
  }

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!draggedSignature || !containerRef.current) return

    const rect = containerRef.current.getBoundingClientRect()
    const x = ((event.clientX - rect.left) / rect.width) * 100
    const y = ((event.clientY - rect.top) / rect.height) * 100

    const boundedX = Math.max(0, Math.min(75, x))
    const boundedY = Math.max(0, Math.min(92, y))

    setSignatures(prev => prev.map(sig => 
      sig.id === draggedSignature 
        ? { ...sig, x: boundedX, y: boundedY }
        : sig
    ))
  }

  const handleMouseUp = () => {
    setDraggedSignature(null)
  }

  const removeSignature = (id: string) => {
    setSignatures(prev => prev.filter(sig => sig.id !== id))
  }

  const applySignatures = async () => {
    if (signatures.length === 0) return

    try {
      setIsProcessing(true)

      const arrayBuffer = await file.arrayBuffer()
      const pdfDoc = await PDFDocument.load(arrayBuffer)

      // Add signatures to PDF
      signatures.forEach(signature => {
        const page = pdfDoc.getPage(signature.pageIndex)
        const { width, height } = page.getSize()
        
        const x = (signature.x / 100) * width
        const y = height - ((signature.y / 100) * height) - ((signature.height / 100) * height)
        const boxWidth = (signature.width / 100) * width
        const boxHeight = (signature.height / 100) * height

        // Draw signature box
        page.drawRectangle({
          x,
          y,
          width: boxWidth,
          height: boxHeight,
          borderColor: rgb(0.23, 0.51, 0.96),
          borderWidth: 1,
          color: rgb(0.9, 0.95, 1),
        })

        // Add signature text
        page.drawText(signature.text, {
          x: x + boxWidth / 2 - (signature.text.length * 3),
          y: y + boxHeight / 2 - 6,
          size: 10,
          color: rgb(0.12, 0.16, 0.22),
        })
      })

      // Download signed PDF
      const pdfBytes = await pdfDoc.save()
      const blob = new Blob([pdfBytes], { type: 'application/pdf' })
      const url = URL.createObjectURL(blob)
      
      const a = document.createElement('a')
      a.href = url
      a.download = file.name.replace('.pdf', '_signed.pdf')
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      alert('PDF signed successfully!')
      setSignatures([])

    } catch (error) {
      console.error('Error signing PDF:', error)
      alert('Error signing PDF. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.target instanceof HTMLInputElement) return

      switch (event.key) {
        case 'ArrowLeft':
          event.preventDefault()
          setCurrentPage(prev => Math.max(1, prev - 1))
          break
        case 'ArrowRight':
          event.preventDefault()
          setCurrentPage(prev => Math.min(numPages, prev + 1))
          break
        case 'Escape':
          event.preventDefault()
          setIsAddingSignature(false)
          setDraggedSignature(null)
          break
        case '=':
        case '+':
          if (event.ctrlKey || event.metaKey) {
            event.preventDefault()
            setScale(prev => Math.min(2, prev + 0.1))
          }
          break
        case '-':
          if (event.ctrlKey || event.metaKey) {
            event.preventDefault()
            setScale(prev => Math.max(0.5, prev - 0.1))
          }
          break
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [numPages])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading PDF...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg"
          >
            Refresh Page
          </button>
        </div>
      </div>
    )
  }

  const currentPageSignatures = signatures.filter(sig => sig.pageIndex === currentPage - 1)

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
        <div className="flex flex-wrap items-center gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Signature Text
            </label>
            <input
              type="text"
              value={signatureText}
              onChange={(e) => setSignatureText(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="Enter signature text"
            />
          </div>

          <button
            onClick={() => setIsAddingSignature(!isAddingSignature)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
              isAddingSignature 
                ? 'bg-red-600 hover:bg-red-700 text-white' 
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            <PenTool className="h-4 w-4" />
            <span>{isAddingSignature ? 'Cancel' : 'Add Signature'}</span>
          </button>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setScale(Math.max(0.5, scale - 0.1))}
              className="p-2 bg-gray-600 hover:bg-gray-700 text-white rounded"
            >
              <ZoomOut className="h-4 w-4" />
            </button>
            <span className="text-sm text-gray-600 dark:text-gray-300 min-w-16 text-center">
              {Math.round(scale * 100)}%
            </span>
            <button
              onClick={() => setScale(Math.min(2, scale + 0.1))}
              className="p-2 bg-gray-600 hover:bg-gray-700 text-white rounded"
            >
              <ZoomIn className="h-4 w-4" />
            </button>
          </div>
        </div>

        {isAddingSignature && (
          <div className="bg-blue-50 dark:bg-blue-950/20 rounded-lg p-3">
            <p className="text-sm text-blue-700 dark:text-blue-300">
              <strong>Click on the PDF</strong> to place your signature. You can drag signatures to reposition them.
            </p>
          </div>
        )}

        {/* Keyboard Shortcuts Info */}
        <div className="bg-gray-50 dark:bg-gray-700/20 rounded-lg p-3">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">⌨️ Keyboard Shortcuts:</h4>
          <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 dark:text-gray-400">
            <div>← → : Navigate pages</div>
            <div>Ctrl/Cmd + / - : Zoom</div>
            <div>Esc : Cancel actions</div>
            <div>Click & Drag : Move signatures</div>
          </div>
        </div>
      </div>

      {/* PDF Viewer with Signature Overlay */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            PDF Preview & Signature Placement
          </h3>
          
          {numPages > 1 && (
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-3 py-2 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg"
              >
                Previous
              </button>
              <span className="text-sm text-gray-600 dark:text-gray-300">
                Page {currentPage} of {numPages}
              </span>
              <button
                onClick={() => setCurrentPage(Math.min(numPages, currentPage + 1))}
                disabled={currentPage === numPages}
                className="px-3 py-2 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg"
              >
                Next
              </button>
            </div>
          )}
        </div>

        <div className="flex justify-center">
          <div 
            ref={containerRef}
            className={`relative inline-block ${
              isAddingSignature ? 'cursor-crosshair' : 'cursor-default'
            }`}
            onClick={handleContainerClick}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
          >
            {fileUrl && (
              <Document
                file={fileUrl}
                onLoadSuccess={onDocumentLoadSuccess}
                onLoadError={onDocumentLoadError}
                loading={
                  <div className="flex items-center justify-center min-h-96">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                }
                error={
                  <div className="text-center py-8">
                    <p className="text-red-600">Error loading PDF</p>
                  </div>
                }
              >
                <Page
                  pageNumber={currentPage}
                  width={600 * scale}
                  renderTextLayer={false}
                  renderAnnotationLayer={false}
                  className="border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm"
                />
              </Document>
            )}

            {/* Signature Overlays */}
            {currentPageSignatures.map((signature) => (
              <div
                key={signature.id}
                className={`absolute border-2 border-blue-500 bg-blue-100/20 dark:bg-blue-900/20 rounded-md transition-all ${
                  draggedSignature === signature.id ? 'shadow-lg' : 'hover:shadow-md'
                }`}
                style={{
                  left: `${signature.x}%`,
                  top: `${signature.y}%`,
                  width: `${signature.width}%`,
                  height: `${signature.height}%`,
                  cursor: isAddingSignature ? 'crosshair' : 'move'
                }}
                onMouseDown={(e) => handleSignatureMouseDown(e, signature.id)}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-center h-full text-xs text-blue-700 dark:text-blue-300 font-medium px-1">
                  {signature.text}
                </div>
                
                {/* Delete button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    removeSignature(signature.id)
                  }}
                  className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 hover:bg-red-600 text-white rounded-full text-xs flex items-center justify-center transition-colors"
                  title="Remove signature"
                >
                  ×
                </button>
              </div>
            ))}

            {/* Signature mode overlay */}
            {isAddingSignature && (
              <div className="absolute inset-0 bg-blue-500/5 pointer-events-none rounded-lg">
                <div className="absolute top-2 left-2 bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                  Click to place signature
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Signatures List */}
      {signatures.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Placed Signatures ({signatures.length})
          </h3>
          <div className="space-y-2">
            {signatures.map((signature) => (
              <div key={signature.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="h-8 w-20 bg-blue-100 dark:bg-blue-900 rounded border flex items-center justify-center">
                    <span className="text-xs text-blue-700 dark:text-blue-300">{signature.text}</span>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600 dark:text-gray-300">
                      Page {signature.pageIndex + 1}
                    </span>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Position: {Math.round(signature.x)}%, {Math.round(signature.y)}%
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => removeSignature(signature.id)}
                  className="p-2 text-red-600 hover:text-red-800 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex justify-center space-x-4">
        {onClose && (
          <button
            onClick={onClose}
            className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
          >
            Back to Upload
          </button>
        )}
        
        <button
          onClick={applySignatures}
          disabled={isProcessing || signatures.length === 0}
          className="flex items-center space-x-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
        >
          <Download className="h-5 w-5" />
          <span>
            {isProcessing ? 'Signing PDF...' : 'Sign & Download PDF'}
          </span>
        </button>
      </div>
    </div>
  )
}
