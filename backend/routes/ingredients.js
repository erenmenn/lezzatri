const express = require('express');
const router  = express.Router();
const db      = require('../db');

// GET /api/ingredients – Semua bahan baku
router.get('/', async (_req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM ingredients ORDER BY status, name');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/ingredients/:id
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM ingredients WHERE id = ?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Bahan tidak ditemukan.' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/ingredients – Tambah bahan baru
router.post('/', async (req, res) => {
  try {
    const { name, stock, unit, min_stock } = req.body;
    if (!name) return res.status(400).json({ error: 'name wajib diisi.' });

    const stockVal    = parseFloat(stock)     || 0;
    const minStockVal = parseFloat(min_stock) || 0;
    let status = 'Good';
    if (stockVal <= 0)              status = 'Critical';
    else if (stockVal < minStockVal) status = 'Low';

    const [result] = await db.query(
      'INSERT INTO ingredients (name, stock, unit, min_stock, status) VALUES (?, ?, ?, ?, ?)',
      [name, stockVal, unit || 'kg', minStockVal, status]
    );
    const [newRow] = await db.query('SELECT * FROM ingredients WHERE id = ?', [result.insertId]);
    res.status(201).json(newRow[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/ingredients/:id – Update stok (restock)
router.put('/:id', async (req, res) => {
  try {
    const { name, stock, unit, min_stock } = req.body;
    
    // Ambil data lama dulu
    const [existing] = await db.query('SELECT * FROM ingredients WHERE id = ?', [req.params.id]);
    if (!existing.length) return res.status(404).json({ error: 'Bahan tidak ditemukan.' });
    const old = existing[0];

    const newStock    = stock     !== undefined ? parseFloat(stock)     : old.stock;
    const newMinStock = min_stock !== undefined ? parseFloat(min_stock) : old.min_stock;
    let newStatus = 'Good';
    if (newStock <= 0)               newStatus = 'Critical';
    else if (newStock < newMinStock)  newStatus = 'Low';

    await db.query(
      `UPDATE ingredients SET
        name      = COALESCE(?, name),
        stock     = ?,
        unit      = COALESCE(?, unit),
        min_stock = ?,
        status    = ?
       WHERE id = ?`,
      [name || null, newStock, unit || null, newMinStock, newStatus, req.params.id]
    );
    const [updated] = await db.query('SELECT * FROM ingredients WHERE id = ?', [req.params.id]);
    res.json(updated[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/ingredients/:id/restock – Tambah stok (restock cepat)
router.patch('/:id/restock', async (req, res) => {
  try {
    const { amount } = req.body;
    if (!amount || isNaN(amount)) return res.status(400).json({ error: 'amount harus berupa angka.' });

    const [existing] = await db.query('SELECT * FROM ingredients WHERE id = ?', [req.params.id]);
    if (!existing.length) return res.status(404).json({ error: 'Bahan tidak ditemukan.' });
    const old = existing[0];

    const newStock = old.stock + parseFloat(amount);
    let newStatus = 'Good';
    if (newStock <= 0)              newStatus = 'Critical';
    else if (newStock < old.min_stock) newStatus = 'Low';

    await db.query(
      'UPDATE ingredients SET stock = ?, status = ? WHERE id = ?',
      [newStock, newStatus, req.params.id]
    );
    const [updated] = await db.query('SELECT * FROM ingredients WHERE id = ?', [req.params.id]);
    res.json(updated[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/ingredients/:id
router.delete('/:id', async (req, res) => {
  try {
    const [result] = await db.query('DELETE FROM ingredients WHERE id = ?', [req.params.id]);
    if (!result.affectedRows) return res.status(404).json({ error: 'Bahan tidak ditemukan.' });
    res.json({ message: 'Bahan berhasil dihapus.', id: parseInt(req.params.id) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
