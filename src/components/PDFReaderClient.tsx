'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import Link from 'next/link';

// Static file copied to /public by next.config.mjs — no CDN, no webpack bundling of the worker
pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

const ZOOM_STEPS = [0.5, 0.75, 1, 1.25, 1.5, 2];

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
  initialPage,
  totalPages,
  bookTitle,
}: PDFReaderProps) {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [page, setPage] = useState(Math.max(1, initialPage));
  const [pageInputVal, setPageInputVal] = useState(String(Math.max(1, initialPage)));
  const [zoom, setZoom] = useState(1);
  const [loadError, setLoadError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [pageWidth, setPageWidth] = useState(700);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Measure container for responsive page width
  useEffect(() => {
    const update = () => {
      if (containerRef.current) {
        const w = containerRef.current.clientWidth - 48;
        setPageWidth(Math.max(Math.min(w, 860), 200));
      }
    };
    update();
    const ro = new ResizeObserver(update);
    if (containerRef.current) ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  // Debounced progress save — fires 1.5s after last page change
  const scheduleProgressSave = useCallback((p: number) => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      fetch('/api/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookId, currentPage: p, totalPages }),
      }).catch(() => {});
    }, 1500);
  }, [bookId, totalPages]);

  useEffect(() => () => { if (saveTimer.current) clearTimeout(saveTimer.current); }, []);

  const total = numPages ?? totalPages;

  const goToPage = useCallback((target: number) => {
    const p = Math.max(1, Math.min(target, total));
    setPage(p);
    setPageInputVal(String(p));
    scheduleProgressSave(p);
    scrollAreaRef.current?.scrollTo({ top: 0, behavior: 'instant' });
  }, [total, scheduleProgressSave]);

  const zoomIn = useCallback(() => {
    setZoom(z => ZOOM_STEPS.find(s => s > z) ?? z);
  }, []);

  const zoomOut = useCallback(() => {
    setZoom(z => [...ZOOM_STEPS].reverse().find(s => s < z) ?? z);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement)?.tagName === 'INPUT') return;
      switch (e.key) {
        case 'ArrowLeft':
        case 'ArrowUp':
        case 'PageUp':
          e.preventDefault();
          goToPage(page - 1);
          break;
        case 'ArrowRight':
        case 'ArrowDown':
        case 'PageDown':
        case ' ':
          e.preventDefault();
          goToPage(page + 1);
          break;
        case '+': case '=': zoomIn(); break;
        case '-': zoomOut(); break;
        case 'Home': e.preventDefault(); goToPage(1); break;
        case 'End':  e.preventDefault(); goToPage(total); break;
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [page, total, goToPage, zoomIn, zoomOut]);

  const progress = Math.round((page / total) * 100);
  const scaledWidth = pageWidth * zoom;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', fontFamily: 'DM Sans, system-ui, sans-serif' }}>

      {/* ── Header ── */}
      <header style={{
        background: '#ffffff',
        borderBottom: '1px solid #e8e2da',
        height: 56,
        display: 'flex',
        alignItems: 'center',
        padding: '0 16px',
        gap: 12,
        flexShrink: 0,
        zIndex: 20,
      }}>
        {/* Back link */}
        <Link href="/library" style={{
          display: 'flex', alignItems: 'center', gap: 5,
          color: '#6b6560', textDecoration: 'none', fontSize: 13,
          flexShrink: 0, whiteSpace: 'nowrap',
        }}>
          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Library
        </Link>

        <div style={{ width: 1, height: 20, background: '#e8e2da', flexShrink: 0 }} />

        {/* Book title */}
        <span style={{
          fontFamily: 'Instrument Serif, Georgia, serif',
          fontSize: 17, color: '#1a1a1a',
          flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', minWidth: 0,
        }}>
          {bookTitle}
        </span>

        {/* Page navigation */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
          <button
            onClick={() => goToPage(page - 1)}
            disabled={page <= 1}
            title="Previous page (←)"
            style={arrowBtnStyle(page <= 1)}
          >
            ‹
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, color: '#6b6560' }}>
            <input
              type="number"
              min={1}
              max={total}
              value={pageInputVal}
              onChange={e => setPageInputVal(e.target.value)}
              onBlur={() => {
                const n = parseInt(pageInputVal);
                if (!isNaN(n)) goToPage(n);
                else setPageInputVal(String(page));
              }}
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  const n = parseInt(pageInputVal);
                  if (!isNaN(n)) goToPage(n);
                }
              }}
              style={{
                width: 44, textAlign: 'center',
                border: '1px solid #e8e2da', borderRadius: 4,
                padding: '2px 4px', fontSize: 13,
                fontFamily: 'DM Sans, sans-serif', color: '#1a1a1a',
                outline: 'none', MozAppearance: 'textfield',
              } as React.CSSProperties}
            />
            <span>/ {total}</span>
          </div>

          <button
            onClick={() => goToPage(page + 1)}
            disabled={page >= total}
            title="Next page (→)"
            style={arrowBtnStyle(page >= total)}
          >
            ›
          </button>
        </div>

        {/* Zoom controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
          <button onClick={zoomOut} title="Zoom out (-)" style={iconBtnStyle}>−</button>
          <span style={{ fontSize: 12, color: '#6b6560', minWidth: 38, textAlign: 'center' }}>
            {Math.round(zoom * 100)}%
          </span>
          <button onClick={zoomIn} title="Zoom in (+)" style={iconBtnStyle}>+</button>
        </div>

        {/* Progress badge */}
        <div style={{
          background: '#FDF3D7', borderRadius: 9999,
          padding: '3px 12px', fontSize: 12,
          color: '#B45309', fontWeight: 600,
          flexShrink: 0,
        }}>
          {progress}%
        </div>
      </header>

      {/* Progress bar */}
      <div style={{ height: 2, background: '#e8e2da', flexShrink: 0 }}>
        <div style={{
          height: '100%', width: `${progress}%`,
          background: '#B45309', transition: 'width 0.4s ease',
        }} />
      </div>

      {/* ── Reading area ── */}
      <div
        ref={scrollAreaRef}
        style={{ flex: 1, overflowY: 'auto', overflowX: 'auto', background: '#FAF7F2' }}
      >
        <div
          ref={containerRef}
          style={{
            minHeight: '100%',
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            padding: '40px 24px 80px',
          }}
        >
          {loadError ? (
            <ErrorState error={loadError} />
          ) : (
            <Document
              file={fileUrl}
              onLoadSuccess={({ numPages: n }) => setNumPages(n)}
              onLoadError={err => setLoadError(err.message || 'Failed to load PDF')}
              loading={<DocLoadingPlaceholder />}
              error={<DocLoadingPlaceholder label="Could not open file." />}
            >
              <div style={{ boxShadow: '0 8px 48px rgba(0,0,0,0.13)', borderRadius: 2, background: '#fff', overflow: 'hidden' }}>
                <Page
                  key={`${page}-${scaledWidth}`}
                  pageNumber={page}
                  width={scaledWidth}
                  renderTextLayer
                  renderAnnotationLayer
                  loading={<PagePlaceholder width={scaledWidth} />}
                />
              </div>
            </Document>
          )}

          {/* Bottom navigation */}
          {!loadError && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 32 }}>
              <button
                onClick={() => goToPage(page - 1)}
                disabled={page <= 1}
                style={navBtnStyle(page <= 1)}
              >
                ← Previous
              </button>
              <span style={{ fontSize: 13, color: '#6b6560' }}>
                Page {page} of {total}
              </span>
              <button
                onClick={() => goToPage(page + 1)}
                disabled={page >= total}
                style={navBtnStyle(page >= total)}
              >
                Next →
              </button>
            </div>
          )}

          {/* Keyboard hint */}
          <p style={{ marginTop: 20, fontSize: 11, color: '#b0a898', textAlign: 'center' }}>
            ← → arrow keys to navigate · + − to zoom · click page number to jump
          </p>
        </div>
      </div>
    </div>
  );
}

