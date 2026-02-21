import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Compass, CalendarDays, Users, ArrowRight, ShieldAlert, LayoutDashboard, CheckCircle, XCircle } from 'lucide-react';
import { getUserProfile } from '../functions/user';
import { getManagedClubs, createClub, getClubRequests, handleClubRequest } from '../functions/club';
import { uploadMedia } from '../functions/upload';
import './Dashboard.css';

const AdminDashboard = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [clubs, setClubs] = useState([]);
    const [requests, setRequests] = useState({}); // clubId -> requests array
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newClub, setNewClub] = useState({ name: '', description: '', category: '', logo_url: '' });
    const [selectedFile, setSelectedFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [createError, setCreateError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    
    const navigate = useNavigate();

    const fetchRequestsForClubs = async (clubsData, token) => {
        const requestsMap = {};
        for (const club of clubsData) {
            try {
                const reqs = await getClubRequests(token, club.id);
                requestsMap[club.id] = reqs.filter(r => r.status === 'pending');
            } catch (err) {
                console.error(`Failed to fetch requests for club ${club.id}`, err);
            }
        }
        setRequests(requestsMap);
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
                
                // Fetch requests for these clubs
                await fetchRequestsForClubs(clubsData, token);

            } catch (err) {
                console.error('Failed to load user or clubs', err);
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, [navigate]);

    const handleCreateClub = async (e) => {
        e.preventDefault();
        setCreateError('');
        setUploading(true);
        const token = localStorage.getItem('token');
        
        try {
            let logoUrl = newClub.logo_url;
            
            if (selectedFile) {
                const uploadResult = await uploadMedia(token, selectedFile);
                logoUrl = uploadResult.url;
            }
            
            const clubData = { ...newClub, logo_url: logoUrl };
            const club = await createClub(token, clubData);
            
            setClubs([...clubs, club]);
            setShowCreateModal(false);
            setNewClub({ name: '', description: '', category: '', logo_url: '' });
            setSelectedFile(null);
            setSuccessMessage('Club created successfully!');
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (err) {
            setCreateError(err.message);
        } finally {
            setUploading(false);
        }
    };

    const onHandleRequest = async (requestId, clubId, status, adminResponse) => {
        const token = localStorage.getItem('token');
        try {
            await handleClubRequest(token, requestId, status, adminResponse);
            // Update local state
            setRequests(prev => ({
                ...prev,
                [clubId]: prev[clubId].filter(r => r.id !== requestId)
            }));
            setSuccessMessage(`Request ${status} successfully!`);
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (err) {
            console.error('Failed to handle request', err);
            alert('Failed to update request');
        }
    };

    if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading admin dashboard...</div>;

    const totalRequests = Object.values(requests).reduce((acc, curr) => acc + curr.length, 0);

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
                    <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ backgroundColor: '#e0e7ff', color: '#4f46e5', padding: '1rem', borderRadius: '50%' }}>
                            <Users size={24} />
                        </div>
                        <div>
                            <h3 style={{ margin: 0, fontSize: '1.5rem', color: 'var(--primary)' }}>{clubs.length}</h3>
                            <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.9rem' }}>Managed Clubs</p>
                        </div>
                    </div>

                    <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ backgroundColor: '#fce7f3', color: '#db2777', padding: '1rem', borderRadius: '50%' }}>
                            <ShieldAlert size={24} />
                        </div>
                        <div>
                            <h3 style={{ margin: 0, fontSize: '1.5rem', color: 'var(--primary)' }}>{totalRequests}</h3>
                            <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.9rem' }}>Pending Requests</p>
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

                {/* Main Content */}
                <div className="dashboard-content-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '2rem', marginTop: '2rem' }}>
                    
                    {/* Club Management */}
                    <section style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid #eee', paddingBottom: '1rem' }}>
                            <h3 style={{ fontSize: '1.25rem', margin: 0 }}>My Clubs</h3>
                            <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
                                + Create Club
                            </button>
                        </div>
                        
                        {clubs.length === 0 ? (
                            <p>You haven't created any clubs yet.</p>
                        ) : (
                            <ul style={{ listStyle: 'none', padding: 0 }}>
                                {clubs.map(club => (
                                    <li key={club.id} style={{ padding: '1rem', borderBottom: '1px solid #f0f0f0' }}>
                                        <div style={{ fontWeight: 'bold' }}>{club.name}</div>
                                        <div style={{ fontSize: '0.9rem', color: '#666' }}>{club.category}</div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </section>

                    {/* Pending Requests */}
                    <section style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                         <h3 style={{ fontSize: '1.25rem', borderBottom: '1px solid #eee', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
                            Pending Join Requests
                        </h3>
                        
                        {totalRequests === 0 ? (
                            <p>No pending requests.</p>
                        ) : (
                            <div>
                                {Object.keys(requests).map(clubId => (
                                    requests[clubId].map(req => (
                                        <div key={req.id} style={{ padding: '1rem', border: '1px solid #eee', borderRadius: '8px', marginBottom: '1rem' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                                <strong>{req.user_name}</strong>
                                                <span style={{ fontSize: '0.8rem', color: '#666' }}>wants to join {req.club_name}</span>
                                            </div>
                                            {req.message && (
                                                <div style={{ fontSize: '0.9rem', fontStyle: 'italic', color: '#555', marginBottom: '1rem', backgroundColor: '#f9f9f9', padding: '0.5rem', borderRadius: '4px' }}>
                                                    "{req.message}"
                                                </div>
                                            )}
                                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                <button 
                                                    className="btn" 
                                                    style={{ backgroundColor: '#16a34a', color: 'white', padding: '0.5rem 1rem', fontSize: '0.9rem' }}
                                                    onClick={() => {
                                                        const msg = prompt("Message for the user (optional):", "Welcome to the club!");
                                                        if (msg !== null) onHandleRequest(req.id, parseInt(clubId), 'accepted', msg);
                                                    }}
                                                >
                                                    Accept
                                                </button>
                                                <button 
                                                    className="btn" 
                                                    style={{ backgroundColor: '#dc2626', color: 'white', padding: '0.5rem 1rem', fontSize: '0.9rem' }}
                                                    onClick={() => {
                                                        const msg = prompt("Reason for rejection (optional):", "Sorry, we are not accepting new members right now.");
                                                        if (msg !== null) onHandleRequest(req.id, parseInt(clubId), 'rejected', msg);
                                                    }}
                                                >
                                                    Reject
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                ))}
                            </div>
                        )}
                    </section>
                </div>

                {/* Create Club Modal */}
                {showCreateModal && (
                    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
                        <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '8px', width: '90%', maxWidth: '500px' }}>
                            <h2 style={{ marginBottom: '1.5rem' }}>Create New Club</h2>
                            {createError && <div style={{ color: 'red', marginBottom: '1rem' }}>{createError}</div>}
                            <form onSubmit={handleCreateClub}>
                                <div style={{ marginBottom: '1rem' }}>
                                    <label style={{ display: 'block', marginBottom: '0.5rem' }}>Club Name</label>
                                    <input 
                                        type="text" 
                                        required 
                                        style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}
                                        value={newClub.name}
                                        onChange={(e) => setNewClub({...newClub, name: e.target.value})}
                                    />
                                </div>
                                <div style={{ marginBottom: '1rem' }}>
                                    <label style={{ display: 'block', marginBottom: '0.5rem' }}>Category</label>
                                    <input 
                                        type="text" 
                                        style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}
                                        value={newClub.category}
                                        onChange={(e) => setNewClub({...newClub, category: e.target.value})}
                                    />
                                </div>
                                <div style={{ marginBottom: '1rem' }}>
                                    <label style={{ display: 'block', marginBottom: '0.5rem' }}>Description</label>
                                    <textarea 
                                        style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}
                                        rows="3"
                                        value={newClub.description}
                                        onChange={(e) => setNewClub({...newClub, description: e.target.value})}
                                    />
                                </div>
                                <div style={{ marginBottom: '1rem' }}>
                                    <label style={{ display: 'block', marginBottom: '0.5rem' }}>Club Logo</label>
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
                                        onClick={() => setShowCreateModal(false)}
                                    >
                                        Cancel
                                    </button>
                                    <button type="submit" className="btn btn-primary" disabled={uploading}>
                                        {uploading ? 'Creating...' : 'Create Club'}
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
