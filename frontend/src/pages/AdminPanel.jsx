import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../config';
import { Filter, Edit3 } from 'lucide-react';
import { format } from 'date-fns';
import StatusChips from '../components/StatusChips';

const AdminPanel = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ category: '', status: '' });
  const [updating, setUpdating] = useState(null); // Full complaint object being updated
  const [updateForm, setUpdateForm] = useState({ status: '', remark: '' });

  useEffect(() => {
    fetchComplaints();
  }, [filter]);

  const fetchComplaints = async () => {
    setLoading(true);
    try {
      let url = `${API_BASE_URL}/complaints`;
      const params = new URLSearchParams();
      if (filter.category) params.append('category', filter.category);
      if (filter.status) params.append('status', filter.status);
      if (params.toString()) url += `?${params.toString()}`;
      
      const res = await axios.get(url);
      setComplaints(res.data);
    } catch (err) {
      console.error("Failed to fetch complaints", err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (id) => {
    try {
      await axios.patch(`${API_BASE_URL}/complaints/${id}`, updateForm);
      setUpdating(null);
      fetchComplaints();
    } catch (err) {
      console.error("Update failed", err);
    }
  };

  const startUpdate = (c) => {
    setUpdating(c);
    setUpdateForm({ status: c.status, remark: c.remark || '' });
  };

  return (
    <div className="page-fade-in">
      <header style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Admin Panel</h1>
        <p style={{ color: 'var(--text-muted)' }}>Manage and respond to citizen grievances efficiently with real-time status updates.</p>
      </header>

      <div className="glass-card" style={{ marginBottom: '2rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Filter size={18} color="var(--primary)" />
          <span style={{ fontWeight: 600 }}>Filters:</span>
        </div>
        <select value={filter.category} onChange={(e) => setFilter({ ...filter, category: e.target.value })} style={{ width: '200px' }}>
          <option value="">All Categories</option>
          <option value="Roads">Roads & Pavements</option>
          <option value="Water">Water & Sewerage</option>
          <option value="Electricity">Electricity</option>
          <option value="Garbage">Garbage / Waste</option>
          <option value="Traffic">Traffic</option>
        </select>
        <select value={filter.status} onChange={(e) => setFilter({ ...filter, status: e.target.value })} style={{ width: '200px' }}>
          <option value="">All Statuses</option>
          <option value="Pending">Pending</option>
          <option value="In Progress">In Progress</option>
          <option value="Under Review">Under Review</option>
          <option value="Escalated">Escalated</option>
          <option value="Resolved">Resolved</option>
        </select>
        <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
           <button className="btn btn-outline" onClick={() => fetchComplaints()}>Refresh</button>
        </div>
      </div>

      <div className="glass-card" style={{ overflowX: 'auto', padding: 0 }}>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Category</th>
              <th>Description</th>
              <th>Urgency</th>
              <th>Status</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} style={{ textAlign: 'center', padding: '3rem' }}>Fetching data...</td></tr>
            ) : complaints.map((c) => (
              <tr key={c.id} onClick={() => startUpdate(c)} style={{ cursor: 'pointer' }} className="audit-row-hover">
                <td style={{ fontWeight: 600, color: 'var(--primary)', fontSize: '0.85rem' }}>{c.id}</td>
                <td>{c.category}</td>
                <td style={{ maxWidth: '300px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.description}</td>
                <td>
                  <span className={`badge ${c.urgency === 'High' ? 'badge-high' : ''}`} style={{ background: c.urgency === 'High' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(99, 102, 241, 0.1)', color: c.urgency === 'High' ? 'var(--danger)' : 'var(--primary)' }}>{c.urgency}</span>
                </td>
                <td>
                  <span className={`badge ${
                    c.status === 'Resolved' ? 'badge-resolved' : 
                    c.status === 'In Progress' ? 'badge-progress' : 
                    c.status === 'Under Review' ? 'badge-review' : 
                    c.status === 'Escalated' ? 'badge-escalated' : 
                    'badge-pending'
                  }`}>
                    {c.status}
                  </span>
                </td>
                <td style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{format(new Date(c.created_at), 'MMM dd, yyyy')}</td>
                <td>
                  <button className="btn btn-outline" style={{ padding: '0.4rem', border: 'none' }}>
                    <Edit3 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {updating && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }} onClick={() => setUpdating(null)}>
          <div className="glass-card page-fade-in" style={{ width: '100%', maxWidth: '700px', background: 'var(--background)', border: '1px solid var(--primary)', padding: '3rem' }} onClick={e => e.stopPropagation()}>
            <h2 style={{ marginBottom: '0.5rem', fontWeight: 800 }}>Manage Resolution</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '2.5rem' }}>Grievance ID: <span style={{ color: 'var(--primary)', fontWeight: 800 }}>{updating.id}</span></p>
            
            <div style={{ marginBottom: '2.5rem' }}>
                <label className="input-label">Citizen Description</label>
                <div style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.03)', borderRadius: '16px', border: '1px solid var(--glass-border)', lineHeight: 1.7 }}>
                    {updating.description}
                </div>
            </div>

            <div style={{ marginBottom: '2.5rem' }}>
              <label className="input-label">Update Workflow Status</label>
              <StatusChips 
                currentStatus={updateForm.status} 
                onChange={(status) => setUpdateForm({ ...updateForm, status })} 
              />
            </div>

            <div style={{ marginBottom: '2.5rem' }}>
              <label className="input-label">Admin Remarks / Action Taken</label>
              <textarea 
                rows={4} 
                value={updateForm.remark} 
                onChange={(e) => setUpdateForm({ ...updateForm, remark: e.target.value })} 
                placeholder="Details about resolution work..."
                style={{ background: 'rgba(0,0,0,0.2)' }}
              />
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
              <button className="btn btn-primary" style={{ flex: 1, height: '56px' }} onClick={() => handleUpdate(updating.id)}>Publish Updates</button>
              <button className="btn btn-outline" style={{ flex: 0.5, height: '56px' }} onClick={() => setUpdating(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
