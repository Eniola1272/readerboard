'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import type { PDFDocumentProxy, RenderTask } from 'pdfjs-dist';
import Link from 'next/link';

// pdfjs-dist is loaded dynamically inside useEffect so it never runs on the server.
// The worker is a static file in /public — no CDN, no webpack bundling of the worker.

const ZOOM_STEPS = [0.5, 0.75, 1, 1.25, 1.5, 2];

interface Props {
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
}: Props) {
  const canvasRef     = useRef<HTMLCanvasElement>(null);
  const containerRef  = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const renderTaskRef = useRef<RenderTask | null>(null);
  const renderGenRef  = useRef(0);
  const pdfRef        = useRef<PDFDocumentProxy | null>(null);
  const saveTimer     = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [numPages,      setNumPages]      = useState<number | null>(null);
  const [page,          setPage]          = useState(Math.max(1, initialPage));
  const [pageInputVal,  setPageInputVal]  = useState(String(Math.max(1, initialPage)));
  const [zoom,          setZoom]          = useState(1);
  const [docLoading,    setDocLoading]    = useState(true);
  const [pageRendering, setPageRendering] = useState(false);
  const [error,         setError]         = useState<string | null>(null);

  // ── Load PDF document ──────────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const pdfjsLib = await import('pdfjs-dist');
        pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

        const doc = await pdfjsLib.getDocument({ url: fileUrl }).promise;
        if (cancelled) { doc.destroy(); return; }

        pdfRef.current = doc;
        setNumPages(doc.numPages);
        setDocLoading(false);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load PDF');
          setDocLoading(false);
        }
      }
    };

    load();
    return () => {
      cancelled = true;
      pdfRef.current?.destroy();
      pdfRef.current = null;
    };
  }, [fileUrl]);

  // ── Render page to canvas ──────────────────────────────────────────────────
  const renderPage = useCallback(async (pageNum: number, zoomLevel: number) => {
    const doc       = pdfRef.current;
    const canvas    = canvasRef.current;
    const container = containerRef.current;
    if (!doc || !canvas || !container) return;

    // Each render call gets a unique generation id.
    // After every await we check whether a newer call superseded us.
    const gen = ++renderGenRef.current;

    // Cancel in-flight render and wait for the canvas to be released.
    if (renderTaskRef.current) {
      const prev = renderTaskRef.current;
      renderTaskRef.current = null;
      prev.cancel();
      try { await prev.promise; } catch { /* RenderingCancelledException expected */ }
    }

    // A newer renderPage call started while we were awaiting cancellation.
    if (gen !== renderGenRef.current) return;

    setPageRendering(true);

    try {
      const pdfPage = await doc.getPage(pageNum);
      if (gen !== renderGenRef.current) return;
      if (!canvasRef.current) return;

      const dpr            = window.devicePixelRatio || 1;
      const rawWidth       = container.clientWidth || 600;
      const availableWidth = Math.max(200, Math.min(rawWidth - 48, 900));
      const naturalVp      = pdfPage.getViewport({ scale: 1 });
      const scale          = (availableWidth / naturalVp.width) * zoomLevel * dpr;
      const viewport       = pdfPage.getViewport({ scale });
      const ctx            = canvas.getContext('2d')!;

      canvas.width        = viewport.width;
      canvas.height       = viewport.height;
      canvas.style.width  = `${viewport.width  / dpr}px`;
      canvas.style.height = `${viewport.height / dpr}px`;

      const task = pdfPage.render({ canvasContext: ctx, viewport });
      renderTaskRef.current = task;
      await task.promise;

      if (gen !== renderGenRef.current) return;
      setPageRendering(false);
    } catch (err: unknown) {
      if (gen !== renderGenRef.current) return;
      const name = err && typeof err === 'object' && 'name' in err
        ? (err as { name: string }).name : '';
      if (name !== 'RenderingCancelledException') {
        console.error('[PDFReader] renderPage error:', err);
        const msg = err instanceof Error ? err.message : String(err);
        setError(`Render failed: ${msg}`);
      }
      setPageRendering(false);
    }
  }, []);

  // Re-render whenever page or zoom changes (and document is ready)
  useEffect(() => {
    if (!docLoading && !error) renderPage(page, zoom);
  }, [page, zoom, docLoading, error, renderPage]);

  // Re-render on container resize
  useEffect(() => {
    const ro = new ResizeObserver(() => {
      if (!docLoading && !error) renderPage(page, zoom);
    });
    if (containerRef.current) ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, [page, zoom, docLoading, error, renderPage]);

  // ── Progress save (debounced) ──────────────────────────────────────────────
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

  // ── Navigation ─────────────────────────────────────────────────────────────
  const total = numPages ?? totalPages;

  const goToPage = useCallback((target: number) => {
    const p = Math.max(1, Math.min(target, total));
    setPage(p);
    setPageInputVal(String(p));
    scheduleProgressSave(p);
    scrollAreaRef.current?.scrollTo({ top: 0, behavior: 'instant' });
  }, [total, scheduleProgressSave]);

  const zoomIn  = useCallback(() => setZoom(z => ZOOM_STEPS.find(s => s > z) ?? z), []);
  const zoomOut = useCallback(() => setZoom(z => [...ZOOM_STEPS].reverse().find(s => s < z) ?? z), []);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement)?.tagName === 'INPUT') return;
      switch (e.key) {
        case 'ArrowLeft':  case 'ArrowUp':   case 'PageUp':
          e.preventDefault(); goToPage(page - 1); break;
        case 'ArrowRight': case 'ArrowDown': case 'PageDown': case ' ':
          e.preventDefault(); goToPage(page + 1); break;
        case '+': case '=': zoomIn();  break;
        case '-':           zoomOut(); break;
        case 'Home': e.preventDefault(); goToPage(1);     break;
        case 'End':  e.preventDefault(); goToPage(total); break;
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [page, total, goToPage, zoomIn, zoomOut]);

  const progress = Math.round((page / total) * 100);

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', fontFamily: 'DM Sans, system-ui, sans-serif' }}>

      {/* Header */}
      <header style={{
        background: '#ffffff', borderBottom: '1px solid #e8e2da',
        height: 56, display: 'flex', alignItems: 'center',
        padding: '0 16px', gap: 12, flexShrink: 0, zIndex: 20,
      }}>
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
            onClick={() => goToPage(page - 1)} disabled={page <= 1}
            title="Previous page (←)" style={arrowBtnStyle(page <= 1)}
          >‹</button>

          <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, color: '#6b6560' }}>
            <input
              type="number" min={1} max={total} value={pageInputVal}
              onChange={e => setPageInputVal(e.target.value)}
              onBlur={() => {
                const n = parseInt(pageInputVal);
                if (!isNaN(n)) goToPage(n); else setPageInputVal(String(page));
              }}
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  const n = parseInt(pageInputVal);
                  if (!isNaN(n)) goToPage(n);
                }
              }}
              style={{
                width: 44, textAlign: 'center', border: '1px solid #e8e2da',
                borderRadius: 4, padding: '2px 4px', fontSize: 13,
                fontFamily: 'DM Sans, sans-serif', color: '#1a1a1a', outline: 'none',
              }}
            />
            <span>/ {total}</span>
          </div>

          <button
            onClick={() => goToPage(page + 1)} disabled={page >= total}
            title="Next page (→)" style={arrowBtnStyle(page >= total)}
          >›</button>
        </div>

        {/* Zoom */}
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
          padding: '3px 12px', fontSize: 12, color: '#B45309', fontWeight: 600, flexShrink: 0,
        }}>
          {progress}%
        </div>
      </header>

      {/* Thin progress bar */}
      <div style={{ height: 2, background: '#e8e2da', flexShrink: 0 }}>
        <div style={{ height: '100%', width: `${progress}%`, background: '#B45309', transition: 'width 0.4s ease' }} />
      </div>

      {/* Reading area */}
      <div ref={scrollAreaRef} style={{ flex: 1, overflowY: 'auto', overflowX: 'auto', background: '#FAF7F2' }}>
        <div
          ref={containerRef}
          style={{ minHeight: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px 24px 80px' }}
        >
          {docLoading ? (
            <Placeholder label="Loading document…" />
          ) : error ? (
            <ErrorState error={error} />
          ) : (
            <>
              {/* Canvas wrapper */}
              <div style={{ position: 'relative', boxShadow: '0 8px 48px rgba(0,0,0,0.13)', borderRadius: 2, background: '#fff', lineHeight: 0 }}>
                <canvas ref={canvasRef} style={{ display: 'block' }} />
                {pageRendering && (
                  <div style={{
                    position: 'absolute', inset: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: 'rgba(250,247,242,0.65)',
                  }}>
                    <span style={{ fontSize: 13, color: '#6b6560' }}>Rendering…</span>
                  </div>
                )}
              </div>

              {/* Bottom nav */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 32 }}>
                <button onClick={() => goToPage(page - 1)} disabled={page <= 1} style={navBtnStyle(page <= 1)}>
                  ← Previous
                </button>
                <span style={{ fontSize: 13, color: '#6b6560' }}>Page {page} of {total}</span>
                <button onClick={() => goToPage(page + 1)} disabled={page >= total} style={navBtnStyle(page >= total)}>
                  Next →
                </button>
              </div>

              <p style={{ marginTop: 20, fontSize: 11, color: '#b0a898', textAlign: 'center' }}>
                ← → to navigate · + − to zoom · click page number to jump
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function Placeholder({ label }: { label: string }) {
  return (
    <div style={{
      width: 580, height: 780, background: '#F5F0E8', borderRadius: 2,
      boxShadow: '0 8px 48px rgba(0,0,0,0.13)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12,
    }}>
      <span style={{ fontSize: 36 }}>📖</span>
      <p style={{ fontFamily: 'DM Sans, sans-serif', color: '#6b6560', fontSize: 14 }}>{label}</p>
    </div>
  );
}

function ErrorState({ error }: { error: string }) {
  return (
    <div style={{ marginTop: 80, textAlign: 'center', maxWidth: 380 }}>
      <div style={{ fontSize: 48, marginBottom: 16 }}>📄</div>
      <h2 style={{ fontFamily: 'Instrument Serif, serif', fontWeight: 400, fontSize: 28, color: '#1a1a1a', marginBottom: 8 }}>
        Couldn&apos;t load this PDF
      </h2>
      <p style={{ color: '#6b6560', fontSize: 14, marginBottom: 24, lineHeight: 1.6 }}>{error}</p>
      <Link href="/library" style={{
        display: 'inline-block', padding: '10px 28px',
        background: '#1a1a1a', color: '#FAF7F2', borderRadius: 9999,
        textDecoration: 'none', fontSize: 14,
      }}>
        ← Back to Library
      </Link>
    </div>
  );
}

// ── Style helpers ─────────────────────────────────────────────────────────────

const arrowBtnStyle = (disabled: boolean): React.CSSProperties => ({
  width: 28, height: 28, border: '1px solid #e8e2da', borderRadius: 6,
  background: 'none', cursor: disabled ? 'not-allowed' : 'pointer',
  color: disabled ? '#d0c4b0' : '#6b6560', fontSize: 20, lineHeight: 1,
  display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0, flexShrink: 0,
});

const iconBtnStyle: React.CSSProperties = {
  width: 28, height: 28, border: '1px solid #e8e2da', borderRadius: 6,
  background: 'none', cursor: 'pointer', color: '#6b6560', fontSize: 16,
  display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0,
};

const navBtnStyle = (disabled: boolean): React.CSSProperties => ({
  padding: '9px 24px', borderRadius: 9999, border: 'none',
  background: disabled ? '#F5F0E8' : '#1a1a1a',
  color: disabled ? '#d0c4b0' : '#FAF7F2',
  cursor: disabled ? 'not-allowed' : 'pointer',
  fontFamily: 'DM Sans, sans-serif', fontSize: 14, fontWeight: 500,
});
