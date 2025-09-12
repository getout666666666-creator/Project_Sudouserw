// ...existing code...

import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 8080;

app.use(cors());
app.use(express.json());

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

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection:', reason);
});

app.listen(PORT, () => {
  console.log(`Diagnostics backend running on port ${PORT}`);
  keepAlive();
});
