import React from 'react';
import { X, Calendar, MapPin, User, ShieldCheck, Clock, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';

const ComplaintDetailModal = ({ complaint, onClose }) => {
  if (!complaint) return null;

  const getStatusClass = (status) => {
    switch(status) {
      case 'Pending': return 'badge-pending';
      case 'In Progress': return 'badge-progress';
      case 'Under Review': return 'badge-review';
      case 'Escalated': return 'badge-escalated';
      case 'Resolved': return 'badge-resolved';
      default: return '';
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content glass-card page-fade-in custom-scrollbar" onClick={e => e.stopPropagation()}>
        <button 
          onClick={onClose} 
          style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'rgba(255,255,255,0.05)', border: 'none', borderRadius: '50%', width: '36px', height: '36px', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'var(--transition)', zIndex: 10 }}
          className="hover-scale"
        >
          <X size={20} />
        </button>

        <header style={{ marginBottom: '2.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
            <span className={`badge ${getStatusClass(complaint.status)}`} style={{ padding: '0.4rem 1rem', fontSize: '0.7rem' }}>{complaint.status}</span>
            <span style={{ fontWeight: 800, color: 'var(--primary)', letterSpacing: '0.05em' }}>{complaint.id}</span>
          </div>
          <h2 style={{ fontSize: '2.2rem', fontWeight: 800 }}>Grievance Dossier</h2>
        </header>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '3rem', marginBottom: '3rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(129, 140, 248, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Calendar size={20} color="var(--primary)" />
                </div>
                <div>
                    <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Submission</p>
                    <p style={{ fontWeight: 600 }}>{format(new Date(complaint.created_at), 'PPPp')}</p>
                </div>
            </div>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(129, 140, 248, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <MapPin size={20} color="var(--primary)" />
                </div>
                <div>
                    <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Address</p>
                    <p style={{ fontWeight: 600 }}>{complaint.location}, Bangalore 560001</p>
                </div>
            </div>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(129, 140, 248, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <ShieldCheck size={20} color="var(--primary)" />
                </div>
                <div>
                    <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Classification</p>
                    <p style={{ fontWeight: 600 }}>{complaint.category}</p>
                </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(129, 140, 248, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <User size={20} color="var(--primary)" />
                </div>
                <div>
                    <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Civil Servant</p>
                    <p style={{ fontWeight: 600 }}>{complaint.agent ? complaint.agent.name : 'Awaiting Assignment'}</p>
                </div>
            </div>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(129, 140, 248, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Clock size={20} color="var(--primary)" />
                </div>
                <div>
                    <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Priority Status</p>
                    <p style={{ fontWeight: 600 }}>{complaint.urgency}</p>
                </div>
            </div>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(129, 140, 248, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <AlertCircle size={20} color="var(--primary)" />
                </div>
                <div>
                    <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>NLP Sentiment</p>
                    <p style={{ fontWeight: 600 }}>{complaint.sentiment}</p>
                </div>
            </div>
          </div>
        </div>

        <div style={{ marginBottom: '2.5rem' }}>
          <p className="input-label">Detailed Grievance Narrative</p>
          <div style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--glass-border)', borderRadius: '16px', lineHeight: 1.8, fontSize: '1.05rem', color: 'var(--text-main)' }}>
            {complaint.description}
          </div>
        </div>

        {complaint.remark && (
          <div style={{ marginBottom: '2.5rem' }}>
            <p className="input-label">Municipal Action & Resolution Remarks</p>
            <div style={{ padding: '1.5rem', background: 'rgba(74, 222, 128, 0.05)', borderLeft: '5px solid var(--success)', borderRadius: '16px', lineHeight: 1.8, fontSize: '1.05rem', color: 'var(--text-main)' }}>
              {complaint.remark}
            </div>
          </div>
        )}

        {complaint.images && complaint.images.length > 0 && (
          <div style={{ marginBottom: '2.5rem' }}>
            <p className="input-label">Visual Evidence Log</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
              {complaint.images.map((img, i) => (
                <div key={i} style={{ height: '180px', borderRadius: '16px', overflow: 'hidden', border: '1px solid var(--glass-border)', background: 'var(--glass-bg)' }} className="hover-scale">
                  <img src={`http://localhost:8000/api/uploads/${img}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Evidence" />
                </div>
              ))}
            </div>
          </div>
        )}

        <div style={{ marginTop: '2.5rem', display: 'flex', gap: '1rem' }}>
          <button className="btn btn-primary" style={{ flex: 1 }} onClick={onClose}>Acknowledge & Close</button>
        </div>
      </div>
    </div>
  );
};

export default ComplaintDetailModal;
