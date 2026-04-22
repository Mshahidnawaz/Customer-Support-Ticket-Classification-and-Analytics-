import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../config';
import { History, User, Activity, Calendar, Search, Filter } from 'lucide-react';
import { format } from 'date-fns';

const AuditLogs = ({ onComplaintClick }) => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [fetchingDetails, setFetchingDetails] = useState(null);

  useEffect(() => {
    fetchLogs();
  }, [searchQuery, actionFilter]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      let url = `${API_BASE_URL}/audit`;
      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);
      if (params.toString()) url += `?${params.toString()}`;
      
      const res = await axios.get(url);
      setLogs(res.data);
    } catch (err) {
      console.error("Failed to fetch audit logs", err);
    } finally {
      setLoading(false);
    }
  };

  const handleRowClick = async (complaintId) => {
      if (!complaintId || complaintId === 'System Core') return;
      setFetchingDetails(complaintId);
      try {
          const res = await axios.get(`${API_BASE_URL}/complaints/${complaintId}`);
          onComplaintClick(res.data);
      } catch (err) {
          console.error("Failed to load details", err);
      } finally {
          setFetchingDetails(null);
      }
  };

  const filteredLogs = logs.filter(log => {
      if (!actionFilter) return true;
      return log.action.toLowerCase().includes(actionFilter.toLowerCase());
  });

  return (
    <div className="page-fade-in">
      <header style={{ marginBottom: '2.5rem' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 800 }}>System Audit Logs</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem' }}>Trace all administrative and citizen actions for full accountability.</p>
      </header>

      {/* Search & Filters */}
      <div className="glass-card" style={{ marginBottom: '2.5rem', display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <input 
            placeholder="Search by ID, User, or Action details..." 
            value={searchQuery} 
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ paddingLeft: '3rem', fontSize: '1.1rem', height: '54px' }}
          />
          <Search size={22} style={{ position: 'absolute', left: '1.25rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--primary)' }} />
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <Filter size={20} color="var(--primary)" />
            <select 
                value={actionFilter} 
                onChange={(e) => setActionFilter(e.target.value)} 
                style={{ width: '220px', height: '54px', fontWeight: 600, fontSize: '1.1rem' }}
            >
                <option value="">All Action Types</option>
                <option value="Submission">Complaint Submission</option>
                <option value="Status Update">Status Updates</option>
                <option value="Remark">Admin Remarks</option>
                <option value="Assignment">Agent Assignments</option>
            </select>
        </div>
      </div>

      <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table>
            <thead>
              <tr>
                <th style={{ paddingLeft: '1.5rem' }}>Timestamp</th>
                <th>Operation</th>
                <th>Performed By</th>
                <th>Grievance ID</th>
                <th>Details & Metadata</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>Refreshing logs...</td></tr>
              ) : filteredLogs.length === 0 ? (
                <tr><td colSpan={6} style={{ textAlign: 'center', padding: '4rem' }}>No matching activities found.</td></tr>
              ) : filteredLogs.map((log) => (
                <tr key={log.id} 
                    onClick={() => handleRowClick(log.complaint_id)}
                    style={{ cursor: log.complaint_id ? 'pointer' : 'default' }}
                    className="audit-row-hover"
                >
                  <td style={{ paddingLeft: '1.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Calendar size={14} />
                      {format(new Date(log.timestamp), 'MMM dd, HH:mm:ss')}
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(99, 102, 241, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Activity size={16} color="var(--primary)" />
                      </div>
                      <span style={{ fontWeight: 700 }}>{log.action}</span>
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      <User size={16} color="var(--text-muted)" />
                      <span style={{ fontWeight: 600 }}>{log.performed_by}</span>
                    </div>
                  </td>
                  <td>
                    <span style={{ fontWeight: 800, color: 'var(--primary)', letterSpacing: '0.05em' }}>{log.complaint_id || 'System Core'}</span>
                  </td>
                  <td style={{ fontSize: '0.95rem', maxWidth: '300px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{log.details}</td>
                  <td>
                      <button 
                        className="btn btn-outline" 
                        style={{ padding: '0.3rem 0.8rem', fontSize: '0.8rem', border: 'none' }}
                        disabled={!log.complaint_id || fetchingDetails === log.complaint_id}
                      >
                         {fetchingDetails === log.complaint_id ? 'Loading...' : 'Inspect'}
                      </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AuditLogs;
