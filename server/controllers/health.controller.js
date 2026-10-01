import mongoose from 'mongoose';

const DB_STATES = ['disconnected', 'connected', 'connecting', 'disconnecting'];

export const getHealth = (req, res) => {
  const dbState = DB_STATES[mongoose.connection.readyState] || 'unknown';
  const healthy = dbState === 'connected';

  res.status(healthy ? 200 : 503).json({
    status: healthy ? 'ok' : 'degraded',
    uptime: Math.round(process.uptime()),
    timestamp: new Date().toISOString(),
    database: dbState,
  });
};