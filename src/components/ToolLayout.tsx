import React from 'react'
import Header from './Header'
import Footer from './Footer'
import { AdUnits } from './AdUnits'

interface ToolLayoutProps {
  title: string
  description: string
  children: React.ReactNode
}

export default function ToolLayout({ title, description, children }: ToolLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      <Header />
      
      {/* Header Banner Ad */}
      <div className="container mx-auto px-4 py-2">
        <AdUnits.HeaderBannerAd />
      </div>
      
      <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Main Content */}
          <div className="flex-1">
            {children}
          </div>
          
          {/* Sidebar with Ads */}
          <div className="hidden lg:block w-80 space-y-6">
            <AdUnits.SidebarAd />
            
            {/* Related Tools */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Related Tools</h3>
              <div className="space-y-2 text-sm">
                <a href="/merge-pdf" className="block text-blue-600 hover:text-blue-800 dark:text-blue-400">Merge PDFs</a>
                <a href="/split-pdf" className="block text-blue-600 hover:text-blue-800 dark:text-blue-400">Split PDF</a>
                <a href="/compress-pdf" className="block text-blue-600 hover:text-blue-800 dark:text-blue-400">Compress PDF</a>
                <a href="/rotate-pdf" className="block text-blue-600 hover:text-blue-800 dark:text-blue-400">Rotate PDF</a>
              </div>
            </div>
            
            <AdUnits.ContentAd />
          </div>
        </div>
        
        {/* Content Ad */}
        <div className="mt-8">
          <AdUnits.ContentAd />
        </div>
      </main>
      
      {/* Footer Ad */}
      <div className="container mx-auto px-4 py-4">
        <AdUnits.FooterAd />
      </div>
      
      <Footer />
    </div>
  )
}
