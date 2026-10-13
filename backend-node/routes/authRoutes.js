const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// GET all customers
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM customers ORDER BY customer_id ASC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST new customer (inserts into customers & customer_phones)
router.post('/', async (req, res) => {
  const { first_name, middle_name, last_name, email, password_hash, date_of_birth, phone_number } = req.body;
  
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Insert into customers table
    const custResult = await client.query(
      `INSERT INTO customers (first_name, middle_name, last_name, email, password_hash, date_of_birth) 
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [first_name, middle_name || '', last_name, email, password_hash || 'password123', date_of_birth]
    );
    const newCustomer = custResult.rows[0];

    // 2. Insert into customer_phones table if a phone number was provided
    if (phone_number && phone_number.trim() !== '') {
      await client.query(
        `INSERT INTO customer_phones (customer_id, phone_number) VALUES ($1, $2)`,
        [newCustomer.customer_id, phone_number.trim()]
      );
    }

    await client.query('COMMIT');
    res.status(201).json(newCustomer);
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

// DELETE customer
router.delete('/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM customers WHERE customer_id = $1', [req.params.id]);
    res.json({ message: 'Customer deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;