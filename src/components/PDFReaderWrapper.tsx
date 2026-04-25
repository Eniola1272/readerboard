'use client';

import dynamic from 'next/dynamic';

// react-pdf uses canvas and other browser-only APIs.
// ssr: false prevents it from ever being evaluated in Node during SSR.
const PDFReaderClient = dynamic(() => import('./PDFReaderClient'), {
  ssr: false,
  loading: () => (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', height: '100vh', gap: 12,
      background: '#FAF7F2', fontFamily: 'DM Sans, system-ui, sans-serif',
    }}>
      <span style={{ fontSize: 36 }}>📖</span>
      <p style={{ color: '#6b6560', fontSize: 14 }}>Loading reader…</p>
    </div>
  ),
});

interface Props {
  fileUrl: string;
  bookId: string;
  userId: string;
  initialPage: number;
  totalPages: number;
  bookTitle: string;
}

export default function PDFReaderWrapper(props: Props) {
  return <PDFReaderClient {...props} />;
}
