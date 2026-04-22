import React from 'react';
import { Info, Sparkles, Shield, Users, BarChart3, Globe } from 'lucide-react';

const About = () => {
  return (
    <div className="page-fade-in" style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <header style={{ marginBottom: '3rem', textAlign: 'center' }}>
        <h1 style={{ fontSize: '3rem', marginBottom: '1rem', background: 'linear-gradient(135deg, var(--primary), var(--accent))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Municipality Grievance Analytics
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.25rem' }}>Empowering citizens and authorities through AI-driven transparency.</p>
      </header>

      <div className="glass-card" style={{ marginBottom: '3rem', padding: '3rem' }}>
        <h2 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Sparkles size={24} color="var(--primary)" /> Our Vision
        </h2>
        <p style={{ lineHeight: 1.8, fontSize: '1.1rem', color: 'var(--text-muted)' }}>
          The NLP-Powered Citizen Grievance Analytics System is built to transform how municipal corporations interact with citizens. By leveraging cutting-edge Natural Language Processing (NLP) and Machine Learning, we bridge the gap between reported issues and resolving authorities. Our system automatically classifies, prioritizes, and routes complaints, ensuring that critical infrastructure and public health issues never go unnoticed.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', marginBottom: '3rem' }}>
        <div className="glass-card">
          <div style={{ background: 'rgba(99,102,241,0.1)', padding: '1rem', borderRadius: '12px', width: 'fit-content', marginBottom: '1.5rem' }}>
            <Users size={24} color="var(--primary)" />
          </div>
          <h3>Citizen For Empowerment</h3>
          <p style={{ color: 'var(--text-muted)', marginTop: '1rem' }}>Submit and track grievances with ease. No more bureaucratic maze. Get real-time updates and know exactly who is handling your request.</p>
        </div>
        <div className="glass-card">
          <div style={{ background: 'rgba(168,85,247,0.1)', padding: '1rem', borderRadius: '12px', width: 'fit-content', marginBottom: '1.5rem' }}>
            <BarChart3 size={24} color="var(--secondary)" />
          </div>
          <h3>Data-Driven Governance</h3>
          <p style={{ color: 'var(--text-muted)', marginTop: '1rem' }}>Authorities can visualize city-wide trends, hotspots, and department performance using our analytics dashboard to optimize resources.</p>
        </div>
        <div className="glass-card">
          <div style={{ background: 'rgba(236,72,153,0.1)', padding: '1rem', borderRadius: '12px', width: 'fit-content', marginBottom: '1.5rem' }}>
            <Shield size={24} color="var(--accent)" />
          </div>
          <h3>Full Accountability</h3>
          <p style={{ color: 'var(--text-muted)', marginTop: '1rem' }}>Audit logs ensure that every action taken—from submission to final resolution—is recorded and available for review.</p>
        </div>
      </div>

      <div className="glass-card" style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.05), rgba(168,85,247,0.05))' }}>
        <h3 style={{ marginBottom: '1.5rem', textAlign: 'center' }}>Technological Core</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
          <div>
            <h4 style={{ color: 'var(--primary)', marginBottom: '0.5rem' }}>Advanced NLP</h4>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Keyword extraction, sentiment analysis, and pattern matching for automated categorization and routing.</p>
          </div>
          <div>
             <h4 style={{ color: 'var(--secondary)', marginBottom: '0.5rem' }}>Real-time GIS</h4>
             <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Location intelligence to visualize grievance density across various geographical zones of the city.</p>
          </div>
          <div>
             <h4 style={{ color: 'var(--accent)', marginBottom: '0.5rem' }}>SLA Enforcement</h4>
             <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Automated priority queuing and notification systems based on the urgency detected by the AI pipeline.</p>
          </div>
          <div>
             <h4 style={{ color: 'var(--success)', marginBottom: '0.5rem' }}>Agile Backend</h4>
             <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>High-performance FastAPI foundation with robust security and audit logging layers.</p>
          </div>
        </div>
      </div>

      <footer style={{ marginTop: '4rem', padding: '2rem', textAlign: 'center', borderTop: '1px solid var(--glass-border)' }}>
        <p style={{ color: 'var(--text-muted)' }}>© 2026 Smart City Municipal Corporation. Dedicated to a frictionless city experience.</p>
      </footer>
    </div>
  );
};

export default About;
