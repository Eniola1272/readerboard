'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function DeleteBookButton({ bookId }: { bookId: string }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [deleting,   setDeleting]   = useState(false);

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault(); // don't follow the card link
    e.stopPropagation();

    if (!confirming) { setConfirming(true); return; }

    setDeleting(true);
    try {
      const res = await fetch(`/api/books/${bookId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Delete failed');
      router.refresh();
    } catch {
      setDeleting(false);
      setConfirming(false);
    }
  };

  const handleCancel = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setConfirming(false);
  };

  if (confirming) {
    return (
      <div
        className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/60 backdrop-blur-sm rounded-t-card"
        onClick={e => { e.preventDefault(); e.stopPropagation(); }}
      >
        <p className="text-white text-xs font-medium text-center px-3">Remove this book?</p>
        <div className="flex gap-2">
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white text-xs rounded-full font-medium transition-colors"
          >
            {deleting ? 'Removing…' : 'Remove'}
          </button>
          <button
            onClick={handleCancel}
            className="px-3 py-1.5 bg-white/20 hover:bg-white/30 text-white text-xs rounded-full font-medium transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={handleDelete}
      title="Remove book"
      className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/40 hover:bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200"
    >
      <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
      </svg>
    </button>
  );
}
