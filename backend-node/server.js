const express = require('express');
const cors = require('cors');
require('dotenv').config();

// 1. Import Routes
const authRoutes = require('./routes/authRoutes');
const movieRoutes = require('./routes/movieRoutes');
const bookingRoutes = require('./routes/bookingRoutes');

const app = express();

// 2. Middleware
app.use(cors());
app.use(express.json());

// 3. Mount Routes (matching React API endpoints)
app.use('/api/customers', authRoutes);
app.use('/api/movies', movieRoutes);
app.use('/api/bookings', bookingRoutes);

// 4. Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Node.js API running on port ${PORT}`));