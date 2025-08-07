'use client'

import { useEffect, useRef, useState } from 'react'
import { canProcessAdElement, markAsProcessing, markAsProcessed, registerAdElement, safeAdSensePush } from '@/lib/adsense-state'

interface WorkingAdBannerProps {
  adSlot?: string
  adFormat?: 'auto' | 'rectangle' | 'horizontal' | 'vertical'
  className?: string
  style?: React.CSSProperties
  position?: 'top' | 'middle' | 'bottom'
}

/**
 * Working Google AdSense Banner - Fixed hydration and duplicate ads issues
 * Optimized for maximum revenue with strategic placement
 */
export default function WorkingAdBanner({ 
  adSlot = '0000000000', // Will be replaced with real slot after approval
  adFormat = 'auto',
  className = '',
  style,
  position = 'middle'
}: WorkingAdBannerProps) {
  const adRef = useRef<HTMLModElement>(null)
  const pushed = useRef(false)
  const [containerId, setContainerId] = useState<string>('')
  const [isClient, setIsClient] = useState(false)

  // Fix hydration issue by generating ID only on client side
  useEffect(() => {
    setIsClient(true)
    setContainerId(`ad-${Date.now()}-${position}`)
  }, [position])

  useEffect(() => {
    // Critical: Initialize AdSense ad only once and only on client
    if (isClient && typeof window !== 'undefined' && !pushed.current && adRef.current && containerId) {
      try {
        // Ensure adsbygoogle array exists and is properly initialized
        if (!window.adsbygoogle || !Array.isArray(window.adsbygoogle)) {
          console.log(`ℹ️ WorkingAdBanner ${position}: Initializing adsbygoogle array`)
          window.adsbygoogle = []
        }
        
        const element = adRef.current
        
        // Use global state manager to prevent duplicates
        if (canProcessAdElement(element, containerId) && registerAdElement(containerId)) {
          // Mark as processing before push to prevent race conditions
          markAsProcessing(element, containerId)
          
          const success = safeAdSensePush({}, `WorkingAdBanner-${position}`)
          
          if (success) {
            pushed.current = true
            // Mark as processed
            markAsProcessed(element, containerId)
            console.log(`✅ AdSense ${position} ad pushed to queue (${containerId})`)
          } else {
            console.error(`❌ AdSense ${position} ad failed to push (${containerId})`)
          }
        } else {
          console.log(`ℹ️ AdSense ${position} ad already processed or blocked (${containerId})`)
        }
      } catch (error) {
        console.error(`❌ AdSense ${position} ad error:`, error)
      }
    }

    // Cleanup function to prevent memory leaks
    return () => {
      if (containerId && adRef.current) {
        // Clear processing states on unmount
        if (adRef.current.dataset.processing === 'true') {
          adRef.current.dataset.processing = 'false'
        }
      }
    }
  }, [isClient, position, containerId])

  // Prevent hydration mismatch by not rendering until client-side
  if (!isClient) {
    return (
      <div className={`working-ad-banner ${className}`} style={{ minWidth: '300px', minHeight: '90px', ...style }}>
        <div className="text-xs text-gray-400 mb-2 text-center font-medium uppercase tracking-wide">
          Advertisement
        </div>
        <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 text-center min-h-[90px] flex items-center justify-center">
          <span className="text-gray-400 text-sm">Loading advertisement...</span>
        </div>
      </div>
    )
  }

  return (
    <div className={`working-ad-banner ${className}`} style={{ minWidth: '300px', ...style }} id={containerId}>
      {/* Advertisement label for transparency */}
      <div className="text-xs text-gray-400 mb-2 text-center font-medium uppercase tracking-wide">
        Advertisement
      </div>
      
      {/* AdSense ad unit */}
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={{ 
          display: 'block',
          textAlign: 'center',
          minHeight: position === 'top' ? '100px' : '90px',
          minWidth: '300px',
          width: '100%',
          ...style 
        }}
        data-ad-client="ca-pub-6879569899763830"
        data-ad-slot={adSlot}
        data-ad-format={adFormat}
        data-full-width-responsive="true"
      />
      
      {/* Fallback for when ads don't load */}
      <noscript>
        <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 text-center min-h-[90px] flex items-center justify-center">
          <span className="text-gray-400 text-sm">Please enable JavaScript to view advertisements</span>
        </div>
      </noscript>
    </div>
  )
}
