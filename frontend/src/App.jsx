import React, { useState, useEffect } from 'react';
import axios from 'axios';

const NODE_API = import.meta.env.VITE_NODE_API_URL || 'http://localhost:5000/api';

export default function App() {
  const [activeTab, setActiveTab] = useState('customers');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  // Dropdown options lists for bookings
  const [customersList, setCustomersList] = useState([]);
  const [showsList, setShowsList] = useState([]);

  // Edit & Hover state
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [hoveredCell, setHoveredCell] = useState(null);

  const [customerForm, setCustomerForm] = useState({ first_name: '', middle_name: '', last_name: '', email: '', date_of_birth: '', phone_number: '' });
  const [theatreForm, setTheatreForm] = useState({ theatre_name: '', location: '', total_screens: '' });
  const [movieForm, setMovieForm] = useState({ title: '', language: '', genre: '', duration_minutes: '' });
  const [showForm, setShowForm] = useState({ theatre_id: '', movie_id: '', show_date: '', show_time: '', language: '' });
  const [bookingForm, setBookingForm] = useState({ customer_id: '', show_id: '', seat_number: '', hall_number: '' });

  const fetchData = async () => {
    setLoading(true);
    setEditingId(null);
    setHoveredCell(null);
    try {
      const res = await axios.get(`${NODE_API}/${activeTab}`);
      setData(res.data);

      // Fetch helper lists for dropdowns when booking
      const custRes = await axios.get(`${NODE_API}/customers`);
      setCustomersList(custRes.data);
      const showRes = await axios.get(`${NODE_API}/shows`);
      setShowsList(showRes.data);
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
      const endpoint = activeTab === 'bookings' ? 'bookings' : activeTab;
      await axios.delete(`${NODE_API}/${endpoint}/${id}`);
      fetchData();
    } catch (err) {
      alert('Delete failed: ' + err.message);
    }
  };

  const handleEditClick = (row, rowId) => {
    setEditingId(rowId);
    setEditForm({ ...row });
  };

  const handleSaveEdit = async (rowId) => {
    try {
      const endpoint = activeTab === 'bookings' ? 'bookings' : activeTab;
      await axios.put(`${NODE_API}/${endpoint}/${rowId}`, editForm);
      setEditingId(null);
      fetchData();
    } catch (err) {
      alert('Update failed: ' + err.message);
    }
  };

  const handleAddCustomer = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${NODE_API}/customers`, customerForm);
      setCustomerForm({ first_name: '', middle_name: '', last_name: '', email: '', date_of_birth: '', phone_number: '' });
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

  const handleAddBooking = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${NODE_API}/bookings`, bookingForm);
      setBookingForm({ customer_id: '', show_id: '', seat_number: '', hall_number: '' });
      fetchData();
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  // Helper to format dates as DD/MM/YYYY and clean times
  const formatValue = (key, val) => {
    if (val === null || val === undefined) return 'NULL';
    if (key.toLowerCase().includes('date') && typeof val === 'string') {
      const datePart = val.split('T')[0];
      const parts = datePart.split('-');
      if (parts.length === 3) {
        return `${parts[2]}/${parts[1]}/${parts[0]}`; // DD/MM/YYYY
      }
    }
    if (key.toLowerCase().includes('time') && typeof val === 'string') {
      return val.split('.')[0]; // Removes milliseconds
    }
    return val.toString();
  };

  // Filter out PK and FK columns ending with '_id' and any price column
  const visibleKeys = data.length > 0 
    ? Object.keys(data[0]).filter(key => !key.toLowerCase().endsWith('_id') && key.toLowerCase() !== 'price') 
    : [];

  return (
    <div style={{ fontFamily: 'sans-serif', padding: '40px', width: '100vw', minHeight: '100vh', background: '#121212', color: '#ffffff', boxSizing: 'border-box', margin: 0, overflowX: 'hidden' }}>
      
      {/* Centered Table Navigation Tabs */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '40px', flexWrap: 'wrap' }}>
        {['customers', 'theatres', 'movies', 'shows', 'bookings', 'tickets'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: '10px 22px',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              fontSize: '13px',
              fontWeight: 'bold',
              backgroundColor: activeTab === tab ? '#ffffff' : '#1e1e1e',
              color: activeTab === tab ? '#000000' : '#aaaaaa',
              border: '1px solid #333333',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Insert Record Section */}
      <div style={{ marginBottom: '40px', textAlign: 'center' }}>
        <h3 style={{ marginBottom: '15px', textTransform: 'uppercase', fontSize: '13px', letterSpacing: '1px', color: '#888888' }}>
          Insert into {activeTab}
        </h3>
        
        {activeTab === 'customers' && (
          <form onSubmit={handleAddCustomer} style={{ display: 'flex', justifyContent: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <input placeholder="First Name" value={customerForm.first_name} onChange={e => setCustomerForm({...customerForm, first_name: e.target.value})} style={inputStyle} required />
            <input placeholder="Middle Name" value={customerForm.middle_name} onChange={e => setCustomerForm({...customerForm, middle_name: e.target.value})} style={inputStyle} />
            <input placeholder="Last Name" value={customerForm.last_name} onChange={e => setCustomerForm({...customerForm, last_name: e.target.value})} style={inputStyle} required />
            <input placeholder="Email" type="email" value={customerForm.email} onChange={e => setCustomerForm({...customerForm, email: e.target.value})} style={inputStyle} required />
            <input placeholder="Phone" value={customerForm.phone_number} onChange={e => setCustomerForm({...customerForm, phone_number: e.target.value})} style={inputStyle} />
            <input type="date" value={customerForm.date_of_birth} onChange={e => setCustomerForm({...customerForm, date_of_birth: e.target.value})} style={inputStyle} required />
            <button type="submit" style={buttonStyle}>Insert</button>
          </form>
        )}

        {activeTab === 'theatres' && (
          <form onSubmit={handleAddTheatre} style={{ display: 'flex', justifyContent: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <input placeholder="Theatre Name" value={theatreForm.theatre_name} onChange={e => setTheatreForm({...theatreForm, theatre_name: e.target.value})} style={inputStyle} required />
            <input placeholder="Location" value={theatreForm.location} onChange={e => setTheatreForm({...theatreForm, location: e.target.value})} style={inputStyle} required />
            <input placeholder="Screens" type="number" value={theatreForm.total_screens} onChange={e => setTheatreForm({...theatreForm, total_screens: e.target.value})} style={inputStyle} required />
            <button type="submit" style={buttonStyle}>Insert</button>
          </form>
        )}

        {activeTab === 'movies' && (
          <form onSubmit={handleAddMovie} style={{ display: 'flex', justifyContent: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <input placeholder="Title" value={movieForm.title} onChange={e => setMovieForm({...movieForm, title: e.target.value})} style={inputStyle} required />
            <input placeholder="Language" value={movieForm.language} onChange={e => setMovieForm({...movieForm, language: e.target.value})} style={inputStyle} required />
            <input placeholder="Genre" value={movieForm.genre} onChange={e => setMovieForm({...movieForm, genre: e.target.value})} style={inputStyle} required />
            <input placeholder="Duration (min)" type="number" value={movieForm.duration_minutes} onChange={e => setMovieForm({...movieForm, duration_minutes: e.target.value})} style={inputStyle} required />
            <button type="submit" style={buttonStyle}>Insert</button>
          </form>
        )}

        {activeTab === 'shows' && (
          <form onSubmit={handleAddShow} style={{ display: 'flex', justifyContent: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <input placeholder="Theatre ID" type="number" value={showForm.theatre_id} onChange={e => setShowForm({...showForm, theatre_id: e.target.value})} style={inputStyle} required />
            <input placeholder="Movie ID" type="number" value={showForm.movie_id} onChange={e => setShowForm({...showForm, movie_id: e.target.value})} style={inputStyle} required />
            <input type="date" value={showForm.show_date} onChange={e => setShowForm({...showForm, show_date: e.target.value})} style={inputStyle} required />
            <input type="time" value={showForm.show_time} onChange={e => setShowForm({...showForm, show_time: e.target.value})} style={inputStyle} required />
            <input placeholder="Language" value={showForm.language} onChange={e => setShowForm({...showForm, language: e.target.value})} style={inputStyle} required />
            <button type="submit" style={buttonStyle}>Insert</button>
          </form>
        )}

        {activeTab === 'bookings' && (
          <form onSubmit={handleAddBooking} style={{ display: 'flex', justifyContent: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <select 
              value={bookingForm.customer_id} 
              onChange={e => setBookingForm({...bookingForm, customer_id: e.target.value})} 
              style={inputStyle} 
              required
            >
              <option value="">Select Customer</option>
              {customersList.map(c => (
                <option key={c.customer_id} value={c.customer_id}>
                  {c.first_name} {c.last_name} ({c.email})
                </option>
              ))}
            </select>

            <select 
              value={bookingForm.show_id} 
              onChange={e => setBookingForm({...bookingForm, show_id: e.target.value})} 
              style={inputStyle} 
              required
            >
              <option value="">Select Movie & Show</option>
              {showsList.map(s => (
                <option key={s.show_id} value={s.show_id}>
                  {s.movie_title} @ {s.theatre_name} ({s.show_date ? s.show_date.split('T')[0] : ''} {s.show_time ? s.show_time.split('.')[0] : ''})
                </option>
              ))}
            </select>

            <input placeholder="Seat Number (e.g. A12)" value={bookingForm.seat_number} onChange={e => setBookingForm({...bookingForm, seat_number: e.target.value})} style={inputStyle} required />
            <input placeholder="Hall Number" type="number" value={bookingForm.hall_number} onChange={e => setBookingForm({...bookingForm, hall_number: e.target.value})} style={inputStyle} required />
            
            <button type="submit" style={buttonStyle}>Book Ticket</button>
          </form>
        )}

        {activeTab === 'tickets' && <p style={{ color: '#777', fontSize: '13px', margin: 0 }}>Managed via Bookings tab</p>}
      </div>

      {/* Table Data View */}
      <h3 style={{ textAlign: 'center', textTransform: 'uppercase', fontSize: '13px', letterSpacing: '1px', color: '#888888', marginBottom: '15px' }}>
        Table: {activeTab}
      </h3>
      
      {loading ? (
        <p style={{ textAlign: 'center', color: '#777' }}>Loading...</p>
      ) : (
        <div style={{ width: '100%', overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', background: '#121212', border: '1px solid #222222' }}>
            <thead>
              <tr style={{ background: '#1a1a1a', borderBottom: '1px solid #2a2a2a' }}>
                {visibleKeys.map((key) => (
                  <th key={key} style={{ padding: '14px 16px', color: '#cccccc', borderRight: '1px solid #2a2a2a', fontSize: '13px', fontWeight: '600' }}>{key}</th>
                ))}
                <th style={{ padding: '14px 16px', color: '#cccccc', fontSize: '13px', fontWeight: '600' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.length === 0 ? (
                <tr>
                  <td colSpan="100" style={{ padding: '24px', textAlign: 'center', color: '#666' }}>No records found</td>
                </tr>
              ) : (
                data.map((row, idx) => {
                  const rowId = row.customer_id || row.theatre_id || row.movie_id || row.show_id || row.booking_id || row.ticket_id || row.phone_id;
                  const isEditing = editingId === rowId;

                  return (
                    <tr key={idx} style={{ borderBottom: '1px solid #1a1a1a' }}>
                      {visibleKeys.map((key, i) => (
                        <td 
                          key={i} 
                          onMouseEnter={() => !isEditing && setHoveredCell({ rowIndex: idx, key })}
                          onMouseLeave={() => setHoveredCell(null)}
                          style={{ padding: '14px 16px', color: '#aaaaaa', borderRight: '1px solid #1a1a1a', fontSize: '13px' }}
                        >
                          {isEditing ? (
                            <input
                              value={editForm[key] !== null ? editForm[key] : ''}
                              onChange={e => setEditForm({ ...editForm, [key]: e.target.value })}
                              style={{ ...inputStyle, padding: '4px 8px', width: '100%' }}
                            />
                          ) : (
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <span>{formatValue(key, row[key])}</span>
                              {hoveredCell?.rowIndex === idx && hoveredCell?.key === key && (
                                <button
                                  onClick={() => handleEditClick(row, rowId)}
                                  title="Edit Record"
                                  style={{
                                    background: 'transparent',
                                    border: 'none',
                                    color: '#888888',
                                    cursor: 'pointer',
                                    fontSize: '13px',
                                    marginLeft: '10px',
                                    padding: '0'
                                  }}
                                >
                                  ✎
                                </button>
                              )}
                            </div>
                          )}
                        </td>
                      ))}
                      <td style={{ padding: '14px 16px' }}>
                        {isEditing ? (
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button 
                              onClick={() => handleSaveEdit(rowId)}
                              style={{ background: 'transparent', color: '#1ebe1e', border: '1px solid #555555', padding: '5px 8px', borderRadius: '3px', cursor: 'pointer', fontSize: '12px' }}
                            >
                              Save
                            </button>
                            <button 
                              onClick={() => setEditingId(null)}
                              style={{ background: 'transparent', color: '#888888', border: '1px solid #333333', padding: '5px 8px', borderRadius: '3px', cursor: 'pointer', fontSize: '12px' }}
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button 
                            onClick={() => handleDelete(rowId)} 
                            title="Delete Record"
                            style={{ background: 'transparent', color: '#a10808', border: '1px solid #333333', padding: '5px 10px', borderRadius: '3px', cursor: 'pointer', fontSize: '12px' }}
                          >
                            Delete
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

const inputStyle = {
  padding: '9px 14px',
  background: '#1a1a1a',
  border: '1px solid #333333',
  borderRadius: '4px',
  color: '#ffffff',
  fontSize: '13px',
  outline: 'none'
};

const buttonStyle = {
  padding: '9px 18px',
  background: '#222222',
  color: '#ffffff',
  border: '1px solid #444444',
  borderRadius: '4px',
  cursor: 'pointer',
  fontSize: '13px',
  fontWeight: '600'
};