import React, { useEffect, useState } from 'react';
import { useOutletContext, useNavigate, Link } from 'react-router-dom';
import { Users, CheckCircle, Clock, PlusCircle, ArrowRight, Edit, X, Upload } from 'lucide-react';
import './Dashboard.css';
import { getClubs, getMyRequests, requestJoinClub, createClub } from '../functions/club';
import { getUserProfile } from '../functions/user';
import { uploadMedia } from '../functions/upload';

const Clubs = () => {
    const { searchQuery } = useOutletContext() || { searchQuery: '' };
    const navigate = useNavigate();
    
    const [user, setUser] = useState(null);
    const [clubs, setClubs] = useState([]);
    const [myRequests, setMyRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    // Create Club State
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [creating, setCreating] = useState(false);
    const [newClubData, setNewClubData] = useState({
        name: '',
        description: '',
        category: '',
        logo_url: '',
        roles: ['Member']
    });
    const [uploading, setUploading] = useState(false);

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        const token = localStorage.getItem('token');
        try {
            const data = await uploadMedia(token, file);
            setNewClubData(prev => ({
                ...prev,
                logo_url: data.url
            }));
        } catch (err) {
            setError('Failed to upload image');
            console.error(err);
        } finally {
            setUploading(false);
        }
    };

    const handleCreateInputChange = (e) => {
        const { name, value } = e.target;
        setNewClubData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleCreateClub = async (e) => {
        e.preventDefault();
        setCreating(true);
        setError('');
        
        const token = localStorage.getItem('token');
        try {
            await createClub(token, newClubData);
            setSuccessMessage('Club created successfully!');
            setShowCreateModal(false);
            setNewClubData({ name: '', description: '', category: '', logo_url: '', roles: ['Member'] });
            
            // Refresh clubs list
            const clubsData = await getClubs(token);
            setClubs(clubsData);
            
            // Clear success message after 3 seconds
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (err) {
            setError(err.message || 'Failed to create club');
        } finally {
            setCreating(false);
        }
    };

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
                    {user && user.is_admin && (
                        <button 
                            onClick={() => setShowCreateModal(true)}
                            className="btn-primary"
                            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                        >
                            <PlusCircle size={20} /> Create Club
                        </button>
                    )}
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

                {/* Create Club Modal */}
                {showCreateModal && (
                    <div style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(0,0,0,0.5)',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        zIndex: 1000
                    }}>
                        <div style={{
                            backgroundColor: 'white',
                            borderRadius: '12px',
                            padding: '2rem',
                            width: '100%',
                            maxWidth: '500px',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: 0 }}>Create New Club</h2>
                                <button 
                                    onClick={() => setShowCreateModal(false)}
                                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                                >
                                    <X size={24} />
                                </button>
                            </div>

                            <form onSubmit={handleCreateClub}>
                                <div style={{ marginBottom: '1rem' }}>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Club Logo</label>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                        {newClubData.logo_url && (
                                            <img 
                                                src={newClubData.logo_url} 
                                                alt="Preview" 
                                                style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover' }}
                                            />
                                        )}
                                        <label className="btn-secondary" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <Upload size={16} />
                                            {uploading ? 'Uploading...' : 'Upload Logo'}
                                            <input 
                                                type="file" 
                                                accept="image/*" 
                                                onChange={handleFileChange}
                                                style={{ display: 'none' }}
                                            />
                                        </label>
                                    </div>
                                </div>

                                <div style={{ marginBottom: '1rem' }}>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Club Name</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={newClubData.name}
                                        onChange={handleCreateInputChange}
                                        required
                                        style={{ width: '100%', padding: '0.75rem', border: '1px solid #e2e8f0', borderRadius: '6px' }}
                                        placeholder="e.g. Coding Club"
                                    />
                                </div>

                                <div style={{ marginBottom: '1rem' }}>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Category</label>
                                    <input
                                        type="text"
                                        name="category"
                                        value={newClubData.category}
                                        onChange={handleCreateInputChange}
                                        required
                                        style={{ width: '100%', padding: '0.75rem', border: '1px solid #e2e8f0', borderRadius: '6px' }}
                                        placeholder="e.g. Technology"
                                    />
                                </div>

                                <div style={{ marginBottom: '1.5rem' }}>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Description</label>
                                    <textarea
                                        name="description"
                                        value={newClubData.description}
                                        onChange={handleCreateInputChange}
                                        required
                                        rows="4"
                                        style={{ width: '100%', padding: '0.75rem', border: '1px solid #e2e8f0', borderRadius: '6px', resize: 'vertical' }}
                                        placeholder="Describe your club..."
                                    />
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                                    <button
                                        type="button"
                                        onClick={() => setShowCreateModal(false)}
                                        className="btn-ghost"
                                        style={{ padding: '0.75rem 1.5rem' }}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="btn-primary"
                                        disabled={creating || uploading}
                                        style={{ padding: '0.75rem 1.5rem', opacity: (creating || uploading) ? 0.7 : 1 }}
                                    >
                                        {creating ? 'Creating...' : (uploading ? 'Uploading...' : 'Create Club')}
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

export default Clubs;
