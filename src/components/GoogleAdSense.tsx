'use client'

import { useEffect, useRef, useState } from 'react'
import { canProcessAdElement, markAsProcessing, markAsProcessed, registerAdElement, safeAdSensePush } from '@/lib/adsense-state'

interface GoogleAdSenseProps {
  adSlot: string
  adFormat?: 'auto' | 'rectangle' | 'horizontal' | 'vertical'
  fullWidthResponsive?: boolean
  style?: React.CSSProperties
  className?: string
  adClient?: string
}

export default function GoogleAdSense({ 
  adSlot, 
  adFormat = 'auto',
  fullWidthResponsive = true,
  style = { display: 'block', minHeight: '250px' },
  className = '',
  adClient = process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_CLIENT || 'ca-pub-XXXXXXXXXXXXXXXXX'
}: GoogleAdSenseProps) {
  const [adError, setAdError] = useState(false)
  const adRef = useRef<HTMLModElement>(null)
  const initialized = useRef(false)
  const uniqueId = useRef(`google-adsense-${adSlot}-${Date.now()}`)

  useEffect(() => {
    const loadAd = () => {
      try {
        if (typeof window !== 'undefined' && !initialized.current && adRef.current) {
          // Check if element has proper dimensions before initializing
          const element = adRef.current
          const rect = element.getBoundingClientRect()
          
          if (rect.width === 0 || rect.height === 0) {
            console.log(`⚠️ GoogleAdSense ${adSlot}: Element has zero dimensions, retrying...`)
            setTimeout(loadAd, 200)
            return
          }

          // Ensure adsbygoogle array exists and is properly initialized
          if (!window.adsbygoogle || !Array.isArray(window.adsbygoogle)) {
            console.log(`ℹ️ GoogleAdSense ${adSlot}: Initializing adsbygoogle array`)
            window.adsbygoogle = []
          }
          
          // Use the global state manager to prevent duplicates
          if (canProcessAdElement(element, uniqueId.current) && registerAdElement(uniqueId.current)) {
            // Mark as processing before push to prevent race conditions
            markAsProcessing(element, uniqueId.current)
            
            const success = safeAdSensePush({}, `GoogleAdSense-${adSlot}`)
            
            if (success) {
              initialized.current = true
              // Mark as processed
              markAsProcessed(element, uniqueId.current)
              console.log(`✅ GoogleAdSense ad initialized: ${uniqueId.current}`)
            } else {
              console.error(`❌ GoogleAdSense ad failed: ${uniqueId.current}`)
              setAdError(true)
            }
          } else {
            console.log(`ℹ️ GoogleAdSense ad already processed: ${uniqueId.current}`)
          }
        }
      } catch (error) {
        console.error(`❌ GoogleAdSense error (${uniqueId.current}):`, error)
        setAdError(true)
      }
    }

    // Delay ad loading to ensure proper initialization
    const timeoutId = setTimeout(loadAd, 100)

    return () => {
      if (timeoutId) clearTimeout(timeoutId)
    }
  }, [adSlot])

  // Fallback content when ads fail to load or are blocked
  if (adError) {
    return (
      <div className={`${className} p-4 bg-gray-100 dark:bg-gray-800 rounded-lg`}>
        <div className="text-center text-gray-500 dark:text-gray-400">
          <p className="text-sm">Support our free tools</p>
          <p className="text-xs mt-1">Consider disabling ad blocker</p>
        </div>
      </div>
    )
  }

  return (
    <div 
      className={`adsense-container ${className}`} 
      style={{ 
        minWidth: adFormat === 'rectangle' ? '300px' : '250px', 
        minHeight: adFormat === 'rectangle' ? '250px' : '200px' 
      }}
    >
      {/* Google AdSense Ad Label (Required by Google Policy) */}
      <div className="text-xs text-gray-500 dark:text-gray-400 text-center mb-1 font-normal">
        Advertisements
      </div>
      
      <div 
        className="ad-wrapper" 
        style={{ 
          width: '100%', 
          height: '100%',
          minWidth: adFormat === 'rectangle' ? '300px' : '250px',
          minHeight: adFormat === 'rectangle' ? '250px' : '200px'
        }}
      >
        <ins
          ref={adRef}
          className="adsbygoogle"
          style={{
            display: 'block',
            textAlign: 'center',
            width: '100%',
            minWidth: adFormat === 'rectangle' ? '300px' : '250px',
            minHeight: adFormat === 'rectangle' ? '250px' : '200px',
            // Merge custom styles while maintaining consistency
            ...(style || {})
          }}
          data-ad-client={adClient}
          data-ad-slot={adSlot}
          data-ad-format={adFormat}
          data-full-width-responsive={fullWidthResponsive.toString()}
          data-ad-status=""
        />
      </div>
    </div>
  )
}

// Standard AdSense sizes according to Google
export const AdSenseFormats = {
  // Rectangle ads
  MEDIUM_RECTANGLE: { width: 300, height: 250 }, // Most popular
  LARGE_RECTANGLE: { width: 336, height: 280 },
  SQUARE: { width: 250, height: 250 },
  
  // Horizontal ads
  LEADERBOARD: { width: 728, height: 90 },
  BANNER: { width: 468, height: 60 },
  
  // Vertical ads
  WIDE_SKYSCRAPER: { width: 160, height: 600 },
  SKYSCRAPER: { width: 120, height: 600 },
  
  // Mobile optimized
  MOBILE_BANNER: { width: 320, height: 50 },
  LARGE_MOBILE_BANNER: { width: 320, height: 100 },
}
