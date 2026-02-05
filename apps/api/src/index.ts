import { createServer } from 'http';
import { app } from './app.js';
import { env } from './config/env.js';
import { initializeWebSocket } from './utils/websocket.js';

const port = env.port ?? 3000;

// Create HTTP server
const httpServer = createServer(app);

// Initialize WebSocket server
initializeWebSocket(httpServer);

httpServer.listen(port, () => {
  // Simple startup log to confirm server boot
  console.log(`API listening on port ${port}`);
  console.log(`WebSocket server ready on port ${port}`);
});
