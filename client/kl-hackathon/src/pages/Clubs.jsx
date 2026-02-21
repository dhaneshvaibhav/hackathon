import React, { useEffect, useState } from 'react';
import { useOutletContext, useNavigate, Link } from 'react-router-dom';
import { Users, CheckCircle, Clock, PlusCircle, ArrowRight, Edit } from 'lucide-react';
import './Dashboard.css';
import { getClubs, getMyRequests, requestJoinClub } from '../functions/club';
import { getUserProfile } from '../functions/user';

const Clubs = () => {
    const { searchQuery } = useOutletContext() || { searchQuery: '' };
    const navigate = useNavigate();
    
    const [user, setUser] = useState(null);
    const [clubs, setClubs] = useState([]);
    const [myRequests, setMyRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/login');
                return;
            }

            try {
                const [userData, clubsData, requestsData] = await Promise.all([
                    getUserProfile(token),
                    getClubs(token),
                    getMyRequests(token)
                ]);

                setUser(userData);
                setClubs(clubsData);
                setMyRequests(requestsData);
            } catch (err) {
                setError('Failed to fetch data');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [navigate]);

    const handleJoinRequest = async (clubId) => {
        // Redirect to club details for joining
        navigate(`/clubs/${clubId}`);
    };

    const getClubStatus = (club) => {
        if (!user) return 'guest';
        
        // Check if owner
        if (club.owner_id === user.id) return 'owner';
        
        // Check if member
        const isMember = club.members?.some(m => m.user_id === user.id);
        if (isMember) return 'member';
        
        // Check if requested
        const hasRequested = myRequests.some(r => r.club_id === club.id && r.status === 'pending');
        if (hasRequested) return 'requested';
        
        return 'none';
    };

    if (loading) return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
            <div className="spinner"></div>
        </div>
    );

    const filteredClubs = clubs.filter(club => 
        !searchQuery || 
        club.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        club.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        club.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="dashboard-page" style={{ backgroundColor: 'var(--bg-secondary)', minHeight: '100vh' }}>
            <main className="container" style={{ padding: '3rem 2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                    <div>
                        <h1 style={{ fontSize: '2.5rem', color: 'var(--primary)', marginBottom: '0.5rem' }}>
                            {searchQuery ? `Clubs matching "${searchQuery}"` : 'Discover Clubs'}
                        </h1>
                        <p style={{ color: 'var(--text-muted)' }}>Find and join communities that match your interests.</p>
                    </div>
                </div>

                {successMessage && (
                    <div style={{ 
                        backgroundColor: '#dcfce7', 
                        color: '#166534', 
                        padding: '1rem', 
                        borderRadius: '8px', 
                        marginBottom: '2rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                    }}>
                        <CheckCircle size={20} />
                        {successMessage}
                    </div>
                )}

                {error && (
                    <div style={{ 
                        backgroundColor: '#fee2e2', 
                        color: '#991b1b', 
                        padding: '1rem', 
                        borderRadius: '8px', 
                        marginBottom: '2rem' 
                    }}>
                        {error}
                    </div>
                )}
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '2rem' }}>
                    {filteredClubs.map(club => {
                        const status = getClubStatus(club);
                        
                        return (
                            <div key={club.id} className="card" style={{ 
                                padding: '0', 
                                overflow: 'hidden', 
                                display: 'flex', 
                                flexDirection: 'column',
                                height: '100%',
                                transition: 'transform 0.2s, box-shadow 0.2s'
                            }}>
                                {club.logo_url ? (
                                    <div style={{ height: '160px', overflow: 'hidden' }}>
                                        <img 
                                            src={club.logo_url} 
                                            alt={club.name} 
                                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                        />
                                    </div>
                                ) : (
                                    <div style={{ 
                                        height: '160px', 
                                        backgroundColor: 'var(--primary-light)', 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        justifyContent: 'center' 
                                    }}>
                                        <Users size={48} color="var(--primary)" />
                                    </div>
                                )}
                                
                                <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                                        <h3 style={{ margin: 0, fontSize: '1.25rem' }}>{club.name}</h3>
                                        {club.category && (
                                            <span className="badge" style={{ 
                                                background: '#f1f5f9', 
                                                color: '#475569', 
                                                fontSize: '0.75rem',
                                                padding: '0.25rem 0.75rem',
                                                borderRadius: '999px'
                                            }}>
                                                {club.category}
                                            </span>
                                        )}
                                    </div>
                                    
                                    <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', flex: 1, fontSize: '0.95rem', lineHeight: '1.5' }}>
                                        {club.description?.length > 120 ? `${club.description.substring(0, 120)}...` : club.description}
                                    </p>
                                    
                                    <div style={{ marginTop: 'auto' }}>
                                        <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'flex-end' }}>
                                            <Link to={`/clubs/${club.id}`} style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.9rem' }}>
                                                View Details <ArrowRight size={14} />
                                            </Link>
                                        </div>
                                        {status === 'owner' && (
                                            <button 
                                                onClick={() => navigate(`/clubs/${club.id}/edit`)}
                                                className="btn-secondary" 
                                                style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                                            >
                                                <Edit size={16} /> Edit Club
                                            </button>
                                        )}
                                        {status === 'member' && (
                                            <button disabled className="btn-secondary" style={{ width: '100%', cursor: 'default', opacity: 0.8, backgroundColor: '#dcfce7', color: '#166534', border: 'none' }}>
                                                <CheckCircle size={16} /> Member
                                            </button>
                                        )}
                                        {status === 'requested' && (
                                            <button disabled className="btn-secondary" style={{ width: '100%', cursor: 'default', opacity: 0.8, backgroundColor: '#fef3c7', color: '#92400e', border: 'none' }}>
                                                <Clock size={16} /> Requested
                                            </button>
                                        )}
                                        {status === 'none' && (
                                            <button 
                                                onClick={() => handleJoinRequest(club.id)}
                                                className="btn-primary" 
                                                style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}
                                            >
                                                <PlusCircle size={16} /> Join Club
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                    {filteredClubs.length === 0 && (
                        <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                            <p>No clubs found matching your search.</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default Clubs;
