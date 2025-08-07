'use client'

import Script from 'next/script'

export default function GoogleAdSenseScript() {
  return (
    <>
      {/* Google tag (gtag.js) - Must load before AdSense for consent mode */}
      <Script
        async
        src="https://www.googletagmanager.com/gtag/js?id=G-MEASUREMENT_ID"
        strategy="beforeInteractive"
      />
      
      {/* Initialize Google Analytics and Consent Mode */}
      <Script id="gtag-init" strategy="beforeInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          
          // Initialize consent mode BEFORE any other tags
          gtag('consent', 'default', {
            ad_storage: 'denied',
            ad_user_data: 'denied',
            ad_personalization: 'denied', 
            analytics_storage: 'denied',
            functionality_storage: 'granted',
            security_storage: 'granted'
          });
          
          gtag('js', new Date());
          // Configure your measurement ID here when you have it
          // gtag('config', 'G-MEASUREMENT_ID');
        `}
      </Script>
      
      {/* Google AdSense - Official Implementation with Consent Integration */}
      <Script
        async
        src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6879569899763830"
        crossOrigin="anonymous"
        strategy="afterInteractive"
        onLoad={() => {
          // AdSense loaded successfully
          console.log('Google AdSense script loaded')
        }}
      />
      
      {/* AdSense initialization with consent awareness */}
      <Script id="adsense-init" strategy="afterInteractive">
        {`
          window.adsbygoogle = window.adsbygoogle || [];
          
          // Listen for consent updates to refresh ads if needed
          if (window.gtag) {
            // Function to handle consent updates
            window.addEventListener('consent-updated', function(event) {
              console.log('Consent updated, refreshing ads if necessary');
              // Refresh ads based on new consent state
              if (event.detail && event.detail.ad_storage === 'granted') {
                // Re-request ads with new consent
                try {
                  (adsbygoogle = window.adsbygoogle || []).requestNonPersonalizedAds = 0;
                } catch (e) {
                  console.warn('AdSense consent update error:', e);
                }
              }
            });
          }
        `}
      </Script>
    </>
  )
}
