import { PDFDocument } from 'pdf-lib';
import fs from 'fs/promises';

export async function cropPDF(filePath: string, cropOptions: { left: number; top: number; width: number; height: number }): Promise<Buffer> {
  try {
    const pdfBuffer = await fs.readFile(filePath);
    const pdfDoc = await PDFDocument.load(pdfBuffer);
    const pages = pdfDoc.getPages();
    
    const { left = 0, top = 0, width = 200, height = 200 } = cropOptions;
    
    // Crop all pages
    pages.forEach(page => {
      const { width: pageWidth, height: pageHeight } = page.getSize();
      
      // Set crop box (MediaBox in PDF terms)
      page.setCropBox(
        left,
        pageHeight - top - height, // PDF coordinates are bottom-up
        width,
        height
      );
    });
    
    const croppedBytes = await pdfDoc.save();
    return Buffer.from(croppedBytes);
  } catch (err) {
    throw new Error('PDF crop failed: ' + (err as Error).message);
  }
}
