'use client'

import { HeaderBannerAd, SidebarAd, FooterAd } from './AdUnits'

interface AdLayoutWrapperProps {
  children: React.ReactNode
  showHeaderAd?: boolean
  showSidebarAd?: boolean
  showFooterAd?: boolean
  className?: string
}

/**
 * Ad Layout Wrapper - Menambahkan iklan tanpa mengganggu UI utama
 * - Menggunakan CSS Grid yang fleksibel
 * - Ads bersifat opsional dan dapat dimatikan
 * - Responsive dan tidak mengubah layout core
 */
export default function AdLayoutWrapper({
  children,
  showHeaderAd = true,
  showSidebarAd = true,
  showFooterAd = true,
  className = ""
}: AdLayoutWrapperProps) {
  return (
    <div className={`min-h-screen bg-gray-50 dark:bg-gray-900 ${className}`}>
      {/* Header Ad - Non-intrusive, collapsible */}
      {showHeaderAd && (
        <div className="w-full bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div className="container mx-auto px-4 py-2">
            <HeaderBannerAd />
          </div>
        </div>
      )}

      {/* Main Content Area with Optional Sidebar */}
      <div className={`container mx-auto px-4 py-8 max-w-7xl ${
        showSidebarAd ? 'lg:grid lg:grid-cols-4 lg:gap-8' : ''
      }`}>
        {/* Main Content - Always takes priority */}
        <div className={showSidebarAd ? 'lg:col-span-3' : 'w-full'}>
          {children}
        </div>

        {/* Sidebar - Desktop only, doesn't affect mobile UX */}
        {showSidebarAd && (
          <aside className="hidden lg:block lg:col-span-1">
            <div className="sticky top-8 space-y-6">
              <SidebarAd />
            </div>
          </aside>
        )}
      </div>

      {/* Footer Ad - Separated, non-blocking */}
      {showFooterAd && (
        <div className="mt-auto border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
          <div className="container mx-auto px-4 py-4">
            <FooterAd />
          </div>
        </div>
      )}
    </div>
  )
}
