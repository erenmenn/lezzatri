const express = require('express');
const router  = express.Router();
const db      = require('../db');

// GET /api/products – Semua produk
router.get('/', async (_req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM products ORDER BY category, name'
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/products/:id – Detail satu produk
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM products WHERE id = ?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Produk tidak ditemukan.' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/products – Tambah produk baru
router.post('/', async (req, res) => {
  try {
    const { name, category, price, spicy_level, image_url } = req.body;
    if (!name || !price) return res.status(400).json({ error: 'name dan price wajib diisi.' });

    const [result] = await db.query(
      `INSERT INTO products (name, category, price, spicy_level, image_url)
       VALUES (?, ?, ?, ?, ?)`,
      [name, category || 'Pasta', price, spicy_level || 1, image_url || null]
    );
    const [newProduct] = await db.query('SELECT * FROM products WHERE id = ?', [result.insertId]);
    res.status(201).json(newProduct[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/products/:id – Update produk
router.put('/:id', async (req, res) => {
  try {
    const { name, category, price, spicy_level, image_url, is_available } = req.body;
    await db.query(
      `UPDATE products SET
        name        = COALESCE(?, name),
        category    = COALESCE(?, category),
        price       = COALESCE(?, price),
        spicy_level = COALESCE(?, spicy_level),
        image_url   = COALESCE(?, image_url),
        is_available = COALESCE(?, is_available)
       WHERE id = ?`,
      [name, category, price, spicy_level, image_url, is_available, req.params.id]
    );
    const [updated] = await db.query('SELECT * FROM products WHERE id = ?', [req.params.id]);
    if (!updated.length) return res.status(404).json({ error: 'Produk tidak ditemukan.' });
    res.json(updated[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/products/:id – Hapus produk
router.delete('/:id', async (req, res) => {
  try {
    const [result] = await db.query('DELETE FROM products WHERE id = ?', [req.params.id]);
    if (!result.affectedRows) return res.status(404).json({ error: 'Produk tidak ditemukan.' });
    res.json({ message: 'Produk berhasil dihapus.', id: parseInt(req.params.id) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
