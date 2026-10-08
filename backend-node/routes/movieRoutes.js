const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// READ ALL (SELECT)
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM movies ORDER BY movie_id ASC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// CREATE (INSERT)
router.post('/', async (req, res) => {
  const { title, language, genre, duration_minutes } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO movies (title, language, genre, duration_minutes) 
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [title, language, genre, duration_minutes]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// UPDATE (UPDATE)
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { title, language, genre, duration_minutes } = req.body;
  try {
    const result = await pool.query(
      `UPDATE movies SET title=$1, language=$2, genre=$3, duration_minutes=$4 
       WHERE movie_id=$5 RETURNING *`,
      [title, language, genre, duration_minutes, id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE (DELETE)
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM movies WHERE movie_id=$1', [id]);
    res.json({ message: 'Movie deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;