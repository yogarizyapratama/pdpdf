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
  imageData?: string // Base64 image data for preview
  pdfData?: string // Base64 PDF vector data
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
  const [pdfDimensions, setPdfDimensions] = useState({ width: 0, height: 0 })
  const [resizingSignature, setResizingSignature] = useState<string | null>(null)
  const [resizeHandle, setResizeHandle] = useState<'se' | 'sw' | 'ne' | 'nw' | null>(null)
  const [pdfScale, setPdfScale] = useState(1)
  const [pdfPageDimensions, setPdfPageDimensions] = useState({ width: 595, height: 842 }) // A4 default
  const [selectedSignature, setSelectedSignature] = useState<string | null>(null)
  const [isResizing, setIsResizing] = useState(false)
  const [resizeStartPos, setResizeStartPos] = useState({ x: 0, y: 0 })
  const [resizeStartSize, setResizeStartSize] = useState({ width: 0, height: 0 })
  const [containerHeight, setContainerHeight] = useState('600px')
  const [isMobileView, setIsMobileView] = useState(false)
  
  // Check if mobile view and ensure viewport is optimized
  useEffect(() => {
    const checkMobileView = () => {
      const isMobile = window.innerWidth <= 768
      setIsMobileView(isMobile)
      
      // Ensure mobile viewport is properly configured
      if (isMobile && typeof document !== 'undefined') {
        let viewport = document.querySelector('meta[name="viewport"]')
        if (!viewport) {
          viewport = document.createElement('meta')
          viewport.setAttribute('name', 'viewport')
          document.head.appendChild(viewport)
        }
        viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no')
      }
    }
    
    checkMobileView()
    window.addEventListener('resize', checkMobileView)
    return () => window.removeEventListener('resize', checkMobileView)
  }, [])
  
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
      
      // Get PDF page dimensions
      const getPdfDimensions = async () => {
        try {
          const pdfBytes = await file.arrayBuffer()
          const pdfDoc = await PDFDocument.load(pdfBytes)
          const page = pdfDoc.getPage(0) // Get first page
          const { width, height } = page.getSize()
          setPdfPageDimensions({ width, height })
          setTotalPages(pdfDoc.getPageCount())
          
          console.log('PDF Page Dimensions:', { width, height })
        } catch (error) {
          console.error('Error getting PDF dimensions:', error)
        }
      }
      
      getPdfDimensions()
      
      return () => {
        URL.revokeObjectURL(url)
      }
    }
  }, [file])

  // Calculate responsive container height
  useEffect(() => {
    const calculateHeight = () => {
      try {
        const windowHeight = window.innerHeight
        const windowWidth = window.innerWidth
        
        if (isMobileView) {
          // Mobile: More aggressive optimization
          // Use viewport height minus space for controls
          const availableHeight = windowHeight - 150 // Reduced space for controls
          const optimalHeight = Math.max(
            350, // Increased minimum height for mobile
            Math.min(availableHeight, windowHeight * 0.85) // Increased to 85% of viewport
          )
          setContainerHeight(`${optimalHeight}px`)
          
          console.log('Mobile PDF container:', {
            windowHeight,
            windowWidth,
            availableHeight,
            optimalHeight,
            minHeight: 350
          })
        } else {
          // Desktop: calculate based on aspect ratio with constraints
          const minHeight = 600
          const maxViewportHeight = windowHeight * 0.85
          
          const aspectRatio = pdfPageDimensions.height / pdfPageDimensions.width
          const baseWidth = Math.min(windowWidth * 0.8, 1200)
          let calculatedHeight = baseWidth * aspectRatio
          
          const finalHeight = Math.max(minHeight, Math.min(calculatedHeight, maxViewportHeight))
          setContainerHeight(`${finalHeight}px`)
          
          console.log('Desktop PDF container:', {
            aspectRatio,
            baseWidth,
            calculatedHeight,
            finalHeight
          })
        }
      } catch (error) {
        console.error('Error calculating container height:', error)
        setContainerHeight(isMobileView ? '400px' : '600px')
      }
    }

    calculateHeight()
    
    const handleResize = () => {
      setTimeout(calculateHeight, 100)
    }
    
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [pdfPageDimensions.width, pdfPageDimensions.height, isMobileView])

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
      
      // Adjust canvas size for mobile
      const canvas = signatureCanvasRef.current
      if (canvas) {
        const canvasWidth = isMobileView ? Math.min(350, window.innerWidth - 80) : 400
        const canvasHeight = isMobileView ? 150 : 200
        
        canvas.width = canvasWidth
        canvas.height = canvasHeight
        
        // Set canvas context properties for mobile
        const ctx = canvas.getContext('2d')
        if (ctx) {
          ctx.lineCap = 'round'
          ctx.lineJoin = 'round'
          ctx.strokeStyle = '#000000'
          ctx.lineWidth = isMobileView ? 3 : 2
        }
      }
    }, 100)
  }

  // Canvas drawing handlers - Updated to support touch events
  const handleSignatureCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = signatureCanvasRef.current
    if (!canvas) return

    e.preventDefault() // Prevent scrolling on touch

    const rect = canvas.getBoundingClientRect()
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY
    
    // Scale coordinates to canvas actual size
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height
    
    const x = (clientX - rect.left) * scaleX
    const y = (clientY - rect.top) * scaleY

    console.log('Canvas draw start:', { x, y, isTouchEvent: 'touches' in e })

    setIsDrawing(true)
    setCurrentPath([{ x, y }])
  }

  const handleSignatureCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return

    const canvas = signatureCanvasRef.current
    if (!canvas) return

    e.preventDefault() // Prevent scrolling on touch

    const rect = canvas.getBoundingClientRect()
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY
    
    // Scale coordinates to canvas actual size
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height
    
    const x = (clientX - rect.left) * scaleX
    const y = (clientY - rect.top) * scaleY

    setCurrentPath(prev => [...prev, { x, y }])

    // Draw on canvas
    const ctx = canvas.getContext('2d')
    if (ctx && currentPath.length > 0) {
      ctx.strokeStyle = '#000000'
      ctx.lineWidth = isMobileView ? 4 : 3 // Thicker for mobile
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
      console.log('Canvas draw end, paths count:', drawnPaths.length + 1)
    }
    setIsDrawing(false)
  }

  // Save drawn signature as PDF vector
  const saveDrawnSignature = async () => {
    if (drawnPaths.length === 0) {
      alert('Please draw your signature first! Use your finger on mobile or mouse on desktop to draw in the canvas area.')
      return
    }

    const canvas = signatureCanvasRef.current
    if (!canvas) return

    try {
      console.log('Saving drawn signature with', drawnPaths.length, 'paths')
      
      // Create a mini PDF with the signature as vector
      const signaturePdfDoc = await PDFDocument.create()
      const page = signaturePdfDoc.addPage([canvas.width, canvas.height])
      
      // Convert canvas paths to PDF vector paths
      for (const path of drawnPaths) {
        if (path.length > 1) {
          const svgPath = `M ${path[0].x} ${canvas.height - path[0].y} ` + 
            path.slice(1).map(point => `L ${point.x} ${canvas.height - point.y}`).join(' ')
          
          page.drawSvgPath(svgPath, {
            color: rgb(0, 0, 0),
            borderWidth: 2,
          })
        }
      }
      
      // Save as bytes for embedding
      const pdfBytes = await signaturePdfDoc.save()
      const base64Pdf = btoa(String.fromCharCode(...pdfBytes))
      
      // Also keep canvas image as fallback
      const dataURL = canvas.toDataURL('image/png')

      // Create signature object for drawn signature
      const signature: Signature = {
        id: `signature-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type: 'drawn',
        x: 100, // Default position
        y: 100,
        width: 150, // Default size
        height: 75,
        pageNumber: currentPage,
        paths: drawnPaths,
        imageData: dataURL,
        pdfData: base64Pdf
      }

      console.log('Adding drawn signature:', signature.id)
      setSignatures(prev => [...prev, signature])
      setSelectedSignature(signature.id)
      setShowSignatureCanvas(false)
      
      // Clear for next signature
      setDrawnPaths([])
      setCurrentPath([])
      
    } catch (error) {
      console.error('Error creating signature:', error)
      alert('Error creating signature. Please try drawing again.')
    }
  }

  // Remove signature
  const removeSignature = (id: string) => {
    setSignatures(prev => prev.filter(sig => sig.id !== id))
    if (selectedSignature === id) {
      setSelectedSignature(null)
    }
  }

  // Select signature
  const selectSignature = (id: string) => {
    setSelectedSignature(id)
  }

  // Handle clicking on PDF container to add text signature
  const handleContainerClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Don't add signature if we're dragging or no text entered
    if (draggedSignature || !signatureText.trim()) {
      // Deselect signature if clicking on empty area
      if (!draggedSignature) {
        setSelectedSignature(null)
      }
      return
    }

    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    // Make sure click is within iframe bounds
    if (x < 0 || y < 0 || x > rect.width || y > rect.height) return

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

    console.log('Adding signature at:', { x, y, page: currentPage })
    setSignatures(prev => [...prev, signature])
    setSelectedSignature(signature.id) // Auto-select new signature
  }

  // Drag handlers - Updated to support touch events
  const handleMouseDown = (e: React.MouseEvent | React.TouchEvent, signatureId: string) => {
    e.preventDefault()
    e.stopPropagation()
    
    // Select the signature
    setSelectedSignature(signatureId)
    
    console.log('Starting drag for signature:', signatureId)
    setDraggedSignature(signatureId)
    
    const signature = signatures.find(sig => sig.id === signatureId)
    const containerRect = iframeRef.current?.getBoundingClientRect()
    
    if (signature && containerRect) {
      // Get coordinates from mouse or touch event
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY
      
      const offsetX = clientX - containerRect.left - signature.x
      const offsetY = clientY - containerRect.top - signature.y
      
      console.log('Mouse/Touch offset:', { offsetX, offsetY })
      setMouseOffset({ x: offsetX, y: offsetY })
    }
  }

  const handleMouseMove = useCallback((e: MouseEvent | TouchEvent) => {
    if (resizingSignature && isResizing) {
      // Simple resize - only from bottom-right corner
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY
      
      const deltaX = clientX - resizeStartPos.x
      const deltaY = clientY - resizeStartPos.y
      
      setSignatures(prev => prev.map(sig => 
        sig.id === resizingSignature 
          ? { 
              ...sig, 
              width: Math.max(50, resizeStartSize.width + deltaX),
              height: Math.max(30, resizeStartSize.height + deltaY)
            }
          : sig
      ))
      
    } else if (draggedSignature) {
      const containerRect = iframeRef.current?.getBoundingClientRect()
      if (containerRect) {
        const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
        const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY
        
        const newX = clientX - containerRect.left - mouseOffset.x
        const newY = clientY - containerRect.top - mouseOffset.y

        setSignatures(prev => prev.map(sig => 
          sig.id === draggedSignature 
            ? { 
                ...sig, 
                x: Math.max(0, Math.min(containerRect.width - sig.width, newX)), 
                y: Math.max(0, Math.min(containerRect.height - sig.height, newY))
              }
            : sig
        ))
      }
    }
  }, [draggedSignature, resizingSignature, isResizing, mouseOffset, resizeStartPos, resizeStartSize])

  const handleMouseUp = useCallback(() => {
    if (draggedSignature) {
      console.log('Ending drag for signature:', draggedSignature)
    }
    if (resizingSignature) {
      console.log('Ending resize for signature:', resizingSignature)
    }
    setDraggedSignature(null)
    setResizingSignature(null)
    setIsResizing(false)
  }, [draggedSignature, resizingSignature])

  // Simple resize handlers - Updated to support touch events
  const handleResizeMouseDown = (e: React.MouseEvent | React.TouchEvent, signatureId: string) => {
    e.preventDefault()
    e.stopPropagation()
    
    setResizingSignature(signatureId)
    setIsResizing(true)
    
    const signature = signatures.find(sig => sig.id === signatureId)
    if (signature) {
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY
      
      setResizeStartPos({ x: clientX, y: clientY })
      setResizeStartSize({ width: signature.width, height: signature.height })
    }
  }

  useEffect(() => {
    if (draggedSignature || resizingSignature) {
      // Add both mouse and touch event listeners
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      document.addEventListener('touchmove', handleMouseMove, { passive: false })
      document.addEventListener('touchend', handleMouseUp)
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
      document.removeEventListener('touchmove', handleMouseMove)
      document.removeEventListener('touchend', handleMouseUp)
    }
  }, [draggedSignature, resizingSignature, handleMouseMove, handleMouseUp])

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
            console.log('Processing signature:', signature.id, signature.type)
            
            if (signature.type === 'text' && signature.text) {
              // Calculate actual PDF coordinates
              const actualX = signature.x / pdfScale
              const actualY = signature.y / pdfScale
              const actualFontSize = (signature.fontSize || 16) / pdfScale
              
              const pdfY = pageHeight - actualY - actualFontSize
              
              console.log('Adding text signature:', { 
                text: signature.text,
                x: actualX, y: pdfY, size: actualFontSize 
              })
              
              page.drawText(signature.text, {
                x: actualX,
                y: pdfY,
                size: actualFontSize,
                color: rgb(0, 0, 0),
              })
              
            } else if (signature.type === 'drawn') {
              // Calculate actual PDF coordinates for drawn signature
              const actualX = signature.x / pdfScale
              const actualY = signature.y / pdfScale
              const actualWidth = signature.width / pdfScale
              const actualHeight = signature.height / pdfScale
              
              const pdfY = pageHeight - actualY - actualHeight
              
              console.log('Adding drawn signature at:', { 
                x: actualX, y: pdfY, width: actualWidth, height: actualHeight
              })
              
              // Always try image first (most reliable)
              if (signature.imageData) {
                try {
                  console.log('Embedding image signature')
                  const imageBytes = Uint8Array.from(atob(signature.imageData.split(',')[1]), c => c.charCodeAt(0))
                  const image = await pdfDoc.embedPng(imageBytes)
                  
                  page.drawImage(image, {
                    x: actualX,
                    y: pdfY,
                    width: actualWidth,
                    height: actualHeight,
                  })
                  
                  console.log('Image signature embedded successfully')
                  
                } catch (imgError) {
                  console.error('Image embedding failed:', imgError)
                  
                  // Fallback to paths
                  if (signature.paths) {
                    console.log('Using path fallback')
                    for (const path of signature.paths) {
                      if (path.length > 1) {
                        const scaleX = actualWidth / 400
                        const scaleY = actualHeight / 200
                        
                        page.drawSvgPath(
                          `M ${actualX + path[0].x * scaleX} ${pdfY + (200 - path[0].y) * scaleY} ` +
                          path.slice(1).map(point => 
                            `L ${actualX + point.x * scaleX} ${pdfY + (200 - point.y) * scaleY}`
                          ).join(' '),
                          {
                            color: rgb(0, 0, 0),
                            borderWidth: 2,
                          }
                        )
                      }
                    }
                  }
                }
              } else if (signature.paths) {
                // Direct path drawing if no image
                console.log('Drawing paths directly')
                for (const path of signature.paths) {
                  if (path.length > 1) {
                    const scaleX = actualWidth / 400
                    const scaleY = actualHeight / 200
                    
                    page.drawSvgPath(
                      `M ${actualX + path[0].x * scaleX} ${pdfY + (200 - path[0].y) * scaleY} ` +
                      path.slice(1).map(point => 
                        `L ${actualX + point.x * scaleX} ${pdfY + (200 - point.y) * scaleY}`
                      ).join(' '),
                      {
                        color: rgb(0, 0, 0),
                        borderWidth: 2,
                      }
                    )
                  }
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
    <div className={`space-y-4 md:space-y-6 ${isMobileView ? 'px-1' : ''} w-full overflow-hidden`}>
      {/* Controls */}
      <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 md:p-6 rounded-lg shadow-lg w-full overflow-hidden">
        <h2 className="text-lg md:text-xl font-semibold mb-4">✍️ PDF Signature</h2>
        
        <div className="space-y-4 w-full overflow-hidden">
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
          <div className="flex flex-col sm:flex-row gap-2 w-full">
            <button
              onClick={() => {
                if (signatureText.trim()) {
                  alert('Click anywhere on the PDF to place your text signature')
                } else {
                  alert('Please enter signature text first')
                }
              }}
              disabled={!signatureText.trim()}
              className="flex-1 px-3 sm:px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 text-sm font-medium min-w-0 truncate"
            >
              <span className="block sm:inline">📝 Add Text</span>
              <span className="hidden sm:inline"> Signature</span>
            </button>
            
            <button
              onClick={startDrawingSignature}
              className="flex-1 px-3 sm:px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium min-w-0 truncate"
            >
              <span className="block sm:inline">✏️ Draw</span>
              <span className="hidden sm:inline"> Signature</span>
            </button>
          </div>

          {/* Page Navigation */}
          <div className="flex items-center justify-center gap-2 sm:gap-4 px-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage <= 1}
              className="px-2 sm:px-3 py-2 bg-gray-600 text-white rounded disabled:bg-gray-400 text-xs sm:text-sm min-w-0 flex-shrink-0"
            >
              <span className="hidden sm:inline">Previous</span>
              <span className="sm:hidden">‹</span>
            </button>
            <span className="text-xs sm:text-sm font-medium text-center px-1">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage >= totalPages}
              className="px-2 sm:px-3 py-2 bg-gray-600 text-white rounded disabled:bg-gray-400 text-xs sm:text-sm min-w-0 flex-shrink-0"
            >
              <span className="hidden sm:inline">Next</span>
              <span className="sm:hidden">›</span>
            </button>
          </div>

          {/* Current Page Signatures - Mobile Optimized */}
          {signatures.filter(sig => sig.pageNumber === currentPage).length > 0 && (
            <div>
              <h3 className="text-sm font-medium mb-2">Signatures on this page:</h3>
              <div className="space-y-2">
                {signatures
                  .filter(sig => sig.pageNumber === currentPage)
                  .map(sig => (
                    <div key={sig.id} className={`bg-gray-100 dark:bg-gray-700 p-3 rounded ${selectedSignature === sig.id ? 'ring-2 ring-green-500' : ''}`}>
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <span className="text-sm">
                          {sig.type === 'text' ? `"${sig.text}"` : '✏️ Drawn signature'} 
                          <span className="text-xs text-gray-500 block sm:inline sm:ml-2">
                            ({Math.round(sig.width)}×{Math.round(sig.height)}px)
                          </span>
                        </span>
                        <div className="flex gap-2">
                          <button
                            onClick={() => setSelectedSignature(selectedSignature === sig.id ? null : sig.id)}
                            className={`text-xs px-3 py-1 rounded flex-1 sm:flex-none ${selectedSignature === sig.id ? 'bg-green-600 text-white' : 'bg-gray-300 text-gray-700'}`}
                          >
                            {selectedSignature === sig.id ? 'Selected' : 'Select'}
                          </button>
                          <button
                            onClick={() => removeSignature(sig.id)}
                            className="text-red-600 hover:text-red-800 text-xs px-3 py-1 bg-red-100 rounded flex-1 sm:flex-none"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
              <div className="mt-2 text-xs text-gray-500">
                💡 Tips: Select signature and drag to move, drag corner (●) to resize
              </div>
            </div>
          )}
        </div>
      </div>

      {/* PDF Preview with Signatures */}
      <div className="bg-white dark:bg-gray-800 p-1 sm:p-2 md:p-6 rounded-lg shadow-lg w-full overflow-hidden">
        <div className="mb-2 sm:mb-3 px-2 sm:px-0">
          <h3 className="text-base sm:text-lg font-medium">📄 PDF Preview</h3>
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
            {isMobileView ? 'Tap to place • Drag to move' : 'Click on PDF to place signatures, drag to move them'}
          </p>
        </div>
        
        <div 
          className={`relative border border-gray-300 dark:border-gray-600 rounded-lg overflow-auto mx-auto ${
            draggedSignature || resizingSignature ? 'cursor-grabbing' : 'cursor-default'
          }`}
          onClick={handleContainerClick}
          style={{ 
            maxHeight: isMobileView ? '85vh' : '90vh',
            width: '100%',
            height: 'auto',
            // Enhanced mobile scrolling
            overflowX: 'auto',
            overflowY: 'auto',
            WebkitOverflowScrolling: 'touch',
            // Mobile-specific optimizations
            ...(isMobileView && {
              margin: '0',
              borderRadius: '8px',
              maxWidth: '100vw'
            })
          }}
        >
          {pdfUrl && (
            <iframe
              ref={iframeRef}
              src={`${pdfUrl}#page=${currentPage}&toolbar=0&navpanes=0&scrollbar=1&zoom=${isMobileView ? 'page-fit' : 'page-width'}`}
              className="w-full border-0 rounded-md"
              style={{ 
                height: containerHeight,
                minHeight: isMobileView ? '300px' : '600px',
                maxHeight: isMobileView ? 
                  `${window.innerHeight * 0.8}px` : 
                  `${window.innerHeight * 0.85}px`,
                width: '100%',
                // Mobile-specific styling
                ...(isMobileView && {
                  border: 'none',
                  outline: 'none',
                  display: 'block'
                }),
                aspectRatio: `${pdfPageDimensions.width} / ${pdfPageDimensions.height}`,
                pointerEvents: draggedSignature || resizingSignature ? 'none' : 'auto'
              }}
              title="PDF Preview"
              onLoad={() => {
                // Calculate scale when PDF loads
                const iframe = iframeRef.current
                if (iframe) {
                  setTimeout(() => {
                    const rect = iframe.getBoundingClientRect()
                    const scale = rect.width / pdfPageDimensions.width
                    setPdfScale(scale)
                    setPdfDimensions({ width: rect.width, height: rect.height })
                    
                    console.log('PDF Scale calculated:', { 
                      scale, 
                      displayWidth: rect.width, 
                      displayHeight: rect.height,
                      actualWidth: pdfPageDimensions.width,
                      actualHeight: pdfPageDimensions.height,
                      isMobile: isMobileView,
                      containerHeight,
                      viewportHeight: window.innerHeight,
                      viewportWidth: window.innerWidth
                    })
                  }, 100)
                }
              }}
            />
          )}

          {/* Signature Overlays - Mobile Optimized with Touch Support */}
          {signatures
            .filter(sig => sig.pageNumber === currentPage)
            .map(signature => (
              <div
                key={signature.id}
                className={`absolute border-2 bg-opacity-70 cursor-move flex items-center justify-center text-xs font-medium select-none transition-all touch-manipulation ${
                  draggedSignature === signature.id || resizingSignature === signature.id
                    ? 'border-red-500 bg-red-100 shadow-lg z-30' 
                    : selectedSignature === signature.id
                    ? 'border-green-500 bg-green-100 shadow-md z-20'
                    : 'border-blue-500 bg-blue-100 hover:bg-blue-200 z-10'
                }`}
                style={{
                  left: signature.x,
                  top: signature.y,
                  width: signature.width,
                  height: signature.height,
                  userSelect: 'none',
                  touchAction: 'none' // Prevent scrolling while dragging
                }}
                onMouseDown={(e) => handleMouseDown(e, signature.id)}
                onTouchStart={(e) => handleMouseDown(e, signature.id)}
                onClick={(e) => {
                  e.stopPropagation()
                  selectSignature(signature.id)
                }}
                title={`${signature.type === 'text' ? 'Text' : 'Drawn'} signature - Tap to select, drag to move`}
              >
                {/* Signature Content */}
                {signature.type === 'text' ? (
                  <span className="truncate px-1 sm:px-2" style={{ fontSize: `${Math.max(10, signature.fontSize || 16)}px` }}>
                    {signature.text}
                  </span>
                ) : signature.imageData ? (
                  <img 
                    src={signature.imageData} 
                    alt="Signature" 
                    className="w-full h-full object-contain pointer-events-none"
                    style={{ filter: 'drop-shadow(1px 1px 1px rgba(0,0,0,0.3))' }}
                  />
                ) : (
                  <span className="text-xs">✏️ Signature</span>
                )}

                {/* Mobile-Optimized Resize Handle - Larger for touch */}
                {selectedSignature === signature.id && (
                  <div
                    className="absolute w-6 h-6 bg-blue-600 border-2 border-white cursor-se-resize rounded-full shadow-lg hover:bg-blue-700 hover:scale-110 transition-all touch-manipulation"
                    style={{ bottom: -12, right: -12, zIndex: 50 }}
                    onMouseDown={(e) => handleResizeMouseDown(e, signature.id)}
                    onTouchStart={(e) => handleResizeMouseDown(e, signature.id)}
                    title="Drag to resize"
                  />
                )}
              </div>
            ))}
        </div>
      </div>

      {/* Sign Button - Moved to bottom */}
      <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 md:p-6 rounded-lg shadow-lg w-full overflow-hidden">
        <button
          onClick={signAndDownload}
          disabled={signatures.length === 0 || isProcessing}
          className="w-full py-3 sm:py-4 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 font-medium text-base sm:text-lg min-w-0"
        >
          {isProcessing ? 'Signing PDF...' : '✅ Sign & Download PDF'}
        </button>
        
        {signatures.length === 0 && (
          <p className="text-center text-sm text-gray-500 mt-2">
            Add at least one signature to download
          </p>
        )}

        {/* Instructions */}
        <div className="mt-6 text-sm text-gray-600 dark:text-gray-400">
          <h4 className="font-medium mb-2">How to use:</h4>
          <ol className="list-decimal list-inside space-y-1">
            <li>Enter your signature text or draw a signature</li>
            <li>For text signatures: Click "Add Text Signature" then click on the PDF</li>
            <li>For drawn signatures: Click "Draw Signature" to create signature</li>
            <li><strong>Click signature to select it</strong> - green border will appear</li>
            <li><strong>Drag signature</strong> to move position</li>
            <li><strong>Drag bottom-right corner (●)</strong> to resize</li>
            <li>Navigate between pages to sign multiple pages</li>
            <li>Click "Sign & Download" to get your signed PDF</li>
          </ol>
          <div className="mt-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <div className="flex items-center gap-2 text-green-700 dark:text-green-300">
              <span>✨</span>
              <span className="font-medium">Simple & Fast:</span>
            </div>
            <ul className="list-disc list-inside mt-1 text-green-600 dark:text-green-400 text-xs space-y-1">
              <li>One corner handle for easy resize</li>
              <li>Mobile-optimized PDF preview</li>
              <li>Reliable signature export to PDF</li>
              <li>Touch-friendly drag and drop</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Signature Drawing Modal - Mobile Optimized */}
      {showSignatureCanvas && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 md:p-6 rounded-lg w-full max-w-lg mx-2 sm:mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-base sm:text-lg font-semibold mb-4">✏️ Draw Your Signature</h3>
            
            <div className="border border-gray-300 dark:border-gray-600 rounded-lg mb-4 p-2">
              <canvas
                ref={signatureCanvasRef}
                className="w-full cursor-crosshair bg-white rounded-lg touch-none max-w-full"
                style={{ 
                  touchAction: 'none',
                  height: 'auto',
                  maxHeight: '200px'
                }}
                onMouseDown={handleSignatureCanvasMouseDown}
                onMouseMove={handleSignatureCanvasMouseMove}
                onMouseUp={handleSignatureCanvasMouseUp}
                onMouseLeave={handleSignatureCanvasMouseUp}
                onTouchStart={handleSignatureCanvasMouseDown}
                onTouchMove={handleSignatureCanvasMouseMove}
                onTouchEnd={handleSignatureCanvasMouseUp}
              />
            </div>
            
            <div className="text-xs text-gray-500 mb-4 text-center p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="font-medium text-blue-700 dark:text-blue-300 mb-1">Drawing Instructions:</div>
              <div>📱 <strong>Mobile:</strong> Use your finger to draw smoothly</div>
              <div>🖱️ <strong>Desktop:</strong> Click and drag with your mouse</div>
              <div className="mt-1 text-blue-600 dark:text-blue-400">
                ✨ Draw slowly for best quality signature
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-2 justify-end w-full">
              <button
                onClick={clearSignatureCanvas}
                className="flex-1 sm:flex-none px-3 sm:px-4 py-3 sm:py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 font-medium text-sm sm:text-base min-w-0"
              >
                <span className="block sm:inline">🗑️ Clear</span>
              </button>
              <button
                onClick={() => setShowSignatureCanvas(false)}
                className="flex-1 sm:flex-none px-3 sm:px-4 py-3 sm:py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-400 font-medium text-sm sm:text-base min-w-0"
              >
                <span className="block sm:inline">❌ Cancel</span>
              </button>
              <button
                onClick={saveDrawnSignature}
                className="flex-1 sm:flex-none px-3 sm:px-4 py-3 sm:py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm sm:text-base min-w-0"
              >
                <span className="block sm:inline">✅ Save</span>
                <span className="hidden sm:inline"> & Place</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default SimplePDFSigner
