import { copyFileSync, existsSync } from 'fs';
import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const require = createRequire(import.meta.url);
const __dirname = dirname(fileURLToPath(import.meta.url));

// Copy the PDF.js worker to public/ so it's served as a plain static file.
// This avoids webpack trying to minify an ESM worker file (which breaks Terser).
try {
  const workerSrc = require.resolve('pdfjs-dist/build/pdf.worker.min.mjs');
  const workerDest = join(__dirname, 'public', 'pdf.worker.min.mjs');
  if (!existsSync(workerDest)) {
    copyFileSync(workerSrc, workerDest);
  }
} catch {
  // Non-fatal: worker may already exist or path may differ
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['react-pdf', 'pdfjs-dist'],
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
      { protocol: 'https', hostname: '*.googleusercontent.com' },
    ],
  },
  webpack: (config) => {
    config.resolve.alias.canvas = false;
    config.resolve.alias.encoding = false;
    return config;
  },
};

export default nextConfig;
