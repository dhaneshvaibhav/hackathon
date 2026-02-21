import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CalendarDays, Users, ArrowRight } from 'lucide-react';
import { getUserProfile } from '../functions/user';
import { getManagedClubs, createClub } from '../functions/club';
import { uploadMedia } from '../functions/upload';
import { createEvent, getEvents, createAnnouncement } from '../functions/event';
import './Dashboard.css';

const AdminDashboard = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [clubs, setClubs] = useState([]);
    const [events, setEvents] = useState([]);
    
    // Club Creation State
    const [showCreateClubModal, setShowCreateClubModal] = useState(false);
    const [creatingClub, setCreatingClub] = useState(false);
    const [newClubData, setNewClubData] = useState({
        name: '',
        description: '',
        category: '',
        logo_url: '',
        roles: ['Member']
    });
    const [createClubError, setCreateClubError] = useState('');

    const [showEventModal, setShowEventModal] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [newEvent, setNewEvent] = useState({
        title: '',
        description: '',
        club_id: '',
        poster_url: '',
        start_date: '',
        end_date: '',
        location: '',
        fee: 0,
        status: 'upcoming'
    });
    const [eventError, setEventError] = useState('');
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [showAnnouncementModal, setShowAnnouncementModal] = useState(false);
    const [announcement, setAnnouncement] = useState({ title: '', content: '' });
    const [announcementError, setAnnouncementError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    
    const navigate = useNavigate();

    const handleCreateClub = async (e) => {
        e.preventDefault();
        setCreatingClub(true);
        setCreateClubError('');
        
        const token = localStorage.getItem('token');
        try {
            await createClub(token, newClubData);
            setSuccessMessage('Club created successfully!');
            setShowCreateClubModal(false);
            setNewClubData({ name: '', description: '', category: '', logo_url: '', roles: ['Member'] });
            
            // Refresh managed clubs list
            const clubsData = await getManagedClubs(token);
            setClubs(clubsData);
            
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (err) {
            setCreateClubError(err.message || 'Failed to create club');
        } finally {
            setCreatingClub(false);
        }
    };

    const handleCreateAnnouncement = async (e) => {
        e.preventDefault();
        setAnnouncementError('');
        const token = localStorage.getItem('token');
        
        try {
            await createAnnouncement(token, selectedEvent.id, announcement);
            
            setShowAnnouncementModal(false);
            setAnnouncement({ title: '', content: '' });
            setSelectedEvent(null);
            setSuccessMessage('Announcement published successfully!');
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (err) {
            setAnnouncementError(err.message);
        }
    };


    useEffect(() => {
        const fetchUserData = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/login');
                return;
            }

            try {
                const userData = await getUserProfile(token);
                if (!userData.is_admin) {
                    navigate('/dashboard');
                    return;
                }
                setUser(userData);
                
                // Fetch managed clubs
                const clubsData = await getManagedClubs(token);
                setClubs(clubsData);

                // Fetch all events and filter for managed clubs
                const allEvents = await getEvents(token);
                // Get IDs of managed clubs
                const managedClubIds = clubsData.map(club => club.id);
                // Filter events that belong to one of the managed clubs
                const myEvents = allEvents.filter(event => managedClubIds.includes(event.club_id));
                setEvents(myEvents);

            } catch (err) {
                console.error('Failed to load user or clubs', err);
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, [navigate]);

    const handleCreateEvent = async (e) => {
        e.preventDefault();
        setEventError('');
        const token = localStorage.getItem('token');
        
        if (!newEvent.club_id) {
            setEventError('Please select a club');
            return;
        }

        try {
            setUploading(true);
            let posterUrl = newEvent.poster_url;

            if (selectedFile) {
                const uploadResult = await uploadMedia(token, selectedFile);
                posterUrl = uploadResult.url;
            }

            const eventData = {
                ...newEvent,
                poster_url: posterUrl,
                fee: parseFloat(newEvent.fee) || 0,
                start_date: new Date(newEvent.start_date).toISOString(),
                end_date: new Date(newEvent.end_date).toISOString()
            };
            
            await createEvent(token, eventData);
            setShowEventModal(false);
            setNewEvent({
                title: '',
                description: '',
                club_id: '',
                poster_url: '',
                start_date: '',
                end_date: '',
                location: '',
                link: '',
                fee: 0,
                status: 'upcoming'
            });
            setSelectedFile(null);
            setSuccessMessage('Event created successfully!');
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (err) {
            setEventError(err.message);
        } finally {
            setUploading(false);
        }
    };

    if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading admin dashboard...</div>;

    return (
        <div className="dashboard-page" style={{ backgroundColor: 'var(--bg-secondary)', minHeight: '100vh' }}>
            <main className="container" style={{ padding: '3rem 2rem' }}>
                <div style={{ marginBottom: '3rem' }}>
                    <h1 style={{ fontSize: '2.5rem', color: 'var(--primary)', marginBottom: '0.5rem' }}>
                        Admin Dashboard
                    </h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>
                        Welcome back, {user?.name || 'Admin'}. Manage your clubs and events here.
                    </p>
                    {successMessage && (
                        <div style={{ marginTop: '1rem', padding: '1rem', backgroundColor: '#dcfce7', color: '#166534', borderRadius: '8px' }}>
                            {successMessage}
                        </div>
                    )}
                </div>

                {/* Dashboard Stats */}
                <div className="dashboard-stats-grid">
                    <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <div style={{ backgroundColor: '#e0e7ff', color: '#4f46e5', padding: '1rem', borderRadius: '50%' }}>
                                <Users size={24} />
                            </div>
                            <div>
                                <h3 style={{ margin: 0, fontSize: '1.5rem', color: 'var(--primary)' }}>{clubs.length}</h3>
                                <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.9rem' }}>Managed Clubs</p>
                            </div>
                        </div>
                        <button 
                            onClick={() => setShowCreateClubModal(true)}
                            className="btn-primary"
                            style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}
                        >
                            + Create Club
                        </button>
                    </div>
                </div>

                {/* Main Content */}
                <div className="dashboard-content-grid" style={{ gridTemplateColumns: '1fr', gap: '2rem', marginTop: '2rem' }}>
                    
                    {/* Event Management */}
                    <section style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid #eee', paddingBottom: '1rem' }}>
                            <h3 style={{ fontSize: '1.25rem', margin: 0 }}>My Events</h3>
                            <button className="btn btn-primary" onClick={() => setShowEventModal(true)}>
                                + Create Event
                            </button>
                        </div>
                        {events.length === 0 ? (
                            <p style={{ color: '#666' }}>
                                You haven't created any events yet.
                            </p>
                        ) : (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1.5rem' }}>
                                {events.map(event => (
                                    <div key={event.id} style={{ border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden' }}>
                                        {event.poster_url ? (
                                            <img src={event.poster_url} alt={event.title} style={{ width: '100%', height: '140px', objectFit: 'cover' }} />
                                        ) : (
                                            <div style={{ width: '100%', height: '140px', backgroundColor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
                                                <CalendarDays size={40} />
                                            </div>
                                        )}
                                        <div style={{ padding: '1rem' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.5rem' }}>
                                                <h4 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--primary)' }}>{event.title}</h4>
                                                <span style={{ 
                                                    fontSize: '0.75rem', 
                                                    padding: '0.25rem 0.5rem', 
                                                    borderRadius: '999px',
                                                    backgroundColor: event.status === 'upcoming' ? '#dbeafe' : event.status === 'ongoing' ? '#dcfce7' : '#f1f5f9',
                                                    color: event.status === 'upcoming' ? '#1e40af' : event.status === 'ongoing' ? '#166534' : '#64748b',
                                                    textTransform: 'capitalize'
                                                }}>
                                                    {event.status}
                                                </span>
                                            </div>
                                            <p style={{ fontSize: '0.9rem', color: '#64748b', margin: '0 0 0.5rem 0', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                                <CalendarDays size={14} />
                                                {new Date(event.start_date).toLocaleDateString()}
                                            </p>
                                            <p style={{ fontSize: '0.9rem', color: '#64748b', margin: 0 }}>
                                                {clubs.find(c => c.id === event.club_id)?.name || 'Unknown Club'}
                                            </p>
                                            <button 
                                                className="btn btn-primary" 
                                                style={{ marginTop: '1rem', width: '100%', padding: '0.5rem', fontSize: '0.9rem' }}
                                                onClick={() => {
                                                    setSelectedEvent(event);
                                                    setShowAnnouncementModal(true);
                                                }}
                                            >
                                                Announce
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>
                </div>

                {/* Create Club Modal */}
                {showCreateClubModal && (
                    <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
                        <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '8px', width: '90%', maxWidth: '500px', maxHeight: '90vh', overflowY: 'auto' }}>
                            <h2 style={{ marginBottom: '1.5rem' }}>Create New Club</h2>
                            {createClubError && <div style={{ color: 'red', marginBottom: '1rem' }}>{createClubError}</div>}
                            <form onSubmit={handleCreateClub}>
                                <div style={{ marginBottom: '1rem' }}>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Club Name</label>
                                    <input
                                        type="text"
                                        required
                                        style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}
                                        value={newClubData.name}
                                        onChange={(e) => setNewClubData({...newClubData, name: e.target.value})}
                                        placeholder="e.g. Coding Club"
                                    />
                                </div>

                                <div style={{ marginBottom: '1rem' }}>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Category</label>
                                    <input
                                        type="text"
                                        required
                                        style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}
                                        value={newClubData.category}
                                        onChange={(e) => setNewClubData({...newClubData, category: e.target.value})}
                                        placeholder="e.g. Technology"
                                    />
                                </div>

                                <div style={{ marginBottom: '1.5rem' }}>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Description</label>
                                    <textarea
                                        required
                                        rows="4"
                                        style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc', resize: 'vertical' }}
                                        value={newClubData.description}
                                        onChange={(e) => setNewClubData({...newClubData, description: e.target.value})}
                                        placeholder="Describe your club..."
                                    />
                                </div>

                                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                                    <button 
                                        type="button" 
                                        className="btn btn-outline"
                                        style={{ padding: '0.5rem 1rem', border: '1px solid #ccc', borderRadius: '4px', background: 'transparent' }}
                                        onClick={() => setShowCreateClubModal(false)}
                                    >
                                        Cancel
                                    </button>
                                    <button type="submit" className="btn btn-primary" disabled={creatingClub}>
                                        {creatingClub ? 'Creating...' : 'Create Club'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
                
                {/* Announcement Modal */}
                {showAnnouncementModal && selectedEvent && (
                    <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
                        <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '8px', width: '90%', maxWidth: '500px' }}>
                            <h2 style={{ marginBottom: '1rem' }}>Make Announcement for {selectedEvent.title}</h2>
                            {announcementError && <div style={{ color: 'red', marginBottom: '1rem' }}>{announcementError}</div>}
                            <form onSubmit={handleCreateAnnouncement}>
                                <div style={{ marginBottom: '1rem' }}>
                                    <label style={{ display: 'block', marginBottom: '0.5rem' }}>Title</label>
                                    <input 
                                        type="text" 
                                        required 
                                        style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}
                                        value={announcement.title}
                                        onChange={(e) => setAnnouncement({...announcement, title: e.target.value})}
                                    />
                                </div>
                                <div style={{ marginBottom: '1rem' }}>
                                    <label style={{ display: 'block', marginBottom: '0.5rem' }}>Content</label>
                                    <textarea 
                                        required 
                                        rows="4"
                                        style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}
                                        value={announcement.content}
                                        onChange={(e) => setAnnouncement({...announcement, content: e.target.value})}
                                    ></textarea>
                                </div>
                                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                                    <button 
                                        type="button" 
                                        className="btn btn-outline" 
                                        onClick={() => {
                                            setShowAnnouncementModal(false);
                                            setAnnouncement({ title: '', content: '' });
                                            setSelectedEvent(null);
                                        }}
                                    >
                                        Cancel
                                    </button>
                                    <button type="submit" className="btn btn-primary">
                                        Publish
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
                {/* Create Event Modal */}
                {showEventModal && (
                    <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
                        <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '8px', width: '90%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto' }}>
                            <h2 style={{ marginBottom: '1.5rem' }}>Create New Event</h2>
                            {eventError && <div style={{ color: 'red', marginBottom: '1rem' }}>{eventError}</div>}
                            <form onSubmit={handleCreateEvent}>
                                <div style={{ marginBottom: '1rem' }}>
                                    <label style={{ display: 'block', marginBottom: '0.5rem' }}>Event Title</label>
                                    <input 
                                        type="text" 
                                        required 
                                        style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}
                                        value={newEvent.title}
                                        onChange={(e) => setNewEvent({...newEvent, title: e.target.value})}
                                    />
                                </div>
                                
                                <div style={{ marginBottom: '1rem' }}>
                                    <label style={{ display: 'block', marginBottom: '0.5rem' }}>Select Club</label>
                                    <select
                                        required
                                        style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}
                                        value={newEvent.club_id}
                                        onChange={(e) => setNewEvent({...newEvent, club_id: e.target.value})}
                                    >
                                        <option value="">-- Select a Club --</option>
                                        {clubs.map(club => (
                                            <option key={club.id} value={club.id}>{club.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    <div style={{ marginBottom: '1rem' }}>
                                        <label style={{ display: 'block', marginBottom: '0.5rem' }}>Start Date</label>
                                        <input 
                                            type="datetime-local" 
                                            required 
                                            style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}
                                            value={newEvent.start_date}
                                            onChange={(e) => setNewEvent({...newEvent, start_date: e.target.value})}
                                        />
                                    </div>
                                    <div style={{ marginBottom: '1rem' }}>
                                        <label style={{ display: 'block', marginBottom: '0.5rem' }}>End Date</label>
                                        <input 
                                            type="datetime-local" 
                                            required 
                                            style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}
                                            value={newEvent.end_date}
                                            onChange={(e) => setNewEvent({...newEvent, end_date: e.target.value})}
                                        />
                                    </div>
                                </div>

                                <div style={{ marginBottom: '1rem' }}>
                                    <label style={{ display: 'block', marginBottom: '0.5rem' }}>Location</label>
                                    <input 
                                        type="text" 
                                        style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}
                                        value={newEvent.location}
                                        onChange={(e) => setNewEvent({...newEvent, location: e.target.value})}
                                    />
                                </div>

                                <div style={{ marginBottom: '1rem' }}>
                                    <label style={{ display: 'block', marginBottom: '0.5rem' }}>Registration/Join Link</label>
                                    <input 
                                        type="url" 
                                        placeholder="https://example.com/register"
                                        style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}
                                        value={newEvent.link}
                                        onChange={(e) => setNewEvent({...newEvent, link: e.target.value})}
                                    />
                                </div>

                                <div style={{ marginBottom: '1rem' }}>
                                    <label style={{ display: 'block', marginBottom: '0.5rem' }}>Fee (RM)</label>
                                    <input 
                                        type="number" 
                                        min="0"
                                        step="0.01"
                                        style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}
                                        value={newEvent.fee}
                                        onChange={(e) => setNewEvent({...newEvent, fee: e.target.value})}
                                    />
                                </div>

                                <div style={{ marginBottom: '1rem' }}>
                                    <label style={{ display: 'block', marginBottom: '0.5rem' }}>Description</label>
                                    <textarea 
                                        style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}
                                        rows="3"
                                        value={newEvent.description}
                                        onChange={(e) => setNewEvent({...newEvent, description: e.target.value})}
                                    />
                                </div>

                                <div style={{ marginBottom: '1rem' }}>
                                    <label style={{ display: 'block', marginBottom: '0.5rem' }}>Poster Image</label>
                                    <input 
                                        type="file" 
                                        accept="image/*"
                                        onChange={(e) => setSelectedFile(e.target.files[0])}
                                        style={{ width: '100%', padding: '0.5rem' }}
                                    />
                                </div>

                                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                                    <button 
                                        type="button" 
                                        className="btn btn-outline"
                                        style={{ padding: '0.5rem 1rem', border: '1px solid #ccc', borderRadius: '4px', background: 'transparent' }}
                                        onClick={() => setShowEventModal(false)}
                                    >
                                        Cancel
                                    </button>
                                    <button type="submit" className="btn btn-primary" disabled={uploading}>
                                        {uploading ? 'Creating...' : 'Create Event'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default AdminDashboard;
