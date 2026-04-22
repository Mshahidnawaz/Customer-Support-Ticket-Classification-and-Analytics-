import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../config';
import { 
  LayoutDashboard, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  Search, 
  PlusCircle, 
  BarChart3, 
  PieChart as PieChartIcon, 
  TrendingUp,
  Activity,
  ArrowUpRight
} from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, AreaChart, Area, LineChart, Line } from 'recharts';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { format } from 'date-fns';

const COLORS = ['#818cf8', '#c084fc', '#f472b6', '#4ade80', '#fbbf24', '#f87171'];

const Dashboard = ({ setActivePage, onComplaintClick }) => {
  const [data, setData] = useState({ kpis: { total: 0, resolved: 0, pending: 0 }, charts: { by_category: [], by_priority: [], by_status: [], trends: [] } });
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isLive, setIsLive] = useState(false);
  const pollingRef = useRef(null);

  const fetchDashboard = async (isInitial = false) => {
      try {
        if (isInitial) setLoading(true);
        const [analyticsRes, complaintsRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/analytics`),
          axios.get(`${API_BASE_URL}/complaints`)
        ]);
        setData(analyticsRes.data);
        setRecent(complaintsRes.data.slice(0, 8));
        setIsLive(true);
        setTimeout(() => setIsLive(false), 1000);
      } catch (err) {
        console.error("Failed to fetch dashboard data", err);
      } finally {
        if (isInitial) setLoading(false);
      }
  };

  useEffect(() => {
    fetchDashboard(true);
    pollingRef.current = setInterval(() => fetchDashboard(), 3000);
    return () => clearInterval(pollingRef.current);
  }, []);

  if (loading) return <div className="loading">Syncing with Command Center...</div>;

  return (
    <div className="page-fade-in">
      <header style={{ marginBottom: '3.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                <Activity size={18} color="var(--primary)" className={isLive ? 'success-anim' : ''} />
                <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>System Real-time</span>
            </div>
            <h1 style={{ fontSize: '3.5rem', fontWeight: 800, lineHeight: 1.1 }}>Command Center</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '1.25rem', marginTop: '0.5rem', maxWidth: '600px' }}>
                Advanced NLP diagnostics and geographic intelligence for city management.
            </p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
            <button className="btn btn-primary" onClick={() => setActivePage('submit')}>
                <PlusCircle size={20} />
                New Grievance
            </button>
        </div>
      </header>

      <div className="stats-grid">
        <div className="glass-card" style={{ position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: '-10px', right: '-10px', opacity: 0.05 }}>
                <LayoutDashboard size={120} color="var(--primary)" />
            </div>
            <p style={{ color: 'var(--text-muted)', fontWeight: 700, fontSize: '0.9rem', marginBottom: '1rem' }}>ACTIVE GRIEVANCES</p>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
                <h2 style={{ fontSize: '3.5rem', fontWeight: 800 }}>{data.kpis.total}</h2>
                <span style={{ color: 'var(--success)', fontWeight: 700, fontSize: '0.9rem', display: 'flex', alignItems: 'center' }}>
                    <ArrowUpRight size={14} /> +{Math.round(data.kpis.total * 0.1)}%
                </span>
            </div>
        </div>

        <div className="glass-card" style={{ position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: '-10px', right: '-10px', opacity: 0.05 }}>
                <TrendingUp size={120} color="var(--primary)" />
            </div>
            <p style={{ color: 'var(--text-muted)', fontWeight: 700, fontSize: '0.9rem', marginBottom: '1rem' }}>WEEKLY GROWTH</p>
            <h2 style={{ fontSize: '3.5rem', fontWeight: 800, color: '#f472b6' }}>+28.4%</h2>
        </div>

        <div className="glass-card" style={{ position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: '-10px', right: '-10px', opacity: 0.1 }}>
                <CheckCircle2 size={120} color="var(--success)" />
            </div>
            <p style={{ color: 'var(--text-muted)', fontWeight: 700, fontSize: '0.9rem', marginBottom: '1rem' }}>RESOLUTION RATE</p>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
                <h2 style={{ fontSize: '3.5rem', fontWeight: 800, color: 'var(--success)' }}>{Math.round((data.kpis.resolved / (data.kpis.total || 1)) * 100)}%</h2>
                <span style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>({data.kpis.resolved} resolved)</span>
            </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2.5rem', marginBottom: '3rem' }}>
        <div className="glass-card" style={{ gridColumn: 'span 2' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <h3 style={{ fontSize: '1.4rem' }}>Complaint Trends (Last 7 Days)</h3>
            <TrendingUp size={20} color="var(--primary)" />
          </div>
          <div style={{ height: '350px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.charts.trends}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--glass-border)" vertical={false} />
                <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={11} axisLine={false} tickLine={false} tickFormatter={(val) => val.split('-').slice(1).join('/')} />
                <YAxis stroke="var(--text-muted)" fontSize={11} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: 'var(--panel-bg)', border: '1px solid var(--glass-border)', borderRadius: '12px', color: 'var(--text-main)' }} itemStyle={{ color: 'var(--primary)' }} />
                <Area type="monotone" dataKey="value" stroke="var(--primary)" fillOpacity={1} fill="url(#colorValue)" strokeWidth={4} dot={{ r: 4, fill: 'var(--primary)', strokeWidth: 2, stroke: 'var(--panel-bg)' }} activeDot={{ r: 6 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <h3 style={{ fontSize: '1.4rem' }}>Priority Distribution</h3>
            <PieChartIcon size={20} color="var(--primary)" />
          </div>
          <div style={{ height: '350px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.charts.by_priority}
                  innerRadius={80}
                  outerRadius={110}
                  paddingAngle={8}
                  dataKey="value"
                >
                  {data.charts.by_priority.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} cornerRadius={4} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: 'var(--panel-bg)', border: '1px solid var(--glass-border)', borderRadius: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '1rem', flexWrap: 'wrap' }}>
                {data.charts.by_priority.map((entry, index) => (
                    <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem' }}>
                        <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: COLORS[index % COLORS.length] }}></div>
                        <span style={{ color: 'var(--text-muted)' }}>{entry.name}</span>
                    </div>
                ))}
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '2.5rem', marginBottom: '3rem' }}>
        <div className="glass-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <h3 style={{ fontSize: '1.4rem' }}>Departmental Volume</h3>
            <BarChart3 size={20} color="var(--primary)" />
          </div>
          <div style={{ height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.charts.by_status}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--glass-border)" vertical={false} />
                <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={11} axisLine={false} tickLine={false} />
                <YAxis stroke="var(--text-muted)" fontSize={11} axisLine={false} tickLine={false} />
                <Tooltip cursor={{ fill: 'var(--glass-bg)' }} contentStyle={{ background: 'var(--panel-bg)', border: '1px solid var(--glass-border)', borderRadius: '12px' }} />
                <Bar dataKey="value" fill="var(--primary)" radius={[4, 4, 0, 0]} barSize={30} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="glass-card" style={{ padding: '0', overflow: 'hidden' }}>
        <div style={{ padding: '2.5rem', borderBottom: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Recent Complaints Ledger</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>Global real-time audit log of incoming citizen grievances.</p>
          </div>
          <button className="btn btn-outline" style={{ border: '1px solid var(--glass-border)', color: 'var(--text-main)' }} onClick={() => setActivePage('admin')}>
            Enter Command Archive
          </button>
        </div>
        <div style={{ padding: '0 2.5rem 2.5rem', marginTop: '1rem' }}>
          <table>
            <thead>
              <tr>
                <th>Complaint ID</th>
                <th>Category</th>
                <th>Operational Status</th>
                <th>Submission Date</th>
              </tr>
            </thead>
            <tbody>
              {recent.map((item) => (
                <tr key={item.id} style={{ cursor: 'pointer' }} onClick={() => onComplaintClick(item)} className="audit-row-hover">
                  <td style={{ fontWeight: 800, color: 'var(--primary)', letterSpacing: '0.05em' }}>{item.id}</td>
                  <td>{item.category}</td>
                  <td>
                    <span className={`badge ${item.status === 'Resolved' ? 'badge-resolved' : item.status === 'In Progress' ? 'badge-progress' : 'badge-pending'}`} style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem' }}>
                      {item.status}
                    </span>
                  </td>
                  <td style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                    {format(new Date(item.created_at), 'MMM dd, yyyy | HH:mm')}
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

export default Dashboard;
