import { NextApiRequest, NextApiResponse } from 'next';
import formidable from 'formidable';
import { PDFDocument, PDFPage } from 'pdf-lib';
import fs from 'fs/promises';
import { createReadStream } from 'fs';

// Disable default body parser for file uploads
export const config = {
  api: {
    bodyParser: false,
    responseLimit: '50mb',
  },
};

interface MergeOptions {
  addBookmarks?: boolean;
  addPageNumbers?: boolean;
  preserveMetadata?: boolean;
  password?: string;
  compression?: boolean;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const form = formidable({
      maxFileSize: 50 * 1024 * 1024, // 50MB
      multiples: true,
    });

    const [fields, files] = await form.parse(req);
    
    const options: MergeOptions = {
      addBookmarks: fields.addBookmarks?.[0] === 'true',
      addPageNumbers: fields.addPageNumbers?.[0] === 'true',
      preserveMetadata: fields.preserveMetadata?.[0] === 'true',
      password: fields.password?.[0],
      compression: fields.compression?.[0] === 'true',
    };

    const fileArray = Array.isArray(files.files) ? files.files : [files.files].filter(Boolean);
    
    if (!fileArray || fileArray.length === 0) {
      return res.status(400).json({ error: 'No files provided' });
    }

    // Create new PDF document
    const mergedPdf = await PDFDocument.create();
    let totalPages = 0;
    const bookmarks: Array<{ title: string; pageIndex: number }> = [];

    // Process each PDF file
    for (let i = 0; i < fileArray.length; i++) {
      const file = fileArray[i];
      if (!file || !file.filepath) continue;

      try {
        const pdfBytes = await fs.readFile(file.filepath);
        const pdf = await PDFDocument.load(pdfBytes, { 
          ignoreEncryption: !!options.password 
        });

        const pageCount = pdf.getPageCount();
        const pages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());

        // Add bookmark for this document
        if (options.addBookmarks) {
          bookmarks.push({
            title: file.originalFilename || `Document ${i + 1}`,
            pageIndex: totalPages
          });
        }

        // Add pages to merged document
        pages.forEach((page) => {
          mergedPdf.addPage(page);
        });

        // Preserve metadata from first document
        if (i === 0 && options.preserveMetadata) {
          const title = pdf.getTitle();
          const author = pdf.getAuthor();
          const subject = pdf.getSubject();
          const creator = pdf.getCreator();

          if (title) mergedPdf.setTitle(title);
          if (author) mergedPdf.setAuthor(author);
          if (subject) mergedPdf.setSubject(subject);
          if (creator) mergedPdf.setCreator(creator);
        }

        totalPages += pageCount;
      } catch (error) {
        console.error(`Error processing file ${file.originalFilename}:`, error);
        // Continue with other files
      }
    }

    // Add page numbers if requested
    if (options.addPageNumbers) {
      const pages = mergedPdf.getPages();
      const helveticaFont = await mergedPdf.embedFont('Helvetica');

      pages.forEach((page, index) => {
        const { width, height } = page.getSize();
        page.drawText(`${index + 1}`, {
          x: width - 50,
          y: 30,
          size: 12,
          font: helveticaFont,
        });
      });
    }

    // Set metadata
    mergedPdf.setCreator('PDF All-in-One');
    mergedPdf.setProducer('PDF All-in-One Advanced Merger');
    mergedPdf.setCreationDate(new Date());
    mergedPdf.setModificationDate(new Date());

    // Save with compression if requested
    const pdfBytes = await mergedPdf.save({
      useObjectStreams: options.compression,
      addDefaultPage: false,
    });

    // Clean up temporary files
    for (const file of fileArray) {
      if (file && file.filepath) {
        try {
          await fs.unlink(file.filepath);
        } catch (error) {
          console.error('Error cleaning up file:', error);
        }
      }
    }

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="merged-document.pdf"');
    res.setHeader('Content-Length', pdfBytes.length);
    
    return res.status(200).send(Buffer.from(pdfBytes));

  } catch (error) {
    console.error('Advanced merge error:', error);
    return res.status(500).json({ 
      error: 'Failed to merge PDFs',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
