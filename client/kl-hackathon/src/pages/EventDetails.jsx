import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getEvent } from '../functions/event';
import { Calendar, Clock, MapPin, DollarSign, ArrowLeft } from 'lucide-react';
import './Dashboard.css';

const EventDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchEvent = async () => {
            const token = localStorage.getItem('token');
            try {
                const data = await getEvent(id, token);
                setEvent(data);
            } catch (err) {
                setError('Failed to fetch event details');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchEvent();
    }, [id]);

    if (loading) return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
            <div className="spinner"></div>
        </div>
    );

    if (error) return (
        <div className="dashboard-page">
            <main className="container" style={{ padding: '3rem 2rem' }}>
                <button 
                    onClick={() => navigate(-1)}
                    className="btn-secondary"
                    style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                >
                    <ArrowLeft size={16} /> Back
                </button>
                <div style={{ 
                    padding: '2rem', 
                    textAlign: 'center', 
                    color: '#991b1b',
                    backgroundColor: '#fee2e2',
                    borderRadius: '8px'
                }}>
                    {error}
                </div>
            </main>
        </div>
    );

    if (!event) return null;

    const isFree = !event.fee || parseFloat(event.fee) === 0;
    
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { 
            weekday: 'long', 
            month: 'long', 
            day: 'numeric',
            year: 'numeric'
        });
    };

    const formatTime = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString('en-US', { 
            hour: 'numeric', 
            minute: '2-digit'
        });
    };

    return (
        <div className="dashboard-page" style={{ backgroundColor: 'var(--bg-secondary)', minHeight: '100vh' }}>
            <main className="container" style={{ padding: '3rem 2rem' }}>
                <button 
                    onClick={() => navigate(-1)}
                    className="btn-secondary"
                    style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                >
                    <ArrowLeft size={16} /> Back
                </button>

                <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
                    {event.poster_url && (
                        <div style={{ height: '300px', width: '100%', overflow: 'hidden' }}>
                            <img 
                                src={event.poster_url} 
                                alt={event.title} 
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                        </div>
                    )}
                    
                    <div style={{ padding: '2rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                            <div>
                                <span className={`badge ${event.status}`} style={{ 
                                    marginBottom: '1rem',
                                    backgroundColor: event.status === 'upcoming' ? '#e0f2fe' : 
                                                   event.status === 'ongoing' ? '#dcfce7' : '#f1f5f9',
                                    color: event.status === 'upcoming' ? '#0369a1' : 
                                           event.status === 'ongoing' ? '#166534' : '#64748b'
                                }}>
                                    {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                                </span>
                                <h1 style={{ margin: '0 0 0.5rem 0', fontSize: '2.5rem', color: 'var(--primary)' }}>{event.title}</h1>
                            </div>
                            <div style={{ 
                                backgroundColor: isFree ? '#dcfce7' : '#f1f5f9',
                                color: isFree ? '#166534' : 'var(--primary)',
                                padding: '0.5rem 1rem',
                                borderRadius: '999px',
                                fontWeight: 'bold',
                                fontSize: '1.1rem'
                            }}>
                                {isFree ? 'Free' : `RM ${event.fee}`}
                            </div>
                        </div>

                        {event.link && (
                            <div style={{ marginBottom: '2rem' }}>
                                <a 
                                    href={event.link} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="btn btn-primary"
                                    style={{ 
                                        display: 'inline-block', 
                                        padding: '0.75rem 2rem', 
                                        fontSize: '1.1rem', 
                                        textDecoration: 'none',
                                        borderRadius: '8px',
                                        backgroundColor: '#2563eb',
                                        color: 'white',
                                        fontWeight: 'bold',
                                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                                    }}
                                >
                                    Join / Register
                                </a>
                            </div>
                        )}

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem', marginBottom: '2rem', padding: '1.5rem', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                                <Calendar className="text-primary" size={24} />
                                <div>
                                    <h3 style={{ margin: '0 0 0.25rem 0', fontSize: '0.9rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Date</h3>
                                    <p style={{ margin: 0, fontWeight: '500' }}>{formatDate(event.start_date)}</p>
                                </div>
                            </div>
                            
                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                                <Clock className="text-primary" size={24} />
                                <div>
                                    <h3 style={{ margin: '0 0 0.25rem 0', fontSize: '0.9rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Time</h3>
                                    <p style={{ margin: 0, fontWeight: '500' }}>{formatTime(event.start_date)} - {formatTime(event.end_date)}</p>
                                </div>
                            </div>

                            {event.location && (
                                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                                    <MapPin className="text-primary" size={24} />
                                    <div>
                                        <h3 style={{ margin: '0 0 0.25rem 0', fontSize: '0.9rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Location</h3>
                                        <p style={{ margin: 0, fontWeight: '500' }}>{event.location}</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div style={{ marginBottom: '2rem' }}>
                            <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>About this Event</h2>
                            <p style={{ lineHeight: '1.6', color: 'var(--text-muted)', whiteSpace: 'pre-wrap' }}>
                                {event.description}
                            </p>
                        </div>

                        {/* Meta Data Section if exists */}
                        {event.meta_data && Object.keys(event.meta_data).length > 0 && (
                            <div style={{ marginTop: '2rem', borderTop: '1px solid #e2e8f0', paddingTop: '2rem' }}>
                                <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>Additional Information</h3>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
                                    {Object.entries(event.meta_data).map(([key, value]) => (
                                        <div key={key} style={{ backgroundColor: '#f8fafc', padding: '1rem', borderRadius: '6px' }}>
                                            <span style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>{key}</span>
                                            <span style={{ fontWeight: '500' }}>{value}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default EventDetails;
