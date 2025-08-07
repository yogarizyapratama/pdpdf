'use client';

import { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';

interface PDFPageNumberGridPreviewProps {
  pdfFile: File;
  format: string;
  position: string;
  fontSize: number;
  startNumber: number;
  totalPages: number;
  maxPages?: number;
}

export default function PDFPageNumberGridPreview({ 
  pdfFile, 
  format, 
  position, 
  fontSize, 
  startNumber, 
  totalPages,
  maxPages = 4
}: PDFPageNumberGridPreviewProps) {
  const [numPages, setNumPages] = useState<number>(0);

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
      'top-left': 'absolute top-1 left-1',
      'top-center': 'absolute top-1 left-1/2 transform -translate-x-1/2',
      'top-right': 'absolute top-1 right-1',
      'bottom-left': 'absolute bottom-1 left-1',
      'bottom-center': 'absolute bottom-1 left-1/2 transform -translate-x-1/2',
      'bottom-right': 'absolute bottom-1 right-1'
    };
    return positions[position as keyof typeof positions] || positions['bottom-center'];
  }

  const pagesToShow = Math.min(maxPages, numPages, totalPages);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
        📑 Grid Preview - Multiple Pages with Numbers
      </h4>

      <Document
        file={pdfFile}
        onLoadSuccess={onDocumentLoadSuccess}
        loading={
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {Array.from({ length: maxPages }, (_, i) => (
              <div key={i} className="w-full h-32 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              </div>
            ))}
          </div>
        }
        error={
          <div className="text-center text-red-600 dark:text-red-400 p-4">
            Failed to load PDF grid preview
          </div>
        }
      >
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {Array.from({ length: pagesToShow }, (_, index) => {
            const pageNum = startNumber + index;
            const displayText = formatPageNumber(pageNum, totalPages, format);
            const scaledFontSize = Math.max(6, fontSize * 0.4); // Scale down for thumbnail

            return (
              <div key={index + 1} className="relative">
                <Page
                  pageNumber={index + 1}
                  width={120}
                  className="border border-gray-300 dark:border-gray-600 rounded-lg"
                />
                
                {/* Page Number Overlay */}
                <div 
                  className={`${getPositionClasses(position)} bg-red-500 text-white px-1 py-0.5 rounded text-xs font-medium z-10 shadow-lg`}
                  style={{ fontSize: `${scaledFontSize}px` }}
                >
                  {displayText}
                </div>

                {/* Page indicator */}
                <div className="absolute top-1 left-1 bg-black bg-opacity-75 text-white text-xs px-1 py-0.5 rounded">
                  {index + 1}
                </div>
              </div>
            );
          })}
        </div>
      </Document>

      {totalPages > maxPages && (
        <div className="text-center mt-2 text-xs text-gray-500 dark:text-gray-400">
          ... and {totalPages - maxPages} more pages
        </div>
      )}

      <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
        💡 Red overlays show page number placement. Black badges show page position.
      </div>
    </div>
  );
}
