import { PDFDocument, rgb, degrees } from 'pdf-lib';
import fs from 'fs/promises';

export async function addWatermark(filePath: string, watermarkText: string): Promise<Buffer> {
  try {
    const pdfBuffer = await fs.readFile(filePath);
    const pdfDoc = await PDFDocument.load(pdfBuffer);
    const pages = pdfDoc.getPages();
    
    // Add watermark to all pages
    pages.forEach(page => {
      const { width, height } = page.getSize();
      
      // Draw watermark text diagonally across the page
      page.drawText(watermarkText, {
        x: width / 4,
        y: height / 2,
        size: 48,
        color: rgb(0.8, 0.8, 0.8), // Light gray
        rotate: degrees(-45), // Diagonal
        opacity: 0.3
      });
    });
    
    const watermarkedBytes = await pdfDoc.save();
    return Buffer.from(watermarkedBytes);
  } catch (err) {
    throw new Error('PDF watermark failed: ' + (err as Error).message);
  }
}
