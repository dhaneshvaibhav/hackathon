import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { User, Edit2, Trash2, Save, X, Github, Linkedin, Twitter, Instagram, Shield, LogOut } from 'lucide-react';
import { getUserProfile, updateUserProfile, deleteUserAccount, becomeCreator } from '../functions/user';
import { connectGithub, disconnectGithub } from '../functions/oauth';

const Profile = () => {
    const [user, setUser] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState({
        name: '',
        bio: '',
        social_media: {
            github: '',
            linkedin: '',
            twitter: '',
            instagram: ''
        }
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const location = useLocation();
    const searchParams = new URLSearchParams(location.search);
    const isOnboarding = searchParams.get('onboarding') === 'true';

    useEffect(() => {
        const fetchProfile = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/login');
                return;
            }

            try {
                const userData = await getUserProfile(token);
                setUser(userData);
                setEditForm({
                    name: userData.name || '',
                    bio: userData.bio || '',
                    social_media: {
                        github: userData.social_media?.github || '',
                        linkedin: userData.social_media?.linkedin || '',
                        twitter: userData.social_media?.twitter || '',
                        instagram: userData.social_media?.instagram || ''
                    }
                });
            } catch (err) {
                setError('Failed to load profile. Please login again.');
                localStorage.removeItem('token');
                setTimeout(() => navigate('/login'), 2000);
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [navigate]);

    const handleUpdate = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        try {
            const response = await updateUserProfile(token, editForm);
            setUser(response.user);
            setIsEditing(false);
            setError('');
        } catch (err) {
            setError(err.message);
        }
    };

    const handleDelete = async () => {
        if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
            const token = localStorage.getItem('token');
            try {
                await deleteUserAccount(token);
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                navigate('/');
            } catch (err) {
                setError(err.message);
            }
        }
    };

    const handleSocialChange = (e) => {
        setEditForm({
            ...editForm,
            social_media: {
                ...editForm.social_media,
                [e.target.name]: e.target.value
            }
        });
    };

    const handleBecomeCreator = async () => {
        if (window.confirm('Are you sure you want to become a creator? This will allow you to create and manage clubs.')) {
            const token = localStorage.getItem('token');
            try {
                const response = await becomeCreator(token);
                setUser(response.user);
                alert('Congratulations! You are now a creator.');
                window.location.reload(); 
            } catch (err) {
                setError(err.message);
            }
        }
    };

    const handleLogout = () => {
        if (window.confirm('Are you sure you want to log out?')) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            navigate('/login');
        }
    };

    if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading profile...</div>;

    const initial = user?.name ? user.name.charAt(0).toUpperCase() : 'U';

    const handleGithubConnect = async () => {
        const token = localStorage.getItem('token');
        try {
            const data = await connectGithub(token);
            if (data.url) {
                window.location.href = data.url;
            }
        } catch (err) {
            setError(err.message);
        }
    };

    const handleGithubDisconnect = async () => {
        if (!window.confirm('Are you sure you want to disconnect your GitHub account?')) return;
        
        const token = localStorage.getItem('token');
        try {
            await disconnectGithub(token);
            // Refresh profile to show updated status
            const userData = await getUserProfile(token);
            setUser(userData);
            alert('GitHub disconnected successfully');
        } catch (err) {
            setError(err.message);
        }
    };

    const renderEditableField = (field, label, value, placeholder, isTextArea = false) => {
        // We use a simplified inline editing state for individual fields to match the UI concept
        // But since the current state management is form-based, we'll adapt the UI to trigger the full edit mode
        // or just display the data nicely as requested.
        // Given the request "content should be not changes, just the how the things seeem",
        // we will restructure the display to look like the "Settings" page with cards.
        
        const isGithub = field === 'github';
        const isConnected = isGithub ? (user?.oauth_accounts?.some(acc => acc.provider === 'github')) : !!value;
        const displayValue = isGithub && isConnected ? 'Connected' : (value || 'Not connected');

        return (
            <div style={{ 
                marginBottom: '1rem', 
                padding: '1.5rem', 
                backgroundColor: 'white', 
                borderRadius: '12px', 
                border: '1px solid #E2E8F0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                transition: 'box-shadow 0.2s ease-in-out',
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
            }}>
                <div style={{ flex: 1, marginRight: '1rem', display: 'flex', alignItems: 'center' }}>
                     <div style={{ width: '180px', color: 'var(--text-main)', fontWeight: 600, fontSize: '1rem' }}>
                        {label}
                     </div>
                     <div style={{ flex: 1, color: isConnected ? 'var(--text-muted)' : '#94a3b8', fontSize: '0.95rem' }}>
                        {displayValue}
                     </div>
                </div>
                
                {isGithub ? (
                    <button
                        onClick={isConnected ? handleGithubDisconnect : handleGithubConnect}
                        style={{ 
                            padding: '0.5rem 1.25rem',
                            backgroundColor: isConnected ? 'transparent' : 'var(--primary)',
                            color: isConnected ? 'var(--text-main)' : 'white',
                            border: isConnected ? '1px solid #E2E8F0' : 'none',
                            borderRadius: '6px',
                            fontWeight: 600,
                            fontSize: '0.875rem',
                            cursor: 'pointer',
                            minWidth: '100px',
                            textAlign: 'center'
                        }}
                    >
                        {isConnected ? 'Disconnect' : 'Connect'}
                    </button>
                ) : (
                    <button
                        onClick={() => {
                            setIsEditing(true);
                            // Optional: focus specific field if we were to implement detailed focus logic
                        }}
                        style={{ 
                            padding: '0.5rem 1.25rem',
                            backgroundColor: value ? 'transparent' : 'var(--primary)',
                            color: value ? 'var(--text-main)' : 'white',
                            border: value ? '1px solid #E2E8F0' : 'none',
                            borderRadius: '6px',
                            fontWeight: 600,
                            fontSize: '0.875rem',
                            cursor: 'pointer',
                            minWidth: '100px',
                            textAlign: 'center'
                        }}
                    >
                        {value ? 'Edit' : 'Connect'}
                    </button>
                )}
            </div>
        );
    };

    return (
        <div className="profile-page" style={{ padding: '2rem', backgroundColor: 'var(--bg-secondary)', minHeight: '100vh' }}>
            <div className="container" style={{ maxWidth: '900px', margin: '0 auto' }}>
                
                <div style={{ marginBottom: '2rem' }}>
                    <h1 style={{ fontSize: '1.8rem', color: 'var(--primary)', marginBottom: '0.5rem' }}>Settings</h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>Manage your account settings and preferences.</p>
                </div>

                {error && <div style={{ backgroundColor: '#fee2e2', color: 'red', padding: '1rem', borderRadius: '4px', marginBottom: '1.5rem', textAlign: 'center' }}>{error}</div>}

                {/* Profile Summary Card */}
                <section style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', marginBottom: '2rem', border: '1px solid #E2E8F0' }}>
                     <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                        <div>
                            <h2 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', color: 'var(--primary)' }}>Profile Information</h2>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Your personal details and bio.</p>
                        </div>
                        {!isEditing && (
                            <button 
                                onClick={() => setIsEditing(true)}
                                style={{ 
                                    padding: '0.5rem 1rem',
                                    backgroundColor: 'var(--primary)',
                                    color: 'white',
                                    borderRadius: '6px',
                                    border: 'none',
                                    fontWeight: 600,
                                    fontSize: '0.875rem',
                                    cursor: 'pointer'
                                }}
                            >
                                Edit Profile
                            </button>
                        )}
                     </div>
                     
                     {isEditing ? (
                        <form onSubmit={handleUpdate}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem', marginBottom: '2rem' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-main)' }}>Full Name</label>
                                    <input
                                        type="text"
                                        value={editForm.name}
                                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                        style={{ width: '100%', padding: '0.75rem', border: '1px solid #E2E8F0', borderRadius: '6px', fontSize: '1rem' }}
                                        required
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-main)' }}>Bio</label>
                                    <textarea
                                        value={editForm.bio}
                                        onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                                        style={{ width: '100%', padding: '0.75rem', border: '1px solid #E2E8F0', borderRadius: '6px', minHeight: '100px', fontSize: '1rem', resize: 'vertical' }}
                                        placeholder="Tell us a bit about yourself..."
                                    />
                                </div>
                                
                                <h3 style={{ fontSize: '1.1rem', marginTop: '1rem', marginBottom: '1rem', color: 'var(--primary)' }}>Social Links</h3>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    <input
                                        type="url"
                                        name="github"
                                        value={editForm.social_media.github}
                                        onChange={handleSocialChange}
                                        placeholder="GitHub URL"
                                        style={{ width: '100%', padding: '0.75rem', border: '1px solid #E2E8F0', borderRadius: '6px', fontSize: '0.9rem' }}
                                    />
                                    <input
                                        type="url"
                                        name="linkedin"
                                        value={editForm.social_media.linkedin}
                                        onChange={handleSocialChange}
                                        placeholder="LinkedIn URL"
                                        style={{ width: '100%', padding: '0.75rem', border: '1px solid #E2E8F0', borderRadius: '6px', fontSize: '0.9rem' }}
                                    />
                                    <input
                                        type="url"
                                        name="twitter"
                                        value={editForm.social_media.twitter}
                                        onChange={handleSocialChange}
                                        placeholder="Twitter URL"
                                        style={{ width: '100%', padding: '0.75rem', border: '1px solid #E2E8F0', borderRadius: '6px', fontSize: '0.9rem' }}
                                    />
                                    <input
                                        type="url"
                                        name="instagram"
                                        value={editForm.social_media.instagram}
                                        onChange={handleSocialChange}
                                        placeholder="Instagram URL"
                                        style={{ width: '100%', padding: '0.75rem', border: '1px solid #E2E8F0', borderRadius: '6px', fontSize: '0.9rem' }}
                                    />
                                </div>
                            </div>
                            
                            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                                {isOnboarding ? (
                                    <button type="button" onClick={() => navigate('/dashboard')} className="btn btn-outline">
                                        Skip for now
                                    </button>
                                ) : (
                                    <button type="button" onClick={() => setIsEditing(false)} className="btn btn-outline">
                                        Cancel
                                    </button>
                                )}
                                <button type="submit" className="btn btn-primary">
                                    {isOnboarding ? 'Save & Continue' : 'Save Changes'}
                                </button>
                            </div>
                        </form>
                     ) : (
                         <>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '2rem' }}>
                                <div style={{
                                    width: '80px',
                                    height: '80px',
                                    borderRadius: '50%',
                                    backgroundColor: 'var(--primary)',
                                    color: 'white',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '2.5rem',
                                    fontWeight: 'bold',
                                }}>
                                    {initial}
                                </div>
                                <div>
                                    <h3 style={{ fontSize: '1.5rem', margin: 0, color: 'var(--text-main)' }}>{user?.name}</h3>
                                    <p style={{ color: 'var(--text-muted)', margin: '0.25rem 0' }}>{user?.email}</p>
                                    <span style={{
                                        display: 'inline-block',
                                        padding: '0.25rem 0.75rem',
                                        backgroundColor: user?.is_admin ? '#FEF3C7' : '#E0E7FF',
                                        color: user?.is_admin ? '#92400E' : '#3730A3',
                                        borderRadius: '20px',
                                        fontSize: '0.75rem',
                                        fontWeight: 600,
                                        marginTop: '0.25rem'
                                    }}>
                                        {user?.is_admin ? 'Creator' : 'Student'}
                                    </span>
                                </div>
                            </div>

                            <div style={{ padding: '1.5rem', backgroundColor: '#F8FAFC', borderRadius: '8px', marginBottom: '1rem' }}>
                                <strong style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase', marginBottom: '0.5rem', letterSpacing: '0.05em' }}>About Me</strong>
                                <p style={{ color: user?.bio ? 'var(--text-main)' : 'var(--text-muted)', lineHeight: '1.6', margin: 0, fontStyle: user?.bio ? 'normal' : 'italic' }}>
                                    {user?.bio || 'No bio added yet.'}
                                </p>
                            </div>
                         </>
                     )}
                </section>

                {/* Connected Accounts Section - Always visible but non-editable directly unless in edit mode logic is expanded, 
                    but here we map the "Connect" buttons to trigger the main edit mode or serve as visual placeholders as per request to look like the image */}
                {!isEditing && (
                    <section style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', marginBottom: '2rem', border: '1px solid #E2E8F0' }}>
                        <h2 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', color: 'var(--primary)' }}>Connected Accounts</h2>
                        <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>Connect your social media accounts to enable posting and scheduling.</p>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            {renderEditableField('github', <span style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}><Github size={20} /> GitHub</span>, user?.social_media?.github)}
                            {renderEditableField('linkedin', <span style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}><Linkedin size={20} /> LinkedIn</span>, user?.social_media?.linkedin)}
                            {renderEditableField('twitter', <span style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}><Twitter size={20} /> Twitter / X</span>, user?.social_media?.twitter)}
                            {renderEditableField('instagram', <span style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}><Instagram size={20} /> Instagram</span>, user?.social_media?.instagram)}
                        </div>
                    </section>
                )}

                {/* Become Creator Section */}
                {!user?.is_admin && !isEditing && (
                    <section style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', marginBottom: '2rem', border: '1px solid #E2E8F0' }}>
                         <h2 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', color: 'var(--primary)' }}>Creator Status</h2>
                         <div style={{ padding: '1.5rem', backgroundColor: '#EFF6FF', borderRadius: '8px', border: '1px solid #BFDBFE' }}>
                            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: 0, color: '#1E40AF', fontSize: '1.1rem' }}>
                                <Shield size={20} /> Become a Creator
                            </h3>
                            <p style={{ color: '#1E3A8A', marginBottom: '1rem', lineHeight: '1.5', fontSize: '0.95rem' }}>
                                Upgrade your account to create and manage your own clubs. Join the community of leaders!
                            </p>
                            <button
                                onClick={handleBecomeCreator}
                                className="btn btn-primary"
                                style={{ backgroundColor: '#2563EB', borderColor: '#2563EB' }}
                            >
                                Upgrade to Creator
                            </button>
                        </div>
                    </section>
                )}

                {/* Danger Zone */}
                {!isEditing && (
                    <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                        <button 
                            onClick={handleLogout} 
                            style={{ 
                                color: '#4B5563', 
                                background: 'white', 
                                border: '1px solid #D1D5DB', 
                                cursor: 'pointer', 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: '0.5rem', 
                                padding: '0.75rem 1.5rem', 
                                borderRadius: '6px', 
                                transition: 'all 0.2s', 
                                fontWeight: 600 
                            }} 
                            onMouseOver={(e) => {
                                e.currentTarget.style.backgroundColor = '#F3F4F6';
                            }} 
                            onMouseOut={(e) => {
                                e.currentTarget.style.backgroundColor = 'white';
                            }}
                        >
                            <LogOut size={18} /> Logout
                        </button>

                        <button 
                            onClick={handleDelete} 
                            style={{ 
                                color: '#EF4444', 
                                background: 'white', 
                                border: '1px solid #EF4444', 
                                cursor: 'pointer', 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: '0.5rem', 
                                padding: '0.75rem 1.5rem', 
                                borderRadius: '6px', 
                                transition: 'all 0.2s', 
                                fontWeight: 600 
                            }} 
                            onMouseOver={(e) => {
                                e.currentTarget.style.backgroundColor = '#FEF2F2';
                            }} 
                            onMouseOut={(e) => {
                                e.currentTarget.style.backgroundColor = 'white';
                            }}
                        >
                            <Trash2 size={18} /> Delete Account
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Profile;
