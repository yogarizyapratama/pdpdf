'use client'

import { useState, useEffect } from 'react'

interface AdTestingPanelProps {
  className?: string
}

export default function AdTestingPanel({ className = '' }: AdTestingPanelProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [adStatus, setAdStatus] = useState<{
    scriptLoaded: boolean
    adsbygoogle: boolean
    errors: string[]
  }>({
    scriptLoaded: false,
    adsbygoogle: false,
    errors: []
  })

  // Only show in development
  useEffect(() => {
    const isDev = process.env.NODE_ENV === 'development'
    const isTestMode = process.env.NEXT_PUBLIC_APP_ENV === 'production' // Testing ads in dev
    setIsVisible(isDev && isTestMode)
  }, [])

  // Check ad status
  useEffect(() => {
    if (!isVisible) return

    const checkAdStatus = () => {
      const errors: string[] = []
      
      // Check if AdSense script is loaded
      const scriptLoaded = document.querySelector('script[src*="adsbygoogle.js"]') !== null
      
      // Check if adsbygoogle is available
      const adsbygoogleAvailable = typeof window !== 'undefined' && 
        typeof (window as any).adsbygoogle !== 'undefined'
      
      // Check for common issues
      if (!process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_CLIENT) {
        errors.push('NEXT_PUBLIC_GOOGLE_ADSENSE_CLIENT not set')
      }
      
      if (process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_CLIENT === 'ca-pub-XXXXXXXXXXXXXXXXX') {
        errors.push('Using placeholder Publisher ID')
      }

      // Check for ad units
      const adUnits = document.querySelectorAll('.adsbygoogle')
      if (adUnits.length === 0) {
        errors.push('No ad units found on page')
      }

      // Check for ad blocker
      const testElement = document.createElement('div')
      testElement.innerHTML = '&nbsp;'
      testElement.className = 'adsbox'
      document.body.appendChild(testElement)
      
      setTimeout(() => {
        if (testElement.offsetHeight === 0) {
          errors.push('Ad blocker detected')
        }
        document.body.removeChild(testElement)
        
        setAdStatus({
          scriptLoaded,
          adsbygoogle: adsbygoogleAvailable,
          errors
        })
      }, 100)
    }

    checkAdStatus()
    
    // Re-check every 5 seconds
    const interval = setInterval(checkAdStatus, 5000)
    return () => clearInterval(interval)
  }, [isVisible])

  if (!isVisible) return null

  return (
    <div className={`fixed bottom-4 right-4 z-50 ${className}`}>
      <div className="bg-gray-900 text-white p-4 rounded-lg shadow-lg max-w-sm">
        <div className="flex items-center justify-between mb-2">
          <h4 className="font-semibold text-sm">🧪 Ad Testing Panel</h4>
          <button
            onClick={() => setIsVisible(false)}
            className="text-gray-400 hover:text-white"
          >
            ✕
          </button>
        </div>
        
        <div className="space-y-2 text-xs">
          <div className="flex items-center gap-2">
            <span className={adStatus.scriptLoaded ? 'text-green-400' : 'text-red-400'}>
              {adStatus.scriptLoaded ? '✅' : '❌'}
            </span>
            <span>AdSense Script</span>
          </div>
          
          <div className="flex items-center gap-2">
            <span className={adStatus.adsbygoogle ? 'text-green-400' : 'text-red-400'}>
              {adStatus.adsbygoogle ? '✅' : '❌'}
            </span>
            <span>adsbygoogle API</span>
          </div>
          
          <div className="flex items-center gap-2">
            <span>📊</span>
            <span>Ad Units: {document.querySelectorAll('.adsbygoogle').length}</span>
          </div>
          
          {adStatus.errors.length > 0 && (
            <div className="mt-2 pt-2 border-t border-gray-700">
              <div className="text-red-400 font-medium">Issues:</div>
              {adStatus.errors.map((error, index) => (
                <div key={index} className="text-red-300">
                  • {error}
                </div>
              ))}
            </div>
          )}
          
          <div className="mt-2 pt-2 border-t border-gray-700">
            <div className="text-gray-400">Environment:</div>
            <div>
              NODE_ENV: {process.env.NODE_ENV}
            </div>
            <div>
              APP_ENV: {process.env.NEXT_PUBLIC_APP_ENV}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Debug helper component for testing specific ad slots
interface AdDebugInfoProps {
  adSlot: string
  adFormat?: string
  position?: string
}

export function AdDebugInfo({ adSlot, adFormat, position }: AdDebugInfoProps) {
  const isDev = process.env.NODE_ENV === 'development'
  
  if (!isDev) return null
  
  return (
    <div className="text-xs text-gray-500 p-2 bg-gray-100 rounded mb-2">
      <div>🧪 Ad Debug Info</div>
      <div>Slot: {adSlot}</div>
      <div>Format: {adFormat}</div>
      <div>Position: {position}</div>
      <div>Client: {process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_CLIENT}</div>
    </div>
  )
}
