const express = require('express');
const router = express.Router();
const pool = require('../config/db');

router.get('/', async (req, res) => {
  try {
    const query = `
      SELECT 
        b.booking_id, 
        b.customer_id, 
        b.booking_date, 
        b.booking_time, 
        b.total_amount,
        c.first_name, 
        c.last_name, 
        c.email,
        t.ticket_id,
        t.show_id,
        t.seat_number,
        t.hall_number,
        m.title AS movie_title,
        th.theatre_name
      FROM bookings b
      JOIN customers c ON b.customer_id = c.customer_id
      LEFT JOIN tickets t ON b.booking_id = t.booking_id
      LEFT JOIN shows s ON t.show_id = s.show_id
      LEFT JOIN movies m ON s.movie_id = m.movie_id
      LEFT JOIN theatres th ON s.theatre_id = th.theatre_id
      ORDER BY b.booking_id DESC
    `;
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  const { customer_id, show_id, seat_number, hall_number } = req.body;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const bookingRes = await client.query(
      `INSERT INTO bookings (customer_id, total_amount) VALUES ($1, $2) RETURNING *`,
      [customer_id, 0.00]
    );
    const booking = bookingRes.rows[0];

    const ticketRes = await client.query(
      `INSERT INTO tickets (booking_id, show_id, seat_number, hall_number, price) VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [booking.booking_id, show_id, seat_number, hall_number || 1, 0.00]
    );

    await client.query('COMMIT');
    res.status(201).json({ booking, ticket: ticketRes.rows[0] });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM bookings WHERE booking_id = $1', [req.params.id]);
    res.json({ message: 'Booking deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;