'use client'

import { useEffect, useState } from 'react'
import { hasPageLevelAdsInQueue, checkAndMarkGlobalInit, checkAndMarkPageLevelAds, safeAdSensePush, markInitializationComplete } from '@/lib/adsense-state'

/**
 * Global AdSense Manager - Prevents hydration errors and duplicate ads
 */
export default function AdSenseManager() {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    if (!isClient || typeof window === 'undefined') return

    // Ultimate protection: Global initialization flag
    if (!checkAndMarkGlobalInit()) {
      console.log('ℹ️ AdSense Manager - Global initialization already done')
      return
    }

    // Multiple levels of duplicate prevention
    if ((window as any).__adsenseManagerInitialized) {
      console.log('ℹ️ AdSense Manager already initialized')
      return
    }

    // Check if Google AdSense has already initialized auto ads
    if ((window as any).google_ad_modifications && 
        (window as any).google_ad_modifications.eids) {
      console.log('ℹ️ Google AdSense auto ads already active')
      ;(window as any).__adsenseManagerInitialized = true
      return
    }

    // Check if enable_page_level_ads was already called
    if (hasPageLevelAdsInQueue()) {
      console.log('ℹ️ Page-level ads already enabled in queue')
      ;(window as any).__adsenseManagerInitialized = true
      return
    }

    // Ultimate protection for page-level ads
    if (!checkAndMarkPageLevelAds()) {
      console.log('ℹ️ AdSense Manager - Page-level ads already marked')
      return
    }

    try {
      // Ensure adsbygoogle array is properly initialized
      if (!window.adsbygoogle || !Array.isArray(window.adsbygoogle)) {
        console.log('ℹ️ AdSenseManager: Initializing adsbygoogle array')
        window.adsbygoogle = []
      }
      
      // Check array length to prevent duplicate pushes
      const currentLength = window.adsbygoogle.length
      
      // Use safe push to initialize auto ads
      const success = safeAdSensePush({
        google_ad_client: "ca-pub-6879569899763830",
        enable_page_level_ads: true,
        overlays: {
          bottom: true,
        },
        vignettes: {
          unhideAfter: 30000,
        }
      }, 'AdSenseManager')

      if (success) {
        // Mark as initialized with multiple markers
        ;(window as any).__adsenseManagerInitialized = true
        sessionStorage.setItem('adsense-manager-init', Date.now().toString())
        
        console.log(`✅ AdSense Manager initialized successfully (queue: ${currentLength} -> ${window.adsbygoogle.length})`)
      } else {
        console.error('❌ AdSense Manager initialization failed')
      }
    } catch (error) {
      console.error('❌ AdSense Manager initialization error:', error)
    } finally {
      // Always mark initialization as complete
      markInitializationComplete()
    }
  }, [isClient])

  return null
}
