import { PDFDocument, rgb } from 'pdf-lib';
import fs from 'fs/promises';

export async function editPDF(filePath: string, editOptions: { pageIndex?: number; text?: string; x?: number; y?: number; size?: number; color?: number[] }): Promise<Buffer> {
  try {
    const pdfBuffer = await fs.readFile(filePath);
    const pdfDoc = await PDFDocument.load(pdfBuffer);
    const pages = pdfDoc.getPages();
    
    const { 
      pageIndex = 0, 
      text = '', 
      x = 100, 
      y = 100, 
      size = 12, 
      color = [0, 0, 0] 
    } = editOptions;
    
    if (pageIndex < pages.length && text) {
      const page = pages[pageIndex];
      const { height } = page.getSize();
      
      // Add text to the specified page
      page.drawText(text, {
        x,
        y: height - y, // Convert to PDF coordinates
        size,
        color: rgb(color[0], color[1], color[2])
      });
    }
    
    const editedBytes = await pdfDoc.save();
    return Buffer.from(editedBytes);
  } catch (err) {
    throw new Error('PDF editing failed: ' + (err as Error).message);
  }
}
