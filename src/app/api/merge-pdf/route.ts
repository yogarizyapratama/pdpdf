import { NextRequest, NextResponse } from 'next/server'
import { PDFDocument } from 'pdf-lib'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const files: File[] = []
    
    // Extract all PDF files from form data
    for (const [, value] of formData.entries()) {
      if (value instanceof File && value.type === 'application/pdf') {
        files.push(value)
      }
    }
    
    if (files.length < 2) {
      return NextResponse.json(
        { error: 'At least 2 PDF files are required for merging' },
        { status: 400 }
      )
    }
    
    // Create a new PDF document
    const mergedPdf = await PDFDocument.create()
    
    // Process each PDF file
    for (const file of files) {
      const arrayBuffer = await file.arrayBuffer()
      const pdf = await PDFDocument.load(arrayBuffer)
      
      // Copy all pages from the current PDF
      const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices())
      
      // Add the copied pages to the merged PDF
      copiedPages.forEach((page) => {
        mergedPdf.addPage(page)
      })
    }
    
    // Save the merged PDF
    const mergedPdfBytes = await mergedPdf.save()
    
    // Return the merged PDF as a response
    return new NextResponse(mergedPdfBytes, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="merged-document.pdf"',
        'Content-Length': mergedPdfBytes.length.toString(),
      },
    })
  } catch (error) {
    console.error('Error merging PDFs:', error)
    return NextResponse.json(
      { error: 'Failed to merge PDF files. Please ensure all files are valid PDFs.' },
      { status: 500 }
    )
  }
}