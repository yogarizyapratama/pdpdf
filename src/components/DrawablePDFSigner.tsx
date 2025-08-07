'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { PDFDocument, rgb } from 'pdf-lib'
import { PenTool, Download, Trash2, RotateCcw, ZoomIn, ZoomOut, MousePointer } from 'lucide-react'

interface DrawnSignature {
  id: string
  x: number
  y: number
  paths: { x: number; y: number }[][]
  pageNumber: number
  isDragging?: boolean
  isResizing?: boolean
  width: number
  height: number
  scale: number // Scale factor for resizing
}

interface DrawablePDFSignerProps {
  file: File
  onClose?: () => void
}

export default function DrawablePDFSigner({ file, onClose }: DrawablePDFSignerProps) {
  const [signatures, setSignatures] = useState<DrawnSignature[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const [isDrawing, setIsDrawing] = useState(false)
  const [isAddingSignature, setIsAddingSignature] = useState(false)
  const [draggedSignature, setDraggedSignature] = useState<string | null>(null)
  const [resizingSignature, setResizingSignature] = useState<string | null>(null)
  const [selectedSignature, setSelectedSignature] = useState<string | null>(null)
  const [zoom, setZoom] = useState(100)
  const [isProcessing, setIsProcessing] = useState(false)
  const [currentPath, setCurrentPath] = useState<{ x: number; y: number }[]>([])
  const [showSignatureCanvas, setShowSignatureCanvas] = useState(false)
  const [cursorStyle, setCursorStyle] = useState('default')
  
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const pdfCanvasRef = useRef<HTMLCanvasElement>(null)
  const signatureCanvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [pdfPages, setPdfPages] = useState<ImageData[]>([])

  useEffect(() => {
    loadPDF()
  }, [file])

  const loadPDF = async () => {
    try {
      const arrayBuffer = await file.arrayBuffer()
      const pdfDoc = await PDFDocument.load(arrayBuffer)
      setTotalPages(pdfDoc.getPageCount())
      
      // Render PDF pages to canvas
      await renderPDFPages(arrayBuffer)
    } catch (error) {
      console.error('Error loading PDF:', error)
    }
  }

  const renderPDFPages = async (arrayBuffer: ArrayBuffer) => {
    try {
      // Use PDF.js to render pages
      const pdfjsLib = (window as any).pdfjsLib
      if (!pdfjsLib) {
        console.warn('PDF.js not available, using placeholder')
        drawPlaceholder()
        return
      }

      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
      const pages: ImageData[] = []

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i)
        const viewport = page.getViewport({ scale: 1.5 })
        
        const canvas = document.createElement('canvas')
        const context = canvas.getContext('2d')!
        canvas.height = viewport.height
        canvas.width = viewport.width

        await page.render({
          canvasContext: context,
          viewport: viewport
        }).promise

        pages.push(context.getImageData(0, 0, canvas.width, canvas.height))
      }
      
      setPdfPages(pages)
      drawCurrentPage()
    } catch (error) {
      console.error('Error rendering PDF:', error)
      // Fallback: show file info if PDF.js fails
      drawPlaceholder()
    }
  }

  const drawCurrentPage = useCallback(() => {
    const canvas = pdfCanvasRef.current
    if (!canvas || !pdfPages[currentPage - 1]) return

    const ctx = canvas.getContext('2d')!
    const pageData = pdfPages[currentPage - 1]
    
    canvas.width = pageData.width
    canvas.height = pageData.height
    ctx.putImageData(pageData, 0, 0)
    
    // Draw signatures for current page
    drawSignatures()
  }, [currentPage, pdfPages, signatures])

  const drawPlaceholder = () => {
    const canvas = pdfCanvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')!
    canvas.width = 600
    canvas.height = 800
    
    // White background
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    
    // Border
    ctx.strokeStyle = '#e5e7eb'
    ctx.lineWidth = 2
    ctx.strokeRect(0, 0, canvas.width, canvas.height)
    
    // File info
    ctx.fillStyle = '#374151'
    ctx.font = '16px system-ui'
    ctx.textAlign = 'center'
    ctx.fillText(`📄 ${file.name}`, canvas.width / 2, 100)
    ctx.fillText(`Page ${currentPage} of ${totalPages}`, canvas.width / 2, 130)
    ctx.fillText('Click "Add Signature" to place signatures', canvas.width / 2, 160)
  }

  const drawSignatures = () => {
    const canvas = pdfCanvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')!
    
    // Draw signatures for current page
    signatures
      .filter(sig => sig.pageNumber === currentPage)
      .forEach(signature => {
        ctx.save()
        
        // Calculate actual signature bounds after scaling
        const scaledWidth = signature.width * signature.scale
        const scaledHeight = signature.height * signature.scale
        
        // Draw the signature paths
        ctx.strokeStyle = '#2563eb'
        ctx.lineWidth = 2 * signature.scale
        ctx.lineCap = 'round'
        ctx.lineJoin = 'round'

        signature.paths.forEach(path => {
          if (path.length < 2) return
          
          ctx.beginPath()
          const startX = signature.x + (path[0].x * signature.scale)
          const startY = signature.y + (path[0].y * signature.scale)
          ctx.moveTo(startX, startY)
          
          for (let i = 1; i < path.length; i++) {
            const x = signature.x + (path[i].x * signature.scale)
            const y = signature.y + (path[i].y * signature.scale)
            ctx.lineTo(x, y)
          }
          ctx.stroke()
        })

        // Draw signature border and resize handles when selected
        if (signature.isDragging || signature.isResizing || selectedSignature === signature.id) {
          // Draw tight border around signature
          ctx.strokeStyle = signature.isDragging ? '#ef4444' : signature.isResizing ? '#f59e0b' : '#10b981'
          ctx.lineWidth = 2
          ctx.setLineDash([5, 5])
          ctx.strokeRect(signature.x, signature.y, scaledWidth, scaledHeight)
          ctx.setLineDash([])
          
          // Draw resize handles exactly at the corners of the signature
          const handleSize = 10
          const handles = [
            { x: signature.x - handleSize/2, y: signature.y - handleSize/2 }, // top-left
            { x: signature.x + scaledWidth - handleSize/2, y: signature.y - handleSize/2 }, // top-right
            { x: signature.x - handleSize/2, y: signature.y + scaledHeight - handleSize/2 }, // bottom-left
            { x: signature.x + scaledWidth - handleSize/2, y: signature.y + scaledHeight - handleSize/2 }, // bottom-right
          ]
          
          // Draw handle backgrounds (white)
          ctx.fillStyle = '#ffffff'
          handles.forEach(handle => {
            ctx.fillRect(handle.x, handle.y, handleSize, handleSize)
          })
          
          // Draw handle borders (colored based on state)
          ctx.strokeStyle = signature.isDragging ? '#ef4444' : signature.isResizing ? '#f59e0b' : '#10b981'
          ctx.lineWidth = 2
          ctx.setLineDash([])
          handles.forEach(handle => {
            ctx.strokeRect(handle.x, handle.y, handleSize, handleSize)
          })
        }
        
        ctx.restore()
      })
  }

  useEffect(() => {
    drawCurrentPage()
  }, [drawCurrentPage])

  const startSignatureDrawing = () => {
    setShowSignatureCanvas(true)
    setIsAddingSignature(false)
  }

  const handleSignatureCanvasMouseDown = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!signatureCanvasRef.current) return
    
    setIsDrawing(true)
    const rect = signatureCanvasRef.current.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top
    setCurrentPath([{ x, y }])
  }

  const handleSignatureCanvasMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !signatureCanvasRef.current) return
    
    const rect = signatureCanvasRef.current.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top
    
    setCurrentPath(prev => [...prev, { x, y }])
    
    // Draw on signature canvas
    const canvas = signatureCanvasRef.current
    const ctx = canvas.getContext('2d')!
    
    if (currentPath.length > 0) {
      ctx.strokeStyle = '#2563eb'
      ctx.lineWidth = 2
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
      
      ctx.beginPath()
      ctx.moveTo(currentPath[currentPath.length - 2]?.x || x, currentPath[currentPath.length - 2]?.y || y)
      ctx.lineTo(x, y)
      ctx.stroke()
    }
  }

  const handleSignatureCanvasMouseUp = () => {
    setIsDrawing(false)
  }

  const clearSignatureCanvas = () => {
    const canvas = signatureCanvasRef.current
    if (!canvas) return
    
    const ctx = canvas.getContext('2d')!
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    setCurrentPath([])
  }

  const saveSignature = () => {
    const canvas = signatureCanvasRef.current
    if (!canvas) return

    // Get actual signature bounds from drawn paths
    if (currentPath.length === 0) {
      alert('Please draw a signature first')
      return
    }

    // Calculate bounding box of the drawn signature
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity
    
    if (currentPath.length > 0) {
      currentPath.forEach(point => {
        minX = Math.min(minX, point.x)
        minY = Math.min(minY, point.y)
        maxX = Math.max(maxX, point.x)
        maxY = Math.max(maxY, point.y)
      })
    }

    // Add some padding around the signature
    const padding = 10
    minX = Math.max(0, minX - padding)
    minY = Math.max(0, minY - padding)
    maxX = Math.min(canvas.width, maxX + padding)
    maxY = Math.min(canvas.height, maxY + padding)

    // Normalize the path relative to the bounding box
    const normalizedPath = currentPath.map(point => ({
      x: point.x - minX,
      y: point.y - minY
    }))

    const newSignature: DrawnSignature = {
      id: Date.now().toString(),
      x: 50, // Default position on PDF
      y: 50,
      paths: [normalizedPath],
      pageNumber: currentPage,
      width: maxX - minX,
      height: maxY - minY,
      scale: 1.0 // Default scale
    }

    setSignatures(prev => [...prev, newSignature])
    setShowSignatureCanvas(false)
    clearSignatureCanvas()
  }

  const handleCanvasMouseDown = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!pdfCanvasRef.current) return

    const rect = pdfCanvasRef.current.getBoundingClientRect()
    const mouseX = event.clientX - rect.left
    const mouseY = event.clientY - rect.top

    // Check if clicking on a signature
    const currentPageSignatures = signatures.filter(sig => sig.pageNumber === currentPage)
    
    for (let signature of currentPageSignatures) {
      const scaledWidth = signature.width * signature.scale
      const scaledHeight = signature.height * signature.scale
      
      // Check resize handles first (exact corner positions)
      const handleSize = 10
      const handles = [
        { x: signature.x - handleSize/2, y: signature.y - handleSize/2, corner: 'top-left' },
        { x: signature.x + scaledWidth - handleSize/2, y: signature.y - handleSize/2, corner: 'top-right' },
        { x: signature.x - handleSize/2, y: signature.y + scaledHeight - handleSize/2, corner: 'bottom-left' },
        { x: signature.x + scaledWidth - handleSize/2, y: signature.y + scaledHeight - handleSize/2, corner: 'bottom-right' },
      ]
      
      for (let handle of handles) {
        if (mouseX >= handle.x && mouseX <= handle.x + handleSize &&
            mouseY >= handle.y && mouseY <= handle.y + handleSize) {
          setResizingSignature(signature.id)
          setSelectedSignature(signature.id)
          setSignatures(prev => prev.map(sig => 
            sig.id === signature.id ? { ...sig, isResizing: true } : { ...sig, isResizing: false, isDragging: false }
          ))
          return
        }
      }
      
      // Check if clicking inside signature area (exact bounds)
      if (mouseX >= signature.x && mouseX <= signature.x + scaledWidth &&
          mouseY >= signature.y && mouseY <= signature.y + scaledHeight) {
        setDraggedSignature(signature.id)
        setSelectedSignature(signature.id)
        setSignatures(prev => prev.map(sig => 
          sig.id === signature.id ? { ...sig, isDragging: true } : { ...sig, isDragging: false, isResizing: false }
        ))
        return
      }
    }

    // Clear all selections if clicking on empty area
    setSelectedSignature(null)
    setSignatures(prev => prev.map(sig => ({ ...sig, isDragging: false, isResizing: false })))
    setDraggedSignature(null)
    setResizingSignature(null)

    // If placing a new signature
    if (isAddingSignature && signatures.length > 0) {
      const lastSignature = signatures[signatures.length - 1]
      setSignatures(prev => prev.map(sig => 
        sig.id === lastSignature.id 
          ? { ...sig, x: mouseX - (sig.width * sig.scale) / 2, y: mouseY - (sig.height * sig.scale) / 2 }
          : sig
      ))
      setIsAddingSignature(false)
    }
  }

  const handleMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!pdfCanvasRef.current) return

    const rect = pdfCanvasRef.current.getBoundingClientRect()
    const mouseX = event.clientX - rect.left
    const mouseY = event.clientY - rect.top

    // Update cursor based on mouse position
    if (!draggedSignature && !resizingSignature) {
      let newCursor = 'default'
      const currentPageSignatures = signatures.filter(sig => sig.pageNumber === currentPage)
      
      for (let signature of currentPageSignatures) {
        const scaledWidth = signature.width * signature.scale
        const scaledHeight = signature.height * signature.scale
        
        // Check if over resize handles
        const handleSize = 10
        const handles = [
          { x: signature.x - handleSize/2, y: signature.y - handleSize/2, cursor: 'nw-resize' },
          { x: signature.x + scaledWidth - handleSize/2, y: signature.y - handleSize/2, cursor: 'ne-resize' },
          { x: signature.x - handleSize/2, y: signature.y + scaledHeight - handleSize/2, cursor: 'sw-resize' },
          { x: signature.x + scaledWidth - handleSize/2, y: signature.y + scaledHeight - handleSize/2, cursor: 'se-resize' },
        ]
        
        for (let handle of handles) {
          if (mouseX >= handle.x && mouseX <= handle.x + handleSize &&
              mouseY >= handle.y && mouseY <= handle.y + handleSize) {
            newCursor = handle.cursor
            break
          }
        }
        
        // Check if over signature area
        if (newCursor === 'default' && 
            mouseX >= signature.x && mouseX <= signature.x + scaledWidth &&
            mouseY >= signature.y && mouseY <= signature.y + scaledHeight) {
          newCursor = 'move'
        }
        
        if (newCursor !== 'default') break
      }
      
      setCursorStyle(newCursor)
    }

    // Handle dragging
    if (draggedSignature) {
      setSignatures(prev => prev.map(sig => 
        sig.id === draggedSignature 
          ? { ...sig, x: mouseX - (sig.width * sig.scale) / 2, y: mouseY - (sig.height * sig.scale) / 2 }
          : sig
      ))
      drawCurrentPage()
    }
    
    // Handle resizing
    if (resizingSignature) {
      setSignatures(prev => prev.map(sig => {
        if (sig.id === resizingSignature) {
          // Calculate distance from center to mouse for scaling
          const centerX = sig.x + (sig.width * sig.scale) / 2
          const centerY = sig.y + (sig.height * sig.scale) / 2
          const distance = Math.sqrt(Math.pow(mouseX - centerX, 2) + Math.pow(mouseY - centerY, 2))
          const baseDistance = Math.sqrt(Math.pow(sig.width, 2) + Math.pow(sig.height, 2)) / 2
          const newScale = Math.max(0.1, Math.min(3.0, distance / baseDistance))
          
          return { ...sig, scale: newScale }
        }
        return sig
      }))
      drawCurrentPage()
    }
  }

  const handleMouseUp = () => {
    if (draggedSignature) {
      setSignatures(prev => prev.map(sig => 
        sig.id === draggedSignature ? { ...sig, isDragging: false } : sig
      ))
      setDraggedSignature(null)
    }
    
    if (resizingSignature) {
      setSignatures(prev => prev.map(sig => 
        sig.id === resizingSignature ? { ...sig, isResizing: false } : sig
      ))
      setResizingSignature(null)
    }
  }

  const deleteSignature = (signatureId: string) => {
    setSignatures(prev => prev.filter(sig => sig.id !== signatureId))
  }

  const clearAllSignatures = () => {
    setSignatures([])
  }

  const signAndDownload = async () => {
    if (signatures.length === 0) {
      alert('Please add at least one signature before downloading')
      return
    }

    setIsProcessing(true)
    
    try {
      const arrayBuffer = await file.arrayBuffer()
      const pdfDoc = await PDFDocument.load(arrayBuffer)
      const pages = pdfDoc.getPages()

      // Group signatures by page
      const signaturesByPage = signatures.reduce((acc, sig) => {
        if (!acc[sig.pageNumber - 1]) acc[sig.pageNumber - 1] = []
        acc[sig.pageNumber - 1].push(sig)
        return acc
      }, {} as Record<number, DrawnSignature[]>)

      // Add signatures to each page
      Object.entries(signaturesByPage).forEach(([pageIndex, pageSignatures]) => {
        const page = pages[parseInt(pageIndex)]
        const { width, height } = page.getSize()

        pageSignatures.forEach(sig => {
          // Convert signature paths to PDF coordinates
          const scaleX = width / (pdfCanvasRef.current?.width || 600)
          const scaleY = height / (pdfCanvasRef.current?.height || 800)
          
          sig.paths.forEach(path => {
            if (path.length < 2) return
            
            for (let i = 1; i < path.length; i++) {
              const startX = (sig.x + (path[i - 1].x * sig.scale)) * scaleX
              const startY = height - (sig.y + (path[i - 1].y * sig.scale)) * scaleY
              const endX = (sig.x + (path[i].x * sig.scale)) * scaleX
              const endY = height - (sig.y + (path[i].y * sig.scale)) * scaleY
              
              // Draw line segment with scaled thickness
              page.drawLine({
                start: { x: startX, y: startY },
                end: { x: endX, y: endY },
                thickness: 2 * sig.scale,
                color: rgb(0.15, 0.38, 0.92) // Blue color
              })
            }
          })
        })
      })

      const pdfBytes = await pdfDoc.save()
      const blob = new Blob([pdfBytes], { type: 'application/pdf' })
      const url = URL.createObjectURL(blob)
      
      const a = document.createElement('a')
      a.href = url
      a.download = `signed-${file.name}`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      
    } catch (error) {
      console.error('Error signing PDF:', error)
      alert('Error signing PDF. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="w-full">
      <div className="mb-4 flex flex-wrap gap-2 items-center justify-between">
        <div className="flex gap-2">
          <button
            onClick={startSignatureDrawing}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <PenTool className="w-4 h-4" />
            Draw Signature
          </button>
          
          <button
            onClick={() => setIsAddingSignature(true)}
            disabled={signatures.length === 0}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400"
          >
            <MousePointer className="w-4 h-4" />
            Place Signature
          </button>

          <button
            onClick={clearAllSignatures}
            disabled={signatures.length === 0}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:bg-gray-400"
          >
            <Trash2 className="w-4 h-4" />
            Clear All
          </button>
        </div>

        <div className="flex gap-2 items-center">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="px-3 py-1 bg-gray-200 dark:bg-gray-600 rounded disabled:opacity-50"
          >
            ←
          </button>
          <button
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className="px-3 py-1 bg-gray-200 dark:bg-gray-600 rounded disabled:opacity-50"
          >
            →
          </button>
        </div>
      </div>

      {/* Instructions */}
      <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
        <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">📝 Cara Menggunakan:</h4>
        <div className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
          <p>• <strong>Gambar Signature:</strong> Klik "Draw Signature" untuk menggambar tanda tangan di canvas</p>
          <p>• <strong>Tempatkan:</strong> Klik "Place Signature" lalu klik di PDF untuk menempatkan</p>
          <p>• <strong>Geser:</strong> Klik dan drag signature untuk memindahkan posisi</p>
          <p>• <strong>Resize:</strong> Klik signature untuk memilih, lalu drag sudut merah untuk mengubah ukuran</p>
        </div>
      </div>

      {/* Signature Drawing Modal */}
      {showSignatureCanvas && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Draw Your Signature</h3>
            
            <div className="border border-gray-300 dark:border-gray-600 rounded-lg mb-4">
              <canvas
                ref={signatureCanvasRef}
                width={400}
                height={200}
                className="w-full cursor-crosshair bg-white rounded-lg"
                onMouseDown={handleSignatureCanvasMouseDown}
                onMouseMove={handleSignatureCanvasMouseMove}
                onMouseUp={handleSignatureCanvasMouseUp}
                onMouseLeave={handleSignatureCanvasMouseUp}
              />
            </div>
            
            <div className="flex gap-2 justify-end">
              <button
                onClick={clearSignatureCanvas}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
              >
                Clear
              </button>
              <button
                onClick={() => setShowSignatureCanvas(false)}
                className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={saveSignature}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Save Signature
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PDF Canvas */}
      <div 
        ref={containerRef}
        className="border border-gray-300 dark:border-gray-600 rounded-lg bg-white relative overflow-auto"
        style={{ height: '600px' }}
      >
        <canvas
          ref={pdfCanvasRef}
          className="w-full h-auto"
          style={{ cursor: cursorStyle }}
          onMouseDown={handleCanvasMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        />
        
        {isAddingSignature && (
          <div className="absolute top-2 left-2 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-3 py-1 rounded-lg text-sm">
            Click where you want to place the signature
          </div>
        )}
      </div>

      {/* Signatures List */}
      {signatures.length > 0 && (
        <div className="mt-4">
          <h4 className="font-semibold mb-2">Signatures ({signatures.length})</h4>
          <div className="space-y-2">
            {signatures.map((signature) => (
              <div
                key={signature.id}
                className={`flex items-center justify-between p-2 rounded-lg transition-colors ${
                  selectedSignature === signature.id 
                    ? 'bg-blue-100 dark:bg-blue-900 border border-blue-300 dark:border-blue-700' 
                    : 'bg-gray-50 dark:bg-gray-700'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm">
                    Signature on page {signature.pageNumber}
                  </span>
                  {selectedSignature === signature.id && (
                    <span className="text-xs bg-blue-500 text-white px-2 py-1 rounded">
                      Selected (Scale: {Math.round(signature.scale * 100)}%)
                    </span>
                  )}
                </div>
                <button
                  onClick={() => deleteSignature(signature.id)}
                  className="text-red-600 hover:text-red-800 p-1"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Download Button */}
      <div className="mt-6 flex gap-4">
        <button
          onClick={signAndDownload}
          disabled={signatures.length === 0 || isProcessing}
          className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400 flex-1"
        >
          <Download className="w-5 h-5" />
          {isProcessing ? 'Processing...' : 'Download Signed PDF'}
        </button>
        
        {onClose && (
          <button
            onClick={onClose}
            className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
          >
            Close
          </button>
        )}
      </div>
    </div>
  )
}
