// Backend order server for Cosmo Chemicals
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const bodyParser = require('body-parser');
const app = express();
const PORT = 3001;

app.use(cors());
app.use(bodyParser.json());

// Initialize SQLite DB
const db = new sqlite3.Database('./orders.db', (err) => {
  if (err) throw err;
});

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    contact TEXT,
    order_data TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`);
});

// Save order endpoint
app.post('/api/orders', (req, res) => {
  const { name, contact, products } = req.body;
  if (!name || !contact || !products) {
    return res.status(400).json({ error: 'Missing fields' });
  }
  db.run(
    'INSERT INTO orders (name, contact, order_data) VALUES (?, ?, ?)',
    [name, contact, JSON.stringify(products)],
    function (err) {
      if (err) {
        return res.status(500).json({ error: 'DB error' });
      }
      res.json({ success: true, orderId: this.lastID });
    }
  );
});

// For testing: get all orders
app.get('/api/orders', (req, res) => {
  db.all('SELECT * FROM orders ORDER BY created_at DESC', [], (err, rows) => {
    if (err) return res.status(500).json({ error: 'DB error' });
    res.json(rows);
  });
});

app.listen(PORT, () => {
  console.log(`Order server running on http://localhost:${PORT}`);
});
