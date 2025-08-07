'use client'

import { useEffect } from 'react'

declare global {
  interface Window {
    adsbygoogle: unknown[]
  }
}

// Header Banner Ad Component
export function HeaderBannerAd() {
  useEffect(() => {
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({})
    } catch (err) {
      console.log('AdSense error:', err)
    }
  }, [])

  return (
    <div className="flex justify-center my-4">
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client="ca-pub-6879569899763830"
        data-ad-slot="1234567890"
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  )
}

// Sidebar Ad Component
export function SidebarAd() {
  useEffect(() => {
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({})
    } catch (err) {
      console.log('AdSense error:', err)
    }
  }, [])

  return (
    <div className="sticky top-4">
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client="ca-pub-6879569899763830"
        data-ad-slot="2345678901"
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  )
}

// Content Ad Component
export function ContentAd() {
  useEffect(() => {
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({})
    } catch (err) {
      console.log('AdSense error:', err)
    }
  }, [])

  return (
    <div className="flex justify-center my-6">
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client="ca-pub-6879569899763830"
        data-ad-slot="3456789012"
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  )
}

// Footer Ad Component
export function FooterAd() {
  useEffect(() => {
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({})
    } catch (err) {
      console.log('AdSense error:', err)
    }
  }, [])

  return (
    <div className="flex justify-center">
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client="ca-pub-6879569899763830"
        data-ad-slot="4567890123"
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  )
}

// Export all components as AdUnits
export const AdUnits = {
  HeaderBannerAd,
  SidebarAd,
  ContentAd,
  FooterAd,
}
