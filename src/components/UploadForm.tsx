'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

interface PdfMeta {
  numPages: number;
  title: string;
  author: string;
}

interface ScanResult {
  meta: PdfMeta;
  thumbnailUrl: string | null;  // object URL for preview
  thumbnailBlob: Blob | null;   // sent to the server
}

async function scanPdf(file: File): Promise<ScanResult> {
  const pdfjsLib = await import('pdfjs-dist');
  pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

  const arrayBuffer = await file.arrayBuffer();
  const doc = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const numPages = doc.numPages;

  // ── Metadata ──
  let title = '';
  let author = '';
  try {
    const m = await doc.getMetadata();
    const info = m.info as Record<string, string>;
    title  = info?.Title?.trim()  ?? '';
    author = info?.Author?.trim() ?? '';
  } catch { /* no metadata — fine */ }

  if (!title) {
    title = file.name.replace(/\.pdf$/i, '').replace(/[-_]+/g, ' ').replace(/\s+/g, ' ').trim();
  }

  // ── Thumbnail from page 1 ──
  let thumbnailUrl: string | null = null;
  let thumbnailBlob: Blob | null = null;
  try {
    const page = await doc.getPage(1);
    const naturalVp = page.getViewport({ scale: 1 });
    const scale = 400 / naturalVp.width;
    const viewport = page.getViewport({ scale });

    const canvas = document.createElement('canvas');
    canvas.width  = viewport.width;
    canvas.height = viewport.height;
    await page.render({ canvasContext: canvas.getContext('2d')!, viewport }).promise;

    thumbnailBlob = await new Promise<Blob | null>(res =>
      canvas.toBlob(res, 'image/jpeg', 0.88)
    );
    if (thumbnailBlob) thumbnailUrl = URL.createObjectURL(thumbnailBlob);
  } catch { /* thumbnail optional */ }

  await doc.destroy();
  return { meta: { numPages, title, author }, thumbnailUrl, thumbnailBlob };
}

export default function UploadForm() {
  const router = useRouter();

  const [file,         setFile]         = useState<File | null>(null);
  const [scan,         setScan]         = useState<ScanResult | null>(null);
  const [title,        setTitle]        = useState('');
  const [author,       setAuthor]       = useState('');
  const [scanning,     setScanning]     = useState(false);
  const [uploading,    setUploading]    = useState(false);
  const [error,        setError]        = useState('');

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0] ?? null;
    // Revoke previous preview URL to avoid memory leak
    if (scan?.thumbnailUrl) URL.revokeObjectURL(scan.thumbnailUrl);
    setFile(selected);
    setScan(null);
    setTitle('');
    setAuthor('');
    setError('');
    if (!selected) return;

    setScanning(true);
    try {
      const result = await scanPdf(selected);
      setScan(result);
      setTitle(result.meta.title);
      setAuthor(result.meta.author);
    } catch {
      const fallback = selected.name.replace(/\.pdf$/i, '').replace(/[-_]+/g, ' ').trim();
      setScan({ meta: { numPages: 0, title: fallback, author: '' }, thumbnailUrl: null, thumbnailBlob: null });
      setTitle(fallback);
      setError('Could not read PDF metadata — please verify the title.');
    } finally {
      setScanning(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !scan) { setError('Please select a PDF file.'); return; }
    if (!title.trim())  { setError('Please enter a title.');      return; }

    setUploading(true);
    setError('');
    try {
      const data = new FormData();
      data.append('file',       file);
      data.append('title',      title.trim());
      data.append('author',     author.trim());
      data.append('totalPages', String(scan.meta.numPages));
      if (scan.thumbnailBlob) {
        data.append('thumbnail', scan.thumbnailBlob, 'cover.jpg');
      }

      const res = await fetch('/api/books/upload', { method: 'POST', body: data });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Upload failed');

      router.push('/library');
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-card shadow-soft p-8 space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* ── File picker ── */}
      <div>
        <label className="block text-sm font-medium text-brand-950 mb-2">PDF File *</label>
        <div className="flex justify-center px-6 pt-5 pb-6 border-2 border-brand-200 border-dashed rounded-card hover:border-brand-400 transition-colors bg-brand-50/20">
          <div className="space-y-2 text-center">
            <svg className="mx-auto h-12 w-12 text-brand-300" stroke="currentColor" fill="none" viewBox="0 0 48 48">
              <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <div className="flex text-sm text-brand-500 justify-center">
              <label className="relative cursor-pointer font-medium text-brand-600 hover:text-brand-700">
                <span>Choose a PDF</span>
                <input type="file" accept=".pdf,.PDF" onChange={handleFileChange} className="sr-only" />
              </label>
              <p className="pl-1">or drag and drop</p>
            </div>
            <p className="text-xs text-brand-400">PDF up to 50 MB</p>
            {scanning && <p className="text-sm text-brand-500 animate-pulse">Scanning PDF…</p>}
            {file && !scanning && <p className="text-sm text-brand-600 font-medium">{file.name}</p>}
          </div>
        </div>
      </div>

      {/* ── Metadata + cover preview (shown after scan) ── */}
      {scan && !scanning && (
        <div className="flex gap-6">
          {/* Cover thumbnail */}
          <div className="flex-shrink-0 w-28">
            <div className="aspect-[3/4] rounded-lg overflow-hidden bg-brand-100 border border-brand-200 shadow-sm">
              {scan.thumbnailUrl ? (
                <Image
                  src={scan.thumbnailUrl}
                  alt="Cover preview"
                  width={112}
                  height={150}
                  className="w-full h-full object-cover"
                  unoptimized
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <svg className="w-10 h-10 text-brand-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                      d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
              )}
            </div>
            {scan.meta.numPages > 0 && (
              <p className="text-xs text-brand-500 text-center mt-1.5">{scan.meta.numPages.toLocaleString()} pages</p>
            )}
          </div>

          {/* Fields */}
          <div className="flex-1 space-y-4">
            <div>
              <label className="block text-sm font-medium text-brand-950 mb-1.5">Book Title *</label>
              <input
                type="text"
                required
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="w-full px-4 py-2.5 border border-brand-200 rounded-lg focus:ring-2 focus:ring-brand-400 focus:border-brand-400 bg-brand-50/30 text-brand-950 placeholder-brand-400 outline-none transition-colors text-sm"
                placeholder="Book title"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-brand-950 mb-1.5">Author</label>
              <input
                type="text"
                value={author}
                onChange={e => setAuthor(e.target.value)}
                className="w-full px-4 py-2.5 border border-brand-200 rounded-lg focus:ring-2 focus:ring-brand-400 focus:border-brand-400 bg-brand-50/30 text-brand-950 placeholder-brand-400 outline-none transition-colors text-sm"
                placeholder="Author name"
              />
            </div>
          </div>
        </div>
      )}

      <button
        type="submit"
        disabled={uploading || scanning || !scan}
        className="w-full bg-brand-600 text-white py-3 rounded-pill font-semibold hover:bg-brand-700 disabled:bg-brand-200 disabled:cursor-not-allowed transition-colors shadow-glow text-sm"
      >
        {uploading ? 'Uploading…' : scanning ? 'Scanning…' : !scan ? 'Choose a PDF to continue' : 'Upload Book'}
      </button>
    </form>
  );
}
