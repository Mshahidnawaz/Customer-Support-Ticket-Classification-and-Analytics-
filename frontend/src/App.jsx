import React, { useState, useEffect } from 'react';
import './App.css';
import axios from 'axios';
import { API_BASE_URL } from './config';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import ComplaintDetailModal from './components/ComplaintDetailModal';
import Dashboard from './pages/Dashboard';
import SubmitComplaint from './pages/SubmitComplaint';
import Tracking from './pages/Tracking';
import MapsView from './pages/MapsView';
import AdminPanel from './pages/AdminPanel';
import AuditLogs from './pages/AuditLogs';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';
import About from './pages/About';
import Agents from './pages/Agents';
import DataPipeline from './pages/DataPipeline';
import CitizenPortal from './pages/CitizenPortal';
import { 
    LayoutDashboard, 
    PlusCircle, 
    Search, 
    MapPin, 
    ShieldCheck, 
    History, 
    BarChart3, 
    Settings as SettingsIcon, 
    Info,
    Users,
    Sun,
    Moon,
    Bell,
    Cpu,
    User
} from 'lucide-react';

function AppContent() {
  const [profile, setProfile] = useState(() => {
    const saved = localStorage.getItem('smart-city-profile');
    return saved ? JSON.parse(saved) : { 
      name: 'Admin Guru', 
      appName: 'Smart Grievance Portal', 
      role: 'Lead Coordinator' 
    };
  });

  useEffect(() => {
    localStorage.setItem('smart-city-profile', JSON.stringify(profile));
  }, [profile]);

  const [currentRole, setCurrentRole] = useState('citizen'); // 'citizen' or 'admin'
  const [activePage, setActivePage] = useState('citizen');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const { theme, toggleTheme } = useTheme();

  const fetchNotifications = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/notifications`);
      setNotifications(res.data);
    } catch (err) {
      console.error("Notifications fetch failed", err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 5000);
    return () => clearInterval(interval);
  }, []);

  const markRead = async (id) => {
    try {
      await axios.patch(`${API_BASE_URL}/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    } catch (err) {
      console.error(err);
    }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const CITIZEN_MENU = [
    { id: 'citizen', label: 'Citizen Hub', icon: <User size={20} /> },
    { id: 'maps', label: 'Maps (Location)', icon: <MapPin size={20} /> },
    { id: 'about', label: 'About', icon: <Info size={20} /> },
  ];

  const ADMIN_MENU = [
    { id: 'dashboard', label: 'Analytics Dashboard', icon: <LayoutDashboard size={20} /> },
    { id: 'maps', label: 'Geo-Spatial Maps', icon: <MapPin size={20} /> },
    { id: 'admin', label: 'Admin Panel', icon: <ShieldCheck size={20} /> },
    { id: 'agents', label: 'Agents Section', icon: <Users size={20} /> },
    { id: 'audit', label: 'Audit Logs', icon: <History size={20} /> },
    { id: 'pipeline', label: 'Data Pipeline', icon: <Cpu size={20} /> },
    { id: 'analytics', label: 'Advanced AI', icon: <BarChart3 size={20} /> },
    { id: 'settings', label: 'System Settings', icon: <SettingsIcon size={20} /> },
  ];

  const currentMenu = currentRole === 'admin' ? ADMIN_MENU : CITIZEN_MENU;

  const handleComplaintClick = (complaint) => {
    setSelectedComplaint(complaint);
  };

  const renderPage = () => {
    // Role-based protection: Redirect to citizen hub if accessing admin page in citizen mode
    if (currentRole === 'citizen' && !['citizen', 'maps', 'about', 'submit', 'track'].includes(activePage)) {
        return <CitizenPortal />;
    }

    switch (activePage) {
      case 'dashboard': return <Dashboard setActivePage={setActivePage} onComplaintClick={handleComplaintClick} />;
      case 'citizen': return <CitizenPortal />;
      case 'submit': return <SubmitComplaint setActivePage={setActivePage} />;
      case 'track': return <Tracking onComplaintClick={handleComplaintClick} />;
      case 'maps': return <MapsView onComplaintClick={handleComplaintClick} />;
      case 'admin': return <AdminPanel onComplaintClick={handleComplaintClick} />;
      case 'agents': return <Agents onComplaintClick={handleComplaintClick} />;
      case 'audit': return <AuditLogs onComplaintClick={handleComplaintClick} />;
      case 'pipeline': return <DataPipeline />;
      case 'analytics': return <Analytics />;
      case 'settings': return <Settings profile={profile} setProfile={setProfile} />;
      case 'about': return <About />;
      default: return currentRole === 'admin' ? <Dashboard setActivePage={setActivePage} onComplaintClick={handleComplaintClick} /> : <CitizenPortal />;
    }
  };

  const toggleRole = () => {
    const nextRole = currentRole === 'admin' ? 'citizen' : 'admin';
    setCurrentRole(nextRole);
    setActivePage(nextRole === 'admin' ? 'dashboard' : 'citizen');
  };

  return (
    <div className="app-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2.5rem', padding: '0 0.5rem' }}>
          <div style={{ width: '42px', height: '42px', background: 'linear-gradient(135deg, var(--primary), var(--secondary))', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px var(--primary-glow)' }}>
             <ShieldCheck color="white" size={26} />
          </div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, letterSpacing: '-0.025em' }}>{profile.appName}</h2>
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
          {currentMenu.map((item) => (
            <a 
              key={item.id} 
              href={`#${item.id}`} 
              className={`nav-link ${activePage === item.id ? 'active' : ''}`}
              onClick={(e) => {
                e.preventDefault();
                setActivePage(item.id);
              }}
            >
              {item.icon}
              <span>{item.label}</span>
            </a>
          ))}
        </nav>

        <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <button 
                onClick={toggleRole}
                className="btn btn-outline"
                style={{ width: '100%', borderColor: 'var(--primary)', color: 'var(--primary)', background: 'rgba(129, 140, 248, 0.05)', height: '48px', fontSize: '0.85rem' }}
            >
                {currentRole === 'admin' ? <><User size={16} /> Public Hub</> : <><ShieldCheck size={16} /> Admin Command</>}
            </button>
            <div style={{ padding: '1rem', background: 'var(--glass-bg)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--success)' }}></div>
                    <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{currentRole === 'admin' ? 'Strategic Mode' : 'Public Access'}</span>
                </div>
                <button 
                    onClick={toggleTheme} 
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-main)', padding: '0.5rem', borderRadius: '8px', transition: 'var(--transition)' }}
                    className="theme-toggle"
                >
                    {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                </button>
            </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="main-content">
        <header style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '2rem', gap: '1.5rem', alignItems: 'center', position: 'relative' }}>
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', padding: '0.5rem', borderRadius: '10px', color: 'var(--text-muted)', position: 'relative' }}
            >
                <Bell size={20} className={unreadCount > 0 ? "success-anim" : ""} />
                {unreadCount > 0 && (
                  <span style={{ position: 'absolute', top: '-5px', right: '-5px', background: 'var(--danger)', color: 'white', fontSize: '0.65rem', padding: '0.1rem 0.4rem', borderRadius: '10px', fontWeight: 800 }}>
                    {unreadCount}
                  </span>
                )}
            </button>

            {/* Notification Panel */}
            {showNotifications && (
              <div className="glass-card custom-scrollbar" style={{ position: 'absolute', top: '100%', right: '0', width: '380px', maxHeight: '500px', overflowY: 'auto', zIndex: 1000, marginTop: '0.5rem', padding: '1.5rem', boxShadow: '0 20px 40px rgba(0,0,0,0.4)', borderColor: 'var(--primary)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                  <h3 style={{ fontSize: '1.1rem' }}>Notifications</h3>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{unreadCount} Unread</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {notifications.length === 0 ? (
                    <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>No system alerts currently.</p>
                  ) : (
                    notifications.map(n => (
                      <div 
                        key={n.id} 
                        onClick={() => markRead(n.id)}
                        style={{ padding: '1rem', borderRadius: '12px', background: n.is_read ? 'rgba(255,255,255,0.02)' : 'rgba(129, 140, 248, 0.08)', borderLeft: n.is_read ? 'none' : '4px solid var(--primary)', cursor: 'pointer', transition: 'var(--transition)' }}
                      >
                        <p style={{ fontSize: '0.9rem', color: n.is_read ? 'var(--text-muted)' : 'var(--text-main)', marginBottom: '0.5rem' }}>{n.message}</p>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{new Date(n.timestamp).toLocaleString()}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ textAlign: 'right' }}>
                    <p style={{ fontSize: '0.95rem', fontWeight: 700 }}>{currentRole === 'admin' ? profile.name : 'Public Citizen'}</p>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{currentRole === 'admin' ? profile.role : 'Verified User'}</p>
                </div>
                <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: currentRole === 'admin' ? 'var(--primary)' : 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 800 }}>
                    {currentRole === 'admin' ? 'AG' : 'PC'}
                </div>
            </div>
        </header>

        {renderPage()}
      </main>

      {/* Global Modal */}
      <ComplaintDetailModal 
        complaint={selectedComplaint} 
        onClose={() => setSelectedComplaint(null)} 
      />
    </div>
  );
}

function App() {
    return (
        <ThemeProvider>
            <AppContent />
        </ThemeProvider>
    );
}

export default App;
