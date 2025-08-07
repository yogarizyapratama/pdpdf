import type { Metadata } from "next";
import "@/lib/server-polyfills"; // Server-side polyfills for PDF libraries
import "./globals.css";
import "../styles/react-pdf.css";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import "@/lib/pdf-config"; // Initialize PDF.js worker globally
import GoogleAdSenseScript from "../components/GoogleAdSenseScript";
import AdSenseManager from "../components/AdSenseManager";
import AdSenseDebugPanel from "../components/AdSenseDebugPanel";
import GoogleConsentManager from "../components/GoogleConsentManager";
// import AdTestingPanel from "../components/AdTestingPanel";
import { ToastProvider } from '@/components/GlobalToast';
// import BugReportButton from '@/components/BugReportButton';
// import FeedbackForm from '@/components/FeedbackForm';
// import OnboardingTour from '@/components/OnboardingTour';
// import KeyboardShortcuts from '@/components/KeyboardShortcuts';
// import QuickActions from '@/components/QuickActions';
// import ContextMenu from '@/components/ContextMenu';
import StructuredData from '@/components/StructuredData';
// import GoogleAnalytics from '@/components/GoogleAnalytics';
// import FloatingToolPanel from '@/components/FloatingToolPanel';

// Get base URL for metadata
const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://pdpdf.vercel.app'

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: "PDPDF - Free Online PDF Tools | Merge, Split, Compress, Convert PDF",
  description: "Free online PDF tools: merge PDF files, split PDF, compress PDF, convert PDF to Word/Excel/JPG, edit PDF, protect PDF. No signup required. Fast, secure, unlimited use.",
  keywords: [
    "PDF tools", "merge PDF online", "split PDF", "compress PDF", "convert PDF", 
    "PDF to Word", "PDF to Excel", "PDF to JPG", "Word to PDF", "Excel to PDF", 
    "PowerPoint to PDF", "JPG to PDF", "free PDF tools", "PDF editor online",
    "PDF merger", "PDF splitter", "PDF compressor", "PDF converter", "online PDF",
    "edit PDF", "protect PDF", "unlock PDF", "sign PDF", "watermark PDF",
    "rotate PDF", "crop PDF", "OCR PDF", "extract PDF pages", "organize PDF",
    "repair PDF", "scan to PDF", "HTML to PDF", "PDF security", "PDF optimization",
    "pdpdf", "pdpdf.vercel.app", "free online PDF tools", "PDF manipulation"
  ].join(", "),
  authors: [{ name: "PDPDF Team" }],
  robots: "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1",
  category: "Productivity",
  classification: "Business Tools",
  openGraph: {
    title: "PDPDF - Free Online PDF Tools | Merge, Split, Compress, Convert PDF",
    description: "Free online PDF tools: merge PDF files, split PDF, compress PDF, convert PDF to Word/Excel/JPG, edit PDF, protect PDF. No signup required. Fast, secure, unlimited use.",
    type: "website",
    url: baseUrl,
    locale: "en_US",
    siteName: "PDPDF",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "PDPDF - Free Online PDF Tools",
        type: "image/jpeg"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    site: "@pdpdf_tools",
    title: "PDPDF - Free Online PDF Tools | Merge, Split, Compress, Convert PDF",
    description: "Free online PDF tools: merge PDF files, split PDF, compress PDF, convert PDF to Word/Excel/JPG, edit PDF, protect PDF. No signup required. Fast, secure, unlimited use.",
    images: ["/og-image.jpg"]
  },
  alternates: {
    canonical: baseUrl
  },
  verification: {
    google: "your-google-verification-code",
    other: {
      "msvalidate.01": "your-bing-verification-code"
    }
  },
  other: {
    "google-adsense-account": "ca-pub-6879569899763830"
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
        {/* Modern Icon System */}
        <link rel="icon" href="/favicon-32x32.svg" type="image/svg+xml" />
        <link rel="icon" href="/favicon.ico" sizes="32x32" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.svg" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#667EEA" />
        
        {/* Google AdSense Site Verification - Required for approval */}
        <meta name="google-adsense-account" content="ca-pub-6879569899763830" />
        
        {/* Structured Data for SEO */}
        <StructuredData />
        
        {/* Google AdSense Script */}
        <GoogleAdSenseScript />
        
        {/* Google Consent Management Platform */}
        <GoogleConsentManager />
        
        {/* AdSense Manager - Prevents hydration errors and duplicate ads */}
        <AdSenseManager />
      </head>
      <body className="antialiased min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
        {/* <GoogleAnalytics /> */}
        <ToastProvider>
          <div className="flex flex-col min-h-screen">
            {children}
          </div>
          
          {/* Consolidated Floating Tool Panel - Less intrusive */}
          {/* <FloatingToolPanel /> */}
          
          {/* Ad Testing Panel (only shows in development with production env) */}
          {/* <AdTestingPanel /> */}
          {/* <ContextMenu /> */}
          
          {/* AdSense Debug Panel - Development Only */}
          <AdSenseDebugPanel />
        </ToastProvider>
      </body>
    </html>
  );
}
