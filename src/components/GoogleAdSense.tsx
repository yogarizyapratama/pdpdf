'use client'

import { useEffect, useState } from 'react'

interface GoogleAdSenseProps {
  adSlot: string
  adFormat?: 'auto' | 'rectangle' | 'horizontal' | 'vertical'
  fullWidthResponsive?: boolean
  style?: React.CSSProperties
  className?: string
  adClient?: string
}

declare global {
  interface Window {
    adsbygoogle: unknown[]
  }
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

  useEffect(() => {
    const loadAd = () => {
      try {
        if (typeof window !== 'undefined' && window.adsbygoogle) {
          const adElement = document.querySelector(`[data-ad-slot="${adSlot}"]`)
          if (adElement && !adElement.getAttribute('data-ad-status')) {
            (window.adsbygoogle = window.adsbygoogle || []).push({})
          }
        }
      } catch (error) {
        console.error('AdSense error:', error)
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
    <div className={`adsense-container ${className}`}>
      {/* Google AdSense Ad Label (Required by Google Policy) */}
      <div className="text-xs text-gray-500 dark:text-gray-400 text-center mb-1 font-normal">
        Advertisements
      </div>
      
      <div className="ad-wrapper">
        <ins
          className="adsbygoogle"
          style={style}
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
