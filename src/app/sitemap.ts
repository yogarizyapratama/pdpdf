import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://pdpdf.vercel.app'
  
  // Define all PDF tools with their SEO priorities
  const pdfTools = [
    // Top priority - most searched tools
    { path: '/merge-pdf', priority: 1.0 },
    { path: '/compress-pdf', priority: 1.0 },
    { path: '/split-pdf', priority: 0.95 },
    { path: '/pdf-to-jpg', priority: 0.95 },
    
    // High priority - popular conversion tools
    { path: '/pdf-to-word', priority: 0.9 },
    { path: '/word-to-pdf', priority: 0.9 },
    { path: '/pdf-to-excel', priority: 0.85 },
    { path: '/excel-to-pdf', priority: 0.85 },
    
    // Medium priority - office conversions
    { path: '/pdf-to-powerpoint', priority: 0.8 },
    { path: '/powerpoint-to-pdf', priority: 0.8 },
    { path: '/jpg-to-pdf', priority: 0.8 },
    { path: '/html-to-pdf', priority: 0.75 },
    
    // Security tools
    { path: '/protect-pdf', priority: 0.8 },
    { path: '/unlock-pdf', priority: 0.8 },
    { path: '/sign-pdf', priority: 0.7 },
    
    // Organization tools
    { path: '/remove-pages', priority: 0.75 },
    { path: '/extract-pages', priority: 0.75 },
    { path: '/organize-pdf', priority: 0.75 },
    { path: '/rotate-pdf', priority: 0.7 },
    
    // Editing tools
    { path: '/watermark-pdf', priority: 0.7 },
    { path: '/pagenumber-pdf', priority: 0.7 },
    { path: '/crop-pdf', priority: 0.7 },
    
    // Advanced tools
    { path: '/ocr-pdf', priority: 0.7 },
    { path: '/repair-pdf', priority: 0.65 },
    { path: '/scan-to-pdf', priority: 0.65 },
    { path: '/compare-pdf', priority: 0.6 }
  ]

  const sitemapEntries: MetadataRoute.Sitemap = [
    // Homepage - highest priority
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    }
  ]

  // Add all PDF tools
  pdfTools.forEach(tool => {
    sitemapEntries.push({
      url: `${baseUrl}${tool.path}`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: tool.priority,
    })
  })

  return sitemapEntries
}
