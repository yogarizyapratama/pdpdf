import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  const baseUrl = 'https://pdpdf.vercel.app'
  const currentDate = new Date().toISOString().split('T')[0]
  
  const pdfTools = [
    'merge-pdf', 'compress-pdf', 'pdf-to-jpg', 'split-pdf', 'rotate-pdf',
    'jpg-to-pdf', 'pdf-to-word', 'word-to-pdf', 'pdf-to-excel', 'excel-to-pdf',
    'pdf-to-powerpoint', 'powerpoint-to-pdf', 'watermark-pdf', 'protect-pdf',
    'unlock-pdf', 'sign-pdf', 'ocr-pdf', 'organize-pdf', 'extract-pages',
    'remove-pages', 'repair-pdf', 'crop-pdf', 'pagenumber-pdf', 'scan-to-pdf',
    'compare-pdf', 'html-to-pdf'
  ]

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9 http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
  <url>
    <loc>${baseUrl}/</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
${pdfTools.map(tool => `  <url>
    <loc>${baseUrl}/${tool}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`).join('\n')}
</urlset>`

  return new NextResponse(sitemap, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
    },
  })
}
