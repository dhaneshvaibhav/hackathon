import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getEvent } from '../functions/event';
import { Calendar, Clock, MapPin, DollarSign, ArrowLeft, Megaphone } from 'lucide-react';
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
                    onClick={() => navigate('/dashboard')}
                    className="btn-secondary"
                    style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                >
                    <ArrowLeft size={16} /> Back to Dashboard
                </button>

                <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
                    {event.poster_url && (
                        <div style={{ height: '400px', width: '100%', overflow: 'hidden', position: 'relative' }}>
                            <img 
                                src={event.poster_url} 
                                alt={event.title} 
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                            <div style={{
                                position: 'absolute',
                                bottom: 0,
                                left: 0,
                                right: 0,
                                background: 'linear-gradient(to top, rgba(0,0,0,0.7), transparent)',
                                padding: '2rem',
                                color: 'white'
                            }}>
                            </div>
                        </div>
                    )}
                    
                    <div style={{ padding: '2rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                            <div style={{ flex: 1 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                                    <span className={`badge ${event.status}`} style={{ 
                                        backgroundColor: event.status === 'upcoming' ? '#e0f2fe' : 
                                                       event.status === 'ongoing' ? '#dcfce7' : '#f1f5f9',
                                        color: event.status === 'upcoming' ? '#0369a1' : 
                                               event.status === 'ongoing' ? '#166534' : '#64748b'
                                    }}>
                                        {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                                    </span>
                                    {event.club_name && (
                                        <Link to={`/clubs/${event.club_id}`} style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: '500' }}>
                                            <span>Hosted by</span>
                                            {event.club_logo_url && (
                                                <img src={event.club_logo_url} alt={event.club_name} style={{ width: '24px', height: '24px', borderRadius: '50%', objectFit: 'cover' }} />
                                            )}
                                            <span style={{ color: 'var(--primary)' }}>{event.club_name}</span>
                                        </Link>
                                    )}
                                </div>
                                <h1 style={{ margin: '0 0 0.5rem 0', fontSize: '2.5rem', color: 'var(--primary)', lineHeight: '1.2' }}>{event.title}</h1>
                            </div>
                            <div style={{ 
                                backgroundColor: isFree ? '#dcfce7' : '#f1f5f9',
                                color: isFree ? '#166534' : 'var(--primary)',
                                padding: '0.75rem 1.5rem',
                                borderRadius: '999px',
                                fontWeight: 'bold',
                                fontSize: '1.2rem',
                                boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
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
                                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                                        transition: 'transform 0.2s, box-shadow 0.2s'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.transform = 'translateY(-2px)';
                                        e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.transform = 'translateY(0)';
                                        e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)';
                                    }}
                                >
                                    Join / Register Now
                                </a>
                            </div>
                        )}

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem', padding: '1.5rem', backgroundColor: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                                <div style={{ padding: '0.5rem', backgroundColor: '#e0f2fe', borderRadius: '8px', color: '#0284c7' }}>
                                    <Calendar size={24} />
                                </div>
                                <div>
                                    <h3 style={{ margin: '0 0 0.25rem 0', fontSize: '0.85rem', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.05em' }}>Date</h3>
                                    <p style={{ margin: 0, fontWeight: '600', fontSize: '1.1rem' }}>{formatDate(event.start_date)}</p>
                                </div>
                            </div>
                            
                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                                <div style={{ padding: '0.5rem', backgroundColor: '#e0f2fe', borderRadius: '8px', color: '#0284c7' }}>
                                    <Clock size={24} />
                                </div>
                                <div>
                                    <h3 style={{ margin: '0 0 0.25rem 0', fontSize: '0.85rem', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.05em' }}>Time</h3>
                                    <p style={{ margin: 0, fontWeight: '600', fontSize: '1.1rem' }}>{formatTime(event.start_date)} - {formatTime(event.end_date)}</p>
                                </div>
                            </div>

                            {event.location && (
                                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                                    <div style={{ padding: '0.5rem', backgroundColor: '#e0f2fe', borderRadius: '8px', color: '#0284c7' }}>
                                        <MapPin size={24} />
                                    </div>
                                    <div>
                                        <h3 style={{ margin: '0 0 0.25rem 0', fontSize: '0.85rem', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.05em' }}>Location</h3>
                                        <p style={{ margin: 0, fontWeight: '600', fontSize: '1.1rem' }}>{event.location}</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="event-details-grid">
                            <div className="event-main-content">
                                <div style={{ marginBottom: '3rem' }}>
                                    <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', borderBottom: '2px solid #f1f5f9', paddingBottom: '0.5rem', display: 'inline-block' }}>About this Event</h2>
                                    <div style={{ lineHeight: '1.7', color: 'var(--text-muted)', whiteSpace: 'pre-wrap', fontSize: '1.05rem' }}>
                                        {event.description}
                                    </div>
                                </div>

                                {/* Announcements Section */}
                                {event.announcements && event.announcements.length > 0 && (
                                    <div style={{ marginBottom: '3rem' }}>
                                        <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                            <Megaphone size={24} className="text-primary" />
                                            Announcements
                                        </h2>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                            {event.announcements.map((announcement) => (
                                                <div key={announcement.id} style={{ 
                                                    padding: '1.5rem', 
                                                    backgroundColor: '#fffbeb', 
                                                    border: '1px solid #fcd34d', 
                                                    borderRadius: '8px',
                                                    position: 'relative'
                                                }}>
                                                    <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.1rem', color: '#92400e' }}>{announcement.title}</h3>
                                                    <p style={{ margin: 0, color: '#b45309' }}>{announcement.content}</p>
                                                    <div style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: '#d97706', textAlign: 'right' }}>
                                                        {new Date(announcement.created_at).toLocaleDateString()}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                            
                            <div className="event-sidebar">
                                {/* Meta Data Section if exists */}
                                {event.meta_data && Object.keys(event.meta_data).length > 0 && (
                                    <div style={{ backgroundColor: '#f8fafc', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                                        <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', color: 'var(--primary)' }}>Additional Info</h3>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                            {Object.entries(event.meta_data).map(([key, value]) => (
                                                <div key={key} style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '0.75rem' }}>
                                                    <span style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.25rem', fontWeight: '600' }}>{key}</span>
                                                    <span style={{ fontWeight: '500', color: 'var(--text-main)' }}>{value}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default EventDetails;
