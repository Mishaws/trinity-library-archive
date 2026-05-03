const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

// Setup Database (Books & Users)
const initDb = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS books (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        category VARCHAR(50) NOT NULL,
        status VARCHAR(50) DEFAULT 'Unread',
        current_page INT DEFAULT 0,
        total_pages INT,
        cover_image TEXT
      );
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL
      );
    `);
    console.log('Tabel books & users siap di PostgreSQL!');
  } catch (err) {
    console.error('Error init DB:', err);
  }
};
initDb();

// --- ROUTE AUTHENTICATION (REGISTER & LOGIN) ---
app.post('/api/auth/register', async (req, res) => {
  const { username, password } = req.body;
  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    await pool.query("INSERT INTO users (username, password) VALUES ($1, $2)", [username, hashedPassword]);
    res.status(201).json({ message: "Register sukses! Silakan login." });
  } catch (err) {
    res.status(500).json({ error: "Username mungkin sudah dipakai." });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await pool.query("SELECT * FROM users WHERE username = $1", [username]);
    if (user.rows.length === 0) return res.status(400).json({ error: "Username tidak ditemukan." });

    const validPass = await bcrypt.compare(password, user.rows[0].password);
    if (!validPass) return res.status(400).json({ error: "Password salah." });

    const token = jwt.sign({ id: user.rows[0].id }, process.env.JWT_SECRET, { expiresIn: '2h' });
    res.header('Authorization', token).json({ token, username });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Import Routes CRUD Books
const booksRouter = require('./routes/books')(pool);
app.use('/api/books', booksRouter);

app.listen(port, () => console.log(`Backend jalan di http://localhost:${port}`));