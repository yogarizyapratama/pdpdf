/**
 * Global TypeScript declarations for AdSense and other window extensions
 */

declare global {
  interface Window {
    adsbygoogle: Array<Record<string, any>> | any[]
    google_ad_modifications?: any
    __adsenseManagerInitialized?: boolean
    __autoAdsInitialized?: boolean
  }
}

export {}
