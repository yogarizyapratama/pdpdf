'use client'

import { useEffect } from 'react'

export default function GoogleConsentManager() {
  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return

    // Initialize Google Funding Choices (CMP)
    const initializeGoogleCMP = () => {
      // Load Google Funding Choices script
      const script = document.createElement('script')
      script.src = 'https://fundingchoicesmessages.google.com/i/pub-6879569899763830?ers=1'
      script.async = true
      script.nonce = 'google-cmp-script'
      
      // Handle script load success
      script.onload = () => {
        console.log('Google CMP script loaded successfully')
        
        // Initialize gtag consent mode
        if (window.gtag) {
          window.gtag('consent', 'default', {
            ad_storage: 'denied',
            ad_user_data: 'denied', 
            ad_personalization: 'denied',
            analytics_storage: 'denied',
            functionality_storage: 'granted',
            security_storage: 'granted'
          })
        }
      }
      
      // Handle script load error
      script.onerror = () => {
        console.warn('Failed to load Google CMP script')
      }
      
      document.head.appendChild(script)
      
      // Cleanup function
      return () => {
        if (document.head.contains(script)) {
          document.head.removeChild(script)
        }
      }
    }

    // Initialize Google Tag Manager consent
    const initializeGTMConsent = () => {
      if (!window.gtag) {
        // Load gtag if not already loaded
        const gtagScript = document.createElement('script')
        gtagScript.async = true
        gtagScript.src = 'https://www.googletagmanager.com/gtag/js?id=G-MEASUREMENT_ID'
        document.head.appendChild(gtagScript)
        
        // Initialize gtag
        window.dataLayer = window.dataLayer || []
        window.gtag = function gtag() {
          window.dataLayer?.push(arguments)
        }
        
        window.gtag('js', new Date())
      }
    }

    // Initialize both systems
    initializeGTMConsent()
    const cleanup = initializeGoogleCMP()

    // Listen for consent updates
    const handleConsentUpdate = (event: CustomEvent) => {
      const { consentData } = event.detail
      
      if (window.gtag && consentData) {
        window.gtag('consent', 'update', {
          ad_storage: consentData.ad_storage || 'denied',
          ad_user_data: consentData.ad_user_data || 'denied',
          ad_personalization: consentData.ad_personalization || 'denied',
          analytics_storage: consentData.analytics_storage || 'denied'
        })
      }
    }

    // Add event listener for consent updates
    window.addEventListener('google_cmp_consent_update', handleConsentUpdate as EventListener)

    // Cleanup
    return () => {
      window.removeEventListener('google_cmp_consent_update', handleConsentUpdate as EventListener)
      if (cleanup) cleanup()
    }
  }, [])

  return null // No visual component - just functionality
}

// Extend Window interface for TypeScript
declare global {
  interface Window {
    dataLayer?: any[]
  }
}
