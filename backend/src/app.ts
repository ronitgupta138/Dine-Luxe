import express from 'express';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import hpp from 'hpp';
import { corsMiddleware } from './config/cors';
import { errorHandler, notFoundHandler } from './middleware/error.middleware';

// Route modules
import authRoutes from './modules/auth/auth.routes';

const app = express();

// ─── Global middleware (ORDER MATTERS) ──────────────────────────────────────
app.use(helmet());
app.use(corsMiddleware);
app.use(compression());
app.use(morgan(process.env['NODE_ENV'] === 'production' ? 'combined' : 'dev'));
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));
app.use(hpp());

// ─── Routes ─────────────────────────────────────────────────────────────────
app.use('/api/v1/auth', authRoutes);

// ─── Health check ────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ─── 404 & Error handlers (must be last) ────────────────────────────────────
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
