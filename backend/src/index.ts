import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// ─── MIDDLEWARE ───────────────────────────────────────────────────────────────
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:8080',
];
if (process.env.FRONTEND_URL && process.env.FRONTEND_URL !== '*') {
  allowedOrigins.push(process.env.FRONTEND_URL);
}

app.use(cors({
  // If FRONTEND_URL is '*', allow all origins (useful before frontend is deployed)
  // Once Vercel URL is known, set FRONTEND_URL to exact URL to lock it down
  origin: process.env.FRONTEND_URL === '*' ? '*' : allowedOrigins,
  credentials: process.env.FRONTEND_URL !== '*', // credentials can't be used with wildcard
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── ROUTES ───────────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);

// Health check — useful for Render deployment
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 404 handler for unknown routes
app.use((_req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// ─── START ───────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`🚀 RWA Backend running on http://localhost:${PORT}`);
  console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
});
