'use client'

import { useState, useCallback } from 'react'
import { Split, Download, Plus, Minus, HelpCircle, BookOpen, FileText } from 'lucide-react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import PDFThumbnailsGrid from '@/components/PDFThumbnailsGrid'
import FileUpload from '@/components/FileUpload'
import PDFThumbnail from '@/components/PDFThumbnail'
import PDFErrorDisplay from '@/components/PDFErrorDisplay'
import TestPDFButton from '@/components/TestPDFButton'
import AdBanner from '@/components/AdBanner'
import ToolSEOContent from '@/components/ToolSEOContent'
import { PDFProcessor, ProcessingProgress } from '@/lib/pdf-processor'
import { validatePDF } from '@/lib/pdf-validation'
import { downloadBlob } from '@/lib/utils'

interface SplitRange {
  id: string
  start: number
  end: number
  name: string
}

export default function SplitPDFPage() {
  const [file, setFile] = useState<File | null>(null)
  const [totalPages, setTotalPages] = useState<number>(0)
  const [splitMode, setSplitMode] = useState<'ranges' | 'individual'>('ranges')
  const [ranges, setRanges] = useState<SplitRange[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState<ProcessingProgress | null>(null)
  const [error, setError] = useState<string>('')
  const [showPreview, setShowPreview] = useState(false)
  const [showAdModal, setShowAdModal] = useState(false)
  const [showTutorial, setShowTutorial] = useState(false)

  const handleFileSelected = useCallback(async (files: File[]) => {
    if (files.length === 0) return
    
    const selectedFile = files[0]
    setFile(selectedFile)
    setError('')
    
    // Validate PDF file
    const validation = await validatePDF(selectedFile)
    if (!validation.isValid) {
      setError(validation.error || 'Invalid PDF file')
      return
    }
    
    // Set page count from validation
    if (validation.details?.pageCount) {
      setTotalPages(validation.details.pageCount)
      
      if (validation.details.pageCount > 1) {
        const midPoint = Math.ceil(validation.details.pageCount / 2)
        setRanges([
          {
            id: '1',
            start: 1,
            end: midPoint,
            name: `Pages 1-${midPoint}`
          },
          {
            id: '2',
            start: midPoint + 1,
            end: validation.details.pageCount,
            name: `Pages ${midPoint + 1}-${validation.details.pageCount}`
          }
        ])
      }
    }
  }, [])

  const addRange = () => {
    const lastRange = ranges[ranges.length - 1]
    const start = lastRange ? lastRange.end + 1 : 1
    const end = Math.min(start + 9, totalPages)
    
    const newRange: SplitRange = {
      id: Date.now().toString(),
      start,
      end,
      name: `Pages ${start}-${end}`
    }
    
    setRanges(prev => [...prev, newRange])
  }

  const updateRange = (id: string, updates: Partial<SplitRange>) => {
    setRanges(prev => prev.map(range => 
      range.id === id 
        ? { 
            ...range, 
            ...updates,
            name: updates.start && updates.end 
              ? `Pages ${updates.start}-${updates.end}`
              : range.name
          }
        : range
    ))
  }

  const removeRange = (id: string) => {
    setRanges(prev => prev.filter(range => range.id !== id))
  }

  const splitPDF = async () => {
    if (!file) {
      setError('Please select a PDF file')
      return
    }

      {/* Show thumbnails after file upload and totalPages available */}
      {file && totalPages > 0 && (
        <PDFThumbnailsGrid pdfFile={file} totalPages={totalPages} />
      )}
    if (splitMode === 'ranges' && ranges.length === 0) {
      setError('Please add at least one page range')
      return
    }

    setShowAdModal(true)
    
    setTimeout(async () => {
      setShowAdModal(false)
      setIsProcessing(true)
      setError('')
      setProgress(null)

      try {
        if (splitMode === 'individual') {
          const individualRanges = Array.from({ length: totalPages }, (_, i) => ({
            start: i + 1,
            end: i + 1
          }))
          
          const splitPdfBytes = await PDFProcessor.splitPDF(file, individualRanges, setProgress)
          
          splitPdfBytes.forEach((pdfBytes, index) => {
            const blob = new Blob([pdfBytes], { type: 'application/pdf' })
            const filename = `${file.name.replace('.pdf', '')}_page_${index + 1}.pdf`
            downloadBlob(blob, filename)
          })
        } else {
          const splitRanges = ranges.map(range => ({
            start: range.start,
            end: range.end
          }))
          
          const splitPdfBytes = await PDFProcessor.splitPDF(file, splitRanges, setProgress)
          
          splitPdfBytes.forEach((pdfBytes, index) => {
            const range = ranges[index]
            const blob = new Blob([pdfBytes], { type: 'application/pdf' })
            const filename = `${file.name.replace('.pdf', '')}_${range.start}-${range.end}.pdf`
            downloadBlob(blob, filename)
          })
        }
      } catch (err) {
        setError('Failed to split PDF. Please ensure the file is valid and page ranges are correct.')
        console.error('Split error:', err)
      } finally {
        setIsProcessing(false)
        setProgress(null)
      }
    }, 3000)
  }

  return (
    <>
      <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
        <Header />
        
        <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="p-4 bg-green-100 dark:bg-green-900 rounded-full">
                <Split className="h-12 w-12 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Split PDF File
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-6">
              Split PDF files into separate documents with ease. Choose specific pages or split into individual pages.
            </p>
            
            <button
              onClick={() => setShowTutorial(true)}
              className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-100 dark:bg-blue-900 hover:bg-blue-200 dark:hover:bg-blue-800 text-blue-700 dark:text-blue-300 rounded-lg transition-colors"
            >
              <HelpCircle className="h-4 w-4" />
              <span>How to Split PDF Guide</span>
            </button>
          </div>

          {!file && (
            <div className="mb-8 space-y-4">
              <FileUpload 
                onFilesSelected={handleFileSelected}
                multiple={false}
                maxSize={50}
                accept=".pdf"
              />
              
              <div className="text-center">
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  Don&apos;t have a PDF to test? 
                </div>
                <TestPDFButton onFileGenerated={(file) => handleFileSelected([file])} />
              </div>
            </div>
          )}

          {file && (
            <div className="space-y-8">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Selected File
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300">{file.name}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {totalPages} halaman • {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setShowPreview(true)}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                    >
                      Preview
                    </button>
                    <button
                      onClick={() => {
                        setFile(null)
                        setTotalPages(0)
                        setRanges([])
                        setError('')
                      }}
                      className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                </div>
                <AdBanner position="middle" />
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                  Pilih Cara Split PDF
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div 
                    className={`cursor-pointer p-6 rounded-lg border-2 transition-all ${
                      splitMode === 'ranges' 
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/20' 
                        : 'border-gray-200 dark:border-gray-600 hover:border-blue-300'
                    }`}
                    onClick={() => setSplitMode('ranges')}
                  >
                    <div className="flex items-center space-x-3 mb-4">
                      <input
                        type="radio"
                        name="splitMode"
                        value="ranges"
                        checked={splitMode === 'ranges'}
                        onChange={() => setSplitMode('ranges')}
                        className="w-4 h-4 text-blue-600"
                      />
                      <BookOpen className="h-6 w-6 text-blue-600" />
                      <h4 className="font-semibold text-gray-900 dark:text-white">
                        Split Berdasarkan Rentang Halaman
                      </h4>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                      Tentukan halaman mana saja yang ingin dipisah menjadi file terpisah
                    </p>
                    <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded text-xs">
                      <strong>Contoh:</strong> Halaman 1-5 → file1.pdf, Halaman 6-10 → file2.pdf
                    </div>
                  </div>

                  <div 
                    className={`cursor-pointer p-6 rounded-lg border-2 transition-all ${
                      splitMode === 'individual' 
                        ? 'border-green-500 bg-green-50 dark:bg-green-950/20' 
                        : 'border-gray-200 dark:border-gray-600 hover:border-green-300'
                    }`}
                    onClick={() => setSplitMode('individual')}
                  >
                    <div className="flex items-center space-x-3 mb-4">
                      <input
                        type="radio"
                        name="splitMode"
                        value="individual"
                        checked={splitMode === 'individual'}
                        onChange={() => setSplitMode('individual')}
                        className="w-4 h-4 text-green-600"
                      />
                      <FileText className="h-6 w-6 text-green-600" />
                      <h4 className="font-semibold text-gray-900 dark:text-white">
                        Pisah Setiap Halaman
                      </h4>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                      Setiap halaman akan menjadi file PDF terpisah
                    </p>
                    <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded text-xs">
                      <strong>Contoh:</strong> 5 halaman → 5 file PDF terpisah
                    </div>
                  </div>
                </div>

                {totalPages > 0 && (
                  <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      📄 File PDF Anda memiliki <strong>{totalPages} halaman</strong>. 
                      {splitMode === 'individual' 
                        ? ` Akan menghasilkan ${totalPages} file PDF terpisah.`
                        : ` Atur rentang halaman di bawah ini.`
                      }
                    </p>
                  </div>
                )}
              </div>

              {splitMode === 'ranges' && (
                <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Atur Rentang Halaman
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Tentukan halaman mana yang ingin dipisah menjadi file terpisah
                      </p>
                    </div>
                    <button
                      onClick={addRange}
                      className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                    >
                      <Plus className="h-4 w-4" />
                      <span>Tambah Rentang</span>
                    </button>
                  </div>

                  {ranges.length === 0 && (
                    <div className="text-center py-8 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
                      <p className="text-gray-500 dark:text-gray-400 mb-4">
                        Belum ada rentang halaman yang ditentukan
                      </p>
                      <button
                        onClick={addRange}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                      >
                        Tambah Rentang Pertama
                      </button>
                    </div>
                  )}

                  <div className="space-y-4">
                    {ranges.map((range, index) => (
                      <div key={range.id} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-medium text-gray-900 dark:text-white">
                            File PDF #{index + 1}
                          </h4>
                          <button
                            onClick={() => removeRange(range.id)}
                            className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                            aria-label="Hapus rentang"
                          >
                            <Minus className="h-4 w-4" />
                          </button>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                              Halaman Awal
                            </label>
                            <input
                              type="number"
                              min="1"
                              max={totalPages}
                              value={range.start}
                              onChange={(e) => updateRange(range.id, { start: parseInt(e.target.value) || 1 })}
                              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-md text-sm focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                              Halaman Akhir
                            </label>
                            <input
                              type="number"
                              min="1"
                              max={totalPages}
                              value={range.end}
                              onChange={(e) => updateRange(range.id, { end: parseInt(e.target.value) || totalPages })}
                              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-md text-sm focus:ring-2 focus:ring-blue-500"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                              Nama File (opsional)
                            </label>
                            <input
                              type="text"
                              value={range.name}
                              onChange={(e) => updateRange(range.id, { name: e.target.value })}
                              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-md text-sm focus:ring-2 focus:ring-blue-500"
                              placeholder={`Pages ${range.start}-${range.end}`}
                            />
                          </div>
                        </div>

                        <div className="mt-3 text-xs text-gray-600 dark:text-gray-400">
                          📄 Akan menghasilkan: <strong>{range.name || `Pages ${range.start}-${range.end}`}.pdf</strong> 
                          ({range.end - range.start + 1} halaman)
                        </div>
                      </div>
                    ))}
                  </div>

                  {ranges.length > 0 && (
                    <div className="mt-6 p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
                      <h4 className="font-medium text-green-900 dark:text-green-100 mb-2">
                        📋 Ringkasan Split
                      </h4>
                      <p className="text-sm text-green-700 dark:text-green-300">
                        Total akan menghasilkan <strong>{ranges.length} file PDF</strong> dari {totalPages} halaman asli.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {progress && (
                <div className="bg-blue-50 dark:bg-blue-950/20 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
                      {progress.stage}
                    </span>
                    <span className="text-sm text-blue-700 dark:text-blue-300">
                      {progress.currentFile}/{progress.totalFiles}
                    </span>
                  </div>
                  <div className="w-full bg-blue-200 dark:bg-blue-800 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${progress.progress}%` }}
                    />
                  </div>
                </div>
              )}

              {error && (
                <PDFErrorDisplay 
                  error={error}
                  onRetry={() => {
                    setError('')
                    setFile(null)
                    setTotalPages(0)
                    setRanges([])
                  }}
                />
              )}

              <div className="text-center space-y-4">
                {splitMode === 'individual' && totalPages > 0 && (
                  <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg">
                    <p className="text-blue-700 dark:text-blue-300">
                      🚀 Siap untuk split! Akan menghasilkan <strong>{totalPages} file PDF</strong> terpisah
                    </p>
                  </div>
                )}
                
                {splitMode === 'ranges' && ranges.length > 0 && (
                  <div className="bg-green-50 dark:bg-green-950/20 p-4 rounded-lg">
                    <p className="text-green-700 dark:text-green-300">
                      🚀 Siap untuk split! Akan menghasilkan <strong>{ranges.length} file PDF</strong> dari rentang yang ditentukan
                    </p>
                  </div>
                )}

                <button
                  onClick={splitPDF}
                  disabled={isProcessing || (splitMode === 'ranges' && ranges.length === 0)}
                  className="flex items-center space-x-3 px-8 py-4 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg transition-colors text-lg font-medium shadow-lg"
                >
                  <Download className="h-6 w-6" />
                  <span>
                    {isProcessing 
                      ? 'Sedang Split PDF...' 
                      : splitMode === 'individual' 
                        ? `Split Menjadi ${totalPages} File` 
                        : `Split Menjadi ${ranges.length} File`
                    }
                  </span>
                </button>

                {splitMode === 'ranges' && ranges.length === 0 && (
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Tambahkan minimal satu rentang halaman untuk melanjutkan
                  </p>
                )}
              </div>
            </div>
          )}

          <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Panduan Split PDF
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                  📄 Split Berdasarkan Rentang
                </h4>
                <ol className="list-decimal list-inside space-y-1 text-sm text-gray-600 dark:text-gray-300">
                  <li>Upload file PDF</li>
                  <li>Pilih mode Split Berdasarkan Rentang Halaman</li>
                  <li>Klik Tambah Rentang untuk menentukan halaman</li>
                  <li>Atur halaman awal dan akhir setiap file</li>
                  <li>Klik Split PDF untuk memproses</li>
                </ol>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                  📋 Split Halaman Individual
                </h4>
                <ol className="list-decimal list-inside space-y-1 text-sm text-gray-600 dark:text-gray-300">
                  <li>Upload file PDF</li>
                  <li>Pilih mode Pisah Setiap Halaman</li>
                  <li>Otomatis setiap halaman jadi file terpisah</li>
                  <li>Klik Split PDF untuk memproses</li>
                  <li>Download semua file yang dihasilkan</li>
                </ol>
              </div>
            </div>
            
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                  💡 Tips & Contoh
                </h4>
                <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                  <li>• PDF 10 halaman → Split halaman 1-3, 4-7, 8-10</li>
                  <li>• Hasil: 3 file PDF terpisah</li>
                  <li>• Bisa beri nama custom untuk setiap file</li>
                  <li>• Download otomatis setelah proses selesai</li>
                </ul>
              </div>
              
              <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
                <h4 className="font-medium text-green-900 dark:text-green-100 mb-2">
                  🔒 Keamanan & Privasi
                </h4>
                <p className="text-sm text-green-700 dark:text-green-300">
                  Fast and secure PDF processing with advanced splitting options. 
                  Professional results delivered quickly and efficiently.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
      {/* SEO Content */}
    <ToolSEOContent toolKey="split-pdf" />


      <Footer />
    </div>

    {showTutorial && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
              📚 Panduan Lengkap Split PDF
            </h3>
            <button
              onClick={() => setShowTutorial(false)}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              ✕
            </button>
          </div>
          
          <div className="p-6 overflow-y-auto max-h-[70vh]">
            <div className="space-y-8">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                  1
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                    Upload File PDF
                  </h4>
                  <p className="text-gray-600 dark:text-gray-300 mb-3">
                    Klik area upload atau drag & drop file PDF Anda. Sistem akan otomatis mendeteksi jumlah halaman.
                  </p>
                  <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-lg">
                    <p className="text-sm"><strong>Format:</strong> .pdf (maksimal 50MB)</p>
                  </div>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-bold">
                  2
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                    Pilih Mode Split
                  </h4>
                  <div className="space-y-3">
                    <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg">
                      <h5 className="font-medium text-blue-900 dark:text-blue-100">📄 Split Berdasarkan Rentang Halaman</h5>
                      <p className="text-sm text-blue-700 dark:text-blue-300">
                        Pilih halaman tertentu untuk setiap file. Contoh: Halaman 1-5 jadi file1.pdf, halaman 6-10 jadi file2.pdf
                      </p>
                    </div>
                    <div className="bg-green-50 dark:bg-green-950/20 p-4 rounded-lg">
                      <h5 className="font-medium text-green-900 dark:text-green-100">📋 Pisah Setiap Halaman</h5>
                      <p className="text-sm text-green-700 dark:text-green-300">
                        Setiap halaman akan menjadi file PDF terpisah. Otomatis tanpa perlu setting tambahan.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold">
                  3
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                    Atur Rentang Halaman (Jika Dipilih Mode Rentang)
                  </h4>
                  <div className="space-y-3">
                    <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg">
                      <h5 className="font-medium mb-2">Contoh Penggunaan:</h5>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>📄 File PDF Original:</span>
                          <span className="font-medium">20 halaman</span>
                        </div>
                        <div className="border-t pt-2">
                          <div>📂 File 1: Halaman 1-8 → Bab_1.pdf</div>
                          <div>📂 File 2: Halaman 9-15 → Bab_2.pdf</div>
                          <div>📂 File 3: Halaman 16-20 → Bab_3.pdf</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-8 h-8 bg-red-600 text-white rounded-full flex items-center justify-center font-bold">
                  4
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                    Proses & Download
                  </h4>
                  <p className="text-gray-600 dark:text-gray-300 mb-3">
                    Klik tombol Split PDF untuk memulai proses. File akan otomatis terdownload satu per satu.
                  </p>
                  <div className="bg-green-50 dark:bg-green-950/20 p-3 rounded-lg">
                    <p className="text-sm text-green-700 dark:text-green-300">
                      ✅ Semua file akan tersimpan di folder Download dengan nama yang sesuai
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 text-center">
              <button
                onClick={() => setShowTutorial(false)}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                Mengerti, Mulai Split PDF
              </button>
            </div>
          </div>
        </div>
      </div>
    )}

    {showPreview && file && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-hidden">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              PDF Preview
            </h3>
            <button
              onClick={() => setShowPreview(false)}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              ✕
            </button>
          </div>
          <div className="overflow-auto max-h-[70vh]">
            <div className="flex justify-center">
              <PDFThumbnail 
                pdfFile={file} 
                pageNumber={1}
                width={400}
                height={500}
                className="border border-gray-200 dark:border-gray-600 rounded-lg"
              />
            </div>
          </div>
        </div>
      </div>
    )}

    {showAdModal && (
      <AdBanner position="bottom"  />
    )}
  </>
  )
}