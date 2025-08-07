import { PDFDocument, rgb } from 'pdf-lib';
import fs from 'fs/promises';

interface Signature {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  dataURL: string;
}

export async function signPDF(filePath: string, signatures: Signature[]): Promise<Buffer> {
  try {
    const pdfBuffer = await fs.readFile(filePath);
    const pdfDoc = await PDFDocument.load(pdfBuffer);
    const pages = pdfDoc.getPages();
    
    for (const signature of signatures) {
      if (pages.length > 0) {
        const page = pages[0]; // For now, add all signatures to first page
        const { height } = page.getSize();
        
        // Convert signature data URL to image if needed
        // For now, we'll add a text placeholder
        const signatureText = 'Digital Signature';
        
        page.drawText(signatureText, {
          x: signature.x,
          y: height - signature.y - signature.height,
          size: 12,
          color: rgb(0, 0, 0.8) // Blue for signature
        });
        
        // Add signature date
        const date = new Date().toLocaleDateString();
        page.drawText(`Signed: ${date}`, {
          x: signature.x,
          y: height - signature.y - signature.height - 15,
          size: 8,
          color: rgb(0.5, 0.5, 0.5)
        });
      }
    }
    
    const signedBytes = await pdfDoc.save();
    return Buffer.from(signedBytes);
  } catch (err) {
    throw new Error('PDF signing failed: ' + (err as Error).message);
  }
}
