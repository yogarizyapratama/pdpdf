import { PDFDocument } from 'pdf-lib';
import fs from 'fs/promises';

export async function repairPDF(filePath: string): Promise<Buffer> {
  try {
    // Read the PDF file
    const pdfBuffer = await fs.readFile(filePath);
    
    // Try to load and re-save the PDF (basic repair)
    const pdfDoc = await PDFDocument.load(pdfBuffer, { 
      ignoreEncryption: true,
      capNumbers: false 
    });
    
    // Get all pages and recreate them (fixes some corruption issues)
    const pageCount = pdfDoc.getPageCount();
    const newPdfDoc = await PDFDocument.create();
    
    for (let i = 0; i < pageCount; i++) {
      const [copiedPage] = await newPdfDoc.copyPages(pdfDoc, [i]);
      newPdfDoc.addPage(copiedPage);
    }
    
    // Copy metadata
    newPdfDoc.setTitle(pdfDoc.getTitle() || '');
    newPdfDoc.setAuthor(pdfDoc.getAuthor() || '');
    newPdfDoc.setSubject(pdfDoc.getSubject() || '');
    newPdfDoc.setCreator(pdfDoc.getCreator() || '');
    
    const repairedBytes = await newPdfDoc.save();
    return Buffer.from(repairedBytes);
  } catch (err) {
    throw new Error('PDF repair failed: ' + (err as Error).message);
  }
}
