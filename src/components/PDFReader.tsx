'use client';

import { useState, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

export default function PDFReader({ fileUrl, bookId, userId }: any) {
  const [numPages, setNumPages] = useState(0);
  const [pageNumber, setPageNumber] = useState(1);

  useEffect(() => {
    if (numPages > 0) {
      fetch('/api/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, bookId, currentPage: pageNumber }),
      });
    }
  }, [pageNumber, numPages]);

  return (
    <div className="flex flex-col items-center gap-4 p-4">
      <Document
        file={fileUrl}
        onLoadSuccess={({ numPages }) => setNumPages(numPages)}
      >
        <Page pageNumber={pageNumber} />
      </Document>

      <div className="flex gap-4">
        <button
          onClick={() => setPageNumber(p => Math.max(p - 1, 1))}
          disabled={pageNumber <= 1}
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          Previous
        </button>
        <span>Page {pageNumber} of {numPages}</span>
        <button
          onClick={() => setPageNumber(p => Math.min(p + 1, numPages))}
          disabled={pageNumber >= numPages}
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          Next
        </button>
      </div>
    </div>
  );
}