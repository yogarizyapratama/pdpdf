'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

declare global {
  interface Window {
    gtag: (command: string, ...args: unknown[]) => void
  }
}

export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || 'G-XXXXXXXXXX'

// Track page views
export const trackPageView = (url: string) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('config', GA_MEASUREMENT_ID, {
      page_location: url,
      page_title: document.title
    })
  }
}

// Track PDF tool usage
export const trackPDFToolUsage = (toolName: string, action: string, fileSize?: number) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'pdf_tool_usage', {
      event_category: 'PDF Tools',
      event_label: toolName,
      custom_parameter_1: action,
      value: fileSize || 0
    })
  }
}

// Track file uploads
export const trackFileUpload = (toolName: string, fileType: string, fileSize: number) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'file_upload', {
      event_category: 'User Engagement',
      event_label: `${toolName}_${fileType}`,
      value: fileSize
    })
  }
}

// Track file downloads
export const trackFileDownload = (toolName: string, outputFormat: string, processingTime: number) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'file_download', {
      event_category: 'Conversion',
      event_label: `${toolName}_${outputFormat}`,
      value: processingTime
    })
  }
}

// Track search usage
export const trackSearch = (query: string, resultsCount: number) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'search', {
      search_term: query,
      event_category: 'Site Search',
      custom_parameter_1: resultsCount
    })
  }
}

// Track errors
export const trackError = (errorType: string, errorMessage: string, toolName?: string) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'exception', {
      description: `${errorType}: ${errorMessage}`,
      fatal: false,
      custom_parameter_1: toolName || 'unknown'
    })
  }
}

// Main Analytics component
export default function GoogleAnalytics() {
  const pathname = usePathname()

  useEffect(() => {
    // Track page view on route change
    trackPageView(window.location.href)
  }, [pathname])

  useEffect(() => {
    // Load Google Analytics script
    const script1 = document.createElement('script')
    script1.async = true
    script1.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`
    document.head.appendChild(script1)

    const script2 = document.createElement('script')
    script2.innerHTML = `
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', '${GA_MEASUREMENT_ID}', {
        page_title: 'PDF All-in-One',
        page_location: '${window.location.href}',
        send_page_view: true,
        anonymize_ip: true,
        allow_google_signals: false,
        allow_ad_personalization_signals: false
      });
    `
    document.head.appendChild(script2)

    // Set up global gtag function
    window.gtag = function() {
      // @ts-ignore
      window.dataLayer = window.dataLayer || []
      // @ts-ignore
      window.dataLayer.push(arguments)
    }

    return () => {
      // Cleanup scripts on unmount
      document.head.removeChild(script1)
      document.head.removeChild(script2)
    }
  }, [])

  return null
}
