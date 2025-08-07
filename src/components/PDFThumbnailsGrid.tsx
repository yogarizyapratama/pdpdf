import PDFThumbnail from './PDFThumbnail';

interface PDFThumbnailsGridProps {
  pdfFile: File | ArrayBuffer;
  totalPages: number;
}

const PDFThumbnailsGrid: React.FC<PDFThumbnailsGridProps> = ({ pdfFile, totalPages }) => (
  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
    {Array.from({ length: totalPages }).map((_, idx) => (
      <PDFThumbnail key={idx} pdfFile={pdfFile} pageNumber={idx + 1} />
    ))}
  </div>
);

export default PDFThumbnailsGrid;
