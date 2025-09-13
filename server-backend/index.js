// ...existing code...

import express from 'express';
import cors from 'cors';


import path from 'path';
import { fileURLToPath } from 'url';
const app = express();
const PORT = 3000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


app.use(cors());
app.use(express.json());
// Serve static files (frontend)
app.use(express.static(path.join(__dirname, '..')));

// Diagnostics state for each server
const servers = {
  server1: { requests: 0, lastPing: 0, lastRequest: null, status: 'Online' },
  server2: { requests: 0, lastPing: 0, lastRequest: null, status: 'Online' },
  server3: { requests: 0, lastPing: 0, lastRequest: null, status: 'Online' }
};

function simulatePing() {
  return Math.floor(Math.random() * 480) + 20;
}

// Endpoint to get diagnostics
app.get('/api/:server/diagnostics', (req, res) => {
  const { server } = req.params;
  if (!servers[server]) return res.status(404).json({ error: 'Server not found' });
  res.json({
    requests: servers[server].requests,
    lastPing: servers[server].lastPing,
    lastRequest: servers[server].lastRequest,
    status: servers[server].status
  });
});

// Endpoint to simulate a request (penetration test or DDoS)
app.post('/api/:server/request', (req, res) => {
  const { server } = req.params;
  if (!servers[server]) return res.status(404).json({ error: 'Server not found' });
  servers[server].requests++;
  servers[server].lastPing = simulatePing();
  servers[server].lastRequest = new Date().toISOString();
  // Simulate server lag if requests are high
  if (servers[server].requests > 1000) {
    servers[server].status = 'Lagging';
  }
  if (servers[server].requests > 5000) {
    servers[server].status = 'Overloaded';
  }
  res.json({ success: true });
});

// Endpoint to reset diagnostics

app.post('/api/:server/reset', (req, res) => {
  const { server } = req.params;
  if (!servers[server]) return res.status(404).json({ error: 'Server not found' });
  servers[server] = { requests: 0, lastPing: 0, lastRequest: null, status: 'Online' };
  res.json({ success: true });
});


// Network specs endpoint
import os from 'os';
app.get('/api/network/specs', (req, res) => {
  try {
    const interfaces = os.networkInterfaces();
    let ip = 'unknown';
    for (const name of Object.keys(interfaces)) {
      for (const net of interfaces[name]) {
        if (net.family === 'IPv4' && !net.internal) {
          ip = net.address;
          break;
        }
      }
    }
    res.json({
      ip,
      hostname: os.hostname(),
      os: os.type() + ' ' + os.release(),
      uptime: Math.floor(os.uptime() / 60) + ' min',
      connections: 'N/A'
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to get network specs', details: err.message });
  }
});

// Simple backend homepage
app.get('/', (req, res) => {
  res.setHeader('Content-Type', 'text/html');
  res.send(`
    <html>
      <head>
        <title>Diagnostics Backend</title>
        <style>
          body { background: #181c24; color: #fff; font-family: Arial, sans-serif; padding: 2rem; }
          h1 { color: #4caf50; }
          code { background: #232526; color: #90caf9; padding: 2px 6px; border-radius: 4px; }
          ul { margin-top: 1.5rem; }
        </style>
      </head>
      <body>
        <h1>Diagnostics Backend Running</h1>
        <p>This backend provides diagnostics and testing endpoints for your project.</p>
        <h2>Available Endpoints</h2>
        <ul>
          <li><code>GET /api/server1/diagnostics</code></li>
          <li><code>GET /api/server2/diagnostics</code></li>
          <li><code>GET /api/server3/diagnostics</code></li>
          <li><code>POST /api/server1/request</code> (or server2/server3)</li>
          <li><code>POST /api/server1/reset</code> (or server2/server3)</li>
          <li><code>GET /api/network/specs</code></li>
        </ul>
        <p style="margin-top:2rem;color:#90caf9;">Status: <b>Online</b></p>
      </body>
    </html>
  `);
});



function keepAlive() {
  setInterval(() => {
    // This function keeps the process alive and can be extended for health checks
    // For now, just logs a heartbeat every 10 minutes
    console.log('Backend heartbeat: still running');
  }, 600000);
}


// Global error handler
app.use((err, req, res, next) => {
  console.error('Global error:', err);
  res.status(500).json({ error: 'Internal server error', details: err.message });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection:', reason);
});


app.listen(PORT, () => {
  console.log(`Unified server running on port ${PORT}`);
  keepAlive();
});
