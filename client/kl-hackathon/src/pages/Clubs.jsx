import React, { useEffect, useState } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { CheckCircle, Clock } from 'lucide-react';
import './Dashboard.css';
import { getClubs, getMyRequests, requestJoinClub } from '../functions/club';
import { getUserProfile } from '../functions/user';

const Clubs = () => {
    const { searchQuery } = useOutletContext() || { searchQuery: '' };
    const [clubs, setClubs] = useState([]);
    const [myRequests, setMyRequests] = useState([]);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();

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
        const token = localStorage.getItem('token');
        const message = prompt("Why do you want to join this club? (Optional)");
        if (message === null) return; // Cancelled

        try {
            const req = await requestJoinClub(token, clubId, message);
            setMyRequests([...myRequests, req]);
            alert('Request sent successfully!');
        } catch (err) {
            alert(err.message || 'Failed to send request');
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
        
        return null;
    };


    if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading clubs...</div>;
    if (error) return <div style={{ padding: '2rem', textAlign: 'center', color: 'red' }}>{error}</div>;

    const filteredClubs = clubs.filter(club => 
        !searchQuery || 
        club.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        club.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        club.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="dashboard-page">
            <main className="container" style={{ padding: '3rem 2rem' }}>
                <h1 style={{ fontSize: '2.5rem', color: 'var(--primary)', marginBottom: '0.5rem' }}>
                    {searchQuery ? `Clubs matching "${searchQuery}"` : 'Clubs'}
                </h1>
                <p style={{ color: 'var(--text-muted)' }}>Explore all available clubs here.</p>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '2rem', marginTop: '2rem' }}>
                    {filteredClubs.map(club => (
                        <div key={club.id} className="card" style={{ padding: '1.5rem' }}>
                            {club.logo_url && (
                                <img 
                                    src={club.logo_url} 
                                    alt={club.name} 
                                    style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: '8px', marginBottom: '1rem' }}
                                />
                            )}
                            <h3 style={{ marginBottom: '0.5rem' }}>{club.name}</h3>
                            <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>{club.description}</p>
                            <span className="badge" style={{ background: 'var(--primary-light)', color: 'var(--primary)' }}>
                                {club.category}
                            </span>
                            
                            {(() => {
                                const status = getClubStatus(club);
                                return status ? (
                                    <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: status.color === 'green' ? '#166534' : '#9a3412', backgroundColor: status.color === 'green' ? '#dcfce7' : '#ffedd5', padding: '0.5rem', borderRadius: '4px', width: 'fit-content' }}>
                                        {status.status === 'member' ? <CheckCircle size={16} /> : <Clock size={16} />}
                                        <span style={{ fontWeight: '500', fontSize: '0.9rem' }}>{status.label}</span>
                                    </div>
                                ) : (
                                    <button 
                                        className="btn btn-outline" 
                                        style={{ marginTop: '1rem', width: '100%', padding: '0.5rem' }}
                                        onClick={() => handleJoinRequest(club.id)}
                                    >
                                        Join Club
                                    </button>
                                );
                            })()}
                        </div>
                    ))}
                    {filteredClubs.length === 0 && (
                        <p>No clubs found.</p>
                    )}
                </div>
            </main>
        </div>
    );
};

export default Clubs;
