const express = require('express');
const router = express.Router();
const pool = require('../config/db');

router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM shows ORDER BY show_id ASC');
    res.json(result.rows);
  } catch (err) {
    console.error('Shows GET Error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  const { theatre_id, movie_id, show_date, show_time, language } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO shows (theatre_id, movie_id, show_date, show_time, language) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [theatre_id, movie_id, show_date, show_time, language]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Shows POST Error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM shows WHERE show_id=$1', [req.params.id]);
    res.json({ message: 'Show deleted' });
  } catch (err) {
    console.error('Shows DELETE Error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  const { theatre_id, movie_id, show_date, show_time, language } = req.body;
  try {
    const result = await pool.query(
      `UPDATE shows SET theatre_id=$1, movie_id=$2, show_date=$3, show_time=$4, language=$5 WHERE show_id=$6 RETURNING *`,
      [theatre_id, movie_id, show_date, show_time, language, req.params.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;