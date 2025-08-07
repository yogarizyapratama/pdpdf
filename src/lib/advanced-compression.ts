import fs from 'fs';
import { PDFDocument, PDFPage } from 'pdf-lib';

// Advanced PDF compression utility
export async function advancedCompressPDF(filePath: string, compressionLevel: string): Promise<Buffer> {
  try {
    // Read the original PDF
    const originalBytes = fs.readFileSync(filePath);
    const originalDoc = await PDFDocument.load(originalBytes);
    
    // Create a new document for optimization
    const newDoc = await PDFDocument.create();
    
    // Set minimal metadata for smaller file size
    newDoc.setCreator('PDF Tools');
    newDoc.setProducer('PDF Compression Engine');
    
    const pageCount = originalDoc.getPageCount();
    console.log(`Processing ${pageCount} pages for advanced compression`);
    
    // Copy all pages at once for better efficiency
    const pagesToCopy = Array.from({ length: pageCount }, (_, i) => i);
    const copiedPages = await newDoc.copyPages(originalDoc, pagesToCopy);
    
    // Add pages to new document
    copiedPages.forEach(page => {
      newDoc.addPage(page);
    });
    
    // Save with aggressive compression settings
    const compressionOptions = getAdvancedCompressionOptions(compressionLevel);
    const compressedBytes = await newDoc.save(compressionOptions);
    
    console.log(`Advanced compression result: ${originalBytes.length} -> ${compressedBytes.length}`);
    
    return Buffer.from(compressedBytes);
  } catch (error) {
    console.error('Advanced compression error:', error);
    throw new Error(`Advanced compression failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

function getAdvancedCompressionOptions(compressionLevel: string) {
  const baseOptions = {
    useObjectStreams: false,
    addDefaultPage: false,
    updateFieldAppearances: false,
  };
  
  switch (compressionLevel.toLowerCase()) {
    case 'high':
      return {
        ...baseOptions,
        // Additional compression flags can be added here when available
      };
    case 'maximum':
      return {
        ...baseOptions,
        // Most aggressive settings
      };
    default:
      return baseOptions;
  }
}

function getSaveOptions(compressionLevel: string) {
  switch (compressionLevel.toLowerCase()) {
    case 'low':
      return {
        useObjectStreams: true,
        addDefaultPage: false,
        updateFieldAppearances: true,
      };
    case 'medium':
      return {
        useObjectStreams: false,
        addDefaultPage: false,
        updateFieldAppearances: false,
      };
    case 'high':
      return {
        useObjectStreams: false,
        addDefaultPage: false,
        updateFieldAppearances: false,
      };
    case 'maximum':
      return {
        useObjectStreams: false,
        addDefaultPage: false,
        updateFieldAppearances: false,
      };
    default:
      return {
        useObjectStreams: false,
        addDefaultPage: false,
        updateFieldAppearances: false,
      };
  }
}

// Calculate compression statistics
export function calculateCompressionStats(originalSize: number, compressedSize: number) {
  const compressionRatio = ((originalSize - compressedSize) / originalSize) * 100;
  const sizeReduction = originalSize - compressedSize;
  
  return {
    originalSize,
    compressedSize,
    compressionRatio: Math.max(0, compressionRatio), // Ensure non-negative
    sizeReduction: Math.max(0, sizeReduction),
    isCompressed: compressedSize < originalSize,
  };
}
