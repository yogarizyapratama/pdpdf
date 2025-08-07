import { PDFDocument, degrees } from 'pdf-lib'

export interface ProcessingProgress {
  currentFile: number
  totalFiles: number
  stage: string
  progress: number
}

export class PDFProcessor {
  static async mergePDFs(files: File[], onProgress?: (progress: ProcessingProgress) => void): Promise<Uint8Array> {
    const mergedPdf = await PDFDocument.create()
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      
      onProgress?.({
        currentFile: i + 1,
        totalFiles: files.length,
        stage: `Processing ${file.name}...`,
        progress: ((i + 1) / files.length) * 100
      })
      
      const arrayBuffer = await file.arrayBuffer()
      const pdf = await PDFDocument.load(arrayBuffer)
      const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices())
      
      copiedPages.forEach((page) => {
        mergedPdf.addPage(page)
      })
    }
    
    return await mergedPdf.save()
  }
  
  static async splitPDF(file: File, ranges: { start: number; end: number }[], onProgress?: (progress: ProcessingProgress) => void): Promise<Uint8Array[]> {
    const arrayBuffer = await file.arrayBuffer()
    const pdf = await PDFDocument.load(arrayBuffer)
    const results: Uint8Array[] = []
    
    for (let i = 0; i < ranges.length; i++) {
      const range = ranges[i]
      
      onProgress?.({
        currentFile: i + 1,
        totalFiles: ranges.length,
        stage: `Creating split ${i + 1}...`,
        progress: ((i + 1) / ranges.length) * 100
      })
      
      const newPdf = await PDFDocument.create()
      const pagesToCopy = Array.from(
        { length: range.end - range.start + 1 }, 
        (_, idx) => range.start + idx - 1
      )
      
      const copiedPages = await newPdf.copyPages(pdf, pagesToCopy)
      copiedPages.forEach(page => newPdf.addPage(page))
      
      const pdfBytes = await newPdf.save()
      results.push(pdfBytes)
    }
    
    return results
  }
  
  static async extractPages(file: File, pageNumbers: number[], onProgress?: (progress: ProcessingProgress) => void): Promise<Uint8Array> {
    const arrayBuffer = await file.arrayBuffer()
    const pdf = await PDFDocument.load(arrayBuffer)
    
    onProgress?.({
      currentFile: 1,
      totalFiles: 1,
      stage: 'Extracting pages...',
      progress: 50
    })
    
    const newPdf = await PDFDocument.create()
    const pagesToCopy = pageNumbers.map(num => num - 1) // Convert to 0-based index
    
    const copiedPages = await newPdf.copyPages(pdf, pagesToCopy)
    copiedPages.forEach(page => newPdf.addPage(page))
    
    onProgress?.({
      currentFile: 1,
      totalFiles: 1,
      stage: 'Finalizing...',
      progress: 100
    })
    
    return await newPdf.save()
  }
  
  static async removePages(file: File, pageNumbers: number[], onProgress?: (progress: ProcessingProgress) => void): Promise<Uint8Array> {
    const arrayBuffer = await file.arrayBuffer()
    const pdf = await PDFDocument.load(arrayBuffer)
    
    const totalPages = pdf.getPageCount()
    const pagesToKeep = Array.from({ length: totalPages }, (_, i) => i + 1)
      .filter(pageNum => !pageNumbers.includes(pageNum))
    
    onProgress?.({
      currentFile: 1,
      totalFiles: 1,
      stage: 'Removing pages...',
      progress: 50
    })
    
    const newPdf = await PDFDocument.create()
    const pagesToCopy = pagesToKeep.map(num => num - 1) // Convert to 0-based index
    
    const copiedPages = await newPdf.copyPages(pdf, pagesToCopy)
    copiedPages.forEach(page => newPdf.addPage(page))
    
    onProgress?.({
      currentFile: 1,
      totalFiles: 1,
      stage: 'Finalizing...',
      progress: 100
    })
    
    return await newPdf.save()
  }
  
  static async rotatePDF(file: File, rotation: number, pageNumbers?: number[], onProgress?: (progress: ProcessingProgress) => void): Promise<Uint8Array> {
    const arrayBuffer = await file.arrayBuffer()
    const pdf = await PDFDocument.load(arrayBuffer)
    
    onProgress?.({
      currentFile: 1,
      totalFiles: 1,
      stage: 'Rotating pages...',
      progress: 50
    })
    
    const pages = pdf.getPages()
    const pagesToRotate = pageNumbers ? pageNumbers.map(n => n - 1) : pages.map((_, i) => i)
    
    pagesToRotate.forEach(pageIndex => {
      if (pageIndex >= 0 && pageIndex < pages.length) {
        const currentRotation = pages[pageIndex].getRotation().angle
        pages[pageIndex].setRotation(degrees(currentRotation + rotation))
      }
    })
    
    onProgress?.({
      currentFile: 1,
      totalFiles: 1,
      stage: 'Finalizing...',
      progress: 100
    })
    
    return await pdf.save()
  }
  
  static async compressPDF(file: File, quality: 'high' | 'medium' | 'low' = 'medium', onProgress?: (progress: ProcessingProgress) => void): Promise<Uint8Array> {
    // This is a simplified compression - in production you'd want more sophisticated compression
    const arrayBuffer = await file.arrayBuffer()
    const pdf = await PDFDocument.load(arrayBuffer)
    
    onProgress?.({
      currentFile: 1,
      totalFiles: 1,
      stage: 'Compressing PDF...',
      progress: 50
    })
    
    // For now, we'll just re-save the PDF which can reduce size slightly
    // In a production app, you'd implement more sophisticated compression
    const compressedBytes = await pdf.save({
      useObjectStreams: false,
      addDefaultPage: false,
    })
    
    onProgress?.({
      currentFile: 1,
      totalFiles: 1,
      stage: 'Finalizing...',
      progress: 100
    })
    
    return compressedBytes
  }
}

export default PDFProcessor
