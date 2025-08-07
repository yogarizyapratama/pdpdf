import { Metadata } from 'next'

export interface SEOConfig {
  title: string
  description: string
  keywords: string[]
  canonical?: string
  toolName?: string
  category?: string
  h1: string
  content: {
    subtitle: string
    benefits: string[]
    steps: string[]
    faq: Array<{ question: string; answer: string }>
  }
}

export function generateSEOMetadata(config: SEOConfig): Metadata {
  const {
    title,
    description,
    keywords,
    canonical,
    toolName
  } = config

  const baseUrl = 'https://pdpdf.vercel.app'
  const fullTitle = title.includes('PDPDF') ? title : `${title} | PDPDF`
  const ogImage = toolName 
    ? `${baseUrl}/api/og?tool=${encodeURIComponent(toolName)}`
    : `${baseUrl}/og-default.png`

  return {
    title: fullTitle,
    description,
    keywords: keywords.join(', '),
    openGraph: {
      title: fullTitle,
      description,
      url: canonical || baseUrl,
      siteName: 'PDPDF - Free Online PDF Tools',
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: title
        }
      ],
      locale: 'en_US',
      type: 'website'
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
      images: [ogImage]
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1
      }
    },
    alternates: {
      canonical: canonical || baseUrl
    }
  }
}
// Tool-specific SEO configurations
export const toolSEOConfigs: Record<string, SEOConfig> = {
  'merge-pdf': {
    title: 'Merge PDF Files Online Free - Combine Multiple PDFs',
    description: 'Merge PDF files online for free. Combine multiple PDFs into one document. No registration, watermarks, or file size limits. Fast, secure, and easy to use.',
    keywords: ['merge PDF', 'combine PDF', 'join PDF files', 'PDF merger online', 'merge PDF free', 'combine PDF online', 'PDF joiner', 'merge documents'],
    toolName: 'Merge PDF',
    category: 'Organize',
    h1: 'Merge PDF Files Online - Free & Secure',
    content: {
      subtitle: 'Combine multiple PDF files into one document instantly',
      benefits: [
        'Unlimited file size and number of PDFs',
        'No registration or signup required',
        'Completely free with no watermarks',
        'Fast processing and secure file handling',
        'Drag and drop to reorder pages'
      ],
      steps: [
        'Upload multiple PDF files',
        'Arrange them in desired order',
        'Click Merge PDF button',
        'Download your combined PDF'
      ],
      faq: [
        {
          question: 'How do I merge PDF files online?',
          answer: 'Simply upload your PDF files, arrange them in the order you want, and click the merge button. Your combined PDF will be ready for download.'
        },
        {
          question: 'Is there a limit on file size?',
          answer: 'No, there are no file size limits. You can merge as many PDF files as you need.'
        }
      ]
    }
  },
  'split-pdf': {
    title: 'Split PDF Online Free - Separate PDF Pages',
    description: 'Split PDF files online for free. Extract pages, divide PDFs by page ranges, or separate into individual pages. No registration required.',
    keywords: ['split PDF', 'extract PDF pages', 'divide PDF', 'separate PDF pages', 'PDF splitter online', 'split PDF free'],
    toolName: 'Split PDF',
    category: 'Organize',
    h1: 'Split PDF Files Online - Free & Easy',
    content: {
      subtitle: 'Extract pages or split PDF into multiple documents',
      benefits: [
        'Extract specific pages or page ranges',
        'Split into individual pages',
        'No file size limitations',
        'Secure processing',
        'Instant download'
      ],
      steps: [
        'Upload your PDF file',
        'Select pages to extract',
        'Choose split method',
        'Download split PDFs'
      ],
      faq: [
        {
          question: 'Can I extract specific pages from a PDF?',
          answer: 'Yes, you can select specific pages or page ranges to extract from your PDF document.'
        }
      ]
    }
  },
  'compress-pdf': {
    title: 'Compress PDF Online Free - Reduce PDF File Size',
    description: 'Compress PDF files online for free. Reduce file size while maintaining quality. No registration, fast processing, unlimited use.',
    keywords: ['compress PDF', 'reduce PDF size', 'PDF compressor online', 'optimize PDF', 'shrink PDF file', 'PDF compression free'],
    toolName: 'Compress PDF',
    category: 'Optimize',
    h1: 'Compress PDF Files Online - Reduce File Size',
    content: {
      subtitle: 'Reduce PDF file size while maintaining quality',
      benefits: [
        'Maintain document quality',
        'Significant size reduction',
        'Fast compression process',
        'No quality loss',
        'Free unlimited use'
      ],
      steps: [
        'Upload your PDF file',
        'Choose compression level',
        'Click Compress PDF',
        'Download compressed file'
      ],
      faq: [
        {
          question: 'How much can PDF file size be reduced?',
          answer: 'Typically, PDF files can be compressed by 30-70% depending on the content and compression settings.'
        }
      ]
    }
  },
  'pdf-to-word': {
    title: 'PDF to Word Converter Online Free - Convert PDF to DOC/DOCX',
    description: 'Convert PDF to Word online for free. Transform PDF documents to editable DOC/DOCX files. Maintains formatting, no registration required.',
    keywords: ['PDF to Word', 'convert PDF to DOC', 'PDF to DOCX converter', 'PDF to Word online free', 'extract text from PDF'],
    toolName: 'PDF to Word',
    category: 'Convert',
    h1: 'Convert PDF to Word Online - Free & Accurate',
    content: {
      subtitle: 'Convert PDF documents to editable Word files',
      benefits: [
        'Preserves original formatting',
        'Editable text and images',
        'Supports DOC and DOCX formats',
        'Fast conversion process',
        'High accuracy OCR'
      ],
      steps: [
        'Upload your PDF file',
        'Choose output format (DOC/DOCX)',
        'Click Convert to Word',
        'Download Word document'
      ],
      faq: [
        {
          question: 'Will the formatting be preserved?',
          answer: 'Yes, our converter maintains the original formatting including fonts, images, and layout as much as possible.'
        }
      ]
    }
  },
  'pdf-to-jpg': {
    title: 'PDF to JPG Converter Online Free - Convert PDF to Images',
    description: 'Convert PDF to JPG images online for free. Extract images from PDF, convert pages to JPG/PNG. High quality, fast processing.',
    keywords: ['PDF to JPG', 'PDF to image', 'convert PDF pages to images', 'PDF to PNG converter', 'extract images from PDF'],
    toolName: 'PDF to JPG',
    category: 'Convert',
    h1: 'Convert PDF to JPG Images Online - Free & Fast',
    content: {
      subtitle: 'Convert PDF pages to high-quality JPG images',
      benefits: [
        'High-resolution output',
        'Multiple format support',
        'Batch conversion',
        'Customizable quality',
        'Instant processing'
      ],
      steps: [
        'Upload PDF file',
        'Select pages to convert',
        'Choose image quality',
        'Download JPG images'
      ],
      faq: [
        {
          question: 'What image quality can I expect?',
          answer: 'Our converter produces high-quality images with customizable DPI settings up to 300 DPI for professional use.'
        }
      ]
    }
  }
}

export function generateMetadata(toolKey: string): Metadata {
  const config = toolSEOConfigs[toolKey]
  if (!config) {
    return {
      title: 'PDF Tool - PDPDF',
      description: 'Free online PDF tool'
    }
  }

  return generateSEOMetadata({
    ...config,
    canonical: `https://pdpdf.vercel.app/${toolKey}`
  })
}
