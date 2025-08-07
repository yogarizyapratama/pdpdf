/**
 * Dynamic PDF library loader to handle chunk loading issues
 * This module provides a safe way to load PDF libraries with proper error handling
 */

// Type definitions for better TypeScript support
export type { PDFDocument, PDFPage } from 'pdf-lib';

// Dynamic import wrapper for pdf-lib
export const loadPDFLib = async () => {
  try {
    const pdfLib = await import('pdf-lib');
    return pdfLib;
  } catch (error) {
    console.error('Failed to load pdf-lib:', error);
    throw new Error('PDF library could not be loaded. Please refresh and try again.');
  }
};

// Pre-loaded common pdf-lib exports
export const createPDFDocument = async () => {
  const { PDFDocument } = await loadPDFLib();
  return PDFDocument.create();
};

export const loadPDFDocument = async (pdfBytes: ArrayBuffer) => {
  const { PDFDocument } = await loadPDFLib();
  return PDFDocument.load(pdfBytes);
};

// Utility function to handle PDF operations with retry logic
export const withPDFRetry = async <T>(
  operation: () => Promise<T>,
  maxRetries: number = 3
): Promise<T> => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      if (attempt === maxRetries) {
        throw error;
      }
      
      // Wait before retry (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
      console.warn(`PDF operation failed, retrying... (${attempt}/${maxRetries})`);
    }
  }
  throw new Error('Max retries exceeded');
};

// Export commonly used pdf-lib utilities dynamically
export const getPDFUtils = async () => {
  const { rgb, degrees } = await loadPDFLib();
  return { rgb, degrees };
};

// Default export for backward compatibility
export default {
  loadPDFLib,
  createPDFDocument,
  loadPDFDocument,
  withPDFRetry,
  getPDFUtils,
};
