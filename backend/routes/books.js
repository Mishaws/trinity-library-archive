const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');

module.exports = (pool) => {
  // Hanya ambil buku milik user yang sedang login
  router.get('/', auth, async (req, res) => {
    try {
      const result = await pool.query("SELECT * FROM books WHERE user_id = $1 ORDER BY id DESC", [req.user.id]);
      res.json(result.rows);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // Tambah buku dengan menyisipkan user_id
  router.post('/', auth, async (req, res) => {
    const { title, category, status, current_page, total_pages, cover_image } = req.body;
    try {
      const result = await pool.query(
        "INSERT INTO books (user_id, title, category, status, current_page, total_pages, cover_image) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *",
        [req.user.id, title, category, status || 'Unread', current_page || 0, total_pages, cover_image]
      );
      res.status(201).json(result.rows[0]);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // Hapus buku (pastikan ID buku DAN user_id cocok)
  router.delete('/:id', auth, async (req, res) => {
    const { id } = req.params;
    try {
      await pool.query("DELETE FROM books WHERE id = $1 AND user_id = $2", [id, req.user.id]);
      res.json({ message: "Buku berhasil dihapus!" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // Update buku (pastikan ID buku DAN user_id cocok)
  router.put('/:id', auth, async (req, res) => {
    const { id } = req.params;
    const { status, current_page } = req.body;
    try {
      await pool.query(
        "UPDATE books SET status = $1, current_page = $2 WHERE id = $3 AND user_id = $4 RETURNING *",
        [status, current_page, id, req.user.id]
      );
      res.json({ message: "Buku diupdate!" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  return router;
};