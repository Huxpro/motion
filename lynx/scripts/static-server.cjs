// Minimal static file server with correct MIME types (incl. wasm + esm).
const http = require("http")
const fs = require("fs")
const path = require("path")

const root = process.argv[2] || "."
const port = parseInt(process.argv[3] || "8080", 10)

const MIME = {
    ".html": "text/html",
    ".js": "text/javascript",
    ".mjs": "text/javascript",
    ".css": "text/css",
    ".json": "application/json",
    ".wasm": "application/wasm",
    ".png": "image/png",
    ".svg": "image/svg+xml",
    ".bundle": "application/javascript",
}

http.createServer((req, res) => {
    const urlPath = decodeURIComponent(req.url.split("?")[0])
    const rel = urlPath === "/" ? "/index.html" : urlPath
    const filePath = path.join(path.resolve(root), rel)
    fs.readFile(filePath, (err, data) => {
        if (err) {
            res.writeHead(404, { "Access-Control-Allow-Origin": "*" })
            res.end("Not found: " + urlPath)
            return
        }
        const ext = path.extname(filePath).toLowerCase()
        res.writeHead(200, {
            "Content-Type": MIME[ext] || "application/octet-stream",
            "Access-Control-Allow-Origin": "*",
            // Lynx web worker / wasm may need cross-origin isolation:
            "Cross-Origin-Opener-Policy": "same-origin",
            "Cross-Origin-Embedder-Policy": "require-corp",
            "Cross-Origin-Resource-Policy": "cross-origin",
        })
        res.end(data)
    })
}).listen(port, () => console.log(`static server on http://localhost:${port} root=${root}`))
