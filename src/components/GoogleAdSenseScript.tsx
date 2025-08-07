'use client'

import Script from 'next/script'

export default function GoogleAdSenseScript() {
  const adClient = process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_CLIENT

  // Don't load AdSense in development unless explicitly enabled
  if (process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_APP_ENV !== 'production') {
    return null
  }

  // Don't load if no ad client is configured
  if (!adClient || adClient === 'ca-pub-XXXXXXXXXXXXXXXXX') {
    console.warn('Google AdSense client ID not configured. Please set NEXT_PUBLIC_GOOGLE_ADSENSE_CLIENT in your environment variables.')
    return null
  }

  return (
    <>
      {/* Google AdSense */}
      <Script
        id="google-adsense"
        async
        src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adClient}`}
        crossOrigin="anonymous"
        strategy="afterInteractive"
        onLoad={() => {
          console.log('Google AdSense script loaded successfully')
        }}
        onError={(e) => {
          console.error('Failed to load Google AdSense script:', e)
        }}
      />
      
      {/* AdSense Auto Ads (Optional) */}
      <Script
        id="google-adsense-init"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            (adsbygoogle = window.adsbygoogle || []).push({
              google_ad_client: "${adClient}",
              enable_page_level_ads: true
            });
          `
        }}
      />
    </>
  )
}
