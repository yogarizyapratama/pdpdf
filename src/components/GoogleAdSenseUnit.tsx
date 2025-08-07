'use client'

import { useEffect, useRef } from 'react'

interface GoogleAdSenseUnitProps {
  adSlot: string
  adFormat?: 'auto' | 'rectangle' | 'horizontal' | 'vertical'
  style?: React.CSSProperties
  className?: string
}

declare global {
  interface Window {
    adsbygoogle: unknown[]
  }
}

export default function GoogleAdSenseUnit({
  adSlot,
  adFormat = 'auto',
  style = { display: 'block' },
  className = ''
}: GoogleAdSenseUnitProps) {
  const adRef = useRef<HTMLModElement>(null)
  const initialized = useRef(false)
  const uniqueId = useRef(`adsense-unit-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`)

  useEffect(() => {
    try {
      // Initialize adsbygoogle if not already done
      if (
        typeof window !== 'undefined' && 
        window.adsbygoogle &&
        !initialized.current &&
        adRef.current
      ) {
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
          
          console.log(`✅ GoogleAdSenseUnit initialized: ${uniqueId.current}`)
        } else {
          console.log(`ℹ️ GoogleAdSenseUnit already processed: ${uniqueId.current}`)
        }
      }
    } catch (error) {
      console.error(`❌ GoogleAdSenseUnit error (${uniqueId.current}):`, error)
    }
  }, [])

  return (
    <div className={`adsense-container ${className}`} id={uniqueId.current}>
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={style}
        data-ad-client="ca-pub-6879569899763830"
        data-ad-slot={adSlot}
        data-ad-format={adFormat}
        data-full-width-responsive="true"
      />
    </div>
  )
}
