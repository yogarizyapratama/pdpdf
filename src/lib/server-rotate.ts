import { PDFDocument, degrees } from 'pdf-lib';
import fs from 'fs/promises';

export async function rotatePDF(filePath: string, rotationDegrees: number): Promise<Buffer> {
  try {
    const pdfBuffer = await fs.readFile(filePath);
    const pdfDoc = await PDFDocument.load(pdfBuffer);
    const pages = pdfDoc.getPages();
    
    // Rotate all pages by the specified degrees
    pages.forEach(page => {
      page.setRotation(degrees(rotationDegrees));
    });
    
    const rotatedBytes = await pdfDoc.save();
    return Buffer.from(rotatedBytes);
  } catch (err) {
    throw new Error('PDF rotation failed: ' + (err as Error).message);
  }
}
