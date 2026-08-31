/**
 * OmniFlow Enterprise Server
 * Native Node.js HTTP & REST API Engine + Static Asset Server
 */

const http = require('http');
const url = require('url');
const path = require('path');
const fs = require('fs');
const { handleApiRequest } = require('./routes/api');

const PORT = process.env.PORT || 3000;
const CLIENT_DIR = path.join(__dirname, '..', 'client');

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

function setCorsHeaders(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-tenant-id');
}

const server = http.createServer((req, res) => {
  setCorsHeaders(res);

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    return res.end();
  }

  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;

  // Handle API Requests
  if (pathname.startsWith('/api/')) {
    let bodyData = '';
    req.on('data', chunk => {
      bodyData += chunk.toString();
    });

    req.on('end', () => {
      let body = null;
      if (bodyData) {
        try {
          body = JSON.parse(bodyData);
        } catch (e) {
          // Plain text fallback
          body = { raw: bodyData };
        }
      }
      handleApiRequest(req, res, pathname, parsedUrl.query, body);
    });
    return;
  }

  // Handle Static Frontend Assets
  let filePath = path.join(CLIENT_DIR, pathname === '/' ? 'index.html' : pathname);

  // Security check: ensure path is inside CLIENT_DIR
  if (!filePath.startsWith(CLIENT_DIR)) {
    res.writeHead(403, { 'Content-Type': 'text/plain' });
    return res.end('Forbidden');
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      // SPA Fallback to index.html
      filePath = path.join(CLIENT_DIR, 'index.html');
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    fs.readFile(filePath, (readErr, content) => {
      if (readErr) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        return res.end('Error loading static resource');
      }

      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content);
    });
  });
});

server.listen(PORT, () => {
  console.log(`\n======================================================`);
  console.log(`🚀 OmniFlow Enterprise Platform is Live!`);
  console.log(`📡 URL: http://localhost:${PORT}`);
  console.log(`🏢 Architecture: Multi-Tenant Enterprise SaaS & ERP`);
  console.log(`🔐 RBAC & Audit Engine: Active`);
  console.log(`======================================================\n`);
});

module.exports = server;
