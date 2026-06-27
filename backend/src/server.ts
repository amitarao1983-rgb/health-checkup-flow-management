import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { existsSync } from 'fs';
import { createServer } from 'http';
import { Server } from 'socket.io';
import apiRoutes from './routes/api.js';
import { seedData } from './seed.js';
import { queueEngine } from './services/queueEngine.js';
import { aiOptimizer } from './services/aiOptimizer.js';

const PORT = Number(process.env.PORT) || 3001;
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const frontendDist = path.resolve(__dirname, '../../frontend/dist');

const app = express();
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: { origin: true, methods: ['GET', 'POST'] },
});

app.use(cors({ origin: true }));
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'Health Check-up Flow',
    appUrl: `http://localhost:${PORT}`,
  });
});

app.use('/api', apiRoutes);

if (existsSync(frontendDist)) {
  app.use(express.static(frontendDist));

  app.get(/^(?!\/api|\/socket\.io).*/, (_req, res) => {
    res.sendFile(path.join(frontendDist, 'index.html'));
  });
} else {
  app.get('/', (_req, res) => {
    res.type('html').send(`
      <!DOCTYPE html>
      <html><head><title>HealthFirst360</title></head>
      <body style="font-family:sans-serif;background:#0f1419;color:#fff;padding:40px">
        <h1>Frontend not built yet</h1>
        <p>Run from project root:</p>
        <pre style="background:#1a2332;padding:16px;border-radius:8px">npm run dev</pre>
      </body></html>
    `);
  });
}

seedData(true);

function broadcastUpdates() {
  io.emit('queue:update', queueEngine.getAllDepartmentStats());
  io.emit('ai:predictions', aiOptimizer.getAlerts());
}

io.on('connection', (socket) => {
  console.log(`Client connected: ${socket.id}`);
  socket.emit('queue:update', queueEngine.getAllDepartmentStats());
  socket.emit('ai:predictions', aiOptimizer.getAlerts());

  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`);
  });
});

setInterval(broadcastUpdates, 5000);

const APP_URL = `http://localhost:${PORT}`;

httpServer.listen(PORT, () => {
  console.log('');
  console.log('  ╔══════════════════════════════════════════════════════╗');
  console.log('  ║         HealthFirst360 — Check-up Flow App           ║');
  console.log('  ╠══════════════════════════════════════════════════════╣');
  console.log(`  ║  Open in browser:  ${APP_URL.padEnd(33)}║`);
  console.log('  ║  API + Frontend combined on one port                 ║');
  console.log('  ╚══════════════════════════════════════════════════════╝');
  console.log('');
  if (!existsSync(frontendDist)) {
    console.warn('  ⚠ Frontend dist missing — run: npm run build:frontend');
  }
});

httpServer.on('error', (err: NodeJS.ErrnoException) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`\n❌ Port ${PORT} is already in use.`);
    console.error('   Fix (PowerShell):');
    console.error(`   Get-NetTCPConnection -LocalPort ${PORT} | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force }`);
    console.error('\n   Then run again: npm run dev\n');
    process.exit(1);
  }
  throw err;
});

export { io };
