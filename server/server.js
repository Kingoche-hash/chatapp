import http from 'http';
import mongoose from 'mongoose';
import app from './app.js';
import { env } from './config/env.js';
import { connectDB } from './config/db.js';
import { initSocket } from './socket/index.js';

const server = http.createServer(app);
const io = initSocket(server);

const start = async () => {
  try {
    await connectDB();
    server.listen(env.port, () => {
      console.log(`Server running on port ${env.port} (${env.nodeEnv})`);
    });
  } catch (error) {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  }
};

const shutdown = async (signal) => {
  console.log(`${signal} received, shutting down...`);
  // io.close() also closes the HTTP server.
  io.close(async () => {
    await mongoose.connection.close();
    process.exit(0);
  });
};

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

start();