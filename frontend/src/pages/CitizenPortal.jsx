import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../config';
import { 
    Send, 
    CheckCircle, 
    Loader2, 
    Target,
    MapPin,
    Navigation,
    Activity,
    Clock,
    Search,
    RefreshCcw,
    Mic,
    MicOff,
    Globe,
    Image as ImageIcon,
    Upload,
    X
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const CitizenPortal = () => {
    const [formData, setFormData] = useState({
        description: '',
        location: '',
        category: '',
        latitude: null,
        longitude: null
    });
    const [complaints, setComplaints] = useState([]);
    const [myComplaintIds, setMyComplaintIds] = useState([]);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [detecting, setDetecting] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [voiceLang, setVoiceLang] = useState('en-IN');
    const [isDragging, setIsDragging] = useState(false);
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [previews, setPreviews] = useState([]);
    const pollingRef = useRef(null);

    const LANGUAGES = [
        { code: 'en-IN', label: 'English (India)' },
        { code: 'en-US', label: 'English (US)' },
        { code: 'hi-IN', label: 'Hindi (हिन्दी)' },
        { code: 'kn-IN', label: 'Kannada (ಕನ್ನಡ)' },
        { code: 'ta-IN', label: 'Tamil (தமிழ்)' },
        { code: 'te-IN', label: 'Telugu (తెలుగు)' }
    ];

    // Initial Load: My Complaints from LocalStorage
    useEffect(() => {
        const stored = localStorage.getItem('my_grievances');
        if (stored) setMyComplaintIds(JSON.parse(stored));
    }, []);

    const fetchComplaints = async (isInitial = false) => {
        try {
            if (isInitial) setLoading(true);
            setIsRefreshing(true);
            const res = await axios.get(`${API_BASE_URL}/complaints`);
            // Without auth, we filter by IDs stored in localStorage
            const stored = JSON.parse(localStorage.getItem('my_grievances') || "[]");
            const filtered = res.data.filter(item => stored.includes(item.id));
            setComplaints(filtered);
            setTimeout(() => setIsRefreshing(false), 1000);
        } catch (err) {
            console.error("Failed to fetch citizen complaints", err);
        } finally {
            if (isInitial) setLoading(false);
        }
    };

    useEffect(() => {
        fetchComplaints(true);
        pollingRef.current = setInterval(() => fetchComplaints(), 5000);
        return () => clearInterval(pollingRef.current);
    }, []);

    const handleDetectLocation = () => {
        if (navigator.geolocation) {
            setDetecting(true);
            navigator.geolocation.getCurrentPosition(
                async (pos) => {
                    const lat = pos.coords.latitude;
                    const lon = pos.coords.longitude;
                    setFormData(prev => ({ ...prev, latitude: lat, longitude: lon }));
                    try {
                        const res = await axios.get(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`);
                        const address = res.data.display_name || `${lat.toFixed(4)}, ${lon.toFixed(4)}`;
                        setFormData(prev => ({ ...prev, location: address }));
                    } catch (err) {
                        setFormData(prev => ({ ...prev, location: `${lat.toFixed(4)}, ${lon.toFixed(4)}` }));
                    } finally {
                        setDetecting(false);
                    }
                },
                () => {
                    setDetecting(false);
                    alert("Location access denied.");
                }
            );
        }
    };

    const startSpeech = () => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            alert("Speech recognition not supported in this browser.");
            return;
        }
        const recognition = new SpeechRecognition();
        recognition.lang = voiceLang;
        recognition.onstart = () => setIsListening(true);
        recognition.onend = () => setIsListening(false);
        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            setFormData(prev => ({ ...prev, description: prev.description ? `${prev.description} ${transcript}` : transcript }));
        };
        recognition.start();
    };

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        processFiles(files);
    };

    const processFiles = (files) => {
        const validFiles = files.filter(file => file.type.startsWith('image/'));
        setSelectedFiles(prev => [...prev, ...validFiles]);
        const newPreviews = validFiles.map(file => URL.createObjectURL(file));
        setPreviews(prev => [...prev, ...newPreviews]);
    };

    const removeFile = (index) => {
        setSelectedFiles(prev => prev.filter((_, i) => i !== index));
        setPreviews(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const payload = new FormData();
            payload.append('description', formData.description);
            payload.append('location', formData.location);
            payload.append('source', "Citizen Hub");
            if (formData.category) payload.append('category', formData.category);
            if (formData.latitude) payload.append('latitude', formData.latitude);
            if (formData.longitude) payload.append('longitude', formData.longitude);
            
            selectedFiles.forEach(file => {
                payload.append('files', file);
            });

            const res = await axios.post(`${API_BASE_URL}/complaints`, payload, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            
            // Save ID to local storage for "Only My Complaints"
            const currentIds = JSON.parse(localStorage.getItem('my_grievances') || "[]");
            const updatedIds = [res.data.id, ...currentIds];
            localStorage.setItem('my_grievances', JSON.stringify(updatedIds));
            setMyComplaintIds(updatedIds);

            setFormData({ description: '', location: '', category: '', latitude: null, longitude: null });
            setSelectedFiles([]);
            setPreviews([]);
            fetchComplaints();
        } catch (err) {
            console.error(err);
            alert("Submission failed. Ensure images are valid formats.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="page-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem', paddingBottom: '4rem' }}>
            
            {/* Top: Filing System (Full Width) */}
            <div className="glass-card" style={{ padding: '2.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(129, 140, 248, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Navigation size={22} color="var(--primary)" />
                    </div>
                    <div>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Neural Grievance Filing</h2>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Fast-track your request directly to city agents.</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '2rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <label className="input-label">SPECIFY PROBLEM (NLP ENABLED)</label>
                        <div style={{ position: 'relative' }}>
                            <textarea 
                                required
                                placeholder="e.g., 'Street light is blinking near the central park entrance...'"
                                value={formData.description}
                                onChange={(e) => setFormData({...formData, description: e.target.value})}
                                style={{ height: '140px', resize: 'none', background: 'rgba(0,0,0,0.1)', paddingRight: '3.5rem' }}
                            />
                            <button 
                                type="button"
                                onClick={startSpeech}
                                style={{ position: 'absolute', right: '1rem', top: '1rem', background: isListening ? 'var(--danger)' : 'var(--primary)', color: 'white', border: 'none', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                                className={isListening ? "pulse-record" : ""}
                            >
                                {isListening ? <MicOff size={18} /> : <Mic size={18} />}
                            </button>
                        </div>
                        <div style={{ marginTop: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Globe size={14} color="var(--text-muted)" />
                            <select 
                                value={voiceLang}
                                onChange={(e) => setVoiceLang(e.target.value)}
                                style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: 700, fontSize: '0.8rem', padding: 0, cursor: 'pointer', width: 'auto' }}
                            >
                                {LANGUAGES.map(l => <option key={l.code} value={l.code}>{l.label}</option>)}
                            </select>
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                        <div style={{ marginBottom: '1.5rem' }}>
                            <label className="input-label">LOCATION COORDINATES</label>
                            <div style={{ position: 'relative' }}>
                                <input 
                                    required
                                    placeholder="Auto-detect or manual address..."
                                    value={formData.location}
                                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                                    style={{ paddingLeft: '3rem', paddingRight: '4rem', background: 'rgba(0,0,0,0.1)' }}
                                />
                                <MapPin size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--primary)' }} />
                                <button 
                                    type="button"
                                    onClick={handleDetectLocation}
                                    style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer' }}
                                >
                                    {detecting ? <Loader2 size={20} className="spinner" /> : <Target size={20} />}
                                </button>
                            </div>
                        </div>

                        <button type="submit" className="btn btn-primary" disabled={submitting} style={{ width: '100%', height: '56px', borderRadius: '14px', fontSize: '1.1rem' }}>
                            {submitting ? <Loader2 className="spinner" /> : <><Send size={20} /> Register & Dispatch</>}
                        </button>
                    </div>
                </form>

                {/* Evidence Dropzone */}
                <div style={{ marginTop: '2rem', display: 'grid', gridTemplateColumns: '1fr auto', gap: '2rem', alignItems: 'start' }}>
                    <div 
                        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                        onDragLeave={() => setIsDragging(false)}
                        onDrop={(e) => { e.preventDefault(); setIsDragging(false); processFiles(Array.from(e.dataTransfer.files)); }}
                        className={`glass-card ${isDragging ? 'dropzone-active' : ''}`}
                        style={{ border: '2px dashed var(--glass-border)', padding: '1.5rem', textAlign: 'center', cursor: 'pointer', background: 'rgba(0,0,0,0.05)' }}
                        onClick={() => document.getElementById('citizen-media').click()}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
                            <Upload size={20} color="var(--primary)" />
                            <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{isDragging ? 'Drop Image Now' : 'Attach Support Evidence (Drag & Drop)'}</span>
                        </div>
                        <input id="citizen-media" type="file" multiple accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} />
                    </div>

                    <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', maxWidth: '400px' }}>
                        {previews.map((url, i) => (
                            <div key={i} style={{ width: '60px', height: '60px', position: 'relative', borderRadius: '10px', overflow: 'hidden', border: '1px solid var(--glass-border)' }}>
                                <img src={url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="evidence" />
                                <button 
                                    type="button" 
                                    onClick={(e) => { e.stopPropagation(); removeFile(i); }}
                                    style={{ position: 'absolute', top: '2px', right: '2px', background: 'var(--danger)', color: 'white', border: 'none', borderRadius: '50%', width: '16px', height: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                                >
                                    <X size={10} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Bottom: My Active Tracker */}
            <div className="glass-card" style={{ padding: '2.5rem', background: 'rgba(129, 140, 248, 0.03)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <Clock size={20} color="var(--primary)" />
                        <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>My Grievance Tracking Hub</h3>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Auto-Syncing</span>
                        <RefreshCcw size={16} className={isRefreshing ? 'spinner' : ''} style={{ color: 'var(--text-muted)' }} />
                    </div>
                </div>

                {loading ? (
                    <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>Syncing with Data Lake...</div>
                ) : complaints.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '4rem 2rem', color: 'var(--text-muted)', background: 'rgba(0,0,0,0.05)', borderRadius: '20px', border: '1px dashed var(--glass-border)' }}>
                        <Search size={40} style={{ opacity: 0.2, marginBottom: '1rem' }} />
                        <p style={{ fontSize: '1.1rem' }}>No active grievances submitted in this session.</p>
                        <p style={{ fontSize: '0.85rem', marginTop: '0.5rem' }}>Log a new issue above to track its status in real-time.</p>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
                        {complaints.map(item => (
                            <div key={item.id} className="glass-card active-tracking-card" style={{ padding: '1.5rem', border: '1px solid var(--glass-border)', transition: 'all 0.3s' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                                        <span style={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--primary)' }}>#{item.id}</span>
                                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{formatDistanceToNow(new Date(item.created_at))} ago</span>
                                    </div>
                                    <div className={`badge ${
                                        item.status === 'Resolved' ? 'badge-resolved' : 
                                        item.status === 'In Progress' || item.status === 'Under Review' ? 'badge-progress' : 
                                        'badge-pending'
                                    }`} style={{ fontSize: '0.75rem', padding: '0.4rem 0.8rem' }}>
                                        {item.status}
                                    </div>
                                </div>
                                <p style={{ fontSize: '0.95rem', fontWeight: 500, marginBottom: '1.5rem', height: '48px', overflow: 'hidden' }}>
                                    {item.description}
                                </p>
                                <div style={{ paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <Activity size={14} color="var(--primary)" />
                                        <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>{item.category}</span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)' }}>
                                        <MapPin size={12} />
                                        <span style={{ fontSize: '0.75rem' }}>Verified GPS</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default CitizenPortal;
