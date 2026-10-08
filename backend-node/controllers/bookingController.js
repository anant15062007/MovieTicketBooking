const pool = require('../config/db');

exports.createBooking = async (req, res) => {
  const { customer_id, show_id, tickets } = req.body; // tickets: [{ seat_number, hall_number, price }][cite: 1]
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const totalAmount = tickets.reduce((sum, t) => sum + t.price, 0);

    // Insert into Bookings
    const bookingRes = await client.query(
      `INSERT INTO bookings (customer_id, total_amount) VALUES ($1, $2) RETURNING booking_id, booking_date, booking_time`,
      [customer_id, totalAmount]
    );
    const bookingId = bookingRes.rows[0].booking_id;

    // Insert each Ticket
    for (let ticket of tickets) {
      await client.query(
        `INSERT INTO tickets (booking_id, show_id, seat_number, hall_number, price) VALUES ($1, $2, $3, $4, $5)`,
        [bookingId, show_id, ticket.seat_number, ticket.hall_number, ticket.price]
      );
    }

    await client.query('COMMIT');
    res.status(201).json({ message: 'Booking successful', bookingId, totalAmount });
  } catch (error) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: error.message });
  } finally {
    client.release();
  }
};