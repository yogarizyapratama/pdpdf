export interface ProcessingProgress {
  currentFile: number
  totalFiles: number
  stage: string
  progress: number
}

export class PDFProcessor {
  static async mergePDFs(files: File[], onProgress?: (progress: ProcessingProgress) => void): Promise<Uint8Array> {
    const { PDFDocument } = await import('pdf-lib')
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
      copiedPages.forEach((page: any) => mergedPdf.addPage(page))
    }
    
    return await mergedPdf.save()
  }

  static async splitPDF(file: File, pageNumbers: number[], onProgress?: (progress: ProcessingProgress) => void): Promise<Uint8Array> {
    const { PDFDocument } = await import('pdf-lib')
    const arrayBuffer = await file.arrayBuffer()
    const pdf = await PDFDocument.load(arrayBuffer)
    
    onProgress?.({
      currentFile: 1,
      totalFiles: 1,
      stage: `Extracting ${pageNumbers.length} pages...`,
      progress: 50
    })
    
    const newPdf = await PDFDocument.create()
    
    // Convert 1-based page numbers to 0-based indices
    const pageIndices = pageNumbers.map(num => num - 1)
    const copiedPages = await newPdf.copyPages(pdf, pageIndices)
    copiedPages.forEach((page: any) => newPdf.addPage(page))
    
    onProgress?.({
      currentFile: 1,
      totalFiles: 1,
      stage: 'Finalizing PDF...',
      progress: 100
    })
    
    return await newPdf.save()
  }

  static async splitPDFByRanges(file: File, ranges: Array<{start: number, end: number}>, onProgress?: (progress: ProcessingProgress) => void): Promise<Uint8Array[]> {
    const { PDFDocument } = await import('pdf-lib')
    const arrayBuffer = await file.arrayBuffer()
    const sourcePdf = await PDFDocument.load(arrayBuffer)
    const results: Uint8Array[] = []
    
    for (let i = 0; i < ranges.length; i++) {
      const range = ranges[i]
      
      onProgress?.({
        currentFile: i + 1,
        totalFiles: ranges.length,
        stage: `Creating PDF ${i + 1} (pages ${range.start}-${range.end})...`,
        progress: ((i + 1) / ranges.length) * 100
      })
      
      const newPdf = await PDFDocument.create()
      const pageNumbers = []
      
      // Generate page numbers for this range
      for (let page = range.start; page <= range.end; page++) {
        pageNumbers.push(page - 1) // Convert to 0-based index
      }
      
      const copiedPages = await newPdf.copyPages(sourcePdf, pageNumbers)
      copiedPages.forEach((page: any) => newPdf.addPage(page))
      
      const pdfBytes = await newPdf.save()
      results.push(pdfBytes)
    }
    
    return results
  }

  static async removePagesFromPDF(file: File, pageNumbers: number[], onProgress?: (progress: ProcessingProgress) => void): Promise<Uint8Array> {
    const { PDFDocument } = await import('pdf-lib')
    const arrayBuffer = await file.arrayBuffer()
    const pdf = await PDFDocument.load(arrayBuffer)
    
    onProgress?.({
      currentFile: 1,
      totalFiles: 1,
      stage: `Removing ${pageNumbers.length} pages...`,
      progress: 50
    })
    
    const newPdf = await PDFDocument.create()
    const totalPages = pdf.getPageCount()
    
    // Get indices of pages to keep (all pages except the ones to remove)
    const pagesToKeep = []
    for (let i = 0; i < totalPages; i++) {
      if (!pageNumbers.includes(i + 1)) {
        pagesToKeep.push(i)
      }
    }
    
    const copiedPages = await newPdf.copyPages(pdf, pagesToKeep)
    copiedPages.forEach((page: any) => newPdf.addPage(page))
    
    onProgress?.({
      currentFile: 1,
      totalFiles: 1,
      stage: 'Finalizing PDF...',
      progress: 100
    })
    
    return await newPdf.save()
  }

  static async rotatePDF(file: File, rotation: number, pageNumbers?: number[], onProgress?: (progress: ProcessingProgress) => void): Promise<Uint8Array> {
    const { PDFDocument, degrees } = await import('pdf-lib')
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
    
    pagesToRotate.forEach((pageIndex: number) => {
      const page = pages[pageIndex]
      if (page) {
        const currentRotation = page.getRotation().angle
        page.setRotation(degrees(currentRotation + rotation))
      }
    })
    
    onProgress?.({
      currentFile: 1,
      totalFiles: 1,
      stage: 'Finalizing PDF...',
      progress: 100
    })
    
    return await pdf.save()
  }

  static async compressPDF(file: File, quality: number = 0.5, onProgress?: (progress: ProcessingProgress) => void): Promise<Uint8Array> {
    const { PDFDocument } = await import('pdf-lib')
    const arrayBuffer = await file.arrayBuffer()
    const pdf = await PDFDocument.load(arrayBuffer)
    
    onProgress?.({
      currentFile: 1,
      totalFiles: 1,
      stage: 'Compressing PDF...',
      progress: 50
    })

    // Note: pdf-lib doesn't have built-in compression
    // This is a placeholder that returns the PDF as-is
    // For actual compression, you'd need additional libraries or server-side processing
    
    onProgress?.({
      currentFile: 1,
      totalFiles: 1,
      stage: 'Finalizing PDF...',
      progress: 100
    })

    return await pdf.save()
  }

  static async extractPages(file: File, pageNumbers: number[], onProgress?: (progress: ProcessingProgress) => void): Promise<Uint8Array> {
    return await this.splitPDF(file, pageNumbers, onProgress)
  }
}
