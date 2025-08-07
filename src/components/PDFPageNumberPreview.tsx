'use client';

import { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';

interface PDFPageNumberPreviewProps {
  pdfFile: File;
  format: string;
  position: string;
  fontSize: number;
  startNumber: number;
  totalPages: number;
}

export default function PDFPageNumberPreview({ 
  pdfFile, 
  format, 
  position, 
  fontSize, 
  startNumber, 
  totalPages 
}: PDFPageNumberPreviewProps) {
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(1);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
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

  function getPositionClasses(position: string): string {
    const positions = {
      'top-left': 'absolute top-2 left-2',
      'top-center': 'absolute top-2 left-1/2 transform -translate-x-1/2',
      'top-right': 'absolute top-2 right-2',
      'bottom-left': 'absolute bottom-2 left-2',
      'bottom-center': 'absolute bottom-2 left-1/2 transform -translate-x-1/2',
      'bottom-right': 'absolute bottom-2 right-2'
    };
    return positions[position as keyof typeof positions] || positions['bottom-center'];
  }

  const currentPageNum = startNumber + pageNumber - 1;
  const displayText = formatPageNumber(currentPageNum, totalPages, format);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
          📄 Live PDF Preview with Page Numbers
        </h4>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setPageNumber(Math.max(1, pageNumber - 1))}
            disabled={pageNumber <= 1}
            className="px-2 py-1 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded disabled:opacity-50 text-sm"
          >
            ←
          </button>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {pageNumber} / {numPages}
          </span>
          <button
            onClick={() => setPageNumber(Math.min(numPages, pageNumber + 1))}
            disabled={pageNumber >= numPages}
            className="px-2 py-1 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded disabled:opacity-50 text-sm"
          >
            →
          </button>
        </div>
      </div>

      <div className="relative inline-block">
        <Document
          file={pdfFile}
          onLoadSuccess={onDocumentLoadSuccess}
          loading={
            <div className="w-full h-64 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-gray-600 dark:text-gray-400">Loading PDF...</span>
            </div>
          }
          error={
            <div className="text-center text-red-600 dark:text-red-400 p-4">
              Failed to load PDF preview
            </div>
          }
        >
          <div className="relative">
            <Page
              pageNumber={pageNumber}
              width={300}
              className="border border-gray-300 dark:border-gray-600 rounded-lg"
            />
            
            {/* Page Number Overlay */}
            <div 
              className={`${getPositionClasses(position)} bg-red-500 text-white px-2 py-1 rounded shadow-lg font-medium z-10`}
              style={{ fontSize: `${fontSize}px` }}
            >
              {displayText}
            </div>
          </div>
        </Document>
      </div>

      <div className="mt-3 text-xs text-gray-500 dark:text-gray-400">
        💡 Red overlay shows where page numbers will be placed
      </div>
    </div>
  );
}
