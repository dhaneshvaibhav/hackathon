import React, { useEffect, useState } from 'react';
import { useOutletContext, useNavigate, Link } from 'react-router-dom';
import './Dashboard.css';
import { getEvents } from '../functions/event';
import { Calendar, Clock, MapPin, DollarSign, ArrowRight } from 'lucide-react';

const Events = () => {
    const { searchQuery } = useOutletContext() || { searchQuery: '' };
    const navigate = useNavigate();
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchEvents = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/login');
                return;
            }

            try {
                const data = await getEvents(token);
                // Sort by date (upcoming first)
                const sorted = data.sort((a, b) => new Date(a.start_date) - new Date(b.start_date));
                setEvents(sorted);
            } catch (err) {
                setError('Failed to fetch events');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchEvents();
    }, [navigate]);

    if (loading) return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
            <div className="spinner"></div>
        </div>
    );
    
    if (error) return (
        <div style={{ 
            padding: '2rem', 
            textAlign: 'center', 
            color: '#991b1b',
            backgroundColor: '#fee2e2',
            margin: '2rem',
            borderRadius: '8px'
        }}>
            {error}
        </div>
    );

    const filteredEvents = events.filter(event => 
        !searchQuery ||
        event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.location?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { 
            weekday: 'short', 
            month: 'short', 
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
            <main className="container">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
                    <div>
                        <h1 style={{ fontSize: '2.5rem', color: 'var(--primary)', marginBottom: '0.5rem' }}>
                            {searchQuery ? `Events matching "${searchQuery}"` : 'Upcoming Events'}
                        </h1>
                        <p style={{ color: 'var(--text-muted)' }}>Discover and join exciting events on campus.</p>
                    </div>
                </div>
                
                <div className="responsive-grid">
                    {filteredEvents.map(event => {
                        const isFree = !event.fee || parseFloat(event.fee) === 0;
                        const eventDate = new Date(event.start_date);
                        const isPast = eventDate < new Date();
                        
                        return (
                            <div key={event.id} className="card" style={{ 
                                padding: '0', 
                                overflow: 'hidden', 
                                display: 'flex', 
                                flexDirection: 'column',
                                height: '100%',
                                opacity: isPast ? 0.7 : 1,
                                transition: 'transform 0.2s, box-shadow 0.2s'
                            }}>
                                {event.poster_url ? (
                                    <div style={{ height: '180px', overflow: 'hidden', position: 'relative' }}>
                                        <img 
                                            src={event.poster_url} 
                                            alt={event.title} 
                                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                        />
                                        <div style={{ 
                                            position: 'absolute', 
                                            top: '1rem', 
                                            right: '1rem', 
                                            backgroundColor: isFree ? '#dcfce7' : 'white',
                                            color: isFree ? '#166534' : 'var(--primary)',
                                            padding: '0.25rem 0.75rem',
                                            borderRadius: '999px',
                                            fontSize: '0.8rem',
                                            fontWeight: 'bold',
                                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                                        }}>
                                            {isFree ? 'Free' : `RM ${event.fee}`}
                                        </div>
                                    </div>
                                ) : (
                                    <div style={{ 
                                        height: '180px', 
                                        backgroundColor: 'var(--primary-light)', 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        justifyContent: 'center',
                                        position: 'relative'
                                    }}>
                                        <Calendar size={48} color="var(--primary)" />
                                        <div style={{ 
                                            position: 'absolute', 
                                            top: '1rem', 
                                            right: '1rem', 
                                            backgroundColor: isFree ? '#dcfce7' : 'white',
                                            color: isFree ? '#166534' : 'var(--primary)',
                                            padding: '0.25rem 0.75rem',
                                            borderRadius: '999px',
                                            fontSize: '0.8rem',
                                            fontWeight: 'bold',
                                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                                        }}>
                                            {isFree ? 'Free' : `RM ${event.fee}`}
                                        </div>
                                    </div>
                                )}
                                
                                <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                                        <h3 style={{ margin: 0, fontSize: '1.25rem' }}>{event.title}</h3>
                                    </div>
                                    
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <Calendar size={16} className="text-primary" />
                                            <span>{formatDate(event.start_date)}</span>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <Clock size={16} className="text-primary" />
                                            <span>{formatTime(event.start_date)} - {formatTime(event.end_date)}</span>
                                        </div>
                                        {event.location && (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <MapPin size={16} className="text-primary" />
                                                <span>{event.location}</span>
                                            </div>
                                        )}
                                    </div>

                                    <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', flex: 1, fontSize: '0.95rem', lineHeight: '1.5' }}>
                                        {event.description?.length > 100 ? `${event.description.substring(0, 100)}...` : event.description}
                                    </p>
                                    
                                    <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span className={`badge ${event.status}`} style={{ 
                                            display: 'inline-block',
                                            padding: '0.25rem 0.75rem',
                                            borderRadius: '4px',
                                            fontSize: '0.8rem',
                                            fontWeight: '500',
                                            backgroundColor: event.status === 'upcoming' ? '#e0f2fe' : 
                                                           event.status === 'ongoing' ? '#dcfce7' : '#f1f5f9',
                                            color: event.status === 'upcoming' ? '#0369a1' : 
                                                   event.status === 'ongoing' ? '#166534' : '#64748b'
                                        }}>
                                            {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                                        </span>
                                        <Link to={`/events/${event.id}`} style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.9rem' }}>
                                            View Details <ArrowRight size={14} />
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                    {filteredEvents.length === 0 && (
                        <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                            <p>No events found matching your search.</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default Events;
