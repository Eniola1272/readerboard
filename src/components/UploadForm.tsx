'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function UploadForm() {
  const router = useRouter();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    totalPages: '',
  });
  const [file, setFile] = useState<File | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a file');
      return;
    }

    setUploading(true);
    setError('');

    try {
      const data = new FormData();
      data.append('file', file);
      data.append('title', formData.title);
      data.append('author', formData.author);
      data.append('totalPages', formData.totalPages);

      const res = await fetch('/api/books/upload', {
        method: 'POST',
        body: data,
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error || 'Upload failed');
      }

      router.push('/library');
      router.refresh();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setError(errorMessage);
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

      <div>
        <label className="block text-sm font-medium text-brand-950 mb-2">
          Book Title *
        </label>
        <input
          type="text"
          required
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          className="w-full px-4 py-2.5 border border-brand-200 rounded-lg focus:ring-2 focus:ring-brand-400 focus:border-brand-400 bg-brand-50/30 text-brand-950 placeholder-gray-400 outline-none transition-colors"
          placeholder="Enter book title"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-brand-950 mb-2">
          Author
        </label>
        <input
          type="text"
          value={formData.author}
          onChange={(e) => setFormData({ ...formData, author: e.target.value })}
          className="w-full px-4 py-2.5 border border-brand-200 rounded-lg focus:ring-2 focus:ring-brand-400 focus:border-brand-400 bg-brand-50/30 text-brand-950 placeholder-gray-400 outline-none transition-colors"
          placeholder="Enter author name"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-brand-950 mb-2">
          Total Pages *
        </label>
        <input
          type="number"
          required
          min="1"
          value={formData.totalPages}
          onChange={(e) => setFormData({ ...formData, totalPages: e.target.value })}
          className="w-full px-4 py-2.5 border border-brand-200 rounded-lg focus:ring-2 focus:ring-brand-400 focus:border-brand-400 bg-brand-50/30 text-brand-950 placeholder-gray-400 outline-none transition-colors"
          placeholder="Enter total number of pages"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-brand-950 mb-2">
          Upload File (PDF) *
        </label>
        <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-brand-200 border-dashed rounded-card hover:border-brand-400 transition-colors bg-brand-50/20">
          <div className="space-y-2 text-center">
            <svg
              className="mx-auto h-12 w-12 text-brand-300"
              stroke="currentColor"
              fill="none"
              viewBox="0 0 48 48"
            >
              <path
                d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <div className="flex text-sm text-gray-500 justify-center">
              <label className="relative cursor-pointer font-medium text-brand-600 hover:text-brand-700">
                <span>Upload a file</span>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="sr-only"
                  required
                />
              </label>
              <p className="pl-1">or drag and drop</p>
            </div>
            <p className="text-xs text-gray-400">PDF up to 50MB</p>
            {file && (
              <p className="text-sm text-brand-600 font-medium mt-2">
                Selected: {file.name}
              </p>
            )}
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={uploading}
        className="w-full bg-brand-600 text-white py-3 rounded-pill font-semibold hover:bg-brand-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors shadow-glow"
      >
        {uploading ? 'Uploading...' : 'Upload Book'}
      </button>
    </form>
  );
}
