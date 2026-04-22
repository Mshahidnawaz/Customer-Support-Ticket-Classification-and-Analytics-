import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../config';
import { Search, Loader, MapPin, Calendar, Clock, AlertCircle, User, ShieldCheck, LayoutGrid, List } from 'lucide-react';
import { format } from 'date-fns';

const Tracking = ({ onComplaintClick }) => {
  const [complaintId, setComplaintId] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [recentComplaints, setRecentComplaints] = useState([]);
  const [viewMode, setViewMode] = useState('grid');
  const pollingRef = React.useRef(null);

  useEffect(() => {
    // Check for direct redirect ID
    const lastId = localStorage.getItem('lastSubmittedId');
    if (lastId) {
      setComplaintId(lastId);
      handleSearch(null, lastId);
      localStorage.removeItem('lastSubmittedId');
    }

    // High-Velocity Activity Feed Polling (Big Data Simulation)
    fetchRecentComplaints();
    pollingRef.current = setInterval(fetchRecentComplaints, 3000);
    return () => clearInterval(pollingRef.current);
  }, []);

  const fetchRecentComplaints = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/complaints`);
      // Simulating Big Data: Limiting to top 100 most recent
      setRecentComplaints(res.data.slice(0, 100));
    } catch (err) {
      console.error("Feed sync failed", err);
    }
  };

  const handleSearch = async (e, id) => {
    if (e) e.preventDefault();
    const searchId = id || complaintId;
    if (!searchId) return;
    
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(`${API_BASE_URL}/complaints/${searchId}`);
      setResult(res.data);
    } catch (err) {
      setError("Grievance not found. Please verify the ID format and try again.");
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-fade-in" style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <header style={{ marginBottom: '3rem' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 800 }}>Grievance Tracker</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem' }}>Track real-time status or explore the global high-velocity ingestion feed.</p>
      </header>

      {/* Top Section: Search & Result Lookup */}
      <section style={{ marginBottom: '5rem' }}>
        <form className="glass-card" onSubmit={handleSearch} style={{ display: 'flex', gap: '1rem', marginBottom: '2.5rem', padding: '1.25rem' }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <input
              required
              placeholder="Lookup ID (GRI-XXXXXX)"
              value={complaintId}
              onChange={(e) => setComplaintId(e.target.value.toUpperCase())}
              style={{ paddingLeft: '3.5rem', fontSize: '1.1rem', height: '54px' }}
            />
            <Search size={22} style={{ position: 'absolute', left: '1.25rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--primary)' }} />
          </div>
          <button type="submit" className="btn btn-primary" style={{ padding: '0 2rem' }} disabled={loading}>
            {loading ? <Loader className="animate-spin" size={18} /> : 'Sync Data'}
          </button>
        </form>

        {error && (
          <div className="glass-card" style={{ border: '1px solid var(--danger)', padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', color: 'var(--danger)' }}>
            <AlertCircle size={24} />
            <p>{error}</p>
          </div>
        )}

        {result ? (
          <div className="page-fade-in glass-card" style={{ padding: '2.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2.5rem' }}>
                  <div>
                      <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '0.5rem' }}>Status Report</h2>
                      <span style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--primary)' }}>{result.id}</span>
                  </div>
                  <span className={`badge ${result.status === 'Resolved' ? 'badge-resolved' : result.status === 'In Progress' ? 'badge-progress' : 'badge-pending'}`} style={{ padding: '0.5rem 1.25rem' }}>
                      {result.status}
                  </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem', marginBottom: '2.5rem' }}>
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <Calendar size={18} color="var(--primary)" />
                    <div><p className="input-label" style={{ fontSize: '0.75rem' }}>Submitted</p><p style={{ fontWeight: 700 }}>{format(new Date(result.created_at), 'MMM dd, yyyy')}</p></div>
                  </div>
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <MapPin size={18} color="var(--primary)" />
                    <div><p className="input-label" style={{ fontSize: '0.75rem' }}>Location</p><p style={{ fontWeight: 700 }}>{result.location}</p></div>
                  </div>
              </div>

              <div>
                  <p className="input-label">AI Description Summary</p>
                  <div style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid var(--glass-border)', lineHeight: 1.7 }}>
                    {result.description}
                  </div>
              </div>
          </div>
        ) : (
          <div className="glass-card" style={{ height: '240px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', textAlign: 'center' }}>
              <Clock size={40} style={{ marginBottom: '1.5rem', opacity: 0.5 }} />
              <p>Lookup a grievance ID above to<br/>view full lifecycle metadata.</p>
          </div>
        )}
      </section>

      {/* Bottom Section: Global Activity Feed (Full Width) */}
      <section style={{ borderTop: '1px solid var(--glass-border)', paddingTop: '4rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2.5rem' }}>
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--success)' }} className="success-anim"></div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 800 }}>High-Velocity Global Ingestion Feed</h3>
            <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ display: 'flex', background: 'rgba(0,0,0,0.2)', padding: '0.25rem', borderRadius: '10px', border: '1px solid var(--glass-border)' }}>
                    <button 
                        onClick={() => setViewMode('grid')} 
                        style={{ padding: '0.5rem', background: viewMode === 'grid' ? 'var(--primary)' : 'transparent', border: 'none', borderRadius: '8px', cursor: 'pointer', color: viewMode === 'grid' ? 'white' : 'var(--text-muted)' }}
                    >
                        <LayoutGrid size={18} />
                    </button>
                    <button 
                        onClick={() => setViewMode('list')} 
                        style={{ padding: '0.5rem', background: viewMode === 'list' ? 'var(--primary)' : 'transparent', border: 'none', borderRadius: '8px', cursor: 'pointer', color: viewMode === 'list' ? 'white' : 'var(--text-muted)' }}
                    >
                        <List size={18} />
                    </button>
                </div>
                <div style={{ width: '1px', height: '24px', background: 'var(--glass-border)' }}></div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: 'rgba(0,0,0,0.2)', padding: '0.5rem 1rem', borderRadius: '30px', border: '1px solid var(--glass-border)' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary)' }}>LIVE STATUS</span>
                    <div style={{ width: '1px', height: '12px', background: 'var(--glass-border)' }}></div>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Polling (3s Interval)</span>
                </div>
            </div>
          </div>
          
          <div style={{ paddingBottom: '1rem' }}>
              <div style={{ 
                  display: viewMode === 'grid' ? 'grid' : 'flex', 
                  flexDirection: 'column',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', 
                  gap: '1.5rem' 
              }}>
                  {recentComplaints.map((c) => (
                      <div 
                          key={c.id} 
                          className="glass-card audit-row-hover" 
                          style={{ 
                              padding: viewMode === 'grid' ? '1.5rem' : '1.25rem 2rem', 
                              cursor: 'pointer', 
                              borderLeft: `4px solid ${
                                  c.status === 'Resolved' ? 'var(--success)' : 
                                  c.status === 'In Progress' ? 'var(--warning)' : 
                                  'var(--primary)'
                              }`, 
                              transition: 'var(--transition)', 
                              borderRadius: '16px',
                              display: viewMode === 'list' ? 'flex' : 'block',
                              alignItems: 'center',
                              gap: '2rem'
                          }}
                          onClick={() => onComplaintClick(c)}
                      >
                          {viewMode === 'grid' ? (
                            <>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                                    <span style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--primary)', letterSpacing: '0.05em' }}>{c.id}</span>
                                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{format(new Date(c.created_at), 'HH:mm:ss')}</span>
                                </div>
                                <p style={{ fontSize: '0.95rem', lineHeight: 1.6, color: 'var(--text-main)', height: '3rem', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                                    {c.description}
                                </p>
                                <div style={{ marginTop: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span className={`badge ${c.status === 'Resolved' ? 'badge-resolved' : c.status === 'In Progress' ? 'badge-progress' : 'badge-pending'}`} style={{ padding: '0.35rem 0.75rem', fontSize: '0.7rem' }}>
                                        {c.status}
                                    </span>
                                    <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600 }}>{c.category}</span>
                                </div>
                            </>
                          ) : (
                            <>
                                <div style={{ width: '120px', flexShrink: 0 }}>
                                    <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--primary)', display: 'block' }}>{c.id}</span>
                                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{format(new Date(c.created_at), 'HH:mm:ss')}</span>
                                </div>
                                <div style={{ flex: 1 }}>
                                    <p style={{ fontSize: '0.9rem', color: 'var(--text-main)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '600px' }}>{c.description}</p>
                                    <span style={{ fontSize: '0.7rem', color: 'var(--primary)', fontWeight: 700, textTransform: 'uppercase' }}>{c.category}</span>
                                </div>
                                <div style={{ width: '150px', textAlign: 'right' }}>
                                    <span className={`badge ${c.status === 'Resolved' ? 'badge-resolved' : c.status === 'In Progress' ? 'badge-progress' : 'badge-pending'}`} style={{ fontSize: '0.65rem' }}>
                                        {c.status}
                                    </span>
                                </div>
                            </>
                          )}
                      </div>
                  ))}
              </div>
          </div>
      </section>
    </div>
  );
};

export default Tracking;
