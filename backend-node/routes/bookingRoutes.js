const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// READ ALL (SELECT WITH JOIN)
router.get('/', async (req, res) => {
  try {
    const query = `
      SELECT 
        b.booking_id, b.booking_date, b.booking_time, b.total_amount,
        c.first_name, c.last_name, c.email,
        t.ticket_id, t.seat_number, t.hall_number, t.price
      FROM bookings b
      JOIN customers c ON b.customer_id = c.customer_id
      LEFT JOIN tickets t ON b.booking_id = t.booking_id
      ORDER BY b.booking_id DESC;
    `;
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// CREATE (TRANSACTION INVOLVING TWO TABLES)
router.post('/', async (req, res) => {
  const { customer_id, show_id, seat_number, hall_number, price } = req.body;
  const client = await pool.connect();

  try {
    await client.query('BEGIN'); // Start SQL Transaction

    // 1. Insert into Bookings
    const bookingRes = await client.query(
      `INSERT INTO bookings (customer_id, total_amount) VALUES ($1, $2) RETURNING *`,
      [customer_id, price]
    );
    const bookingId = bookingRes.rows[0].booking_id;

    // 2. Insert into Tickets using foreign key
    const ticketRes = await client.query(
      `INSERT INTO tickets (booking_id, show_id, seat_number, hall_number, price) 
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [bookingId, show_id, seat_number, hall_number, price]
    );

    await client.query('COMMIT'); // Commit Transaction
    res.status(201).json({ booking: bookingRes.rows[0], ticket: ticketRes.rows[0] });
  } catch (err) {
    await client.query('ROLLBACK'); // Rollback on error
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

// DELETE (CASCADE DELETE RECORD)
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM bookings WHERE booking_id=$1', [id]);
    res.json({ message: 'Booking deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;