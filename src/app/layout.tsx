import type { Metadata } from "next";
import "./globals.css";
import "../styles/react-pdf.css";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import "react-pdf/dist/esm/Page/TextLayer.css";
import "@/lib/pdf-config"; // Initialize PDF.js worker globally
import GoogleAdSenseScript from "../components/GoogleAdSenseScript";
import AdTestingPanel from "../components/AdTestingPanel";
import { ToastProvider } from '@/components/GlobalToast';
import BugReportButton from '@/components/BugReportButton';
import FeedbackForm from '@/components/FeedbackForm';
import OnboardingTour from '@/components/OnboardingTour';
import KeyboardShortcuts from '@/components/KeyboardShortcuts';
import QuickActions from '@/components/QuickActions';
import ContextMenu from '@/components/ContextMenu';
import StructuredData from '@/components/StructuredData';
import GoogleAnalytics from '@/components/GoogleAnalytics';
import FloatingToolPanel from '@/components/FloatingToolPanel';

export const metadata: Metadata = {
  title: "PDF All-in-One - Free Online PDF Tools | Merge, Split, Compress, Convert PDF",
  description: "Free online PDF tools: merge PDF files, split PDF, compress PDF, convert PDF to Word/Excel/JPG, edit PDF, protect PDF. No signup required. Fast, secure, unlimited use.",
  keywords: [
    "PDF tools", "merge PDF online", "split PDF", "compress PDF", "convert PDF", 
    "PDF to Word", "PDF to Excel", "PDF to JPG", "Word to PDF", "Excel to PDF", 
    "PowerPoint to PDF", "JPG to PDF", "free PDF tools", "PDF editor online",
    "PDF merger", "PDF splitter", "PDF compressor", "PDF converter", "online PDF",
    "edit PDF", "protect PDF", "unlock PDF", "sign PDF", "watermark PDF",
    "rotate PDF", "crop PDF", "OCR PDF", "extract PDF pages", "organize PDF",
    "repair PDF", "scan to PDF", "HTML to PDF", "PDF security", "PDF optimization"
  ].join(", "),
  authors: [{ name: "PDF All-in-One Team" }],
  robots: "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1",
  category: "Productivity",
  classification: "Business Tools",
  openGraph: {
    title: "PDF All-in-One - Free Online PDF Tools | Merge, Split, Compress, Convert PDF",
    description: "Free online PDF tools: merge PDF files, split PDF, compress PDF, convert PDF to Word/Excel/JPG, edit PDF, protect PDF. No signup required. Fast, secure, unlimited use.",
    type: "website",
    locale: "en_US",
    siteName: "PDF All-in-One",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "PDF All-in-One - Free Online PDF Tools"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "PDF All-in-One - Free Online PDF Tools | Merge, Split, Compress, Convert PDF",
    description: "Free online PDF tools: merge PDF files, split PDF, compress PDF, convert PDF to Word/Excel/JPG, edit PDF, protect PDF. No signup required. Fast, secure, unlimited use.",
    images: ["/og-image.jpg"]
  },
  alternates: {
    canonical: "https://pdf-all-in-one.com"
  },
  other: {
    "google-site-verification": "your-google-verification-code",
    "msvalidate.01": "your-bing-verification-code"
  }
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/apple-icon.png" />
        <meta name="theme-color" content="#1f2937" />
        
        {/* Structured Data for SEO */}
        <StructuredData />
        
        {/* Google AdSense Script */}
        <GoogleAdSenseScript />
      </head>
      <body className="antialiased min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
        <GoogleAnalytics />
        <ToastProvider>
          <div className="flex flex-col min-h-screen">
            {children}
          </div>
          
          {/* Consolidated Floating Tool Panel - Less intrusive */}
          <FloatingToolPanel />
          
          {/* Ad Testing Panel (only shows in development with production env) */}
          <AdTestingPanel />
          <ContextMenu />
        </ToastProvider>
      </body>
    </html>
  );
}
