import type { NextApiRequest, NextApiResponse } from 'next';
import { IncomingForm, File } from 'formidable';
import fs from 'fs';
import path from 'path';
import { compressPDF } from '@/lib/server-pdf';

export const config = { api: { bodyParser: false } };

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const form = new IncomingForm();
  form.parse(req, async (err, fields, files) => {
    if (err || !files.file) {
      res.status(400).json({ error: 'No file uploaded' });
      return;
    }
    try {
      const file = Array.isArray(files.file) ? files.file[0] : files.file;
      const filePath = (file as File).filepath;
      const compressionLevel = Array.isArray(fields.compressionLevel) 
        ? fields.compressionLevel[0] 
        : fields.compressionLevel || 'medium';
      
      // Get original file size
      const originalStats = fs.statSync(filePath);
      const originalSize = originalStats.size;
      
      // Compress the PDF
      const result = await compressPDF(filePath, compressionLevel);
      
      // Add compression stats to response headers
      res.setHeader('X-Original-Size', result.stats.originalSize.toString());
      res.setHeader('X-Compressed-Size', result.stats.compressedSize.toString());
      res.setHeader('X-Compression-Ratio', result.stats.compressionRatio.toFixed(2));
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="compressed_${file.originalFilename || 'document.pdf'}"`);
      
      res.send(result.buffer);
    } catch (e) {
      console.error('Compression error:', e);
      res.status(500).json({ 
        error: 'Compression failed: ' + (e instanceof Error ? e.message : 'Unknown error')
      });
    }
  });
}
