// Serves the production build like a static host would: gzip/brotli,
// long cache for hashed files, and index.html for unknown paths (SPA).
// Used to measure real performance locally:  npm run build && npm run serve:dist
import { createReadStream, existsSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, join, normalize, resolve, sep } from 'node:path';
import { createBrotliCompress, createGzip } from 'node:zlib';

const root = resolve('dist/flooring-montano/browser');
const port = Number(process.env.PORT ?? 4500);

const types = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
};
const compressible = new Set(['.html', '.js', '.css', '.json', '.svg', '.txt', '.xml']);

createServer((req, res) => {
  const url = new URL(req.url ?? '/', 'http://localhost');
  let file = normalize(join(root, decodeURIComponent(url.pathname)));
  if (!file.startsWith(root)) {
    res.writeHead(403).end();
    return;
  }
  if (existsSync(file) && statSync(file).isDirectory()) file = join(file, 'index.html');
  if (!existsSync(file)) {
    // Prerendered routes have their own index.html; anything else is rendered in the browser.
    const csr = join(root, 'index.csr.html');
    file = existsSync(csr) ? csr : join(root, 'index.html');
  }

  const ext = extname(file);
  const hashed = /[-.][A-Za-z0-9]{8,}\.(js|css)$/.test(file) || file.includes(`${sep}media${sep}`);
  const headers = {
    'Content-Type': types[ext] ?? 'application/octet-stream',
    'Cache-Control': ext === '.html' ? 'no-cache' : hashed ? 'public, max-age=31536000, immutable' : 'public, max-age=86400',
  };

  const accept = String(req.headers['accept-encoding'] ?? '');
  let stream = createReadStream(file);
  if (compressible.has(ext) && accept.includes('br')) {
    headers['Content-Encoding'] = 'br';
    stream = stream.pipe(createBrotliCompress());
  } else if (compressible.has(ext) && accept.includes('gzip')) {
    headers['Content-Encoding'] = 'gzip';
    stream = stream.pipe(createGzip());
  }
  res.writeHead(200, headers);
  stream.pipe(res);
}).listen(port, () => console.log(`Serving ${root} at http://localhost:${port}`));
