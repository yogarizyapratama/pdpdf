import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  const baseUrl = 'https://pdpdf.vercel.app'
  const currentDate = new Date().toISOString()
  
  const pdfTools = [
    { slug: 'merge-pdf', priority: 0.95, changefreq: 'daily' },
    { slug: 'compress-pdf', priority: 0.95, changefreq: 'daily' },
    { slug: 'pdf-to-jpg', priority: 0.94, changefreq: 'daily' },
    { slug: 'split-pdf', priority: 0.94, changefreq: 'weekly' },
    { slug: 'rotate-pdf', priority: 0.93, changefreq: 'weekly' },
    { slug: 'jpg-to-pdf', priority: 0.9, changefreq: 'weekly' },
    { slug: 'pdf-to-word', priority: 0.9, changefreq: 'weekly' },
    { slug: 'word-to-pdf', priority: 0.9, changefreq: 'weekly' },
    { slug: 'pdf-to-excel', priority: 0.85, changefreq: 'weekly' },
    { slug: 'excel-to-pdf', priority: 0.85, changefreq: 'weekly' },
    { slug: 'pdf-to-powerpoint', priority: 0.85, changefreq: 'weekly' },
    { slug: 'powerpoint-to-pdf', priority: 0.85, changefreq: 'weekly' },
    { slug: 'watermark-pdf', priority: 0.8, changefreq: 'weekly' },
    { slug: 'protect-pdf', priority: 0.8, changefreq: 'weekly' },
    { slug: 'unlock-pdf', priority: 0.8, changefreq: 'weekly' },
    { slug: 'sign-pdf', priority: 0.75, changefreq: 'weekly' },
    { slug: 'ocr-pdf', priority: 0.75, changefreq: 'weekly' },
    { slug: 'organize-pdf', priority: 0.7, changefreq: 'weekly' },
    { slug: 'extract-pages', priority: 0.7, changefreq: 'weekly' },
    { slug: 'remove-pages', priority: 0.7, changefreq: 'weekly' },
    { slug: 'repair-pdf', priority: 0.65, changefreq: 'monthly' },
    { slug: 'crop-pdf', priority: 0.65, changefreq: 'monthly' },
    { slug: 'pagenumber-pdf', priority: 0.6, changefreq: 'monthly' },
    { slug: 'scan-to-pdf', priority: 0.6, changefreq: 'monthly' },
    { slug: 'compare-pdf', priority: 0.55, changefreq: 'monthly' },
    { slug: 'html-to-pdf', priority: 0.55, changefreq: 'monthly' }
  ]

  const staticPages = [
    { url: baseUrl, priority: 1.0, changefreq: 'daily' }
  ]

  const toolPages = pdfTools.map(tool => ({
    url: `${baseUrl}/${tool.slug}`,
    priority: tool.priority,
    changefreq: tool.changefreq
  }))

  const allPages = [...staticPages, ...toolPages]

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allPages.map(page => `  <url>
    <loc>${page.url}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`).join('\n')}
</urlset>`

  return new NextResponse(sitemap, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=86400, s-maxage=86400',
      'X-Robots-Tag': 'noindex'
    },
  })
}

export async function HEAD() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=86400, s-maxage=86400',
    },
  })
}
