import type { NextApiRequest, NextApiResponse } from 'next';
import formidable from 'formidable';
import { unlockPDF } from '../../lib/server-unlock';

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
      const password = Array.isArray(fields.password) ? fields.password[0] : fields.password || '';
      
      const unlockedBuffer = await unlockPDF(filePath, password);
      // res.setHeader('Content-Type', 'application/pdf');
      // res.send(unlockedBuffer);
      res.status(501).json({ error: 'PDF unlock not implemented yet.' });
    } catch (e) {
      res.status(500).json({ error: 'Unlock failed' });
    }
  });
}
