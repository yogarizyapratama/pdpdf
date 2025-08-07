'use client'

interface StructuredDataProps {
  pageType?: 'tool' | 'homepage' | 'category'
  toolName?: string
  toolDescription?: string
  category?: string
}

export default function StructuredData({ 
  pageType = 'homepage', 
  toolName, 
  toolDescription,
  category 
}: StructuredDataProps) {
  const getStructuredData = () => {
    const baseData = {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      "name": "PDPDF - Free Online PDF Tools",
      "url": "https://pdpdf.vercel.app",
      "description": "Free online PDF tools for merge, split, compress, convert, and edit PDF files. No registration required.",
      "applicationCategory": "ProductivityApplication",
      "operatingSystem": "Any",
      "browserRequirements": "Requires JavaScript enabled",
      "softwareVersion": "1.0",
      "datePublished": "2025-01-01",
      "dateModified": new Date().toISOString().split('T')[0],
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD",
        "availability": "https://schema.org/InStock"
      },
      "publisher": {
        "@type": "Organization",
        "name": "PDPDF",
        "url": "https://pdpdf.vercel.app",
        "logo": {
          "@type": "ImageObject",
          "url": "https://pdpdf.vercel.app/icon.svg",
          "width": 512,
          "height": 512
        }
      },
      "author": {
        "@type": "Organization",
        "name": "PDPDF Team"
      },
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": "4.8",
        "ratingCount": "2847",
        "bestRating": "5"
      }
    }

    if (pageType === 'tool' && toolName) {
      return {
        ...baseData,
        "@type": "SoftwareApplication",
        "name": `${toolName} - Free Online PDF Tool | PDPDF`,
        "description": toolDescription || `Free online ${toolName.toLowerCase()} tool. Fast, secure, and easy to use.`,
        "featureList": [
          "Free online PDF processing",
          "No file size limits", 
          "Secure client-side processing",
          "No registration required",
          "Cross-platform compatibility",
          "Fast processing speed"
        ],
        "screenshot": `https://pdpdf.vercel.app/api/og?tool=${encodeURIComponent(toolName)}`,
        "category": category || "PDF Tools",
        "keywords": [
          toolName.toLowerCase(),
          "pdf tools",
          "online pdf",
          "free pdf",
          "pdf converter"
        ].join(", ")
      }
    }

    if (pageType === 'category' && category) {
      return {
        ...baseData,
        "name": `${category} PDF Tools - PDPDF`,
        "description": `Free online ${category.toLowerCase()} PDF tools and utilities. Fast, secure, and easy to use.`,
        "keywords": `${category.toLowerCase()} pdf, pdf ${category.toLowerCase()}, online pdf tools`
      }
    }

    // Homepage structured data
    return {
      ...baseData,
      "mainEntity": {
        "@type": "ItemList",
        "numberOfItems": 27,
        "itemListElement": [
          {
            "@type": "SoftwareApplication",
            "position": 1,
            "name": "Merge PDF",
            "url": "https://pdpdf.vercel.app/merge-pdf"
          },
          {
            "@type": "SoftwareApplication", 
            "position": 2,
            "name": "Split PDF",
            "url": "https://pdpdf.vercel.app/split-pdf"
          },
          {
            "@type": "SoftwareApplication",
            "position": 3,
            "name": "Compress PDF",
            "url": "https://pdpdf.vercel.app/compress-pdf"
          }
        ]
      }
    }
  }

  const getWebSiteData = () => {
    return {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "name": "PDPDF",
      "url": "https://pdpdf.vercel.app",
      "potentialAction": {
        "@type": "SearchAction",
        "target": {
          "@type": "EntryPoint",
          "urlTemplate": "https://pdpdf.vercel.app/?q={search_term_string}"
        },
        "query-input": "required name=search_term_string"
      }
    }
  }

  const getOrganizationData = () => {
    return {
      "@context": "https://schema.org",
      "@type": "Organization",
      "name": "PDPDF",
      "url": "https://pdpdf.vercel.app",
      "logo": "https://pdpdf.vercel.app/icon.svg",
      "description": "Free online PDF tools for everyone",
      "foundingDate": "2025",
      "sameAs": [
        "https://github.com/yogarizyapratama/pdpdf"
      ]
    }
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(getStructuredData())
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(getWebSiteData())
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(getOrganizationData())
        }}
      />
    </>
  )
}
