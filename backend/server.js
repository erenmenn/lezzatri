const express = require('express');
const cors    = require('cors');
require('dotenv').config();

const productsRouter     = require('./routes/products');
const transactionsRouter = require('./routes/transactions');
const ingredientsRouter  = require('./routes/ingredients');
const dashboardRouter    = require('./routes/dashboard');

const app  = express();
const PORT = process.env.PORT || 3001;

// ── Middleware ──────────────────────────────────────────────
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174', 'http://127.0.0.1:5173'],
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Request Logger (development) ────────────────────────────
app.use((req, _res, next) => {
  console.log(`[${new Date().toLocaleTimeString('id-ID')}] ${req.method} ${req.url}`);
  next();
});

// ── Routes ───────────────────────────────────────────────────
app.use('/api/products',     productsRouter);
app.use('/api/transactions', transactionsRouter);
app.use('/api/ingredients',  ingredientsRouter);
app.use('/api/dashboard',    dashboardRouter);

// ── Health Check ─────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({
    status:  'OK',
    service: 'Lezzatri On-Premise API',
    time:    new Date().toISOString(),
  });
});

// ── 404 Handler ──────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ error: 'Endpoint tidak ditemukan.' });
});

// ── Global Error Handler ─────────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error('Server Error:', err);
  res.status(500).json({ error: 'Internal Server Error', detail: err.message });
});

// ── Start ─────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log('');
  console.log('╔════════════════════════════════════════╗');
  console.log('║   🍝 Lezzatri On-Premise API Server   ║');
  console.log(`║   Running at http://localhost:${PORT}     ║`);
  console.log('╚════════════════════════════════════════╝');
  console.log('');
});
