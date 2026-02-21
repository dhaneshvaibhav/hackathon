import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useOutletContext } from 'react-router-dom';
import { Compass, CalendarDays, Users, ArrowRight, CheckCircle, Clock, XCircle, MapPin } from 'lucide-react';
import { getUserProfile } from '../functions/user';
import { getClubs, getMyRequests, requestJoinClub } from '../functions/club';
import { getEvents } from '../functions/event';
import { getAnnouncements } from '../functions/announcement';
import './Dashboard.css';

const Dashboard = () => {
    const { searchQuery } = useOutletContext() || { searchQuery: '' };
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [clubs, setClubs] = useState([]);
    const [events, setEvents] = useState([]);
    const [announcements, setAnnouncements] = useState([]);
    const [mixedContent, setMixedContent] = useState([]);
    const [myRequests, setMyRequests] = useState([]);
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/login');
                return;
            }

            try {
                const userData = await getUserProfile(token);
                setUser(userData);           
               const [eventsData, clubsData, requestsData, announcementsData] = await Promise.all([
                getEvents(),
                getClubs(token),
                getMyRequests(token),
                getAnnouncements()
            ]);

            setEvents(eventsData);
            setClubs(clubsData);
            setMyRequests(requestsData);
            setAnnouncements(announcementsData);
            
            // Combine and shuffle events and announcements
            const combined = [
                ...eventsData.map(e => ({ ...e, type: 'event' })),
                ...announcementsData.map(a => ({ ...a, type: 'announcement' }))
            ];
            
            // Shuffle
            for (let i = combined.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [combined[i], combined[j]] = [combined[j], combined[i]];
            }
            
            setMixedContent(combined);

            } catch (err) {
                console.error('Failed to load dashboard data', err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [navigate]);

    const handleJoinRequest = async (clubId) => {
        const token = localStorage.getItem('token');
        const message = prompt("Why do you want to join this club? (Optional)");
        if (message === null) return; // Cancelled

        try {
            const req = await requestJoinClub(token, clubId, message);
            setMyRequests([...myRequests, req]);
            setSuccessMessage('Request sent successfully!');
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (err) {
            setErrorMessage(err.message);
            setTimeout(() => setErrorMessage(''), 3000);
        }
    };

    const getClubStatus = (club) => {
        if (!user) return null;
        // Check if member
        if (club.members && club.members.some(m => m.user_id === user.id)) {
            return { status: 'member', label: 'Member', color: 'green' };
        }
        
        // Check requests
        const req = myRequests.find(r => r.club_id === club.id && r.status === 'pending');
        if (req) {
            return { status: 'pending', label: 'Requested', color: 'orange' };
        }
        
        // Check rejected
        const rejected = myRequests.find(r => r.club_id === club.id && r.status === 'rejected');
        if (rejected) {
             // Maybe allow re-request? For now just show rejected or nothing
             // If rejected, maybe show "Join" again? Or "Rejected".
             // Let's show "Join" but maybe with a note, or just standard Join.
             // Actually, usually if rejected, you can try again or it's blocked.
             // Let's assume you can try again, so return null (default Join button)
             return null; 
        }

        return null;
    };

    if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading your dashboard...</div>;

    const myClubsCount = clubs.filter(c => c.members && c.members.some(m => m.user_id === user?.id)).length;
    
    // Filter logic for search
    const filteredClubs = clubs.filter(club => 
        !searchQuery || 
        club.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        club.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        club.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const filteredEvents = events.filter(event => 
        !searchQuery ||
        event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.location?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const upcomingEventsCount = events.length;

    // Search Results View
    if (searchQuery) {
        return (
            <div className="dashboard-page" style={{ backgroundColor: 'var(--bg-secondary)', minHeight: '100vh' }}>
                <main className="container" style={{ padding: '3rem 2rem' }}>
                    <h2 style={{ fontSize: '1.8rem', marginBottom: '1.5rem' }}>
                        Search Results for "{searchQuery}"
                    </h2>
                    
                    <div className="dashboard-content-grid" style={{ gap: '2rem' }}>
                        {/* Clubs Results */}
                        <section style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                            <h3 style={{ fontSize: '1.25rem', borderBottom: '1px solid #eee', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
                                Clubs ({filteredClubs.length})
                            </h3>
                            {filteredClubs.length === 0 ? (
                                <p>No clubs found.</p>
                            ) : (
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1rem' }}>
                                    {filteredClubs.map(club => (
                                        <div key={club.id} style={{ padding: '1rem', border: '1px solid #eee', borderRadius: '8px' }}>
                                            <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--primary)' }}>{club.name}</h4>
                                            <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>{club.category}</p>
                                            <p style={{ margin: 0, fontSize: '0.9rem' }}>{club.description?.substring(0, 100)}...</p>
                                            <button 
                                                className="btn btn-outline" 
                                                style={{ marginTop: '1rem', width: '100%', padding: '0.5rem' }}
                                                onClick={() => handleJoinRequest(club.id)}
                                            >
                                                Join
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </section>

                        {/* Events Results */}
                        <section style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                            <h3 style={{ fontSize: '1.25rem', borderBottom: '1px solid #eee', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
                                Events ({filteredEvents.length})
                            </h3>
                            {filteredEvents.length === 0 ? (
                                <p>No events found.</p>
                            ) : (
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1rem' }}>
                                    {filteredEvents.map(event => (
                                        <div key={event.id} style={{ padding: '1rem', border: '1px solid #eee', borderRadius: '8px' }}>
                                            <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--primary)' }}>{event.title}</h4>
                                            <div style={{ display: 'flex', gap: '1rem', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                                                <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                                    <CalendarDays size={14} />
                                                    {new Date(event.start_date).toLocaleDateString()}
                                                </span>
                                                {event.location && (
                                                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                                        <MapPin size={14} />
                                                        {event.location}
                                                    </span>
                                                )}
                                            </div>
                                            <p style={{ margin: 0, fontSize: '0.9rem' }}>{event.description?.substring(0, 100)}...</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </section>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="dashboard-page" style={{ backgroundColor: 'var(--bg-secondary)', minHeight: '100vh' }}>
            <main className="container" style={{ padding: '3rem 2rem' }}>
                <div style={{ marginBottom: '3rem', maxWidth: '800px', margin: '0 auto' }}>
                    {/* Events Carousel */}
                    <div style={{ marginBottom: '2.5rem' }}>
                        <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: 'var(--text-main)', fontWeight: '600' }}>Discover Events</h2>
                        {events.length === 0 ? (
                            <div style={{ padding: '2rem', backgroundColor: 'white', borderRadius: '12px', textAlign: 'center', color: 'var(--text-muted)' }}>
                                No upcoming events found.
                            </div>
                        ) : (
                            <div style={{ 
                                display: 'flex', 
                                gap: '1.5rem', 
                                overflowX: 'auto', 
                                paddingBottom: '1rem',
                                scrollSnapType: 'x mandatory',
                                WebkitOverflowScrolling: 'touch'
                            }}>
                                {events.map(event => (
                                    <div key={event.id} style={{ 
                                        minWidth: '300px', 
                                        maxWidth: '300px',
                                        backgroundColor: 'white', 
                                        borderRadius: '16px', 
                                        boxShadow: '0 4px 6px rgba(0,0,0,0.05)', 
                                        border: '1px solid #e2e8f0',
                                        overflow: 'hidden',
                                        scrollSnapAlign: 'start',
                                        display: 'flex',
                                        flexDirection: 'column'
                                    }}>
                                        <div style={{ 
                                            height: '140px', 
                                            background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: 'white'
                                        }}>
                                            <CalendarDays size={48} opacity={0.5} />
                                        </div>
                                        <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                                            <div style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: '600', marginBottom: '0.5rem', textTransform: 'uppercase' }}>
                                                {new Date(event.start_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} • {new Date(event.start_date).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                            <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '0.5rem', lineHeight: '1.4' }}>{event.title}</h3>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                                                <MapPin size={14} />
                                                <span>{event.location || 'TBD'}</span>
                                            </div>
                                            <Link to={`/events/${event.id}`} style={{ 
                                                marginTop: 'auto',
                                                display: 'flex', 
                                                alignItems: 'center', 
                                                justifyContent: 'center',
                                                gap: '0.5rem',
                                                padding: '0.75rem',
                                                backgroundColor: '#f1f5f9',
                                                color: 'var(--text-main)',
                                                borderRadius: '8px',
                                                textDecoration: 'none',
                                                fontWeight: '500',
                                                transition: 'background-color 0.2s'
                                            }}>
                                                View Details
                                            </Link>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div style={{ marginBottom: '1.5rem' }}>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: 'var(--text-main)' }}>Announcements</h3>
                    </div>
                    
                    {announcements.length === 0 ? (
                        <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>No announcements available.</p>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {announcements.map((item) => (
                                <div key={item.id} style={{ 
                                    backgroundColor: 'white', 
                                    padding: '1.5rem', 
                                    borderRadius: '12px', 
                                    boxShadow: '0 2px 4px rgba(0,0,0,0.05)', 
                                    border: '1px solid #e2e8f0', 
                                    display: 'flex', 
                                    flexDirection: 'column', 
                                    borderLeft: '4px solid #0ea5e9' 
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#0ea5e9', fontWeight: 'bold', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                            <Users size={16} /> Announcement
                                        </div>
                                        <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>{new Date(item.created_at).toLocaleDateString()}</span>
                                    </div>
                                    <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.25rem' }}>{item.title}</h3>
                                    {item.event_title && (
                                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem', fontStyle: 'italic' }}>
                                            {item.event_id ? (
                                                <Link to={`/events/${item.event_id}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                                                    Re: {item.event_title}
                                                </Link>
                                            ) : (
                                                <span>Re: {item.event_title}</span>
                                            )}
                                        </div>
                                    )}
                                    <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '0.5rem' }}>
                                        {item.content}
                                    </p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default Dashboard;
