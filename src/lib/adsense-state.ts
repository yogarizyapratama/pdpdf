/**
 * Global AdSense State Manager
 * Prevents duplicate ad initialization and coordinates multiple ad components
 */

// Global flags to prevent duplicate initialization
let globalAdSenseInitialized = false
let pageLevelAdsEnabled = false
let isInitializing = false // Mutex for initialization

// Global registry to track ad elements and prevent duplicates
const adElementRegistry = new Set<string>()
const processingElements = new Set<string>()

export interface AdElementInfo {
  id: string
  element: HTMLElement
  status: 'pending' | 'processing' | 'loaded' | 'error'
}

/**
 * Check and mark global AdSense initialization with mutex
 */
export function checkAndMarkGlobalInit(): boolean {
  if (globalAdSenseInitialized || isInitializing) {
    return false
  }
  isInitializing = true
  globalAdSenseInitialized = true
  return true
}

/**
 * Mark initialization complete
 */
export function markInitializationComplete(): void {
  isInitializing = false
}

/**
 * Check and mark page-level ads initialization
 */
export function checkAndMarkPageLevelAds(): boolean {
  if (pageLevelAdsEnabled) {
    return false
  }
  pageLevelAdsEnabled = true
  return true
}

/**
 * Safe AdSense push with error handling
 */
export function safeAdSensePush(adConfig: any, componentName: string): boolean {
  try {
    if (typeof window === 'undefined') return false
    
    // Ensure adsbygoogle exists and is a proper array
    if (!window.adsbygoogle || !Array.isArray(window.adsbygoogle)) {
      console.log(`ℹ️ ${componentName}: Initializing adsbygoogle array`)
      window.adsbygoogle = []
    }
    
    // Verify push method exists
    if (typeof window.adsbygoogle.push !== 'function') {
      console.error(`❌ ${componentName}: adsbygoogle.push is not a function`)
      return false
    }
    
    // Push the config
    window.adsbygoogle.push(adConfig)
    
    console.log(`✅ ${componentName}: AdSense push successful`)
    return true
  } catch (error) {
    console.error(`❌ ${componentName}: AdSense push failed:`, error)
    return false
  }
}

/**
 * Reset global state (for development/testing)
 */
export function resetGlobalAdSenseState(): void {
  globalAdSenseInitialized = false
  pageLevelAdsEnabled = false
  isInitializing = false
  adElementRegistry.clear()
  processingElements.clear()
  
  // Clear window flags too
  if (typeof window !== 'undefined') {
    delete (window as any).__adsenseManagerInitialized
    try {
      sessionStorage.removeItem('adsense-manager-init')
    } catch (e) {
      // Ignore sessionStorage errors
    }
  }
  
  console.log('🔄 Global AdSense state FULLY reset')
}

/**
 * Register an ad element to prevent duplicate processing
 */
export function registerAdElement(elementId: string): boolean {
  if (adElementRegistry.has(elementId)) {
    console.log(`ℹ️ Ad element already registered: ${elementId}`)
    return false
  }
  
  adElementRegistry.add(elementId)
  console.log(`✅ Ad element registered: ${elementId}`)
  return true
}

/**
 * Check if an element is safe to process (no duplicates)
 */
export function canProcessAdElement(element: HTMLElement, elementId?: string): boolean {
  // Check multiple indicators that AdSense has already processed this element
  const hasAdSbyGoogleStatus = element.hasAttribute('data-adsbygoogle-status')
  const hasAdStatus = element.hasAttribute('data-ad-status')
  const hasChildren = element.children.length > 0
  const isProcessed = element.dataset.processed === 'true'
  const isProcessing = element.dataset.processing === 'true'
  
  // Check global registry
  const isRegistered = elementId ? adElementRegistry.has(elementId) : false
  const isCurrentlyProcessing = elementId ? processingElements.has(elementId) : false
  
  const canProcess = !hasAdSbyGoogleStatus && 
                    !hasAdStatus && 
                    !hasChildren && 
                    !isProcessed && 
                    !isProcessing &&
                    !isCurrentlyProcessing
  
  console.log(`🔍 Ad element check (${elementId}):`, {
    hasAdSbyGoogleStatus,
    hasAdStatus,
    hasChildren,
    isProcessed,
    isProcessing,
    isRegistered,
    isCurrentlyProcessing,
    canProcess
  })
  
  return canProcess
}

/**
 * Mark an element as being processed
 */
export function markAsProcessing(element: HTMLElement, elementId?: string): void {
  element.dataset.processing = 'true'
  if (elementId) {
    processingElements.add(elementId)
  }
}

/**
 * Mark an element as fully processed
 */
export function markAsProcessed(element: HTMLElement, elementId?: string): void {
  element.dataset.processed = 'true'
  element.dataset.processing = 'false'
  
  if (elementId) {
    processingElements.delete(elementId)
  }
}

/**
 * Get processing statistics for debugging
 */
export function getAdSenseStats() {
  return {
    registeredElements: adElementRegistry.size,
    processingElements: processingElements.size,
    registeredIds: Array.from(adElementRegistry),
    processingIds: Array.from(processingElements)
  }
}

/**
 * Check if enable_page_level_ads is already in the adsbygoogle queue
 */
export function hasPageLevelAdsInQueue(): boolean {
  if (typeof window === 'undefined') return false
  
  const adsbygoogle = window.adsbygoogle || []
  
  // Ensure it's actually an array with the some method
  if (!Array.isArray(adsbygoogle) || typeof adsbygoogle.some !== 'function') {
    console.log('ℹ️ adsbygoogle is not a proper array, recreating...')
    window.adsbygoogle = []
    return false
  }
  
  try {
    return adsbygoogle.some((item: any) => 
      item && typeof item === 'object' && item.enable_page_level_ads === true
    )
  } catch (error) {
    console.error('❌ Error checking adsbygoogle queue:', error)
    return false
  }
}

/**
 * Clear all registries (useful for development/testing)
 */
export function clearAdSenseRegistry() {
  adElementRegistry.clear()
  processingElements.clear()
  console.log('🗑️ AdSense registry cleared')
}
