import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getClub, requestJoinClub, getMyRequests } from '../functions/club';
import { getUserProfile } from '../functions/user';
import { Users, CheckCircle, Clock, PlusCircle, ArrowLeft, Edit } from 'lucide-react';
import './Dashboard.css';

const ClubDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [club, setClub] = useState(null);
    const [user, setUser] = useState(null);
    const [myRequests, setMyRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [selectedRole, setSelectedRole] = useState('');
    const [message, setMessage] = useState('');
    const [showJoinForm, setShowJoinForm] = useState(false);

    useEffect(() => {
        const fetchClub = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/login');
                return;
            }

            try {
                const [clubData, userData, requestsData] = await Promise.all([
                    getClub(id, token),
                    getUserProfile(token),
                    getMyRequests(token)
                ]);

                setClub(clubData);
                setUser(userData);
                setMyRequests(requestsData);
            } catch (err) {
                setError('Failed to fetch club details');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchClub();
    }, [id, navigate]);

    const handleJoinRequest = async () => {
        if (!selectedRole) {
            setError('Please select a role to join');
            setTimeout(() => setError(''), 3000);
            return;
        }

        const token = localStorage.getItem('token');
        try {
            await requestJoinClub(token, club.id, message, selectedRole);
            setSuccessMessage('Join request sent successfully!');
            setMessage('');
            setSelectedRole('');
            setShowJoinForm(false);
            
            // Refresh requests
            const requests = await getMyRequests(token);
            setMyRequests(requests);

            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (err) {
            setError(err.message || 'Failed to send join request');
            setTimeout(() => setError(''), 3000);
        }
    };

    const getClubStatus = () => {
        if (!user || !club) return 'guest';
        
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

    if (!club) return null;

    const status = getClubStatus();

    return (
        <div className="dashboard-page" style={{ backgroundColor: 'var(--bg-secondary)', minHeight: '100vh' }}>
            <main className="container" style={{ padding: '3rem 2rem' }}>
                <button 
                    onClick={() => navigate(-1)}
                    className="btn-secondary"
                    style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                >
                    <ArrowLeft size={16} /> Back
                </button>

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

                <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
                    {club.logo_url ? (
                        <div style={{ height: '300px', width: '100%', overflow: 'hidden' }}>
                            <img 
                                src={club.logo_url} 
                                alt={club.name} 
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                        </div>
                    ) : (
                        <div style={{ 
                            height: '300px', 
                            backgroundColor: 'var(--primary-light)', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center' 
                        }}>
                            <Users size={64} color="var(--primary)" />
                        </div>
                    )}
                    
                    <div style={{ padding: '2rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                            <div>
                                {club.category && (
                                    <span className="badge" style={{ 
                                        marginBottom: '1rem',
                                        background: '#f1f5f9', 
                                        color: '#475569',
                                    }}>
                                        {club.category}
                                    </span>
                                )}
                                <h1 style={{ margin: '0 0 0.5rem 0', fontSize: '2.5rem', color: 'var(--primary)' }}>{club.name}</h1>
                                <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>Managed by {club.owner?.name || 'Admin'}</p>
                            </div>
                            
                            <div>
                                {status === 'owner' && (
                                    <button 
                                        onClick={() => navigate(`/clubs/${club.id}/edit`)}
                                        className="btn-secondary"
                                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                                    >
                                        <Edit size={16} /> Edit Club
                                    </button>
                                )}
                                {status === 'member' && (
                                    <button disabled className="btn-secondary" style={{ cursor: 'default', opacity: 0.8, backgroundColor: '#dcfce7', color: '#166534', border: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <CheckCircle size={16} /> Member
                                    </button>
                                )}
                                {status === 'requested' && (
                                    <button disabled className="btn-secondary" style={{ cursor: 'default', opacity: 0.8, backgroundColor: '#fef3c7', color: '#92400e', border: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <Clock size={16} /> Requested
                                    </button>
                                )}
                                {status === 'none' && !showJoinForm && (
                                    <button 
                                        onClick={() => setShowJoinForm(true)}
                                        className="btn-primary" 
                                        style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}
                                    >
                                        <PlusCircle size={16} /> Join Club
                                    </button>
                                )}
                                {status === 'none' && showJoinForm && (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', minWidth: '300px', backgroundColor: '#f8fafc', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                            <h3 style={{ fontSize: '1.1rem', fontWeight: '600', color: 'var(--text-main)', margin: 0 }}>Join this Club</h3>
                                            <button 
                                                onClick={() => setShowJoinForm(false)}
                                                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.9rem' }}
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                        {club.roles && club.roles.length > 0 ? (
                                            <>
                                                <label style={{ fontSize: '0.9rem', fontWeight: '500', color: 'var(--text-secondary)' }}>Select Role <span style={{color: '#ef4444'}}>*</span></label>
                                                <select 
                                                    value={selectedRole} 
                                                    onChange={(e) => setSelectedRole(e.target.value)}
                                                    style={{ 
                                                        padding: '0.75rem', 
                                                        borderRadius: '8px', 
                                                        border: '1px solid #cbd5e1',
                                                        fontSize: '0.95rem',
                                                        backgroundColor: 'white',
                                                        color: 'var(--text-main)',
                                                        marginBottom: '0.5rem'
                                                    }}
                                                >
                                                    <option value="">-- Choose a Role --</option>
                                                    {club.roles.map((role, index) => (
                                                        <option key={index} value={role}>{role}</option>
                                                    ))}
                                                </select>

                                                <label style={{ fontSize: '0.9rem', fontWeight: '500', color: 'var(--text-secondary)' }}>Message to Admin</label>
                                                <textarea
                                                    value={message}
                                                    onChange={(e) => setMessage(e.target.value)}
                                                    placeholder="Why do you want to join? (Optional)"
                                                    style={{
                                                        padding: '0.75rem',
                                                        borderRadius: '8px',
                                                        border: '1px solid #cbd5e1',
                                                        fontSize: '0.95rem',
                                                        backgroundColor: 'white',
                                                        color: 'var(--text-main)',
                                                        marginBottom: '1rem',
                                                        minHeight: '80px',
                                                        resize: 'vertical',
                                                        fontFamily: 'inherit'
                                                    }}
                                                />

                                                <button 
                                                    onClick={handleJoinRequest}
                                                    className="btn-primary" 
                                                    style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', width: '100%' }}
                                                    disabled={!selectedRole}
                                                >
                                                    <PlusCircle size={16} /> Send Request
                                                </button>
                                            </>
                                        ) : (
                                            <p style={{ color: '#ef4444', fontStyle: 'italic' }}>No roles available to join.</p>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div style={{ marginBottom: '2rem' }}>
                            <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>About this Club</h2>
                            <p style={{ lineHeight: '1.6', color: 'var(--text-muted)', whiteSpace: 'pre-wrap' }}>
                                {club.description}
                            </p>
                        </div>

                        {/* Members Section */}
                        {club.members && club.members.length > 0 && (
                            <div style={{ marginTop: '2rem', borderTop: '1px solid #e2e8f0', paddingTop: '2rem' }}>
                                <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>Members ({club.members.length})</h3>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                    {/* Ideally fetch member names, but for now showing count or IDs if needed */}
                                    <p style={{ color: 'var(--text-muted)' }}>
                                        This club has {club.members.length} active member{club.members.length !== 1 ? 's' : ''}.
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default ClubDetails;
