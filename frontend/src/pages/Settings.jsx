import React, { useState } from 'react';
import { User, Mail, Lock, LogOut, Save, ShieldCheck, Bell } from 'lucide-react';

const Settings = ({ profile, setProfile }) => {
  const [saving, setSaving] = useState(false);

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
        setSaving(false);
        alert('Settings saved successfully!');
    }, 1000);
  };

  return (
    <div className="page-fade-in" style={{ maxWidth: '800px', margin: '0 auto' }}>
      <header style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>System Settings</h1>
        <p style={{ color: 'var(--text-muted)' }}>Manage your profile, account security, and system notification preferences.</p>
      </header>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        <section className="glass-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
            <User size={20} color="var(--primary)" />
            <h3>Profile & Application</h3>
          </div>
          <div className="input-group">
            <label className="input-label">Username / Display Name</label>
            <input value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} />
          </div>
          <div className="input-group">
            <label className="input-label">Application Title (Sidebar)</label>
            <input value={profile.appName} onChange={(e) => setProfile({ ...profile, appName: e.target.value })} />
          </div>
          <div className="input-group">
            <label className="input-label">Role / Designation</label>
            <input value={profile.role} onChange={(e) => setProfile({ ...profile, role: e.target.value })} />
          </div>
        </section>

        <section className="glass-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
            <Lock size={20} color="var(--secondary)" />
            <h3>Security</h3>
          </div>
          <div className="input-group">
            <label className="input-label">Change Password</label>
            <input type="password" placeholder="••••••••••••" />
          </div>
          <div className="input-group">
            <label className="input-label">Two-Factor Authentication</label>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', border: '1px solid var(--glass-border)', borderRadius: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <ShieldCheck size={18} color="var(--success)" />
                <span>Enable SMS Authentication</span>
              </div>
              <input type="checkbox" style={{ width: '40px', height: '20px' }} />
            </div>
          </div>
        </section>

        <section className="glass-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
            <Bell size={20} color="var(--warning)" />
            <h3>Notification Preferences</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {['Email alerts for critical grievances', 'New comment notifications', 'SLA breach warnings', 'System health reports'].map((label, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', justifySelf: 'space-between', justifyContent: 'space-between', padding: '0.5rem 0' }}>
                    <span style={{ fontSize: '0.9rem' }}>{label}</span>
                    <input type="checkbox" defaultChecked style={{ width: '20px', height: '20px' }} />
                </div>
            ))}
          </div>
        </section>

        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
          <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleSave}>
             {saving ? 'Saving...' : <><Save size={18} /> Save Changes</>}
          </button>
          <button className="btn btn-outline" style={{ display: 'flex', justifyContent: 'center', flex: 1, color: 'var(--danger)', borderColor: 'rgba(239, 68, 68, 0.2)' }}>
            <LogOut size={18} /> Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
