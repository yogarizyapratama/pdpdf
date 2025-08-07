import { pdfjs } from 'react-pdf'

// Configure PDF.js worker with fallback strategy
let workerInitialized = false

export function configurePDFWorker() {
  if (typeof window !== 'undefined' && !workerInitialized) {
    try {
      // Try local worker first
      pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js'
      workerInitialized = true
      console.log('PDF.js worker configured with local file:', pdfjs.GlobalWorkerOptions.workerSrc)
      
      // Test if worker loads by creating a dummy worker
      const testWorker = new Worker(pdfjs.GlobalWorkerOptions.workerSrc)
      testWorker.terminate()
      console.log('Local PDF.js worker verified successfully')
      
    } catch (error) {
      console.warn('Local PDF.js worker failed, using CDN fallback:', error)
      try {
        pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`
        workerInitialized = true
        console.log('PDF.js worker configured with CDN fallback')
      } catch (fallbackError) {
        console.error('All PDF.js worker configuration attempts failed:', fallbackError)
        // Last resort fallback
        pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`
        workerInitialized = true
        console.log('PDF.js worker configured with alternative CDN')
      }
    }
  }
}

// Initialize worker immediately
configurePDFWorker()

// Also export the pdfjs instance for direct access if needed
export { pdfjs }
