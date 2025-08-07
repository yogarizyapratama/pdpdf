'use client'

import { useEffect, useState } from 'react'
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
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Get appropriate ad format based on position and device
  const getAdFormat = () => {
    if (isMobile) {
      return position === 'sidebar' ? 'rectangle' : 'horizontal'
    }
    
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

  // Get appropriate styling based on position
  const getAdStyle = () => {
    const baseStyle = {
      display: 'block',
      textAlign: 'center' as const,
      ...style
    }

    if (isMobile) {
      return {
        ...baseStyle,
        minHeight: position === 'sidebar' ? '250px' : '100px',
        width: '100%'
      }
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
    ${position === 'sidebar' ? 'md:sticky md:top-4' : 'w-full'}
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
