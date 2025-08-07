import type { NextApiRequest, NextApiResponse } from 'next';
import formidable from 'formidable';
import { signPDF } from '../../lib/server-sign';

export const config = { api: { bodyParser: false } };

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const form = formidable();
  
  try {
    const [fields, files] = await form.parse(req);
    
    if (!files.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    const file = Array.isArray(files.file) ? files.file[0] : files.file;
    const filePath = file.filepath;
    
    // Parse signatures array from the request
    const signatures = fields.signatures ? 
      (Array.isArray(fields.signatures) ? 
        JSON.parse(fields.signatures[0]) : 
        JSON.parse(fields.signatures)
      ) : [];
    
    const signedBuffer = await signPDF(filePath, signatures);
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="signed.pdf"');
    return res.send(signedBuffer);
    
  } catch (error) {
    console.error('Error signing PDF:', error);
    return res.status(500).json({ error: 'Failed to sign PDF' });
  }
}
