import type { NextApiRequest, NextApiResponse } from 'next';
import formidable from 'formidable';
import { redactPDF } from '@/lib/server-redact';

export const config = { api: { bodyParser: false } };

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const form = new formidable.IncomingForm();
  form.parse(req, async (err, fields, files) => {
    if (err || !files.file) {
      res.status(400).json({ error: 'No file uploaded' });
      return;
    }
    try {
      const file = Array.isArray(files.file) ? files.file[0] : files.file;
      const filePath = file.filepath;
      
      // Parse redact parameters
      const redactParams = fields.redactParams ? 
        (Array.isArray(fields.redactParams) ? 
          JSON.parse(fields.redactParams[0]) : 
          JSON.parse(fields.redactParams)
        ) : 
        { x: 0, y: 0, width: 100, height: 50, pageIndex: 0 };
      
      const redactedBuffer = await redactPDF(filePath, redactParams);
      res.setHeader('Content-Type', 'application/pdf');
      res.send(redactedBuffer);
    } catch (e) {
      res.status(501).json({ error: 'PDF redaction not implemented yet.' });
    }
  });
}
