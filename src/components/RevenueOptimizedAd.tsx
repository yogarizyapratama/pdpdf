'use client'

import { useEffect } from 'react'

interface RevenueOptimizedAdProps {
  adSlot: string
  adFormat?: 'auto' | 'rectangle' | 'horizontal' | 'vertical'
  responsive?: boolean
  className?: string
  style?: React.CSSProperties
}

declare global {
  interface Window {
    adsbygoogle: unknown[]
  }
}

export default function RevenueOptimizedAd({ 
  adSlot, 
  adFormat = 'auto', 
  responsive = true,
  className = '',
  style = {}
}: RevenueOptimizedAdProps) {
  
  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && window.adsbygoogle) {
        (window.adsbygoogle = window.adsbygoogle || []).push({})
      }
    } catch (error) {
      console.log('AdSense not yet loaded:', error)
    }
  }, [])

  return (
    <div className={`revenue-optimized-ad ${className}`} style={style}>
      <ins
        className="adsbygoogle"
        style={{
          display: 'block',
          textAlign: 'center',
          ...style
        }}
        data-ad-client="ca-pub-6879569899763830"
        data-ad-slot={adSlot}
        data-ad-format={adFormat}
        data-full-width-responsive={responsive ? 'true' : 'false'}
      />
    </div>
  )
}
