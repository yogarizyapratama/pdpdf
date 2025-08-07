'use client'

import { ContentAd } from './AdUnits'

interface ProcessingAdProps {
  isProcessing: boolean
  processingText?: string
  className?: string
}

/**
 * Processing Ad Component - Muncul hanya saat user menunggu
 * - Non-intrusive, hanya muncul saat processing
 * - Memberikan value (mendukung tools gratis) saat user idle
 * - Tidak menghalangi workflow utama
 */
export function ProcessingAd({ 
  isProcessing, 
  processingText = "Processing your file...",
  className = "" 
}: ProcessingAdProps) {
  if (!isProcessing) return null

  return (
    <div className={`bg-blue-50 dark:bg-blue-950/20 rounded-lg p-6 border border-blue-200 dark:border-blue-800 ${className}`}>
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center space-x-2">
          <div className="animate-spin h-5 w-5 border-2 border-blue-600 border-t-transparent rounded-full" />
          <span className="text-blue-800 dark:text-blue-200 font-medium">
            {processingText}
          </span>
        </div>
        
        <div className="max-w-md mx-auto">
          <p className="text-sm text-blue-700 dark:text-blue-300 mb-3">
            Help us keep this tool free:
          </p>
          <ContentAd />
        </div>
      </div>
    </div>
  )
}

interface SuccessAdProps {
  showAd: boolean
  successMessage?: string
  className?: string
  children: React.ReactNode
}

/**
 * Success Ad Component - Muncul setelah berhasil convert
 * - Timing optimal saat user senang dengan hasil
 * - Tidak menghalangi download action
 * - Memberikan context positif
 */
export function SuccessAd({ 
  showAd, 
  successMessage = "Conversion completed successfully!",
  className = "",
  children 
}: SuccessAdProps) {
  return (
    <div className={className}>
      {/* Action buttons/content tetap di top - prioritas utama */}
      <div className="mb-6">
        {children}
      </div>

      {/* Ad setelah action - tidak menghalangi */}
      {showAd && (
        <div className="bg-green-50 dark:bg-green-950/20 rounded-lg p-6 border border-green-200 dark:border-green-800">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center space-x-2">
              <svg className="h-5 w-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-green-800 dark:text-green-200 font-medium">
                {successMessage}
              </span>
            </div>
            
            <div className="max-w-md mx-auto">
              <p className="text-sm text-green-700 dark:text-green-300 mb-3">
                Thank you for using our free PDF tools!
              </p>
              <ContentAd />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
