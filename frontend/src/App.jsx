import React, { useState, useEffect } from 'react';
import axios from 'axios';

const NODE_API = import.meta.env.VITE_NODE_API_URL;
const FLASK_API = import.meta.env.VITE_FLASK_API_URL;

export default function App() {
  const [activeTab, setActiveTab] = useState('customers'); // 'customers' | 'movies' | 'bookings'
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  // Form states
  const [customerForm, setCustomerForm] = useState({ first_name: '', last_name: '', email: '', date_of_birth: '' });
  const [movieForm, setMovieForm] = useState({ title: '', language: '', genre: '', duration_minutes: '' });
  const [bookingForm, setBookingForm] = useState({ customer_id: '', show_id: '1', seat_number: '', hall_number: '1', price: '' });

  // Fetch Data based on active tab (SELECT query)
  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${NODE_API}/${activeTab}`);
      setData(res.data);
    } catch (err) {
      alert('Error fetching data: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  // DELETE handler
  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this record?')) return;
    try {
      await axios.delete(`${NODE_API}/${activeTab}/${id}`);
      fetchData(); // Refresh table
    } catch (err) {
      alert('Delete failed: ' + err.message);
    }
  };

  // CREATE Customer
  const handleAddCustomer = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${NODE_API}/auth`, customerForm);
      setCustomerForm({ first_name: '', last_name: '', email: '', date_of_birth: '' });
      fetchData();
    } catch (err) {
      alert('Error creating customer: ' + err.message);
    }
  };

  // CREATE Movie
  const handleAddMovie = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${NODE_API}/movies`, movieForm);
      setMovieForm({ title: '', language: '', genre: '', duration_minutes: '' });
      fetchData();
    } catch (err) {
      alert('Error adding movie: ' + err.message);
    }
  };

  // CREATE Booking (Transaction across Bookings & Tickets tables)
  const handleAddBooking = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${NODE_API}/bookings`, bookingForm);
      setBookingForm({ customer_id: '', show_id: '1', seat_number: '', hall_number: '1', price: '' });
      fetchData();
    } catch (err) {
      alert('Error creating booking transaction: ' + err.message);
    }
  };

  // Download Ticket PDF from Flask Microservice
  const handleDownloadPDF = async (row) => {
    try {
      const res = await axios.post(`${FLASK_API}/generate-ticket-pdf`, {
        booking_id: row.booking_id,
        customer_id: row.customer_id || 1,
        movie_name: row.title || 'Movie',
        theatre_name: 'Grand Cinema',
        seat_number: row.seat_number || 'A1',
        price: row.total_amount || row.price || 10
      }, { responseType: 'blob' });

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `ticket_${row.booking_id}.pdf`);
      document.body.appendChild(link);
      link.click();
    } catch (err) {
      alert('Error generating PDF via Flask: ' + err.message);
    }
  };

  return (
    <div style={{ fontFamily: 'sans-serif', padding: '20px', maxWidth: '1100px', margin: '0 auto' }}>
      <h1>🎬 DBMS Movie Ticket System Dashboard</h1>
      <p style={{ color: '#666' }}>Demonstrating Relational Database CRUD & Multi-Table Transactions</p>

      {/* Tab Navigation */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        {['customers', 'movies', 'bookings'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: '10px 20px',
              textTransform: 'capitalize',
              fontWeight: 'bold',
              backgroundColor: activeTab === tab ? '#0070f3' : '#e0e0e0',
              color: activeTab === tab ? '#fff' : '#000',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            {tab} Table
          </button>
        ))}
      </div>

      {/* Insert Forms */}
      <div style={{ background: '#f9f9f9', padding: '15px', borderRadius: '8px', marginBottom: '20px', border: '1px solid #ddd' }}>
        <h3>➕ Insert Record into `{activeTab.toUpperCase()}` Table</h3>
        
        {activeTab === 'customers' && (
          <form onSubmit={handleAddCustomer} style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <input placeholder="First Name" value={customerForm.first_name} onChange={e => setCustomerForm({...customerForm, first_name: e.target.value})} required />
            <input placeholder="Last Name" value={customerForm.last_name} onChange={e => setCustomerForm({...customerForm, last_name: e.target.value})} required />
            <input placeholder="Email" type="email" value={customerForm.email} onChange={e => setCustomerForm({...customerForm, email: e.target.value})} required />
            <input type="date" value={customerForm.date_of_birth} onChange={e => setCustomerForm({...customerForm, date_of_birth: e.target.value})} required />
            <button type="submit">INSERT Customer</button>
          </form>
        )}

        {activeTab === 'movies' && (
          <form onSubmit={handleAddMovie} style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <input placeholder="Movie Title" value={movieForm.title} onChange={e => setMovieForm({...movieForm, title: e.target.value})} required />
            <input placeholder="Language" value={movieForm.language} onChange={e => setMovieForm({...movieForm, language: e.target.value})} required />
            <input placeholder="Genre" value={movieForm.genre} onChange={e => setMovieForm({...movieForm, genre: e.target.value})} required />
            <input placeholder="Duration (min)" type="number" value={movieForm.duration_minutes} onChange={e => setMovieForm({...movieForm, duration_minutes: e.target.value})} required />
            <button type="submit">INSERT Movie</button>
          </form>
        )}

        {activeTab === 'bookings' && (
          <form onSubmit={handleAddBooking} style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <input placeholder="Customer ID (FK)" value={bookingForm.customer_id} onChange={e => setBookingForm({...bookingForm, customer_id: e.target.value})} required />
            <input placeholder="Seat Number" value={bookingForm.seat_number} onChange={e => setBookingForm({...bookingForm, seat_number: e.target.value})} required />
            <input placeholder="Price ($)" type="number" step="0.01" value={bookingForm.price} onChange={e => setBookingForm({...bookingForm, price: e.target.value})} required />
            <button type="submit">EXECUTE Transaction</button>
          </form>
        )}
      </div>

      {/* Relational Database Table View */}
      <h3>📊 Records View (SELECT * FROM {activeTab})</h3>
      {loading ? (
        <p>Loading table records...</p>
      ) : (
        <table border="1" cellPadding="10" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: '#eee' }}>
              {data.length > 0 && Object.keys(data[0]).map((key) => <th key={key}>{key}</th>)}
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row, idx) => {
              const primaryKey = row.customer_id || row.movie_id || row.booking_id;
              return (
                <tr key={idx}>
                  {Object.values(row).map((val, i) => (
                    <td key={i}>{val !== null ? val.toString() : 'NULL'}</td>
                  ))}
                  <td>
                    <button 
                      onClick={() => handleDelete(primaryKey)} 
                      style={{ color: 'red', marginRight: '8px', cursor: 'pointer' }}
                    >
                      DELETE
                    </button>
                    {activeTab === 'bookings' && (
                      <button 
                        onClick={() => handleDownloadPDF(row)}
                        style={{ cursor: 'pointer', backgroundColor: '#28a745', color: 'white', border: 'none', padding: '4px 8px', borderRadius: '4px' }}
                      >
                        PDF Ticket
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}