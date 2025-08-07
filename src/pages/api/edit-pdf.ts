import type { NextApiRequest, NextApiResponse } from 'next';
import formidable from 'formidable';
import { editPDF } from '../../lib/server-edit';

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
      const editOptions = {
        pageIndex: parseInt(Array.isArray(fields.pageIndex) ? fields.pageIndex[0] : fields.pageIndex || '0'),
        text: Array.isArray(fields.text) ? fields.text[0] : fields.text || '',
        x: parseInt(Array.isArray(fields.x) ? fields.x[0] : fields.x || '100'),
        y: parseInt(Array.isArray(fields.y) ? fields.y[0] : fields.y || '100'),
        size: parseInt(Array.isArray(fields.size) ? fields.size[0] : fields.size || '12')
      };
      
      const editedBuffer = await editPDF(filePath, editOptions);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename="edited.pdf"');
      res.send(editedBuffer);
    } catch (e) {
      res.status(500).json({ error: 'Editing failed: ' + (e as Error).message });
    }
  });
}
