'use client'

import { useEffect, useState } from 'react'

/**
 * Strategic Auto Ads Component - DEPRECATED
 * This component has been replaced by AdSenseManager in layout.tsx
 * Kept for backwards compatibility but no longer initializes ads
 */
export default function StrategicAutoAds() {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    if (!isClient || typeof window === 'undefined') return

    console.log('ℹ️ StrategicAutoAds is deprecated - using AdSenseManager instead')
    
    // This component no longer initializes ads to prevent conflicts
    // All AdSense initialization is now handled by AdSenseManager in layout.tsx
  }, [isClient])

  return null // This component no longer renders ads
}
