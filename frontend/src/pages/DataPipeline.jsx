import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../config';
import { 
    Cpu, 
    Database, 
    Share2, 
    Activity, 
    Server, 
    Search,
    Zap,
    Box,
    Layers,
    Code,
    Sparkles
} from 'lucide-react';
import { format } from 'date-fns';

const DataPipeline = () => {
    const [stats, setStats] = useState({
        ingestionRate: 0,
        nlpQueue: 0,
        dataLakeSize: 0,
        activeModels: 4,
        latency: '42ms'
    });
    const [recentActivity, setRecentActivity] = useState([]);
    
    useEffect(() => {
        const interval = setInterval(() => {
            // Simulated real-time metrics for Data Engineering dashboard
            setStats({
                ingestionRate: (Math.random() * 5 + 1).toFixed(2),
                nlpQueue: Math.floor(Math.random() * 20),
                dataLakeSize: (parseFloat(stats.dataLakeSize || 124.5) + 0.1).toFixed(1),
                activeModels: 4,
                latency: `${Math.floor(Math.random() * 10 + 35)}ms`
            });
            fetchRecent();
        }, 3000);
        fetchRecent();
        return () => clearInterval(interval);
    }, []);

    const fetchRecent = async () => {
        try {
            const res = await axios.get(`${API_BASE_URL}/complaints`);
            setRecentActivity(res.data.slice(0, 8));
        } catch (err) {
            console.error(err);
        }
    };

    const PipelineNode = ({ icon: Icon, title, status, details, active }) => (
        <div className={`glass-card ${active ? 'pulse-border' : ''}`} style={{ flex: 1, padding: '2rem', textAlign: 'center', position: 'relative' }}>
            <div style={{ width: '60px', height: '60px', borderRadius: '16px', background: active ? 'var(--primary-glow)' : 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', color: active ? 'var(--primary)' : 'var(--text-muted)' }}>
                <Icon size={30} />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.5rem' }}>{title}</h3>
            <span style={{ fontSize: '0.85rem', color: active ? 'var(--success)' : 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>{status}</span>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginTop: '1rem' }}>{details}</p>
        </div>
    );

    return (
        <div className="page-fade-in" style={{ maxWidth: '1400px', margin: '0 auto' }}>
            <header style={{ marginBottom: '4rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                    <Cpu size={20} color="var(--primary)" />
                    <span style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.2em' }}>Data Engineering Hub</span>
                </div>
                <h1 style={{ fontSize: '3.5rem', fontWeight: 800 }}>AI Data Pipeline</h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '1.4rem', marginTop: '1rem', maxWidth: '800px' }}>
                    Monitoring real-time grievance ingestion, automated NLP classification, and big data lake synchronization.
                </p>
            </header>

            {/* Pipeline Visualization */}
            <div style={{ display: 'flex', gap: '2rem', alignItems: 'center', marginBottom: '4rem', position: 'relative' }}>
                <PipelineNode 
                    icon={Zap} 
                    title="Edge Ingestion" 
                    status="Live" 
                    details={`${stats.ingestionRate} events/sec`}
                    active={true}
                />
                <div style={{ width: '50px', height: '2px', background: 'var(--glass-border)' }}></div>
                <PipelineNode 
                    icon={Layers} 
                    title="AI NLP Kernel" 
                    status="Processing" 
                    details={`${stats.nlpQueue} in queue`}
                    active={true}
                />
                <div style={{ width: '50px', height: '2px', background: 'var(--glass-border)' }}></div>
                <PipelineNode 
                    icon={Database} 
                    title="Data Lake Sync" 
                    status="Synchronized" 
                    details={`${stats.dataLakeSize} MB Total`}
                    active={true}
                />
                <div style={{ width: '50px', height: '2px', background: 'var(--glass-border)' }}></div>
                <PipelineNode 
                    icon={Share2} 
                    title="Analytics Export" 
                    status="Idle" 
                    details="Rest API / Webhook"
                    active={false}
                />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1.5fr)', gap: '3rem' }}>
                {/* System Health */}
                <section className="glass-card" style={{ padding: '2.5rem' }}>
                    <h3 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <Server size={22} color="var(--primary)" /> Pipeline Health
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                                <span style={{ fontWeight: 600 }}>Classification Accuracy</span>
                                <span style={{ color: 'var(--success)' }}>98.4%</span>
                            </div>
                            <div style={{ height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px' }}>
                                <div style={{ width: '98%', height: '100%', background: 'var(--success)', borderRadius: '4px' }}></div>
                            </div>
                        </div>
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                                <span style={{ fontWeight: 600 }}>Inference Latency</span>
                                <span style={{ color: 'var(--primary)' }}>{stats.latency}</span>
                            </div>
                            <div style={{ height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px' }}>
                                <div style={{ width: '40%', height: '100%', background: 'var(--primary)', borderRadius: '4px' }}></div>
                            </div>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginTop: '1rem' }}>
                            <div style={{ padding: '1.5rem', background: 'rgba(0,0,0,0.2)', borderRadius: '16px' }}>
                                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Active Workers</p>
                                <p style={{ fontSize: '1.75rem', fontWeight: 800 }}>{stats.activeModels}</p>
                            </div>
                            <div style={{ padding: '1.5rem', background: 'rgba(0,0,0,0.2)', borderRadius: '16px' }}>
                                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Data Integrity</p>
                                <p style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--success)' }}>100%</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Data Preparation & Ingestion */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    <section className="glass-card" style={{ padding: '2.5rem' }}>
                        <h3 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <Code size={22} color="var(--primary)" /> Automated Data Prep
                        </h3>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                           {[
                               { task: 'Deduplicating entries', status: 'SUCCESS' },
                               { task: 'Normalizing GPS coords', status: 'SUCCESS' },
                               { task: 'Feature Engineering (Sentiment)', status: 'ACTIVE' },
                               { task: 'Outlier Detection (Traffic)', status: 'WAITING' }
                           ].map((item, i) => (
                               <div key={i} style={{ padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                   <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>{item.task}</span>
                                   <span style={{ fontSize: '0.7rem', fontWeight: 800, color: item.status === 'SUCCESS' ? 'var(--success)' : item.status === 'ACTIVE' ? 'var(--primary)' : 'var(--text-muted)' }}>{item.status}</span>
                               </div>
                           ))}
                        </div>
                    </section>

                    <section className="glass-card" style={{ padding: '2.5rem' }}>
                        <h3 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <Activity size={22} color="var(--primary)" /> Ingestion Stream
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {recentActivity.map((item, idx) => (
                                <div key={idx} style={{ padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '1.5rem', fontSize: '0.9rem' }}>
                                    <div style={{ minWidth: '80px', color: 'var(--primary)', fontWeight: 800 }}>{item.id.split('-')[1]}</div>
                                    <div style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.description}</div>
                                    <div style={{ minWidth: '100px', textAlign: 'right', fontWeight: 700, color: 'var(--success)' }}>INGESTED</div>
                                    <div style={{ minWidth: '60px', textAlign: 'right', color: 'var(--text-muted)' }}>{stats.latency}</div>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>
            </div>
            
            <footer style={{ marginTop: '4rem', padding: '2.5rem', background: 'rgba(129, 140, 248, 0.05)', borderRadius: '24px', border: '1px solid rgba(129, 140, 248, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                    <Sparkles size={32} color="var(--primary)" />
                    <div>
                        <h4 style={{ fontSize: '1.2rem', fontWeight: 800 }}>AI Directed Data Exploration</h4>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>Automated preparation of quarterly civic health reports in progress...</p>
                    </div>
                </div>
                <button className="btn btn-primary">Open Notebook</button>
            </footer>
        </div>
    );
};

export default DataPipeline;
