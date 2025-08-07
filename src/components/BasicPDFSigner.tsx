'use client'

import { useState, useRef, useEffect } from 'react'
import { PDFDocument, rgb } from 'pdf-lib'
import { PenTool, Download, Trash2, RotateCcw, FileText } from 'lucide-react'

interface Signature {
  id: string
  x: number
  y: number
  text: string
  fontSize: number
  pageNumber: number
}

interface BasicPDFSignerProps {
  file: File
  onClose?: () => void
}

export default function BasicPDFSigner({ file, onClose }: BasicPDFSignerProps) {
  const [signatures, setSignatures] = useState<Signature[]>([])
  const [signatureText, setSignatureText] = useState('Digital Signature')
  const [fontSize, setFontSize] = useState(16)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const [isAddingSignature, setIsAddingSignature] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [previewMode, setPreviewMode] = useState<'text' | 'visual'>('text')
  
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    loadPDFInfo()
  }, [file])

  const loadPDFInfo = async () => {
    try {
      const arrayBuffer = await file.arrayBuffer()
      const pdfDoc = await PDFDocument.load(arrayBuffer)
      setTotalPages(pdfDoc.getPageCount())
      drawPagePreview()
    } catch (error) {
      console.error('Error loading PDF info:', error)
    }
  }

  const drawPagePreview = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size
    canvas.width = 600
    canvas.height = 800

    // Draw page background
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    
    // Draw border
    ctx.strokeStyle = '#e5e7eb'
    ctx.lineWidth = 2
    ctx.strokeRect(0, 0, canvas.width, canvas.height)
    
    // Draw page indicator
    ctx.fillStyle = '#6b7280'
    ctx.font = '16px system-ui'
    ctx.textAlign = 'center'
    ctx.fillText(`Page ${currentPage} of ${totalPages}`, canvas.width / 2, 30)
    
    // Draw placeholder content lines
    ctx.fillStyle = '#e5e7eb'
    ctx.lineWidth = 1
    for (let i = 0; i < 20; i++) {
      const y = 80 + i * 30
      if (y < canvas.height - 50) {
        ctx.fillRect(50, y, canvas.width - 100, 2)
      }
    }
    
    // Draw PDF file info
    ctx.fillStyle = '#374151'
    ctx.font = '14px system-ui'
    ctx.textAlign = 'left'
    ctx.fillText(`📄 ${file.name}`, 50, 60)
    ctx.fillText(`📊 ${(file.size / 1024 / 1024).toFixed(2)} MB`, 50, canvas.height - 30)
    
    // Draw signatures for current page
    const currentPageSignatures = signatures.filter(sig => sig.pageNumber === currentPage)
    currentPageSignatures.forEach(signature => {
      ctx.fillStyle = '#3b82f6'
      ctx.font = `${signature.fontSize}px system-ui`
      ctx.textAlign = 'left'
      
      const x = (signature.x / 100) * canvas.width
      const y = (signature.y / 100) * canvas.height
      
      // Draw signature background
      const textWidth = ctx.measureText(signature.text).width
      ctx.fillStyle = 'rgba(59, 130, 246, 0.1)'
      ctx.fillRect(x - 5, y - signature.fontSize - 5, textWidth + 10, signature.fontSize + 10)
      
      // Draw signature text
      ctx.fillStyle = '#1d4ed8'
      ctx.fillText(signature.text, x, y)
    })
  }

  useEffect(() => {
    drawPagePreview()
  }, [currentPage, signatures, file, totalPages])

  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isAddingSignature || !canvasRef.current) return

    const canvas = canvasRef.current
    const rect = canvas.getBoundingClientRect()
    const x = ((event.clientX - rect.left) / rect.width) * 100
    const y = ((event.clientY - rect.top) / rect.height) * 100

    const newSignature: Signature = {
      id: Date.now().toString(),
      x: Math.max(5, Math.min(80, x)),
      y: Math.max(10, Math.min(90, y)),
      text: signatureText,
      fontSize: fontSize,
      pageNumber: currentPage
    }

    setSignatures(prev => [...prev, newSignature])
    setIsAddingSignature(false)
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
      }, {} as Record<number, Signature[]>)

      // Add signatures to each page
      Object.entries(signaturesByPage).forEach(([pageIndex, pageSignatures]) => {
        const page = pages[parseInt(pageIndex)]
        const { width, height } = page.getSize()

        pageSignatures.forEach(sig => {
          const x = (sig.x / 100) * width
          const y = height - (sig.y / 100) * height - sig.fontSize // Flip Y coordinate
          
          page.drawText(sig.text, {
            x,
            y,
            size: sig.fontSize,
            color: rgb(0, 0, 0),
          })
        })
      })

      const pdfBytes = await pdfDoc.save()
      const blob = new Blob([pdfBytes], { type: 'application/pdf' })
      const url = URL.createObjectURL(blob)
      
      const link = document.createElement('a')
      link.href = url
      link.download = `signed-${file.name}`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      
    } catch (error) {
      console.error('Error signing PDF:', error)
      alert('Error signing PDF. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }

  const currentPageSignatures = signatures.filter(sig => sig.pageNumber === currentPage)

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          📝 Basic PDF Signature Tool
        </h3>
        
        {/* Signature Text Input */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Signature Text
            </label>
            <input
              type="text"
              value={signatureText}
              onChange={(e) => setSignatureText(e.target.value)}
              placeholder="Enter your signature text"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Font Size: {fontSize}px
            </label>
            <input
              type="range"
              min="10"
              max="24"
              value={fontSize}
              onChange={(e) => setFontSize(Number(e.target.value))}
              className="w-full"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2 mb-4">
          <button
            onClick={() => setIsAddingSignature(!isAddingSignature)}
            className={`px-4 py-2 rounded-lg transition-colors ${
              isAddingSignature
                ? 'bg-green-600 hover:bg-green-700 text-white'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            <PenTool className="h-4 w-4 inline mr-2" />
            {isAddingSignature ? 'Click Canvas to Place' : 'Add Signature'}
          </button>
          
          <button
            onClick={clearAllSignatures}
            disabled={signatures.length === 0}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white rounded-lg transition-colors"
          >
            <RotateCcw className="h-4 w-4 inline mr-2" />
            Clear All
          </button>
          
          <button
            onClick={signAndDownload}
            disabled={signatures.length === 0 || isProcessing}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-lg transition-colors"
          >
            <Download className="h-4 w-4 inline mr-2" />
            {isProcessing ? 'Processing...' : 'Sign & Download'}
          </button>
        </div>

        {/* Page Navigation */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage <= 1}
              className="px-3 py-1 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded disabled:opacity-50"
            >
              ←
            </button>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage >= totalPages}
              className="px-3 py-1 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded disabled:opacity-50"
            >
              →
            </button>
          </div>
          
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {currentPageSignatures.length} signature(s) on this page
          </div>
        </div>
      </div>

      {/* Canvas PDF Preview */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
            📄 Page Preview with Signatures
          </h4>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            Click canvas to place signatures
          </div>
        </div>
        
        <div className="flex justify-center">
          <canvas
            ref={canvasRef}
            onClick={handleCanvasClick}
            className={`border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm ${
              isAddingSignature ? 'cursor-crosshair' : 'cursor-default'
            }`}
            style={{ maxWidth: '100%', height: 'auto' }}
          />
        </div>
        
        {isAddingSignature && (
          <div className="mt-2 text-center text-blue-600 dark:text-blue-400 text-sm">
            💡 Click anywhere on the canvas above to place your signature
          </div>
        )}
      </div>

      {/* Signature List */}
      {currentPageSignatures.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            📝 Signatures on Page {currentPage}
          </h4>
          <div className="space-y-2">
            {currentPageSignatures.map((signature) => (
              <div
                key={signature.id}
                className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded border"
              >
                <div className="flex-1">
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    "{signature.text}"
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                    ({signature.fontSize}px, {signature.x.toFixed(1)}%, {signature.y.toFixed(1)}%)
                  </span>
                </div>
                <button
                  onClick={() => deleteSignature(signature.id)}
                  className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="bg-orange-50 dark:bg-orange-950/20 rounded-lg p-4">
        <h4 className="font-medium text-orange-900 dark:text-orange-100 mb-2">
          🎯 Basic Mode Instructions:
        </h4>
        <ol className="text-sm text-orange-700 dark:text-orange-300 space-y-1">
          <li>1. This mode shows a simplified canvas representation of your PDF</li>
          <li>2. Enter your signature text and adjust the font size</li>
          <li>3. Click "Add Signature" and then click on the canvas to place it</li>
          <li>4. Navigate between pages to add signatures to different pages</li>
          <li>5. Your signatures will be accurately placed in the final PDF</li>
          <li>6. Click "Sign & Download" to get your signed PDF file</li>
        </ol>
        <div className="mt-2 text-xs text-orange-600 dark:text-orange-400">
          💡 This mode works reliably on all browsers and devices
        </div>
      </div>
    </div>
  )
}
