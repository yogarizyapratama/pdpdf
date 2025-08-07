'use client'

import { useEffect, useRef } from 'react'

interface AdSenseAdProps {
  adSlot: string
  adFormat?: 'auto' | 'rectangle' | 'horizontal' | 'vertical'
  style?: React.CSSProperties
  className?: string
  responsive?: boolean
}

declare global {
  interface Window {
    adsbygoogle: unknown[]
  }
}

/**
 * Google AdSense Ad Component
 * Sesuai panduan resmi Google AdSense
 */
export default function AdSenseAd({
  adSlot,
  adFormat = 'auto',
  style = { display: 'block', textAlign: 'center' },
  className = '',
  responsive = true
}: AdSenseAdProps) {
  const adRef = useRef<HTMLDivElement>(null)
  const pushed = useRef(false)

  useEffect(() => {
    // Only push to AdSense once
    if (!pushed.current && typeof window !== 'undefined') {
      try {
        (window.adsbygoogle = window.adsbygoogle || []).push({})
        pushed.current = true
      } catch (error) {
        console.error('AdSense error:', error)
      }
    }
  }, [])

  return (
    <div ref={adRef} className={`adsense-container ${className}`}>
      <ins
        className="adsbygoogle"
        style={style}
        data-ad-client="ca-pub-6879569899763830"
        data-ad-slot={adSlot}
        data-ad-format={adFormat}
        data-full-width-responsive={responsive ? "true" : "false"}
      />
    </div>
  )
}
