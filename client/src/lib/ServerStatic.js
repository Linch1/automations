const https = require('https');
const http = require('http');
const fs = require('fs');
const url = require('url');
const path = require('path');

const targetHost = 'http://10.0.2.2:6001'; // server di origine
const options = {
  key: fs.readFileSync( path.join(__dirname, '../../key.pem') ),
  cert: fs.readFileSync( path.join(__dirname, '../../cert.pem') ),
};

const server = https.createServer(options, (req, res) => {
  const parsedUrl = url.parse(req.url);
  const proxyUrl = `${targetHost}${parsedUrl.path}`;

  console.log(`Proxying: ${req.method} ${proxyUrl}`);

  const proxyReq = http.request(proxyUrl, {
    method: req.method,
    headers: req.headers,
  }, (proxyRes) => {
    res.writeHead(proxyRes.statusCode, proxyRes.headers);
    proxyRes.pipe(res, { end: true });
  });

  req.pipe(proxyReq, { end: true });

  proxyReq.on('error', (err) => {
    console.error('Proxy error:', err.message);
    res.writeHead(500);
    res.end('Proxy error');
  });
});

server.listen(4430, () => {
  console.log('HTTPS proxy server running at https://localhost:4430');
});
