import type { NextApiRequest, NextApiResponse } from 'next';
import formidable from 'formidable';
import { comparePDFs } from '@/lib/server-compare';
import { getFilePath } from '@/lib/formidable-helper';

export const config = { api: { bodyParser: false } };

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const form = new formidable.IncomingForm();
  form.parse(req, async (err, fields, files) => {
    if (err || !files.file1 || !files.file2) {
      res.status(400).json({ error: 'Two PDF files required' });
      return;
    }
    try {
      const file1 = Array.isArray(files.file1) ? files.file1[0] : files.file1;
      const file2 = Array.isArray(files.file2) ? files.file2[0] : files.file2;
      const filePath1 = getFilePath(file1);
      const filePath2 = getFilePath(file2);
      const diffResult = await comparePDFs(filePath1, filePath2);
      res.status(200).json(diffResult);
    } catch (e) {
      res.status(501).json({ error: 'PDF compare not implemented yet.' });
    }
  });
}
