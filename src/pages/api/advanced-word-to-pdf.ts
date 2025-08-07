import { NextApiRequest, NextApiResponse } from 'next';
import formidable from 'formidable';
import mammoth from 'mammoth';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import fs from 'fs/promises';

export const config = {
  api: {
    bodyParser: false,
    responseLimit: '50mb',
  },
};

interface ConversionOptions {
  preserveFormatting?: boolean;
  includeImages?: boolean;
  pageSize?: 'A4' | 'Letter' | 'A3' | 'Legal';
  margins: number;
  fontSize: number;
  fontFamily?: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const form = formidable({
      maxFileSize: 50 * 1024 * 1024,
    });

    const [fields, files] = await form.parse(req);
    
    const options: ConversionOptions = {
      preserveFormatting: fields.preserveFormatting?.[0] === 'true',
      includeImages: fields.includeImages?.[0] === 'true',
      pageSize: (fields.pageSize?.[0] as any) || 'A4',
      margins: parseInt(fields.margins?.[0] || '50') || 50,
      fontSize: parseInt(fields.fontSize?.[0] || '12') || 12,
      fontFamily: fields.fontFamily?.[0] || 'Helvetica',
    };

    const file = Array.isArray(files.file) ? files.file[0] : files.file;
    
    if (!file || !file.filepath) {
      return res.status(400).json({ error: 'No file provided' });
    }

    // Read the Word document
    const docxBuffer = await fs.readFile(file.filepath);
    
    // Convert to HTML with mammoth
    const result = await mammoth.convertToHtml(
      { buffer: docxBuffer },
      {
        includeDefaultStyleMap: options.preserveFormatting,
        includeEmbeddedStyleMap: options.preserveFormatting,
        convertImage: options.includeImages 
          ? mammoth.images.imgElement((image) => {
              return image.read("base64").then((imageBuffer) => {
                return {
                  src: `data:${image.contentType};base64,${imageBuffer}`,
                };
              });
            })
          : undefined,
      }
    );

    // Create PDF from HTML content
    const pdfDoc = await PDFDocument.create();
    
    // Set page size
    const pageSizes = {
      A4: [595, 842],
      Letter: [612, 792],
      A3: [842, 1191],
      Legal: [612, 1008],
    };
    
    const [pageWidth, pageHeight] = pageSizes[options.pageSize || 'A4'] || pageSizes.A4;
    
    // Parse HTML and create PDF content
    const htmlContent = result.value;
    const textContent = htmlContent.replace(/<[^>]*>/g, ''); // Strip HTML tags for now
    
    // Embed font
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    
    // Split text into pages
    const lines = textContent.split('\n');
    const linesPerPage = Math.floor((pageHeight - 2 * options.margins) / (options.fontSize * 1.2));
    
    let currentPage = pdfDoc.addPage([pageWidth, pageHeight]);
    let currentY = pageHeight - options.margins;
    let lineCount = 0;
    
    for (const line of lines) {
      if (lineCount >= linesPerPage) {
        currentPage = pdfDoc.addPage([pageWidth, pageHeight]);
        currentY = pageHeight - options.margins;
        lineCount = 0;
      }
      
      if (line.trim()) {
        // Handle long lines by wrapping
        const maxWidth = pageWidth - 2 * options.margins;
        const words = line.split(' ');
        let currentLine = '';
        
        for (const word of words) {
          const testLine = currentLine + (currentLine ? ' ' : '') + word;
          const textWidth = font.widthOfTextAtSize(testLine, options.fontSize);
          
          if (textWidth <= maxWidth) {
            currentLine = testLine;
          } else {
            if (currentLine) {
              currentPage.drawText(currentLine, {
                x: options.margins,
                y: currentY,
                size: options.fontSize,
                font: font,
                color: rgb(0, 0, 0),
              });
              currentY -= options.fontSize * 1.2;
              lineCount++;
            }
            currentLine = word;
          }
        }
        
        if (currentLine) {
          currentPage.drawText(currentLine, {
            x: options.margins,
            y: currentY,
            size: options.fontSize,
            font: font,
            color: rgb(0, 0, 0),
          });
          currentY -= options.fontSize * 1.2;
          lineCount++;
        }
      } else {
        currentY -= options.fontSize * 0.6; // Smaller gap for empty lines
        lineCount++;
      }
    }

    // Set document metadata
    pdfDoc.setTitle(file.originalFilename?.replace(/\.[^/.]+$/, '') || 'Converted Document');
    pdfDoc.setCreator('PDF All-in-One');
    pdfDoc.setProducer('PDF All-in-One Word Converter');
    pdfDoc.setCreationDate(new Date());

    const pdfBytes = await pdfDoc.save();

    // Clean up
    await fs.unlink(file.filepath);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${file.originalFilename?.replace(/\.[^/.]+$/, '')}.pdf"`);
    
    return res.status(200).send(Buffer.from(pdfBytes));

  } catch (error) {
    console.error('Word to PDF conversion error:', error);
    return res.status(500).json({ 
      error: 'Failed to convert Word to PDF',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
