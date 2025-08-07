import { NextApiRequest, NextApiResponse } from 'next';
import formidable from 'formidable';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import fs from 'fs/promises';
import { createCanvas, loadImage } from 'canvas';
import Tesseract from 'tesseract.js';

export const config = {
  api: {
    bodyParser: false,
    responseLimit: '100mb',
  },
};

interface OCROptions {
  language?: string;
  preserveLayout?: boolean;
  addSearchableLayer?: boolean;
  confidence?: number;
  enhanceImage?: boolean;
  outputFormat?: 'text' | 'searchable-pdf' | 'both';
}

interface OCRResult {
  text: string;
  confidence: number;
  blocks: Array<{
    text: string;
    bbox: { x0: number; y0: number; x1: number; y1: number };
    confidence: number;
  }>;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const form = formidable({
      maxFileSize: 100 * 1024 * 1024, // 100MB
    });

    const [fields, files] = await form.parse(req);
    
    const options: OCROptions = {
      language: fields.language?.[0] || 'eng',
      preserveLayout: fields.preserveLayout?.[0] === 'true',
      addSearchableLayer: fields.addSearchableLayer?.[0] === 'true',
      confidence: parseInt(fields.confidence?.[0] || '80'),
      enhanceImage: fields.enhanceImage?.[0] === 'true',
      outputFormat: (fields.outputFormat?.[0] as any) || 'searchable-pdf',
    };

    const file = Array.isArray(files.file) ? files.file[0] : files.file;
    
    if (!file || !file.filepath) {
      return res.status(400).json({ error: 'No file provided' });
    }

    const fileBuffer = await fs.readFile(file.filepath);
    let imagesToProcess: Buffer[] = [];

    // Handle different file types
    if (file.mimetype === 'application/pdf') {
      // Convert PDF pages to images for OCR
      const pdfDoc = await PDFDocument.load(fileBuffer);
      const pageCount = pdfDoc.getPageCount();
      
      // For this example, we'll assume we have a PDF-to-image conversion utility
      // In a real implementation, you'd use pdf2pic or similar
      for (let i = 0; i < Math.min(pageCount, 10); i++) { // Limit to 10 pages
        // This would need actual PDF to image conversion
        // For now, we'll skip this part
      }
    } else if (file.mimetype?.startsWith('image/')) {
      imagesToProcess.push(fileBuffer);
    } else {
      return res.status(400).json({ error: 'Unsupported file type' });
    }

    // If no images from PDF, process as image
    if (imagesToProcess.length === 0 && file.mimetype?.startsWith('image/')) {
      imagesToProcess.push(fileBuffer);
    }

    const ocrResults: OCRResult[] = [];

    // Process each image with Tesseract
    for (let i = 0; i < imagesToProcess.length; i++) {
      const imageBuffer = imagesToProcess[i];
      
      try {
        // Enhance image if requested
        let processedBuffer = imageBuffer;
        if (options.enhanceImage) {
          processedBuffer = await enhanceImageForOCR(imageBuffer);
        }

        // Perform OCR
        const { data } = await Tesseract.recognize(processedBuffer, options.language || 'eng', {
          logger: (m) => console.log(m),
        });

        // Filter by confidence
        const blocks = (data.blocks || [])
          .filter(block => block.confidence >= (options.confidence || 80))
          .map(block => ({
            text: block.text,
            bbox: block.bbox,
            confidence: block.confidence,
          }));

        ocrResults.push({
          text: data.text,
          confidence: data.confidence,
          blocks,
        });

      } catch (error) {
        console.error(`OCR error for image ${i}:`, error);
        ocrResults.push({
          text: '',
          confidence: 0,
          blocks: [],
        });
      }
    }

    // Generate output based on format requested
    if (options.outputFormat === 'text') {
      const allText = ocrResults.map(result => result.text).join('\n\n--- Page Break ---\n\n');
      
      await fs.unlink(file.filepath);
      
      return res.status(200).json({
        success: true,
        text: allText,
        confidence: ocrResults.reduce((sum, r) => sum + r.confidence, 0) / ocrResults.length,
        pageCount: ocrResults.length,
      });
    }

    // Create searchable PDF
    const pdfDoc = await PDFDocument.create();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

    for (let i = 0; i < ocrResults.length; i++) {
      const result = ocrResults[i];
      const page = pdfDoc.addPage([595, 842]); // A4 size
      
      if (options.addSearchableLayer && result.blocks.length > 0) {
        // Add invisible text layer for searchability
        result.blocks.forEach(block => {
          if (block.text.trim()) {
            page.drawText(block.text, {
              x: block.bbox.x0,
              y: 842 - block.bbox.y1, // Flip Y coordinate
              size: 1, // Very small, invisible
              font: font,
              color: rgb(1, 1, 1), // White text (invisible)
              opacity: 0,
            });
          }
        });
      }

      // Add visible text if preserveLayout is false
      if (!options.preserveLayout) {
        const lines = result.text.split('\n');
        let yPosition = 800;
        
        lines.forEach(line => {
          if (line.trim() && yPosition > 50) {
            page.drawText(line, {
              x: 50,
              y: yPosition,
              size: 12,
              font: font,
              color: rgb(0, 0, 0),
            });
            yPosition -= 20;
          }
        });
      }
    }

    // Set metadata
    pdfDoc.setTitle('OCR Processed Document');
    pdfDoc.setCreator('PDF All-in-One OCR');
    pdfDoc.setProducer('PDF All-in-One Advanced OCR');
    pdfDoc.setCreationDate(new Date());

    const pdfBytes = await pdfDoc.save();

    // Clean up
    await fs.unlink(file.filepath);

    if (options.outputFormat === 'both') {
      const allText = ocrResults.map(result => result.text).join('\n\n--- Page Break ---\n\n');
      
      return res.status(200).json({
        success: true,
        text: allText,
        pdf: Buffer.from(pdfBytes).toString('base64'),
        confidence: ocrResults.reduce((sum, r) => sum + r.confidence, 0) / ocrResults.length,
        pageCount: ocrResults.length,
      });
    }

    // Return searchable PDF
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="ocr-processed.pdf"');
    
    return res.status(200).send(Buffer.from(pdfBytes));

  } catch (error) {
    console.error('Advanced OCR error:', error);
    return res.status(500).json({ 
      error: 'Failed to process OCR',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

async function enhanceImageForOCR(imageBuffer: Buffer): Promise<Buffer> {
  try {
    // Load image with canvas
    const image = await loadImage(imageBuffer);
    const canvas = createCanvas(image.width, image.height);
    const ctx = canvas.getContext('2d');
    
    // Draw original image
    ctx.drawImage(image, 0, 0);
    
    // Get image data for processing
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    
    // Apply simple enhancement: increase contrast and convert to grayscale
    for (let i = 0; i < data.length; i += 4) {
      // Convert to grayscale
      const gray = Math.round(0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]);
      
      // Increase contrast
      const contrast = 1.5;
      const enhanced = Math.max(0, Math.min(255, contrast * (gray - 128) + 128));
      
      data[i] = enhanced;     // R
      data[i + 1] = enhanced; // G
      data[i + 2] = enhanced; // B
      // Alpha remains the same
    }
    
    // Put enhanced data back
    ctx.putImageData(imageData, 0, 0);
    
    // Return as buffer
    return canvas.toBuffer('image/png');
    
  } catch (error) {
    console.error('Image enhancement error:', error);
    return imageBuffer; // Return original if enhancement fails
  }
}
