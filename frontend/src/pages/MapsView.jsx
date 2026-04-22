import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, LayersControl, useMap } from 'react-leaflet';
import axios from 'axios';
import { API_BASE_URL } from '../config';
import L from 'leaflet';
import { Filter, Search, Info, Crosshair, Box, Layers, Zap } from 'lucide-react';

// Fix for default marker icons
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
let DefaultIcon = L.icon({ 
    iconUrl: markerIcon, 
    shadowUrl: markerShadow, 
    iconSize: [25, 41], 
    iconAnchor: [12, 41],
    popupAnchor: [1, -34]
});
L.Marker.prototype.options.icon = DefaultIcon;

const { BaseLayer } = LayersControl;

// Internal component to handle map centering and geolocation
const MapController = ({ userLocation, centerOnUser }) => {
    const map = useMap();
    useEffect(() => {
        if (centerOnUser && userLocation) {
            map.flyTo(userLocation, 16, { animate: true, duration: 1.5 });
        }
    }, [centerOnUser, userLocation, map]);
    return null;
};

const MapsView = ({ onComplaintClick }) => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [is3D, setIs3D] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [centerOnUser, setCenterOnUser] = useState(false);
  const pollingRef = useRef(null);

  const fetchComplaints = async (isInitial = false) => {
    try {
      if (isInitial) setLoading(true);
      const res = await axios.get(`${API_BASE_URL}/complaints`);
      setComplaints(res.data);
    } catch (err) {
      console.error("Failed to fetch map data", err);
    } finally {
      if (isInitial) setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints(true);
    pollingRef.current = setInterval(() => fetchComplaints(), 3000);
    
    // Get user location
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (pos) => setUserLocation([pos.coords.latitude, pos.coords.longitude]),
            (err) => console.warn("Geolocation failed", err)
        );
    }

    return () => clearInterval(pollingRef.current);
  }, []);

  const handleLocateMe = () => {
      setCenterOnUser(true);
      setTimeout(() => setCenterOnUser(false), 2000);
  };

  const filtered = complaints.filter(c => 
    c.latitude && c.longitude && 
    (c.id.toLowerCase().includes(filter.toLowerCase()) || c.category.toLowerCase().includes(filter.toLowerCase()))
  );

  if (loading) return <div className="loading">Initializing Geographic Engine...</div>;

  return (
    <div className="page-fade-in">
      <header style={{ marginBottom: '3rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
            <h1 style={{ fontSize: '3rem', fontWeight: 800 }}>Geographic Intelligence</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '1.25rem', marginTop: '0.5rem' }}>
                Multi-layer visualization of city status with real-time telemetry.
            </p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
            <div style={{ position: 'relative', width: '320px' }}>
                <input 
                    placeholder="Filter by ID, category..." 
                    value={filter} 
                    onChange={(e) => setFilter(e.target.value)}
                    style={{ paddingLeft: '3.5rem', height: '56px', borderRadius: '14px' }}
                />
                <Search size={22} style={{ position: 'absolute', left: '1.25rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            </div>
            <button className={`btn ${is3D ? 'btn-primary' : ''}`} style={{ width: '56px', height: '56px', padding: 0, borderRadius: '14px', border: '1px solid var(--glass-border)', background: is3D ? 'var(--primary)' : 'var(--glass-bg)' }} onClick={() => setIs3D(!is3D)}>
                <Box size={24} />
            </button>
            <button className="btn" style={{ width: '56px', height: '56px', padding: 0, borderRadius: '14px', border: '1px solid var(--glass-border)', background: 'var(--glass-bg)' }} onClick={handleLocateMe}>
                <Crosshair size={24} />
            </button>
        </div>
      </header>

      <div className={`map-container ${is3D ? 'map-tilt' : ''}`} style={{ boxShadow: is3D ? '0 50px 100px rgba(0,0,0,0.5)' : 'none' }}>
        <MapContainer center={[12.9716, 77.5946]} zoom={12} scrollWheelZoom={true} style={{ height: '100%', width: '100%' }}>
          <MapController userLocation={userLocation} centerOnUser={centerOnUser} />
          
          <LayersControl position="topright">
            <BaseLayer checked name="Modern 2D (Default)">
              <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
            </BaseLayer>
            <BaseLayer name="High-Res Satellite">
              <TileLayer url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}" />
            </BaseLayer>
            <BaseLayer name="Terrain Visualization">
              <TileLayer url="https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png" />
            </BaseLayer>
            <BaseLayer name="Hybrid (Enhanced Labels)">
              <TileLayer 
                url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}" 
              />
              <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_only_labels/{z}/{x}/{y}{r}.png" />
            </BaseLayer>
          </LayersControl>

          {userLocation && (
            <Marker position={userLocation} icon={L.divIcon({ className: 'current-loc-marker', html: '<div style="width: 20px; height: 20px; background: #818cf8; border: 3px solid white; border-radius: 50%; box-shadow: 0 0 15px #818cf8;"></div>' })}>
                <Popup>Your current location</Popup>
            </Marker>
          )}

          {filtered.map((c) => (
            <Marker key={c.id} position={[c.latitude, c.longitude]}>
              <Popup>
                <div style={{ color: 'var(--text-main)', padding: '0.5rem', width: '280px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                    <span style={{ fontWeight: 800, color: 'var(--primary)', fontSize: '1rem' }}>{c.id}</span>
                    <span className={`badge ${c.status === 'Resolved' ? 'badge-resolved' : c.status === 'In Progress' ? 'badge-progress' : 'badge-pending'}`} style={{ fontSize: '0.65rem' }}>
                      {c.status}
                    </span>
                  </div>
                  <div style={{ marginBottom: '1rem' }}>
                    <p style={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--text-main)', marginBottom: '0.25rem' }}>{c.category}</p>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>{c.description.substring(0, 70)}...</p>
                  </div>
                  <div style={{ padding: '0.75rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px solid var(--glass-border)', marginBottom: '1.25rem' }}>
                    <p style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Target Location</p>
                    <p style={{ fontSize: '0.85rem', fontWeight: 600 }}>{c.location}</p>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>City: Bangalore, Karnataka 560001</p>
                  </div>
                  <div style={{ display: 'flex' }}>
                     <button 
                        className="btn btn-primary" 
                        style={{ padding: '0.6rem', fontSize: '0.85rem', flex: 1, borderRadius: '8px' }}
                        onClick={() => onComplaintClick(c)}
                     >
                        Analyze Details
                     </button>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      <div style={{ marginTop: '2.5rem', display: 'flex', gap: '3rem', padding: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Zap size={18} color="var(--danger)" />
          <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-muted)' }}>CRITICAL / PENDING</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Zap size={18} color="var(--warning)" />
          <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-muted)' }}>ACTION REQUIRED</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Zap size={18} color="var(--success)" />
          <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-muted)' }}>RESOLVED</span>
        </div>
      </div>
    </div>
  );
};

export default MapsView;
