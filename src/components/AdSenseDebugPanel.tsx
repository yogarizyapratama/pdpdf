'use client'

import { useEffect, useState } from 'react'
import { getAdSenseStats, clearAdSenseRegistry, resetGlobalAdSenseState } from '@/lib/adsense-state'

/**
 * AdSense Debug Panel - Development Only
 * Shows current AdSense state and helps debug duplicate ad issues
 */
export default function AdSenseDebugPanel() {
  const [stats, setStats] = useState({
    registeredElements: 0,
    processingElements: 0,
    registeredIds: [] as string[],
    processingIds: [] as string[]
  })
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Only show in development
    if (process.env.NODE_ENV !== 'development') return

    const updateStats = () => {
      setStats(getAdSenseStats())
    }

    // Update stats every 2 seconds
    const interval = setInterval(updateStats, 2000)
    updateStats() // Initial update

    return () => clearInterval(interval)
  }, [])

  // Don't render in production
  if (process.env.NODE_ENV !== 'development') return null

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={() => setIsVisible(!isVisible)}
        className="bg-blue-600 text-white px-3 py-2 rounded-lg shadow-lg text-xs font-mono hover:bg-blue-700 transition-colors"
      >
        AdSense Debug {stats.registeredElements > 0 && `(${stats.registeredElements})`}
      </button>
      
      {isVisible && (
        <div className="absolute bottom-12 right-0 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-xl p-4 w-80 max-h-96 overflow-y-auto">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              AdSense State
            </h3>
            <button
              onClick={clearAdSenseRegistry}
              className="bg-red-500 text-white px-2 py-1 rounded text-xs hover:bg-red-600 transition-colors mr-1"
            >
              Clear Registry
            </button>
            <button
              onClick={resetGlobalAdSenseState}
              className="bg-orange-500 text-white px-2 py-1 rounded text-xs hover:bg-orange-600 transition-colors"
            >
              Full Reset
            </button>
          </div>
          
          <div className="space-y-2 text-xs text-gray-700 dark:text-gray-300 font-mono">
            <div>Registered Elements: <span className="font-bold">{stats.registeredElements}</span></div>
            <div>Processing Elements: <span className="font-bold text-yellow-600">{stats.processingElements}</span></div>
            
            {stats.registeredIds.length > 0 && (
              <div>
                <div className="font-semibold mt-3 mb-1">Registered IDs:</div>
                <div className="max-h-32 overflow-y-auto bg-gray-100 dark:bg-gray-700 p-2 rounded">
                  {stats.registeredIds.map((id, index) => (
                    <div key={index} className="text-xs break-all">{id}</div>
                  ))}
                </div>
              </div>
            )}
            
            {stats.processingIds.length > 0 && (
              <div>
                <div className="font-semibold mt-3 mb-1 text-yellow-600">Processing IDs:</div>
                <div className="max-h-32 overflow-y-auto bg-yellow-100 dark:bg-yellow-900 p-2 rounded">
                  {stats.processingIds.map((id, index) => (
                    <div key={index} className="text-xs break-all">{id}</div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
