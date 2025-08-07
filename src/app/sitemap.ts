import { MetadataRoute } from 'next'

const pdfTools = [
  { slug: 'merge-pdf', priority: 0.9, changefreq: 'weekly' as const },
  { slug: 'split-pdf', priority: 0.9, changefreq: 'weekly' as const },
  { slug: 'compress-pdf', priority: 0.9, changefreq: 'weekly' as const },
  { slug: 'pdf-to-jpg', priority: 0.8, changefreq: 'monthly' as const },
  { slug: 'jpg-to-pdf', priority: 0.8, changefreq: 'monthly' as const },
  { slug: 'pdf-to-word', priority: 0.8, changefreq: 'monthly' as const },
  { slug: 'word-to-pdf', priority: 0.8, changefreq: 'monthly' as const },
  { slug: 'pdf-to-excel', priority: 0.7, changefreq: 'monthly' as const },
  { slug: 'excel-to-pdf', priority: 0.7, changefreq: 'monthly' as const },
  { slug: 'pdf-to-powerpoint', priority: 0.7, changefreq: 'monthly' as const },
  { slug: 'powerpoint-to-pdf', priority: 0.7, changefreq: 'monthly' as const },
  { slug: 'rotate-pdf', priority: 0.7, changefreq: 'monthly' as const },
  { slug: 'watermark-pdf', priority: 0.6, changefreq: 'monthly' as const },
  { slug: 'protect-pdf', priority: 0.6, changefreq: 'monthly' as const },
  { slug: 'unlock-pdf', priority: 0.6, changefreq: 'monthly' as const },
  { slug: 'sign-pdf', priority: 0.6, changefreq: 'monthly' as const },
  { slug: 'ocr-pdf', priority: 0.6, changefreq: 'monthly' as const },
  { slug: 'repair-pdf', priority: 0.5, changefreq: 'monthly' as const },
  { slug: 'crop-pdf', priority: 0.5, changefreq: 'monthly' as const },
  { slug: 'pagenumber-pdf', priority: 0.5, changefreq: 'monthly' as const },
  { slug: 'organize-pdf', priority: 0.5, changefreq: 'monthly' as const },
  { slug: 'extract-pages', priority: 0.5, changefreq: 'monthly' as const },
  { slug: 'remove-pages', priority: 0.5, changefreq: 'monthly' as const },
  { slug: 'scan-to-pdf', priority: 0.5, changefreq: 'monthly' as const },
  { slug: 'compare-pdf', priority: 0.4, changefreq: 'monthly' as const },
  { slug: 'html-to-pdf', priority: 0.4, changefreq: 'monthly' as const }
]

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://pdpdf.vercel.app'
  const currentDate = new Date()
  
  const staticPages = [
    {
      url: baseUrl,
      lastModified: currentDate,
      changeFrequency: 'daily' as const,
      priority: 1.0
    },
    {
      url: `${baseUrl}/about`,
      lastModified: currentDate,
      changeFrequency: 'monthly' as const,
      priority: 0.5
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: currentDate,
      changeFrequency: 'yearly' as const,
      priority: 0.3
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: currentDate,
      changeFrequency: 'yearly' as const,
      priority: 0.3
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: currentDate,
      changeFrequency: 'monthly' as const,
      priority: 0.4
    }
  ]

  const toolPages = pdfTools.map(tool => ({
    url: `${baseUrl}/${tool.slug}`,
    lastModified: currentDate,
    changeFrequency: tool.changefreq,
    priority: tool.priority
  }))

  const categoryPages = [
    {
      url: `${baseUrl}/organize`,
      lastModified: currentDate,
      changeFrequency: 'weekly' as const,
      priority: 0.7
    },
    {
      url: `${baseUrl}/convert`,
      lastModified: currentDate,
      changeFrequency: 'weekly' as const,
      priority: 0.7
    },
    {
      url: `${baseUrl}/optimize`,
      lastModified: currentDate,
      changeFrequency: 'weekly' as const,
      priority: 0.7
    },
    {
      url: `${baseUrl}/edit`,
      lastModified: currentDate,
      changeFrequency: 'weekly' as const,
      priority: 0.6
    },
    {
      url: `${baseUrl}/security`,
      lastModified: currentDate,
      changeFrequency: 'weekly' as const,
      priority: 0.6
    }
  ]

  return [...staticPages, ...toolPages, ...categoryPages]
}
