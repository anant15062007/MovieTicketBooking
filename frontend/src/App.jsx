import React, { useState, useEffect } from 'react';
import axios from 'axios';

const NODE_API = import.meta.env.VITE_NODE_API_URL || 'http://localhost:5000/api';
const FLASK_API = import.meta.env.VITE_FLASK_API_URL || 'http://localhost:5001';

export default function App() {
  const [activeTab, setActiveTab] = useState('customers'); // 'customers' | 'theatres' | 'movies' | 'shows' | 'bookings' | 'tickets'
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  // Form states
  const [customerForm, setCustomerForm] = useState({ first_name: '', last_name: '', email: '', date_of_birth: '', phone_number: '' });
  const [theatreForm, setTheatreForm] = useState({ theatre_name: '', location: '', total_screens: '' });
  const [movieForm, setMovieForm] = useState({ title: '', language: '', genre: '', duration_minutes: '' });
  const [showForm, setShowForm] = useState({ theatre_id: '', movie_id: '', show_date: '', show_time: '', language: '' });

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

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this record?')) return;
    try {
      const idKey = activeTab === 'customers' ? 'customer_id' : 
                    activeTab === 'theatres' ? 'theatre_id' : 
                    activeTab === 'movies' ? 'movie_id' : 
                    activeTab === 'shows' ? 'show_id' : 
                    activeTab === 'bookings' ? 'booking_id' : 'ticket_id';
      await axios.delete(`${NODE_API}/${activeTab}/${id}`);
      fetchData();
    } catch (err) {
      alert('Delete failed: ' + err.message);
    }
  };

  const handleAddCustomer = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${NODE_API}/customers`, customerForm);
      setCustomerForm({ first_name: '', last_name: '', email: '', date_of_birth: '', phone_number: '' });
      fetchData();
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  const handleAddTheatre = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${NODE_API}/theatres`, theatreForm);
      setTheatreForm({ theatre_name: '', location: '', total_screens: '' });
      fetchData();
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  const handleAddMovie = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${NODE_API}/movies`, movieForm);
      setMovieForm({ title: '', language: '', genre: '', duration_minutes: '' });
      fetchData();
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  const handleAddShow = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${NODE_API}/shows`, showForm);
      setShowForm({ theatre_id: '', movie_id: '', show_date: '', show_time: '', language: '' });
      fetchData();
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  return (
    <div style={{ fontFamily: 'sans-serif', padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1>🎬 Movie Ticket Booking System - DBMS Dashboard</h1>

      {/* 6 Table Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
        {['customers', 'theatres', 'movies', 'shows', 'bookings', 'tickets'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: '10px 15px',
              textTransform: 'capitalize',
              fontWeight: 'bold',
              backgroundColor: activeTab === tab ? '#0070f3' : '#e0e0e0',
              color: activeTab === tab ? '#fff' : '#000',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Insert Forms */}
      <div style={{ background: '#f9f9f9', padding: '15px', borderRadius: '8px', marginBottom: '20px', border: '1px solid #ddd' }}>
        <h3>➕ Insert Record into `{activeTab.toUpperCase()}`</h3>
        
        {activeTab === 'customers' && (
          <form onSubmit={handleAddCustomer} style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <input placeholder="First Name" value={customerForm.first_name} onChange={e => setCustomerForm({...customerForm, first_name: e.target.value})} required />
            <input placeholder="Last Name" value={customerForm.last_name} onChange={e => setCustomerForm({...customerForm, last_name: e.target.value})} required />
            <input placeholder="Email" type="email" value={customerForm.email} onChange={e => setCustomerForm({...customerForm, email: e.target.value})} required />
            <input placeholder="Phone Number" value={customerForm.phone_number} onChange={e => setCustomerForm({...customerForm, phone_number: e.target.value})} />
            <input type="date" value={customerForm.date_of_birth} onChange={e => setCustomerForm({...customerForm, date_of_birth: e.target.value})} required />
            <button type="submit">INSERT Customer</button>
          </form>
        )}

        {activeTab === 'theatres' && (
          <form onSubmit={handleAddTheatre} style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <input placeholder="Theatre Name" value={theatreForm.theatre_name} onChange={e => setTheatreForm({...theatreForm, theatre_name: e.target.value})} required />
            <input placeholder="Location" value={theatreForm.location} onChange={e => setTheatreForm({...theatreForm, location: e.target.value})} required />
            <input placeholder="Total Screens" type="number" value={theatreForm.total_screens} onChange={e => setTheatreForm({...theatreForm, total_screens: e.target.value})} required />
            <button type="submit">INSERT Theatre</button>
          </form>
        )}

        {activeTab === 'movies' && (
          <form onSubmit={handleAddMovie} style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <input placeholder="Title" value={movieForm.title} onChange={e => setMovieForm({...movieForm, title: e.target.value})} required />
            <input placeholder="Language" value={movieForm.language} onChange={e => setMovieForm({...movieForm, language: e.target.value})} required />
            <input placeholder="Genre" value={movieForm.genre} onChange={e => setMovieForm({...movieForm, genre: e.target.value})} required />
            <input placeholder="Duration (min)" type="number" value={movieForm.duration_minutes} onChange={e => setMovieForm({...movieForm, duration_minutes: e.target.value})} required />
            <button type="submit">INSERT Movie</button>
          </form>
        )}

        {activeTab === 'shows' && (
          <form onSubmit={handleAddShow} style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <input placeholder="Theatre ID" type="number" value={showForm.theatre_id} onChange={e => setShowForm({...showForm, theatre_id: e.target.value})} required />
            <input placeholder="Movie ID" type="number" value={showForm.movie_id} onChange={e => setShowForm({...showForm, movie_id: e.target.value})} required />
            <input type="date" value={showForm.show_date} onChange={e => setShowForm({...showForm, show_date: e.target.value})} required />
            <input type="time" value={showForm.show_time} onChange={e => setShowForm({...showForm, show_time: e.target.value})} required />
            <input placeholder="Language" value={showForm.language} onChange={e => setShowForm({...showForm, language: e.target.value})} required />
            <button type="submit">INSERT Show</button>
          </form>
        )}

        {activeTab === 'bookings' && <p><em>Manage via bookings endpoint</em></p>}
        {activeTab === 'tickets' && <p><em>Tickets are created during booking transactions</em></p>}
      </div>

      {/* Table Data View */}
      <h3>📊 Data View: `{activeTab}`</h3>
      {loading ? (
        <p>Loading...</p>
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
              const rowId = row.customer_id || row.theatre_id || row.movie_id || row.show_id || row.booking_id || row.ticket_id;
              return (
                <tr key={idx}>
                  {Object.values(row).map((val, i) => (
                    <td key={i}>{val !== null ? val.toString() : 'NULL'}</td>
                  ))}
                  <td>
                    <button onClick={() => handleDelete(rowId)} style={{ color: 'red', cursor: 'pointer' }}>DELETE</button>
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