import type { NextApiRequest, NextApiResponse } from 'next';
import { IncomingForm, File } from 'formidable';
import { convertExcelToPDF } from '@/lib/server-excel';

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
      const pdfBuffer = await convertExcelToPDF(filePath);
      res.setHeader('Content-Type', 'application/pdf');
      res.send(pdfBuffer);
    } catch (e) {
      res.status(500).json({ error: 'Excel to PDF conversion failed: ' + (e instanceof Error ? e.message : 'Unknown error') });
    }
  });
}
