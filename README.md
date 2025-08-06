# PDF All-in-One - Free PDF Tools

A comprehensive, production-ready web application providing all-in-one PDF tools. Built with Next.js 14, TypeScript, and TailwindCSS for optimal performance and user experience.

## 🌟 Features

### 📋 Organize PDF
- **Merge PDF** - Combine multiple PDF files into one document
- **Split PDF** - Extract pages or split PDF into multiple files  
- **Remove Pages** - Delete unwanted pages from your PDF
- **Extract Pages** - Extract specific pages as new PDF
- **Organize PDF** - Reorder pages by drag and drop
- **Scan to PDF** - Convert images to PDF document

### ⚡ Optimize PDF
- **Compress PDF** - Reduce PDF file size while maintaining quality
- **Repair PDF** - Fix corrupted or damaged PDF files
- **OCR PDF** - Extract text from scanned PDF documents

### 📁 Convert To PDF
- **JPG to PDF** - Convert image files to PDF format
- **Word to PDF** - Convert Word documents to PDF
- **PowerPoint to PDF** - Convert presentations to PDF
- **Excel to PDF** - Convert spreadsheets to PDF
- **HTML to PDF** - Convert web pages to PDF

### 📤 Convert From PDF
- **PDF to JPG** - Convert PDF pages to image files
- **PDF to Word** - Convert PDF to editable Word document
- **PDF to PowerPoint** - Convert PDF to PowerPoint presentation
- **PDF to Excel** - Convert PDF to Excel spreadsheet

### ✏️ Edit PDF
- **Rotate PDF** - Rotate PDF pages to correct orientation
- **Add Page Numbers** - Insert page numbers to your PDF
- **Add Watermark** - Add text or image watermarks
- **Crop PDF** - Crop and resize PDF pages

### 🔐 PDF Security
- **Unlock PDF** - Remove password protection from PDF
- **Protect PDF** - Add password protection to PDF
- **Sign PDF** - Add digital signature to PDF
- **Compare PDF** - Compare two PDF files side by side

## 🚀 Tech Stack

- **Frontend**: Next.js 14+ with App Router, React 18+, TypeScript
- **Styling**: TailwindCSS for responsive design
- **PDF Processing**: pdf-lib, PDF.js for client-side operations
- **File Handling**: @dnd-kit for drag-and-drop functionality
- **OCR**: Tesseract.js for client-side text recognition
- **Conversion**: html2pdf.js, mammoth for document conversion
- **Icons**: Lucide React

## 🏗️ Architecture

### Client-Side First
- Prioritizes client-side processing using WASM and Web Workers
- All PDF operations happen locally in the browser
- No file uploads to servers for maximum privacy and security

### Mobile-First Design
- Responsive layouts starting from mobile breakpoints
- Touch-friendly interface for mobile devices
- Progressive enhancement for desktop features

### Performance Optimized
- Code splitting and lazy loading
- Optimized bundle sizes
- Edge Runtime support where possible

## 🛠️ Installation & Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd pdfallinone
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run development server**
   ```bash
   npm run dev
   ```

4. **Build for production**
   ```bash
   npm run build
   npm start
   ```

## 📦 Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── merge-pdf/         # Merge PDF tool page
│   ├── split-pdf/         # Split PDF tool page
│   ├── compress-pdf/      # Compress PDF tool page
│   └── ...                # Other tool pages
├── components/            # Reusable React components
│   ├── Header.tsx         # Navigation header
│   ├── Footer.tsx         # Site footer
│   └── FileUpload.tsx     # File upload component
├── lib/                   # Utility libraries
│   ├── pdf-processor.ts   # PDF processing functions
│   └── utils.ts           # General utilities
└── public/                # Static assets
    ├── robots.txt         # SEO robots file
    └── ads.txt            # Advertising partners
```

## 🔧 Configuration

### Environment Variables
Create a `.env.local` file for environment-specific settings:

```env
NEXT_PUBLIC_SITE_URL=https://your-domain.com
NEXT_PUBLIC_GA_ID=your-google-analytics-id
```

### SEO Configuration
- Sitemap automatically generated at `/sitemap.xml`
- Robots.txt configured for search engines
- Meta tags optimized for social sharing

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your repository to Vercel
2. Configure environment variables
3. Deploy with automatic builds

### Other Platforms
- **Netlify**: Configure build command as `npm run build`
- **Self-hosted**: Use `npm run build && npm start`

## 💰 Monetization

### Advertising Ready
- Google AdSense placement areas included
- Advertisement placeholders in strategic locations
- ads.txt file configured for advertising partners

### Analytics Integration
- Google Analytics ready
- Conversion tracking setup
- User interaction monitoring

## 🔒 Privacy & Security

- **Client-side processing**: All PDF operations happen locally
- **No file uploads**: Files never leave the user's device
- **HTTPS required**: Secure communication only
- **Privacy policy**: Template included for legal compliance

## 🎨 Customization

### Theming
- Light/dark mode toggle included
- TailwindCSS for easy customization
- Consistent design system

### Branding
- Update logo and colors in components
- Modify footer links and company information
- Customize meta tags and SEO information

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📞 Support

For support and questions:
- Create an issue on GitHub
- Check the documentation
- Review existing issues and discussions

---

**Built with ❤️ for the PDF community**
# pdpdf
