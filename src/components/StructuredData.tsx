import React from 'react'

interface StructuredDataProps {
  tool?: {
    name: string
    description: string
    url: string
    category: string
  }
}

export default function StructuredData({ tool }: StructuredDataProps) {
  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "PDF All-in-One",
    "description": "Free online PDF tools for merge, split, compress, convert, edit, and secure your PDF files. No registration required.",
    "url": "https://pdf-all-in-one.com",
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": "https://pdf-all-in-one.com?search={search_term_string}"
      },
      "query-input": "required name=search_term_string"
    },
    "sameAs": [
      "https://twitter.com/pdfallinone",
      "https://facebook.com/pdfallinone",
      "https://linkedin.com/company/pdfallinone"
    ]
  }

  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "PDF All-in-One",
    "description": "Leading provider of free online PDF tools",
    "url": "https://pdf-all-in-one.com",
    "logo": "https://pdf-all-in-one.com/logo.png",
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "Customer Service",
      "url": "https://pdf-all-in-one.com/contact"
    },
    "foundingDate": "2024",
    "knowsAbout": [
      "PDF Processing",
      "Document Conversion",
      "File Compression",
      "Digital Document Management",
      "Online PDF Tools"
    ]
  }

  const softwareApplicationSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "PDF All-in-One",
    "description": "Comprehensive online PDF toolkit with 25+ tools",
    "url": "https://pdf-all-in-one.com",
    "applicationCategory": "ProductivityApplication",
    "operatingSystem": "Web Browser",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.9",
      "ratingCount": "12847",
      "bestRating": "5",
      "worstRating": "1"
    },
    "featureList": [
      "Merge PDF files",
      "Split PDF documents", 
      "Compress PDF files",
      "Convert PDF to Word, Excel, JPG",
      "Convert Word, Excel, JPG to PDF",
      "Protect and unlock PDF",
      "Add watermarks and signatures",
      "OCR text recognition",
      "Rotate and crop PDF pages"
    ]
  }

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "Is PDF All-in-One free to use?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, all PDF tools on PDF All-in-One are completely free. No registration, watermarks, or file size limits."
        }
      },
      {
        "@type": "Question", 
        "name": "How do I merge PDF files online?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Upload your PDF files, arrange them in desired order, and click merge. Your combined PDF will be ready for download instantly."
        }
      },
      {
        "@type": "Question",
        "name": "Can I convert PDF to Word for free?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, our PDF to Word converter is completely free and maintains original formatting while converting your documents."
        }
      },
      {
        "@type": "Question",
        "name": "Are my files secure when using PDF All-in-One?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, all files are processed securely and automatically deleted from our servers after processing."
        }
      }
    ]
  }

  const toolSchema = tool ? {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": tool.name,
    "description": tool.description,
    "url": tool.url,
    "applicationCategory": "ProductivityApplication",
    "operatingSystem": "Web Browser",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "isPartOf": {
      "@type": "WebSite",
      "name": "PDF All-in-One",
      "url": "https://pdf-all-in-one.com"
    }
  } : null

  const breadcrumbSchema = tool ? {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": "https://pdf-all-in-one.com"
      },
      {
        "@type": "ListItem", 
        "position": 2,
        "name": tool.category,
        "item": `https://pdf-all-in-one.com/${tool.category}`
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": tool.name,
        "item": tool.url
      }
    ]
  } : null

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareApplicationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      {toolSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(toolSchema) }}
        />
      )}
      {breadcrumbSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
        />
      )}
    </>
  )
}
