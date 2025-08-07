'use client';
import React from 'react';

interface TestPDFButtonProps {
  onFileGenerated: (file: File) => void;
}

const TestPDFButton: React.FC<TestPDFButtonProps> = ({ onFileGenerated }) => {
  const generateTestPDF = async () => {
    try {
      const { PDFDocument, rgb } = await import('pdf-lib');
      
      // Create a simple multi-page PDF for testing
      const pdfDoc = await PDFDocument.create();
      
      // Add 5 pages with different content
      for (let i = 1; i <= 5; i++) {
        const page = pdfDoc.addPage([595, 842]); // A4 size
        const { width, height } = page.getSize();
        
        page.drawText(`Test Page ${i}`, {
          x: 50,
          y: height - 100,
          size: 30,
          color: rgb(0, 0, 0),
        });
        
        page.drawText(`This is a sample PDF generated for testing.`, {
          x: 50,
          y: height - 150,
          size: 14,
          color: rgb(0.3, 0.3, 0.3),
        });
        
        page.drawText(`Page ${i} of 5`, {
          x: 50,
          y: height - 180,
          size: 12,
          color: rgb(0.5, 0.5, 0.5),
        });
        
        // Add some sample content
        const sampleText = [
          'This is sample content to demonstrate PDF splitting.',
          'You can split this PDF by pages or page ranges.',
          'Each page contains different content for testing.',
          '',
          'Features you can test:',
          '• Split by individual pages',
          '• Split by custom page ranges',
          '• Preview pages before splitting',
          '',
          'This PDF is generated dynamically for testing purposes.'
        ];
        
        let yPosition = height - 250;
        sampleText.forEach(line => {
          page.drawText(line, {
            x: 50,
            y: yPosition,
            size: 12,
            color: rgb(0, 0, 0),
          });
          yPosition -= 20;
        });
      }
      
      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const file = new File([blob], 'test-document.pdf', { type: 'application/pdf' });
      
      onFileGenerated(file);
    } catch (error) {
      console.error('Failed to generate test PDF:', error);
    }
  };

  return (
    <button
      onClick={generateTestPDF}
      className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm font-medium"
      title="Generate a sample PDF for testing"
    >
      <span>🧪</span>
      <span>Use Sample PDF</span>
    </button>
  );
};

export default TestPDFButton;
