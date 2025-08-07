/**
 * PDF validation utilities for checking file validity and format
 */

export interface PDFValidationResult {
  isValid: boolean;
  error?: string;
  details?: {
    hasValidHeader: boolean;
    isEncrypted: boolean;
    pageCount?: number;
    fileSize: number;
  };
}

/**
 * Validates if a file is a valid PDF document
 */
export async function validatePDF(file: File): Promise<PDFValidationResult> {
  const result: PDFValidationResult = {
    isValid: false,
    details: {
      hasValidHeader: false,
      isEncrypted: false,
      fileSize: file.size
    }
  };

  // Check file extension and MIME type
  const isExpectedPDF = file.type.includes('pdf') || file.name.toLowerCase().endsWith('.pdf');
  if (!isExpectedPDF) {
    result.error = 'File must be a PDF document. Please select a file with .pdf extension.';
    return result;
  }

  // Check file size (max 100MB)
  const maxSize = 100 * 1024 * 1024; // 100MB
  if (file.size > maxSize) {
    result.error = `File is too large (${(file.size / 1024 / 1024).toFixed(1)}MB). Maximum allowed size is 100MB.`;
    return result;
  }

  // Check minimum file size (at least 1KB)
  if (file.size < 1024) {
    result.error = 'File is too small to be a valid PDF document.';
    return result;
  }

  try {
    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);

    // Check PDF header
    const headerBytes = uint8Array.slice(0, 8);
    const header = Array.from(headerBytes)
      .map(byte => String.fromCharCode(byte))
      .join('');

    if (!header.startsWith('%PDF-')) {
      result.error = 'Invalid PDF file: Missing PDF header. This file may be corrupted or not a valid PDF.';
      return result;
    }

    result.details!.hasValidHeader = true;

    // Try to load with PDF-lib for deeper validation
    const { PDFDocument } = await import('pdf-lib');
    
    try {
      const pdf = await PDFDocument.load(arrayBuffer);
      const pageCount = pdf.getPageCount();

      if (pageCount === 0) {
        result.error = 'PDF appears to be empty or corrupted.';
        return result;
      }

      result.details!.pageCount = pageCount;
      result.isValid = true;
      
    } catch (pdfLibError) {
      const errorMessage = pdfLibError instanceof Error ? pdfLibError.message : 'Unknown error';
      
      if (errorMessage.includes('password') || errorMessage.includes('encrypted')) {
        result.details!.isEncrypted = true;
        result.error = 'PDF is password-protected. Please unlock the PDF first.';
      } else if (errorMessage.includes('Invalid PDF')) {
        result.error = 'Invalid or corrupted PDF format.';
      } else {
        result.error = `PDF parsing failed: ${errorMessage}`;
      }
    }

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    result.error = `Failed to read file: ${errorMessage}`;
  }

  return result;
}

/**
 * Checks if a PDF buffer has the correct header
 */
export function hasPDFHeader(buffer: ArrayBuffer): boolean {
  const uint8Array = new Uint8Array(buffer);
  const header = Array.from(uint8Array.slice(0, 8))
    .map(byte => String.fromCharCode(byte))
    .join('');
  return header.startsWith('%PDF-');
}

/**
 * Extracts PDF version from header
 */
export function getPDFVersion(buffer: ArrayBuffer): string | null {
  const uint8Array = new Uint8Array(buffer);
  const header = Array.from(uint8Array.slice(0, 8))
    .map(byte => String.fromCharCode(byte))
    .join('');
  
  const match = header.match(/%PDF-(\d+\.\d+)/);
  return match ? match[1] : null;
}

/**
 * User-friendly error messages for common PDF issues
 */
export const PDF_ERROR_MESSAGES = {
  NO_HEADER: 'This file is not a valid PDF. The PDF header is missing or corrupted.',
  ENCRYPTED: 'This PDF is password-protected. Please unlock it first before processing.',
  CORRUPTED: 'This PDF file appears to be corrupted and cannot be processed.',
  TOO_LARGE: 'File is too large. Please use a PDF smaller than 100MB.',
  TOO_SMALL: 'File is too small to be a valid PDF document.',
  EMPTY: 'This PDF appears to be empty (no pages found).',
  INVALID_FORMAT: 'Invalid PDF format. Please ensure this is a valid PDF file.',
  UNKNOWN: 'An unexpected error occurred while processing the PDF.'
} as const;
