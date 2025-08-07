'use client'

import React, { useState, useRef, useCallback, useEffect } from 'react'
import { PDFDocument, rgb } from 'pdf-lib'

// Signature type to support both text and drawn signatures
interface Signature {
  id: string
  type: 'text' | 'drawn'
  x: number
  y: number
  width: number
  height: number
  pageNumber: number
  
  // For text signatures
  text?: string
  fontSize?: number
  
  // For drawn signatures
  paths?: Array<{ x: number; y: number }[]>
}

interface SimplePDFSignerProps {
  file: File
  onFileChange: (file: File | null) => void
}

const SimplePDFSigner: React.FC<SimplePDFSignerProps> = ({ file, onFileChange }) => {
  const [pdfUrl, setPdfUrl] = useState<string>('')
  const [signatures, setSignatures] = useState<Signature[]>([])
  const [signatureText, setSignatureText] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [draggedSignature, setDraggedSignature] = useState<string | null>(null)
  const [mouseOffset, setMouseOffset] = useState({ x: 0, y: 0 })
  
  // Drawing states
  const [showSignatureCanvas, setShowSignatureCanvas] = useState(false)
  const [isDrawing, setIsDrawing] = useState(false)
  const [currentPath, setCurrentPath] = useState<Array<{ x: number; y: number }>>([])
  const [drawnPaths, setDrawnPaths] = useState<Array<Array<{ x: number; y: number }>>>([])
  
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const signatureCanvasRef = useRef<HTMLCanvasElement>(null)

  // Initialize PDF URL when file changes
  useEffect(() => {
    if (file) {
      const url = URL.createObjectURL(file)
      setPdfUrl(url)
      
      return () => {
        URL.revokeObjectURL(url)
      }
    }
  }, [file])

  // Clear signature canvas
  const clearSignatureCanvas = () => {
    const canvas = signatureCanvasRef.current
    if (canvas) {
      const ctx = canvas.getContext('2d')
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height)
      }
    }
    setDrawnPaths([])
    setCurrentPath([])
  }

  // Start drawing signature
  const startDrawingSignature = () => {
    setShowSignatureCanvas(true)
    setTimeout(() => {
      clearSignatureCanvas()
    }, 100)
  }

  // Canvas drawing handlers
  const handleSignatureCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = signatureCanvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    setIsDrawing(true)
    setCurrentPath([{ x, y }])
  }

  const handleSignatureCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return

    const canvas = signatureCanvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    setCurrentPath(prev => [...prev, { x, y }])

    // Draw on canvas
    const ctx = canvas.getContext('2d')
    if (ctx && currentPath.length > 0) {
      ctx.strokeStyle = '#000000'
      ctx.lineWidth = 2
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'

      ctx.beginPath()
      ctx.moveTo(currentPath[0].x, currentPath[0].y)
      currentPath.forEach(point => {
        ctx.lineTo(point.x, point.y)
      })
      ctx.lineTo(x, y)
      ctx.stroke()
    }
  }

  const handleSignatureCanvasMouseUp = () => {
    if (isDrawing && currentPath.length > 1) {
      setDrawnPaths(prev => [...prev, currentPath])
      setCurrentPath([])
    }
    setIsDrawing(false)
  }

  // Save drawn signature
  const saveDrawnSignature = () => {
    if (drawnPaths.length === 0) {
      alert('Please draw your signature first!')
      return
    }

    const canvas = signatureCanvasRef.current
    if (!canvas) return

    // Create signature object for drawn signature
    const signature: Signature = {
      id: Date.now().toString(),
      type: 'drawn',
      x: 100, // Default position
      y: 100,
      width: 200,
      height: 100,
      pageNumber: currentPage,
      paths: drawnPaths
    }

    setSignatures(prev => [...prev, signature])
    setShowSignatureCanvas(false)
    setDrawnPaths([])
    setCurrentPath([])
  }

  // Remove signature
  const removeSignature = (id: string) => {
    setSignatures(prev => prev.filter(sig => sig.id !== id))
  }

  // Handle clicking on PDF container to add text signature
  const handleContainerClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (draggedSignature || !signatureText.trim()) return

    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    const signature: Signature = {
      id: Date.now().toString(),
      type: 'text',
      x,
      y,
      width: 200,
      height: 40,
      pageNumber: currentPage,
      text: signatureText,
      fontSize: 16
    }

    setSignatures(prev => [...prev, signature])
  }

  // Drag handlers
  const handleMouseDown = (e: React.MouseEvent, signatureId: string) => {
    e.stopPropagation()
    setDraggedSignature(signatureId)
    
    const signature = signatures.find(sig => sig.id === signatureId)
    if (signature) {
      setMouseOffset({
        x: e.clientX - signature.x,
        y: e.clientY - signature.y
      })
    }
  }

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (draggedSignature) {
      const containerRect = iframeRef.current?.getBoundingClientRect()
      if (containerRect) {
        const newX = e.clientX - containerRect.left - mouseOffset.x
        const newY = e.clientY - containerRect.top - mouseOffset.y

        setSignatures(prev => prev.map(sig => 
          sig.id === draggedSignature 
            ? { ...sig, x: Math.max(0, newX), y: Math.max(0, newY) }
            : sig
        ))
      }
    }
  }, [draggedSignature, mouseOffset])

  const handleMouseUp = useCallback(() => {
    setDraggedSignature(null)
  }, [])

  useEffect(() => {
    if (draggedSignature) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [draggedSignature, handleMouseMove, handleMouseUp])

  // Sign and download PDF
  const signAndDownload = async () => {
    if (signatures.length === 0) {
      alert('Please add at least one signature first!')
      return
    }

    setIsProcessing(true)

    try {
      const pdfBytes = await file.arrayBuffer()
      const pdfDoc = await PDFDocument.load(pdfBytes)

      // Group signatures by page
      const signaturesByPage = signatures.reduce((acc, sig) => {
        if (!acc[sig.pageNumber]) acc[sig.pageNumber] = []
        acc[sig.pageNumber].push(sig)
        return acc
      }, {} as Record<number, Signature[]>)

      // Add signatures to each page
      for (const [pageNum, pageSignatures] of Object.entries(signaturesByPage)) {
        const pageIndex = parseInt(pageNum) - 1
        if (pageIndex >= 0 && pageIndex < pdfDoc.getPageCount()) {
          const page = pdfDoc.getPage(pageIndex)
          const { width: pageWidth, height: pageHeight } = page.getSize()

          for (const signature of pageSignatures) {
            if (signature.type === 'text' && signature.text) {
              // Add text signature
              const pdfY = pageHeight - signature.y - (signature.fontSize || 16)
              
              page.drawText(signature.text, {
                x: signature.x,
                y: pdfY,
                size: signature.fontSize || 16,
                color: rgb(0, 0, 0),
              })
            } else if (signature.type === 'drawn' && signature.paths) {
              // Add drawn signature
              const pdfY = pageHeight - signature.y - signature.height
              
              // Convert canvas paths to PDF coordinates and draw them
              for (const path of signature.paths) {
                if (path.length > 1) {
                  // Scale path coordinates to fit signature dimensions
                  const scaleX = signature.width / 400 // Canvas width is 400
                  const scaleY = signature.height / 200 // Canvas height is 200
                  
                  page.drawSvgPath(
                    `M ${signature.x + path[0].x * scaleX} ${pdfY + path[0].y * scaleY} ` +
                    path.slice(1).map(point => 
                      `L ${signature.x + point.x * scaleX} ${pdfY + point.y * scaleY}`
                    ).join(' '),
                    {
                      color: rgb(0, 0, 0),
                      borderWidth: 1,
                    }
                  )
                }
              }
            }
          }
        }
      }

      const signedPdfBytes = await pdfDoc.save()
      const blob = new Blob([signedPdfBytes], { type: 'application/pdf' })
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
    <div className="space-y-6">
      {/* Controls */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
        <h2 className="text-xl font-semibold mb-4">✍️ PDF Signature</h2>
        
        <div className="space-y-4">
          {/* Signature Input */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Text Signature:
            </label>
            <input
              type="text"
              value={signatureText}
              onChange={(e) => setSignatureText(e.target.value)}
              placeholder="Enter your signature text"
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-black dark:text-white"
            />
          </div>

          {/* Signature Type Buttons */}
          <div className="flex gap-2">
            <button
              onClick={() => {
                if (signatureText.trim()) {
                  // Text signature will be added on click
                  alert('Click anywhere on the PDF to place your text signature')
                } else {
                  alert('Please enter signature text first')
                }
              }}
              disabled={!signatureText.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
            >
              📝 Add Text Signature
            </button>
            
            <button
              onClick={startDrawingSignature}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              ✏️ Draw Signature
            </button>
          </div>

          {/* Page Navigation */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage <= 1}
              className="px-3 py-1 bg-gray-600 text-white rounded disabled:bg-gray-400"
            >
              Previous
            </button>
            <span className="text-sm">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage >= totalPages}
              className="px-3 py-1 bg-gray-600 text-white rounded disabled:bg-gray-400"
            >
              Next
            </button>
          </div>

          {/* Current Page Signatures */}
          {signatures.filter(sig => sig.pageNumber === currentPage).length > 0 && (
            <div>
              <h3 className="text-sm font-medium mb-2">Signatures on this page:</h3>
              <div className="space-y-2">
                {signatures
                  .filter(sig => sig.pageNumber === currentPage)
                  .map(sig => (
                    <div key={sig.id} className="flex items-center justify-between bg-gray-100 dark:bg-gray-700 p-2 rounded">
                      <span className="text-sm">
                        {sig.type === 'text' ? `Text: "${sig.text}"` : 'Drawn signature'}
                      </span>
                      <button
                        onClick={() => removeSignature(sig.id)}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Sign Button */}
          <button
            onClick={signAndDownload}
            disabled={signatures.length === 0 || isProcessing}
            className="w-full py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 font-medium"
          >
            {isProcessing ? 'Signing PDF...' : '✅ Sign & Download PDF'}
          </button>
        </div>
      </div>

      {/* PDF Preview with Signatures */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
        <div 
          className="relative border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden"
          onClick={handleContainerClick}
          style={{ minHeight: '600px' }}
        >
          {pdfUrl && (
            <iframe
              ref={iframeRef}
              src={`${pdfUrl}#page=${currentPage}&toolbar=0&navpanes=0&scrollbar=0`}
              className="w-full h-[600px] border-0"
              title="PDF Preview"
            />
          )}

          {/* Signature Overlays */}
          {signatures
            .filter(sig => sig.pageNumber === currentPage)
            .map(signature => (
              <div
                key={signature.id}
                className="absolute border-2 border-blue-500 bg-blue-50 bg-opacity-50 cursor-move flex items-center justify-center text-xs"
                style={{
                  left: signature.x,
                  top: signature.y,
                  width: signature.width,
                  height: signature.height,
                  zIndex: 10
                }}
                onMouseDown={(e) => handleMouseDown(e, signature.id)}
              >
                {signature.type === 'text' ? signature.text : '✏️ Signature'}
              </div>
            ))}
        </div>

        {/* Instructions */}
        <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
          <h4 className="font-medium mb-2">How to use:</h4>
          <ol className="list-decimal list-inside space-y-1">
            <li>Enter your signature text or draw a signature</li>
            <li>For text signatures: Click "Add Text Signature" then click on the PDF</li>
            <li>For drawn signatures: Click "Draw Signature" to open the drawing tool</li>
            <li>Drag signatures to reposition them</li>
            <li>Navigate between pages to sign multiple pages</li>
            <li>Click "Sign & Download" to get your signed PDF</li>
          </ol>
        </div>
      </div>

      {/* Signature Drawing Modal */}
      {showSignatureCanvas && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">✏️ Draw Your Signature</h3>
            
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
                onClick={saveDrawnSignature}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Save & Place
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default SimplePDFSigner
