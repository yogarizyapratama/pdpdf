<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

# PDF Tools Application - Copilot Instructions

This is a comprehensive PDF manipulation web application built with Next.js App Router, TypeScript, and TailwindCSS.

## Key Technologies and Libraries:
- **Frontend**: Next.js 14+ with App Router, React 18+, TypeScript
- **Styling**: TailwindCSS for responsive design
- **PDF Processing**: pdf-lib, PDF.js, react-pdf for client-side operations
- **File Handling**: react-beautiful-dnd for drag-and-drop functionality
- **OCR**: Tesseract.js for client-side text recognition
- **Conversion**: html2pdf.js, mammoth for document conversion

## Architecture Guidelines:
1. **Client-Side First**: Prioritize client-side processing using WASM and Web Workers for performance and privacy
2. **Mobile-First**: Design responsive layouts starting from mobile breakpoints
3. **Component Structure**: Use atomic design principles with reusable components
4. **Performance**: Implement lazy loading, code splitting, and optimized images
5. **SEO**: Use proper meta tags, structured data, and semantic HTML

## Feature Categories:
- **Organize**: Merge, split, remove pages, extract pages, organize pages, scan to PDF
- **Optimize**: Compress, repair, OCR
- **Convert To PDF**: JPG, Word, PowerPoint, Excel, HTML to PDF
- **Convert From PDF**: PDF to JPG, Word, PowerPoint, Excel, PDF/A
- **Edit**: Rotate, add page numbers, watermark, crop, basic editing
- **Security**: Unlock, protect, sign, redact, compare PDFs

## Code Style:
- Use TypeScript strict mode
- Implement proper error handling and loading states
- Use React hooks and modern patterns
- Follow Next.js App Router conventions
- Implement proper accessibility (a11y)
- Use Tailwind utility classes consistently
