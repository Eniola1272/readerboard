import { copyFileSync, existsSync } from 'fs';
import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const require = createRequire(import.meta.url);
const __dirname = dirname(fileURLToPath(import.meta.url));

// Copy the PDF.js worker to public/ — served as a plain static file so
// webpack never tries to bundle or minify it.
try {
  const workerSrc = require.resolve('pdfjs-dist/build/pdf.worker.min.mjs');
  const workerDest = join(__dirname, 'public', 'pdf.worker.min.mjs');
  if (!existsSync(workerDest)) {
    copyFileSync(workerSrc, workerDest);
  }
} catch {
  // Non-fatal
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
      { protocol: 'https', hostname: '*.googleusercontent.com' },
    ],
  },
  webpack: (config) => {
    // Let webpack handle .mjs files from node_modules without forcing
    // strict ESM mode — fixes pdfjs-dist ESM/CJS boundary errors.
    config.module.rules.push({
      test: /\.mjs$/,
      include: /node_modules/,
      type: 'javascript/auto',
    });

    config.resolve.alias.canvas = false;
    config.resolve.alias.encoding = false;
    return config;
  },
};

export default nextConfig;