// ── Sub-components ──

function DocLoadingPlaceholder({ label = 'Loading document…' }: { label?: string }) {
  return (
    <div style={{
      width: 620, height: 800,
      background: '#F5F0E8', borderRadius: 2,
      boxShadow: '0 8px 48px rgba(0,0,0,0.13)',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', gap: 12,
    }}>
      <div style={{ fontSize: 36 }}>📖</div>
      <p style={{ fontFamily: 'DM Sans, sans-serif', color: '#6b6560', fontSize: 14 }}>{label}</p>
    </div>
  );
}

function PagePlaceholder({ width }: { width: number }) {
  return (
    <div style={{
      width, height: Math.round(width * 1.414),
      background: '#F5F0E8',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <p style={{ fontFamily: 'DM Sans, sans-serif', color: '#a09890', fontSize: 13 }}>
        Rendering…
      </p>
    </div>
  );
}

function ErrorState({ error }: { error: string }) {
  return (
    <div style={{ marginTop: 80, textAlign: 'center', maxWidth: 380 }}>
      <div style={{ fontSize: 48, marginBottom: 16 }}>📄</div>
      <h2 style={{
        fontFamily: 'Instrument Serif, serif', fontWeight: 400,
        fontSize: 28, color: '#1a1a1a', marginBottom: 8,
      }}>
        Couldn&apos;t load this PDF
      </h2>
      <p style={{ color: '#6b6560', fontSize: 14, marginBottom: 24, lineHeight: 1.6 }}>
        {error}
      </p>
      <Link href="/library" style={{
        display: 'inline-block', padding: '10px 28px',
        background: '#1a1a1a', color: '#FAF7F2', borderRadius: 9999,
        textDecoration: 'none', fontSize: 14, fontFamily: 'DM Sans, sans-serif',
      }}>
        ← Back to Library
      </Link>
    </div>
  );
}

// ── Style helpers ──

const arrowBtnStyle = (disabled: boolean): React.CSSProperties => ({
  width: 28, height: 28,
  border: '1px solid #e8e2da', borderRadius: 6,
  background: 'none',
  cursor: disabled ? 'not-allowed' : 'pointer',
  color: disabled ? '#d0c4b0' : '#6b6560',
  fontSize: 20, lineHeight: 1,
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  padding: 0, flexShrink: 0,
});

const iconBtnStyle: React.CSSProperties = {
  width: 28, height: 28,
  border: '1px solid #e8e2da', borderRadius: 6,
  background: 'none', cursor: 'pointer',
  color: '#6b6560', fontSize: 16,
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  padding: 0,
};

const navBtnStyle = (disabled: boolean): React.CSSProperties => ({
  padding: '9px 24px', borderRadius: 9999, border: 'none',
  background: disabled ? '#F5F0E8' : '#1a1a1a',
  color: disabled ? '#d0c4b0' : '#FAF7F2',
  cursor: disabled ? 'not-allowed' : 'pointer',
  fontFamily: 'DM Sans, sans-serif',
  fontSize: 14, fontWeight: 500,
});
