import type { NextApiRequest, NextApiResponse } from 'next';
import { IncomingForm, File } from 'formidable';
import { addWatermark } from '../../lib/server-watermark';

export const config = { api: { bodyParser: false } };

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const form = new IncomingForm();
  form.parse(req, async (err, fields, files) => {
    if (err || !files.file) {
      res.status(400).json({ error: 'No file uploaded' });
      return;
    }
    try {
      const file = Array.isArray(files.file) ? files.file[0] : files.file;
      const filePath = (file as File).filepath;
      const watermarkText = Array.isArray(fields.watermarkText) ? fields.watermarkText[0] : fields.watermarkText || 'WATERMARK';
      
      const watermarkedBuffer = await addWatermark(filePath, watermarkText);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename="watermarked.pdf"');
      res.send(watermarkedBuffer);
    } catch (e) {
      res.status(500).json({ error: 'Watermark failed: ' + (e as Error).message });
    }
  });
}
