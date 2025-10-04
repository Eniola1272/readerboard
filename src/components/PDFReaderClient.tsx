'use client';

import { useState, useEffect } from 'react';
import { Viewer, Worker } from '@react-pdf-viewer/core';
import { defaultLayoutPlugin } from '@react-pdf-viewer/default-layout';
import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/default-layout/lib/styles/index.css';
import Link from 'next/link';

interface PDFReaderProps {
  fileUrl: string;
  bookId: string;
  userId: string;
  initialPage: number;
  totalPages: number;
  bookTitle: string;
}

export default function PDFReaderClient({
  fileUrl,
  bookId,
  userId,
  initialPage,
  totalPages,
  bookTitle,
}: PDFReaderProps) {
  const [currentPage, setCurrentPage] = useState(initialPage);
  const defaultLayoutPluginInstance = defaultLayoutPlugin();

  useEffect(() => {
    const updateProgress = async () => {
      await fetch('/api/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookId,
          currentPage,
          totalPages,
        }),
      });
    };
    
    if (currentPage > 0) {
      updateProgress();
    }
  }, [currentPage, bookId, totalPages]);

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/library" className="text-gray-400 hover:text-white">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </Link>
            <h1 className="text-white font-medium truncate max-w-md">{bookTitle}</h1>
          </div>
          
          <div className="flex items-center gap-4 text-gray-400">
            <span className="text-sm">
              Page {currentPage} of {totalPages}
            </span>
            <span className="text-sm">
              {Math.round((currentPage / totalPages) * 100)}%
            </span>
          </div>
        </div>
      </div>

      {/* PDF Viewer */}
      <div className="h-[calc(100vh-64px)]">
        <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
          <Viewer
            fileUrl={fileUrl}
            defaultScale={1.2}
            initialPage={initialPage - 1}
            onPageChange={(e) => setCurrentPage(e.currentPage + 1)}
            plugins={[defaultLayoutPluginInstance]}
            theme="dark"
          />
        </Worker>
      </div>
    </div>
  );
}