const express = require('express');
const router  = express.Router();
const db      = require('../db');

// GET /api/dashboard/stats – Statistik ringkasan dashboard
router.get('/stats', async (_req, res) => {
  try {
    // Total revenue hari ini
    const [revenueToday] = await db.query(`
      SELECT COALESCE(SUM(total), 0) AS total
      FROM transactions
      WHERE DATE(created_at) = CURDATE()
    `);

    // Total revenue kemarin (untuk persentase perubahan)
    const [revenueYesterday] = await db.query(`
      SELECT COALESCE(SUM(total), 0) AS total
      FROM transactions
      WHERE DATE(created_at) = CURDATE() - INTERVAL 1 DAY
    `);

    // Total semua transaksi hari ini
    const [ordersToday] = await db.query(`
      SELECT COUNT(*) AS count FROM transactions
      WHERE DATE(created_at) = CURDATE()
    `);

    // Pesanan aktif (masih diproses)
    const [activeOrders] = await db.query(`
      SELECT COUNT(*) AS count FROM transactions
      WHERE status IN ('Cooking', 'Ready')
    `);

    // Produk terlaris (semua waktu)
    const [topProduct] = await db.query(`
      SELECT product_name, SUM(quantity) AS total_qty
      FROM transaction_items
      GROUP BY product_name
      ORDER BY total_qty DESC
      LIMIT 1
    `);

    // Revenue by channel (hari ini)
    const [revenueByChannel] = await db.query(`
      SELECT order_type, COALESCE(SUM(total), 0) AS total
      FROM transactions
      WHERE DATE(created_at) = CURDATE()
      GROUP BY order_type
    `);

    // Stok kritis & low
    const [criticalStock] = await db.query(`
      SELECT COUNT(*) AS count FROM ingredients WHERE status = 'Critical'
    `);
    const [lowStock] = await db.query(`
      SELECT COUNT(*) AS count FROM ingredients WHERE status = 'Low'
    `);

    // Hitung persentase perubahan revenue
    const todayTotal = revenueToday[0].total;
    const ydayTotal  = revenueYesterday[0].total;
    let revenueChange = 0;
    if (ydayTotal > 0) {
      revenueChange = ((todayTotal - ydayTotal) / ydayTotal * 100).toFixed(1);
    }

    // Format channel data
    const channels = {
      'Dine-in':  0,
      'Takeaway': 0,
      'Delivery': 0,
    };
    revenueByChannel.forEach(r => {
      channels[r.order_type] = r.total;
    });
    const channelTotal = Object.values(channels).reduce((a, b) => a + b, 0) || 1;

    res.json({
      revenue: {
        today:          todayTotal,
        yesterday:      ydayTotal,
        changePercent:  parseFloat(revenueChange),
      },
      orders: {
        today:          ordersToday[0].count,
        active:         activeOrders[0].count,
      },
      topProduct:       topProduct[0]?.product_name || '-',
      stock: {
        critical:       criticalStock[0].count,
        low:            lowStock[0].count,
      },
      revenueByChannel: {
        dineIn:   { amount: channels['Dine-in'],  percent: Math.round(channels['Dine-in']  / channelTotal * 100) },
        takeaway: { amount: channels['Takeaway'], percent: Math.round(channels['Takeaway'] / channelTotal * 100) },
        delivery: { amount: channels['Delivery'], percent: Math.round(channels['Delivery'] / channelTotal * 100) },
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/dashboard/recent – Transaksi terbaru (6 terakhir)
router.get('/recent', async (_req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT t.*,
             GROUP_CONCAT(CONCAT(ti.quantity, 'x ', ti.product_name) SEPARATOR ', ') AS items_summary
      FROM transactions t
      LEFT JOIN transaction_items ti ON ti.transaction_id = t.id
      GROUP BY t.id
      ORDER BY t.created_at DESC
      LIMIT 6
    `);
    res.json(rows.map(t => ({
      ...t,
      id:           t.order_code,
      customerName: t.customer_name,
      type:         t.order_type,
      time:         new Date(t.created_at).toLocaleTimeString('id-ID', { hour:'2-digit', minute:'2-digit', hour12: false }),
      items:        (t.items_summary || '').split(', ').map(s => {
        const m = s.match(/^(\d+)x (.+)$/);
        return m ? { qty: parseInt(m[1]), name: m[2] } : { qty: 1, name: s };
      }),
    })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
