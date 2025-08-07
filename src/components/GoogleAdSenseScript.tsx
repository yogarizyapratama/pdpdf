'use client'

import Script from 'next/script'

export default function GoogleAdSenseScript() {
  return (
    <>
      {/* Google AdSense - Official Implementation */}
      <Script
        async
        src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6879569899763830"
        crossOrigin="anonymous"
        strategy="afterInteractive"
      />
      
      {/* Basic AdSense initialization - no auto ads to avoid conflicts */}
      <Script id="adsense-init" strategy="afterInteractive">
        {`
          window.adsbygoogle = window.adsbygoogle || [];
        `}
      </Script>
    </>
  )
}
