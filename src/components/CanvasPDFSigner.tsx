'use client'

import { useState, useEffect, useRef } from 'react'
import { PDFDocument, rgb } from 'pdf-lib'
import { Document, Page, pdfjs } from 'react-pdf'
import { PenTool, Download, Move, Trash2, RotateCcw } from 'lucide-react'
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

interface CanvasPDFSignerProps {
  file: File
  onClose?: () => void
}

export default function CanvasPDFSigner({ file, onClose }: CanvasPDFSignerProps) {
  const [pdfDoc, setPdfDoc] = useState<PDFDocument | null>(null)
  const [pages, setPages] = useState<any[]>([])
  const [currentPage, setCurrentPage] = useState(0)
  const [signatures, setSignatures] = useState<SignatureBox[]>([])
  const [isAddingSignature, setIsAddingSignature] = useState(false)
  const [draggedSignature, setDraggedSignature] = useState<string | null>(null)
  const [signatureText, setSignatureText] = useState('Digital Signature')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [scale, setScale] = useState(1)
  const [isProcessing, setIsProcessing] = useState(false)
  const [fileUrl, setFileUrl] = useState<string>('')
  const [numPages, setNumPages] = useState<number>(0)
  const [pageLoading, setPageLoading] = useState(false)
  
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const hiddenCanvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    loadPDF()
  }, [file])

  useEffect(() => {
    if (fileUrl && numPages > 0) {
      renderPDFPage(currentPage)
    }
  }, [fileUrl, numPages, currentPage, scale, signatures])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.target instanceof HTMLInputElement) return // Don't interfere with input fields

      switch (event.key) {
        case 'ArrowLeft':
          event.preventDefault()
          setCurrentPage(prev => Math.max(0, prev - 1))
          break
        case 'ArrowRight':
          event.preventDefault()
          setCurrentPage(prev => Math.min(numPages - 1, prev + 1))
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

  const loadPDF = async () => {
    try {
      setLoading(true)
      setError('')
      
      // Create URL for react-pdf
      const url = URL.createObjectURL(file)
      setFileUrl(url)
      
      // Also load with PDF-lib for metadata
      const arrayBuffer = await file.arrayBuffer()
      const pdf = await PDFDocument.load(arrayBuffer)
      setPdfDoc(pdf)
      
      // Get page dimensions
      const pageCount = pdf.getPageCount()
      const pagesData = []
      
      for (let i = 0; i < pageCount; i++) {
        const page = pdf.getPage(i)
        const { width, height } = page.getSize()
        pagesData.push({ width, height, index: i })
      }
      
      setPages(pagesData)
      setNumPages(pageCount)
      setLoading(false)
      
    } catch (err) {
      console.error('Error loading PDF:', err)
      setError('Failed to load PDF. Please try another file.')
      setLoading(false)
    }
  }

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    console.log('PDF loaded with', numPages, 'pages')
    setNumPages(numPages)
    setLoading(false)
  }

  const onDocumentLoadError = (error: Error) => {
    console.error('Error loading PDF document:', error)
    setError('Failed to load PDF document')
    setLoading(false)
  }

  const renderPDFPage = async (pageIndex: number) => {
    if (!fileUrl || pageIndex >= numPages) return
    
    setPageLoading(true)
    
    // We'll use a hidden PDF page to render to canvas
    setTimeout(() => {
      drawSignaturesOnCanvas(pageIndex)
      setPageLoading(false)
    }, 100)
  }

  const drawSignaturesOnCanvas = (pageIndex: number) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Find the PDF page element rendered by react-pdf
    const pdfPageElement = document.querySelector('.react-pdf__Page__canvas') as HTMLCanvasElement
    if (pdfPageElement) {
      // Copy the PDF content to our canvas
      const canvasWidth = 600 * scale
      const aspectRatio = pdfPageElement.height / pdfPageElement.width
      const canvasHeight = canvasWidth * aspectRatio

      canvas.width = canvasWidth
      canvas.height = canvasHeight
      canvas.style.width = `${canvasWidth}px`
      canvas.style.height = `${canvasHeight}px`

      // Draw the PDF page
      ctx.imageSmoothingEnabled = true
      ctx.imageSmoothingQuality = 'high'
      ctx.drawImage(pdfPageElement, 0, 0, canvasWidth, canvasHeight)
    } else {
      // Fallback: draw a placeholder
      const canvasWidth = 600 * scale
      const canvasHeight = 800 * scale

      canvas.width = canvasWidth
      canvas.height = canvasHeight
      canvas.style.width = `${canvasWidth}px`
      canvas.style.height = `${canvasHeight}px`

      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, canvasWidth, canvasHeight)
      
      ctx.strokeStyle = '#e5e7eb'
      ctx.lineWidth = 1
      ctx.strokeRect(0, 0, canvasWidth, canvasHeight)
      
      ctx.fillStyle = '#6b7280'
      ctx.font = 'bold 16px Arial'
      ctx.fillText(`PDF Page ${pageIndex + 1}`, 20, 40)
      
      ctx.fillStyle = '#9ca3af'
      ctx.font = '14px Arial'
      ctx.fillText('PDF content will appear here', 20, 70)
    }

    // Draw signatures on current page
    const pageSignatures = signatures.filter(sig => sig.pageIndex === pageIndex)
    
    pageSignatures.forEach(signature => {
      const x = (signature.x / 100) * canvas.width
      const y = (signature.y / 100) * canvas.height
      const width = (signature.width / 100) * canvas.width
      const height = (signature.height / 100) * canvas.height

      // Draw signature box with gradient
      const gradient = ctx.createLinearGradient(x, y, x, y + height)
      gradient.addColorStop(0, 'rgba(59, 130, 246, 0.15)')
      gradient.addColorStop(1, 'rgba(59, 130, 246, 0.05)')
      ctx.fillStyle = gradient
      ctx.fillRect(x, y, width, height)
      
      // Draw signature border
      ctx.strokeStyle = '#3b82f6'
      ctx.lineWidth = 2
      ctx.setLineDash([])
      ctx.strokeRect(x, y, width, height)

      // Draw signature text
      ctx.fillStyle = '#1f2937'
      ctx.font = 'bold 14px Arial'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(signature.text, x + width/2, y + height/2)
      
      // Draw drag handle
      ctx.fillStyle = '#3b82f6'
      ctx.beginPath()
      ctx.arc(x + width - 8, y + height - 8, 6, 0, 2 * Math.PI)
      ctx.fill()
      
      ctx.fillStyle = '#ffffff'
      ctx.font = '10px Arial'
      ctx.textAlign = 'center'
      ctx.fillText('⌘', x + width - 8, y + height - 6)
    })

    ctx.textAlign = 'left'
    ctx.textBaseline = 'alphabetic'
  }

  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isAddingSignature || !canvasRef.current) return

    const canvas = canvasRef.current
    const rect = canvas.getBoundingClientRect()
    const x = ((event.clientX - rect.left) / canvas.offsetWidth) * 100
    const y = ((event.clientY - rect.top) / canvas.offsetHeight) * 100

    const newSignature: SignatureBox = {
      id: Date.now().toString(),
      x,
      y,
      width: 25, // 25% of page width
      height: 8,  // 8% of page height
      pageIndex: currentPage,
      text: signatureText
    }

    setSignatures(prev => [...prev, newSignature])
    setIsAddingSignature(false)
  }

  const handleMouseDown = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (isAddingSignature) return

    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const clickX = ((event.clientX - rect.left) / canvas.offsetWidth) * 100
    const clickY = ((event.clientY - rect.top) / canvas.offsetHeight) * 100

    // Check if click is on a signature
    const pageSignatures = signatures.filter(sig => sig.pageIndex === currentPage)
    
    for (const signature of pageSignatures) {
      if (clickX >= signature.x && clickX <= signature.x + signature.width &&
          clickY >= signature.y && clickY <= signature.y + signature.height) {
        setDraggedSignature(signature.id)
        break
      }
    }
  }

  const handleMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!draggedSignature || !canvasRef.current) return

    const canvas = canvasRef.current
    const rect = canvas.getBoundingClientRect()
    const x = ((event.clientX - rect.left) / canvas.offsetWidth) * 100
    const y = ((event.clientY - rect.top) / canvas.offsetHeight) * 100

    setSignatures(prev => prev.map(sig => 
      sig.id === draggedSignature 
        ? { ...sig, x: Math.max(0, Math.min(75, x)), y: Math.max(0, Math.min(92, y)) }
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
    if (!pdfDoc || signatures.length === 0) return

    try {
      setIsProcessing(true)

      // Create a copy of the PDF
      const pdfBytes = await pdfDoc.save()
      const signedPdf = await PDFDocument.load(pdfBytes)

      // Add signatures to PDF
      signatures.forEach(signature => {
        const page = signedPdf.getPage(signature.pageIndex)
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
      const signedPdfBytes = await signedPdf.save()
      const blob = new Blob([signedPdfBytes], { type: 'application/pdf' })
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
            onClick={loadPDF}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

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
              className="px-2 py-1 bg-gray-600 hover:bg-gray-700 text-white rounded text-sm"
            >
              -
            </button>
            <span className="text-sm text-gray-600 dark:text-gray-300 min-w-16 text-center">
              {Math.round(scale * 100)}%
            </span>
            <button
              onClick={() => setScale(Math.min(2, scale + 0.1))}
              className="px-2 py-1 bg-gray-600 hover:bg-gray-700 text-white rounded text-sm"
            >
              +
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

      {/* PDF Canvas */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            PDF Preview & Signature Placement
          </h3>
          
          {numPages > 1 && (
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                disabled={currentPage === 0}
                className="px-3 py-2 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg"
              >
                Previous
              </button>
              <span className="text-sm text-gray-600 dark:text-gray-300">
                Page {currentPage + 1} of {numPages}
              </span>
              <button
                onClick={() => setCurrentPage(Math.min(numPages - 1, currentPage + 1))}
                disabled={currentPage === numPages - 1}
                className="px-3 py-2 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg"
              >
                Next
              </button>
            </div>
          )}
        </div>

        <div 
          ref={containerRef}
          className="flex justify-center relative"
        >
          {/* Hidden react-pdf Document for rendering */}
          {fileUrl && (
            <div className="absolute -left-[9999px] -top-[9999px] opacity-0 pointer-events-none">
              <Document
                file={fileUrl}
                onLoadSuccess={onDocumentLoadSuccess}
                onLoadError={onDocumentLoadError}
              >
                <Page
                  pageNumber={currentPage + 1}
                  width={600}
                  renderTextLayer={false}
                  renderAnnotationLayer={false}
                  onLoadSuccess={() => {
                    // Trigger canvas update after PDF page loads
                    setTimeout(() => drawSignaturesOnCanvas(currentPage), 100)
                  }}
                />
              </Document>
            </div>
          )}

          {/* Interactive Canvas */}
          <canvas
            ref={canvasRef}
            onClick={handleCanvasClick}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            className={`border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm ${
              isAddingSignature ? 'cursor-crosshair' : draggedSignature ? 'cursor-move' : 'cursor-default'
            }`}
            style={{ maxWidth: '100%', height: 'auto' }}
          />

          {pageLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/80 dark:bg-gray-800/80 rounded-lg">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Loading page...</p>
              </div>
            </div>
          )}
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

        {/* Apply Signatures Button */}
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
