'use client';

import { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';

interface PDFBeforeAfterPreviewProps {
  pdfFile: File;
  format: string;
  position: string;
  fontSize: number;
  startNumber: number;
  totalPages: number;
}

export default function PDFBeforeAfterPreview({ 
  pdfFile, 
  format, 
  position, 
  fontSize, 
  startNumber, 
  totalPages 
}: PDFBeforeAfterPreviewProps) {
  const [numPages, setNumPages] = useState<number>(0);
  const [selectedPage, setSelectedPage] = useState<number>(1);

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
        return String.fromCharCode(96 + pageNum);
      case 'A':
        return String.fromCharCode(64 + pageNum);
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

  const currentPageNum = startNumber + selectedPage - 1;
  const displayText = formatPageNumber(currentPageNum, totalPages, format);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
          🔄 Before & After Comparison
        </h4>
        <div className="flex items-center space-x-2">
          <select
            value={selectedPage}
            onChange={(e) => setSelectedPage(Number(e.target.value))}
            className="px-2 py-1 bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded text-sm"
          >
            {Array.from({ length: Math.min(numPages, 5) }, (_, i) => (
              <option key={i + 1} value={i + 1}>
                Page {i + 1}
              </option>
            ))}
          </select>
        </div>
      </div>

      <Document
        file={pdfFile}
        onLoadSuccess={onDocumentLoadSuccess}
        loading={
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="w-full h-48 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            </div>
            <div className="w-full h-48 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            </div>
          </div>
        }
        error={
          <div className="text-center text-red-600 dark:text-red-400 p-4">
            Failed to load comparison preview
          </div>
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* BEFORE */}
          <div className="text-center">
            <h5 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
              ❌ BEFORE (Original)
            </h5>
            <div className="relative inline-block">
              <Page
                pageNumber={selectedPage}
                width={200}
                className="border-2 border-gray-300 dark:border-gray-600 rounded-lg"
              />
            </div>
          </div>

          {/* AFTER */}
          <div className="text-center">
            <h5 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
              ✅ AFTER (With Page Numbers)
            </h5>
            <div className="relative inline-block">
              <Page
                pageNumber={selectedPage}
                width={200}
                className="border-2 border-green-400 dark:border-green-500 rounded-lg"
              />
              
              {/* Page Number Overlay */}
              <div 
                className={`${getPositionClasses(position)} bg-green-500 text-white px-2 py-1 rounded shadow-lg font-medium z-10`}
                style={{ fontSize: `${fontSize}px` }}
              >
                {displayText}
              </div>
            </div>
          </div>
        </div>
      </Document>

      <div className="mt-3 text-xs text-gray-500 dark:text-gray-400 text-center">
        💡 Green overlay shows the page number that will be added to your PDF
      </div>
    </div>
  );
}
