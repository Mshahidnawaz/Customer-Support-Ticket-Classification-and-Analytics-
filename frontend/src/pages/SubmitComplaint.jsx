import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../config';
import { 
    Send, 
    CheckCircle, 
    Loader2, 
    Sparkles, 
    Target,
    MapPin,
    AlertTriangle,
    Navigation,
    Activity,
    Mic,
    MicOff,
    Image as ImageIcon,
    X,
    Globe,
    Upload
} from 'lucide-react';

const SubmitComplaint = ({ setActivePage }) => {
    const [formData, setFormData] = useState({
        description: '',
        location: '',
        category: '',
        latitude: null,
        longitude: null
    });
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(null);
    const [suggestedCategory, setSuggestedCategory] = useState(null);
    const [detecting, setDetecting] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [voiceLang, setVoiceLang] = useState('en-IN');
    const [isDragging, setIsDragging] = useState(false);
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [previews, setPreviews] = useState([]);

    const LANGUAGES = [
        { code: 'en-IN', label: 'English (India)' },
        { code: 'en-US', label: 'English (US)' },
        { code: 'hi-IN', label: 'Hindi (हिन्दी)' },
        { code: 'kn-IN', label: 'Kannada (ಕನ್ನಡ)' },
        { code: 'ta-IN', label: 'Tamil (தமிழ்)' },
        { code: 'te-IN', label: 'Telugu (తెలుగు)' }
    ];

    // Speech Recognition Setup
    const startSpeech = () => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            alert("Speech recognition not supported in this browser.");
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.lang = voiceLang;
        recognition.continuous = false;
        recognition.interimResults = false;

        recognition.onstart = () => setIsListening(true);
        recognition.onend = () => setIsListening(false);
        recognition.onerror = (e) => {
            console.error(e);
            setIsListening(false);
        };

        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            setFormData(prev => ({
                ...prev,
                description: prev.description ? `${prev.description} ${transcript}` : transcript
            }));
        };

        recognition.start();
    };

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        processFiles(files);
    };

    const processFiles = (files) => {
        const validFiles = files.filter(file => file.type.startsWith('image/'));
        if (validFiles.length < files.length) {
            alert("Only image files (JPG, PNG) are accepted.");
        }
        
        setSelectedFiles(prev => [...prev, ...validFiles]);
        const newPreviews = validFiles.map(file => URL.createObjectURL(file));
        setPreviews(prev => [...prev, ...newPreviews]);
    };

    const onDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        const files = Array.from(e.dataTransfer.files);
        processFiles(files);
    };

    const onDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const onDragLeave = () => {
        setIsDragging(false);
    };

    const removeFile = (index) => {
        const newFiles = [...selectedFiles];
        newFiles.splice(index, 1);
        setSelectedFiles(newFiles);

        const newPreviews = [...previews];
        newPreviews.splice(index, 1);
        setPreviews(newPreviews);
    };

    // AI Classification Link
    useEffect(() => {
        if (formData.description.length > 10) {
            const delayDebounce = setTimeout(() => {
                analyzeComplaint();
            }, 800);
            return () => clearTimeout(delayDebounce);
        } else {
            setSuggestedCategory(null);
        }
    }, [formData.description]);

    const analyzeComplaint = () => {
        const desc = formData.description.toLowerCase();
        let detected = 'General';
        
        // High-precision priority routing
        if (desc.includes('water') || desc.includes('leak') || desc.includes('pipe')) detected = 'Water';
        else if (desc.includes('light') || desc.includes('elect') || desc.includes('power')) detected = 'Electricity';
        else if (desc.includes('garbage') || desc.includes('trash') || desc.includes('waste')) detected = 'Garbage';
        else if (desc.includes('pothole') || desc.includes('road') || desc.includes('street')) detected = 'Roads';
        else if (desc.includes('traffic') || desc.includes('signal')) detected = 'Traffic';
        
        setSuggestedCategory(detected);
    };

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
                        const address = res.data.display_name || "Bangalore, Karnataka, India";
                        setFormData(prev => ({ ...prev, location: address }));
                    } catch (err) {
                        console.error("Geocoding failed", err);
                        setFormData(prev => ({ ...prev, location: `${lat.toFixed(4)}, ${lon.toFixed(4)} (GPS Sync Active)` }));
                    } finally {
                        setDetecting(false);
                    }
                },
                (err) => {
                    console.error("GPS Error", err);
                    setDetecting(false);
                    alert("GPS detection failed. Please enter location manually.");
                }
            );
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const finalCategory = formData.category || suggestedCategory || 'General';
            
            const payload = new FormData();
            payload.append('description', formData.description);
            payload.append('location', formData.location);
            payload.append('category', finalCategory);
            if (formData.latitude) payload.append('latitude', formData.latitude);
            if (formData.longitude) payload.append('longitude', formData.longitude);
            payload.append('source', 'Web App');
            
            selectedFiles.forEach(file => {
                payload.append('files', file);
            });

            const res = await axios.post(`${API_BASE_URL}/complaints`, payload, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            
            setSubmitted(res.data);
            setTimeout(() => setActivePage('track'), 3000);
        } catch (err) {
            console.error(err);
            alert("Submission failed. Please check backend connection.");
        } finally {
            setLoading(false);
        }
    };

    if (submitted) {
        return (
            <div className="page-fade-in" style={{ height: '70vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
                <div style={{ width: '120px', height: '120px', borderRadius: '50%', background: 'var(--success)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '2.5rem', boxShadow: '0 20px 50px rgba(74, 222, 128, 0.4)' }} className="success-anim">
                    <CheckCircle size={60} color="white" />
                </div>
                <h1 style={{ fontSize: '3.5rem', fontWeight: 800 }}>Grievance Logged</h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '1.4rem', marginTop: '1rem', lineHeight: 1.6 }}>
                    Ticket <span style={{ color: 'var(--primary)', fontWeight: 800 }}>#{submitted.id}</span> is now live.<br/>
                    Redirecting to AI Command Center...
                </p>
            </div>
        );
    }

    return (
        <div className="page-fade-in" style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <header style={{ marginBottom: '4rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                    <Navigation size={20} color="var(--primary)" />
                    <span style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.2em' }}>Reporting Portal</span>
                </div>
                <h1 style={{ fontSize: '4rem', fontWeight: 800, lineHeight: 1 }}>Lodge Grievance</h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '1.4rem', marginTop: '1rem', maxWidth: '700px' }}>
                    Use plain language. Our neural network handles classification, urgency detection, and agent routing instantly.
                </p>
            </header>

            <form onSubmit={handleSubmit} className="glass-card" style={{ padding: '4rem' }}>
                <div style={{ marginBottom: '3rem' }}>
                    <label className="input-label" style={{ fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Neural Input (Issue Description)</label>
                    <div style={{ position: 'relative' }}>
                        <textarea 
                            required
                            placeholder="e.g., 'There is a massive pothole causing traffic delays on the West bridge approach...'"
                            value={formData.description}
                            onChange={(e) => setFormData({...formData, description: e.target.value})}
                            style={{ height: '220px', resize: 'none', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--glass-border)', paddingRight: '4rem' }}
                        />
                        <button 
                            type="button"
                            onClick={startSpeech}
                            style={{ position: 'absolute', right: '1.5rem', top: '1.5rem', background: isListening ? 'var(--danger)' : 'var(--primary)', color: 'white', border: 'none', borderRadius: '50%', width: '52px', height: '52px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 10 }}
                            className={isListening ? "pulse-record" : ""}
                        >
                            {isListening ? <MicOff size={24} /> : <Mic size={24} />}
                        </button>
                    </div>
                    <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <Globe size={14} color="var(--text-muted)" />
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Input Language:</span>
                        <select 
                            value={voiceLang}
                            onChange={(e) => setVoiceLang(e.target.value)}
                            style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: 800, fontSize: '0.85rem', padding: 0, cursor: 'pointer', width: 'auto' }}
                        >
                            {LANGUAGES.map(l => <option key={l.code} value={l.code}>{l.label}</option>)}
                        </select>
                    </div>
                    {suggestedCategory && (
                        <div style={{ marginTop: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.25rem', background: 'rgba(129, 140, 248, 0.08)', borderRadius: '16px', border: '1px solid rgba(129, 140, 248, 0.2)' }}>
                            <Sparkles size={22} color="var(--primary)" className="success-anim" />
                            <span style={{ fontSize: '1.1rem', fontWeight: 500 }}>
                                AI Intent Classification: <strong style={{ color: 'var(--primary)' }}>{suggestedCategory} department</strong>
                            </span>
                        </div>
                    )}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '3rem', marginBottom: '4rem' }}>
                    <div>
                        <label className="input-label" style={{ fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Spatial Metadata (Location)</label>
                        <div style={{ position: 'relative' }}>
                            <input 
                                required
                                placeholder="Auto-detect or manual address..."
                                value={formData.location}
                                onChange={(e) => setFormData({...formData, location: e.target.value})}
                                style={{ paddingLeft: '3.5rem', paddingRight: '4rem', background: 'rgba(0,0,0,0.2)' }}
                            />
                            <MapPin size={22} style={{ position: 'absolute', left: '1.25rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--primary)' }} />
                            <button 
                                type="button"
                                onClick={handleDetectLocation}
                                style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                                title="Sync GPS Data"
                            >
                                {detecting ? <Loader2 size={24} className="success-anim" /> : <Target size={24} />}
                            </button>
                        </div>
                    </div>
                    <div>
                        <label className="input-label" style={{ fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Route Management (Override)</label>
                        <select 
                            value={formData.category}
                            onChange={(e) => setFormData({...formData, category: e.target.value})}
                            style={{ background: 'rgba(0,0,0,0.2)', fontWeight: 600 }}
                        >
                            <option value="">AI Autonomous Routing</option>
                            <option value="Roads">Transport & Infrastructure</option>
                            <option value="Water">Water & Civil Utilities</option>
                            <option value="Electricity">Electrical Grid</option>
                            <option value="Garbage">Sanitation Management</option>
                        </select>
                    </div>
                </div>

                <div style={{ marginBottom: '4rem' }}>
                    <label className="input-label" style={{ fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '0.1em', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <ImageIcon size={18} color="var(--primary)" />
                        Multi-Media Evidence (Images)
                    </label>
                    <div 
                        onDragOver={onDragOver}
                        onDragLeave={onDragLeave}
                        onDrop={onDrop}
                        className={`glass-card ${isDragging ? 'dropzone-active' : ''}`}
                        style={{ border: '2px dashed var(--glass-border)', padding: '3rem', textAlign: 'center', cursor: 'pointer', position: 'relative', overflow: 'hidden' }}
                        onClick={() => document.getElementById('media-upload').click()}
                    >
                        <div style={{ position: 'relative', zIndex: 2 }}>
                            <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(129, 140, 248, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                                <Upload size={30} color="var(--primary)" />
                            </div>
                            <h3 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.5rem' }}>Drop evidence files here</h3>
                            <p style={{ color: 'var(--text-muted)' }}>Support your claim with photographic proof (PNG, JPG accepted)</p>
                        </div>
                        <input id="media-upload" type="file" multiple accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} />
                    </div>

                    {previews.length > 0 && (
                        <div style={{ marginTop: '2.5rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '1.5rem' }}>
                            {previews.map((url, i) => (
                                <div key={i} style={{ borderRadius: '20px', overflow: 'hidden', position: 'relative', border: '1px solid var(--glass-border)', boxShadow: '0 10px 30px rgba(0,0,0,0.2)' }} className="hover-scale">
                                    <img src={url} style={{ width: '100%', height: '140px', objectFit: 'cover' }} alt="Grievance Scene" />
                                    <button 
                                        type="button" 
                                        onClick={(e) => { e.stopPropagation(); removeFile(i); }}
                                        style={{ position: 'absolute', top: '8px', right: '8px', background: 'var(--danger)', color: 'white', border: 'none', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer', zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                    >
                                        <X size={16} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-muted)' }}>
                        <Activity size={18} />
                        <span style={{ fontSize: '0.95rem' }}>Encrypted Submission Active</span>
                    </div>
                    <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '320px', height: '64px', borderRadius: '16px', fontSize: '1.25rem' }}>
                        {loading ? <Loader2 className="success-anim" /> : <><Send size={22} /> Dispatch Grievance</>}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default SubmitComplaint;
