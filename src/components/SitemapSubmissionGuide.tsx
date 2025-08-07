'use client'

import React, { useState } from 'react'

const SitemapSubmissionGuide: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1)
  
  const steps = [
    {
      title: "Access Google Search Console",
      description: "Navigate to Google Search Console and select your property",
      details: [
        "Go to https://search.google.com/search-console/",
        "Click on 'pdpdf.vercel.app' property (already verified)",
        "Navigate to the left sidebar"
      ]
    },
    {
      title: "Submit Sitemap",
      description: "Add your sitemap to Google Search Console",
      details: [
        "Click on 'Sitemaps' in the left sidebar",
        "In the 'Add a new sitemap' section, enter: sitemap.xml",
        "Click 'Submit' button",
        "Your sitemap URL will be: https://pdpdf.vercel.app/sitemap.xml"
      ]
    },
    {
      title: "Request Indexing",
      description: "Speed up the indexing process for key pages",
      details: [
        "Go to 'URL Inspection' tool",
        "Enter your homepage URL: https://pdpdf.vercel.app",
        "Click 'Request Indexing' if page is not indexed",
        "Repeat for top tool pages: /merge-pdf, /compress-pdf, /pdf-to-jpg"
      ]
    },
    {
      title: "Monitor Performance",
      description: "Track your search performance and rankings",
      details: [
        "Check 'Performance' tab after 48-72 hours",
        "Monitor 'Coverage' for any crawl errors",
        "Review 'Enhancement' for structured data validation",
        "Expected indexing: 1-7 days for all 27+ pages"
      ]
    }
  ]

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-200">
      <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
        🚀 Google Search Console Setup - Path to #1 Rankings
      </h3>
      
      <div className="space-y-4">
        {steps.map((step, index) => (
          <div 
            key={index}
            className={`p-4 rounded-lg cursor-pointer transition-all ${
              currentStep === index + 1 
                ? 'bg-blue-100 border-2 border-blue-400 shadow-md' 
                : 'bg-white border border-gray-200 hover:border-blue-300'
            }`}
            onClick={() => setCurrentStep(index + 1)}
          >
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-gray-800">
                Step {index + 1}: {step.title}
              </h4>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                currentStep === index + 1 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-200 text-gray-600'
              }`}>
                {currentStep === index + 1 ? 'Active' : 'Pending'}
              </span>
            </div>
            
            <p className="text-gray-600 text-sm mt-1">{step.description}</p>
            
            {currentStep === index + 1 && (
              <div className="mt-3 pl-4 border-l-2 border-blue-400">
                <ul className="space-y-2">
                  {step.details.map((detail, detailIndex) => (
                    <li key={detailIndex} className="flex items-start">
                      <span className="text-blue-500 mr-2 mt-0.5">•</span>
                      <span className="text-sm text-gray-700">{detail}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
        <h4 className="font-semibold text-green-800 mb-2">🎯 Ranking Strategy</h4>
        <div className="text-sm text-green-700 space-y-1">
          <p>• <strong>Sitemap Priority:</strong> Homepage (1.0), Core Tools (0.9), All Tools (0.8)</p>
          <p>• <strong>Expected Timeline:</strong> Initial indexing 1-3 days, ranking improvements 2-4 weeks</p>
          <p>• <strong>Target Keywords:</strong> "PDF tools", "merge PDF online", "compress PDF free"</p>
          <p>• <strong>Competitive Advantage:</strong> 27 tools, client-side processing, mobile-optimized</p>
        </div>
      </div>

      <div className="mt-4 flex justify-between items-center text-sm text-gray-600">
        <span>Verification Status: ✅ Verified (Google Meta Tag Added)</span>
        <span>Sitemap: ✅ Ready (https://pdpdf.vercel.app/sitemap.xml)</span>
      </div>
    </div>
  )
}

export default SitemapSubmissionGuide
