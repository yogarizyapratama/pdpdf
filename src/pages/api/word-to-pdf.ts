import type { NextApiRequest, NextApiResponse } from 'next';
import formidable from 'formidable';
import { convertWordToPDF } from '@/lib/server-word';

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
      const pdfBuffer = await convertWordToPDF(filePath);
      res.setHeader('Content-Type', 'application/pdf');
      res.send(pdfBuffer);
    } catch (e) {
      res.status(501).json({ error: 'Word to PDF conversion not implemented yet.' });
    }
  });
}
