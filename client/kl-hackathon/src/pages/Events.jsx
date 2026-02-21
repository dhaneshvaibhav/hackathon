import React, { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import './Dashboard.css';
import { getEvents } from '../functions/event';

const Events = () => {
    const { searchQuery } = useOutletContext() || { searchQuery: '' };
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchEvents = async () => {
            const token = localStorage.getItem('token');
            try {
                const data = await getEvents(token);
                setEvents(data);
            } catch (err) {
                setError('Failed to fetch events');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchEvents();
    }, []);

    if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading events...</div>;
    if (error) return <div style={{ padding: '2rem', textAlign: 'center', color: 'red' }}>{error}</div>;

    const filteredEvents = events.filter(event => 
        !searchQuery ||
        event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.location?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="dashboard-page">
            <main className="container" style={{ padding: '3rem 2rem' }}>
                <h1 style={{ fontSize: '2.5rem', color: 'var(--primary)', marginBottom: '0.5rem' }}>
                    {searchQuery ? `Events matching "${searchQuery}"` : 'Events'}
                </h1>
                <p style={{ color: 'var(--text-muted)' }}>Upcoming events will be listed here.</p>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '2rem', marginTop: '2rem' }}>
                    {filteredEvents.map(event => (
                        <div key={event.id} className="card" style={{ padding: '1.5rem' }}>
                            {event.poster_url && (
                                <img 
                                    src={event.poster_url} 
                                    alt={event.title} 
                                    style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: '8px', marginBottom: '1rem' }}
                                />
                            )}
                            <h3 style={{ marginBottom: '0.5rem' }}>{event.title}</h3>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                                <strong>Date:</strong> {new Date(event.start_date).toLocaleDateString()}
                            </p>
                            <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>{event.description}</p>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span className="badge" style={{ background: 'var(--primary-light)', color: 'var(--primary)' }}>
                                    {event.status}
                                </span>
                                {event.fee > 0 ? (
                                    <span style={{ fontWeight: 'bold' }}>RM {event.fee}</span>
                                ) : (
                                    <span style={{ color: 'green', fontWeight: 'bold' }}>Free</span>
                                )}
                            </div>
                        </div>
                    ))}
                    {filteredEvents.length === 0 && (
                        <p>No events found.</p>
                    )}
                </div>
            </main>
        </div>
    );
};

export default Events;
