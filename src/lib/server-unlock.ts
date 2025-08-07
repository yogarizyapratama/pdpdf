import { PDFDocument } from 'pdf-lib';
import fs from 'fs/promises';

export async function unlockPDF(filePath: string, password: string): Promise<Buffer> {
  try {
    const pdfBuffer = await fs.readFile(filePath);
    
    // Load PDF (pdf-lib doesn't support password-protected PDFs directly)
    // This is a basic implementation - for production use qpdf or similar
    const pdfDoc = await PDFDocument.load(pdfBuffer, { 
      ignoreEncryption: true 
    });
    
    // Save without encryption
    const unlockedBytes = await pdfDoc.save();
    return Buffer.from(unlockedBytes);
  } catch (err) {
    throw new Error('PDF unlock failed: ' + (err as Error).message);
  }
}
