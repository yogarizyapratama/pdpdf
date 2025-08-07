import type { NextApiRequest, NextApiResponse } from 'next';
import { IncomingForm, File } from 'formidable';
import { ocrPDF } from '../../lib/server-ocr';

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
      const text = await ocrPDF(filePath);
      res.status(200).json({ text });
    } catch (e) {
      res.status(500).json({ error: 'OCR failed' });
    }
  });
}
