import { PDFDocument, rgb } from 'pdf-lib';
import fs from 'fs/promises';

export interface PageNumberOptions {
  format: string;
  position: string;
  fontSize: number;
  startNumber: number;
}

function formatPageNumber(pageNum: number, totalPages: number, format: string): string {
  switch (format) {
    case '1':
      return pageNum.toString();
    case 'i':
      return toRomanLower(pageNum);
    case 'I':
      return toRomanUpper(pageNum);
    case 'a':
      return String.fromCharCode(96 + pageNum); // a, b, c...
    case 'A':
      return String.fromCharCode(64 + pageNum); // A, B, C...
    case 'page-1':
      return `Page ${pageNum}`;
    case '1-of-total':
      return `${pageNum} of ${totalPages}`;
    default:
      return pageNum.toString();
  }
}

function toRomanLower(num: number): string {
  const values = [1000, 900, 500, 400, 100, 90, 50, 40, 10, 9, 5, 4, 1];
  const symbols = ['m', 'cm', 'd', 'cd', 'c', 'xc', 'l', 'xl', 'x', 'ix', 'v', 'iv', 'i'];
  let result = '';
  for (let i = 0; i < values.length; i++) {
    while (num >= values[i]) {
      result += symbols[i];
      num -= values[i];
    }
  }
  return result;
}

function toRomanUpper(num: number): string {
  return toRomanLower(num).toUpperCase();
}

function getTextPosition(pageWidth: number, pageHeight: number, position: string, textWidth: number): { x: number; y: number } {
  const margin = 30;
  
  switch (position) {
    case 'top-left':
      return { x: margin, y: pageHeight - margin };
    case 'top-center':
      return { x: (pageWidth - textWidth) / 2, y: pageHeight - margin };
    case 'top-right':
      return { x: pageWidth - textWidth - margin, y: pageHeight - margin };
    case 'bottom-left':
      return { x: margin, y: margin };
    case 'bottom-center':
      return { x: (pageWidth - textWidth) / 2, y: margin };
    case 'bottom-right':
      return { x: pageWidth - textWidth - margin, y: margin };
    default:
      return { x: (pageWidth - textWidth) / 2, y: margin };
  }
}

export async function addPageNumbers(filePath: string, options: PageNumberOptions = {
  format: '1',
  position: 'bottom-center', 
  fontSize: 12,
  startNumber: 1
}): Promise<Buffer> {
  try {
    console.log('Reading PDF file from:', filePath);
    
    // Check if file exists
    try {
      await fs.access(filePath);
    } catch (error) {
      throw new Error(`File not found: ${filePath}`);
    }
    
    const pdfBuffer = await fs.readFile(filePath);
    console.log('PDF file read, size:', pdfBuffer.length);
    
    if (pdfBuffer.length === 0) {
      throw new Error('PDF file is empty');
    }
    
    const pdfDoc = await PDFDocument.load(pdfBuffer);
    const pages = pdfDoc.getPages();
    
    console.log('PDF loaded, page count:', pages.length);
    
    if (pages.length === 0) {
      throw new Error('PDF has no pages');
    }
    
    // Add page numbers to all pages
    pages.forEach((page, index) => {
      try {
        const { width, height } = page.getSize();
        const actualPageNumber = options.startNumber + index;
        const pageNumberText = formatPageNumber(actualPageNumber, pages.length, options.format);
        
        console.log(`Adding page number "${pageNumberText}" to page ${index + 1}`);
        
        // Estimate text width (rough calculation)
        const textWidth = pageNumberText.length * options.fontSize * 0.6;
        const position = getTextPosition(width, height, options.position, textWidth);
        
        // Add page number at specified position
        page.drawText(pageNumberText, {
          x: position.x,
          y: position.y,
          size: options.fontSize,
          color: rgb(0, 0, 0)
        });
      } catch (pageError) {
        console.error(`Error adding number to page ${index + 1}:`, pageError);
        throw new Error(`Failed to add page number to page ${index + 1}: ${pageError}`);
      }
    });
    
    console.log('Page numbers added, saving PDF...');
    const numberedBytes = await pdfDoc.save();
    console.log('PDF saved, final size:', numberedBytes.length);
    
    // Clean up the temporary file
    try {
      await fs.unlink(filePath);
      console.log('Temporary file cleaned up:', filePath);
    } catch (cleanupError) {
      console.warn('Failed to cleanup temp file:', cleanupError);
      // Don't throw error for cleanup failure
    }
    
    return Buffer.from(numberedBytes);
  } catch (err) {
    console.error('Page numbering error:', err);
    throw new Error('PDF page numbering failed: ' + (err as Error).message);
  }
}
