import type { NextApiRequest, NextApiResponse } from 'next';
import formidable from 'formidable';
import { convertToPDFA } from '@/lib/server-pdfa';

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
      const pdfaBuffer = await convertToPDFA(filePath);
      res.setHeader('Content-Type', 'application/pdf');
      res.send(pdfaBuffer);
    } catch (e) {
      res.status(501).json({ error: 'PDF/A conversion not implemented yet.' });
    }
  });
}
