'use client'

import { useState, useEffect } from 'react'
import GoogleAdSense from './GoogleAdSense'

interface AdBannerProps {
  position?: 'top' | 'middle' | 'bottom' | 'sidebar'
  className?: string
  style?: React.CSSProperties
}

// Pre-configured ad slots for different positions

// These should be replaced with your actual Google AdSense slot IDs
const AD_SLOTS = {
  top: process.env.NEXT_PUBLIC_ADSENSE_SLOT_TOP || '1234567890',
  middle: process.env.NEXT_PUBLIC_ADSENSE_SLOT_MIDDLE || '1234567891', 
  bottom: process.env.NEXT_PUBLIC_ADSENSE_SLOT_BOTTOM || '1234567892',
  sidebar: process.env.NEXT_PUBLIC_ADSENSE_SLOT_SIDEBAR || '1234567893'
}

export default function AdBanner({ 
  position = 'middle', 
  className = '',
  style 
}: AdBannerProps) {
  const [consentGiven, setConsentGiven] = useState<boolean | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Check consent status
  useEffect(() => {
    const checkConsent = () => {
      // Check if consent has been given for ads
      if (typeof window !== 'undefined') {
        try {
          // Check localStorage for consent status
          const consentData = localStorage.getItem('google-cmp-consent')
          if (consentData) {
            const consent = JSON.parse(consentData)
            setConsentGiven(consent.ad_storage === 'granted')
          } else {
            // Default to false if no consent data
            setConsentGiven(false)
          }
        } catch (error) {
          console.warn('Error checking consent:', error)
          setConsentGiven(false)
        }
        setIsLoading(false)
      }
    }

    checkConsent()

    // Listen for consent updates
    const handleConsentUpdate = (event: CustomEvent) => {
      if (event.detail && event.detail.ad_storage) {
        setConsentGiven(event.detail.ad_storage === 'granted')
      }
    }

    window.addEventListener('google_cmp_consent_update', handleConsentUpdate as EventListener)

    return () => {
      window.removeEventListener('google_cmp_consent_update', handleConsentUpdate as EventListener)
    }
  }, [])

  // Don't render ads if loading or no consent
  if (isLoading) {
    return (
      <div className={`w-full flex items-center justify-center p-4 ${className}`} style={style}>
        <div className="text-gray-500 text-sm">Loading...</div>
      </div>
    )
  }

  if (consentGiven === false) {
    return (
      <div className={`w-full flex items-center justify-center p-4 border border-gray-200 rounded-lg bg-gray-50 ${className}`} style={style}>
        <div className="text-center text-gray-600">
          <p className="text-sm mb-2">Ads help keep this service free</p>
          <p className="text-xs text-gray-500">Please allow ads to support our PDF tools</p>
        </div>
      </div>
    )
  }
  // Get appropriate ad format based on position (no client-side detection)
  const getAdFormat = () => {
    switch (position) {
      case 'top':
      case 'bottom':
        return 'horizontal'
      case 'sidebar':
        return 'vertical'
      default:
        return 'auto'
    }
  }

  // Get consistent styling (no client-side responsive logic)
  const getAdStyle = () => {
    const baseStyle = {
      display: 'block' as const,
      textAlign: 'center' as const,
      ...style
    }

    switch (position) {
      case 'top':
      case 'bottom':
        return {
          ...baseStyle,
          minHeight: '90px',
          width: '100%'
        }
      case 'sidebar':
        return {
          ...baseStyle,
          minHeight: '600px',
          width: '160px'
        }
      default:
        return {
          ...baseStyle,
          minHeight: '250px',
          width: '100%'
        }
    }
  }

  const containerClasses = `
    ad-banner 
    ${className}
    ${position === 'sidebar' ? 'hidden md:block md:sticky md:top-4' : 'w-full'}
    ${position === 'top' ? 'mb-6' : ''}
    ${position === 'bottom' ? 'mt-6' : ''}
    ${position === 'middle' ? 'my-8' : ''}
  `.trim().replace(/\s+/g, ' ')

  return (
    <div className={containerClasses}>
      <GoogleAdSense
        adSlot={AD_SLOTS[position]}
        adFormat={getAdFormat()}
        style={getAdStyle()}
        fullWidthResponsive={true}
        className="w-full"
      />
    </div>
  )
}
