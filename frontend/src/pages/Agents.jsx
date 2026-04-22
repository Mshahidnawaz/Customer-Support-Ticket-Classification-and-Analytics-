import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../config';
import { User, ShieldCheck, CheckCircle, Clock, ChevronDown, ChevronUp, MessageSquare, AlertCircle, Search, Activity, Flag } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import StatusChips from '../components/StatusChips';

const Agents = ({ onComplaintClick }) => {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedAgent, setExpandedAgent] = useState(null);
  const [updating, setUpdating] = useState(null);
  const [updateForm, setUpdateForm] = useState({ status: '', remark: '' });
  const [searchQuery, setSearchQuery] = useState('');

  const fetchAgents = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/agents`);
      setAgents(res.data);
    } catch (err) {
      console.error("Failed to fetch agents", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAgents();
  }, []);

  const handleUpdate = async (id) => {
    try {
      await axios.patch(`${API_BASE_URL}/complaints/${id}`, updateForm);
      setUpdating(null);
      fetchAgents();
    } catch (err) {
      console.error("Agent update failed", err);
    }
  };

  const startUpdate = (c) => {
    setUpdating(c);
    setUpdateForm({ status: c.status, remark: c.remark || '' });
  };

  const toggleExpand = (agentId) => {
    setExpandedAgent(expandedAgent === agentId ? null : agentId);
  };

  const filteredAgents = agents.filter(agent => {
    const query = searchQuery.toLowerCase();
    const nameMatch = agent.name.toLowerCase().includes(query);
    const deptMatch = agent.department.toLowerCase().includes(query);
    const complaintMatch = agent.complaints.some(c => c.id.toLowerCase().includes(query));
    return nameMatch || deptMatch || complaintMatch;
  });

  // Auto-expand on ID match
  useEffect(() => {
    if (searchQuery.length > 3) {
      const targetAgent = agents.find(a => a.complaints.some(c => c.id.toLowerCase() === searchQuery.toLowerCase()));
      if (targetAgent) setExpandedAgent(targetAgent.id);
    }
  }, [searchQuery, agents]);

  if (loading) return <div className="loading">Fetching Agent Data...</div>;

  return (
    <div className="page-fade-in">
      <header style={{ marginBottom: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: '2rem', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: '300px' }}>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>Municipal Agents</h1>
          <p style={{ color: 'var(--text-muted)' }}>Monitor agent performance, active workloads, and resolution history across all departments.</p>
        </div>
        
        <div style={{ position: 'relative', width: '100%', maxWidth: '400px' }}>
           <Search size={18} style={{ position: 'absolute', left: '1.25rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
           <input 
              type="text" 
              placeholder="Search by ID or Agent Name..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ paddingLeft: '3rem', background: 'rgba(0,0,0,0.2)', width: '100%', borderRadius: '14px', border: '1px solid var(--glass-border)' }}
           />
        </div>
      </header>

      <div style={{ display: 'grid', gap: '1.5rem' }}>
        {filteredAgents.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '5rem', background: 'rgba(0,0,0,0.1)', borderRadius: '24px', border: '1px dashed var(--glass-border)' }}>
             <Search size={40} style={{ opacity: 0.2, marginBottom: '1rem' }} />
             <p style={{ color: 'var(--text-muted)' }}>No matches found for "<span style={{ color: 'var(--primary)', fontWeight: 800 }}>{searchQuery}</span>"</p>
          </div>
        ) : filteredAgents.map((agent) => (
          <div key={agent.id} className="glass-card" style={{ padding: '0' }}>
            <div 
              onClick={() => toggleExpand(agent.id)}
              style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                <div style={{ width: '54px', height: '54px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary), var(--secondary))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                    <User size={28} />
                </div>
                <div>
                   <h3 style={{ fontSize: '1.25rem' }}>{agent.name}</h3>
                   <div style={{ display: 'flex', gap: '1rem', marginTop: '0.25rem' }}>
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <ShieldCheck size={14} /> {agent.department}
                      </span>
                      <span style={{ fontSize: '0.85rem', fontWeight: 600, color: agent.status === 'Active' ? 'var(--success)' : 'var(--warning)' }}>
                        ⬤ {agent.status}
                      </span>
                   </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '2.5rem', alignItems: 'center', textAlign: 'right' }}>
                <div>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Resolved</p>
                  <p style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--success)' }}>{agent.resolved_count}</p>
                </div>
                <div>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Active</p>
                  <p style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--primary)' }}>
                    {agent.complaints.filter(c => c.status !== 'Resolved').length}
                  </p>
                </div>
                {expandedAgent === agent.id ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
              </div>
            </div>

            {expandedAgent === agent.id && (
              <div className="page-fade-in" style={{ padding: '0 1.5rem 1.5rem', borderTop: '1px solid var(--glass-border)' }}>
                 <div style={{ marginTop: '1.5rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                    
                    {/* Resolving Section */}
                    <div>
                        <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: 'var(--primary)' }}>
                            <Clock size={16} /> Active Grievances ({agent.complaints.filter(c => c.status !== 'Resolved').length})
                        </h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {agent.complaints.filter(c => c.status !== 'Resolved').length === 0 ? (
                                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>No active grievances assigned.</p>
                            ) : agent.complaints.filter(c => c.status !== 'Resolved').map(c => (
                                <div key={c.id} onClick={() => startUpdate(c)} className="glass-card audit-row-hover" style={{ padding: '1.25rem', background: 'rgba(255,255,255,0.02)', cursor: 'pointer', border: c.id.toLowerCase().includes(searchQuery.toLowerCase()) && searchQuery.length > 2 ? '1px solid var(--primary)' : '1px solid var(--glass-border)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                                           <span style={{ fontWeight: 800, fontSize: '0.8rem', color: 'var(--primary)' }}>{c.id}</span>
                                           <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{formatDistanceToNow(new Date(c.created_at))} ago</span>
                                        </div>
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                           {c.urgency === 'High' && <Flag size={14} color="var(--danger)" />}
                                           <span className={`badge ${c.status === 'In Progress' ? 'badge-progress' : 'badge-pending'}`} style={{ fontSize: '0.65rem' }}>{c.status}</span>
                                        </div>
                                    </div>
                                    <p style={{ fontSize: '0.85rem', lineHeight: 1.6, color: 'var(--text-main)', marginBottom: '1rem' }}>{c.description.substring(0, 100)}...</p>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '0.75rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                            <Activity size={12} color="var(--primary)" />
                                            <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>{c.category}</span>
                                        </div>
                                        <p style={{ fontSize: '0.7rem', color: 'var(--primary)', fontWeight: 800 }}>RESPOND</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Resolved Section */}
                    <div>
                        <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: 'var(--success)' }}>
                            <CheckCircle size={16} /> Resolution History ({agent.complaints.filter(c => c.status === 'Resolved').length})
                        </h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {agent.complaints.filter(c => c.status === 'Resolved').length === 0 ? (
                                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>No resolved grievances found.</p>
                            ) : agent.complaints.filter(c => c.status === 'Resolved').map(c => (
                                <div key={c.id} onClick={() => onComplaintClick(c)} className="glass-card audit-row-hover" style={{ padding: '1rem', background: 'rgba(74, 222, 128, 0.03)', cursor: 'pointer', border: '1px solid rgba(74, 222, 128, 0.1)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                        <span style={{ fontWeight: 800, fontSize: '0.8rem', color: 'var(--success)' }}>{c.id}</span>
                                        <span className="badge badge-resolved" style={{ fontSize: '0.65rem' }}>Resolved</span>
                                    </div>
                                    <p style={{ fontSize: '0.85rem', lineHeight: 1.5, opacity: 0.8 }}>{c.description.substring(0, 80)}...</p>
                                </div>
                            ))}
                        </div>
                    </div>

                 </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {updating && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }} onClick={() => setUpdating(null)}>
          <div className="glass-card page-fade-in" style={{ width: '100%', maxWidth: '700px', background: 'var(--background)', border: '1px solid var(--primary)', padding: '3rem' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                <AlertCircle size={24} color="var(--primary)" />
                <h2 style={{ fontWeight: 800 }}>Agent Response Console</h2>
            </div>
            <p style={{ color: 'var(--text-muted)', marginBottom: '2.5rem' }}>Syncing updates for ticket: <span style={{ color: 'var(--primary)', fontWeight: 800 }}>{updating.id}</span></p>
            
            <div style={{ marginBottom: '2.5rem' }}>
                <label className="input-label">Detailed Grievance</label>
                <div style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.03)', borderRadius: '16px', border: '1px solid var(--glass-border)', lineHeight: 1.7 }}>
                    {updating.description}
                </div>
            </div>

            <div style={{ marginBottom: '2.5rem' }}>
              <label className="input-label">Action Status (Acknowledge & Update)</label>
              <StatusChips 
                currentStatus={updateForm.status} 
                onChange={(status) => setUpdateForm({ ...updateForm, status })} 
              />
            </div>

            <div style={{ marginBottom: '2.5rem' }}>
              <label className="input-label">Resolution Remark / Field Notes</label>
              <textarea 
                rows={4} 
                value={updateForm.remark} 
                onChange={(e) => setUpdateForm({ ...updateForm, remark: e.target.value })} 
                placeholder="Describe action taken, resources deployed, or completion details..."
                style={{ background: 'rgba(0,0,0,0.2)' }}
              />
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
              <button className="btn btn-primary" style={{ flex: 1, height: '56px' }} onClick={() => handleUpdate(updating.id)}>Acknowledge & Sync</button>
              <button className="btn btn-outline" style={{ flex: 0.5, height: '56px' }} onClick={() => setUpdating(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Agents;
