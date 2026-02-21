import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Compass, CalendarDays, Users, ArrowRight, CheckCircle, Clock, XCircle } from 'lucide-react';
import { getUserProfile } from '../functions/user';
import { getClubs, getMyRequests, requestJoinClub } from '../functions/club';
import './Dashboard.css';

const Dashboard = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [clubs, setClubs] = useState([]);
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

                const [clubsData, requestsData] = await Promise.all([
                    getClubs(),
                    getMyRequests(token)
                ]);

                setClubs(clubsData);
                setMyRequests(requestsData);

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

    return (
        <div className="dashboard-page" style={{ backgroundColor: 'var(--bg-secondary)', minHeight: '100vh' }}>
            <main className="container" style={{ padding: '3rem 2rem' }}>
                <div style={{ marginBottom: '3rem' }}>
                    <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>
                        Here is what's happening in your campus community.
                    </p>
                    {successMessage && (
                        <div style={{ marginTop: '1rem', padding: '1rem', backgroundColor: '#dcfce7', color: '#166534', borderRadius: '8px' }}>
                            {successMessage}
                        </div>
                    )}
                    {errorMessage && (
                        <div style={{ marginTop: '1rem', padding: '1rem', backgroundColor: '#fee2e2', color: '#991b1b', borderRadius: '8px' }}>
                            {errorMessage}
                        </div>
                    )}
                </div>

                {/* Dashboard Stats */}
                <div className="dashboard-stats-grid">
                    <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ backgroundColor: '#e0e7ff', color: '#4f46e5', padding: '1rem', borderRadius: '50%' }}>
                            <Users size={24} />
                        </div>
                        <div>
                            <h3 style={{ margin: 0, fontSize: '1.5rem', color: 'var(--primary)' }}>{myClubsCount}</h3>
                            <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.9rem' }}>My Clubs</p>
                        </div>
                    </div>

                    <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ backgroundColor: '#fce7f3', color: '#db2777', padding: '1rem', borderRadius: '50%' }}>
                            <CalendarDays size={24} />
                        </div>
                        <div>
                            <h3 style={{ margin: 0, fontSize: '1.5rem', color: 'var(--primary)' }}>0</h3>
                            <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.9rem' }}>Upcoming Events</p>
                        </div>
                    </div>

                    <div style={{ backgroundColor: 'var(--accent)', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'white', textDecoration: 'none' }}>
                        <Link to="/profile" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', color: 'white', textDecoration: 'none' }}>
                            <div>
                                <h3 style={{ margin: 0, fontSize: '1.25rem', marginBottom: '0.25rem' }}>Your Profile</h3>
                                <p style={{ margin: 0, opacity: 0.9, fontSize: '0.9rem' }}>View or edit your details</p>
                            </div>
                            <ArrowRight size={24} color="white" />
                        </Link>
                    </div>
                </div>

                {/* Main Content Areas */}
                <div className="dashboard-content-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '2rem', marginTop: '2rem' }}>

                    {/* Discover Clubs */}
                    <section style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                        <h3 style={{ fontSize: '1.25rem', borderBottom: '1px solid #eee', paddingBottom: '1rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Compass size={20} color="var(--primary)" /> Discover New Clubs
                        </h3>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {clubs.length === 0 ? (
                                <p>No clubs available yet.</p>
                            ) : (
                                clubs.map(club => {
                                    const status = getClubStatus(club);
                                    return (
                                        <div key={club.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
                                            <div>
                                                <h4 style={{ margin: 0, color: 'var(--primary)' }}>{club.name}</h4>
                                                <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>{club.category}</p>
                                            </div>
                                            {status ? (
                                                <span style={{ 
                                                    padding: '0.4rem 0.8rem', 
                                                    fontSize: '0.85rem', 
                                                    borderRadius: '4px', 
                                                    backgroundColor: status.status === 'member' ? '#dcfce7' : '#ffedd5',
                                                    color: status.status === 'member' ? '#166534' : '#9a3412',
                                                    display: 'flex', alignItems: 'center', gap: '0.25rem'
                                                }}>
                                                    {status.status === 'member' ? <CheckCircle size={14} /> : <Clock size={14} />}
                                                    {status.label}
                                                </span>
                                            ) : (
                                                <button 
                                                    className="btn btn-outline" 
                                                    style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}
                                                    onClick={() => handleJoinRequest(club.id)}
                                                >
                                                    Join
                                                </button>
                                            )}
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </section>
                    
                    {/* My Requests Status */}
                     <section style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                        <h3 style={{ fontSize: '1.25rem', borderBottom: '1px solid #eee', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
                             My Recent Requests
                        </h3>
                        
                        {myRequests.length === 0 ? (
                            <p>No recent requests.</p>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {myRequests.map(req => (
                                    <div key={req.id} style={{ padding: '1rem', border: '1px solid #eee', borderRadius: '8px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                            <strong>{req.club_name}</strong>
                                            <span style={{ 
                                                textTransform: 'capitalize', 
                                                fontWeight: 'bold',
                                                color: req.status === 'accepted' ? 'green' : req.status === 'rejected' ? 'red' : 'orange'
                                            }}>
                                                {req.status}
                                            </span>
                                        </div>
                                        {req.admin_response && (
                                            <div style={{ fontSize: '0.9rem', backgroundColor: '#f9f9f9', padding: '0.5rem', borderRadius: '4px' }}>
                                                <span style={{ fontWeight: 'bold' }}>Admin:</span> {req.admin_response}
                                            </div>
                                        )}
                                        <div style={{ fontSize: '0.8rem', color: '#999', marginTop: '0.5rem' }}>
                                            {new Date(req.created_at).toLocaleDateString()}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                     </section>

                </div>
            </main>
        </div>
    );
};

export default Dashboard;
