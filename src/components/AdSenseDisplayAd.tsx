'use client'

import { useEffect, useRef } from 'react'

interface AdSenseDisplayAdProps {
  adSlot: string
  adFormat?: 'auto' | 'rectangle' | 'horizontal' | 'vertical'
  className?: string
  style?: React.CSSProperties
}

declare global {
  interface Window {
    adsbygoogle: unknown[]
  }
}

/**
 * Fixed AdSense Display Ad Component
 * Prevents duplicate pushes and size errors
 */
export default function AdSenseDisplayAd({ 
  adSlot,
  adFormat = 'auto',
  className = '',
  style = {}
}: AdSenseDisplayAdProps) {
  const adRef = useRef<HTMLModElement>(null)
  const initialized = useRef(false)
  const uniqueId = useRef(`adsense-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`)

  useEffect(() => {
    const initializeAd = () => {
      if (
        typeof window !== 'undefined' && 
        !initialized.current && 
        adRef.current &&
        window.adsbygoogle
      ) {
        try {
          const element = adRef.current
          
          // Enhanced checks to prevent duplicate ads
          const hasAdsbyGoogleStatus = element.hasAttribute('data-adsbygoogle-status')
          const hasAdsbyGoogleData = element.hasAttribute('data-ad-status')
          const hasChildren = element.children.length > 0
          const isProcessed = element.dataset.processed === 'true'
          const isProcessing = element.dataset.processing === 'true'
          
          // Only push if the element hasn't been processed by AdSense
          if (!hasAdsbyGoogleStatus && !hasAdsbyGoogleData && !hasChildren && !isProcessed && !isProcessing) {
            // Mark as processing before push to prevent race conditions
            element.dataset.processing = 'true'
            
            window.adsbygoogle.push({})
            initialized.current = true
            
            // Mark as processed
            element.dataset.processed = 'true'
            
            console.log(`✅ AdSense ad initialized: ${uniqueId.current}`)
          } else {
            console.log(`ℹ️ AdSense ad already processed: ${uniqueId.current}`)
          }
        } catch (error) {
          console.error(`❌ AdSense ad error (${uniqueId.current}):`, error)
        }
      }
    }

    // Try to initialize immediately
    initializeAd()

    // Also try after a short delay to ensure adsbygoogle script is loaded
    const timeout = setTimeout(initializeAd, 100)

    return () => {
      clearTimeout(timeout)
    }
  }, [])

  return (
    <div 
      className={`adsense-display-ad ${className}`} 
      style={{ minWidth: '300px', ...style }}
      id={uniqueId.current}
    >
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={{
          display: 'block',
          minWidth: '300px',
          minHeight: '250px',
          width: '100%',
          ...style
        }}
        data-ad-client="ca-pub-6879569899763830"
        data-ad-slot={adSlot}
        data-ad-format={adFormat}
        data-full-width-responsive="true"
      />
    </div>
  )
}
