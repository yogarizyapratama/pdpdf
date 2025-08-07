import type { NextApiRequest, NextApiResponse } from 'next';
import formidable from 'formidable';
import { rotatePDF } from '../../lib/server-rotate';

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
      const degrees = parseInt(Array.isArray(fields.degrees) ? fields.degrees[0] : fields.degrees || '90');
      
      const rotatedBuffer = await rotatePDF(filePath, degrees);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename="rotated.pdf"');
      res.send(rotatedBuffer);
    } catch (e) {
      res.status(500).json({ error: 'Rotation failed: ' + (e as Error).message });
    }
  });
}
