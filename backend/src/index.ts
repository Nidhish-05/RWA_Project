import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';
import vehicleRoutes from './routes/vehicles';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// ─── MIDDLEWARE ───────────────────────────────────────────────────────────────
// Helper: strip trailing slash for reliable comparison
const normalise = (s: string) => s.trim().replace(/\/$/, '');

// Build allowed-origins list from env
const rawFrontendUrl = process.env.FRONTEND_URL || '';
const isStar = rawFrontendUrl === '*';

// Static localhost origins (always allowed for local dev)
const localhostOrigins = [
  'http://localhost:5173',
  'http://localhost:8080',
  'http://localhost:3000',
];

app.use(cors({
  origin: isStar
    ? '*'
    : (origin, callback) => {
        // Allow requests with no origin (e.g. curl, Render health checks)
        if (!origin) return callback(null, true);

        const normOrigin = normalise(origin);

        // Always allow localhost
        if (localhostOrigins.some(o => normalise(o) === normOrigin)) {
          return callback(null, true);
        }

        // Allow the configured FRONTEND_URL (normalised)
        if (rawFrontendUrl && normalise(rawFrontendUrl) === normOrigin) {
          return callback(null, true);
        }

        // Reject and log so Render logs surface mismatches
        console.warn(`CORS rejected origin: "${origin}" | FRONTEND_URL env: "${rawFrontendUrl}"`);
        callback(new Error(`CORS: origin "${origin}" not allowed`));
      },
  credentials: !isStar,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── ROUTES ───────────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/vehicles', vehicleRoutes);

// Health check — useful for Render deployment
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Debug: reveal non-secret config (helps verify Render env vars without exposing secrets)
app.get('/debug/config', (_req, res) => {
  res.json({
    NODE_ENV: process.env.NODE_ENV || '(not set)',
    FRONTEND_URL: process.env.FRONTEND_URL || '(not set)',
    DATABASE_URL_SET: !!process.env.DATABASE_URL,
    JWT_SECRET_SET: !!process.env.JWT_SECRET,
    PORT: process.env.PORT || '(not set)',
  });
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
