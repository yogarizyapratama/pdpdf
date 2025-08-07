'use client'

import { useState, useCallback } from 'react'
import { FileText, Download, Presentation, Loader } from 'lucide-react'
import StructuredData from '@/components/StructuredData'
import ToolLayout from '@/components/ToolLayout'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import FileUpload from '@/components/FileUpload'
import { downloadBlob, formatFileSize } from '@/lib/utils'

export default function PowerPointToPDFPage() {
  const [files, setFiles] = useState<File[]>([])
  const [isConverting, setIsConverting] = useState(false)
  const [convertedFiles, setConvertedFiles] = useState<Array<{ name: string; blob: Blob; size: number }>>([])
  const [error, setError] = useState<string>('')
  const [conversionProgress, setConversionProgress] = useState<number>(0)
  const [currentFile, setCurrentFile] = useState<string>('')

  const handleFilesSelected = useCallback((selectedFiles: File[]) => {
    setFiles(selectedFiles)
    setConvertedFiles([])
    setError('')
  }, [])

  const convertPowerPointToPDF = async () => {
    if (files.length === 0) {
      setError('Please select PowerPoint files to convert')
      return
    }

    setIsConverting(true)
    setError('')
    setConvertedFiles([])
    setConversionProgress(0)

    // Note: This is a client-side implementation limitation
    // In a real-world scenario, you would need:
    // 1. A server-side service using libraries like python-pptx + reportlab
    // 2. Online conversion APIs like CloudConvert, Aspose, or similar
    // 3. Or guide users to use built-in "Save as PDF" in PowerPoint
    
    try {
      const converted: Array<{ name: string; blob: Blob; size: number }> = []
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        setCurrentFile(file.name)
        setConversionProgress(((i + 0.5) / files.length) * 100)

        // For demonstration, we'll create a simple PDF with file information
        // In production, you'd use a proper conversion service
        const pdfContent = await createFallbackPDF(file)
        
        converted.push({
          name: file.name.replace(/\.(pptx?|potx?)$/i, '.pdf'),
          blob: pdfContent,
          size: pdfContent.size
        })
        
        setConversionProgress(((i + 1) / files.length) * 100)
      }
      
      setConvertedFiles(converted)
      setCurrentFile('')
      
    } catch (err) {
      setError('Conversion failed. Please try again or use PowerPoint\'s built-in "Save as PDF" feature.')
      console.error('PowerPoint conversion error:', err)
    } finally {
      setIsConverting(false)
      setConversionProgress(0)
    }
  }

  const createFallbackPDF = async (file: File): Promise<Blob> => {
    // Import PDF-lib dynamically for client-side usage
    const { PDFDocument, rgb, StandardFonts } = await import('pdf-lib')
    
    const pdfDoc = await PDFDocument.create()
    const timesRomanFont = await pdfDoc.embedFont(StandardFonts.TimesRoman)
    const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica)
    
    const page = pdfDoc.addPage()
    const { width, height } = page.getSize()
    
    // Create a notice page explaining the limitation
    page.drawText('PowerPoint to PDF Conversion Notice', {
      x: 50,
      y: height - 100,
      size: 24,
      font: helveticaFont,
      color: rgb(0.2, 0.2, 0.8)
    })
    
    page.drawText(`Original File: ${file.name}`, {
      x: 50,
      y: height - 150,
      size: 14,
      font: timesRomanFont,
      color: rgb(0, 0, 0)
    })
    
    page.drawText(`File Size: ${formatFileSize(file.size)}`, {
      x: 50,
      y: height - 170,
      size: 14,
      font: timesRomanFont,
      color: rgb(0, 0, 0)
    })
    
    page.drawText(`Converted: ${new Date().toLocaleString()}`, {
      x: 50,
      y: height - 190,
      size: 14,
      font: timesRomanFont,
      color: rgb(0, 0, 0)
    })
    
    const noticeText = [
      'This is a demo conversion. For full PowerPoint to PDF conversion,',
      'please use one of these recommended methods:',
      '',
      '1. Microsoft PowerPoint: File > Save As > PDF',
      '2. Google Slides: File > Download > PDF Document',
      '3. LibreOffice Impress: File > Export as PDF',
      '4. Online services: SmallPDF, ILovePDF, or PDF24',
      '',
      'These tools provide complete slide conversion with',
      'animations, transitions, and formatting preserved.',
      '',
      'For automated conversion in web applications,',
      'consider server-side solutions using:',
      '• Microsoft Graph API',
      '• Aspose.Slides API',
      '• CloudConvert API',
      '• LibreOffice headless mode'
    ]
    
    let yPosition = height - 250
    noticeText.forEach(line => {
      page.drawText(line, {
        x: 50,
        y: yPosition,
        size: 12,
        font: timesRomanFont,
        color: rgb(0.3, 0.3, 0.3)
      })
      yPosition -= 20
    })
    
    // Add a border
    page.drawRectangle({
      x: 30,
      y: 30,
      width: width - 60,
      height: height - 60,
      borderColor: rgb(0.5, 0.5, 0.5),
      borderWidth: 1
    })
    
    const pdfBytes = await pdfDoc.save()
    return new Blob([pdfBytes], { type: 'application/pdf' })
  }

  const downloadFile = (file: { name: string; blob: Blob }) => {
    downloadBlob(file.blob, file.name)
  }

  const downloadAll = () => {
    convertedFiles.forEach(file => {
      downloadFile(file)
    })
  }

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index))
  }

  const resetFiles = () => {
    setFiles([])
    setConvertedFiles([])
    setError('')
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="p-4 bg-orange-100 dark:bg-orange-900 rounded-full">
                <Presentation className="h-12 w-12 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              PowerPoint to PDF Converter
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Convert PowerPoint presentations to PDF format. Preserve your slides in a universal, shareable format.
            </p>
          </div>

          {/* Upload Section */}
          {files.length === 0 && (
            <div className="mb-8">
              <FileUpload 
                onFilesSelected={handleFilesSelected}
                multiple={true}
                maxSize={100}
                accept=".ppt,.pptx,.potx"
              />
            </div>
          )}

          {/* Files List */}
          {files.length > 0 && (
            <div className="space-y-8">
              {/* Selected Files */}
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Selected PowerPoint Files ({files.length})
                  </h3>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setFiles([])}
                      className="px-3 py-1 text-sm bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded"
                    >
                      Clear All
                    </button>
                    <label className="px-3 py-1 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded cursor-pointer">
                      Add More
                      <input
                        type="file"
                        multiple
                        accept=".ppt,.pptx,.potx"
                        onChange={(e) => {
                          const newFiles = Array.from(e.target.files || [])
                          setFiles([...files, ...newFiles])
                        }}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>

                <div className="space-y-3">
                  {files.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Presentation className="h-8 w-8 text-orange-600 dark:text-orange-400" />
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {file.name}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-300">
                            {formatFileSize(file.size)}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => removeFile(index)}
                        className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Conversion Progress */}
              {isConverting && (
                <div className="bg-orange-50 dark:bg-orange-950/20 rounded-lg p-6">
                  <div className="flex items-center space-x-4 mb-4">
                    <Loader className="h-6 w-6 animate-spin text-orange-600" />
                    <div>
                      <h4 className="font-semibold text-orange-900 dark:text-orange-100">
                        Converting to PDF...
                      </h4>
                      {currentFile && (
                        <p className="text-orange-700 dark:text-orange-300">
                          Processing: {currentFile}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="w-full bg-orange-200 dark:bg-orange-800 rounded-full h-2">
                    <div
                      className="bg-orange-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${conversionProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Converted Files */}
              {convertedFiles.length > 0 && (
                <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Converted PDF Files ({convertedFiles.length})
                    </h3>
                    <button
                      onClick={downloadAll}
                      className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg"
                    >
                      <Download className="h-4 w-4" />
                      <span>Download All</span>
                    </button>
                  </div>

                  <div className="space-y-3">
                    {convertedFiles.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <FileText className="h-8 w-8 text-red-600 dark:text-red-400" />
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {file.name}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-300">
                              {formatFileSize(file.size)}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => downloadFile(file)}
                          className="flex items-center space-x-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
                        >
                          <Download className="h-4 w-4" />
                          <span>Download</span>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Error */}
              {error && (
                <div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <p className="text-red-700 dark:text-red-300">{error}</p>
                </div>
              )}

              {/* Convert Button */}
              <div className="flex justify-center">
                <button
                  onClick={convertPowerPointToPDF}
                  disabled={isConverting}
                  className="flex items-center space-x-3 px-8 py-4 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg transition-colors text-lg font-medium"
                >
                  <Presentation className="h-6 w-6" />
                  <span>
                    {isConverting ? 'Converting...' : 'Convert to PDF'}
                  </span>
                </button>
              </div>
            </div>
          )}

          {/* Info Section */}
          <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              PowerPoint to PDF Conversion
            </h3>
            <div className="space-y-4 text-gray-600 dark:text-gray-300">
              <p>
                Convert your PowerPoint presentations to PDF format for easy sharing and viewing across all devices. 
                PDFs maintain consistent formatting and are universally accessible.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">Supported Formats:</h4>
                  <ul className="text-sm space-y-1">
                    <li>• .ppt (PowerPoint 97-2003)</li>
                    <li>• .pptx (PowerPoint 2007+)</li>
                    <li>• .potx (PowerPoint Template)</li>
                    <li>• Batch conversion supported</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">Best Practices:</h4>
                  <ul className="text-sm space-y-1">
                    <li>• Use standard fonts for compatibility</li>
                    <li>• Optimize images before conversion</li>
                    <li>• Check slide layouts in preview</li>
                    <li>• Consider print settings for best results</li>
                  </ul>
                </div>
              </div>
            </div>
            
            <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg">
              <h4 className="font-medium text-yellow-900 dark:text-yellow-100 mb-2">
                ⚠️ Browser Limitation Notice
              </h4>
              <p className="text-sm text-yellow-700 dark:text-yellow-300">
                This demo shows the conversion interface. For full PowerPoint to PDF conversion, use:
              </p>
              <ul className="text-sm text-yellow-700 dark:text-yellow-300 mt-2 space-y-1">
                <li>• Microsoft PowerPoint: File → Save As → PDF</li>
                <li>• Google Slides: File → Download → PDF Document</li>
                <li>• Online services: SmallPDF, ILovePDF, PDF24</li>
              </ul>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
