import type { NextApiRequest, NextApiResponse } from 'next';
import formidable from 'formidable';
import { cropPDF } from '../../lib/server-crop';

export const config = { api: { bodyParser: false } };

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const form = new formidable.IncomingForm();
  form.parse(req, async (err, fields, files) => {
    if (err || !files.file) {
      res.status(400).json({ error: 'No file uploaded' });
      return;
    }
    try {
      const file = Array.isArray(files.file) ? files.file[0] : files.file;
      const filePath = file.filepath;
      const cropOptions = {
        left: parseInt(Array.isArray(fields.left) ? fields.left[0] : fields.left || '0'),
        top: parseInt(Array.isArray(fields.top) ? fields.top[0] : fields.top || '0'),
        width: parseInt(Array.isArray(fields.width) ? fields.width[0] : fields.width || '200'),
        height: parseInt(Array.isArray(fields.height) ? fields.height[0] : fields.height || '200')
      };
      
      const croppedBuffer = await cropPDF(filePath, cropOptions);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename="cropped.pdf"');
      res.send(croppedBuffer);
    } catch (e) {
      res.status(500).json({ error: 'Cropping failed: ' + (e as Error).message });
    }
  });
}
