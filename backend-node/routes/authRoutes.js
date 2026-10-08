const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// READ ALL (SELECT)
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM customers ORDER BY customer_id ASC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// CREATE (INSERT)
router.post('/', async (req, res) => {
  const { first_name, middle_name, last_name, email, password_hash, date_of_birth } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO customers (first_name, middle_name, last_name, email, password_hash, date_of_birth) 
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [first_name, middle_name || '', last_name, email, password_hash || 'password123', date_of_birth]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// UPDATE (UPDATE)
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { first_name, middle_name, last_name, email, date_of_birth } = req.body;
  try {
    const result = await pool.query(
      `UPDATE customers SET first_name=$1, middle_name=$2, last_name=$3, email=$4, date_of_birth=$5 
       WHERE customer_id=$6 RETURNING *`,
      [first_name, middle_name, last_name, email, date_of_birth, id]
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
    await pool.query('DELETE FROM customers WHERE customer_id=$1', [id]);
    res.json({ message: 'Customer record deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;