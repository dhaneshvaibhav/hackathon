import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Compass, CalendarDays, Users, ArrowRight, ShieldAlert, LayoutDashboard } from 'lucide-react';
import { getUserProfile } from '../functions/user';
import './Dashboard.css';

const AdminDashboard = () => {
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
                // Security check: ensure user is actually an admin
                if (!userData.is_admin) {
                    navigate('/dashboard');
                    return;
                }
                setUser(userData);
            } catch (err) {
                console.error('Failed to load user', err);
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, [navigate]);

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
                </div>

                {/* Dashboard Stats / Quick Links Row */}
                <div className="dashboard-stats-grid">
                    <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ backgroundColor: '#e0e7ff', color: '#4f46e5', padding: '1rem', borderRadius: '50%' }}>
                            <Users size={24} />
                        </div>
                        <div>
                            <h3 style={{ margin: 0, fontSize: '1.5rem', color: 'var(--primary)' }}>3</h3>
                            <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.9rem' }}>Managed Clubs</p>
                        </div>
                    </div>

                    <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ backgroundColor: '#fce7f3', color: '#db2777', padding: '1rem', borderRadius: '50%' }}>
                            <CalendarDays size={24} />
                        </div>
                        <div>
                            <h3 style={{ margin: 0, fontSize: '1.5rem', color: 'var(--primary)' }}>5</h3>
                            <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.9rem' }}>Pending Events</p>
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

                    {/* Quick Actions */}
                    <section style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                        <h3 style={{ fontSize: '1.25rem', borderBottom: '1px solid #eee', paddingBottom: '1rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <ShieldAlert size={20} color="var(--primary)" /> Quick Actions
                        </h3>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <button className="btn btn-primary" style={{ textAlign: 'left', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                Create New Club <ArrowRight size={16} />
                            </button>
                            <button className="btn btn-outline" style={{ textAlign: 'left', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                Review Event Proposals <ArrowRight size={16} />
                            </button>
                            <button className="btn btn-outline" style={{ textAlign: 'left', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                Manage Users <ArrowRight size={16} />
                            </button>
                        </div>
                    </section>

                    {/* Recent Activity */}
                    <section style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                        <h3 style={{ fontSize: '1.25rem', borderBottom: '1px solid #eee', paddingBottom: '1rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <LayoutDashboard size={20} color="var(--primary)" /> System Overview
                        </h3>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
                                <div>
                                    <h4 style={{ margin: 0, color: 'var(--primary)' }}>New Club Application</h4>
                                    <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>From: Jane Doe (AI Club)</p>
                                </div>
                                <span style={{ fontSize: '0.8rem', color: 'orange', fontWeight: 'bold' }}>Pending</span>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
                                <div>
                                    <h4 style={{ margin: 0, color: 'var(--primary)' }}>Event Approval</h4>
                                    <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>Hackathon 2024</p>
                                </div>
                                <span style={{ fontSize: '0.8rem', color: 'green', fontWeight: 'bold' }}>Approved</span>
                            </div>
                        </div>
                    </section>

                </div>
            </main>
        </div>
    );
};

export default AdminDashboard;