const express = require('express');
const router  = express.Router();
const db      = require('../db');

// ── Helper: generate order code ──────────────────────────────
async function generateOrderCode() {
  const [rows] = await db.query('SELECT COUNT(*) AS cnt FROM transactions');
  const next   = (rows[0].cnt || 0) + 9401;
  return `#LZ-${next}`;
}

// ── Helper: format jam WIB ──────────────────────────────────
function formatTime(dateObj) {
  return new Date(dateObj).toLocaleTimeString('id-ID', {
    hour: '2-digit', minute: '2-digit', hour12: false,
  });
}

// GET /api/transactions – Semua transaksi + items
router.get('/', async (_req, res) => {
  try {
    const [transactions] = await db.query(
      `SELECT * FROM transactions ORDER BY created_at DESC`
    );
    // Ambil items untuk setiap transaksi
    const result = await Promise.all(
      transactions.map(async (t) => {
        const [items] = await db.query(
          'SELECT * FROM transaction_items WHERE transaction_id = ?',
          [t.id]
        );
        return {
          ...t,
          id:           t.order_code,
          customerName: t.customer_name,
          type:         t.order_type,
          time:         formatTime(t.created_at),
          items:        items.map(i => ({ name: i.product_name, qty: i.quantity })),
        };
      })
    );
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/transactions/:id – Detail transaksi
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM transactions WHERE id = ? OR order_code = ?',
      [req.params.id, req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Transaksi tidak ditemukan.' });
    const t = rows[0];
    const [items] = await db.query(
      'SELECT * FROM transaction_items WHERE transaction_id = ?', [t.id]
    );
    res.json({ ...t, items });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/transactions – Buat transaksi baru
router.post('/', async (req, res) => {
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    const {
      customer_name,
      order_type     = 'Dine-in',
      payment_method = 'CASH',
      items          = [],       // [{ product_id, product_name, quantity, unit_price }]
    } = req.body;

    if (!customer_name) throw new Error('customer_name wajib diisi.');
    if (!items.length)  throw new Error('Minimal 1 item harus ada.');

    // Hitung harga
    const subtotal       = items.reduce((acc, i) => acc + (i.unit_price * i.quantity), 0);
    const tax            = Math.round(subtotal * 0.10);
    const service_charge = order_type === 'Dine-in' ? Math.round(subtotal * 0.05) : 0;
    const total          = subtotal + tax + service_charge;
    const order_code     = await generateOrderCode();

    // Insert transaksi
    const [result] = await conn.query(
      `INSERT INTO transactions
        (order_code, customer_name, order_type, payment_method, subtotal, tax, service_charge, total, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Cooking')`,
      [order_code, customer_name, order_type, payment_method, subtotal, tax, service_charge, total]
    );
    const transactionId = result.insertId;

    // Insert items
    for (const item of items) {
      const itemSubtotal = item.unit_price * item.quantity;
      await conn.query(
        `INSERT INTO transaction_items
          (transaction_id, product_id, product_name, quantity, unit_price, subtotal)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [transactionId, item.product_id || null, item.product_name, item.quantity, item.unit_price, itemSubtotal]
      );
    }

    await conn.commit();

    // Return full transaction
    const [newTx] = await db.query('SELECT * FROM transactions WHERE id = ?', [transactionId]);
    const [newItems] = await db.query('SELECT * FROM transaction_items WHERE transaction_id = ?', [transactionId]);

    const tx = newTx[0];
    res.status(201).json({
      ...tx,
      id:           tx.order_code,
      customerName: tx.customer_name,
      type:         tx.order_type,
      time:         formatTime(tx.created_at),
      items:        newItems.map(i => ({ name: i.product_name, qty: i.quantity })),
    });
  } catch (err) {
    await conn.rollback();
    res.status(400).json({ error: err.message });
  } finally {
    conn.release();
  }
});

// PUT /api/transactions/:id/status – Update status pesanan
router.put('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const allowed = ['Cooking', 'Ready', 'Served'];
    if (!allowed.includes(status)) {
      return res.status(400).json({ error: `Status harus salah satu dari: ${allowed.join(', ')}` });
    }
    const [result] = await db.query(
      'UPDATE transactions SET status = ? WHERE id = ? OR order_code = ?',
      [status, req.params.id, req.params.id]
    );
    if (!result.affectedRows) return res.status(404).json({ error: 'Transaksi tidak ditemukan.' });
    res.json({ message: 'Status berhasil diperbarui.', status });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
