const express = require('express');
const router = express.Router();
const pool = require('../config/db');

router.get('/', async (req, res) => {
  try {
    const query = `
      SELECT 
        s.show_id, 
        s.theatre_id, 
        s.movie_id, 
        s.show_date, 
        s.show_time, 
        s.language,
        m.title AS movie_title,
        t.theatre_name,
        t.location
      FROM shows s
      JOIN movies m ON s.movie_id = m.movie_id
      JOIN theatres t ON s.theatre_id = t.theatre_id
      ORDER BY s.show_id ASC
    `;
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (err) {
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

router.delete('/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM shows WHERE show_id=$1', [req.params.id]);
    res.json({ message: 'Show deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;