// Bounded local visual review: serves only generated docs HTML and review frames.
import http from 'node:http';
import {readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
const root = new URL('../docs/', import.meta.url);
const args = process.argv.slice(2);
const portIndex = args.indexOf('--port');
const port = Number(portIndex >= 0 ? args[portIndex + 1] : process.env.PORT || 4173);
const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost');
  if (url.pathname === '/review') {
    const width = url.searchParams.get('width') === '390' ? 390 : 1200;
    const theme = url.searchParams.get('theme') === 'dark' ? 'dark' : 'light';
    res.writeHead(200, {'Content-Type':'text/html; charset=utf-8'});
    res.end(`<!doctype html><html lang="zh-CN"><title>课程视觉检查</title><body style="margin:0;background:#d8dee8"><iframe title="课程预览" src="/s2-ch6.html" style="display:block;border:0;width:${width}px;height:960px;color-scheme:${theme}"></iframe></body></html>`);
    return;
  }
  if (url.pathname !== '/' && url.pathname !== '/index.html' && url.pathname !== '/s2-ch6.html') {
    res.writeHead(404); res.end('Not found'); return;
  }
  try {
    const name = url.pathname === '/s2-ch6.html' ? 's2-ch6.html' : 'index.html';
    const data = await readFile(fileURLToPath(new URL(name, root)));
    res.writeHead(200, {'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store'});res.end(data);
  } catch {
    res.writeHead(404); res.end('Course output is not built yet');
  }
});
server.listen(port,'0.0.0.0');
