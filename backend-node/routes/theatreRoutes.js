const express = require('express');
const router = express.Router();
const pool = require('../config/db');

router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM theatres ORDER BY theatre_id ASC');
    res.json(result.rows);
  } catch (err) {
    console.error('Theatres GET Error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  const { theatre_name, location, total_screens } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO theatres (theatre_name, location, total_screens) VALUES ($1, $2, $3) RETURNING *',
      [theatre_name, location, total_screens]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Theatres POST Error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM theatres WHERE theatre_id=$1', [req.params.id]);
    res.json({ message: 'Theatre deleted' });
  } catch (err) {
    console.error('Theatres DELETE Error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;