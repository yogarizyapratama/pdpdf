import type { NextApiRequest, NextApiResponse } from 'next';
import formidable, { IncomingForm } from 'formidable';
import os from 'os';
import { addPageNumbers } from '../../lib/server-pagenumber';

export const config = { api: { bodyParser: false } };

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('PageNumber PDF API called');
    
    const form = new IncomingForm({
      maxFileSize: 100 * 1024 * 1024, // 100MB limit
      uploadDir: os.tmpdir(), // Use OS temp directory
      keepExtensions: true,
    });

    form.parse(req, async (err, fields, files) => {
      console.log('Form parsed, error:', err);
      console.log('Files received:', files);
      console.log('Fields received:', fields);
      
      if (err) {
        console.error('Form parse error:', err);
        return res.status(400).json({ error: 'File parsing failed: ' + err.message });
      }
      
      if (!files.file) {
        console.error('No file in upload');
        return res.status(400).json({ error: 'No file uploaded' });
      }

      try {
        const file = Array.isArray(files.file) ? files.file[0] : files.file;
        console.log('Processing file:', file.filepath);
        
        if (!file.filepath) {
          throw new Error('File path is undefined');
        }

        // Extract options from form fields
        const options = {
          format: Array.isArray(fields.format) ? fields.format[0] : fields.format || '1',
          position: Array.isArray(fields.position) ? fields.position[0] : fields.position || 'bottom-center',
          fontSize: parseInt(Array.isArray(fields.fontSize) ? fields.fontSize[0] : fields.fontSize || '12'),
          startNumber: parseInt(Array.isArray(fields.startNumber) ? fields.startNumber[0] : fields.startNumber || '1')
        };
        
        console.log('Page number options:', options);
        
        const numberedBuffer = await addPageNumbers(file.filepath, options);
        
        console.log('Page numbers added successfully, buffer size:', numberedBuffer.length);
        
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename="numbered.pdf"');
        res.send(numberedBuffer);
      } catch (error) {
        console.error('Processing error:', error);
        res.status(500).json({ 
          error: 'Page numbering failed: ' + (error as Error).message 
        });
      }
    });
  } catch (error) {
    console.error('Handler error:', error);
    res.status(500).json({ 
      error: 'Server error: ' + (error as Error).message 
    });
  }
}
