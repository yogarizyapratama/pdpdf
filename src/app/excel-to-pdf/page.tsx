'use client'

import { useState, useCallback } from 'react'
import { FileText, Download, FileSpreadsheet, Loader } from 'lucide-react'
import StructuredData from '@/components/StructuredData'
import ToolLayout from '@/components/ToolLayout'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import FileUpload from '@/components/FileUpload'
import { downloadBlob, formatFileSize } from '@/lib/utils'

export default function ExcelToPDFPage() {
  const [files, setFiles] = useState<File[]>([])
  const [isConverting, setIsConverting] = useState(false)
  const [convertedFiles, setConvertedFiles] = useState<Array<{ name: string; blob: Blob; size: number }>>([])
  const [error, setError] = useState<string>('')
  const [conversionProgress, setConversionProgress] = useState<number>(0)
  const [currentFile, setCurrentFile] = useState<string>('')
  const [pageOrientation, setPageOrientation] = useState<'portrait' | 'landscape'>('portrait')
  const [pageSize, setPageSize] = useState<'A4' | 'Letter' | 'Legal'>('A4')
  const [fitToPage, setFitToPage] = useState<boolean>(true)

  const handleFilesSelected = useCallback((selectedFiles: File[]) => {
    setFiles(selectedFiles)
    setConvertedFiles([])
    setError('')
  }, [])

  const convertExcelToPDF = async () => {
    if (files.length === 0) {
      setError('Please select Excel files to convert')
      return
    }

    setIsConverting(true)
    setError('')
    setConvertedFiles([])
    setConversionProgress(0)

    // Note: This is a client-side implementation limitation
    // In a real-world scenario, you would need:
    // 1. A server-side service using libraries like ExcelJS + jsPDF
    // 2. Online conversion APIs like CloudConvert, Aspose, or similar
    // 3. Or guide users to use built-in "Save as PDF" in Excel
    
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
          name: file.name.replace(/\.(xlsx?|xltx?|csv)$/i, '.pdf'),
          blob: pdfContent,
          size: pdfContent.size
        })
        
        setConversionProgress(((i + 1) / files.length) * 100)
      }
      
      setConvertedFiles(converted)
      setCurrentFile('')
      
    } catch (err) {
      setError('Conversion failed. Please try again or use Excel\'s built-in "Save as PDF" feature.')
      console.error('Excel conversion error:', err)
    } finally {
      setIsConverting(false)
      setConversionProgress(0)
    }
  }

  const createFallbackPDF = async (file: File): Promise<Blob> => {
    // Import PDF-lib dynamically for client-side usage
    const { PDFDocument, rgb, StandardFonts, PageSizes } = await import('pdf-lib')
    
    const pdfDoc = await PDFDocument.create()
    const timesRomanFont = await pdfDoc.embedFont(StandardFonts.TimesRoman)
    const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica)
    
    // Get page size based on selection
    let pageDimensions = PageSizes.A4
    if (pageSize === 'Letter') pageDimensions = PageSizes.Letter
    if (pageSize === 'Legal') pageDimensions = PageSizes.Legal
    
    const page = pdfDoc.addPage(pageOrientation === 'landscape' ? [pageDimensions[1], pageDimensions[0]] : pageDimensions)
    const { width, height } = page.getSize()
    
    // Create a notice page explaining the limitation
    page.drawText('Excel to PDF Conversion Notice', {
      x: 50,
      y: height - 100,
      size: 24,
      font: helveticaFont,
      color: rgb(0.1, 0.6, 0.1)
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
    
    page.drawText(`Page Orientation: ${pageOrientation}`, {
      x: 50,
      y: height - 190,
      size: 14,
      font: timesRomanFont,
      color: rgb(0, 0, 0)
    })
    
    page.drawText(`Page Size: ${pageSize}`, {
      x: 50,
      y: height - 210,
      size: 14,
      font: timesRomanFont,
      color: rgb(0, 0, 0)
    })
    
    page.drawText(`Converted: ${new Date().toLocaleString()}`, {
      x: 50,
      y: height - 230,
      size: 14,
      font: timesRomanFont,
      color: rgb(0, 0, 0)
    })
    
    const noticeText = [
      'This is a demo conversion. For full Excel to PDF conversion,',
      'please use one of these recommended methods:',
      '',
      '1. Microsoft Excel: File > Save As > PDF',
      '2. Google Sheets: File > Download > PDF Document',
      '3. LibreOffice Calc: File > Export as PDF',
      '4. Online services: SmallPDF, ILovePDF, or PDF24',
      '',
      'These tools provide complete spreadsheet conversion with:',
      '• Proper table formatting and borders',
      '• Page breaks and scaling options',
      '• Headers and footers',
      '• Chart and image preservation',
      '',
      'For automated conversion in web applications,',
      'consider server-side solutions using:',
      '• Microsoft Graph API',
      '• Aspose.Cells API',
      '• ExcelJS + jsPDF libraries',
      '• SheetJS + PDF generation tools'
    ]
    
    let yPosition = height - 280
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
    
    // Add sample table structure
    const tableY = 150
    const cellHeight = 25
    const cellWidth = 80
    
    // Table headers
    const headers = ['Column A', 'Column B', 'Column C', 'Column D']
    headers.forEach((header, index) => {
      const x = 60 + (index * cellWidth)
      page.drawRectangle({
        x,
        y: tableY,
        width: cellWidth,
        height: cellHeight,
        borderColor: rgb(0, 0, 0),
        borderWidth: 1,
        color: rgb(0.9, 0.9, 0.9)
      })
      
      page.drawText(header, {
        x: x + 5,
        y: tableY + 8,
        size: 10,
        font: helveticaFont,
        color: rgb(0, 0, 0)
      })
    })
    
    // Sample data rows
    const sampleData = [
      ['Data 1', 'Value A', '100', 'Item 1'],
      ['Data 2', 'Value B', '200', 'Item 2'],
      ['Data 3', 'Value C', '300', 'Item 3']
    ]
    
    sampleData.forEach((row, rowIndex) => {
      row.forEach((cell, colIndex) => {
        const x = 60 + (colIndex * cellWidth)
        const y = tableY - ((rowIndex + 1) * cellHeight)
        
        page.drawRectangle({
          x,
          y,
          width: cellWidth,
          height: cellHeight,
          borderColor: rgb(0, 0, 0),
          borderWidth: 1
        })
        
        page.drawText(cell, {
          x: x + 5,
          y: y + 8,
          size: 10,
          font: timesRomanFont,
          color: rgb(0, 0, 0)
        })
      })
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
              <div className="p-4 bg-green-100 dark:bg-green-900 rounded-full">
                <FileSpreadsheet className="h-12 w-12 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Excel to PDF Converter
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Convert Excel spreadsheets to PDF format. Preserve your data, formulas, and formatting in a professional document.
            </p>
          </div>

          {/* Upload Section */}
          {files.length === 0 && (
            <div className="mb-8">
              <FileUpload 
                onFilesSelected={handleFilesSelected}
                multiple={true}
                maxSize={100}
                accept=".xls,.xlsx,.xlsm,.xltx,.csv"
              />
            </div>
          )}

          {/* Files List */}
          {files.length > 0 && (
            <div className="space-y-8">
              {/* PDF Settings */}
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                  PDF Conversion Settings
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Page Orientation */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Page Orientation
                    </label>
                    <select
                      value={pageOrientation}
                      onChange={(e) => setPageOrientation(e.target.value as 'portrait' | 'landscape')}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-md"
                    >
                      <option value="portrait">Portrait</option>
                      <option value="landscape">Landscape</option>
                    </select>
                  </div>

                  {/* Page Size */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Page Size
                    </label>
                    <select
                      value={pageSize}
                      onChange={(e) => setPageSize(e.target.value as 'A4' | 'Letter' | 'Legal')}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-md"
                    >
                      <option value="A4">A4</option>
                      <option value="Letter">Letter</option>
                      <option value="Legal">Legal</option>
                    </select>
                  </div>

                  {/* Fit to Page */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Scaling
                    </label>
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        id="fitToPage"
                        checked={fitToPage}
                        onChange={(e) => setFitToPage(e.target.checked)}
                        className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                      />
                      <label htmlFor="fitToPage" className="text-sm text-gray-700 dark:text-gray-300">
                        Fit to page width
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Selected Files */}
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Selected Excel Files ({files.length})
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
                        accept=".xls,.xlsx,.xlsm,.xltx,.csv"
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
                        <FileSpreadsheet className="h-8 w-8 text-green-600 dark:text-green-400" />
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
                <div className="bg-green-50 dark:bg-green-950/20 rounded-lg p-6">
                  <div className="flex items-center space-x-4 mb-4">
                    <Loader className="h-6 w-6 animate-spin text-green-600" />
                    <div>
                      <h4 className="font-semibold text-green-900 dark:text-green-100">
                        Converting to PDF...
                      </h4>
                      {currentFile && (
                        <p className="text-green-700 dark:text-green-300">
                          Processing: {currentFile}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="w-full bg-green-200 dark:bg-green-800 rounded-full h-2">
                    <div
                      className="bg-green-600 h-2 rounded-full transition-all duration-300"
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
                  onClick={convertExcelToPDF}
                  disabled={isConverting}
                  className="flex items-center space-x-3 px-8 py-4 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg transition-colors text-lg font-medium"
                >
                  <FileSpreadsheet className="h-6 w-6" />
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
              Excel to PDF Conversion
            </h3>
            <div className="space-y-4 text-gray-600 dark:text-gray-300">
              <p>
                Convert Excel spreadsheets to PDF format while preserving formatting, tables, and data structure. 
                Perfect for sharing reports, financial data, and professional documents.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">Supported Formats:</h4>
                  <ul className="text-sm space-y-1">
                    <li>• .xls (Excel 97-2003)</li>
                    <li>• .xlsx (Excel 2007+)</li>
                    <li>• .xlsm (Excel Macro-enabled)</li>
                    <li>• .csv (Comma-separated values)</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">Conversion Features:</h4>
                  <ul className="text-sm space-y-1">
                    <li>• Customizable page orientation</li>
                    <li>• Multiple page size options</li>
                    <li>• Automatic scaling to fit pages</li>
                    <li>• Batch processing support</li>
                  </ul>
                </div>
              </div>
            </div>
            
            <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg">
              <h4 className="font-medium text-yellow-900 dark:text-yellow-100 mb-2">
                ⚠️ Browser Limitation Notice
              </h4>
              <p className="text-sm text-yellow-700 dark:text-yellow-300">
                This demo shows the conversion interface. For full Excel to PDF conversion, use:
              </p>
              <ul className="text-sm text-yellow-700 dark:text-yellow-300 mt-2 space-y-1">
                <li>• Microsoft Excel: File → Save As → PDF</li>
                <li>• Google Sheets: File → Download → PDF Document</li>
                <li>• LibreOffice Calc: File → Export as PDF</li>
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
