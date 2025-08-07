'use client';

import { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';

interface PDFResultPreviewProps {
  pdfUrl: string;
  totalPages: number;
  onClose: () => void;
}

export default function PDFResultPreview({ pdfUrl, totalPages, onClose }: PDFResultPreviewProps) {
  const [numPages, setNumPages] = useState<number>(0);
  const [loadedPages, setLoadedPages] = useState<number>(0);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
  }

  function onPageLoadSuccess() {
    setLoadedPages(prev => prev + 1);
  }

  const maxPreviewPages = Math.min(6, numPages);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-6xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Numbered PDF Preview ({numPages} pages)
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-xl"
          >
            ✕
          </button>
        </div>
        
        <div className="overflow-auto max-h-[70vh] p-4">
          <Document
            file={pdfUrl}
            onLoadSuccess={onDocumentLoadSuccess}
            loading={
              <div className="flex justify-center items-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-2 text-gray-600 dark:text-gray-400">Loading PDF...</span>
              </div>
            }
            error={
              <div className="text-center text-red-600 dark:text-red-400 p-4">
                Failed to load PDF. Please try again.
              </div>
            }
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: maxPreviewPages }, (_, index) => (
                <div key={index + 1} className="relative">
                  <Page
                    pageNumber={index + 1}
                    width={200}
                    onLoadSuccess={onPageLoadSuccess}
                    loading={
                      <div className="w-full h-64 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                      </div>
                    }
                    className="border border-gray-200 dark:border-gray-600 rounded-lg"
                  />
                  <div className="absolute bottom-2 left-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
                    Page {index + 1}
                  </div>
                </div>
              ))}
            </div>
          </Document>
          
          {numPages > maxPreviewPages && (
            <div className="text-center mt-4 text-gray-600 dark:text-gray-400">
              ... and {numPages - maxPreviewPages} more pages
            </div>
          )}
          
          <div className="text-center mt-6">
            <a
              href={pdfUrl}
              download="numbered.pdf"
              className="inline-flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg transition-colors"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>Download Full PDF</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
