import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Compass, CalendarDays, Users, ArrowRight } from 'lucide-react';
import { getUserProfile } from '../functions/user';
import './Dashboard.css';

const Dashboard = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUserData = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/login');
                return;
            }

            try {
                const userData = await getUserProfile(token);
                setUser(userData);
            } catch (err) {
                console.error('Failed to load user', err);
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, [navigate]);

    if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading your dashboard...</div>;

    return (
        <div className="dashboard-page" style={{ backgroundColor: 'var(--bg-secondary)', minHeight: '100vh' }}>
            <main className="container" style={{ padding: '3rem 2rem' }}>
                <div style={{ marginBottom: '3rem' }}>
                    <h1 style={{ fontSize: '2.5rem', color: 'var(--primary)', marginBottom: '0.5rem' }}>
                        Welcome back, {user?.name?.split(' ')[0] || 'Student'}!
                    </h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>
                        Here is what's happening in your campus community.
                    </p>
                </div>

                {/* Dashboard Stats / Quick Links Row */}
                <div className="dashboard-stats-grid">
                    <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ backgroundColor: '#e0e7ff', color: '#4f46e5', padding: '1rem', borderRadius: '50%' }}>
                            <Users size={24} />
                        </div>
                        <div>
                            <h3 style={{ margin: 0, fontSize: '1.5rem', color: 'var(--primary)' }}>3</h3>
                            <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.9rem' }}>My Clubs</p>
                        </div>
                    </div>

                    <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ backgroundColor: '#fce7f3', color: '#db2777', padding: '1rem', borderRadius: '50%' }}>
                            <CalendarDays size={24} />
                        </div>
                        <div>
                            <h3 style={{ margin: 0, fontSize: '1.5rem', color: 'var(--primary)' }}>2</h3>
                            <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.9rem' }}>Upcoming Events</p>
                        </div>
                    </div>

                    <div style={{ backgroundColor: 'var(--accent)', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'white', textDecoration: 'none', transition: 'transform 0.2s' }} onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseOut={(e) => e.currentTarget.style.transform = 'none'}>
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
                <div className="dashboard-content-grid">

                    {/* Activity or Updates Component */}
                    <section style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                        <h3 style={{ fontSize: '1.25rem', borderBottom: '1px solid #eee', paddingBottom: '1rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Compass size={20} color="var(--primary)" /> Discover New Clubs
                        </h3>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {/* Dummy Data Rows */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
                                <div>
                                    <h4 style={{ margin: 0, color: 'var(--primary)' }}>Robotics Club</h4>
                                    <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>Technical</p>
                                </div>
                                <button className="btn btn-outline" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}>Join</button>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
                                <div>
                                    <h4 style={{ margin: 0, color: 'var(--primary)' }}>Debate Society</h4>
                                    <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>Literary</p>
                                </div>
                                <button className="btn btn-outline" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}>Join</button>
                            </div>
                        </div>
                    </section>

                    <section style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                        <h3 style={{ fontSize: '1.25rem', borderBottom: '1px solid #eee', paddingBottom: '1rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <CalendarDays size={20} color="var(--primary)" /> This Week's Events
                        </h3>
                        <p style={{ color: 'var(--text-muted)' }}>You have 2 events coming up.</p>

                        <div style={{ marginTop: '1rem', borderLeft: '3px solid var(--accent)', paddingLeft: '1rem' }}>
                            <h4 style={{ margin: '0 0 0.25rem 0', color: 'var(--primary)' }}>Hackathon Orientation</h4>
                            <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>Today, 5:00 PM - Main Auditorium</p>
                        </div>
                        <div style={{ marginTop: '1rem', borderLeft: '3px solid var(--primary-light)', paddingLeft: '1rem' }}>
                            <h4 style={{ margin: '0 0 0.25rem 0', color: 'var(--primary)' }}>Photography Walk</h4>
                            <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>Saturday, 9:00 AM - Campus Gardens</p>
                        </div>
                    </section>

                </div>
            </main>
        </div>
    );
};

export default Dashboard;
