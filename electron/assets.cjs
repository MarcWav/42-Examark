const path = require('node:path');
const fs = require('node:fs/promises');

const MIME = {'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.mjs':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json','.wasm':'application/wasm','.zip':'application/zip','.woff2':'font/woff2','.png':'image/png','.ico':'image/x-icon','.svg':'image/svg+xml'};
const CSP = "default-src 'self'; script-src 'self' 'wasm-unsafe-eval'; worker-src 'self' blob:; style-src 'self' 'unsafe-inline'; font-src 'self'; img-src 'self' data: blob:; connect-src 'self'; object-src 'none'; base-uri 'self'; frame-src 'none'; form-action 'none'";

function resolveAsset(root, address) {
  const url = new URL(address);
  if (url.protocol !== 'trainer:' || url.hostname !== 'app' || url.port || url.username || url.password) return null;
  let name;
  try { name = decodeURIComponent(url.pathname); } catch { return null; }
  if (name.includes('\0') || name.includes('\\') || name.split('/').includes('..')) return null;
  const file = path.resolve(root, '.' + (name === '/' ? '/index.html' : name));
  const relative = path.relative(root, file);
  if (!relative || relative.startsWith('..') || path.isAbsolute(relative)) return null;
  return file;
}

function createAssetHandler(root) {
  return async request => {
    if (!['GET','HEAD'].includes(request.method)) return new Response('Method not allowed', {status:405});
    const file = resolveAsset(root, request.url);
    if (!file) return new Response('Not found', {status:404});
    try {
      const contents = await fs.readFile(file);
      return new Response(request.method === 'HEAD' ? null : contents, {headers:{
        'Content-Type':MIME[path.extname(file)] || 'application/octet-stream',
        'Content-Length':String(contents.length),
        'Content-Security-Policy':CSP,
        'X-Content-Type-Options':'nosniff',
        'Cache-Control':file.endsWith('index.html')?'no-store':'public, max-age=3600'
      }});
    } catch { return new Response('Not found', {status:404}); }
  };
}

module.exports = {resolveAsset,createAssetHandler,CSP};
