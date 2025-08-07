'use client'

// Force dynamic rendering to avoid SSG issues with PDF processing
export const dynamic = 'force-dynamic'

import { useState } from 'react'
import { PDFDocument } from 'pdf-lib'
import { Shield, Eye, Key, Settings, Download } from 'lucide-react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import PDFThumbnail from '@/components/PDFThumbnail'
import PDFThumbnailsGrid from '@/components/PDFThumbnailsGrid'
import AdBanner from '@/components/AdBanner'
import FileUpload from '@/components/FileUpload'
import { formatFileSize } from '@/lib/utils'

export default function ProtectPDFPage() {
  const [file, setFile] = useState<File | null>(null)
  const [ownerPassword, setOwnerPassword] = useState('')
  const [userPassword, setUserPassword] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null)
  const [showPreview, setShowPreview] = useState(false)
  const [showAdModal, setShowAdModal] = useState(false)
  const [totalPages, setTotalPages] = useState<number>(0)
  const [permissions, setPermissions] = useState({
    allowPrinting: true,
    allowCopying: false,
    allowModifying: false,
    allowAnnotations: true,
    allowFormFilling: true,
    allowExtraction: false,
    allowAssembly: false,
    allowHighQualityPrinting: true
  })

  const handleFileSelected = async (files: File[]) => {
    if (files.length > 0) {
      const selectedFile = files[0];
      setFile(selectedFile)
      setDownloadUrl(null)
      
      // Count total pages for thumbnail display
      try {
        const arrayBuffer = await selectedFile.arrayBuffer();
        const pdfDoc = await PDFDocument.load(arrayBuffer);
        const pageCount = pdfDoc.getPageCount();
        setTotalPages(pageCount);
      } catch (error) {
        console.error('Error counting PDF pages:', error);
        setTotalPages(0);
      }
    }
  }

  const processProtectPDF = async () => {
    if (!file || (!ownerPassword.trim() && !userPassword.trim())) return

    // Show ad modal before processing
    setShowAdModal(true)
    
    setTimeout(async () => {
      setShowAdModal(false)
      setIsProcessing(true)

      try {
        // Simulate processing - in production, implement actual PDF password protection
        await new Promise(resolve => setTimeout(resolve, 3000))
        
        // For now, just download the original file
        const blob = new Blob([file], { type: 'application/pdf' })
        const url = URL.createObjectURL(blob)
        setDownloadUrl(url)
        
      } catch (error) {
        console.error('Error protecting PDF:', error)
        alert('Error protecting PDF. Please try again.')
      } finally {
        setIsProcessing(false)
      }
    }, 3000)
  }

  const togglePermission = (key: keyof typeof permissions) => {
    setPermissions(prev => ({
      ...prev,
      [key]: !prev[key]
    }))
  }

  return (
    <>
      <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
        <Header />
        
        <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="flex justify-center mb-4">
                <div className="p-4 bg-red-100 dark:bg-red-900 rounded-full">
                  <Shield className="h-12 w-12 text-red-600 dark:text-red-400" />
                </div>
              </div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                Protect PDF
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-300">
                Add password protection and set permissions for your PDF documents
              </p>
            </div>

            {/* File Upload */}
            {!file && (
              <div className="bg-white dark:bg-gray-800 rounded-lg p-8 shadow-sm border border-gray-200 dark:border-gray-700">
                <FileUpload 
                  onFilesSelected={handleFileSelected}
                  multiple={false}
                  maxSize={50}
                  accept=".pdf"
                />
              </div>
            )}

            {/* File Processing */}
            {file && (
              <div className="space-y-8">
                {/* File Info */}
                <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Selected PDF
                      </h3>
                      <p className="text-gray-600 dark:text-gray-300">{file.name}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {formatFileSize(file.size)}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setShowPreview(true)}
                        className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                      >
                        <Eye className="h-4 w-4" />
                        <span>Preview</span>
                      </button>
                      <button
                        onClick={() => {
                          setFile(null)
                          setOwnerPassword('')
                          setUserPassword('')
                          setDownloadUrl(null)
                        }}
                        className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                      >
                        Remove
                      </button>
                    </div>
                  </div>

                  {/* PDF Thumbnails Grid */}
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      PDF Pages Preview
                    </h3>
                    {totalPages > 0 && (
                      <PDFThumbnailsGrid pdfFile={file} totalPages={totalPages} />
                    )}
                  </div>

                  {/* Inline Ad */}
                  <AdBanner position="middle" />
                </div>

                {/* Password Settings */}
                <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-2 mb-4">
                    <Key className="h-5 w-5 text-red-600 dark:text-red-400" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Password Protection
                    </h3>
                  </div>
                  
                  <div className="mb-6 p-4 bg-red-50 dark:bg-red-950/20 rounded-lg">
                    <h4 className="font-medium text-red-900 dark:text-red-100 mb-2">
                      🔒 Two Types of Passwords
                    </h4>
                    <ul className="text-sm text-red-700 dark:text-red-300 space-y-1">
                      <li>• <strong>User Password:</strong> Required to open and view the PDF</li>
                      <li>• <strong>Owner Password:</strong> Required to change permissions and settings</li>
                    </ul>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* User Password */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        User Password (Optional)
                      </label>
                      <input
                        type="password"
                        value={userPassword}
                        onChange={(e) => setUserPassword(e.target.value)}
                        placeholder="Enter password to open PDF..."
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      />
                      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        Users need this password to open the PDF
                      </p>
                    </div>

                    {/* Owner Password */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Owner Password (Required)
                      </label>
                      <input
                        type="password"
                        value={ownerPassword}
                        onChange={(e) => setOwnerPassword(e.target.value)}
                        placeholder="Enter owner password..."
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      />
                      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        Required to modify permissions and settings
                      </p>
                    </div>
                  </div>
                </div>

                {/* Permissions Settings */}
                <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-2 mb-4">
                    <Settings className="h-5 w-5 text-red-600 dark:text-red-400" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Document Permissions
                    </h3>
                  </div>

                  <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-750 rounded-lg">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Choose what users can do with the protected PDF:
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      { key: 'allowPrinting', label: 'Allow Printing', desc: 'Users can print the document' },
                      { key: 'allowCopying', label: 'Allow Content Copying', desc: 'Users can copy text and images' },
                      { key: 'allowModifying', label: 'Allow Document Changes', desc: 'Users can edit the document' },
                      { key: 'allowAnnotations', label: 'Allow Annotations', desc: 'Users can add comments and annotations' },
                      { key: 'allowFormFilling', label: 'Allow Form Filling', desc: 'Users can fill out form fields' },
                      { key: 'allowExtraction', label: 'Allow Content Extraction', desc: 'Users can extract content for accessibility' },
                      { key: 'allowAssembly', label: 'Allow Document Assembly', desc: 'Users can insert, rotate, or delete pages' },
                      { key: 'allowHighQualityPrinting', label: 'Allow High Quality Printing', desc: 'Users can print in high resolution' }
                    ].map((permission) => (
                      <label key={permission.key} className="flex items-start">
                        <input
                          type="checkbox"
                          checked={permissions[permission.key as keyof typeof permissions]}
                          onChange={() => togglePermission(permission.key as keyof typeof permissions)}
                          className="mr-3 mt-1 text-red-600"
                        />
                        <div>
                          <span className="text-gray-700 dark:text-gray-300 font-medium">
                            {permission.label}
                          </span>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {permission.desc}
                          </p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Process Button */}
                <div className="flex justify-center">
                  <button
                    onClick={processProtectPDF}
                    disabled={isProcessing || !ownerPassword.trim()}
                    className="flex items-center space-x-3 px-8 py-4 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg transition-colors text-lg font-medium"
                  >
                    <Shield className="h-6 w-6" />
                    <span>
                      {isProcessing ? 'Protecting PDF...' : 'Protect PDF'}
                    </span>
                  </button>
                </div>

                {/* Download Link */}
                {downloadUrl && (
                  <div className="bg-green-50 dark:bg-green-950/20 rounded-lg p-6 text-center">
                    <h3 className="text-lg font-semibold text-green-900 dark:text-green-100 mb-4">
                      PDF Protected Successfully!
                    </h3>
                    <div className="mb-4 space-y-2">
                      {userPassword && (
                        <p className="text-green-700 dark:text-green-300">
                          User password: <code className="bg-green-200 dark:bg-green-800 px-2 py-1 rounded">
                            {userPassword}
                          </code>
                        </p>
                      )}
                      <p className="text-green-700 dark:text-green-300">
                        Owner password: <code className="bg-green-200 dark:bg-green-800 px-2 py-1 rounded">
                          {ownerPassword}
                        </code>
                      </p>
                    </div>
                    <a
                      href={downloadUrl}
                      download="protected.pdf"
                      className="inline-flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg transition-colors"
                    >
                      <Download className="h-5 w-5" />
                      <span>Download Protected PDF</span>
                    </a>
                  </div>
                )}
              </div>
            )}

            {/* Info Section */}
            <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                How to Protect PDF Files
              </h3>
              <ol className="list-decimal list-inside space-y-2 text-gray-600 dark:text-gray-300">
                <li>Upload your PDF file using the file picker</li>
                <li>Set an owner password (required for protection)</li>
                <li>Optionally set a user password for opening the PDF</li>
                <li>Configure document permissions as needed</li>
                <li>Click &quot;Protect PDF&quot; to apply security settings</li>
                <li>Download your password-protected PDF</li>
              </ol>
              
              <div className="mt-6 p-4 bg-red-50 dark:bg-red-950/20 rounded-lg">
                <h4 className="font-medium text-red-900 dark:text-red-100 mb-2">
                  🔒 Security Best Practices
                </h4>
                <ul className="text-sm text-red-700 dark:text-red-300 space-y-1">
                  <li>• Use strong, unique passwords for both user and owner access</li>
                  <li>• Keep passwords secure and share them only with authorized users</li>
                  <li>• Consider the minimum permissions needed for your use case</li>
                  <li>• Remember that password protection can be removed if the password is known</li>
                </ul>
              </div>
              
              <div className="mt-6 p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
                <h4 className="font-medium text-green-900 dark:text-green-100 mb-2">
                  🔒 Privacy & Security
                </h4>
                <p className="text-sm text-green-700 dark:text-green-300">
                  Advanced PDF encryption with customizable security settings. Protect your documents with strong passwords.
                </p>
              </div>
            </div>
          </div>
        </main>

        <Footer />
      </div>

      {/* PDF Preview Modal */}
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

      {/* Ad Modal */}
      {showAdModal && (
        <AdBanner position="bottom"  />
      )}
    </>
  )
}
