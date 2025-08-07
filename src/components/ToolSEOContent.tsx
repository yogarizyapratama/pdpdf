import React from 'react'
import { seoConfig } from '@/lib/seo-config'

interface ToolSEOContentProps {
  toolKey: string
}

export default function ToolSEOContent({ toolKey }: ToolSEOContentProps) {
  const config = seoConfig[toolKey]
  
  if (!config) return null

  const { content } = config

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": config.title,
    "description": config.description,
    "url": `https://pdf-all-in-one.com/${toolKey}`,
    "applicationCategory": "BusinessApplication",
    "operatingSystem": "Web",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.8",
      "ratingCount": "1247"
    },
    "featureList": content.benefits,
    "screenshot": `https://pdf-all-in-one.com/screenshots/${toolKey}.jpg`
  }

  const faqStructuredData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": content.faq.map(item => ({
      "@type": "Question",
      "name": item.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": item.answer
      }
    }))
  }

  const howToStructuredData = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    "name": `How to use ${config.h1}`,
    "description": config.description,
    "totalTime": "PT2M",
    "estimatedCost": {
      "@type": "MonetaryAmount",
      "currency": "USD",
      "value": "0"
    },
    "step": content.steps.map((step, index) => ({
      "@type": "HowToStep",
      "position": index + 1,
      "name": `Step ${index + 1}`,
      "text": step,
      "url": `https://pdf-all-in-one.com/${toolKey}#step-${index + 1}`
    }))
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData)
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(faqStructuredData)
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(howToStructuredData)
        }}
      />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            {config.h1}
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
            {content.subtitle}
          </p>
        </div>

        {/* Benefits Section */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Why Choose Our {toolKey.replace('-', ' ').toUpperCase()} Tool?
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            {content.benefits.map((benefit, index) => (
              <div key={index} className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center mt-0.5">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <p className="text-gray-700 dark:text-gray-300">{benefit}</p>
              </div>
            ))}
          </div>
        </div>

        {/* How to Use Section */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            How to Use Our {toolKey.replace('-', ' ').toUpperCase()} Tool
          </h2>
          <div className="space-y-4">
            {content.steps.map((step, index) => (
              <div key={index} className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold">
                  {index + 1}
                </div>
                <p className="text-gray-700 dark:text-gray-300 pt-1">{step}</p>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Frequently Asked Questions
          </h2>
          <div className="space-y-6">
            {content.faq.map((item, index) => (
              <div key={index} className="border-b border-gray-200 dark:border-gray-700 pb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {item.question}
                </h3>
                <p className="text-gray-700 dark:text-gray-300">
                  {item.answer}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Security & Privacy */}
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            🔒 Security & Privacy
          </h2>
          <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-600 dark:text-gray-300">
            <div>
              <p className="font-semibold mb-2">✅ Secure Processing</p>
              <p>All files are processed securely and deleted automatically after processing.</p>
            </div>
            <div>
              <p className="font-semibold mb-2">✅ No Registration Required</p>
              <p>Use all features without creating an account or providing personal information.</p>
            </div>
            <div>
              <p className="font-semibold mb-2">✅ No File Size Limits</p>
              <p>Process files of any size without restrictions or premium subscriptions.</p>
            </div>
            <div>
              <p className="font-semibold mb-2">✅ Client-Side Processing</p>
              <p>Many operations are performed locally in your browser for maximum privacy.</p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
