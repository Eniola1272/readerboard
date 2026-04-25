'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface PdfMeta {
  numPages: number;
  title: string;
  author: string;
}

async function extractPdfMeta(file: File): Promise<PdfMeta> {
  const pdfjsLib = await import('pdfjs-dist');
  pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

  const arrayBuffer = await file.arrayBuffer();
  const doc = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const numPages = doc.numPages;

  let title = '';
  let author = '';

  try {
    const meta = await doc.getMetadata();
    const info = meta.info as Record<string, string>;
    title  = info?.Title?.trim()  ?? '';
    author = info?.Author?.trim() ?? '';
  } catch {
    // metadata absent — fall through to filename fallback
  }

  await doc.destroy();

  if (!title) {
    title = file.name
      .replace(/\.pdf$/i, '')
      .replace(/[-_]+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  return { numPages, title, author };
}

export default function UploadForm() {
  const router = useRouter();

  const [file,      setFile]      = useState<File | null>(null);
  const [meta,      setMeta]      = useState<PdfMeta | null>(null);
  const [title,     setTitle]     = useState('');
  const [author,    setAuthor]    = useState('');
  const [scanning,  setScanning]  = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error,     setError]     = useState('');

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0] ?? null;
    setFile(selected);
    setMeta(null);
    setTitle('');
    setAuthor('');
    setError('');
    if (!selected) return;

    setScanning(true);
    try {
      const extracted = await extractPdfMeta(selected);
      setMeta(extracted);
      setTitle(extracted.title);
      setAuthor(extracted.author);
    } catch {
      setError('Could not read PDF metadata — please enter the title manually.');
      // Still allow upload; show empty fields
      const fallbackTitle = selected.name.replace(/\.pdf$/i, '').replace(/[-_]+/g, ' ').trim();
      setMeta({ numPages: 0, title: fallbackTitle, author: '' });
      setTitle(fallbackTitle);
    } finally {
      setScanning(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !meta) { setError('Please select a PDF file.'); return; }
    if (!title.trim())  { setError('Please enter a title.');      return; }

    setUploading(true);
    setError('');

    try {
      const data = new FormData();
      data.append('file',       file);
      data.append('title',      title.trim());
      data.append('author',     author.trim());
      data.append('totalPages', String(meta.numPages));

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

            {scanning && (
              <p className="text-sm text-brand-500 animate-pulse">Scanning PDF…</p>
            )}
            {file && !scanning && (
              <p className="text-sm text-brand-600 font-medium">{file.name}</p>
            )}
          </div>
        </div>
      </div>

      {/* ── Metadata (shown after scan) ── */}
      {meta && !scanning && (
        <>
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

          {meta.numPages > 0 && (
            <div className="flex items-center gap-2 text-sm text-brand-600 bg-brand-50 border border-brand-200 px-4 py-2.5 rounded-lg">
              <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              {meta.numPages.toLocaleString()} pages
            </div>
          )}
        </>
      )}

      <button
        type="submit"
        disabled={uploading || scanning || !meta}
        className="w-full bg-brand-600 text-white py-3 rounded-pill font-semibold hover:bg-brand-700 disabled:bg-brand-200 disabled:cursor-not-allowed transition-colors shadow-glow text-sm"
      >
        {uploading ? 'Uploading…' : scanning ? 'Scanning…' : !meta ? 'Choose a PDF to continue' : 'Upload Book'}
      </button>
    </form>
  );
}
