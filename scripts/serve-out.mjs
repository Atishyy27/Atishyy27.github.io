// A static server for out/ with the same URL rules GitHub Pages applies:
// /about/ serves about/index.html. Used by the browser tests in CI, so they run
// against the built site, not the dev server.
//
// node scripts/serve-out.mjs [dir] [port]
import http from "node:http";
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(process.argv[2] ?? "out");
const port = Number(process.argv[3] ?? 4173);
const TYPES = {
  ".html": "text/html; charset=utf-8", ".js": "text/javascript", ".css": "text/css", ".json": "application/json",
  ".svg": "image/svg+xml", ".png": "image/png", ".webp": "image/webp", ".jpg": "image/jpeg", ".ico": "image/x-icon",
  ".txt": "text/plain", ".xml": "application/xml", ".pdf": "application/pdf", ".woff2": "font/woff2", ".glb": "model/gltf-binary",
};

http
  .createServer((req, res) => {
    const url = decodeURIComponent(new URL(req.url, "http://x").pathname);
    let file = path.join(root, url);
    if (!file.startsWith(root)) return res.writeHead(403).end();
    if (fs.existsSync(file) && fs.statSync(file).isDirectory()) file = path.join(file, "index.html");
    if (!fs.existsSync(file)) {
      res.writeHead(404, { "content-type": TYPES[".html"] });
      return res.end(fs.existsSync(path.join(root, "404.html")) ? fs.readFileSync(path.join(root, "404.html")) : "not found");
    }
    res.writeHead(200, { "content-type": TYPES[path.extname(file)] ?? "application/octet-stream" });
    fs.createReadStream(file).pipe(res);
  })
  .listen(port, () => console.log(`serving ${root} on http://localhost:${port}`));
